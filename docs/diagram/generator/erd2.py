# -*- coding: utf-8 -*-
"""ERD notasi Chen. Belah ketupat diletakkan tepat pada garis antar-entitas (parameter t, 0..1 dari
entitas pertama ke entitas kedua) supaya tidak ada tekukan. Posisi entitas dipilih pada grid sehingga
tidak ada garis yang bersilang dan setiap garis berjarak dari kotak yang bukan ujungnya."""
import sys, os, math; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dg import Dia, text_size
from dfd2 import bingkai
d = Dia("Gambar IV.15 ERD Notasi Chen Sistem LedgerDik", 10, 10)
EW, EH, RW, RH = 250, 64, 200, 90
FS_ENT, FS_REL, FS_KARD, FS_NOTE = 15, 10, 13, 9
# pusat entitas pada grid 520 x 270; dipilih dengan pencarian tata letak tanpa persilangan garis
EC = {"unggahan_dokumen":(690,370),
      "referensi_kegiatan":(170,640),
      "periode_bkd":(690,640),
      "simpulan_bkd":(1210,640),
      "pengguna":(1730,640),
      "kegiatan":(170,910),
      "lkd":(690,910),
      "penugasan_asesor":(1210,910),
      "dokumen_kegiatan":(170,1180),
      "hasil_penilaian":(690,1180),
      "riwayat_transaksi":(1210,1180)}
ne = {k: d.box(cx-EW/2, cy-EH/2, EW, EH, k, "rect", "entity", FS_ENT, bold=True) for k,(cx,cy) in EC.items()}
# (entitas a, entitas c, nama relasi, kardinalitas di a, kardinalitas di c, posisi t pada garis a->c)
REL = [("periode_bkd","lkd","menaungi","1","N",0.50),
       ("pengguna","lkd","memiliki","1","N",0.50),
       ("periode_bkd","unggahan_dokumen","mencakup","1","N",0.50),
       ("pengguna","unggahan_dokumen","mengunggah","1","N",0.50),
       ("unggahan_dokumen","kegiatan","menurunkan","1","N",0.50),
       ("lkd","kegiatan","memuat","1","N",0.50),
       ("referensi_kegiatan","kegiatan","mengacu","1","N",0.50),
       ("kegiatan","dokumen_kegiatan","melampirkan","1","N",0.50),
       ("kegiatan","hasil_penilaian","dinilai","1","N",0.50),
       ("lkd","penugasan_asesor","ditugaskan","1","N",0.50),
       ("pengguna","penugasan_asesor","bertindak\nsebagai asesor","1","N",0.50),
       ("penugasan_asesor","hasil_penilaian","menghasilkan","1","N",0.50),
       ("lkd","simpulan_bkd","menyimpulkan","1","1",0.50),
       ("hasil_penilaian","riwayat_transaksi","memicu","1","N",0.50),
       ("pengguna","riwayat_transaksi","menjalankan\nkoreksi","1","N",0.50)]
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
def tindih_kotak(x0, y0, x1, y1, b, jarak=6):
    """persegi (x0,y0,x1,y1) diperbesar `jarak` bersentuhan dengan kotak b; belah ketupat diuji bentuk aslinya."""
    x0, y0, x1, y1 = x0-jarak, y0-jarak, x1+jarak, y1+jarak
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
def jarak_titik_ruas(px, py, a, b):
    dx, dy = b[0]-a[0], b[1]-a[1]; L = dx*dx + dy*dy
    t = max(0, min(1, ((px-a[0])*dx + (py-a[1])*dy)/L)) if L else 0
    return math.hypot(px-a[0]-t*dx, py-a[1]-t*dy)
garis = []
for a, c, nama, ka, kb, t in REL:
    A, C = ne[a], ne[c]
    rx, ry = A.cx + t*(C.cx-A.cx), A.cy + t*(C.cy-A.cy)
    r = d.box(rx-RW/2, ry-RH/2, RW, RH, nama, "rhombus", "relasi", FS_REL)
    p1 = tepi(A, r.cx, r.cy); p2 = tepi_rh(r, A.cx, A.cy)
    q1 = tepi_rh(r, C.cx, C.cy); q2 = tepi(C, r.cx, r.cy)
    e1 = d.edge(A, r, [p1, p2], arrow_end=False, lurus=True); e2 = d.edge(r, C, [q1, q2], arrow_end=False, lurus=True)
    garis += [(p1, p2), (q1, q2)]
    r.kard = ((p1, p2, ka, e1), (q2, q1, kb, e2))
# kardinalitas dekat entitas: cari posisi bebas sepanjang garis lalu tegak lurus, jauh dari garis lain
for r in [b for b in d.boxes if b.shape == "rhombus"]:
    for (pa, pb, txt, e) in r.kard:
        vx, vy = pb[0]-pa[0], pb[1]-pa[1]; L = math.hypot(vx, vy); ux, uy = vx/L, vy/L
        w, h = text_size(txt, FS_KARD, True); w += 6; h += 2   # sama dengan pad label
        def bebas(lx, ly):
            for b in d.boxes:
                if tindih_kotak(lx-w/2, ly-h/2, lx+w/2, ly+h/2, b): return False
            for l in d.labels:
                if abs(lx-l.cx) < (w+l.w)/2+6 and abs(ly-l.cy) < (h+l.h)/2+6: return False
            for (a, b) in garis:
                if (a, b) == (pa, pb) or (b, a) == (pa, pb): continue
                if jarak_titik_ruas(lx, ly, a, b) < max(w, h)/2 + 8: return False
            return True
        pilih = None
        for sepanjang in (26, 34, 44, 56, 70, 86):
            for tegak in (16, -16, 20, -20, 25, -25):
                lx, ly = pa[0]+ux*sepanjang - uy*tegak, pa[1]+uy*sepanjang + ux*tegak
                if bebas(lx, ly): pilih = (lx, ly); break
            if pilih: break
        if not pilih: pilih = (pa[0]+ux*30 - uy*16, pa[1]+uy*30 + ux*16); print("   kardinalitas tanpa tempat bebas:", txt, r.text)
        d.label(pilih[0], pilih[1], txt, FS_KARD, bold=True, bg=False, owner=e)
xs = [b.x for b in d.boxes]; ys = [b.y1 for b in d.boxes]
d.box(min(xs), max(ys) + 60, 730, 150,
      "Notasi Chen (Chen, 1976; Pressman, 2001): persegi panjang menyatakan entitas, belah ketupat\n"
      "menyatakan relasi, dan angka pada garis menyatakan kardinalitas. Atribut tidak digambarkan karena\n"
      "rincian atribut kunci setiap entitas sudah disajikan pada tabel rekapitulasi entitas. Sebelas entitas\n"
      "pada diagram ini berkorespondensi dengan sebelas penyimpanan data pada Tabel IV.17. Relasi lkd ke\n"
      "simpulan_bkd berkardinalitas satu ke satu karena atribut id_lkd pada entitas simpulan_bkd berbatasan\n"
      "unik, sesuai aturan bisnis BR-05 yang menetapkan satu dokumen BKD memiliki paling banyak satu simpulan.",
      "note", "catatan", FS_NOTE)
bingkai(d)
d.save_drawio("IV-15-erd-chen.drawio"); d.check(); d.render("iv15.png")
