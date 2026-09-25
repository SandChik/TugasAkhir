# -*- coding: utf-8 -*-
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dg import Dia, text_size
d = Dia("Gambar IV.5 Arsitektur Sistem LedgerDik", 1770, 1430)
def lab(e, x, y, t, fs=9, kanan=False):
    """label; kanan=True -> x adalah tepi kiri label (di kanan garis vertikal)."""
    w, h = text_size(t, fs)
    d.label(x + 8 + w / 2 if kanan else x, y, t, fs, owner=e)
def grup(x, y, w, h, t):   # judul rata kiri supaya garis yang masuk di tengah tidak menembusnya
    return d.box(x, y, w, h, t, "grup", "grup", 11, bold=True, align="left")
A = lambda b: d.abs_box(b)
def cxy(b):
    x0, y0, x1, y1 = A(b); return (x0+x1)/2, (y0+y1)/2, x0, y0, x1, y1
CX = 800                                   # sumbu kolom aplikasi web

# pengguna
g0 = grup(CX - 330, 30, 660, 120, "PENGGUNA SISTEM")
for i, t in enumerate(["Administrator", "Dosen", "Asesor 1 dan Asesor 2"]):
    d.box(20 + i*220, 48, 180, 45, t, "rect", "entitas", 10, parent=g0)
# aplikasi web
g1 = grup(420, 200, 800, 506, "LAPISAN APLIKASI WEB\nNext.js 14.2, React 18.3, TypeScript 6.0")
kx = CX - 420
mw  = d.box(kx - 130, 70, 260, 60, "middleware.ts\npembatasan akses per peran", "rect", "web", 10, parent=g1)
hal = d.box(kx - 130, 170, 260, 60, "Halaman antarmuka per peran\nadmin, asesor, dosen", "rect", "web", 10, parent=g1)
act = d.box(kx - 130, 270, 260, 60, "Server action\nactions.ts per rute", "rect", "web", 10, parent=g1)
ork = d.box(kx - 180, 370, 360, 96, "Modul orkestrasi\nparserDokumen, pemetaanPenugasan,\nverifikasiBukti, namaDosen,\nblockchain, registriDokumen", "rect", "web", 10, parent=g1)
for a, b in ((mw, hal), (hal, act), (act, ork)):
    ca, cya, ax0, ay0, ax1, ay1 = cxy(a); cb, cyb, bx0, by0, bx1, by1 = cxy(b)
    d.edge(a, b, [(ca, ay1), (cb, by0)])
_, _, _, _, _, y01 = cxy(g0); cm, _, _, my0, _, _ = cxy(mw)
e = d.edge(g0, mw, [(cm, y01), (cm, my0)]); lab(e, cm, (y01 + 200) / 2, "HTTPS", kanan=True)
co, cyo, ox0, oy0, ox1, oy1 = cxy(ork)

# penyimpanan (kiri, sejajar orkestrasi)
g2 = grup(30, cyo - 86, 320, 257, "LAPISAN PENYIMPANAN OPERASIONAL")
orm = d.box(35, 55, 250, 62, "Prisma ORM 6.19\nschema.prisma dan migrasi terversi", "rect", "entitas", 10, parent=g2)
db  = d.box(45, 157, 230, 70, "PostgreSQL 16\nsebelas entitas operasional", "rect", "entitas", 10, parent=g2)
cr, cyr, rx0, ry0, rx1, ry1 = cxy(orm); cdb, cydb, dx0, dy0, dx1, dy1 = cxy(db)
d.edge(orm, db, [(cr, ry1), (cdb, dy0)])
e = d.edge(ork, orm, [(ox0, cyr), (rx1, cyr)]); lab(e, (420 + ox0) / 2, cyr - 16, "data operasional")

# ekstraksi (bawah, api sejajar orkestrasi)
g3 = grup(200, 830, 840, 285, "LAPISAN EKSTRAKSI DOKUMEN  -  Python, FastAPI")
api = d.box(CX - 200 - 140, 60, 280, 56, "api.py\nautentikasi header X-API-Key", "rect", "eks", 10, parent=g3)
det = d.box(60, 180, 260, 70, "Jalur deterministik\npdfplumber", "rect", "eks", 10, parent=g3)
vlm = d.box(CX - 200 - 140, 180, 280, 70, "Jalur model bahasa visual\npypdfium2 dan Pillow", "rect", "eks", 10, parent=g3)
cap, cyap, px0, py0, px1, py1 = cxy(api)
e = d.edge(ork, api, [(co, oy1), (co, py0)]); lab(e, co, (706 + 830) / 2, "HTTP, berkas PDF dan citra", kanan=True)
cb, cyb, bx0, by0, bx1, by1 = cxy(det)
ym = round((py1 + by0) / 2)
d.edge(api, det, [(cap, py1), (cap, ym), (cb, ym), (cb, by0)])
cv, cyv, vx0, vy0, vx1, vy1 = cxy(vlm)
d.edge(api, vlm, [(cap, py1), (cv, vy0)])
ext = d.box(CX - 145, 1190, 290, 60, "Layanan Model Bahasa Visual\nHTTPS dengan kunci API peladen", "rect", "luar", 10, dashed=True)
ce, cye, ex0, ey0, ex1, ey1 = cxy(ext)
e = d.edge(vlm, ext, [(cv, vy1), (cv, ey0)]); lab(e, cv, (1115 + ey0) / 2, "citra halaman", kanan=True)

# on-chain (kanan, tiga kontrak bertumpuk; kontrak token sejajar orkestrasi)
g4 = grup(1300, cyo - 210, 440, 390, "LAPISAN ON-CHAIN  -  Base Sepolia, chainId 84532")
kal = d.box(25, 60, 390, 80, "KalkulatorBKDPendidikan\nfungsi pure per butir Rubrik BKD\nkeluaran skala SKS x100", "rect", "chain", 10, parent=g4)
tok = d.box(25, 170, 390, 80, "BKDSKSToken\nERC-20 non-transferable\nMINTER_ROLE via AccessControl", "rect", "chain", 10, parent=g4)
reg = d.box(25, 280, 390, 80, "BKDDokumenRegistri\nPENCATAT_ROLE\nevent DokumenTercatat", "rect", "chain", 10, parent=g4)
XB = ox1 + 60                              # belokan rute ke kalkulator dan registri
for b, dy, t in ((kal, -24, "JSON-RPC, Ethers.js 6.17"), (tok, 0, "JSON-RPC, mint dan burn"), (reg, 24, "JSON-RPC, catat")):
    cb, cyb, bx0, by0, bx1, by1 = cxy(b)
    y = cyo + dy
    pts = [(ox1, y), (bx0, y)] if dy == 0 else [(ox1, y), (XB, y), (XB, cyb), (bx0, cyb)]
    e = d.edge(ork, b, pts)
    lab(e, (XB + 1220) / 2, cyb + 16 if dy > 0 else cyb - 16, t)
bsc = d.box(1520 - 140, 1190, 280, 60, "Basescan\npenjelajah blok publik", "rect", "luar", 10, dashed=True)
cg, cyg, gx0, gy0, gx1, gy1 = cxy(reg); cb2, cyb2, bx02, by02, bx12, by12 = cxy(bsc)
e = d.edge(reg, bsc, [(cg, gy1), (cb2, by02)]); lab(e, cg, (gy1 + 30 + by02) / 2, "penelusuran publik", kanan=True)
d.box(30, 1300, 580, 100,
      "Modul orkestrasi merupakan satu-satunya titik yang berhubungan dengan lapisan di luar\n"
      "aplikasi web, sesuai NFR-07. Kunci penandatangan hanya dipegang lapisan aplikasi web\n"
      "dan tidak pernah terpapar ke sisi klien. Kotak bergaris putus menyatakan layanan pihak\n"
      "luar yang berada di luar batas sistem.", "note", "catatan", 9)
d.save_drawio("IV-05-arsitektur-sistem.drawio"); d.check(); d.render("iv5.png")
