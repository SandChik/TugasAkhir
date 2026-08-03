#!/usr/bin/env python3
"""
parse_artefak_vlm.py

Ekstraksi artefak dokumen dosen (formulir, surat, berita acara) memakai MLLM
lewat endpoint OpenAI-compatible (9router).

Berbeda dengan parse_sk_vlm.py yang terikat pada satu jenis dokumen, berkas ini
memakai satu skema umum yang berlaku untuk berbagai jenis surat. Yang dijaga
tetap adalah STRUKTURNYA, bukan jenis dokumennya:

  - setiap tanggal wajib punya peran (pelaksanaan, tanda_tangan, dst)
  - setiap orang wajib punya peran (pembimbing_1, koordinator, dst)
  - nilai yang tidak ada di dokumen WAJIB null, tidak boleh dikarang
  - teks asli disimpan verbatim untuk audit

Validator yang berjalan otomatis:
  - nama hari dicocokkan ke tanggal kalender
  - urutan antar tanggal diperiksa kewajarannya
  - NIP 18 digit, NIM 9 digit, format tahun akademik
  - field wajib yang hilang dari keluaran model ditandai

Pemakaian:
    python parse_artefak_vlm.py dokumen.pdf -o hasil/
    python parse_artefak_vlm.py dokumen.pdf -o hasil/ --jpeg --dpi 150
    python parse_artefak_vlm.py dokumen.pdf --probe
    python parse_artefak_vlm.py dokumen.pdf -o hasil/ --halaman 1,2
    python parse_artefak_vlm.py dokumen.pdf -o hasil/ --offline

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
from datetime import date, datetime
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Konfigurasi
# ---------------------------------------------------------------------------

BASE_URL_DEFAULT = "https://9router.tmfadhli.my.id/v1"
MODEL_DEFAULT = "ag/gemini-3.5-flash-low"

# Kosongkan di sini. Nilainya diambil dari environment variable ROUTER_API_KEY
# (atau .env). JANGAN hardcode kunci di berkas ini dan jangan commit ke repo.
API_KEY = ""

DPI_DEFAULT = 150

# Enum peran tanggal. Model wajib memilih salah satu, istilah asli di dokumen
# tetap disimpan pada field "peran_asli".
PERAN_TANGGAL = [
    "pelaksanaan",      # kapan kegiatan berlangsung
    "penetapan",        # kapan dokumen ditetapkan
    "tanda_tangan",     # kapan dokumen ditandatangani
    "pengajuan",        # kapan diajukan
    "berlaku_mulai",
    "berlaku_sampai",
    "lainnya",
]

# Enum peran orang.
PERAN_ORANG = [
    "pembimbing_1",
    "pembimbing_2",
    "pembimbing",
    "penguji",
    "koordinator",
    "ketua_program_studi",
    "ketua_jurusan",
    "direktur",
    "pembina",
    "pengaju",
    "mengetahui",
    "lainnya",
]

BULAN_ID = {
    "januari": 1, "februari": 2, "pebruari": 2, "maret": 3, "april": 4,
    "mei": 5, "juni": 6, "juli": 7, "agustus": 8, "september": 9,
    "oktober": 10, "november": 11, "nopember": 11, "desember": 12,
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "jun": 6, "jul": 7,
    "agu": 8, "ags": 8, "sep": 9, "okt": 10, "nov": 11, "des": 12,
}

HARI_ID = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"]

POLA_GELAR = re.compile(
    r"\b("
    r"prof|dr|drs|dra|ir|"
    r"s\.?t|s\.?si|s\.?e|s\.?pd|s\.?ap|s\.?kel|s\.?s|s\.?tr\.?t|s\.?s\.?t|s\.?kom|"
    r"m\.?t|m\.?sc|m\.?si|m\.?ak|m\.?m|m\.?a|m\.?pd|m\.?hum|m\.?kom|mmsi|d\.?e\.?a|"
    r"a\.?md|amd|ph\.?d"
    r")\b\.?",
    re.IGNORECASE,
)

# Field wajib ada di keluaran model, walaupun isinya null atau daftar kosong.
FIELD_WAJIB = [
    "jenis_dokumen", "kode_formulir", "institusi", "nomor_dokumen",
    "tanggal", "tahun_akademik", "orang", "mahasiswa", "medan_lain", "catatan",
]


# ---------------------------------------------------------------------------
# Prompt
# ---------------------------------------------------------------------------

def bangun_prompt() -> str:
    return f"""\
Kamu membaca satu halaman dokumen resmi berbahasa Indonesia dari lingkungan
perguruan tinggi. Dokumen bisa berupa formulir, surat tugas, surat keputusan,
berita acara, atau lembar persetujuan. Sebagian isian mungkin DITULIS TANGAN.

Tugasmu: salin seluruh informasi yang ada ke dalam skema JSON di bawah.

Aturan wajib:
1. Salin nilai APA ADANYA ke field "teks_asli" atau "nilai". Jangan perbaiki
   ejaan, jangan lengkapi gelar, jangan menormalkan angka.
2. Kalau suatu informasi TIDAK ADA di halaman ini, isi dengan null untuk nilai
   tunggal atau [] untuk daftar. JANGAN mengarang. JANGAN menghilangkan kunci.
   Semua kunci pada skema harus tetap muncul di keluaranmu.
3. Setiap tanggal wajib diberi "peran", pilih satu dari:
   {", ".join(PERAN_TANGGAL)}
   Simpan istilah asli yang tertulis di dokumen pada "peran_asli"
   (contoh: "Pada hari, tanggal", "Ditetapkan di", "Bandung, ...").
4. Setiap orang wajib diberi "peran", pilih satu dari:
   {", ".join(PERAN_ORANG)}
   Simpan jabatan persis seperti tertulis pada "peran_asli"
   (contoh: "Pembimbing I", "a.n. Koordinator TA").
5. Kalau suatu isian ditulis tangan, set "tulisan_tangan": true. Kalau tercetak,
   false. Kalau ragu, true.
6. Kalau ada karakter yang tidak terbaca jelas, tetap tulis tebakan terbaikmu
   dan tambahkan keterangan ke "catatan".
7. Informasi yang tidak masuk field mana pun ditaruh di "medan_lain" sebagai
   pasangan label dan nilai.
8. Keluarkan HANYA objek JSON. Tanpa penjelasan, tanpa pagar kode markdown.

Skema keluaran:
{{
  "jenis_dokumen": null,
  "kode_formulir": null,
  "institusi": null,
  "nomor_dokumen": null,
  "tanggal": [
    {{
      "peran": "",
      "peran_asli": "",
      "teks_asli": "",
      "iso": null,
      "hari_tertulis": null,
      "tulisan_tangan": false
    }}
  ],
  "tahun_akademik": null,
  "orang": [
    {{
      "nama": "",
      "peran": "",
      "peran_asli": "",
      "nip": null,
      "instansi": null,
      "tulisan_tangan": false
    }}
  ],
  "mahasiswa": [
    {{"nim": null, "nama": null, "keterangan": null}}
  ],
  "medan_lain": [
    {{"label": "", "nilai": ""}}
  ],
  "catatan": []
}}

Keterangan field:
- "iso": tanggal dalam format YYYY-MM-DD. null kalau tidak lengkap.
- "hari_tertulis": nama hari yang TERTULIS di dokumen (contoh "Kamis").
  null kalau dokumen tidak menyebut nama hari. Jangan hitung sendiri.
- "tahun_akademik": format "2025/2026". null kalau tidak tercantum.
- "nomor_dokumen": nomor surat atau nomor keputusan.
- "kode_formulir": kode formulir kalau ada (contoh "FTA.23").
"""


# ---------------------------------------------------------------------------
# Rasterisasi
# ---------------------------------------------------------------------------


def jumlah_halaman(pdf_path: Path) -> int:
    import pypdfium2 as pdfium

    return len(pdfium.PdfDocument(str(pdf_path)))


def rasterisasi(
    pdf_path: Path, halaman_1based: int, out_img: Path, dpi: int, jpeg: bool
) -> tuple[bytes, str]:
    """Render satu halaman PDF menjadi gambar. Kembalikan (bytes, mime)."""
    import pypdfium2 as pdfium

    pdf = pdfium.PdfDocument(str(pdf_path))
    if halaman_1based < 1 or halaman_1based > len(pdf):
        raise ValueError(
            f"halaman {halaman_1based} di luar rentang (PDF punya {len(pdf)} halaman)"
        )
    img = pdf[halaman_1based - 1].render(scale=dpi / 72.0).to_pil()
    out_img.parent.mkdir(parents=True, exist_ok=True)
    if jpeg:
        img.convert("RGB").save(out_img, "JPEG", quality=88, optimize=True)
        return out_img.read_bytes(), "image/jpeg"
    img.save(out_img, "PNG")
    return out_img.read_bytes(), "image/png"


# ---------------------------------------------------------------------------
# Panggilan MLLM
# ---------------------------------------------------------------------------


def bangun_isi_pesan(gaya: str, b64: str, mime: str, prompt: str) -> list[dict]:
    """
    Bentuk blok konten sesuai gaya yang diminta.

    Lapisan translasi router tidak selalu menerjemahkan blok gambar dengan benar
    untuk semua vendor. Gemini umumnya menerima gaya OpenAI, sedangkan model
    Claude lewat router tertentu hanya menerima gaya Anthropic. Kalau model
    menjawab "tidak ada gambar yang diberikan", ganti gaya di sini.
    """
    if gaya == "openai_objek":
        return [
            {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}},
            {"type": "text", "text": prompt},
        ]
    if gaya == "openai_teks":
        return [
            {"type": "image_url", "image_url": f"data:{mime};base64,{b64}"},
            {"type": "text", "text": prompt},
        ]
    if gaya in ("anthropic", "anthropic_messages"):
        return [
            {
                "type": "image",
                "source": {"type": "base64", "media_type": mime, "data": b64},
            },
            {"type": "text", "text": prompt},
        ]
    raise ValueError(f"gaya gambar tidak dikenal: {gaya}")


def panggil_vlm(
    img_bytes: bytes,
    prompt: str,
    model: str,
    base_url: str,
    api_key: str,
    temperature: float = 0.0,
    timeout: int = 300,
    percobaan: int = 3,
    mime: str = "image/png",
    gaya: str = "openai_objek",
) -> str:
    """Kirim satu gambar + prompt ke endpoint OpenAI-compatible."""
    import requests

    b64 = base64.b64encode(img_bytes).decode("ascii")
    payload = {
        "model": model,
        "temperature": temperature,
        "stream": False,
        "messages": [{"role": "user", "content": bangun_isi_pesan(gaya, b64, mime, prompt)}],
    }
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    url = f"{base_url.rstrip('/')}/chat/completions"
    galat_terakhir: Exception | None = None

    # Gaya native Anthropic memakai endpoint dan bentuk badan yang berbeda.
    native = gaya == "anthropic_messages"
    if native:
        url = f"{base_url.rstrip('/')}/messages"
        payload = {
            "model": model,
            "max_tokens": 8192,
            "temperature": temperature,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {"type": "base64", "media_type": mime, "data": b64},
                        },
                        {"type": "text", "text": prompt},
                    ],
                }
            ],
        }
        headers["x-api-key"] = api_key
        headers["anthropic-version"] = "2023-06-01"

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

        if resp.status_code in (400, 401, 403, 404, 413, 422):
            raise RuntimeError(
                f"HTTP {resp.status_code} dari {url}\n"
                f"  Content-Type: {ctype}\n"
                f"  Badan respons: {cuplikan}"
            )

        if resp.status_code >= 400:
            galat_terakhir = RuntimeError(f"HTTP {resp.status_code}: {cuplikan}")
            print(
                f"  HTTP {resp.status_code} ({percobaan_ke}/{percobaan}): {cuplikan[:200]}",
                file=sys.stderr,
            )
            time.sleep(3 * percobaan_ke)
            continue

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
                f"  URL: {url}\n  Content-Type: {ctype}\n"
                f"  Panjang badan: {len(resp.text)} karakter\n"
                f"  Badan respons: {cuplikan}"
            ) from None

        if native:
            if "content" not in data:
                raise RuntimeError(
                    f"Respons /messages tanpa 'content'. Isi: {json.dumps(data)[:800]}"
                )
            return "".join(
                blok.get("text", "")
                for blok in data["content"]
                if blok.get("type") == "text"
            )

        if "choices" not in data:
            raise RuntimeError(f"Respons JSON tanpa 'choices'. Isi: {json.dumps(data)[:800]}")

        return data["choices"][0]["message"]["content"]

    raise RuntimeError(f"panggilan MLLM gagal setelah {percobaan} percobaan: {galat_terakhir}")


def ambil_json(teks: str) -> dict[str, Any]:
    """Ambil objek JSON dari keluaran model, toleran terhadap pagar kode."""
    t = teks.strip()
    t = re.sub(r"^```(?:json)?\s*", "", t)
    t = re.sub(r"\s*```$", "", t)
    try:
        return json.loads(t)
    except json.JSONDecodeError:
        pass
    awal, akhir = t.find("{"), t.rfind("}")
    if awal == -1 or akhir <= awal:
        raise ValueError("tidak ditemukan objek JSON pada keluaran model")
    return json.loads(t[awal : akhir + 1])


# ---------------------------------------------------------------------------
# Normalisasi
# ---------------------------------------------------------------------------


def kunci_nama(nama: str) -> str:
    s = (nama or "").lower().replace("&", " dan ")
    s = POLA_GELAR.sub(" ", s)
    s = re.sub(r"[^a-z\s]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def urai_tanggal_id(teks: str) -> str | None:
    """Ubah '7 mei 2026' atau '19 Januari 2026' menjadi '2026-05-07'."""
    if not teks:
        return None
    t = teks.lower().replace(".", " ")
    m = re.search(r"(\d{1,2})\s+([a-z]+)\s+(\d{4})", t)
    if m:
        hari, nama_bulan, tahun = m.group(1), m.group(2), m.group(3)
        bulan = BULAN_ID.get(nama_bulan)
        if bulan:
            try:
                return date(int(tahun), bulan, int(hari)).isoformat()
            except ValueError:
                return None
    m = re.search(r"(\d{4})-(\d{2})-(\d{2})", t)
    if m:
        try:
            return date(int(m.group(1)), int(m.group(2)), int(m.group(3))).isoformat()
        except ValueError:
            return None
    m = re.search(r"(\d{1,2})[/-](\d{1,2})[/-](\d{4})", t)
    if m:
        try:
            return date(int(m.group(3)), int(m.group(2)), int(m.group(1))).isoformat()
        except ValueError:
            return None
    return None


def ke_iso(item: dict) -> str | None:
    """Ambil ISO dari model, kalau tidak valid coba urai ulang dari teks asli."""
    kandidat = str(item.get("iso") or "")
    try:
        return datetime.strptime(kandidat, "%Y-%m-%d").date().isoformat()
    except ValueError:
        return urai_tanggal_id(str(item.get("teks_asli") or ""))


# ---------------------------------------------------------------------------
# Validasi
# ---------------------------------------------------------------------------


def periksa_nip(nip: str) -> list[str]:
    """Validasi struktur NIP 18 digit. Bulan TMT tidak diperiksa karena skema
    penomoran PPPK memakai pola yang berbeda."""
    n = re.sub(r"\D", "", nip or "")
    galat = []
    if len(n) != 18:
        return [f"NIP {len(n)} digit, seharusnya 18"]
    try:
        date(int(n[:4]), int(n[4:6]), int(n[6:8]))
    except ValueError:
        galat.append("tanggal lahir pada NIP tidak valid")
    if n[14] not in "12":
        galat.append(f"digit jenis kelamin '{n[14]}', seharusnya 1 atau 2")
    return galat


def validasi(hasil: dict, halaman: int) -> list[dict]:
    temuan: list[dict] = []

    def catat(jenis: str, pesan: str, **kw):
        temuan.append({"jenis": jenis, "halaman": halaman, "pesan": pesan, **kw})

    for f in FIELD_WAJIB:
        if f not in hasil:
            catat("field_hilang", f"model tidak mengeluarkan field wajib '{f}'", field=f)

    # --- tanggal ---
    tanggal = hasil.get("tanggal") or []
    for t in tanggal:
        peran = t.get("peran")
        if peran not in PERAN_TANGGAL:
            catat("peran_tanggal_tak_dikenal", f"peran tanggal '{peran}' di luar enum", nilai=peran)

        iso = ke_iso(t)
        t["iso_terverifikasi"] = iso
        if iso is None:
            catat(
                "tanggal_tak_terurai",
                f"tanggal '{t.get('teks_asli')}' tidak bisa diubah ke format ISO",
                teks_asli=t.get("teks_asli"),
            )
            continue

        hari_tertulis = (t.get("hari_tertulis") or "").strip().lower()
        if hari_tertulis:
            seharusnya = HARI_ID[date.fromisoformat(iso).weekday()]
            if hari_tertulis != seharusnya.lower():
                catat(
                    "hari_tidak_cocok",
                    f"dokumen menulis '{t.get('hari_tertulis')}' tapi {iso} jatuh pada {seharusnya}",
                    iso=iso,
                    hari_tertulis=t.get("hari_tertulis"),
                    hari_seharusnya=seharusnya,
                )

    # urutan antar tanggal
    peta = {t.get("peran"): t.get("iso_terverifikasi") for t in tanggal if t.get("iso_terverifikasi")}
    if "tanda_tangan" in peta and "pelaksanaan" in peta:
        ttd = date.fromisoformat(peta["tanda_tangan"])
        pel = date.fromisoformat(peta["pelaksanaan"])
        if ttd > pel:
            catat(
                "urutan_tanggal_janggal",
                f"tanggal tanda tangan ({ttd}) berada {(ttd - pel).days} hari SETELAH "
                f"tanggal pelaksanaan ({pel}). Pada dokumen persetujuan, tanda tangan "
                f"lazimnya mendahului pelaksanaan.",
                tanda_tangan=str(ttd),
                pelaksanaan=str(pel),
                selisih_hari=(ttd - pel).days,
            )
    if "berlaku_mulai" in peta and "berlaku_sampai" in peta:
        if date.fromisoformat(peta["berlaku_mulai"]) > date.fromisoformat(peta["berlaku_sampai"]):
            catat("masa_berlaku_terbalik", "berlaku_mulai lebih akhir daripada berlaku_sampai")

    # --- tahun akademik ---
    ta = hasil.get("tahun_akademik")
    if ta:
        m = re.fullmatch(r"(\d{4})\s*/\s*(\d{4})", str(ta).strip())
        if not m:
            catat("tahun_akademik_format", f"format tahun akademik '{ta}' bukan YYYY/YYYY", nilai=ta)
        elif int(m.group(2)) - int(m.group(1)) != 1:
            catat("tahun_akademik_tidak_berurutan", f"tahun akademik '{ta}' tidak berurutan", nilai=ta)

    # --- orang ---
    orang = hasil.get("orang") or []
    if not orang:
        catat("tanpa_orang", "tidak ada satu pun orang terekstrak dari halaman ini")
    terlihat: dict[str, str] = {}
    for o in orang:
        nama = o.get("nama") or ""
        o["kunci_nama"] = kunci_nama(nama)
        if o.get("peran") not in PERAN_ORANG:
            catat("peran_orang_tak_dikenal", f"peran '{o.get('peran')}' di luar enum", nama=nama)
        if o.get("nip"):
            for g in periksa_nip(str(o["nip"])):
                catat("nip_tidak_valid", g, nama=nama, nip=o.get("nip"))
        if o["kunci_nama"]:
            if o["kunci_nama"] in terlihat:
                catat(
                    "nama_ganda",
                    f"'{nama}' muncul lebih dari sekali dengan peran "
                    f"{terlihat[o['kunci_nama']]} dan {o.get('peran')}",
                    nama=nama,
                )
            terlihat[o["kunci_nama"]] = str(o.get("peran"))
        if o.get("tulisan_tangan"):
            catat(
                "isian_tulisan_tangan",
                f"'{nama}' ditulis tangan, tidak ada teks pembanding. Perlu verifikasi manual.",
                nama=nama,
                nip=o.get("nip"),
            )

    # --- mahasiswa ---
    for mh in hasil.get("mahasiswa") or []:
        nim = re.sub(r"\D", "", str(mh.get("nim") or ""))
        if nim and len(nim) != 9:
            catat("nim_panjang_janggal", f"NIM '{mh.get('nim')}' {len(nim)} digit, lazimnya 9", nim=mh.get("nim"))

    return temuan


# ---------------------------------------------------------------------------
# Penggabungan antar halaman
# ---------------------------------------------------------------------------


def gabung_halaman(per_halaman: list[dict]) -> dict:
    """Satukan hasil beberapa halaman menjadi satu dokumen."""
    gab: dict[str, Any] = {
        "jenis_dokumen": None, "kode_formulir": None, "institusi": None,
        "nomor_dokumen": None, "tahun_akademik": None,
        "tanggal": [], "orang": [], "mahasiswa": [], "medan_lain": [], "catatan": [],
    }
    for f in ("jenis_dokumen", "kode_formulir", "institusi", "nomor_dokumen", "tahun_akademik"):
        for h in per_halaman:
            if h.get(f):
                gab[f] = h[f]
                break

    lihat_tgl, lihat_org, lihat_mhs = set(), set(), set()
    for i, h in enumerate(per_halaman, 1):
        for t in h.get("tanggal") or []:
            k = (t.get("peran"), t.get("iso_terverifikasi") or t.get("teks_asli"))
            if k in lihat_tgl:
                continue
            lihat_tgl.add(k)
            gab["tanggal"].append({**t, "halaman": i})
        for o in h.get("orang") or []:
            k = (o.get("kunci_nama"), o.get("peran"))
            if k in lihat_org:
                continue
            lihat_org.add(k)
            gab["orang"].append({**o, "halaman": i})
        for m in h.get("mahasiswa") or []:
            k = (str(m.get("nim")), str(m.get("nama")))
            if k in lihat_mhs:
                continue
            lihat_mhs.add(k)
            gab["mahasiswa"].append({**m, "halaman": i})
        for ml in h.get("medan_lain") or []:
            gab["medan_lain"].append({**ml, "halaman": i})
        for c in h.get("catatan") or []:
            gab["catatan"].append({"halaman": i, "isi": c})
    return gab


def ringkas_dosen(gab: dict) -> list[dict]:
    """Keluaran per dosen dengan skema penugasan yang seragam dengan parser lain."""
    peran_mahasiswa = {"pengaju"}
    hasil: dict[str, dict] = {}
    tgl_utama = None
    for prioritas in ("pelaksanaan", "penetapan", "tanda_tangan"):
        for t in gab["tanggal"]:
            if t.get("peran") == prioritas and t.get("iso_terverifikasi"):
                tgl_utama = t["iso_terverifikasi"]
                break
        if tgl_utama:
            break
    tahun = tgl_utama[:4] if tgl_utama else None

    for o in gab["orang"]:
        if o.get("peran") in peran_mahasiswa or not o.get("kunci_nama"):
            continue
        d = hasil.setdefault(
            o["kunci_nama"],
            {"nama": o.get("nama"), "kunci_nama": o["kunci_nama"], "nip": o.get("nip"), "penugasan": []},
        )
        d["penugasan"].append(
            {
                "jenis": o.get("peran"),
                "peran_asli": o.get("peran_asli"),
                "sumber": gab.get("jenis_dokumen") or "artefak dosen",
                "kode_formulir": gab.get("kode_formulir"),
                "nomor_dokumen": gab.get("nomor_dokumen"),
                "tanggal": tgl_utama,
                "tahun": tahun,
                "tahun_akademik": gab.get("tahun_akademik"),
                "tulisan_tangan": o.get("tulisan_tangan"),
            }
        )
    return list(hasil.values())


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def proses_halaman(pdf: Path, halaman: int, out: Path, args) -> dict:
    ext = "jpg" if args.jpeg else "png"
    gambar = out / f"hal{halaman}.{ext}"
    mentah = out / f"hal{halaman}_mentah.txt"
    terurai = out / f"hal{halaman}.json"

    if args.offline:
        if not terurai.exists():
            raise SystemExit(f"mode offline tapi {terurai} tidak ada")
        print(f"[hal {halaman}] mode offline, membaca {terurai.name}")
        return json.loads(terurai.read_text(encoding="utf-8"))

    print(f"[hal {halaman}] rasterisasi {args.dpi} DPI")
    img_bytes, mime = rasterisasi(pdf, halaman, gambar, args.dpi, args.jpeg)
    kb = len(img_bytes) / 1024
    print(f"[hal {halaman}] {gambar.name} {kb:.0f} KB, payload base64 ~{kb * 4 / 3:.0f} KB")

    print(f"[hal {halaman}] memanggil {args.model}")
    teks = panggil_vlm(
        img_bytes, bangun_prompt(), model=args.model, base_url=args.base_url,
        api_key=args.api_key, temperature=args.temperature, mime=mime,
        gaya=args.gaya_gambar,
    )
    mentah.write_text(teks, encoding="utf-8")
    data = ambil_json(teks)
    terurai.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    return data


def ekstrak(
    pdf_path: Path,
    out_dir: Path,
    *,
    model: str = MODEL_DEFAULT,
    base_url: str = BASE_URL_DEFAULT,
    api_key: str = "",
    dpi: int = DPI_DEFAULT,
    jpeg: bool = False,
    halaman: str = "all",
    gaya_gambar: str = "openai_objek",
    temperature: float = 0.0,
    offline: bool = False,
) -> dict:
    """Jalankan seluruh alur ekstraksi artefak dan kembalikan dict hasil.

    Fungsi library yang dipakai CLI (`main`) maupun API. Artefak antara tetap
    ditulis ke `out_dir`. `main()` hanya membungkus fungsi ini lalu mencetak
    ringkasan ke layar.
    """
    from types import SimpleNamespace

    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # proses_halaman membaca atribut lewat args-namespace; sediakan yang setara.
    args = SimpleNamespace(
        model=model, base_url=base_url, api_key=api_key, dpi=dpi, jpeg=jpeg,
        temperature=temperature, gaya_gambar=gaya_gambar, offline=offline,
    )

    if halaman == "all":
        daftar = list(range(1, jumlah_halaman(pdf_path) + 1))
    else:
        daftar = [int(x) for x in re.split(r"[,\s]+", str(halaman)) if str(x).strip()]

    per_halaman, temuan = [], []
    for h in daftar:
        data = proses_halaman(pdf_path, h, out_dir, args)
        temuan += validasi(data, h)
        per_halaman.append(data)

    gab = gabung_halaman(per_halaman)
    dosen = ringkas_dosen(gab)

    (out_dir / "dokumen.json").write_text(
        json.dumps(gab, ensure_ascii=False, indent=2), encoding="utf-8")
    (out_dir / "temuan_validasi.json").write_text(
        json.dumps(temuan, ensure_ascii=False, indent=2), encoding="utf-8")
    (out_dir / "per_dosen.json").write_text(
        json.dumps(dosen, ensure_ascii=False, indent=2), encoding="utf-8")

    per_jenis: dict[str, int] = {}
    for t in temuan:
        per_jenis[t["jenis"]] = per_jenis.get(t["jenis"], 0) + 1

    return {
        "dokumen": gab,
        "temuan": temuan,
        "per_dosen": dosen,
        "ringkasan": {
            "halaman_diproses": len(daftar),
            "jumlah_temuan": len(temuan),
            "temuan_per_jenis": per_jenis,
            "jumlah_dosen": len(dosen),
        },
    }


def main() -> int:
    p = argparse.ArgumentParser(description="Ekstraktor artefak dosen berbasis MLLM")
    p.add_argument("pdf", type=Path)
    p.add_argument("-o", "--out", type=Path, default=Path("keluaran_artefak"))
    p.add_argument("--model", default=MODEL_DEFAULT)
    p.add_argument("--base-url", default=BASE_URL_DEFAULT)
    p.add_argument("--api-key", default=API_KEY or os.environ.get("ROUTER_API_KEY", ""))
    p.add_argument("--temperature", type=float, default=0.0)
    p.add_argument("--dpi", type=int, default=DPI_DEFAULT)
    p.add_argument("--jpeg", action="store_true", help="kirim JPEG, payload jauh lebih kecil")
    p.add_argument("--halaman", default="all", help="'all' atau daftar seperti '1,2'")
    p.add_argument(
        "--gaya-gambar",
        default="openai_objek",
        choices=["openai_objek", "openai_teks", "anthropic", "anthropic_messages"],
        help="format blok gambar. Ganti kalau model menjawab 'tidak ada gambar'",
    )
    p.add_argument(
        "--uji-gambar",
        action="store_true",
        help="kirim gambar uji berisi kode rahasia ke ketiga gaya, lalu keluar",
    )
    p.add_argument("--probe", action="store_true", help="uji koneksi teks saja lalu keluar")
    p.add_argument("--offline", action="store_true", help="pakai hal*.json yang sudah ada")
    args = p.parse_args()

    if args.uji_gambar:
        from PIL import Image, ImageDraw

        kode = "MERAH-7391"
        img = Image.new("RGB", (520, 180), "white")
        d = ImageDraw.Draw(img)
        d.text((30, 60), kode, fill="black")
        d.text((30, 100), "kode uji gambar", fill="black")
        buf = args.out
        buf.mkdir(parents=True, exist_ok=True)
        jalur = buf / "uji_gambar.png"
        img.save(jalur, "PNG")
        umpan = jalur.read_bytes()

        print(f"model : {args.model}")
        print(f"kode tersembunyi di gambar: {kode}")
        print("model yang benar-benar menerima gambar akan menyebut kode itu.\n")
        for gaya in ("openai_objek", "openai_teks", "anthropic", "anthropic_messages"):
            print(f"--- gaya: {gaya} ---")
            try:
                jawab = panggil_vlm(
                    umpan,
                    "Sebutkan persis teks yang tertulis pada gambar ini. "
                    "Kalau kamu tidak menerima gambar apa pun, jawab: TIDAK ADA GAMBAR.",
                    model=args.model, base_url=args.base_url, api_key=args.api_key,
                    temperature=0.0, mime="image/png", gaya=gaya, percobaan=1,
                )
                jawab_rapi = " ".join(jawab.split())[:300]
                lolos = kode.lower() in jawab.lower()
                print(f"  {'BERHASIL' if lolos else 'GAGAL'}: {jawab_rapi}")
            except Exception as e:  # noqa: BLE001
                print(f"  GALAT: {e}")
            print()
        print("Pakai gaya yang BERHASIL lewat --gaya-gambar.")
        return 0

    if args.probe:
        import requests

        url = f"{args.base_url.rstrip('/')}/chat/completions"
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        if args.api_key:
            headers["Authorization"] = f"Bearer {args.api_key}"
        else:
            print("PERINGATAN: API key kosong")
        print(f"POST {url}\nmodel: {args.model}")
        r = requests.post(
            url, headers=headers,
            json={"model": args.model, "stream": False,
                  "messages": [{"role": "user", "content": "balas satu kata: siap"}]},
            timeout=120,
        )
        print(f"HTTP {r.status_code}  Content-Type: {r.headers.get('Content-Type')}")
        print(f"panjang badan: {len(r.text)}\n--- badan respons ---")
        print(r.text[:1500] if r.text else "<kosong>")
        return 0

    if not args.pdf.exists():
        raise SystemExit(f"berkas tidak ditemukan: {args.pdf}")

    hasil = ekstrak(
        args.pdf, args.out,
        model=args.model, base_url=args.base_url, api_key=args.api_key,
        dpi=args.dpi, jpeg=args.jpeg, halaman=args.halaman,
        gaya_gambar=args.gaya_gambar, temperature=args.temperature,
        offline=args.offline,
    )
    gab = hasil["dokumen"]
    temuan = hasil["temuan"]

    print()
    print("=" * 72)
    print(f"jenis dokumen   : {gab.get('jenis_dokumen')}")
    print(f"kode formulir   : {gab.get('kode_formulir')}")
    print(f"nomor dokumen   : {gab.get('nomor_dokumen')}")
    print(f"tahun akademik  : {gab.get('tahun_akademik')}")
    print(f"halaman diproses: {hasil['ringkasan']['halaman_diproses']}")
    print()
    print("tanggal:")
    for t in gab["tanggal"]:
        print(f"  {t.get('peran'):<14} {str(t.get('iso_terverifikasi')):<12} {t.get('teks_asli')}")
    print()
    print("orang:")
    for o in gab["orang"]:
        tt = "tulisan tangan" if o.get("tulisan_tangan") else "tercetak"
        print(f"  {o.get('peran'):<20} {o.get('nama'):<32} {str(o.get('nip') or '-'):<20} {tt}")
    print()
    print(f"temuan validasi : {len(temuan)}")
    for j, n in sorted(hasil["ringkasan"]["temuan_per_jenis"].items()):
        print(f"  - {j}: {n}")
    print("=" * 72)
    print(f"artefak tersimpan di {args.out}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())