# -*- coding: utf-8 -*-
import sys, os, math; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dg import Dia, text_size
d = Dia("Gambar IV.15 ERD Notasi Chen Sistem LedgerDik", 2000, 1340)
EW, EH, RW, RH = 190, 60, 165, 78
EPOS = {"periode_bkd":(60,120),"unggahan_dokumen":(700,60),"referensi_kegiatan":(1720,120),
 "pengguna":(60,560),"lkd":(700,420),"kegiatan":(1280,420),"dokumen_kegiatan":(1720,620),
 "penugasan_asesor":(700,820),"hasil_penilaian":(1280,820),"simpulan_bkd":(60,1010),"riwayat_transaksi":(700,1130)}
ne = {k: d.box(x, y, EW, EH, k, "rect", "entity", 11, bold=True) for k,(x,y) in EPOS.items()}
REL = [("periode_bkd","lkd","menaungi","1","N",(330,215)),("pengguna","lkd","memiliki","1","N",(330,470)),
 ("periode_bkd","unggahan_dokumen","mencakup","1","N",(350,55)),("pengguna","unggahan_dokumen","mengunggah","1","N",(297,376)),
 ("unggahan_dokumen","kegiatan","menurunkan","1","N",(1000,180)),("lkd","kegiatan","memuat","1","N",(1000,430)),
 ("referensi_kegiatan","kegiatan","mengacu","1","N",(1520,250)),("kegiatan","dokumen_kegiatan","melampirkan","1","N",(1560,490)),
 ("kegiatan","hasil_penilaian","dinilai","1","N",(1300,620)),("lkd","penugasan_asesor","ditugaskan","1","N",(710,620)),
 ("pengguna","penugasan_asesor","bertindak\nsebagai asesor","1","N",(330,770)),
 ("penugasan_asesor","hasil_penilaian","menghasilkan","1","N",(1000,830)),
 ("lkd","simpulan_bkd","menyimpulkan","1","1",(380,900)),("hasil_penilaian","riwayat_transaksi","memicu","1","N",(1000,1010)),
 ("pengguna","riwayat_transaksi","menjalankan\nkoreksi","1","N",(330,1140))]
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
edges_diag = []
for a, c, nama, ka, kb, (x, y) in REL:
    r = d.box(x, y, RW, RH, nama, "rhombus", "relasi", 9)
    A, C = ne[a], ne[c]
    p1 = tepi(A, r.cx, r.cy); p2 = tepi_rh(r, A.cx, A.cy)
    q1 = tepi_rh(r, C.cx, C.cy); q2 = tepi(C, r.cx, r.cy)
    e1 = d.edge(A, r, [p1, p2], arrow_end=False); e2 = d.edge(r, C, [q1, q2], arrow_end=False)
    edges_diag += [(e1, A, r), (e2, r, C)]
    # kardinalitas dekat entitas: geser 18 px sepanjang garis dari tepi entitas, lalu 12 px tegak lurus
    for (pa, pb, txt, e) in ((p1, p2, ka, e1), (q2, q1, kb, e2)):
        vx, vy = pb[0]-pa[0], pb[1]-pa[1]; L = math.hypot(vx, vy); ux, uy = vx/L, vy/L
        w, h = text_size(txt, 10, True); w += 4; h += 2
        def bebas(lx, ly):
            for b in d.boxes:
                if b.shape == "note": continue
                x0,y0,x1,y1 = d.abs_box(b)
                if lx-w/2 < x1 and x0 < lx+w/2 and ly-h/2 < y1 and y0 < ly+h/2: return False
            return True
        pilih = None
        for sepanjang in (22, 30, 40, 52):
            for tegak in (11, -11, 14, -14):
                lx, ly = pa[0]+ux*sepanjang - uy*tegak, pa[1]+uy*sepanjang + ux*tegak
                if bebas(lx, ly): pilih = (lx, ly); break
            if pilih: break
        if not pilih: pilih = (pa[0]+ux*30 - uy*11, pa[1]+uy*30 + ux*11)
        d.label(pilih[0], pilih[1], txt, 10, bold=True, bg=False, owner=e)
d.box(1240, 1140, 700, 150,
      "Notasi Chen (Chen, 1976; Pressman, 2001): persegi panjang menyatakan entitas, belah ketupat menyatakan\n"
      "relasi, dan angka pada garis menyatakan kardinalitas. Atribut tidak digambarkan karena rincian atribut kunci\n"
      "setiap entitas sudah disajikan pada tabel rekapitulasi entitas. Sebelas entitas pada diagram ini berkorespondensi\n"
      "dengan sebelas penyimpanan data pada Tabel IV.17. Relasi lkd ke simpulan_bkd berkardinalitas satu ke satu karena\n"
      "atribut id_lkd pada entitas simpulan_bkd berbatasan unik, sesuai aturan bisnis BR-05 yang menetapkan satu\n"
      "dokumen BKD memiliki paling banyak satu simpulan.", "note", "catatan", 9)
d.save_drawio("IV-15-erd-chen.drawio")
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
for l in d.labels:
    for b in solid:
        x0,y0,x1,y1 = d.abs_box(b)
        if l.x < x1 and x0 < l.x+l.w and l.y < y1 and y0 < l.y+l.h:
            masalah += 1; print("   label", l.text, "menimpa", b.text[:16])
print("   [ERD] segmen diagonal & label:", "BERSIH" if not masalah else f"{masalah} MASALAH")
d.render("iv15.png")
