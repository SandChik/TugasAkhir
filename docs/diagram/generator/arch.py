# -*- coding: utf-8 -*-
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dg import Dia, text_size
d = Dia("Gambar IV.5 Arsitektur Sistem LedgerDik", 1620, 1180)
def lab(e, x, y, t, fs=9):
    w, h = text_size(t, fs); d.label(x, y, t, fs, owner=e)
# pengguna
g0 = d.box(445, 30, 620, 100, "PENGGUNA SISTEM", "grup", "grup", 11, bold=True)
for i, t in enumerate(["Administrator", "Dosen", "Asesor 1 dan Asesor 2"]):
    d.box(20+i*200, 40, 180, 45, t, "rect", "entitas", 10, parent=g0)
# aplikasi web
g1 = d.box(380, 180, 750, 400, "LAPISAN APLIKASI WEB  -  Next.js 14.2, React 18.3, TypeScript 6.0", "grup", "grup", 11, bold=True)
mw  = d.box(250, 45, 250, 55, "middleware.ts\npembatasan akses per peran", "rect", "web", 10, parent=g1)
hal = d.box(250, 130, 250, 55, "Halaman antarmuka per peran\nadmin, asesor, dosen", "rect", "web", 10, parent=g1)
act = d.box(250, 215, 250, 55, "Server action\nactions.ts per rute", "rect", "web", 10, parent=g1)
ork = d.box(210, 300, 330, 80, "Modul orkestrasi\nparserDokumen, pemetaanPenugasan,\nverifikasiBukti, namaDosen,\nblockchain, registriDokumen", "rect", "web", 10, parent=g1)
A = lambda b: d.abs_box(b)
def cxy(b):
    x0,y0,x1,y1 = A(b); return (x0+x1)/2,(y0+y1)/2,x0,y0,x1,y1
for a,b in ((mw,hal),(hal,act),(act,ork)):
    ca,cya,ax0,ay0,ax1,ay1 = cxy(a); cb,cyb,bx0,by0,bx1,by1 = cxy(b)
    d.edge(a,b,[(ca,ay1),(cb,by0)])
# pengguna -> middleware
c0,cy0,x00,y00,x01,y01 = cxy(g0); cm,cym,mx0,my0,mx1,my1 = cxy(mw)
e = d.edge(g0, mw, [(cm, y01), (cm, my0)]); lab(e, cm+8+22, y01+18, "HTTPS")
# penyimpanan (kiri, sejajar orkestrasi)
co,cyo,ox0,oy0,ox1,oy1 = cxy(ork)
g2 = d.box(30, cyo-90, 310, 222, "LAPISAN PENYIMPANAN OPERASIONAL", "grup", "grup", 11, bold=True)
orm = d.box(30, 45, 250, 60, "Prisma ORM 6.19\nschema.prisma dan migrasi terversi", "rect", "entitas", 10, parent=g2)
db  = d.box(45, 135, 220, 70, "PostgreSQL 16\nsebelas entitas operasional", "rect", "entitas", 10, parent=g2)
cr,cyr,rx0,ry0,rx1,ry1 = cxy(orm); cdb,cydb,dx0,dy0,dx1,dy1 = cxy(db)
d.edge(orm, db, [(cr, ry1), (cdb, dy0)])
e = d.edge(ork, orm, [(ox0, cyr), (rx1, cyr)]); lab(e, (ox0+rx1)/2, cyr-14, "data operasional")
# ekstraksi (bawah, api sejajar orkestrasi)
g3 = d.box(200, 660, 760, 250, "LAPISAN EKSTRAKSI DOKUMEN  -  Python, FastAPI", "grup", "grup", 11, bold=True)
api = d.box(co-200-125, 45, 250, 50, "api.py\nautentikasi header X-API-Key", "rect", "eks", 10, parent=g3)
det = d.box(60, 140, 250, 70, "Jalur deterministik\npdfplumber", "rect", "eks", 10, parent=g3)
vlm = d.box(430, 140, 250, 70, "Jalur model bahasa visual\npypdfium2 dan Pillow", "rect", "eks", 10, parent=g3)
cap,cyap,px0,py0,px1,py1 = cxy(api)
e = d.edge(ork, api, [(co, oy1), (co, py0)]); lab(e, co+8+62, (oy1+py0)/2, "HTTP, berkas PDF dan citra")
for b in (det, vlm):
    cb,cyb,bx0,by0,bx1,by1 = cxy(b)
    d.edge(api, b, [(cap, py1), (cap, by0-22), (cb, by0-22), (cb, by0)])
ext = d.box(200+430, 980, 250, 60, "Layanan Model Bahasa Visual\nHTTPS dengan kunci API peladen", "rect", "luar", 10, dashed=True)
cv,cyv,vx0,vy0,vx1,vy1 = cxy(vlm); ce,cye,ex0,ey0,ex1,ey1 = cxy(ext)
e = d.edge(vlm, ext, [(cv, vy1), (cv, ey0)]); lab(e, cv+8+36, (vy1+ey0)/2, "citra halaman")
# on-chain (kanan, tiga kontrak bertumpuk)
g4 = d.box(1180, 250, 420, 340, "LAPISAN ON-CHAIN  -  Base Sepolia, chainId 84532", "grup", "grup", 11, bold=True)
kal = d.box(20, 45, 380, 78, "KalkulatorBKDPendidikan\nfungsi pure per butir Rubrik BKD\nkeluaran skala SKS x100", "rect", "chain", 10, parent=g4)
tok = d.box(20, 140, 380, 78, "BKDSKSToken\nERC-20 non-transferable\nMINTER_ROLE via AccessControl", "rect", "chain", 10, parent=g4)
reg = d.box(20, 235, 380, 78, "BKDDokumenRegistri\nPENCATAT_ROLE\nevent DokumenTercatat", "rect", "chain", 10, parent=g4)
# tiga rute kanan: keluar orkestrasi di y berbeda, belok di x berbeda (sarang)
for b, dy, bx, t in ((kal, -20, 1010, "JSON-RPC, Ethers.js 6.17"), (tok, 0, 1040, "JSON-RPC, mint dan burn"), (reg, 20, 1070, "JSON-RPC, catat")):
    cb,cyb,bx0,by0,bx1,by1 = cxy(b)
    y = cyo+dy
    e = d.edge(ork, b, [(ox1, y), (bx, y), (bx, cyb), (bx0, cyb)])
    w,h = text_size(t, 9)
    d.label(bx+8+w/2, cyb-12, t, 9, owner=e)
bsc = d.box(1200, 980, 280, 60, "Basescan\npenjelajah blok publik", "rect", "luar", 10, dashed=True)
cg,cyg,gx0,gy0,gx1,gy1 = cxy(reg); cb2,cyb2,bx02,by02,bx12,by12 = cxy(bsc)
e = d.edge(reg, bsc, [(cg, gy1), (cg, 620), (cb2, 620), (cb2, by02)]); lab(e, cb2+8+46, (620+by02)/2, "penelusuran publik")
d.box(30, 1060, 560, 90,
      "Modul orkestrasi merupakan satu-satunya titik yang berhubungan dengan lapisan di luar\n"
      "aplikasi web, sesuai NFR-07. Kunci penandatangan hanya dipegang lapisan aplikasi web\n"
      "dan tidak pernah terpapar ke sisi klien. Kotak bergaris putus menyatakan layanan pihak\n"
      "luar yang berada di luar batas sistem.", "note", "catatan", 9)
d.save_drawio("IV-05-arsitektur-sistem.drawio"); d.check(); d.render("iv5.png")
