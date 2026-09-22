#!/usr/bin/env python3
"""
parse_sk_vlm.py

Ekstraksi SK Pembina Organisasi Kemahasiswaan (hasil pindai) memakai VLM
lewat endpoint OpenAI-compatible (9router).

Alur:
  1. Rasterisasi halaman lampiran 1 dan lampiran 2 secara terpisah.
  2. Satu panggilan VLM per lampiran (independen, supaya rekonsiliasi valid).
  3. Validasi per lampiran: struktur NIP, kelengkapan nomor urut, honorarium.
  4. Rekonsiliasi lintas lampiran + deteksi pergeseran kolom NIP.
  5. Filter dosen JTK dan keluarkan JSON per dosen.

Semua artefak antara disimpan ke folder keluaran untuk dokumentasi pengujian.

Pemakaian:
    export ROUTER_API_KEY=...
    python parse_sk_vlm.py sk_pembinaan.pdf -o hasil/
    python parse_sk_vlm.py sk_pembinaan.pdf -o hasil/ --model ag/claude-sonnet-4-6
    python parse_sk_vlm.py sk_pembinaan.pdf -o hasil/ --offline   # pakai JSON mentah yang sudah ada

    python vm_sk_pembinaan.py sk_pembinaan.pdf -o hasil/ --jpeg --dpi 150

    test koneksi endpoint api:
        python vm_sk_pembinaan.py sk_pembinaan.pdf --probe
Dependensi:
    pip install pypdfium2 pillow requests
    
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import re
import sys
import time
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Konfigurasi
# ---------------------------------------------------------------------------

BASE_URL_DEFAULT = "https://9router.tmfadhli.my.id/v1"
MODEL_DEFAULT = "ag/gemini-3.7-flash-medium"

# Isi di sini. JANGAN commit berkas ini ke repositori publik dan jangan
# lampirkan baris ini ke listing kode di laporan.
# Kalau dikosongkan, nilainya diambil dari environment variable ROUTER_API_KEY.
API_KEY = ""

# Halaman lampiran (1-based, sesuai tampilan pembaca PDF).
HALAMAN_LAMPIRAN_1 = 4
HALAMAN_LAMPIRAN_2 = 5

DPI = 200
SCALE = DPI / 72.0

# Nilai honorarium yang seragam di seluruh baris. Dipakai sebagai validator.
HONOR_VOLUME_HARAPAN = "11"
HONOR_SATUAN_HARAPAN = "OB"
HONOR_PERBULAN_HARAPAN = 300000

# Kata kunci unit kerja untuk menyaring dosen JTK.
KATA_KUNCI_JTK = (
    "teknik komputer dan informatika",
    "teknik komputer",
    "informatika",
)

# Gelar akademik yang dibuang saat membentuk kunci_nama.
POLA_GELAR = re.compile(
    r"\b("
    r"prof|dr|drs|dra|ir|"
    r"s\.?t|s\.?si|s\.?e|s\.?pd|s\.?ap|s\.?kel|s\.?s|s\.?tr\.?t|s\.?s\.?t|"
    r"m\.?t|m\.?sc|m\.?si|m\.?ak|m\.?m|m\.?a|m\.?pd|m\.?hum|m\.?kom|mmsi|"
    r"a\.?md|amd|ph\.?d"
    r")\b\.?",
    re.IGNORECASE,
)


# ---------------------------------------------------------------------------
# Prompt
# ---------------------------------------------------------------------------

ATURAN_UMUM = """\
Aturan wajib:
1. Salin isi sel APA ADANYA. Jangan perbaiki ejaan, jangan lengkapi gelar,
   jangan menormalkan angka. Kalau satu digit tidak terbaca jelas, tulis
   tebakan terbaikmu dan catat baris itu di "catatan".
2. Tabel memuat BARIS JUDUL SEKSI yang membentang penuh dan TIDAK punya nomor
   urut, yaitu "Himpunan Mahasiswa Jurusan (HMJ)" dan
   "Unit Kegiatan Mahasiswa (UKM)". Baris seperti ini BUKAN baris data.
   Jangan dimasukkan ke "baris" dan jangan ikut dihitung sebagai nomor urut.
3. Field "no" harus diambil dari angka yang TERCETAK di kolom No pada dokumen,
   bukan dari urutan hasil keluaranmu.
4. Kalau satu sel kosong, isi dengan string kosong "".
5. Nama pembina bisa memakan dua baris teks dalam satu sel. Gabungkan menjadi
   satu string dengan satu spasi.
6. Keluarkan HANYA objek JSON. Tanpa penjelasan, tanpa pagar kode markdown.
"""

PROMPT_L1 = (
    "Dokumen ini adalah lampiran pertama Keputusan Direktur Politeknik Negeri "
    "Bandung tentang Pembina Organisasi Kemahasiswaan. Salin seluruh isi tabel.\n\n"
    + ATURAN_UMUM
    + """
Skema keluaran:
{
  "lampiran": 1,
  "baris": [
    {
      "no": "",
      "organisasi": "",
      "nama_pembina": "",
      "nip": "",
      "unit_kerja": ""
    }
  ],
  "catatan": []
}

Keterangan kolom lampiran 1: No, Nama Organisasi Kemahasiswaan, Nama Pembina,
NIP/NIK, Jurusan/Unit Kerja.
"""
)

PROMPT_L2 = (
    "Dokumen ini adalah lampiran kedua Keputusan Direktur Politeknik Negeri "
    "Bandung tentang Pembina Organisasi Kemahasiswaan. Salin seluruh isi tabel.\n\n"
    + ATURAN_UMUM
    + """
Skema keluaran:
{
  "lampiran": 2,
  "baris": [
    {
      "no": "",
      "organisasi": "",
      "nama_pembina": "",
      "nip": "",
      "honor_volume": "",
      "honor_satuan": "",
      "honor_per_bulan": ""
    }
  ],
  "catatan": []
}

Keterangan kolom lampiran 2: No, Nama Organisasi Kemahasiswaan, Nama Pembina,
NIP/NIK, lalu kolom Honorarium yang terbagi tiga subkolom: Volume, Satuan,
Per bulan. Lampiran ini TIDAK punya kolom Jurusan/Unit Kerja.
"""
)


# ---------------------------------------------------------------------------
# Rasterisasi
# ---------------------------------------------------------------------------


def rasterisasi(
    pdf_path: Path, halaman_1based: int, out_img: Path, dpi: int = DPI, jpeg: bool = False
) -> tuple[bytes, str]:
    """Render satu halaman PDF menjadi gambar. Kembalikan (bytes, mime)."""
    import pypdfium2 as pdfium

    pdf = pdfium.PdfDocument(str(pdf_path))
    if halaman_1based < 1 or halaman_1based > len(pdf):
        raise ValueError(
            f"halaman {halaman_1based} di luar rentang (PDF punya {len(pdf)} halaman)"
        )
    page = pdf[halaman_1based - 1]
    img = page.render(scale=dpi / 72.0).to_pil()
    out_img.parent.mkdir(parents=True, exist_ok=True)
    if jpeg:
        img.convert("RGB").save(out_img, "JPEG", quality=88, optimize=True)
        return out_img.read_bytes(), "image/jpeg"
    img.save(out_img, "PNG")
    return out_img.read_bytes(), "image/png"


# ---------------------------------------------------------------------------
# Panggilan VLM
# ---------------------------------------------------------------------------


def panggil_vlm(
    png_bytes: bytes,
    prompt: str,
    model: str,
    base_url: str,
    api_key: str,
    temperature: float = 0.0,
    timeout: int = 300,
    percobaan: int = 3,
    mime: str = "image/png",
) -> str:
    """Kirim satu gambar + prompt ke endpoint OpenAI-compatible."""
    import requests

    b64 = base64.b64encode(png_bytes).decode("ascii")
    payload = {
        "model": model,
        "temperature": temperature,
        "stream": False,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{mime};base64,{b64}"},
                    },
                    {"type": "text", "text": prompt},
                ],
            }
        ],
    }
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    url = f"{base_url.rstrip('/')}/chat/completions"
    galat_terakhir: Exception | None = None

    for percobaan_ke in range(1, percobaan + 1):
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=timeout)
        except Exception as e:  # noqa: BLE001
            galat_terakhir = e
            print(f"  koneksi gagal ({percobaan_ke}/{percobaan}): {e}", file=sys.stderr)
            time.sleep(3 * percobaan_ke)
            continue

        ctype = resp.headers.get("Content-Type", "")
        cuplikan = resp.text[:800].replace("\n", " ") if resp.text else "<badan respons kosong>"

        # Galat yang tidak akan membaik kalau diulang.
        if resp.status_code in (400, 401, 403, 404, 413, 422):
            raise RuntimeError(
                f"HTTP {resp.status_code} dari {url}\n"
                f"  Content-Type: {ctype}\n"
                f"  Badan respons: {cuplikan}"
            )

        if resp.status_code >= 400:
            galat_terakhir = RuntimeError(f"HTTP {resp.status_code}: {cuplikan}")
            print(f"  HTTP {resp.status_code} ({percobaan_ke}/{percobaan}): {cuplikan[:200]}", file=sys.stderr)
            time.sleep(3 * percobaan_ke)
            continue

        # Beberapa gateway tetap membalas SSE walau stream=False.
        if "text/event-stream" in ctype or resp.text.lstrip().startswith("data:"):
            potongan = []
            for baris_sse in resp.text.splitlines():
                if not baris_sse.startswith("data:"):
                    continue
                isi = baris_sse[5:].strip()
                if isi in ("", "[DONE]"):
                    continue
                try:
                    delta = json.loads(isi)["choices"][0].get("delta", {})
                    potongan.append(delta.get("content") or "")
                except Exception:  # noqa: BLE001
                    continue
            if potongan:
                return "".join(potongan)

        try:
            data = resp.json()
        except Exception:  # noqa: BLE001
            raise RuntimeError(
                f"Respons HTTP {resp.status_code} bukan JSON.\n"
                f"  URL: {url}\n"
                f"  Content-Type: {ctype}\n"
                f"  Panjang badan: {len(resp.text)} karakter\n"
                f"  Badan respons: {cuplikan}"
            ) from None

        if "choices" not in data:
            raise RuntimeError(
                f"Respons JSON tanpa field 'choices'. Isi: {json.dumps(data)[:800]}"
            )

        return data["choices"][0]["message"]["content"]

    raise RuntimeError(f"panggilan VLM gagal setelah {percobaan} percobaan: {galat_terakhir}")


def ambil_json(teks: str) -> dict[str, Any]:
    """Ambil objek JSON dari keluaran model, toleran terhadap pagar kode."""
    t = teks.strip()
    t = re.sub(r"^```(?:json)?\s*", "", t)
    t = re.sub(r"\s*```$", "", t)
    try:
        return json.loads(t)
    except json.JSONDecodeError:
        pass
    awal = t.find("{")
    akhir = t.rfind("}")
    if awal == -1 or akhir == -1 or akhir <= awal:
        raise ValueError("tidak ditemukan objek JSON pada keluaran model")
    return json.loads(t[awal : akhir + 1])


# ---------------------------------------------------------------------------
# Normalisasi
# ---------------------------------------------------------------------------


def normal_nip(s: str) -> str:
    """Buang semua karakter selain digit."""
    return re.sub(r"\D", "", s or "")


def normal_rupiah(s: str) -> int | None:
    """'300.000' -> 300000. Kembalikan None kalau tidak ada digit."""
    digit = re.sub(r"\D", "", s or "")
    return int(digit) if digit else None


def kunci_nama(nama: str) -> str:
    """Bentuk kunci pencocokan nama: buang gelar, tanda baca, dan spasi ganda."""
    s = (nama or "").lower()
    s = s.replace("&", " dan ")
    s = POLA_GELAR.sub(" ", s)
    s = re.sub(r"[^a-z\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def normal_no(s: Any) -> str:
    """Nomor urut sebagai string digit."""
    return re.sub(r"\D", "", str(s or ""))


# ---------------------------------------------------------------------------
# Validasi per lampiran
# ---------------------------------------------------------------------------


def validasi_lampiran(baris: list[dict], lampiran: int) -> list[dict]:
    """Cek struktur NIP, duplikasi, kelengkapan nomor urut, dan honorarium."""
    temuan: list[dict] = []

    nomor = [normal_no(b.get("no")) for b in baris]
    for i, n in enumerate(nomor):
        if not n:
            temuan.append(
                {
                    "jenis": "no_kosong",
                    "lampiran": lampiran,
                    "indeks": i,
                    "pesan": "baris tanpa nomor urut, mungkin baris judul seksi ikut terekstrak",
                }
            )

    berurut = [int(n) for n in nomor if n]
    if berurut:
        harusnya = list(range(1, max(berurut) + 1))
        hilang = sorted(set(harusnya) - set(berurut))
        if hilang:
            temuan.append(
                {
                    "jenis": "no_hilang",
                    "lampiran": lampiran,
                    "pesan": f"nomor urut tidak lengkap, hilang: {hilang}",
                }
            )
        ganda = sorted({n for n in berurut if berurut.count(n) > 1})
        if ganda:
            temuan.append(
                {
                    "jenis": "no_ganda",
                    "lampiran": lampiran,
                    "pesan": f"nomor urut muncul lebih dari sekali: {ganda}",
                }
            )

    hitung_nip: dict[str, list[str]] = {}
    for b in baris:
        no = normal_no(b.get("no"))
        nip = normal_nip(b.get("nip", ""))
        if len(nip) != 18:
            temuan.append(
                {
                    "jenis": "nip_panjang_salah",
                    "lampiran": lampiran,
                    "no": no,
                    "nilai": b.get("nip", ""),
                    "pesan": f"NIP {len(nip)} digit, seharusnya 18",
                }
            )
        if nip:
            hitung_nip.setdefault(nip, []).append(no)

    for nip, daftar_no in hitung_nip.items():
        if len(daftar_no) > 1:
            temuan.append(
                {
                    "jenis": "nip_ganda_dalam_lampiran",
                    "lampiran": lampiran,
                    "nip": nip,
                    "no": daftar_no,
                    "pesan": "satu NIP dipakai lebih dari satu baris",
                }
            )

    if lampiran == 2:
        for b in baris:
            no = normal_no(b.get("no"))
            vol = str(b.get("honor_volume", "")).strip()
            sat = str(b.get("honor_satuan", "")).strip().upper()
            per = normal_rupiah(str(b.get("honor_per_bulan", "")))
            if vol != HONOR_VOLUME_HARAPAN:
                temuan.append(
                    {
                        "jenis": "honor_volume_menyimpang",
                        "no": no,
                        "nilai": vol,
                        "pesan": f"volume {vol!r}, seluruh baris lain {HONOR_VOLUME_HARAPAN}",
                    }
                )
            if sat != HONOR_SATUAN_HARAPAN:
                temuan.append(
                    {
                        "jenis": "honor_satuan_menyimpang",
                        "no": no,
                        "nilai": sat,
                        "pesan": f"satuan {sat!r}, seluruh baris lain {HONOR_SATUAN_HARAPAN}",
                    }
                )
            if per != HONOR_PERBULAN_HARAPAN:
                temuan.append(
                    {
                        "jenis": "honor_nominal_menyimpang",
                        "no": no,
                        "nilai": b.get("honor_per_bulan", ""),
                        "pesan": f"nominal {per}, seluruh baris lain {HONOR_PERBULAN_HARAPAN}",
                    }
                )

    return temuan


# ---------------------------------------------------------------------------
# Rekonsiliasi lintas lampiran
# ---------------------------------------------------------------------------


def rekonsiliasi(baris1: list[dict], baris2: list[dict]) -> tuple[list[dict], list[dict]]:
    """
    Gabungkan lampiran 1 dan 2 berdasarkan nomor urut, verifikasi dengan nama.

    Kalau NIP berbeda, cek apakah NIP lampiran 2 sebenarnya milik baris lain di
    lampiran 1. Kalau iya, itu indikasi kolom NIP lampiran 2 tergeser, bukan
    salah baca. Nilai lampiran 1 dipakai sebagai nilai utama, konflik ditandai.
    """
    peta1 = {normal_no(b.get("no")): b for b in baris1 if normal_no(b.get("no"))}
    peta2 = {normal_no(b.get("no")): b for b in baris2 if normal_no(b.get("no"))}

    # nip -> nomor urut di lampiran 1, untuk mendeteksi pergeseran
    nip_ke_no1: dict[str, str] = {}
    for no, b in peta1.items():
        nip = normal_nip(b.get("nip", ""))
        if nip:
            nip_ke_no1.setdefault(nip, no)

    gabung: list[dict] = []
    temuan: list[dict] = []

    semua_no = sorted(set(peta1) | set(peta2), key=lambda x: int(x))
    for no in semua_no:
        b1 = peta1.get(no)
        b2 = peta2.get(no)

        if b1 is None or b2 is None:
            temuan.append(
                {
                    "jenis": "baris_tidak_berpasangan",
                    "no": no,
                    "pesan": f"hanya ada di lampiran {'2' if b1 is None else '1'}",
                }
            )

        nama1 = (b1 or {}).get("nama_pembina", "")
        nama2 = (b2 or {}).get("nama_pembina", "")
        nip1 = normal_nip((b1 or {}).get("nip", ""))
        nip2 = normal_nip((b2 or {}).get("nip", ""))

        catatan: list[dict] = []
        status = "ok"

        if b1 and b2 and kunci_nama(nama1) != kunci_nama(nama2):
            status = "perlu_periksa"
            c = {
                "jenis": "nama_beda",
                "no": no,
                "lampiran_1": nama1,
                "lampiran_2": nama2,
                "pesan": "nama pembina berbeda antar lampiran",
            }
            catatan.append(c)
            temuan.append(c)

        if b1 and b2 and nip1 and nip2 and nip1 != nip2:
            status = "perlu_periksa"
            no_asal = nip_ke_no1.get(nip2)
            if no_asal and no_asal != no:
                geser = int(no_asal) - int(no)
                c = {
                    "jenis": "nip_tergeser",
                    "no": no,
                    "lampiran_1": nip1,
                    "lampiran_2": nip2,
                    "nip_l2_milik_no": no_asal,
                    "nama_pemilik_asli": peta1[no_asal].get("nama_pembina", ""),
                    "offset": geser,
                    "pesan": (
                        f"NIP lampiran 2 pada baris {no} identik dengan NIP baris "
                        f"{no_asal} lampiran 1 (offset {geser:+d}). Indikasi kolom "
                        f"NIP lampiran 2 tergeser, bukan salah baca."
                    ),
                }
            else:
                c = {
                    "jenis": "nip_beda",
                    "no": no,
                    "lampiran_1": nip1,
                    "lampiran_2": nip2,
                    "pesan": "NIP berbeda dan tidak cocok dengan baris mana pun di lampiran 1",
                }
            catatan.append(c)
            temuan.append(c)

        gabung.append(
            {
                "no": no,
                "organisasi": (b1 or b2 or {}).get("organisasi", ""),
                "nama_pembina": nama1 or nama2,
                "kunci_nama": kunci_nama(nama1 or nama2),
                "nip": nip1 or nip2,  # lampiran 1 sebagai sumber utama
                "nip_lampiran_1": nip1,
                "nip_lampiran_2": nip2,
                "unit_kerja": (b1 or {}).get("unit_kerja", ""),
                "honor_volume": (b2 or {}).get("honor_volume", ""),
                "honor_satuan": (b2 or {}).get("honor_satuan", ""),
                "honor_per_bulan": normal_rupiah(str((b2 or {}).get("honor_per_bulan", ""))),
                "status": status,
                "catatan": catatan,
            }
        )

    # Ringkasan pola pergeseran, berguna untuk laporan.
    offset = [c["offset"] for c in temuan if c.get("jenis") == "nip_tergeser"]
    if offset:
        temuan.append(
            {
                "jenis": "ringkasan_pergeseran",
                "jumlah_baris": len(offset),
                "offset_unik": sorted(set(offset)),
                "pesan": (
                    f"{len(offset)} baris terindikasi pergeseran kolom NIP di lampiran 2. "
                    f"Offset tidak seragam: {sorted(set(offset))}. "
                    f"Perlu verifikasi manual pada dokumen asli."
                ),
            }
        )

    return gabung, temuan


# ---------------------------------------------------------------------------
# Filter JTK dan keluaran per dosen
# ---------------------------------------------------------------------------


def apakah_jtk(unit_kerja: str) -> bool:
    u = (unit_kerja or "").lower()
    return any(k in u for k in KATA_KUNCI_JTK)


def keluaran_per_dosen(gabung: list[dict], nomor_sk: str, tanggal_sk: str) -> list[dict]:
    """Susun JSON per dosen JTK sesuai skema penugasan yang dipakai parser lain."""
    per_dosen: dict[str, dict] = {}
    for b in gabung:
        if not apakah_jtk(b["unit_kerja"]):
            continue
        kunci = b["kunci_nama"]
        d = per_dosen.setdefault(
            kunci,
            {"nama": b["nama_pembina"], "kunci_nama": kunci, "nip": b["nip"], "penugasan": []},
        )
        d["penugasan"].append(
            {
                "jenis": "pembina_ormawa",
                "sumber": "SK Pembina Organisasi Kemahasiswaan",
                "nomor_sk": nomor_sk,
                "tanggal_sk": tanggal_sk,
                "organisasi": b["organisasi"],
                "unit_kerja": b["unit_kerja"],
                "honor_volume": b["honor_volume"],
                "honor_satuan": b["honor_satuan"],
                "honor_per_bulan": b["honor_per_bulan"],
                "no_baris_sk": b["no"],
                "status": b["status"],
                "catatan": b["catatan"],
            }
        )
    return list(per_dosen.values())


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def proses_lampiran(
    pdf: Path,
    halaman: int,
    lampiran: int,
    prompt: str,
    out: Path,
    args: argparse.Namespace,
) -> list[dict]:
    """Rasterisasi, panggil VLM, simpan artefak, kembalikan daftar baris."""
    ext = "jpg" if args.jpeg else "png"
    gambar = out / f"lampiran{lampiran}.{ext}"
    mentah = out / f"lampiran{lampiran}_mentah.txt"
    terurai = out / f"lampiran{lampiran}.json"

    if args.offline:
        if not terurai.exists():
            raise SystemExit(f"mode offline tapi {terurai} tidak ada")
        print(f"[L{lampiran}] mode offline, membaca {terurai.name}")
        data = json.loads(terurai.read_text(encoding="utf-8"))
        return data.get("baris", [])

    print(f"[L{lampiran}] rasterisasi halaman {halaman} pada {args.dpi} DPI")
    img_bytes, mime = rasterisasi(pdf, halaman, gambar, dpi=args.dpi, jpeg=args.jpeg)
    kb = len(img_bytes) / 1024
    print(f"[L{lampiran}] {gambar.name} {kb:.0f} KB, payload base64 ~{kb * 4 / 3:.0f} KB")

    print(f"[L{lampiran}] memanggil {args.model}")
    teks = panggil_vlm(
        img_bytes,
        prompt,
        model=args.model,
        base_url=args.base_url,
        api_key=args.api_key,
        temperature=args.temperature,
        mime=mime,
    )
    mentah.write_text(teks, encoding="utf-8")

    data = ambil_json(teks)
    terurai.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    baris = data.get("baris", [])
    print(f"[L{lampiran}] {len(baris)} baris terekstrak")
    return baris


def ekstrak(
    pdf_path: Path,
    out_dir: Path,
    *,
    model: str = MODEL_DEFAULT,
    base_url: str = BASE_URL_DEFAULT,
    api_key: str = "",
    dpi: int = DPI,
    jpeg: bool = False,
    temperature: float = 0.0,
    halaman_l1: int = HALAMAN_LAMPIRAN_1,
    halaman_l2: int = HALAMAN_LAMPIRAN_2,
    nomor_sk: str = "45/PL1/HK.02/2026",
    tanggal_sk: str = "2026-01-19",
    offline: bool = False,
) -> dict:
    """Jalankan seluruh alur ekstraksi dan kembalikan dict hasil.

    Fungsi library yang dipakai CLI (`main`) maupun API. Artefak antara tetap
    ditulis ke `out_dir`. `main()` hanya membungkus fungsi ini lalu mencetak
    ringkasan ke layar.
    """
    from types import SimpleNamespace

    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # proses_lampiran membaca atribut lewat args-namespace; sediakan yang setara.
    args = SimpleNamespace(
        model=model, base_url=base_url, api_key=api_key, dpi=dpi, jpeg=jpeg,
        temperature=temperature, offline=offline,
    )

    baris1 = proses_lampiran(pdf_path, halaman_l1, 1, PROMPT_L1, out_dir, args)
    baris2 = proses_lampiran(pdf_path, halaman_l2, 2, PROMPT_L2, out_dir, args)

    temuan: list[dict] = []
    temuan += validasi_lampiran(baris1, 1)
    temuan += validasi_lampiran(baris2, 2)

    gabung, temuan_rekon = rekonsiliasi(baris1, baris2)
    temuan += temuan_rekon

    (out_dir / "gabungan.json").write_text(
        json.dumps(gabung, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (out_dir / "temuan_validasi.json").write_text(
        json.dumps(temuan, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    dosen = keluaran_per_dosen(gabung, nomor_sk, tanggal_sk)
    (out_dir / "pembina_jtk.json").write_text(
        json.dumps(dosen, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    per_jenis: dict[str, int] = {}
    for t in temuan:
        per_jenis[t["jenis"]] = per_jenis.get(t["jenis"], 0) + 1

    return {
        "gabungan": gabung,
        "temuan": temuan,
        "pembina_jtk": dosen,
        "ringkasan": {
            "baris_lampiran_1": len(baris1),
            "baris_lampiran_2": len(baris2),
            "baris_tergabung": len(gabung),
            "jumlah_temuan": len(temuan),
            "temuan_per_jenis": per_jenis,
            "jumlah_dosen_jtk": len(dosen),
        },
    }


def main() -> int:
    p = argparse.ArgumentParser(description="Parser SK Pembina Ormawa berbasis VLM")
    p.add_argument("pdf", type=Path, help="berkas sk_pembinaan.pdf")
    p.add_argument("-o", "--out", type=Path, default=Path("keluaran"), help="folder keluaran")
    p.add_argument("--model", default=MODEL_DEFAULT)
    p.add_argument("--base-url", default=BASE_URL_DEFAULT)
    p.add_argument("--api-key", default=API_KEY or os.environ.get("ROUTER_API_KEY", ""))
    p.add_argument("--temperature", type=float, default=0.0)
    p.add_argument("--dpi", type=int, default=DPI, help="resolusi rasterisasi, turunkan kalau payload ditolak")
    p.add_argument("--jpeg", action="store_true", help="kirim JPEG, bukan PNG (payload jauh lebih kecil)")
    p.add_argument("--probe", action="store_true", help="uji koneksi teks saja, tanpa gambar, lalu keluar")
    p.add_argument("--halaman-l1", type=int, default=HALAMAN_LAMPIRAN_1)
    p.add_argument("--halaman-l2", type=int, default=HALAMAN_LAMPIRAN_2)
    p.add_argument("--nomor-sk", default="45/PL1/HK.02/2026")
    p.add_argument("--tanggal-sk", default="2026-01-19")
    p.add_argument(
        "--offline",
        action="store_true",
        help="lewati panggilan VLM, pakai lampiran{1,2}.json yang sudah ada di folder keluaran",
    )
    args = p.parse_args()

    if args.probe:
        import requests

        url = f"{args.base_url.rstrip('/')}/chat/completions"
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        if args.api_key:
            headers["Authorization"] = f"Bearer {args.api_key}"
        else:
            print("PERINGATAN: API key kosong")
        print(f"POST {url}")
        print(f"model: {args.model}")
        r = requests.post(
            url,
            headers=headers,
            json={
                "model": args.model,
                "stream": False,
                "messages": [{"role": "user", "content": "balas satu kata: siap"}],
            },
            timeout=120,
        )
        print(f"HTTP {r.status_code}  Content-Type: {r.headers.get('Content-Type')}")
        print(f"panjang badan: {len(r.text)}")
        print("--- badan respons ---")
        print(r.text[:1500] if r.text else "<kosong>")
        return 0

    if not args.pdf.exists():
        raise SystemExit(f"berkas tidak ditemukan: {args.pdf}")

    hasil = ekstrak(
        args.pdf, args.out,
        model=args.model, base_url=args.base_url, api_key=args.api_key,
        dpi=args.dpi, jpeg=args.jpeg, temperature=args.temperature,
        halaman_l1=args.halaman_l1, halaman_l2=args.halaman_l2,
        nomor_sk=args.nomor_sk, tanggal_sk=args.tanggal_sk, offline=args.offline,
    )
    r = hasil["ringkasan"]
    dosen = hasil["pembina_jtk"]

    # Ringkasan ke layar
    print()
    print("=" * 68)
    print(f"baris lampiran 1 : {r['baris_lampiran_1']}")
    print(f"baris lampiran 2 : {r['baris_lampiran_2']}")
    print(f"baris tergabung  : {r['baris_tergabung']}")
    print(f"temuan validasi  : {r['jumlah_temuan']}")

    for jenis, n in sorted(r["temuan_per_jenis"].items()):
        print(f"  - {jenis}: {n}")

    print()
    print(f"dosen JTK        : {len(dosen)}")
    for d in dosen:
        tanda = [pn["status"] for pn in d["penugasan"]]
        print(f"  - {d['nama']} ({d['nip']}) {d['penugasan'][0]['organisasi']} [{','.join(tanda)}]")
    print("=" * 68)
    print(f"artefak tersimpan di {args.out}/")

    return 0


if __name__ == "__main__":
    sys.exit(main())