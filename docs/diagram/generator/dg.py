# -*- coding: utf-8 -*-
"""Toolkit diagram: koordinat eksplisit -> XML draw.io + PNG (Pillow) + pemeriksaan."""
import io, os, html, math, itertools
from PIL import Image, ImageDraw, ImageFont

_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DRAWIO = os.path.normpath(os.path.join(_DIR, ".."))
OUT_PNG = os.path.join(_DIR, "pratinjau")
os.makedirs(OUT_PNG, exist_ok=True)
FONT_PATH = "C:/Windows/Fonts/arial.ttf"
FONT_BOLD = "C:/Windows/Fonts/arialbd.ttf"
_fonts = {}
def font(size, bold=False):
    k = (size, bold)
    if k not in _fonts:
        _fonts[k] = ImageFont.truetype(FONT_BOLD if bold else FONT_PATH, size)
    return _fonts[k]
def text_size(text, fs, bold=False):
    f = font(fs, bold)
    lines = text.split("\n")
    w = max((f.getbbox(l)[2] - f.getbbox(l)[0]) if l else 0 for l in lines)
    return w, int(len(lines) * fs * 1.25)

WARNA = {
    "proses":  ("#dae8fc", "#6c8ebf"), "entitas": ("#f5f5f5", "#666666"),
    "simpan":  ("#fff2cc", "#d6b656"), "modul":   ("#ffffff", "#666666"),
    "akar":    ("#dae8fc", "#6c8ebf"), "jaga":    ("#fff2cc", "#d6b656"),
    "relasi":  ("#d5e8d4", "#82b366"), "entity":  ("#dae8fc", "#6c8ebf"),
    "chain":   ("#d5e8d4", "#82b366"), "eks":     ("#ffe6cc", "#d79b00"),
    "web":     ("#dae8fc", "#6c8ebf"), "putih":   ("#ffffff", "#666666"),
    "term":    ("#d5e8d4", "#82b366"), "putusan": ("#fff2cc", "#d6b656"),
    "konektor":("#ffffff", "#000000"), "admin":   ("#e1d5e7", "#9673a6"),
    "dosen":   ("#fff2cc", "#d6b656"), "asesor":  ("#dae8fc", "#6c8ebf"),
    "sistem":  ("#f5f5f5", "#666666"), "luar":    ("#ffffff", "#999999"),
    "catatan": ("#ffffff", "#999999"), "grup":    (None, "#999999"),
}

class Box:
    def __init__(s, id, x, y, w, h, text, shape, warna, fs, bold=False, parent=None, align="center", dashed=False):
        s.id, s.x, s.y, s.w, s.h, s.text, s.shape, s.warna, s.fs, s.bold = id, x, y, w, h, text, shape, warna, fs, bold
        s.parent, s.align, s.dashed = parent, align, dashed
    @property
    def cx(s): return s.x + s.w / 2
    @property
    def cy(s): return s.y + s.h / 2
    @property
    def x1(s): return s.x + s.w
    @property
    def y1(s): return s.y + s.h

class Edge:
    def __init__(s, id, src, dst, pts, arrow_end=True, arrow_start=False, tail_circle=False):
        s.id, s.src, s.dst, s.pts, s.arrow_end, s.arrow_start = id, src, dst, pts, arrow_end, arrow_start
        s.tail_circle = tail_circle

class Label:
    def __init__(s, id, cx, cy, text, fs, w, h, bold=False, bg=True, owner=None):
        s.id, s.cx, s.cy, s.text, s.fs, s.w, s.h, s.bold, s.bg, s.owner = id, cx, cy, text, fs, w, h, bold, bg, owner
    @property
    def x(s): return s.cx - s.w / 2
    @property
    def y(s): return s.cy - s.h / 2

class Dia:
    def __init__(s, nama, w, h):
        s.nama, s.w, s.h = nama, w, h
        s.boxes, s.edges, s.labels = [], [], []
        s.n = 0
    def nid(s, p="n"):
        s.n += 1; return f"{p}{s.n}"
    def box(s, x, y, w, h, text, shape="rect", warna="entitas", fs=10, bold=False, parent=None, align="center", dashed=False):
        b = Box(s.nid(), x, y, w, h, text, shape, warna, fs, bold, parent, align, dashed)
        s.boxes.append(b); return b
    def edge(s, src, dst, pts, arrow_end=True, arrow_start=False, tail_circle=False):
        e = Edge(s.nid("e"), src, dst, pts, arrow_end, arrow_start, tail_circle)
        s.edges.append(e); return e
    def label(s, cx, cy, text, fs=8, bold=False, bg=True, pad=3, owner=None):
        w, h = text_size(text, fs, bold)
        l = Label(s.nid("l"), cx, cy, text, fs, w + 2 * pad, h + 2, bold, bg, owner)
        s.labels.append(l); return l
    # ---------- pembantu geometri ----------
    def abs_box(s, b):
        x, y = b.x, b.y
        p = b.parent
        while p is not None:
            x += p.x; y += p.y; p = p.parent
        return x, y, x + b.w, y + b.h

    # ---------- XML draw.io ----------
    def style_box(s, b):
        fill, stroke = WARNA[b.warna]
        base = f"whiteSpace=wrap;html=1;fontSize={b.fs};align={b.align};strokeColor={stroke};"
        base += f"fillColor={fill};" if fill else "fillColor=none;"
        if b.bold: base += "fontStyle=1;"
        if b.dashed: base += "dashed=1;"
        sh = {
            "rect": "rounded=0;", "ellipse": "ellipse;", "rhombus": "rhombus;",
            "store": "shape=partialRectangle;top=1;bottom=1;left=0;right=0;",
            "note": "shape=note;size=14;verticalAlign=top;spacingLeft=4;spacingTop=2;",
            "term": "rounded=1;arcSize=50;", "konektor": "ellipse;",
            "lane": "swimlane;startSize=34;horizontal=1;fontStyle=1;verticalAlign=middle;",
            "grup": "rounded=0;verticalAlign=top;fontStyle=1;spacingTop=4;",
            "text": "text;strokeColor=none;",
        }[b.shape]
        if b.shape == "note": base = base.replace("align=center", "align=left")
        return sh + base
    def save_drawio(s, fn):
        o = [f'<mxfile host="app.diagrams.net" type="device">\n  <diagram name="{html.escape(s.nama)}" id="{s.nid("d")}">\n'
             f'    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" '
             f'fold="1" page="1" pageScale="1" pageWidth="{s.w}" pageHeight="{s.h}" math="0" shadow="0">\n      <root>\n'
             '        <mxCell id="0" />\n        <mxCell id="1" parent="0" />\n']
        for b in s.boxes:
            par = b.parent.id if b.parent else "1"
            o.append(f'        <mxCell id="{b.id}" value="{html.escape(b.text)}" style="{s.style_box(b)}" vertex="1" parent="{par}">\n'
                     f'          <mxGeometry x="{b.x:.0f}" y="{b.y:.0f}" width="{b.w:.0f}" height="{b.h:.0f}" as="geometry" />\n        </mxCell>\n')
        bid = {b.id: b for b in s.boxes}
        for e in s.edges:
            st = "edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeColor=#000000;"
            st += "endArrow=classic;" if e.arrow_end else "endArrow=none;"
            st += "startArrow=classic;" if e.arrow_start else ("startArrow=oval;startFill=0;startSize=7;" if e.tail_circle else "startArrow=none;")
            attrs = ""
            if e.src is not None:
                ax, ay, ax1, ay1 = s.abs_box(e.src)
                px, py = e.pts[0]
                st += f"exitX={(px-ax)/(ax1-ax):.3f};exitY={(py-ay)/(ay1-ay):.3f};exitDx=0;exitDy=0;"
                if e.src.shape in ("ellipse", "konektor"): st += "exitPerimeter=0;"
                attrs += f' source="{e.src.id}"'
            if e.dst is not None:
                bx, by, bx1, by1 = s.abs_box(e.dst)
                qx, qy = e.pts[-1]
                st += f"entryX={(qx-bx)/(bx1-bx):.3f};entryY={(qy-by)/(by1-by):.3f};entryDx=0;entryDy=0;"
                if e.dst.shape in ("ellipse", "konektor"): st += "entryPerimeter=0;"
                attrs += f' target="{e.dst.id}"'
            mid = e.pts[1:-1]
            o.append(f'        <mxCell id="{e.id}" value="" style="{st}" edge="1" parent="1"{attrs}>\n'
                     f'          <mxGeometry relative="1" as="geometry">\n')
            if e.src is None:
                o.append(f'            <mxPoint x="{e.pts[0][0]:.0f}" y="{e.pts[0][1]:.0f}" as="sourcePoint" />\n')
            if e.dst is None:
                o.append(f'            <mxPoint x="{e.pts[-1][0]:.0f}" y="{e.pts[-1][1]:.0f}" as="targetPoint" />\n')
            if mid:
                o.append('            <Array as="points">\n')
                for (x, y) in mid: o.append(f'              <mxPoint x="{x:.0f}" y="{y:.0f}" />\n')
                o.append('            </Array>\n')
            o.append('          </mxGeometry>\n        </mxCell>\n')
        for l in s.labels:
            st = (f"text;html=1;whiteSpace=wrap;fontSize={l.fs};align=center;verticalAlign=middle;"
                  f"strokeColor=none;{'fillColor=#ffffff;' if l.bg else 'fillColor=none;'}{'fontStyle=1;' if l.bold else ''}")
            o.append(f'        <mxCell id="{l.id}" value="{html.escape(l.text)}" style="{st}" vertex="1" parent="1">\n'
                     f'          <mxGeometry x="{l.x:.0f}" y="{l.y:.0f}" width="{l.w:.0f}" height="{l.h:.0f}" as="geometry" />\n        </mxCell>\n')
        o.append('      </root>\n    </mxGraphModel>\n  </diagram>\n</mxfile>\n')
        io.open(os.path.join(OUT_DRAWIO, fn), "w", encoding="utf-8").write("".join(o))

    # ---------- PNG ----------
    def render(s, fn, scale=1.0):
        W, H = int(s.w * scale), int(s.h * scale)
        im = Image.new("RGB", (W, H), "white")
        dr = ImageDraw.Draw(im)
        S = lambda v: v * scale
        def teks(cx, cy, text, fs, bold, warna="black", align="center", top=None, left=None):
            f = font(max(1, int(fs * scale)), bold)
            lines = text.split("\n"); lh = fs * 1.25 * scale
            th = lh * len(lines)
            y0 = top if top is not None else cy - th / 2
            for i, ln in enumerate(lines):
                bb = f.getbbox(ln); tw = bb[2] - bb[0]
                if align == "center": x0 = cx - tw / 2
                elif align == "left": x0 = left
                else: x0 = cx - tw
                dr.text((x0, y0 + i * lh), ln, fill=warna, font=f)
        # garis dulu supaya kotak menutupi ujungnya
        for e in s.edges:
            pts = [(S(x), S(y)) for x, y in e.pts]
            dr.line(pts, fill="black", width=max(1, int(1.2 * scale)))
            def panah(a, b):
                (x0, y0), (x1, y1) = a, b
                ang = math.atan2(y1 - y0, x1 - x0); L = 9 * scale
                p1 = (x1 - L * math.cos(ang - 0.4), y1 - L * math.sin(ang - 0.4))
                p2 = (x1 - L * math.cos(ang + 0.4), y1 - L * math.sin(ang + 0.4))
                dr.polygon([(x1, y1), p1, p2], fill="black")
            if e.arrow_end: panah(pts[-2], pts[-1])
            if e.arrow_start: panah(pts[1], pts[0])
            if e.tail_circle:
                r = 4 * scale; x, y = pts[0]
                dr.ellipse([x - r, y - r, x + r, y + r], fill="white", outline="black", width=max(1, int(1.2 * scale)))
        for b in s.boxes:
            x0, y0, x1, y1 = [S(v) for v in s.abs_box(b)]
            fill, stroke = WARNA[b.warna]
            if b.shape == "grup":
                dr.rectangle([x0, y0, x1, y1], outline=stroke, width=1)
                teks((x0 + x1) / 2, 0, b.text, b.fs, True, top=y0 + 4 * scale)
            elif b.shape == "lane":
                dr.rectangle([x0, y0, x1, y1], outline=stroke, width=1)
                dr.line([x0, y0 + 34 * scale, x1, y0 + 34 * scale], fill=stroke)
                teks((x0 + x1) / 2, y0 + 17 * scale, b.text, b.fs, True)
            elif b.shape == "ellipse" or b.shape == "konektor":
                dr.ellipse([x0, y0, x1, y1], fill=fill, outline=stroke, width=1)
                teks((x0 + x1) / 2, (y0 + y1) / 2, b.text, b.fs, b.bold)
            elif b.shape == "rhombus":
                cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
                dr.polygon([(cx, y0), (x1, cy), (cx, y1), (x0, cy)], fill=fill, outline=stroke)
                teks(cx, cy, b.text, b.fs, b.bold)
            elif b.shape == "store":
                dr.rectangle([x0, y0, x1, y1], fill=fill)
                dr.line([x0, y0, x1, y0], fill=stroke, width=1); dr.line([x0, y1, x1, y1], fill=stroke, width=1)
                teks((x0 + x1) / 2, (y0 + y1) / 2, b.text, b.fs, b.bold)
            elif b.shape == "note":
                dr.rectangle([x0, y0, x1, y1], fill=fill, outline=stroke)
                dr.polygon([(x1 - 14 * scale, y0), (x1, y0 + 14 * scale), (x1 - 14 * scale, y0 + 14 * scale)], fill="#dddddd", outline=stroke)
                teks(0, 0, b.text, b.fs, False, align="left", top=y0 + 4 * scale, left=x0 + 6 * scale)
            elif b.shape == "term":
                dr.rounded_rectangle([x0, y0, x1, y1], radius=int(b.h * scale / 2), fill=fill, outline=stroke)
                teks((x0 + x1) / 2, (y0 + y1) / 2, b.text, b.fs, b.bold)
            elif b.shape == "text":
                teks((x0 + x1) / 2, (y0 + y1) / 2, b.text, b.fs, b.bold)
            else:
                dr.rectangle([x0, y0, x1, y1], fill=fill, outline=stroke, width=1)
                teks((x0 + x1) / 2, (y0 + y1) / 2, b.text, b.fs, b.bold)
        for l in s.labels:
            x0, y0, x1, y1 = S(l.x), S(l.y), S(l.x + l.w), S(l.y + l.h)
            if l.bg: dr.rectangle([x0, y0, x1, y1], fill="white")
            teks((x0 + x1) / 2, (y0 + y1) / 2, l.text, l.fs, l.bold)
        p = os.path.join(OUT_PNG, fn)
        im.save(p); return p

    # ---------- pemeriksaan ----------
    def check(s, verbose=True):
        m = []
        def overlap(a, b):
            return a[0] < b[2] and b[0] < a[2] and a[1] < b[3] and b[1] < a[3]
        solid = [(b, s.abs_box(b)) for b in s.boxes if b.shape not in ("grup", "lane", "text")]
        for (a, ra), (b, rb) in itertools.combinations(solid, 2):
            if a.parent is b or b.parent is a: continue
            if overlap(ra, rb): m.append(f"kotak tindih: '{a.text[:22]}' x '{b.text[:22]}'")
        labs = [(l, (l.x, l.y, l.x + l.w, l.y + l.h)) for l in s.labels]
        for (a, ra), (b, rb) in itertools.combinations(labs, 2):
            if overlap(ra, rb): m.append(f"label tindih: '{a.text[:20]}' x '{b.text[:20]}'")
        for (l, rl) in labs:
            for (b, rb) in solid:
                if overlap(rl, rb): m.append(f"label '{l.text[:20]}' menimpa kotak '{b.text[:20]}'")
        def seg_hit(p, q, r):
            x0, y0, x1, y1 = r
            (ax, ay), (bx, by) = p, q
            lo_x, hi_x = min(ax, bx), max(ax, bx); lo_y, hi_y = min(ay, by), max(ay, by)
            if hi_x <= x0 or lo_x >= x1 or hi_y <= y0 or lo_y >= y1: return False
            return True  # segmen ortogonal: cukup uji bbox
        for e in s.edges:
            for i in range(len(e.pts) - 1):
                p, q = e.pts[i], e.pts[i + 1]
                for (b, rb) in solid:
                    if b is e.src or b is e.dst: continue
                    # perkecil kotak 1px supaya sentuhan tepi tidak dihitung
                    r = (rb[0] + 1, rb[1] + 1, rb[2] - 1, rb[3] - 1)
                    if seg_hit(p, q, r): m.append(f"garis {e.src.text.split(chr(10))[0][:14] if e.src else '?'}->{e.dst.text.split(chr(10))[0][:14] if e.dst else '?'} menembus '{b.text[:20]}'")
            for (l, rl) in labs:
                if l.owner is e: continue
                for i in range(len(e.pts) - 1):
                    if seg_hit(e.pts[i], e.pts[i + 1], (rl[0] + 1, rl[1] + 1, rl[2] - 1, rl[3] - 1)):
                        m.append(f"label '{l.text[:18]}' tertimpa garis lain"); break
        if verbose:
            print(f"   [{s.nama}] kotak {len(s.boxes)} | garis {len(s.edges)} | label {len(s.labels)} | " +
                  ("BERSIH" if not m else f"{len(m)} MASALAH"))
            for x in m[:12]: print("      -", x)
        return m
