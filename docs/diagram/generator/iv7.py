# -*- coding: utf-8 -*-
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dg import Dia
from dfd2 import cluster
ST_SP, ST_W, ENT_W, ENT_GAP, HUB_W = 172, 150, 150, 200, 190
from data_dfd import *

def bahan(p):
    left = [(ENT[e], m, k) for e, pp, m, k in ALIRAN if pp == p and e in KIRI_ENT]
    right = [(ENT[e], m, k) for e, pp, m, k in ALIRAN if pp == p and e not in KIRI_ENT]
    stores = []
    for k in sorted(AKSES[p], key=lambda x: int(x[1:])):
        mode = AKSES[p][k]
        stores.append((STORE[k], LBL[k][0] if "r" in mode else "", LBL[k][1] if "w" in mode else ""))
    return left, right, stores

def lebar(p):
    left, right, stores = bahan(p)
    w_st = len(stores) * ST_SP
    w_en = HUB_W + (ENT_W + ENT_GAP if left else 0) + (ENT_W + ENT_GAP if right else 0)
    return max(w_st, w_en) + 60

urut = [f"P{i}" for i in range(1, 13)]
kolom = [urut[i::3] for i in range(3)]          # 3 kolom, baris-mayor
lebar_kol = [max(lebar(p) for p in k) for k in kolom]
MARGIN = 40
xs = [MARGIN]
for w in lebar_kol[:-1]: xs.append(xs[-1] + w)
W = xs[-1] + lebar_kol[-1] + MARGIN
d = Dia("Gambar IV.7 DFD Level 1", W, 10)
y = 60
tinggi_baris = []
for r in range(4):
    bawah = y
    for c in range(3):
        p = urut[r * 3 + c]
        left, right, stores = bahan(p)
        cx = xs[c] + lebar_kol[c] / 2
        band = max(115, max(len(left), len(right), 1)*92)
        (x0, y0, x1, y1), hub = cluster(d, PROSES[p], cx, y + band/2, left, right, stores)
        bawah = max(bawah, y1)
    y = bawah + 70
H = y + 150
d.h = H
d.box(MARGIN, y - 10, 900, 118,
      "Notasi mengikuti Pressman (2001): persegi panjang menyatakan entitas eksternal, lingkaran menyatakan\n"
      "proses, garis ganda menyatakan penyimpanan data, dan setiap panah diberi nama sesuai data yang mengalir.\n"
      "Entitas eksternal dan penyimpanan data yang diakses lebih dari satu proses digambar berulang di dekat\n"
      "masing-masing proses agar tidak ada garis yang saling memotong; setiap salinan merujuk objek yang sama.\n"
      "Deskripsi proses disajikan pada Tabel IV.16, isi penyimpanan data pada Tabel IV.17, dan aliran ke\n"
      "entitas eksternal pada Tabel IV.15.", "note", "catatan", 9)
d.save_drawio("IV-07-dfd-level-1.drawio")
print("ukuran kanvas:", W, "x", H)
d.check()
print("png:", d.render("iv7.png"))
