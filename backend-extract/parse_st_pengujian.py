#!/usr/bin/env python3
"""
Parser Surat Tugas Penguji Tugas Akhir (POLBAN JTK) -> JSON.

File ini HANYA ekstraksi. Keluarannya dikelompokkan PER DOSEN untuk
mengisi dashboard penilaian BKD (satu kartu per dosen).

BEDA MENDASAR dengan parser Pengajaran (parse_sp.py):
- Pengajaran = bordered table: tiap sel punya rect, rentang baris & sel
  tergabung dipulihkan dari rect.
- Pengujian = tabel dengan HANYA garis kolom vertikal (6 rect garis),
  TANPA rect per sel dan tanpa garis baris. Baris dan sel tergabung
  disimpulkan dari posisi teks. Kolom diturunkan dari garis vertikal.

Struktur: satu grup sidang (KoTA) memuat 1-2 mahasiswa yang berbagi satu
Judul dan sepasang Penguji (Penguji 1 & Penguji 2) melalui sel tergabung
vertikal. Nama penguji sering membentang >1 baris teks (nama di atas,
sisa gelar di bawah). Karena itu tiap kolom penguji dibaca SELURUH rentang
y grup, bukan satu baris, supaya nama terbaca utuh.

Bobot SKS menguji TIDAK tercetak di dokumen (aturan BKD di luar surat).
Parser hanya menghitung JUMLAH mahasiswa yang diuji per dosen.

Pakai:
    python parse_st_pengujian.py surat.pdf
    python parse_st_pengujian.py surat.pdf -o hasil.json
    python parse_st_pengujian.py surat.pdf --strict
"""
import argparse, hashlib, json, re, sys
from collections import defaultdict
from dataclasses import dataclass, field, asdict

import pdfplumber

# --- batas kolom (pt), diturunkan dari 6 garis vertikal lampiran. ---
# Kalibrasi ulang bila layout berubah.
COLS = {
    "kota":  (61, 95),
    "nim":   (100, 151),
    "nama":  (156, 284),
    "judul": (289, 554),
    "p1":    (559, 676),
    "p2":    (682, 801),
}
TOL = 2.0
NIM_RE  = re.compile(r"^\d{9}$")
KOTA_RE = re.compile(r"^\d{3}$")          # nomor grup: 301, 402, dst



# --- metadata surat (halaman 1). Format SK POLBAN standar. ---
_BULAN = {"januari":1,"februari":2,"maret":3,"april":4,"mei":5,"juni":6,
          "juli":7,"agustus":8,"september":9,"oktober":10,"november":11,"desember":12}
_DTE = r"\d{1,2}\s+[A-Za-z]+\s+\d{4}"

def _tgl_iso(t):
    if not t: return None
    m = re.match(r"(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})", t.strip())
    if not m: return None
    d, bln, th = m.groups()
    b = _BULAN.get(bln.lower())
    return f"{th}-{b:02d}-{int(d):02d}" if b else None

def _cari(pat, teks, g=1):
    m = re.search(pat, teks, re.I)
    return re.sub(r"\s+", " ", m.group(g)).strip() if m else None

def parse_metadata(pdf):
    """Ekstrak metadata surat dari teks halaman 1. Field yg tak ketemu -> None."""
    t = pdf.pages[0].extract_text() or ""
    ta = _cari(r"Tahun\s*Akademik\s*(\d{4}\s*/\s*\d{4})", t)
    return {
        "nomor":               _cari(r"Nomor\s*:\s*([0-9A-Za-z./_-]+)", t),
        "tentang":             _cari(r"Tentang\s*\n\s*(.+)", t),
        "program_studi":       "Sarjana Terapan Teknik Informatika",
        "tahun_akademik":      re.sub(r"\s*/\s*", "/", ta) if ta else None,
        "angkatan":            _cari(r"angkatan\s*(\d{4})", t),
        "berlaku_sejak":       (bsej := _cari(r"berlaku sejak tanggal\s+(" + _DTE + ")", t)),
        "berlaku_sejak_iso":   _tgl_iso(bsej),
        "berlaku_sampai":      (bsam := _cari(r"sampai dengan\s+(" + _DTE + ")", t)),
        "berlaku_sampai_iso":  _tgl_iso(bsam),
        "tanggal_ditetapkan":  (btet := _cari(r"Pada Tanggal\s*:\s*(" + _DTE + ")", t)),
        "tanggal_ditetapkan_iso": _tgl_iso(btet),
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


def _kunci_nama(nama: str) -> str:
    """Normalisasi nama penguji jadi kunci join lintas dokumen.
    Buang gelar depan/belakang, huruf kecil, rapikan spasi.
    RAPUH thd kembar-nama & variasi ejaan gelar -> ditulis sbg limitasi."""
    s = nama
    s = re.sub(r"^\s*(Dr\.?|Drs\.?|Ir\.?|Prof\.?)\s+", "", s, flags=re.I)
    # buang segala gelar setelah koma pertama
    if "," in s:
        s = s.split(",")[0]
    s = re.sub(r"\s+", " ", s).strip().lower()
    return s


_DEG = re.compile(r"^(S\.[A-Za-z]+\.?|M\.[A-Za-z]+\.?|Ph\.?D\.?|BSC[SET]*\.?|"
                  r"B\.[A-Za-z]+\.?|A\.Md\.?|M\.Info\.Sys\.?)[,.]*$", re.I)

def _clean_penguji(t: str) -> str:
    """Buang prefiks sampah di awal (gelar bocoran dari grup atas, atau
    label kolom 'PENGUJI 1/2'), lalu rapikan koma menggantung."""
    toks = t.split()
    # buang 'PENGUJI 1' / 'PENGUJI 2' di depan
    while len(toks) >= 2 and toks[0].upper() == "PENGUJI" and toks[1].isdigit():
        toks = toks[2:]
    # buang token gelar di depan (nama tidak pernah diawali gelar belakang)
    while toks and _DEG.match(toks[0]):
        toks = toks[1:]
    s = " ".join(toks)
    s = re.sub(r"\s+,", ",", s).strip().strip(",").strip()
    return s

@dataclass
class Sidang:
    halaman: int
    kota: str = ""
    judul: str = ""
    penguji1: str = ""
    penguji2: str = ""
    mahasiswa: list = field(default_factory=list)   # [{"nim","nama"}]
    catatan: list = field(default_factory=list)
    @property
    def valid(self): return not self.catatan


def _words_in(words, col, y0, y1):
    """Kata pada kolom `col` dengan pusat-y dalam [y0, y1), urut baca."""
    sel = []
    for w in words:
        cx = (w["x0"] + w["x1"]) / 2
        cy = (w["top"] + w["bottom"]) / 2
        if _col_of(cx) == col and y0 <= cy < y1:
            sel.append(w)
    sel.sort(key=lambda w: (round(w["top"]), w["x0"]))
    return re.sub(r"\s+", " ", " ".join(w["text"] for w in sel)).strip()


def _lines_in(words, col, y0, y1):
    """Kelompokkan kata kolom `col` [y0,y1) menjadi baris teks (urut baca)."""
    # acuan y = w["top"], konsisten dengan pusat grup yg dihitung dari top NIM.
    # Mencampur top dgn (top+bottom)/2 menggeser baris ~setengah tinggi huruf
    # dan bisa membalik penetapan baris batas ke grup yg salah.
    ws = [w for w in words
          if _col_of((w["x0"]+w["x1"])/2) == col and y0 <= w["top"] < y1]
    ws.sort(key=lambda w: (round(w["top"]), w["x0"]))
    lines = []
    for w in ws:
        yc = w["top"]
        if lines and abs(yc - lines[-1]["y"]) <= 4:
            lines[-1]["t"] += " " + w["text"]
        else:
            lines.append({"y": yc, "t": w["text"]})
    return lines


def _read_merged(words, col, y0, y1, centers):
    """Baca kolom sel-tergabung (judul/penguji). Tiap baris teks ditetapkan
    ke pusat klaster mahasiswa grup TERDEKAT, lalu digabung per grup. Konten
    sel terpusat pada klaster, jadi tiap baris paling dekat ke grupnya sendiri;
    ini menghindari batas keras yang memotong nama/judul multi-baris."""
    bucket = {nomor: [] for _, nomor in centers}
    for ln in _lines_in(words, col, y0, y1):
        nomor = min(centers, key=lambda c: abs(c[0] - ln["y"]))[1]
        bucket[nomor].append(ln)
    return {nomor: re.sub(r"\s+", " ",
                          " ".join(l["t"] for l in sorted(bucket[nomor], key=lambda x: x["y"])))
                   .strip()
            for nomor in bucket}


def parse_page(page, pageno):
    words = page.extract_words()

    # 1) anchor grup: label "KoTA" di kolom kota, pasangkan dgn nomor grup
    kota_labels = []   # (y_top, nomor)
    for w in words:
        cx = (w["x0"] + w["x1"]) / 2
        if _col_of(cx) != "kota":
            continue
        if w["text"].strip().lower() == "kota":
            kota_labels.append([w["top"], None])
    # nomor grup (301,...) ditempel ke label terdekat di atasnya
    nums = [(w["top"], w["text"].strip()) for w in words
            if _col_of((w["x0"]+w["x1"])/2) == "kota" and KOTA_RE.match(w["text"].strip())]
    for ynum, num in nums:
        # label terdekat dengan |y| minimal
        if not kota_labels:
            continue
        best = min(kota_labels, key=lambda kl: abs(kl[0] - ynum))
        best[1] = num
    kota_labels = [kl for kl in kota_labels if kl[1]]     # buang label tanpa nomor (header)
    kota_labels.sort()
    if not kota_labels:
        return []

    # 2) NIM = baris mahasiswa
    nims = []
    for w in words:
        cx = (w["x0"] + w["x1"]) / 2
        if _col_of(cx) == "nim" and NIM_RE.match(w["text"].strip()):
            nims.append((w["top"], w["text"].strip()))
    nims.sort()

    # 3) assign tiap NIM ke label KoTA terdekat
    label_ys = [kl[0] for kl in kota_labels]
    grup = {kl[1]: {"y": kl[0], "nim": []} for kl in kota_labels}
    nomor_by_label = {kl[0]: kl[1] for kl in kota_labels}
    for ynim, nim in nims:
        ly = min(label_ys, key=lambda ly: abs(ly - ynim))
        grup[nomor_by_label[ly]]["nim"].append((ynim, nim))

    # 4) grup diurut menurut baris mahasiswa. Judul dibaca dgn batas longgar
    #    (midpoint klaster mahasiswa) supaya judul multi-baris tidak terpotong.
    #    Penguji dirakit per-kolom (baris gelar nempel ke nama di atasnya) lalu
    #    dicocokkan URUT ke grup, sehingga nama 2-baris utuh tanpa bocor.
    centers = []                                      # (center_y, nomor)
    stud = {}                                         # nomor -> [(y,nim)]
    for nomor, g in grup.items():
        ys = [y for y, _ in g["nim"]]
        if ys:
            centers.append((sum(ys) / len(ys), nomor))
            stud[nomor] = sorted(g["nim"])
    centers.sort()
    if not centers:
        return []

    # region tabel: dari sedikit di atas mahasiswa pertama sampai bawah
    # mahasiswa terakhir + margin. Header kolom & footer tanda tangan di luar.
    tbl_y0 = min(c for c, _ in centers) - 14
    tbl_y1 = max(max(y for y, _ in stud[nomor]) for _, nomor in centers) + 16
    judul = _read_merged(words, "judul", tbl_y0, tbl_y1, centers)
    p1    = _read_merged(words, "p1",    tbl_y0, tbl_y1, centers)
    p2    = _read_merged(words, "p2",    tbl_y0, tbl_y1, centers)

    sidangs = []
    for _, nomor in centers:
        s = Sidang(halaman=pageno, kota=f"KoTA{nomor}")
        s.judul    = judul.get(nomor, "")
        s.penguji1 = _clean_penguji(p1.get(nomor, ""))
        s.penguji2 = _clean_penguji(p2.get(nomor, ""))
        for ynim, nim in stud[nomor]:
            s.mahasiswa.append({"nim": nim,
                                "nama": _words_in(words, "nama", ynim - 8, ynim + 8)})
        sidangs.append(s)
    return sidangs


def validate(s: Sidang):
    c = s.catatan
    if not s.mahasiswa:
        c.append("tidak ada mahasiswa")
    for m in s.mahasiswa:
        if not NIM_RE.match(m["nim"]):
            c.append(f"NIM janggal: {m['nim']!r}")
        if not m["nama"]:
            c.append(f"nama mahasiswa kosong (NIM {m['nim']})")
    if not s.penguji1: c.append("penguji1 kosong")
    if not s.penguji2: c.append("penguji2 kosong")
    if s.penguji1 and s.penguji2 and \
       _kunci_nama(s.penguji1) == _kunci_nama(s.penguji2):
        c.append("penguji1 == penguji2")
    if not s.judul: c.append("judul kosong")


def parse_pdf(path):
    raw = open(path, "rb").read()
    sidangs = []
    with pdfplumber.open(path) as pdf:
        meta = parse_metadata(pdf)
        for i, page in enumerate(pdf.pages, 1):
            sidangs.extend(parse_page(page, i))
    if not sidangs:
        raise RuntimeError(
            "0 grup sidang terekstrak. Layout kemungkinan berubah "
            "(batas kolom COLS / anchor KoTA tidak cocok).")
    for s in sidangs:
        validate(s)
    return raw, meta, sidangs


def per_dosen(sidangs):
    """Balik indeks: dari per-sidang -> per-dosen (untuk dashboard)."""
    dosen = {}
    for s in sidangs:
        if not s.valid:
            continue
        for peran, nama in (("Penguji 1", s.penguji1), ("Penguji 2", s.penguji2)):
            k = _kunci_nama(nama)
            d = dosen.setdefault(k, {"nama": nama, "kunci_nama": k, "penugasan": []})
            for m in s.mahasiswa:
                d["penugasan"].append({
                    "jenis": "menguji",
                    "sumber": "ST Pengujian",
                    "peran": peran,
                    "kota": s.kota,
                    "nim": m["nim"],
                    "nama_mahasiswa": m["nama"],
                    "judul": s.judul,
                })
    out = sorted(dosen.values(), key=lambda d: d["kunci_nama"])
    for d in out:
        d["jumlah_menguji"] = len(d["penugasan"])
    return out


def bangun_hasil(path, nama_asli=None):
    """Rakit dict hasil lengkap dari PDF. Dipakai CLI maupun API.

    `nama_asli` mengisi field surat.sumber_file bila diberikan (mis. nama file
    upload asli); default memakai basename `path`.
    """
    raw, meta, sidangs = parse_pdf(path)
    ok  = [s for s in sidangs if s.valid]
    bad = [s for s in sidangs if not s.valid]
    dosen = per_dosen(sidangs)

    data = {
        "surat": {
            "sumber_file": nama_asli or path.replace("\\", "/").split("/")[-1],
            "sha256": hashlib.sha256(raw).hexdigest(),
            **meta,
        },
        "ringkasan": {
            "grup_sidang": len(sidangs),
            "valid": len(ok),
            "ditolak": len(bad),
            "total_mahasiswa": sum(len(s.mahasiswa) for s in ok),
            "jumlah_dosen": len(dosen),
        },
        "beban_dosen": dosen,
        "sidang": [
            {**{k: v for k, v in asdict(s).items() if k != "catatan"},
             "status": "OK"} for s in ok
        ],
    }
    if bad:
        data["ditolak"] = [asdict(s) for s in bad]
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
        print(f"grup={r['grup_sidang']} valid={r['valid']} ditolak={r['ditolak']} "
              f"mhs={r['total_mahasiswa']} dosen={r['jumlah_dosen']} -> {a.out}",
              file=sys.stderr)
        for s in bad:
            print(f"  [hal {s.halaman}] {s.kota}: {'; '.join(s.catatan)}", file=sys.stderr)
    else:
        print(js)
    if a.strict and bad:
        sys.exit(1)


if __name__ == "__main__":
    main()