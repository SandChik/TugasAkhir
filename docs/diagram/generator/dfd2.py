# -*- coding: utf-8 -*-
"""Klaster DFD generik: hub di tengah; entitas di kiri, kanan, atau atas; penyimpanan di bawah.
Semua rute ortogonal eksplisit, tanpa persilangan (aturan sarang)."""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dg import Dia, text_size
FS = 8
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

def cluster(d, hub_text, cx, hub_cy, left=(), right=(), stores=(), atas=(),
            hub_w=190, hub_h=115, ent_w=150, ent_h=60, ent_gap=200, band=92,
            st_w=150, st_h=40, st_sp=172, bus0=22, bus_step=30, pair=12, drop=84, fs_hub=10):
    hub = d.box(cx-hub_w/2, hub_cy-hub_h/2, hub_w, hub_h, hub_text, "ellipse", "proses", fs_hub)
    x0, x1, y0, y1 = hub.x, hub.x1, hub.y, hub.y1
    # ---- entitas kiri / kanan ----
    def sisi(items, kiri):
        nonlocal x0, x1, y0, y1
        n = len(items)
        for i, (teks, lin, lout) in enumerate(items):
            ecy = hub_cy + (i-(n-1)/2)*band
            ex = hub.x-ent_gap-ent_w if kiri else hub.x1+ent_gap
            e = d.box(ex, ecy-ent_h/2, ent_w, ent_h, teks, "rect", "entitas", 10)
            x0, x1, y0, y1 = min(x0, e.x), max(x1, e.x1), min(y0, e.y), max(y1, e.y1)
            rank = abs(i-(n-1)/2); dy = ecy-hub_cy
            hy_in = hub_cy + (i-(n-1)/2)*24 - 6; hy_out = hy_in + 12
            ey_in, ey_out = ecy-9, ecy+9
            if kiri:
                es = e.x1; hs, hs_o = ell_x(hub, hy_in, False), ell_x(hub, hy_out, False)
                vx_in = hub.x-40-rank*22; vx_out = vx_in-10; sg = 1
            else:
                es = e.x; hs, hs_o = ell_x(hub, hy_in, True), ell_x(hub, hy_out, True)
                vx_in = hub.x1+40+rank*22; vx_out = vx_in+10; sg = -1
            if abs(dy) < 1:
                pin = [(es, ey_in), (hs, hy_in)]; pout = [(hs_o, hy_out), (es, ey_out)]
            else:
                pin = [(es, ey_in), (vx_in, ey_in), (vx_in, hy_in), (hs, hy_in)]
                pout = [(hs_o, hy_out), (vx_out, hy_out), (vx_out, ey_out), (es, ey_out)]
            ein = d.edge(e, hub, pin) if lin else None
            eout = d.edge(hub, e, pout) if lout else None
            if lin:
                t = wrap(lin); w, h = text_size(t, FS)
                d.label(es+sg*(13+w/2), ey_in-4-h/2, t, FS, owner=ein)
            if lout:
                t = wrap(lout); w, h = text_size(t, FS)
                d.label(es+sg*(13+w/2), ey_out+4+h/2, t, FS, owner=eout)
    sisi(left, True); sisi(right, False)
    # ---- entitas atas ----
    n = len(atas)
    if n:
        sp = 250
        for i, (teks, lin, lout) in enumerate(atas):
            ecx = cx + (i-(n-1)/2)*sp
            e = d.box(ecx-ent_w/2, hub.y-110-ent_h, ent_w, ent_h, teks, "rect", "entitas", 10)
            x0, x1, y0 = min(x0, e.x), max(x1, e.x1), min(y0, e.y)
            xin, xout = ecx-12, ecx+12
            if abs(ecx-cx) < 1:
                pin = [(xin, e.y1), (xin, ell_y(hub, xin, False))]
                pout = [(xout, ell_y(hub, xout, False)), (xout, e.y1)]
            else:
                by = hub.y-40; hx_in = cx + (i-(n-1)/2)*30 - 6; hx_out = hx_in+12
                pin = [(xin, e.y1), (xin, by), (hx_in, by), (hx_in, ell_y(hub, hx_in, False))]
                pout = [(hx_out, ell_y(hub, hx_out, False)), (hx_out, by+10), (xout, by+10), (xout, e.y1)]
            ein = d.edge(e, hub, pin) if lin else None
            eout = d.edge(hub, e, pout) if lout else None
            if lin:
                t = wrap(lin); w, h = text_size(t, FS)
                d.label(xin-6-w/2, e.y1+12+h/2, t, FS, owner=ein)
            if lout:
                t = wrap(lout); w, h = text_size(t, FS)
                d.label(xout+6+w/2, e.y1+12+h/2, t, FS, owner=eout)
    # ---- penyimpanan bawah ----
    n = len(stores)
    if n:
        sxs = [cx+(i-(n-1)/2)*st_sp for i in range(n)]
        ki = [i for i in range(n) if sxs[i] < cx-1]; ka = [i for i in range(n) if sxs[i] > cx+1]
        te = [i for i in range(n) if abs(sxs[i]-cx) <= 1]
        R = max(len(ki), len(ka), 1)-1
        store_top = hub.y1+bus0+R*bus_step+pair+drop
        for i, (teks, lbaca, ltulis) in enumerate(stores):
            sx = sxs[i]
            st = d.box(sx-st_w/2, store_top, st_w, st_h, teks, "store", "simpan", 9)
            x0, x1, y1 = min(x0, st.x), max(x1, st.x1), max(y1, st.y1)
            if i in te:
                pt = [(cx-8, ell_y(hub, cx-8)), (cx-8, store_top)]
                pb = [(cx+8, store_top), (cx+8, ell_y(hub, cx+8))]
                sgl = -1
            else:
                grp = ki if i in ki else ka
                rank = sorted(grp, key=lambda k: abs(sxs[k]-cx)).index(i)
                bus = hub.y1+bus0+(R-rank)*bus_step
                sgn = -1 if i in ki else 1
                ex = cx+sgn*(20+rank*18)
                pt = [(ex+sgn*6, ell_y(hub, ex+sgn*6)), (ex+sgn*6, bus), (sx+sgn*8, bus), (sx+sgn*8, store_top)]
                pb = [(sx-sgn*8, store_top), (sx-sgn*8, bus+pair), (ex-sgn*6, bus+pair), (ex-sgn*6, ell_y(hub, ex-sgn*6))]
                sgl = sgn
            et = d.edge(hub, st, pt) if ltulis else None
            eb = d.edge(st, hub, pb) if lbaca else None
            luar = sx+sgl*8
            if ltulis:
                t = wrap(ltulis); w, h = text_size(t, FS)
                d.label(luar+sgl*(9+w/2), store_top-56, t, FS, owner=et)
            if lbaca:
                t = wrap(lbaca); w, h = text_size(t, FS)
                d.label(luar+sgl*(9+w/2), store_top-22, t, FS, owner=eb)
    return (x0, y0, x1, y1), hub

def alir_langsung(d, a, b, label):
    """panah horizontal dari hub a ke hub b (sebaris), label di atas garis."""
    y = a.cy-10
    p = [(ell_x(a, y, True), y), (ell_x(b, y, False), y)]
    e = d.edge(a, b, p)
    t = wrap(label, 26); w, h = text_size(t, FS)
    d.label((p[0][0]+p[1][0])/2, y-6-h/2, t, FS, owner=e)
