#!/usr/bin/env python3
"""
Parser Surat Penugasan Pengajaran (POLBAN JTK) -> JSON.

File ini HANYA ekstraksi. Semua logika perhitungan ada di `beban.py`.
Dipisah karena parser rapuh terhadap perubahan layout PDF dan akan sering
disentuh, sedangkan aturan hitung mengacu pedoman BKD dan harus stabil.

Yang diekstrak adalah BEBAN SKS MENGAJAR (TE/PR) per dosen per kelas.
Kolom "SKS" pada lampiran adalah bobot KOMPONEN yang dipegang baris itu
(selalu = TE+PR baris tsb), bukan bobot MK. Disimpan sebagai `sks_slot`.
Bobot MK direkonstruksi di `beban.py` dengan max(TE) + max(PR) antar dosen;
terverifikasi konsisten di 26/26 MK pada SP 408/KO/AK.04.01/2025.

Metadata halaman 1 diekstrak sebagai PRE-FILL saja; wajib dikonfirmasi
admin lewat form sebelum dipakai.

Perhitungan beban dari hasil parse Surat Penugasan.

TIGA ANGKA YANG BERBEDA, jangan dicampur:

  bobot_mk        bobot kurikulum MK  = max(TE antar dosen) + max(PR antar dosen)
                  Kolom SKS di lampiran BUKAN ini. Kolom SKS = bobot komponen
                  yang dipegang baris itu; sama dengan bobot MK hanya bila
                  satu dosen memegang seluruh komponen.

  beban_tercatat  jumlah mentah semua baris milik dosen. Deterministik,
                  bisa dicocokkan mata ke PDF. Ini yang biasa dijumlah asesor
                  dan ini yang menyebabkan overstatement.

  beban_efektif   beban_tercatat setelah dibagi jumlah dosen pada komponen
                  yang sama (team teaching, pedoman BKD).

Semua hitung internal memakai Fraction. Proyek 4 dipegang 3 dosen -> 2/3,
float akan merusak invarian rekonstruksi. Konversi ke float HANYA saat
serialisasi JSON, setelah validasi selesai.

Pakai:
    python parse_sp.py surat.pdf                 # JSON ke stdout
    python parse_sp.py surat.pdf -o hasil.json
    python parse_sp.py surat.pdf --drop-invalid  # buang baris gagal (TIDAK disarankan)
    python parse_sp.py surat.pdf --strict        # exit 1 bila ada baris gagal
"""
import argparse, hashlib, json, re, sys
from collections import defaultdict
from fractions import Fraction
from dataclasses import dataclass, field, asdict

import pdfplumber

# --- batas kolom lampiran (pt). Kalibrasi ulang bila layout berubah. ---
COLS = {
    "kd_dosen":   (81, 133),
    "nama_dosen": (133, 284),
    "kode_mk":    (284, 334),
    "nama_mk":    (333, 624),
    "jenis":      (624, 674),
    "sks_slot":  (674, 695),
    "beban_te":   (695, 723),
    "beban_pr":   (722, 745),
    "jam":        (745, 781),
    "kelas":      (780, 809),
}
TOL = 4.0
KELAS_RE   = re.compile(r"^\d[A-Z]$")
KODE_MK_RE = re.compile(r"^\d{2}[A-Z]{2}\d{4}$")
KD_RE      = re.compile(r"^KO\d{3}[A-Z]$")

BULAN = {"januari":1,"februari":2,"maret":3,"april":4,"mei":5,"juni":6,
         "juli":7,"agustus":8,"september":9,"oktober":10,"november":11,
         "desember":12}


# ===================== metadata halaman 1 (pre-fill) =====================

def _iso(tgl: str):
    m = re.match(r"(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})", tgl.strip())
    if not m:
        return None
    b = BULAN.get(m.group(2).lower())
    return f"{m.group(3)}-{b:02d}-{int(m.group(1)):02d}" if b else None


def extract_meta(page):
    """Regex terhadap teks halaman 1. RAPUH -- hanya untuk pre-fill form."""
    t = re.sub(r"\s+", " ", page.extract_text() or "")
    meta = {"nomor": None, "prodi": None, "tahun_ajaran": None,
            "semester": None, "berlaku_mulai": None, "berlaku_sampai": None,
            "ditetapkan": None, "_terbaca": {}}

    if m := re.search(r"Nomor\s+(\S+/\S+)", t):
        meta["nomor"] = m.group(1)
    if m := re.search(r"PROGRAM STUDI\s+(.+?)\s+Menimbang", t):
        meta["prodi"] = m.group(1).title()
    if m := re.search(r"Semester\s+(\w+)\s+Tahun Ajaran\s+(\d{4})\s*/\s*(\d{4})", t):
        meta["semester"] = m.group(1).capitalize()
        meta["tahun_ajaran"] = f"{m.group(2)}/{m.group(3)}"
    if m := re.search(r"berlaku sejak tanggal\s+(\d{1,2}\s+\w+\s+\d{4})"
                      r"\s+sampai dengan\s+(\d{1,2}\s+\w+\s+\d{4})", t):
        meta["berlaku_mulai"]  = _iso(m.group(1))
        meta["berlaku_sampai"] = _iso(m.group(2))
    if m := re.search(r"Pada Tanggal\s*:\s*(\d{1,2}\s+\w+\s+\d{4})", t):
        meta["ditetapkan"] = _iso(m.group(1))

    meta["_terbaca"] = {k: v is not None
                        for k, v in meta.items() if k != "_terbaca"}
    return meta


# ===================== lampiran: rekonstruksi sel =====================

@dataclass
class Row:
    halaman: int
    kd_dosen: str = ""; nama_dosen: str = ""
    kode_mk: str = "";  nama_mk: str = ""
    kelas: str = "";    jenis: str = ""
    beban_te: int = 0;  beban_pr: int = 0
    jam: int = 0;       sks_slot: int = 0
    catatan: list = field(default_factory=list)
    @property
    def valid(self): return not self.catatan


def build_cells(page):
    """Sel diambil dari rect PDF supaya merged cell (rowspan) terbaca benar."""
    cells = {c: [] for c in COLS}
    seen = set()
    for r in page.rects:
        if r["x1"] - r["x0"] < 8 or r["bottom"] - r["top"] < 6:
            continue
        for name, (a, b) in COLS.items():
            if abs(r["x0"] - a) <= TOL and abs(r["x1"] - b) <= TOL + 6:
                key = (name, round(r["top"], 1), round(r["bottom"], 1))
                if key not in seen:
                    seen.add(key)
                    cells[name].append({"top": r["top"], "bottom": r["bottom"],
                                        "words": []})
                break
    for c in cells:
        cells[c].sort(key=lambda x: x["top"])
    return cells


def fill_words(page, cells):
    for w in page.extract_words():
        cx = (w["x0"] + w["x1"]) / 2
        cy = (w["top"] + w["bottom"]) / 2
        for name, (a, b) in COLS.items():
            if a - TOL <= cx < b + TOL:
                for c in cells[name]:
                    if c["top"] - 1 <= cy <= c["bottom"] + 1:
                        c["words"].append(w); break
                break


def cell_text(cells, col, y):
    for c in cells[col]:
        if c["top"] - 1 <= y <= c["bottom"] + 1:
            ws = sorted(c["words"], key=lambda w: (round(w["top"]), w["x0"]))
            return re.sub(r"\s+", " ", " ".join(w["text"] for w in ws)).strip()
    return ""


def cell_num(cells, col, y):
    t = cell_text(cells, col, y)
    return int(t) if t.isdigit() else 0


def parse_page(page, pageno):
    cells = build_cells(page); fill_words(page, cells)
    rows = []
    for c in cells["kelas"]:
        txt = "".join(w["text"] for w in c["words"]).strip()
        if not KELAS_RE.match(txt):
            continue
        y = (c["top"] + c["bottom"]) / 2
        rows.append(Row(
            halaman=pageno,
            kd_dosen=cell_text(cells, "kd_dosen", y),
            nama_dosen=cell_text(cells, "nama_dosen", y),
            kode_mk=cell_text(cells, "kode_mk", y),
            nama_mk=cell_text(cells, "nama_mk", y),
            kelas=txt,
            jenis=cell_text(cells, "jenis", y).replace(" ", ""),
            beban_te=cell_num(cells, "beban_te", y),
            beban_pr=cell_num(cells, "beban_pr", y),
            jam=cell_num(cells, "jam", y),
            sks_slot=cell_num(cells, "sks_slot", y),
        ))
    return rows


def validate(r: Row):
    c = r.catatan
    if not KD_RE.match(r.kd_dosen):     c.append(f"kd_dosen janggal: {r.kd_dosen!r}")
    if not KODE_MK_RE.match(r.kode_mk): c.append(f"kode_mk janggal: {r.kode_mk!r}")
    if not r.nama_dosen:                c.append("nama_dosen kosong")
    if r.sks_slot <= 0:                c.append("sks_slot kosong")
    if r.beban_te + r.beban_pr != r.sks_slot:
        c.append(f"TE+PR({r.beban_te}+{r.beban_pr}) != kolom SKS({r.sks_slot})")
    if r.jam != r.beban_te + 2 * r.beban_pr:
        c.append(f"JAM({r.jam}) != TE+2xPR({r.beban_te + 2*r.beban_pr})")
    j = r.jenis.upper()
    if j == "TE" and r.beban_pr: c.append("label TE tapi ada beban PR")
    if j == "PR" and r.beban_te: c.append("label PR tapi ada beban TE")
    if j == "TE&PR" and not (r.beban_te and r.beban_pr):
        c.append("label TE & PR tapi salah satu beban 0")



# ======================================================================
# PERHITUNGAN BEBAN
# Bagian ini adalah aturan BKD, BUKAN parsing. Jangan diubah waktu
# layout PDF berubah; yang dikalibrasi ulang cuma COLS di atas.
# ======================================================================

KOMPONEN = ("TE", "PR")


def _beban(row, komp):
    return row["beban_te"] if komp == "TE" else row["beban_pr"]


# ===================== indeks komponen =====================

def index_komponen(rows):
    """(kode_mk, kelas, komponen) -> daftar kontributor.

    Satu "komponen" = satu slot ajar. Bila lebih dari satu dosen mengisi slot
    yang sama, itu team teaching: masing-masing tercetak bobot PENUH di SP,
    bukan sudah dibagi.
    """
    idx = defaultdict(list)
    for r in rows:
        for komp in KOMPONEN:
            b = _beban(r, komp)
            if b > 0:
                idx[(r["kode_mk"], r["kelas"], komp)].append(
                    {"kd_dosen": r["kd_dosen"], "nama_dosen": r["nama_dosen"],
                     "beban": b, "halaman": r["halaman"]})
    return idx


def ringkas_komponen(idx):
    out = {}
    for key, kontrib in idx.items():
        nilai = {c["beban"] for c in kontrib}
        dosen = {c["kd_dosen"] for c in kontrib}
        out[key] = {
            "bobot": max(nilai),
            "jumlah_dosen": len(dosen),
            "team_teaching": len(dosen) > 1,
            # bila dua dosen di slot sama mencetak angka berbeda, SP-nya
            # ambigu: tidak bisa dibedakan team teaching dari salah input
            "seragam": len(nilai) == 1,
            "kontributor": kontrib,
        }
    return out


# ===================== 1. bobot mata kuliah =====================

def bobot_mk(komp_ringkas):
    per_kelas = defaultdict(lambda: {"TE": 0, "PR": 0})
    for (mk, kelas, komp), d in komp_ringkas.items():
        per_kelas[(mk, kelas)][komp] = d["bobot"]

    per_mk = defaultdict(dict)
    for (mk, kelas), v in per_kelas.items():
        per_mk[mk][kelas] = v["TE"] + v["PR"]

    out = []
    for mk in sorted(per_mk):
        kelas_bobot = per_mk[mk]
        nilai = set(kelas_bobot.values())
        out.append({
            "kode_mk": mk,
            "bobot_sks": max(nilai),
            "per_kelas": dict(sorted(kelas_bobot.items())),
            "konsisten_antar_kelas": len(nilai) == 1,
        })
    return out


# ===================== 2 & 3. beban dosen =====================

def beban_dosen(rows, komp_ringkas):
    per = {}
    for r in rows:
        d = per.setdefault(r["kd_dosen"], {
            "kd_dosen": r["kd_dosen"], "nama_dosen": r["nama_dosen"],
            "_tercatat": 0, "_efektif": Fraction(0), "rincian": [],
            "_tt": 0})
        for komp in KOMPONEN:
            b = _beban(r, komp)
            if b == 0:
                continue
            k = komp_ringkas[(r["kode_mk"], r["kelas"], komp)]
            n = k["jumlah_dosen"]
            eff = Fraction(b, n)
            d["_tercatat"] += b
            d["_efektif"] += eff
            if k["team_teaching"]:
                d["_tt"] += 1
            d["rincian"].append({
                "kode_mk": r["kode_mk"], "nama_mk": r["nama_mk"],
                "kelas": r["kelas"], "komponen": komp,
                "tercatat": b,
                "jumlah_dosen_komponen": n,
                "team_teaching": k["team_teaching"],
                "efektif": eff,
            })

    out = []
    for d in per.values():
        d["beban_tercatat"] = d.pop("_tercatat")
        d["beban_efektif"] = d.pop("_efektif")
        d["jumlah_slot_team_teaching"] = d.pop("_tt")
        d["selisih"] = d["beban_tercatat"] - d["beban_efektif"]
        d["rincian"].sort(key=lambda x: (x["kode_mk"], x["kelas"], x["komponen"]))
        out.append(d)
    out.sort(key=lambda x: x["kd_dosen"])
    return out


# ===================== validasi silang =====================

def validasi(komp_ringkas, mk_list):
    """Invarian yang tidak bisa dicek per baris."""
    temuan = []

    for (mk, kelas, komp), d in sorted(komp_ringkas.items()):
        # rekonstruksi: jumlah beban efektif satu slot harus == bobot slot
        total = sum(Fraction(c["beban"], d["jumlah_dosen"]) for c in d["kontributor"])
        if total != d["bobot"]:
            temuan.append({
                "jenis": "rekonstruksi_gagal", "kode_mk": mk, "kelas": kelas,
                "komponen": komp,
                "pesan": f"jumlah efektif {total} != bobot slot {d['bobot']}",
            })
        if not d["seragam"]:
            temuan.append({
                "jenis": "beban_tidak_seragam", "kode_mk": mk, "kelas": kelas,
                "komponen": komp,
                "pesan": "dosen pada slot sama mencetak angka berbeda: "
                         + ", ".join(f"{c['kd_dosen']}={c['beban']}"
                                     for c in d["kontributor"]),
            })

    for m in mk_list:
        if not m["konsisten_antar_kelas"]:
            temuan.append({
                "jenis": "bobot_beda_antar_kelas", "kode_mk": m["kode_mk"],
                "pesan": "; ".join(f"{k}={v}" for k, v in m["per_kelas"].items()),
            })
    return temuan


# ===================== serialisasi =====================

def lengkapi_penugasan(rows, komp_ringkas, mk_list):
    """Sisipkan konteks lintas-baris ke tiap baris penugasan.

    sks_slot     = angka mentah kolom SKS (bobot komponen yang dipegang baris)
    total_sks_mk = bobot MK sesungguhnya, max(TE)+max(PR) antar dosen.
                   Keduanya sering BEDA. Bila MK dipegang lebih dari satu
                   dosen, sks_slot hanya menampilkan porsi dosen itu.
    """
    bobot = {m["kode_mk"]: m for m in mk_list}

    for r in rows:
        per_komp, tt = {}, False
        for komp in KOMPONEN:
            if _beban(r, komp) > 0:
                k = komp_ringkas[(r["kode_mk"], r["kelas"], komp)]
                per_komp[komp] = k["jumlah_dosen"]
                tt = tt or k["team_teaching"]

        m = bobot.get(r["kode_mk"], {})
        r["total_sks_mk"] = m.get("per_kelas", {}).get(r["kelas"])
        r["sks_slot_sama_dengan_mk"] = r["sks_slot"] == r["total_sks_mk"]
        r["team_teaching"] = tt
        r["dosen_per_komponen"] = per_komp
    return rows


def _jsonable(o):
    if isinstance(o, Fraction):
        return float(o)
    if isinstance(o, dict):
        return {k: _jsonable(v) for k, v in o.items()}
    if isinstance(o, list):
        return [_jsonable(v) for v in o]
    return o


def hitung(rows):
    idx = index_komponen(rows)
    komp = ringkas_komponen(idx)
    mk = bobot_mk(komp)
    dosen = beban_dosen(rows, komp)
    temuan = validasi(komp, mk)
    lengkapi_penugasan(rows, komp, mk)

    return _jsonable({
        "mata_kuliah": mk,
        "beban_dosen": dosen,
        "temuan": temuan,
        "ringkasan_hitung": {
            "jumlah_mk": len(mk),
            "jumlah_dosen": len(dosen),
            "slot_team_teaching": sum(1 for d in komp.values() if d["team_teaching"]),
            "temuan": len(temuan),
        },
    })


# ======================================================================
# OUTPUT
# ======================================================================

def to_dict(r: Row, valid: bool):
    d = asdict(r)
    d["status"] = "OK" if valid else "REVIEW"
    if valid:
        d.pop("catatan")
    return d


def parse_pdf(path, drop_invalid=False):
    raw = open(path, "rb").read()
    rows = []
    with pdfplumber.open(path) as pdf:
        meta = extract_meta(pdf.pages[0])
        for i, page in enumerate(pdf.pages, 1):
            rows.extend(parse_page(page, i))
    if not rows:
        raise RuntimeError(
            "0 baris terekstrak. Layout lampiran kemungkinan berubah "
            "(batas kolom COLS tidak lagi cocok). JANGAN abaikan: "
            "kegagalan ini dulu senyap dan menghasilkan JSON kosong.")

    for r in rows:
        validate(r)

    ok  = [r for r in rows if r.valid]
    bad = [r for r in rows if not r.valid]

    meta.update({
        "sumber_file": path.split("/")[-1],
        "sha256": hashlib.sha256(raw).hexdigest(),
        "_catatan": "metadata hasil regex, WAJIB dikonfirmasi admin",
    })

    penugasan = [to_dict(r, True) for r in ok]
    hasil = hitung(penugasan)

    out = {
        "surat": meta,
        "ringkasan": {"terekstrak": len(rows), "valid": len(ok),
                      "ditolak": 0 if drop_invalid else len(bad),
                      **hasil["ringkasan_hitung"]},
        "penugasan": penugasan,
        "mata_kuliah": hasil["mata_kuliah"],
        "beban_dosen": hasil["beban_dosen"],
        "temuan": hasil["temuan"],
    }
    if not drop_invalid:
        out["ditolak"] = [to_dict(r, False) for r in bad]
    return out, bad


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf"); ap.add_argument("-o", "--out")
    ap.add_argument("--drop-invalid", action="store_true")
    ap.add_argument("--strict", action="store_true")
    a = ap.parse_args()

    data, bad = parse_pdf(a.pdf, a.drop_invalid)
    js = json.dumps(data, ensure_ascii=False, indent=2)

    if a.out:
        open(a.out, "w", encoding="utf-8").write(js)
        r = data["ringkasan"]
        print(f"terekstrak={r['terekstrak']} valid={r['valid']} "
              f"ditolak={len(bad)} -> {a.out}", file=sys.stderr)
        for t in data["temuan"]:
            print(f"  [TEMUAN] {t['jenis']}: {t.get('kode_mk','')} {t['pesan']}",
                  file=sys.stderr)
        for b in bad:
            print(f"  [hal {b.halaman}] {b.kd_dosen} {b.kode_mk} {b.kelas}: "
                  f"{'; '.join(b.catatan)}", file=sys.stderr)
    else:
        print(js)

    if a.strict and bad:
        sys.exit(1)


if __name__ == "__main__":
    main()