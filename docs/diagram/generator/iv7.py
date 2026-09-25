# -*- coding: utf-8 -*-
"""Gambar IV.7 DFD Level 1.
Dokumen memecahnya menjadi empat bagian bersambung (P1-P3, P4-P6, P7-P9, P10-P12), masing-masing
tiga proses ditumpuk vertikal dan dibingkai serapat isinya supaya teksnya sebesar mungkin saat
gambar dipaskan ke lebar halaman. Berkas gabungan dua belas proses tetap dibangun sebagai arsip."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dg import Dia
from dfd2 import cluster
ST_SP, ST_W, ENT_W, ENT_GAP, HUB_W = 172, 150, 150, 280, 190
from data_dfd import *

MARGIN = 40
PILIH = [a.lower() for a in sys.argv[1:]]

def bahan(p):
    left = [(ENT[e], m, k) for e, pp, m, k in ALIRAN if pp == p and e in KIRI_ENT]
    right = [(ENT[e], m, k) for e, pp, m, k in ALIRAN if pp == p and e not in KIRI_ENT]
    stores = []
    for k in sorted(AKSES[p], key=lambda x: int(x[1:])):
        mode = AKSES[p][k]
        stores.append((STORE[k], LBL[k][0] if "r" in mode else "", LBL[k][1] if "w" in mode else ""))
    return left, right, stores

def taruh(d, p, cx, y):
    """gambar satu klaster proses dengan tepi atas di y; kembalikan batasnya."""
    left, right, stores = bahan(p)
    (x0, y0, x1, y1), hub = cluster(d, PROSES[p], cx, 0, left, right, stores, ent_gap=ENT_GAP, top=y)
    return x0, y0, x1, y1

def lebar(p):
    """(tepi kiri, tepi kanan) klaster relatif sumbu hub; dipakai tata letak gabungan."""
    x0, y0, x1, y1 = taruh(Dia("ukur", 10, 10), p, 0, 0)
    return x0, x1

def batas(d):
    """kotak pembatas seluruh isi diagram (kotak, label, dan titik belok garis)."""
    xs, ys = [], []
    for b in d.boxes:
        x0, y0, x1, y1 = d.abs_box(b); xs += [x0, x1]; ys += [y0, y1]
    for l in d.labels:
        xs += [l.x, l.x + l.w]; ys += [l.y, l.y + l.h]
    for e in d.edges:
        for (x, y) in e.pts: xs.append(x); ys.append(y)
    return min(xs), min(ys), max(xs), max(ys)

def geser(d, dx, dy):
    for b in d.boxes:
        if b.parent is None: b.x += dx; b.y += dy
    for l in d.labels: l.cx += dx; l.cy += dy
    for e in d.edges: e.pts = [(x + dx, y + dy) for (x, y) in e.pts]

def bingkai(d, lebar_paksa=None):
    """geser isi ke margin kiri atas, lalu set ukuran kanvas. lebar_paksa memusatkan isi."""
    x0, y0, x1, y1 = batas(d)
    w = x1 - x0
    dx = MARGIN - x0 if lebar_paksa is None else (lebar_paksa - w) / 2 - x0
    geser(d, dx, MARGIN - y0)
    d.w = (w + 2 * MARGIN) if lebar_paksa is None else lebar_paksa
    d.h = (y1 - y0) + 2 * MARGIN
    return d.w

CATATAN = (
    "Notasi mengikuti Pressman (2001): persegi panjang menyatakan entitas eksternal, lingkaran menyatakan\n"
    "proses, garis ganda menyatakan penyimpanan data, dan setiap panah diberi nama sesuai data yang mengalir.\n"
    "Entitas eksternal dan penyimpanan data yang diakses lebih dari satu proses digambar berulang di dekat\n"
    "masing-masing proses agar tidak ada garis yang saling memotong; setiap salinan merujuk objek yang sama.\n"
    "Deskripsi proses disajikan pada Tabel IV.16, isi penyimpanan data pada Tabel IV.17, dan aliran ke\n"
    "entitas eksternal pada Tabel IV.15.")

urut = [f"P{i}" for i in range(1, 13)]
BAGIAN = [urut[i:i + 3] for i in range(0, 12, 3)]   # P1-P3, P4-P6, P7-P9, P10-P12
HURUF = "abcd"

# ---------- empat bagian: tiga proses ditumpuk vertikal ----------
if not PILIH or any(p in PILIH for p in ("iv7a", "iv7b", "iv7c", "iv7d")):
    dibangun = []
    for i, kel in enumerate(BAGIAN, 1):
        rentang = f"{kel[0]} sampai {kel[-1]}"
        d = Dia(f"Gambar IV.7 DFD Level 1 ({rentang})", 10, 10)
        y = 60
        for p in kel:
            y = taruh(d, p, 0, y)[3] + 90
        d.box(-450, y - 10, 900, 124,
              f"Bagian {i} dari empat pada Gambar IV.7, memuat proses {rentang}.\n" + CATATAN,
              "note", "catatan", 9)
        dibangun.append((i, kel, rentang, d, batas(d)))
    for i, kel, rentang, d, _ in dibangun:
        bingkai(d)
        d.save_drawio(f"IV-07-{HURUF[i-1]}-dfd-level-1-{kel[0].lower()}-{kel[-1].lower()}.drawio")
        print(f"IV.7 bagian {i} ({rentang}) kanvas {d.w:.0f} x {d.h:.0f}")
        d.check()
        d.render(f"iv7{HURUF[i-1]}.png")

# ---------- gabungan dua belas proses (arsip) ----------
if not PILIH or "iv7" in PILIH:
    kolom = [urut[i::3] for i in range(3)]
    ukuran = {p: lebar(p) for p in urut}
    kiri_kol = [max(-ukuran[p][0] for p in k) for k in kolom]     # jarak sumbu ke tepi kiri kolom
    kanan_kol = [max(ukuran[p][1] for p in k) for k in kolom]
    sumbu, x = [], MARGIN
    for c in range(3):
        sumbu.append(x + kiri_kol[c]); x = sumbu[-1] + kanan_kol[c] + 90
    d = Dia("Gambar IV.7 DFD Level 1", 10, 10)
    y = 60
    for r in range(4):
        bawah = y
        for c in range(3):
            bawah = max(bawah, taruh(d, urut[r * 3 + c], sumbu[c], y)[3])
        y = bawah + 90
    d.box(MARGIN, y - 10, 900, 118, CATATAN, "note", "catatan", 9)
    bingkai(d)
    d.save_drawio("IV-07-dfd-level-1.drawio")
    print(f"IV.7 gabungan kanvas {d.w:.0f} x {d.h:.0f}")
    d.check()
    d.render("iv7.png")
