#!/usr/bin/env python3
"""
Parser Surat Tugas / SK Pembimbing POLBAN JTK -> JSON.

Melayani DUA jenis surat bimbingan sekaligus; jenisnya dideteksi dari halaman 1:

  1. ST Pembimbing PKL      "PEMBIMBING PRAKTIK KERJA LAPANGAN"
     Tabel 6 kolom: No | NIM | Nama | Instansi | Judul | Pembimbing
     Satu baris = satu mahasiswa; instansi & pembimbing berupa sel tergabung.

  2. SK Pembimbing Tugas Akhir  "PEMBIMBING TUGAS AKHIR"  (D3 & Sarjana Terapan)
     Tabel 6 kolom: No Kelompok | NIM | NAMA | TOPIK | PEMBIMBING 1 | PEMBIMBING 2
     Satu kelompok = beberapa mahasiswa; kelompok, topik, dan kedua pembimbing
     berupa sel tergabung yang membentang lintas mahasiswa.

Ekstraksi saja. Output dikelompokkan PER DOSEN (pembimbing) untuk dashboard BKD.

Jalur PKL memakai kalibrasi kolom tetap (COLS). Jalur TA membaca posisi kolom
dari garis bingkai tabel, sebab lampiran D3 dan Sarjana Terapan berbeda lebar
kolom — parser tidak boleh terikat satu layout.

Struktur tabel PKL (bordered, 6 kolom): No | NIM | Nama | Instansi | Judul | Pembimbing.
- Batas baris diambil dari GARIS PEMISAH horizontal kolom "No" (rect tipis h<2).
- NIM/Nama/Judul: per-mahasiswa, satu baris, dibaca dalam rentang baris.
- Instansi/Pembimbing: SEL TERGABUNG lintas mahasiswa satu instansi (kolom ini
  tak punya garis pemisah sendiri). Tiap teks-blok ditetapkan ke mahasiswa yang
  pusat-baris-nya terdekat (nearest-center), sama seperti penguji di Pengujian.

Kalibrasi COLS terkunci ke layout lampiran ini; bila format berubah, parser
melempar error, bukan diam menghasilkan sampah.
"""
import argparse, hashlib, json, re, sys
from dataclasses import dataclass, field, asdict

import pdfplumber

COLS = {
    "no":       (47, 73),
    "nim":      (79, 129),
    "nama":     (135, 254),
    "instansi": (260, 367),
    "judul":    (373, 666),
    "pemb":     (671, 808),
}
TOL = 2.0
NIM_RE = re.compile(r"^\d{9}$")

# --- metadata surat (halaman 1), format SK POLBAN standar ---
_BULAN = {"januari":1,"februari":2,"maret":3,"april":4,"mei":5,"juni":6,
          "juli":7,"agustus":8,"september":9,"oktober":10,"november":11,"desember":12}
_DTE = r"\d{1,2}\s+[A-Za-z]+\s+\d{4}"

def _tgl_iso(t):
    if not t: return None
    m = re.match(r"(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})", t.strip())
    if not m: return None
    d, bln, th = m.groups(); b = _BULAN.get(bln.lower())
    return f"{th}-{b:02d}-{int(d):02d}" if b else None

def _cari(pat, teks, g=1):
    m = re.search(pat, teks, re.I)
    return re.sub(r"\s+", " ", m.group(g)).strip() if m else None

def parse_metadata(pdf):
    t = pdf.pages[0].extract_text() or ""
    ta = _cari(r"Tahun\s*Akademik\s*(\d{4}\s*/\s*\d{4})", t)
    return {
        "nomor":               _cari(r"Nomor\s*:?\s*([0-9A-Za-z./_-]+)", t),
        "tentang":             _cari(r"Tentang\s*\n\s*(.+)", t),
        "program_studi":       "Sarjana Terapan Teknik Informatika",
        "tahun_akademik":      re.sub(r"\s*/\s*", "/", ta) if ta else None,
        "angkatan":            _cari(r"angkatan\s*(\d{4})", t),
        "berlaku_sejak":       (a := _cari(r"berlaku sejak tanggal\s+(" + _DTE + ")", t)),
        "berlaku_sejak_iso":   _tgl_iso(a),
        "berlaku_sampai":      (b := _cari(r"sampai dengan\s+(" + _DTE + ")", t)),
        "berlaku_sampai_iso":  _tgl_iso(b),
        "tanggal_ditetapkan":  (c := _cari(r"Pada Tanggal\s*:\s*(" + _DTE + ")", t)),
        "tanggal_ditetapkan_iso": _tgl_iso(c),
        "kota_ditetapkan":     _cari(r"Ditetapkan di\s*:\s*(.+)", t),
        "penandatangan":       _cari(r"\n([A-Z][A-Z .,]+(?:S\.[A-Za-z.]+|M\.[A-Za-z.]+)[.,]?)\s*\n\s*NIP", t),
        "nip_penandatangan":   _cari(r"NIP\.?\s*(\d{15,20})", t),
        "jabatan_penandatangan": "Ketua Jurusan Teknik Komputer dan Informatika" if re.search(r"Ketua", t, re.I) else None,
    }


def _col_of(x):
    for name, (a, b) in COLS.items():
        if a - TOL <= x < b + TOL:
            return name
    return None

def _fix_split(t: str) -> str:
    """Gabungkan huruf tunggal yang terpisah spasi akibat artefak render:
    'A rdhian'->'Ardhian', 'M .T.'->'M.T.', 'C holid'->'Cholid'."""
    return re.sub(r"\b([A-Za-z]) (?=[a-z.])", r"\1", t)

def _kunci_nama(nama: str) -> str:
    s = re.sub(r"^\s*(Dr\.?|Drs\.?|Ir\.?|Prof\.?)\s+", "", nama, flags=re.I)
    if "," in s: s = s.split(",")[0]
    return re.sub(r"\s+", " ", s).strip().lower()

def _clean_pemb(t: str) -> str:
    t = _fix_split(t)
    return re.sub(r"\s+,", ",", t).strip().strip(",").strip()


def _text_in(words, col, y0, y1):
    ws = [w for w in words
          if _col_of((w["x0"]+w["x1"])/2) == col and y0 <= w["top"] < y1]
    ws.sort(key=lambda w: (round(w["top"]), w["x0"]))
    return _fix_split(re.sub(r"\s+", " ", " ".join(w["text"] for w in ws)).strip())

def _lines_in(words, col, y0, y1):
    ws = [w for w in words
          if _col_of((w["x0"]+w["x1"])/2) == col and y0 <= w["top"] < y1]
    ws.sort(key=lambda w: (round(w["top"]), w["x0"]))
    lines = []
    for w in ws:
        if lines and abs(w["top"] - lines[-1]["y"]) <= 4:
            lines[-1]["t"] += " " + w["text"]
        else:
            lines.append({"y": w["top"], "t": w["text"]})
    return lines

def _blocks(words, col, y0, y1, gap=15):
    """Kelompokkan baris kolom sel-tergabung menjadi blok (nama/instansi)."""
    blocks = []
    for ln in _lines_in(words, col, y0, y1):
        if blocks and ln["y"] - blocks[-1]["y_last"] <= gap:
            blocks[-1]["t"] += " " + ln["t"]; blocks[-1]["y_last"] = ln["y"]
        else:
            blocks.append({"y0": ln["y"], "y_last": ln["y"], "t": ln["t"]})
    for b in blocks:
        b["yc"] = (b["y0"] + b["y_last"]) / 2
    return blocks

def _nearest(blocks, yc):
    if not blocks: return ""
    return min(blocks, key=lambda b: abs(b["yc"] - yc))["t"]


@dataclass
class Bimbingan:
    halaman: int
    nim: str = ""
    nama: str = ""
    instansi: str = ""
    judul: str = ""
    pembimbing: str = ""
    catatan: list = field(default_factory=list)
    @property
    def valid(self): return not self.catatan


def parse_page(page, pageno):
    words = page.extract_words()
    # garis pemisah baris dari kolom No (rect tipis horizontal)
    seps = sorted({round(r["top"], 1) for r in page.rects
                   if abs(r["x0"] - COLS["no"][0] + 5) < 4  # ~x0 42
                   and (r["bottom"] - r["top"]) < 2
                   and (r["x1"] - r["x0"]) > 15})
    if len(seps) < 3:
        return []
    rows = list(zip(seps, seps[1:]))          # (y0,y1) tiap sel baris
    # region tabel utk baca kolom tergabung
    # pembimbing = SEL MERGED lintas beberapa mahasiswa; kolom ini punya
    # garis pemisah sendiri (lebih sedikit dari kolom No). Tiap sel merged
    # dibaca utuh, lalu mahasiswa ditetapkan ke sel yg memuat pusat barisnya.
    pseps = sorted({round(r["top"], 1) for r in page.rects
                    if abs(r["x0"] - COLS["pemb"][0] + 5) < 7   # ~x0 665-671
                    and (r["bottom"] - r["top"]) < 2
                    and (r["x1"] - r["x0"]) > 25})
    pcells = []                               # (y0, y1, teks_pembimbing)
    if len(pseps) >= 2:
        for a_, b_ in zip(pseps, pseps[1:]):
            pcells.append((a_, b_, _clean_pemb(_text_in(words, "pemb", a_, b_))))

    def _pemb_for(yc):
        for a_, b_, txt in pcells:
            if a_ <= yc < b_:
                return txt
        return ""

    out = []
    for y0, y1 in rows:
        nim = _text_in(words, "nim", y0, y1)
        if not NIM_RE.match(nim):
            continue                          # baris header/kosong
        b = Bimbingan(halaman=pageno, nim=nim)
        b.nama       = _text_in(words, "nama", y0, y1)
        b.judul      = _text_in(words, "judul", y0, y1)
        b.instansi   = _text_in(words, "instansi", y0, y1)
        b.pembimbing = _pemb_for((y0 + y1) / 2)
        out.append(b)
    return out


# ===========================================================================
# Jalur SK Pembimbing Tugas Akhir
# ===========================================================================

def _gabung_dekat(nilai, jarak=4.0):
    """Rapatkan koordinat kembar (garis tebal digambar sebagai 2 rect)."""
    out = []
    for v in sorted(nilai):
        if not out or v - out[-1] > jarak:
            out.append(v)
    return out

def _batas_kolom(page):
    """Posisi x garis bingkai vertikal -> batas antar kolom tabel."""
    tegak = [r for r in page.rects
             if (r["x1"] - r["x0"]) < 2 and (r["bottom"] - r["top"]) > 20]
    return _gabung_dekat({round(r["x0"], 1) for r in tegak})

def _batas_sel(page, x0, x1):
    """Batas atas-bawah tiap sel milik SATU kolom.

    Garis horizontal hanya dihitung bila membentang menutupi kolom tersebut,
    sehingga sel tergabung (yang tak punya garis pemisah di dalamnya) terbaca
    sebagai satu sel tinggi.
    """
    ys = _gabung_dekat({round(r["top"], 1) for r in page.rects
                        if (r["bottom"] - r["top"]) < 2
                        and r["x0"] <= x0 + 3 and r["x1"] >= x1 - 3}, 2.0)
    return list(zip(ys, ys[1:]))

def _kata_di(words, x0, x1, y0, y1):
    ws = [w for w in words
          if x0 - 2 <= (w["x0"] + w["x1"]) / 2 < x1 + 2 and y0 <= w["top"] < y1]
    ws.sort(key=lambda w: (round(w["top"]), w["x0"]))
    return ws

def _teks_di(words, x0, x1, y0, y1):
    ws = _kata_di(words, x0, x1, y0, y1)
    return _fix_split(re.sub(r"\s+", " ", " ".join(w["text"] for w in ws)).strip())

def _baris_di(words, x0, x1, y0, y1):
    """Kata -> baris teks (kata dengan `top` berdekatan dianggap satu baris)."""
    baris = []
    for w in _kata_di(words, x0, x1, y0, y1):
        if baris and abs(w["top"] - baris[-1]["y"]) <= 4:
            baris[-1]["t"] += " " + w["text"]
        else:
            baris.append({"y": w["top"], "t": w["text"]})
    for b in baris:
        b["t"] = _fix_split(re.sub(r"\s+", " ", b["t"]).strip())
    return baris

def _sel_pada(sel, words, x0, x1, y):
    """Teks sel kolom ini yang memuat ordinat y (untuk sel tergabung)."""
    for a, b in sel:
        if a <= y < b:
            return _teks_di(words, x0, x1, a, b)
    return ""

def _peran_kolom(judul: str):
    j = judul.lower()
    if "nim" in j: return "nim"
    if "nama" in j: return "nama"
    if "topik" in j or "judul" in j: return "judul"
    if "pembimbing 1" in j or "pembimbing1" in j: return "pemb1"
    if "pembimbing 2" in j or "pembimbing2" in j: return "pemb2"
    if "kelompok" in j: return "kelompok"
    return None


@dataclass
class BimbinganTA:
    halaman: int
    nim: str = ""
    nama: str = ""
    kelompok: str = ""
    judul: str = ""
    pembimbing1: str = ""
    pembimbing2: str = ""
    catatan: list = field(default_factory=list)
    @property
    def valid(self): return not self.catatan


def parse_page_ta(page, pageno):
    words = page.extract_words()
    xs = _batas_kolom(page)
    if len(xs) < 5:
        return []                                   # halaman tanpa tabel lampiran
    kolom = list(zip(xs, xs[1:]))
    y_atas = min(r["top"] for r in page.rects)
    y_bawah = max(r["bottom"] for r in page.rects)

    # Kolom NIM dikenali dari isinya (paling banyak memuat NIM), bukan dari
    # urutan kolom — kepala tabel baru bisa dibaca setelah batas data diketahui.
    per_kolom = [_baris_di(words, a, b, y_atas, y_bawah) for a, b in kolom]
    skor = [sum(1 for l in br if NIM_RE.match(l["t"])) for br in per_kolom]
    if max(skor, default=0) == 0:
        return []
    i_nim = skor.index(max(skor))
    nim_baris = [l for l in per_kolom[i_nim] if NIM_RE.match(l["t"])]

    # Kepala tabel = segala teks di atas baris NIM pertama
    y_kepala = nim_baris[0]["y"]
    peran = {}
    for i, (a, b) in enumerate(kolom):
        p = _peran_kolom(_teks_di(words, a, b, y_atas, y_kepala))
        if p and p not in peran:
            peran[p] = i
    peran["nim"] = i_nim
    if "nama" not in peran or ("pemb1" not in peran and "pemb2" not in peran):
        raise RuntimeError(f"kepala tabel lampiran tak dikenali (halaman {pageno}); "
                           f"kolom terbaca: {sorted(peran)}")

    sel = {p: _batas_sel(page, *kolom[i]) for p, i in peran.items()}

    # Rentang milik tiap mahasiswa: sel kolom NIM, dipotong lagi di tengah-tengah
    # antar-NIM bila satu sel memuat beberapa NIM (lampiran D3 menggabung NIM
    # satu kelompok dalam satu sel, lampiran Sarjana Terapan tidak).
    def _rentang(k):
        y = nim_baris[k]["y"]
        a, b = next(((a, b) for a, b in sel["nim"] if a <= y < b), (y - 2, y_bawah))
        if k > 0 and a <= nim_baris[k - 1]["y"] < b:
            a = (nim_baris[k - 1]["y"] + y) / 2
        if k + 1 < len(nim_baris) and a <= nim_baris[k + 1]["y"] < b:
            b = (y + nim_baris[k + 1]["y"]) / 2
        return a, b

    out = []
    for k, ln in enumerate(nim_baris):
        y0, y1 = _rentang(k)
        b = BimbinganTA(halaman=pageno, nim=ln["t"])
        # nama dibaca per rentang mahasiswa (bisa lebih dari satu baris)
        a_, b_ = kolom[peran["nama"]]
        b.nama = _teks_di(words, a_, b_, y0, y1)
        for p, atr in (("kelompok", "kelompok"), ("judul", "judul"),
                       ("pemb1", "pembimbing1"), ("pemb2", "pembimbing2")):
            if p in peran:
                nilai = _sel_pada(sel[p], words, *kolom[peran[p]], ln["y"] + 1)
                setattr(b, atr, _clean_pemb(nilai) if p.startswith("pemb") else nilai)
        out.append(b)
    return out


def validate_ta(b: BimbinganTA):
    c = b.catatan
    if not NIM_RE.match(b.nim): c.append(f"NIM janggal: {b.nim!r}")
    if not b.nama: c.append("nama mahasiswa kosong")
    if not b.judul: c.append("topik kosong")
    if not b.pembimbing1 and not b.pembimbing2: c.append("pembimbing kosong")


def per_dosen_ta(rows):
    dosen = {}
    for b in rows:
        if not b.valid: continue
        for nama, peran in ((b.pembimbing1, "Pembimbing 1"),
                            (b.pembimbing2, "Pembimbing 2")):
            if not nama: continue
            k = _kunci_nama(nama)
            d = dosen.setdefault(k, {"nama": nama, "kunci_nama": k, "penugasan": []})
            d["penugasan"].append({
                "jenis": "membimbing_ta",
                "sumber": "SK Pembimbing Tugas Akhir",
                "peran": peran,
                "kelompok": b.kelompok,
                "nim": b.nim, "nama_mahasiswa": b.nama, "judul": b.judul,
            })
    out = sorted(dosen.values(), key=lambda d: d["kunci_nama"])
    for d in out:
        d["jumlah_membimbing"] = len(d["penugasan"])
    return out


def validate(b: Bimbingan):
    c = b.catatan
    if not NIM_RE.match(b.nim): c.append(f"NIM janggal: {b.nim!r}")
    if not b.nama: c.append("nama kosong")
    if not b.judul: c.append("judul kosong")
    if not b.pembimbing: c.append("pembimbing kosong")


def deteksi_jenis(pdf) -> str:
    """'ta' bila SK Pembimbing Tugas Akhir, selain itu 'pkl'."""
    t = re.sub(r"\s+", " ", pdf.pages[0].extract_text() or "")
    return "ta" if re.search(r"PEMBIMBING\s+TUGAS\s+AKHIR", t, re.I) else "pkl"


def parse_pdf(path):
    raw = open(path, "rb").read()
    rows = []
    with pdfplumber.open(path) as pdf:
        jenis = deteksi_jenis(pdf)
        meta = parse_metadata(pdf)
        baca = parse_page_ta if jenis == "ta" else parse_page
        for i, page in enumerate(pdf.pages, 1):
            rows.extend(baca(page, i))
    if not rows:
        raise RuntimeError("0 baris terekstrak. Layout kemungkinan berubah "
                           "(kolom / garis pemisah tidak cocok).")
    periksa = validate_ta if jenis == "ta" else validate
    for b in rows:
        periksa(b)
    return raw, meta, rows, jenis


def per_dosen(rows):
    dosen = {}
    for b in rows:
        if not b.valid: continue
        k = _kunci_nama(b.pembimbing)
        d = dosen.setdefault(k, {"nama": b.pembimbing, "kunci_nama": k, "penugasan": []})
        d["penugasan"].append({
            "jenis": "membimbing_pkl",
            "sumber": "ST Pembimbing PKL",
            "nim": b.nim, "nama_mahasiswa": b.nama,
            "instansi": b.instansi, "judul": b.judul,
        })
    out = sorted(dosen.values(), key=lambda d: d["kunci_nama"])
    for d in out:
        d["jumlah_membimbing"] = len(d["penugasan"])
    return out


def bangun_hasil(path, nama_asli=None):
    """Rakit dict hasil lengkap dari PDF. Dipakai CLI maupun API.

    `nama_asli` mengisi field surat.sumber_file bila diberikan (mis. nama file
    upload asli); default memakai basename `path`.
    """
    raw, meta, rows, jenis = parse_pdf(path)
    ok  = [b for b in rows if b.valid]
    bad = [b for b in rows if not b.valid]
    dosen = per_dosen_ta(rows) if jenis == "ta" else per_dosen(rows)
    ringkasan = {"jenis_bimbingan": jenis, "mahasiswa": len(rows), "valid": len(ok),
                 "ditolak": len(bad), "jumlah_dosen": len(dosen)}
    if jenis == "ta":
        ringkasan["kelompok"] = len({b.kelompok for b in ok if b.kelompok})
    data = {
        "surat": {"sumber_file": nama_asli or path.replace("\\", "/").split("/")[-1],
                  "jenis_bimbingan": jenis,
                  "sha256": hashlib.sha256(raw).hexdigest(), **meta},
        "ringkasan": ringkasan,
        "beban_dosen": dosen,
        "mahasiswa": [{**{k: v for k, v in asdict(b).items() if k != "catatan"},
                       "status": "OK"} for b in ok],
    }
    if bad:
        data["ditolak"] = [asdict(b) for b in bad]
    return data, bad


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf"); ap.add_argument("-o", "--out")
    ap.add_argument("--strict", action="store_true")
    a = ap.parse_args()
    data, bad = bangun_hasil(a.pdf)
    js = json.dumps(data, ensure_ascii=False, indent=2)
    if a.out:
        open(a.out, "w", encoding="utf-8").write(js)
        r = data["ringkasan"]
        print(f"mhs={r['mahasiswa']} valid={r['valid']} ditolak={r['ditolak']} "
              f"dosen={r['jumlah_dosen']} -> {a.out}", file=sys.stderr)
        for b in bad:
            print(f"  [hal {b.halaman}] {b.nim}: {'; '.join(b.catatan)}", file=sys.stderr)
    else:
        print(js)
    if a.strict and bad:
        sys.exit(1)


if __name__ == "__main__":
    main()