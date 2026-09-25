# -*- coding: utf-8 -*-
"""IV.35 Tahapan pengujian: lima tahap berurutan dengan panah kembali dari tahap terakhir ke tahap pelaksanaan.
Unsur strategi pengujian (perencanaan, perancangan kasus uji, pelaksanaan, pengumpulan dan evaluasi hasil)
mengikuti Pressman (2001) subbab 18.1."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dg import Dia, text_size

TAHAP = ["Perencanaan\npengujian", "Penyusunan\nskenario uji", "Pelaksanaan\npengujian",
         "Pencatatan dan\nanalisis hasil", "Perbaikan dan\npengujian ulang"]
BW, BH, GAP, Y = 170, 64, 46, 60
W = 40 + 5 * BW + 4 * GAP + 40
d = Dia("Gambar IV.35 Tahapan Pengujian Sistem LedgerDik", W, 330)
kotak = []
for i, t in enumerate(TAHAP):
    x = 40 + i * (BW + GAP)
    kotak.append(d.box(x, Y, BW, BH, f"{i + 1}. {t}", "rect", "proses" if i != 4 else "putusan", 10))
for a, b in zip(kotak, kotak[1:]):
    d.edge(a, b, [(a.x1, a.cy), (b.x, b.cy)])
# panah kembali: dari bawah tahap 5 turun, ke kiri, naik ke bawah tahap 3
a, b = kotak[4], kotak[2]
yb = Y + BH + 46
e = d.edge(a, b, [(a.cx, a.y1), (a.cx, yb), (b.cx, yb), (b.cx, b.y1)])
t = "terdapat skenario gagal: uji ulang seluruh skenario pada modul yang bersangkutan"
w, h = text_size(t, 8)
d.label((a.cx + b.cx) / 2, yb + 8 + h / 2, t, 8, owner=e)
d.box(40, yb + 50, 760, 96,
      "Unsur strategi pengujian mengikuti Pressman (2001) subbab 18.1: perencanaan pengujian, perancangan kasus uji,\n"
      "pelaksanaan, serta pengumpulan dan evaluasi hasil. Tahap perbaikan dan pengujian ulang mengembalikan siklus ke\n"
      "tahap pelaksanaan hingga seluruh skenario pada modul yang bersangkutan lulus. Kriteria kelulusan ditetapkan pada\n"
      "tahap perencanaan, sebelum eksekusi, sesuai uraian pada subbab IV.4.1.",
      "note", "catatan", 9)
d.h = yb + 170
d.save_drawio("IV-35-tahapan-pengujian.drawio"); d.check(); d.render("iv35.png")
