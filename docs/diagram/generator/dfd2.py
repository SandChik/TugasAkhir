# -*- coding: utf-8 -*-
"""Klaster DFD generik: hub di tengah; entitas di kiri, kanan, atau atas; penyimpanan di bawah.
Semua rute ortogonal eksplisit, tanpa persilangan: garis milik objek yang lebih jauh dari sumbu
hub memakai jalur tegak/datar (bus) yang lebih dekat ke hub. Ukuran hub, jarak entitas, dan jarak
antarpenyimpanan dihitung dari jumlah garis dan lebar label supaya tidak ada yang berdempetan."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dg import Dia, text_size
FS = 8
GP = 24        # jarak dua garis dalam satu pasangan
GG = 30        # jarak antarpasangan
B0 = 40        # jarak bus pertama dari tepi hub
BS = 26        # jarak antarbus
LG = 8         # jarak label ke garisnya
SUDUT = 0.74   # titik masuk terjauh dari sumbu hub, relatif terhadap jari-jari

def ell_y(h, x, bawah=True):
    a, b = h.w/2, h.h/2; dx = max(-a, min(a, x-h.cx))
    return h.cy + (b if bawah else -b)*math.sqrt(max(0.0, 1-(dx/a)**2))
def ell_x(h, y, kanan=True):
    a, b = h.w/2, h.h/2; dy = max(-b, min(b, y-h.cy))
    return h.cx + (a if kanan else -a)*math.sqrt(max(0.0, 1-(dy/b)**2))
def wrap(t, n=20):
    if "\n" in t or len(t) <= n: return t
    cut = t.rfind(", ", 0, n+4)
    if cut < 6: cut = t.rfind(" ", 0, n+4)
    if cut < 6: return t
    return t[:cut+1].rstrip() + "\n" + t[cut+1:].lstrip()

def offset_grup(ukuran):
    """ukuran: jumlah garis tiap grup (1 atau 2) urut dari satu ujung. Kembalikan offset tiap garis
    terhadap sumbu hub; grup tengah (jumlah ganjil) tepat di sumbu, grup genap mengapit sumbu."""
    n = len(ukuran)
    if not n: return []
    lebar = [(k-1)*GP for k in ukuran]
    pos = [0.0]
    for i in range(1, n): pos.append(pos[-1] + lebar[i-1]/2 + GG + lebar[i]/2)
    if n % 2: nol = pos[n//2]
    else: nol = ((pos[n//2-1] + lebar[n//2-1]/2) + (pos[n//2] - lebar[n//2]/2)) / 2
    return [[p-nol-GP/2, p-nol+GP/2] if k == 2 else [p-nol] for p, k in zip(pos, ukuran)]

def urut_bus(pusat, garis_off):
    """pusat: posisi grup relatif sumbu; garis_off: offset tiap garis dalam grup (urut naik).
    Kembalikan {(grup, garis): indeks bus}; grup terjauh memakai bus terdekat ke hub."""
    bus = {}
    neg = sorted([i for i, p in enumerate(pusat) if p < -0.5], key=lambda i: pusat[i])
    pos = sorted([i for i, p in enumerate(pusat) if p > 0.5], key=lambda i: -pusat[i])
    k = 0
    for i in neg:
        for j in range(len(garis_off[i])): bus[(i, j)] = k; k += 1
    k = 0
    for i in pos:
        for j in reversed(range(len(garis_off[i]))): bus[(i, j)] = k; k += 1
    return bus

def ukur(teks):
    if not teks: return 0, 0
    return text_size(wrap(teks), FS)

def cluster(d, hub_text, cx, hub_cy, left=(), right=(), stores=(), atas=(),
            hub_w=210, hub_h=120, ent_w=150, ent_h=60, ent_gap=200, band=92,
            st_w=150, st_h=40, st_sp=172, fs_hub=10, top=None, jarak_atas=0, jarak_bawah=0, **_):
    """left/right/atas: [(teks, label_masuk, label_keluar)]; stores: [(teks, label_baca, label_tulis)].
    top: bila diisi, seluruh klaster digeser sehingga tepi atasnya berada di ordinat ini.
    jarak_atas/jarak_bawah: jarak minimum hub ke entitas atas / ke penyimpanan (menyejajarkan baris)."""
    mulai = (len(d.boxes), len(d.edges), len(d.labels))
    # ---- ukuran hub dari kebutuhan titik masuk ----
    def ukuran_sisi(items):
        return [sum(1 for x in it[1:] if x) or 1 for it in items]
    R_sisi = max([max((abs(o) for g in offset_grup(ukuran_sisi(s)) for o in g), default=0)
                  for s in (left, right)] + [0])
    R_atas = max((abs(o) for g in offset_grup(ukuran_sisi(atas)) for o in g), default=0)
    R_bawah = max((abs(o) for g in offset_grup(ukuran_sisi(stores)) for o in g), default=0)
    hub_h = max(hub_h, 2*R_sisi/SUDUT + 12)
    hub_w = max(hub_w, 2*max(R_atas, R_bawah)/SUDUT + 12)
    hub = d.box(cx-hub_w/2, hub_cy-hub_h/2, hub_w, hub_h, hub_text, "ellipse", "proses", fs_hub)

    # ---- entitas kiri / kanan ----
    def sisi(items, kiri):
        n = len(items)
        if not n: return
        ukuran = ukuran_sisi(items)
        hub_off = offset_grup(ukuran)
        # band cukup lebar supaya entitas selalu lebih jauh dari sumbu daripada titik masuknya
        maxh_in = max((ukur(it[1])[1] for it in items), default=0)
        maxh_out = max((ukur(it[2])[1] for it in items), default=0)
        bnd = max(band, maxh_in + maxh_out + GP + 2*LG + 40, 2*(R_sisi + GP) / max(1, n-1) if n > 1 else 0)
        pusat = [(i-(n-1)/2)*bnd for i in range(n)]
        dalam = [[o - sum(g)/len(g) for o in g] for g in hub_off]      # offset garis dalam grup
        bus = urut_bus(pusat, dalam)
        nbus = max([k+1 for k in bus.values()] + [0])
        maxw = max([ukur(it[1])[0] for it in items] + [ukur(it[2])[0] for it in items])
        gap = max(ent_gap, B0 + max(nbus-1, 0)*BS + 30 + maxw + 13)
        sg = 1 if kiri else -1
        for i, (teks, lin, lout) in enumerate(items):
            ecy = hub_cy + pusat[i]
            ex = hub.x-gap-ent_w if kiri else hub.x1+gap
            e = d.box(ex, ecy-ent_h/2, ent_w, ent_h, teks, "rect", "entitas", 10)
            es = e.x1 if kiri else e.x
            jenis = [j for j, x in (("in", lin), ("out", lout)) if x] or ["in"]
            for j, jn in enumerate(jenis):
                ey = ecy + dalam[i][j]
                hy = hub_cy + hub_off[i][j]
                hx = ell_x(hub, hy, not kiri)
                if abs(pusat[i]) < 0.5:
                    pts = [(es, ey), (hx, hy)]
                else:
                    vx = hub.x - B0 - bus[(i, j)]*BS if kiri else hub.x1 + B0 + bus[(i, j)]*BS
                    pts = [(es, ey), (vx, ey), (vx, hy), (hx, hy)]
                if jn == "in": eg = d.edge(e, hub, pts); lbl = lin
                else: eg = d.edge(hub, e, list(reversed(pts))); lbl = lout
                if not lbl: continue
                t = wrap(lbl); w, h = text_size(t, FS)
                atas_garis = (j == 0 and len(jenis) == 2) or (len(jenis) == 1 and jn == "in")
                d.label(es + sg*(13 + w/2), ey - 7 - h/2 if atas_garis else ey + 7 + h/2, t, FS, owner=eg)
    sisi(left, True); sisi(right, False)
    # elemen samping terendah: bus penyimpanan harus lewat di bawahnya
    samping = [b.y1 for b in d.boxes[mulai[0]+1:]] + [l.y + l.h for l in d.labels[mulai[2]:]]
    for e in d.edges[mulai[1]:]: samping += [p[1] for p in e.pts]
    bus_bawah0 = max(hub.y1 + B0, max(samping, default=0) + 34)

    # ---- entitas atas ----
    n = len(atas)
    if n:
        ukuran = ukuran_sisi(atas)
        hub_off = offset_grup(ukuran)
        maxw = max([ukur(it[1])[0] for it in atas] + [ukur(it[2])[0] for it in atas])
        sp = max(250, ent_w + 60, 2*(maxw + LG) + GP + 40)
        pusat = [(i-(n-1)/2)*sp for i in range(n)]
        dalam = [[o - sum(g)/len(g) for o in g] for g in hub_off]
        bus = urut_bus(pusat, dalam)
        nbus = max([k+1 for k in bus.values()] + [0])
        maxh = max([ukur(it[1])[1] for it in atas] + [ukur(it[2])[1] for it in atas])
        jarak = max(jarak_atas, B0 + max(nbus-1, 0)*BS + 24 + maxh + 12)
        for i, (teks, lin, lout) in enumerate(atas):
            ecx = cx + pusat[i]
            e = d.box(ecx-ent_w/2, hub.y-jarak-ent_h, ent_w, ent_h, teks, "rect", "entitas", 10)
            jenis = [j for j, x in (("in", lin), ("out", lout)) if x] or ["in"]
            for j, jn in enumerate(jenis):
                ex_ = ecx + dalam[i][j]
                hx = cx + hub_off[i][j]
                hy = ell_y(hub, hx, False)
                if abs(pusat[i]) < 0.5:
                    pts = [(ex_, e.y1), (hx, hy)]
                else:
                    by = hub.y - B0 - bus[(i, j)]*BS
                    pts = [(ex_, e.y1), (ex_, by), (hx, by), (hx, hy)]
                if jn == "in": eg = d.edge(e, hub, pts); lbl = lin
                else: eg = d.edge(hub, e, list(reversed(pts))); lbl = lout
                if not lbl: continue
                t = wrap(lbl); w, h = text_size(t, FS)
                kiri_garis = (j == 0 and len(jenis) == 2) or (len(jenis) == 1 and jn == "in")
                d.label(ex_ - LG - w/2 if kiri_garis else ex_ + LG + w/2, e.y1 + 10 + h/2, t, FS, owner=eg)

    # ---- penyimpanan bawah ----
    n = len(stores)
    if n:
        st_w = max([st_w] + [text_size(s[0], 9)[0] + 2*10 + 4 for s in stores])
        maxw = max([ukur(s[1])[0] for s in stores] + [ukur(s[2])[0] for s in stores])
        sp = max(st_sp, st_w + 50, GP + LG + maxw + 20)
        pusat = [(i-(n-1)/2)*sp for i in range(n)]
        # urutan garis tiap penyimpanan (kiri ke kanan): garis tulis di sisi luar
        garis = []
        for i, (teks, lbaca, ltulis) in enumerate(stores):
            ada = [x for x, l in (("tulis", ltulis), ("baca", lbaca)) if l] or ["baca"]
            if pusat[i] > 0.5: ada = list(reversed(ada))
            garis.append(ada)
        hub_off = offset_grup([len(g) for g in garis])
        dalam = [[o - sum(g)/len(g) for o in g] for g in hub_off]
        bus = urut_bus(pusat, dalam)
        nbus = max([k+1 for k in bus.values()] + [0])
        h_tulis = max([ukur(s[2])[1] for s in stores] + [0])
        h_baca = max([ukur(s[1])[1] for s in stores] + [0])
        turun = 24 + h_tulis + h_baca + 3*10
        store_top = max(hub.y1 + jarak_bawah, bus_bawah0 + max(nbus-1, 0)*BS + turun)
        for i, (teks, lbaca, ltulis) in enumerate(stores):
            sx = cx + pusat[i]
            st = d.box(sx-st_w/2, store_top, st_w, st_h, teks, "store", "simpan", 9)
            sgl = 1 if pusat[i] > 0.5 else -1
            luar = sx + sgl*max(abs(o) for o in dalam[i])
            for j, jn in enumerate(garis[i]):
                gx = sx + dalam[i][j]
                hx = cx + hub_off[i][j]
                hy = ell_y(hub, hx, True)
                if abs(pusat[i]) < 0.5:
                    pts = [(hx, hy), (gx, store_top)]
                else:
                    by = bus_bawah0 + bus[(i, j)]*BS
                    pts = [(hx, hy), (hx, by), (gx, by), (gx, store_top)]
                if jn == "tulis":
                    eg = d.edge(hub, st, pts)
                    if ltulis:
                        t = wrap(ltulis); w, h = text_size(t, FS)
                        d.label(luar + sgl*(LG + w/2), store_top - 10 - h_baca - 10 - h_tulis/2, t, FS, owner=eg)
                else:
                    eg = d.edge(st, hub, list(reversed(pts)))
                    if lbaca:
                        t = wrap(lbaca); w, h = text_size(t, FS)
                        d.label(luar + sgl*(LG + w/2), store_top - 10 - h_baca/2, t, FS, owner=eg)

    # ---- batas klaster dan penggeseran ----
    bx = d.boxes[mulai[0]:]; ed = d.edges[mulai[1]:]; lb = d.labels[mulai[2]:]
    def batas():
        xs = [b.x for b in bx] + [b.x1 for b in bx] + [l.x for l in lb] + [l.x + l.w for l in lb]
        ys = [b.y for b in bx] + [b.y1 for b in bx] + [l.y for l in lb] + [l.y + l.h for l in lb]
        for e in ed:
            xs += [p[0] for p in e.pts]; ys += [p[1] for p in e.pts]
        return min(xs), min(ys), max(xs), max(ys)
    if top is not None:
        dy = top - batas()[1]
        for b in bx: b.y += dy
        for l in lb: l.cy += dy
        for e in ed: e.pts = [(x, y + dy) for x, y in e.pts]
    return batas(), hub

def alir_langsung(d, a, b, label):
    """panah horizontal dari hub a ke hub b (sebaris), label di atas garis."""
    y = a.cy-10
    p = [(ell_x(a, y, True), y), (ell_x(b, y, False), y)]
    e = d.edge(a, b, p)
    t = wrap(label, 26); w, h = text_size(t, FS)
    d.label((p[0][0]+p[1][0])/2, y-6-h/2, t, FS, owner=e)

def batas_semua(d):
    xs, ys = [], []
    for b in d.boxes:
        x0, y0, x1, y1 = d.abs_box(b); xs += [x0, x1]; ys += [y0, y1]
    for l in d.labels: xs += [l.x, l.x + l.w]; ys += [l.y, l.y + l.h]
    for e in d.edges:
        for (x, y) in e.pts: xs.append(x); ys.append(y)
    return min(xs), min(ys), max(xs), max(ys)

def geser_semua(d, dx, dy):
    for b in d.boxes:
        if b.parent is None: b.x += dx; b.y += dy
    for l in d.labels: l.cx += dx; l.cy += dy
    for e in d.edges: e.pts = [(x + dx, y + dy) for (x, y) in e.pts]

def bingkai(d, margin=40):
    """geser isi ke margin kiri atas, lalu set ukuran kanvas."""
    x0, y0, x1, y1 = batas_semua(d)
    geser_semua(d, margin - x0, margin - y0)
    d.w, d.h = (x1 - x0) + 2*margin, (y1 - y0) + 2*margin
