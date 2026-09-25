# -*- coding: utf-8 -*-
"""ERD notasi Chen. Belah ketupat diletakkan tepat pada garis antar-entitas (parameter t, 0..1 dari
entitas pertama ke entitas kedua) supaya tidak ada tekukan; tata letak rapat agar teks terbaca."""
import sys, os, math; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dg import Dia, text_size
d = Dia("Gambar IV.15 ERD Notasi Chen Sistem LedgerDik", 1870, 1080)
EW, EH, RW, RH = 250, 64, 190, 84
FS_ENT, FS_REL, FS_KARD, FS_NOTE = 15, 10, 13, 9
# pusat entitas
EC = {"periode_bkd":(165,130), "unggahan_dokumen":(700,90), "referensi_kegiatan":(1700,150),
      "pengguna":(165,500), "lkd":(700,400), "kegiatan":(1220,400), "dokumen_kegiatan":(1700,560),
      "penugasan_asesor":(700,780), "hasil_penilaian":(1220,780),
      "simpulan_bkd":(165,860), "riwayat_transaksi":(700,1000)}
ne = {k: d.box(cx-EW/2, cy-EH/2, EW, EH, k, "rect", "entity", FS_ENT, bold=True) for k,(cx,cy) in EC.items()}
# (entitas a, entitas c, nama relasi, kardinalitas di a, kardinalitas di c, posisi t pada garis a->c)
REL = [("periode_bkd","lkd","menaungi","1","N",0.34),
       ("pengguna","lkd","memiliki","1","N",0.50),
       ("periode_bkd","unggahan_dokumen","mencakup","1","N",0.50),
       ("pengguna","unggahan_dokumen","mengunggah","1","N",0.36),
       ("unggahan_dokumen","kegiatan","menurunkan","1","N",0.50),
       ("lkd","kegiatan","memuat","1","N",0.50),
       ("referensi_kegiatan","kegiatan","mengacu","1","N",0.50),
       ("kegiatan","dokumen_kegiatan","melampirkan","1","N",0.50),
       ("kegiatan","hasil_penilaian","dinilai","1","N",0.50),
       ("lkd","penugasan_asesor","ditugaskan","1","N",0.50),
       ("pengguna","penugasan_asesor","bertindak\nsebagai asesor","1","N",0.70),
       ("penugasan_asesor","hasil_penilaian","menghasilkan","1","N",0.50),
       ("lkd","simpulan_bkd","menyimpulkan","1","1",0.76),
       ("hasil_penilaian","riwayat_transaksi","memicu","1","N",0.50),
       ("pengguna","riwayat_transaksi","menjalankan\nkoreksi","1","N",0.80)]
def tepi(b, tx, ty):
    """titik pada tepi kotak b ke arah (tx,ty)"""
    dx, dy = tx-b.cx, ty-b.cy
    if abs(dx) < 1e-6 and abs(dy) < 1e-6: return (b.cx, b.cy)
    sx = (b.w/2)/abs(dx) if dx else 1e9; sy = (b.h/2)/abs(dy) if dy else 1e9
    s = min(sx, sy); return (b.cx+dx*s, b.cy+dy*s)
def tepi_rh(b, tx, ty):
    """titik pada tepi belah ketupat b ke arah (tx,ty): |dx|/a + |dy|/b = 1"""
    dx, dy = tx-b.cx, ty-b.cy
    s = 1/(abs(dx)/(b.w/2) + abs(dy)/(b.h/2)); return (b.cx+dx*s, b.cy+dy*s)
def tindih_kotak(x0, y0, x1, y1, b):
    """persegi (x0,y0,x1,y1) bersentuhan dengan kotak b; belah ketupat diuji bentuk aslinya, bukan bbox."""
    bx0, by0, bx1, by1 = d.abs_box(b)
    if not (x0 < bx1 and bx0 < x1 and y0 < by1 and by0 < y1): return False
    if b.shape != "rhombus": return True
    a_, b_ = b.w/2, b.h/2
    dalam = lambda px, py: abs(px-b.cx)/a_ + abs(py-b.cy)/b_ <= 1
    xm, ym = (x0+x1)/2, (y0+y1)/2
    for px, py in ((x0,y0),(x1,y0),(x0,y1),(x1,y1),(xm,y0),(xm,y1),(x0,ym),(x1,ym),(xm,ym)):
        if dalam(px, py): return True
    for px, py in ((b.cx,by0),(b.cx,by1),(bx0,b.cy),(bx1,b.cy)):
        if x0 <= px <= x1 and y0 <= py <= y1: return True
    return False
edges_diag = []
for a, c, nama, ka, kb, t in REL:
    A, C = ne[a], ne[c]
    rx, ry = A.cx + t*(C.cx-A.cx), A.cy + t*(C.cy-A.cy)
    r = d.box(rx-RW/2, ry-RH/2, RW, RH, nama, "rhombus", "relasi", FS_REL)
    p1 = tepi(A, r.cx, r.cy); p2 = tepi_rh(r, A.cx, A.cy)
    q1 = tepi_rh(r, C.cx, C.cy); q2 = tepi(C, r.cx, r.cy)
    e1 = d.edge(A, r, [p1, p2], arrow_end=False, lurus=True); e2 = d.edge(r, C, [q1, q2], arrow_end=False, lurus=True)
    edges_diag += [(e1, A, r), (e2, r, C)]
    # kardinalitas dekat entitas: cari posisi bebas sepanjang garis lalu tegak lurus
    for (pa, pb, txt, e) in ((p1, p2, ka, e1), (q2, q1, kb, e2)):
        vx, vy = pb[0]-pa[0], pb[1]-pa[1]; L = math.hypot(vx, vy); ux, uy = vx/L, vy/L
        w, h = text_size(txt, FS_KARD, True); w += 6; h += 2   # sama dengan pad label
        def bebas(lx, ly):
            for b in d.boxes:
                if b.shape == "note": continue
                if tindih_kotak(lx-w/2, ly-h/2, lx+w/2, ly+h/2, b): return False
            return True
        pilih = None
        for sepanjang in (24, 32, 42, 54, 66, 80):
            for tegak in (13, -13, 17, -17, 22, -22, 27, -27):
                lx, ly = pa[0]+ux*sepanjang - uy*tegak, pa[1]+uy*sepanjang + ux*tegak
                if bebas(lx, ly): pilih = (lx, ly); break
            if pilih: break
        if not pilih: pilih = (pa[0]+ux*30 - uy*13, pa[1]+uy*30 + ux*13)
        d.label(pilih[0], pilih[1], txt, FS_KARD, bold=True, bg=False, owner=e)
d.box(1100, 890, 730, 150,
      "Notasi Chen (Chen, 1976; Pressman, 2001): persegi panjang menyatakan entitas, belah ketupat\n"
      "menyatakan relasi, dan angka pada garis menyatakan kardinalitas. Atribut tidak digambarkan karena\n"
      "rincian atribut kunci setiap entitas sudah disajikan pada tabel rekapitulasi entitas. Sebelas entitas\n"
      "pada diagram ini berkorespondensi dengan sebelas penyimpanan data pada Tabel IV.17. Relasi lkd ke\n"
      "simpulan_bkd berkardinalitas satu ke satu karena atribut id_lkd pada entitas simpulan_bkd berbatasan\n"
      "unik, sesuai aturan bisnis BR-05 yang menetapkan satu dokumen BKD memiliki paling banyak satu simpulan.",
      "note", "catatan", FS_NOTE)
d.save_drawio("IV-15-erd-chen.drawio")
# pemeriksaan umum tanpa uji ruas (uji ruas dg.check memakai bbox, tidak cocok untuk garis diagonal)
m0 = [x for x in d.check(verbose=False) if x.startswith(("kotak tindih", "teks meluap", "label tindih"))]
for x in m0: print("   -", x)
# pemeriksaan segmen diagonal vs kotak lain (Liang-Barsky)
def potong(p, q, r):
    x0,y0,x1,y1 = r; dx, dy = q[0]-p[0], q[1]-p[1]; t0, t1 = 0.0, 1.0
    for pp, qq in ((-dx, p[0]-x0), (dx, x1-p[0]), (-dy, p[1]-y0), (dy, y1-p[1])):
        if pp == 0:
            if qq < 0: return False
        else:
            t = qq/pp
            if pp < 0: t0 = max(t0, t)
            else: t1 = min(t1, t)
    return t0 < t1
masalah = 0
solid = [b for b in d.boxes if b.shape != "note"]
for e, A, B in edges_diag:
    for b in solid:
        if b is A or b is B: continue
        x0,y0,x1,y1 = d.abs_box(b)
        if potong(e.pts[0], e.pts[1], (x0+2,y0+2,x1-2,y1-2)):
            masalah += 1; print("   garis", A.text[:14], "-", B.text[:14], "menembus", b.text[:16])
    # garis diagonal vs kotak catatan
    for b in d.boxes:
        if b.shape == "note" and potong(e.pts[0], e.pts[1], d.abs_box(b)):
            masalah += 1; print("   garis", A.text[:14], "-", B.text[:14], "menembus catatan")
for l in d.labels:
    for b in solid:
        if tindih_kotak(l.x, l.y, l.x+l.w, l.y+l.h, b):
            masalah += 1; print("   label", l.text, "menimpa", b.text[:16])
print("   [ERD] segmen diagonal & label:", "BERSIH" if not masalah else f"{masalah} MASALAH")
d.render("iv15.png")
