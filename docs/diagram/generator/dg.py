# -*- coding: utf-8 -*-
"""Toolkit diagram: koordinat eksplisit -> XML draw.io + PNG (Pillow) + pemeriksaan."""
import io, os, re, html, math, itertools
from PIL import Image, ImageDraw, ImageFont

_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DRAWIO = os.path.normpath(os.path.join(_DIR, ".."))
OUT_PNG = os.path.join(_DIR, "pratinjau")
# Skala teks: DIAGRAM_FONT=11 -> label (dasar 8 px) jadi 11 px, teks lain ikut rasio 11/8.
# Geometri tidak ikut membesar; DIAGRAM_GEOM (opsional) mengalikan geometri saja.
FONT = int(os.environ.get("DIAGRAM_FONT", "0")) or None
FS_SCALE = (FONT / 8.0) if FONT else 1.0
K = float(os.environ.get("DIAGRAM_GEOM", "1") or 1)
def ef(fs): return max(1, int(round(fs * FS_SCALE)))
os.makedirs(OUT_PNG, exist_ok=True)
FONT_PATH = "C:/Windows/Fonts/arial.ttf"
FONT_BOLD = "C:/Windows/Fonts/arialbd.ttf"
_fonts = {}
def font(size, bold=False):
    k = (size, bold)
    if k not in _fonts:
        _fonts[k] = ImageFont.truetype(FONT_BOLD if bold else FONT_PATH, size)
    return _fonts[k]
def _ts(text, fs, bold=False):
    """ukuran teks pada fs yang sudah berskala (px keluaran)."""
    f = font(fs, bold)
    lines = text.split("\n")
    w = max((f.getbbox(l)[2] - f.getbbox(l)[0]) if l else 0 for l in lines)
    return w, int(len(lines) * fs * 1.25)
def text_size(text, fs, bold=False):
    """ukuran teks untuk fs dasar (dipakai skrip tata letak); skala font diterapkan di sini."""
    return _ts(text, ef(fs), bold)

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
    # wireframe
    "layar":   ("#f5f7fb", "#999999"), "kartu":   ("#ffffff", "#bbbbbb"), "logo": ("#14315e", "#ffffff"),
    "navy":    ("#14315e", "#14315e"), "primer":  ("#1f5eff", "#1f5eff"),
    "sukses":  ("#2e7d4f", "#2e7d4f"), "bahaya":  ("#fde8e8", "#d33"),
    "lembut":  ("#e8effc", "#c9d6f2"), "kepala":  ("#f0f3f8", "#d0d5de"),
    "garis":   ("#ffffff", "#c9cdd6"), "abu":     ("#eef1f5", "#c9cdd6"),
    "hijau_l": ("#e6f4ec", "#8cc9a6"), "kuning":  ("#fff3cd", "#e0b84c"),
}

class Box:
    def __init__(s, id, x, y, w, h, text, shape, warna, fs, bold=False, parent=None, align="center", dashed=False, fc=None):
        s.id, s.x, s.y, s.w, s.h, s.text, s.shape, s.warna, s.fs, s.bold = id, x, y, w, h, text, shape, warna, fs, bold
        s.parent, s.align, s.dashed, s.fc = parent, align, dashed, fc
    @property
    def cx(s): return s.x + s.w / 2
    @property
    def cy(s): return s.y + s.h / 2
    @property
    def x1(s): return s.x + s.w
    @property
    def y1(s): return s.y + s.h

class Edge:
    def __init__(s, id, src, dst, pts, arrow_end=True, arrow_start=False, tail_circle=False, lurus=False):
        s.id, s.src, s.dst, s.pts, s.arrow_end, s.arrow_start = id, src, dst, pts, arrow_end, arrow_start
        s.tail_circle, s.lurus = tail_circle, lurus

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
        s.cek_ruang = True   # pemeriksaan jarak minimum (lihat cek_jarak)
    def nid(s, p="n"):
        s.n += 1; return f"{p}{s.n}"
    def box(s, x, y, w, h, text, shape="rect", warna="entitas", fs=10, bold=False, parent=None, align="center", dashed=False, fc=None):
        if shape == "note":   # catatan mengikuti ukuran teksnya (padding kiri 10, kanan 20, atas 8)
            tw, th = text_size(text, fs); w, h = tw + 40, th + 24
        b = Box(s.nid(), x, y, w, h, text, shape, warna, ef(fs), bold, parent, align, dashed, fc)
        s.boxes.append(b); return b
    def edge(s, src, dst, pts, arrow_end=True, arrow_start=False, tail_circle=False, lurus=False):
        e = Edge(s.nid("e"), src, dst, pts, arrow_end, arrow_start, tail_circle, lurus)
        s.edges.append(e); return e
    def label(s, cx, cy, text, fs=8, bold=False, bg=True, pad=3, owner=None):
        w, h = text_size(text, fs, bold)
        l = Label(s.nid("l"), cx, cy, text, ef(fs), w + 2 * pad, h + 2, bold, bg, owner)
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
        base = f"whiteSpace=wrap;html=1;fontSize={b.fs};align={b.align};"
        if b.shape == "text":      # teks polos: tanpa isi dan tanpa bingkai apa pun warnanya
            base += "strokeColor=none;fillColor=none;spacing=0;"
        else:
            base += f"strokeColor={stroke};" + (f"fillColor={fill};" if fill else "fillColor=none;")
        if b.bold: base += "fontStyle=1;"
        if b.dashed: base += "dashed=1;"
        if b.fc: base += f"fontColor={b.fc};"
        if b.align == "left": base += "spacingLeft=6;"
        sh = {
            "rect": "rounded=0;", "ellipse": "ellipse;", "rhombus": "rhombus;",
            "store": "shape=partialRectangle;top=1;bottom=1;left=0;right=0;",
            "note": "shape=note;size=14;verticalAlign=top;spacingLeft=10;spacingRight=20;spacingTop=8;",
            "term": "rounded=1;arcSize=50;", "konektor": "ellipse;",
            "lane": "swimlane;startSize=34;horizontal=1;fontStyle=1;verticalAlign=middle;",
            "grup": "rounded=0;verticalAlign=top;fontStyle=1;spacingTop=4;",
            "text": "text;strokeColor=none;",
            "wadah": "rounded=1;arcSize=4;verticalAlign=top;fontStyle=1;spacingTop=2;spacingLeft=6;",
            "tombol": "rounded=1;arcSize=30;",
            "bulat": "ellipse;fontStyle=1;",
        }[b.shape]
        if b.shape == "note": base = base.replace("align=center", "align=left")
        return sh + base
    @staticmethod
    def nilai(teks):
        """Nilai atribut value untuk html=1: baris baru eksplisit jadi <br> (newline mentah
        di atribut XML dinormalkan jadi spasi dan draw.io membungkus ulang teks)."""
        return html.escape(html.escape(teks).replace(chr(10), "<br>"))
    def save_drawio(s, fn):
        o = [f'<mxfile host="app.diagrams.net" type="device">\n  <diagram name="{html.escape(s.nama)}" id="{s.nid("d")}">\n'
             f'    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" '
             f'fold="1" page="1" pageScale="1" pageWidth="{s.w*K:.0f}" pageHeight="{s.h*K:.0f}" math="0" shadow="0">\n      <root>\n'
             '        <mxCell id="0" />\n        <mxCell id="1" parent="0" />\n']
        for b in s.boxes:
            par = b.parent.id if b.parent else "1"
            st = s.style_box(b)
            if K != 1: st = st.replace("startSize=34;", f"startSize={34*K:.0f};")
            o.append(f'        <mxCell id="{b.id}" value="{s.nilai(b.text)}" style="{st}" vertex="1" parent="{par}">\n'
                     f'          <mxGeometry x="{b.x*K:.0f}" y="{b.y*K:.0f}" width="{b.w*K:.0f}" height="{b.h*K:.0f}" as="geometry" />\n        </mxCell>\n')
        bid = {b.id: b for b in s.boxes}
        for e in s.edges:
            st = ("" if e.lurus else "edgeStyle=orthogonalEdgeStyle;") + "rounded=0;html=1;strokeColor=#000000;"
            st += "endArrow=classic;" if e.arrow_end else "endArrow=none;"
            st += "startArrow=classic;" if e.arrow_start else ("startArrow=oval;startFill=0;startSize=7;" if e.tail_circle else "startArrow=none;")
            attrs = ""
            if K != 1: st = st.replace("startSize=7;", f"startSize={7*K:.0f};")
            if e.src is not None:
                ax, ay, ax1, ay1 = s.abs_box(e.src)
                px, py = e.pts[0]
                st += f"exitX={(px-ax)/(ax1-ax):.3f};exitY={(py-ay)/(ay1-ay):.3f};exitDx=0;exitDy=0;"
                if e.src.shape in ("ellipse", "konektor", "rhombus"): st += "exitPerimeter=0;"
                attrs += f' source="{e.src.id}"'
            if e.dst is not None:
                bx, by, bx1, by1 = s.abs_box(e.dst)
                qx, qy = e.pts[-1]
                st += f"entryX={(qx-bx)/(bx1-bx):.3f};entryY={(qy-by)/(by1-by):.3f};entryDx=0;entryDy=0;"
                if e.dst.shape in ("ellipse", "konektor", "rhombus"): st += "entryPerimeter=0;"
                attrs += f' target="{e.dst.id}"'
            mid = e.pts[1:-1]
            o.append(f'        <mxCell id="{e.id}" value="" style="{st}" edge="1" parent="1"{attrs}>\n'
                     f'          <mxGeometry relative="1" as="geometry">\n')
            if e.src is None:
                o.append(f'            <mxPoint x="{e.pts[0][0]*K:.0f}" y="{e.pts[0][1]*K:.0f}" as="sourcePoint" />\n')
            if e.dst is None:
                o.append(f'            <mxPoint x="{e.pts[-1][0]*K:.0f}" y="{e.pts[-1][1]*K:.0f}" as="targetPoint" />\n')
            if mid:
                o.append('            <Array as="points">\n')
                for (x, y) in mid: o.append(f'              <mxPoint x="{x*K:.0f}" y="{y*K:.0f}" />\n')
                o.append('            </Array>\n')
            o.append('          </mxGeometry>\n        </mxCell>\n')
        for l in s.labels:
            st = (f"text;html=1;whiteSpace=wrap;fontSize={l.fs};align=center;verticalAlign=middle;"
                  f"strokeColor=none;{'fillColor=#ffffff;' if l.bg else 'fillColor=none;'}{'fontStyle=1;' if l.bold else ''}")
            o.append(f'        <mxCell id="{l.id}" value="{s.nilai(l.text)}" style="{st}" vertex="1" parent="1">\n'
                     f'          <mxGeometry x="{l.x*K:.0f}" y="{l.y*K:.0f}" width="{l.w*K:.0f}" height="{l.h*K:.0f}" as="geometry" />\n        </mxCell>\n')
        o.append('      </root>\n    </mxGraphModel>\n  </diagram>\n</mxfile>\n')
        io.open(os.path.join(OUT_DRAWIO, fn), "w", encoding="utf-8").write("".join(o))

    # ---------- PNG ----------
    def render(s, fn, scale=None):
        if scale is None: scale = K
        fpx = lambda fs: fs * scale / K   # fs sudah dalam px keluaran; geometri PNG mengikuti K
        W, H = int(s.w * scale), int(s.h * scale)
        im = Image.new("RGB", (W, H), "white")
        dr = ImageDraw.Draw(im)
        S = lambda v: v * scale
        def teks(cx, cy, text, fs, bold, warna="black", align="center", top=None, left=None, fc=None):
            if fc: warna = fc
            f = font(max(1, int(fpx(fs))), bold)
            lines = text.split("\n"); lh = fpx(fs) * 1.25
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
                if b.align == "left": teks(0, 0, b.text, b.fs, True, align="left", top=y0 + 4 * scale, left=x0 + 6 * scale)
                else: teks((x0 + x1) / 2, 0, b.text, b.fs, True, top=y0 + 4 * scale)
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
                teks(0, 0, b.text, b.fs, False, align="left", top=y0 + 8 * scale, left=x0 + 10 * scale)
            elif b.shape == "term":
                dr.rounded_rectangle([x0, y0, x1, y1], radius=int(b.h * scale / 2), fill=fill, outline=stroke)
                teks((x0 + x1) / 2, (y0 + y1) / 2, b.text, b.fs, b.bold)
            elif b.shape == "text":
                if b.align == "left": teks(0, (y0 + y1) / 2, b.text, b.fs, b.bold, align="left", left=x0 + 6 * scale, fc=b.fc)
                else: teks((x0 + x1) / 2, (y0 + y1) / 2, b.text, b.fs, b.bold, fc=b.fc)
            elif b.shape == "wadah":
                dr.rounded_rectangle([x0, y0, x1, y1], radius=int(6 * scale), fill=fill, outline=stroke, width=1)
                if b.text: teks(0, 0, b.text, b.fs, True, align="left", top=y0 + 4 * scale, left=x0 + 6 * scale, fc=b.fc)
            elif b.shape == "tombol":
                dr.rounded_rectangle([x0, y0, x1, y1], radius=int(6 * scale), fill=fill, outline=stroke, width=1)
                teks((x0 + x1) / 2, (y0 + y1) / 2, b.text, b.fs, b.bold, fc=b.fc)
            elif b.shape == "bulat":
                dr.ellipse([x0, y0, x1, y1], fill=fill, outline=stroke, width=1)
                teks((x0 + x1) / 2, (y0 + y1) / 2, b.text, b.fs, True, fc=b.fc)
            else:
                dr.rectangle([x0, y0, x1, y1], fill=fill, outline=stroke, width=1)
                if b.align == "left": teks(0, (y0 + y1) / 2, b.text, b.fs, b.bold, align="left", left=x0 + 6 * scale, fc=b.fc)
                else: teks((x0 + x1) / 2, (y0 + y1) / 2, b.text, b.fs, b.bold, fc=b.fc)
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
        solid = [(b, s.abs_box(b)) for b in s.boxes if b.shape not in ("grup", "lane", "text", "wadah")]
        # uji garis dan label di bawah memakai bbox; bentuk lengkung/belah ketupat diuji tepat oleh cek_jarak
        kotak_bbox = [(b, r) for b, r in solid if not (s.cek_ruang and b.shape in ("rhombus", "ellipse", "konektor", "bulat"))]
        # teks meluap dari kotaknya (geometri tidak berskala, fs sudah px keluaran -> bandingkan pada K)
        for b in s.boxes:
            if b.shape in ("grup", "lane", "wadah") or not b.text: continue
            tw, th = _ts(b.text, b.fs, b.bold); W, H = b.w * K, b.h * K
            if b.shape == "text":  # draw.io: spacing 0, spacingLeft 6 bila rata kiri
                muat = tw <= W - (8 if b.align == "left" else 2) and th <= H + 2
            elif b.shape == "ellipse" or b.shape == "konektor":
                muat = (tw / W) ** 2 + (th / H) ** 2 <= 1.0
            elif b.shape == "rhombus":
                muat = tw / W + th / H <= 1.0
            elif b.shape == "note":
                muat = tw <= W - 20 and th <= H - 8
            else:                  # draw.io: spacing 2 tiap sisi, spacingLeft 6 bila rata kiri
                muat = tw <= W - (12 if b.align == "left" else 6) and th <= H - 4
            if not muat: m.append(f"teks meluap: '{b.text.split(chr(10))[0][:24]}' butuh {tw:.0f}x{th:.0f}, kotak {W:.0f}x{H:.0f}")
        for (a, ra), (b, rb) in itertools.combinations(solid, 2):
            if a.parent is b or b.parent is a: continue
            if overlap(ra, rb): m.append(f"kotak tindih: '{a.text[:22]}' x '{b.text[:22]}'")
        labs = [(l, (l.x, l.y, l.x + l.w, l.y + l.h)) for l in s.labels]
        for (a, ra), (b, rb) in itertools.combinations(labs, 2):
            if overlap(ra, rb): m.append(f"label tindih: '{a.text[:20]}' x '{b.text[:20]}'")
        for (l, rl) in labs:
            for (b, rb) in kotak_bbox:
                if overlap(rl, rb): m.append(f"label '{l.text[:20]}' menimpa kotak '{b.text[:20]}'")
        def seg_hit(p, q, r):
            x0, y0, x1, y1 = r
            (ax, ay), (bx, by) = p, q
            lo_x, hi_x = min(ax, bx), max(ax, bx); lo_y, hi_y = min(ay, by), max(ay, by)
            if hi_x <= x0 or lo_x >= x1 or hi_y <= y0 or lo_y >= y1: return False
            if ax == bx or ay == by: return True  # segmen ortogonal: cukup uji bbox
            t0, t1, dx, dy = 0.0, 1.0, bx - ax, by - ay   # segmen diagonal: Liang-Barsky
            for pp, qq in ((-dx, ax - x0), (dx, x1 - ax), (-dy, ay - y0), (dy, y1 - ay)):
                if pp == 0:
                    if qq < 0: return False
                else:
                    t = qq / pp
                    if pp < 0: t0 = max(t0, t)
                    else: t1 = min(t1, t)
            return t0 < t1
        for e in s.edges:
            for i in range(len(e.pts) - 1):
                p, q = e.pts[i], e.pts[i + 1]
                for (b, rb) in kotak_bbox:
                    if b is e.src or b is e.dst: continue
                    # perkecil kotak 1px supaya sentuhan tepi tidak dihitung
                    r = (rb[0] + 1, rb[1] + 1, rb[2] - 1, rb[3] - 1)
                    if seg_hit(p, q, r): m.append(f"garis {e.src.text.split(chr(10))[0][:14] if e.src else '?'}->{e.dst.text.split(chr(10))[0][:14] if e.dst else '?'} menembus '{b.text[:20]}'")
            for (l, rl) in labs:
                if l.owner is e: continue
                for i in range(len(e.pts) - 1):
                    if seg_hit(e.pts[i], e.pts[i + 1], (rl[0] + 1, rl[1] + 1, rl[2] - 1, rl[3] - 1)):
                        m.append(f"label '{l.text[:18]}' tertimpa garis {e.src.text.split(chr(10))[0][:14] if e.src else '?'}->{e.dst.text.split(chr(10))[0][:14] if e.dst else '?'} label@{tuple(round(v) for v in rl)} ruas {e.pts[i]}-{e.pts[i+1]}"); break
        if s.cek_ruang: m += s.cek_jarak()
        if verbose:
            print(f"   [{s.nama}] kotak {len(s.boxes)} | garis {len(s.edges)} | label {len(s.labels)} | " +
                  ("BERSIH" if not m else f"{len(m)} MASALAH"))
            for x in m[:40]: print("      -", x)
        return m

    # ---------- pemeriksaan jarak minimum ----------
    def cek_jarak(s):
        """Ruang kosong minimum: garis sejajar, garis ke kotak, belokan, antarkotak,
        padding teks, judul grup, label, dan persilangan garis. Satuan px geometri."""
        m = []
        def nama(e):
            a = e.src.text.split(chr(10))[0][:14] if e.src else "?"
            b = e.dst.text.split(chr(10))[0][:14] if e.dst else "?"
            return f"{a}->{b}"
        def atas(b):   # kotak tingkat atas: tanpa induk, atau induknya lajur/grup
            return b.parent is None or b.parent.shape in ("lane", "grup")
        padat = [b for b in s.boxes if b.shape not in ("grup", "lane", "text", "wadah") and atas(b)]
        def poligon(b):
            x0, y0, x1, y1 = s.abs_box(b)
            if b.shape in ("ellipse", "konektor", "bulat"):
                cx, cy, rx, ry = (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2, (y1 - y0) / 2
                return [(cx + rx * math.cos(t * math.pi / 24), cy + ry * math.sin(t * math.pi / 24)) for t in range(48)]
            if b.shape == "rhombus":
                cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
                return [(cx, y0), (x1, cy), (cx, y1), (x0, cy)]
            return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]
        def d_titik(p, a, b):
            (px, py), (ax, ay), (bx, by) = p, a, b
            dx, dy = bx - ax, by - ay
            L = dx * dx + dy * dy
            t = 0 if L == 0 else max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / L))
            return math.hypot(px - ax - t * dx, py - ay - t * dy)
        def cr(o, p, q): return (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0])
        def potong(a, b, c, d, dalam=False):
            d1, d2, d3, d4 = cr(c, d, a), cr(c, d, b), cr(a, b, c), cr(a, b, d)
            if dalam: return d1 * d2 < 0 and d3 * d4 < 0
            if d1 == d2 == d3 == d4 == 0:
                return not (max(a[0], b[0]) < min(c[0], d[0]) or max(c[0], d[0]) < min(a[0], b[0]) or
                            max(a[1], b[1]) < min(c[1], d[1]) or max(c[1], d[1]) < min(a[1], b[1]))
            return d1 * d2 <= 0 and d3 * d4 <= 0
        def d_ruas(a, b, c, d):
            if potong(a, b, c, d): return 0.0
            return min(d_titik(a, c, d), d_titik(b, c, d), d_titik(c, a, b), d_titik(d, a, b))
        def di_dalam(p, poly):
            x, y = p; hasil = False
            for i in range(len(poly)):
                (x1, y1), (x2, y2) = poly[i], poly[i - 1]
                if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: hasil = not hasil
            return hasil
        def d_poli(a, b, poly):
            if di_dalam(a, poly) or di_dalam(b, poly): return 0.0
            return min(d_ruas(a, b, poly[i - 1], poly[i]) for i in range(len(poly)))
        def d_kotak(r1, r2):
            dx = max(r2[0] - r1[2], r1[0] - r2[2], 0); dy = max(r2[1] - r1[3], r1[1] - r2[3], 0)
            return math.hypot(dx, dy)
        poli = {b.id: poligon(b) for b in padat}
        ruas = [(e, i, e.pts[i], e.pts[i + 1]) for e in s.edges for i in range(len(e.pts) - 1)]
        # 1. garis sejajar terlalu rapat atau berimpit
        for (e, i, a, b), (f, j, c, d) in itertools.combinations(ruas, 2):
            if e is f: continue
            if a[1] == b[1] and c[1] == d[1]:
                jarak = abs(a[1] - c[1])
                lap = min(max(a[0], b[0]), max(c[0], d[0])) - max(min(a[0], b[0]), min(c[0], d[0]))
            elif a[0] == b[0] and c[0] == d[0]:
                jarak = abs(a[0] - c[0])
                lap = min(max(a[1], b[1]), max(c[1], d[1])) - max(min(a[1], b[1]), min(c[1], d[1]))
            else: continue
            if lap <= 2: continue
            if jarak == 0:
                if not ({e.pts[0], e.pts[-1]} & {f.pts[0], f.pts[-1]}): m.append(f"garis berimpit: {nama(e)} x {nama(f)}")
            elif jarak < JARAK_GARIS:
                m.append(f"garis rapat {jarak:.0f}px: {nama(e)} x {nama(f)}")
        # 2. garis terlalu dekat dengan kotak (kecuali ruas yang memang menempel ke ujungnya)
        for e, i, a, b in ruas:
            akhir = len(e.pts) - 2
            for bx in padat:
                if (bx is e.src and i == 0) or (bx is e.dst and i == akhir): continue
                sendiri = bx is e.src or bx is e.dst
                dd = d_poli(a, b, poli[bx.id])
                if dd == 0 and not sendiri:
                    m.append(f"garis {nama(e)} menembus kotak '{bx.text.split(chr(10))[0][:20]}'")
                elif dd < JARAK_KOTAK:
                    m.append(f"garis {nama(e)} {dd:.0f}px dari kotak '{bx.text.split(chr(10))[0][:20]}'")
        # 3. belokan pendek
        for e in s.edges:
            n = len(e.pts) - 1
            if n < 2: continue
            for i in range(n):
                (ax, ay), (bx, by) = e.pts[i], e.pts[i + 1]
                L = math.hypot(bx - ax, by - ay)
                if 0 < i < n - 1: batas = BELOK_MIN
                elif (i == n - 1 and e.arrow_end) or (i == 0 and e.arrow_start): batas = PANAH_MIN
                else: batas = 8
                if L < batas: m.append(f"ruas pendek {L:.0f}px: {nama(e)}")
        # 4. jarak antarkotak
        for a, b in itertools.combinations(padat, 2):
            ra, rb = s.abs_box(a), s.abs_box(b)
            if ra[0] < rb[2] and rb[0] < ra[2] and ra[1] < rb[3] and rb[1] < ra[3]:
                if a.parent is not b and b.parent is not a:
                    m.append(f"kotak tindih: '{a.text.split(chr(10))[0][:18]}' x '{b.text.split(chr(10))[0][:18]}'")
                continue
            g = d_kotak(ra, rb)
            if g < JARAK_ANTARKOTAK:
                m.append(f"kotak rapat {g:.0f}px: '{a.text.split(chr(10))[0][:18]}' x '{b.text.split(chr(10))[0][:18]}'")
        # 5. padding teks
        for b in padat:
            if not b.text: continue
            tw, th = _ts(b.text, b.fs, b.bold); W, H = b.w * K, b.h * K
            if b.shape in ("ellipse", "konektor", "bulat"):
                muat = (tw / (W - 2 * PAD_TEKS)) ** 2 + (th / (H - PAD_TEKS)) ** 2 <= 1.0
            elif b.shape == "rhombus": muat = tw / (W - 2 * PAD_TEKS) + th / (H - PAD_TEKS) <= 1.0
            elif b.shape == "note": muat = tw <= W - 2 * PAD_TEKS - 12 and th <= H - 8
            else: muat = tw <= W - 2 * PAD_TEKS and th <= H - 16
            if not muat: m.append(f"teks mepet: '{b.text.split(chr(10))[0][:24]}' {tw:.0f}x{th:.0f} di kotak {W:.0f}x{H:.0f}")
        # 6. garis menembus judul grup atau lajur
        for g in s.boxes:
            if g.shape not in ("grup", "lane") or not g.text: continue
            x0, y0, x1, y1 = s.abs_box(g)
            tw, th = _ts(g.text, g.fs, True); cx = (x0 + x1) / 2
            if g.align == "left": cx = x0 + 6 + tw / 2
            bawah = y0 + th + 8 if g.shape == "grup" else y0 + 33
            pr = [(cx - tw / 2 - 6, y0 + 1), (cx + tw / 2 + 6, y0 + 1), (cx + tw / 2 + 6, bawah), (cx - tw / 2 - 6, bawah)]
            for e, i, a, b in ruas:
                if d_poli(a, b, pr) == 0:
                    m.append(f"garis {nama(e)} menembus judul '{g.text[:24]}'"); break
        # 7. label terlalu dekat dengan garis lain atau kotak
        for l in s.labels:
            rl = (l.x, l.y, l.x + l.w, l.y + l.h)
            pr = [(rl[0], rl[1]), (rl[2], rl[1]), (rl[2], rl[3]), (rl[0], rl[3])]
            for e, i, a, b in ruas:
                if l.owner is e: continue
                dd = d_poli(a, b, pr)
                if dd < JARAK_LABEL:
                    m.append(f"label '{l.text.split(chr(10))[0][:18]}' {dd:.0f}px dari garis {nama(e)}"); break
            for bx in padat:
                q = poli[bx.id]
                if any(di_dalam(p, q) for p in pr) or any(di_dalam(p, pr) for p in q): g = 0
                else: g = min(d_poli(pr[i - 1], pr[i], q) for i in range(4))
                if g < JARAK_LABEL:
                    m.append(f"label '{l.text.split(chr(10))[0][:18]}' {g:.0f}px dari kotak '{bx.text.split(chr(10))[0][:18]}'"); break
        # 7b. label menyentuh tepi grup/lajur; jarak antargrup
        grp = [g for g in s.boxes if g.shape in ("grup", "lane")]
        for l in s.labels:
            rl = (l.x, l.y, l.x + l.w, l.y + l.h)
            pr = [(rl[0], rl[1]), (rl[2], rl[1]), (rl[2], rl[3]), (rl[0], rl[3])]
            for g in grp:
                x0, y0, x1, y1 = s.abs_box(g)
                tepi = [((x0, y0), (x1, y0)), ((x1, y0), (x1, y1)), ((x1, y1), (x0, y1)), ((x0, y1), (x0, y0))]
                if min(d_poli(a, b, pr) for a, b in tepi) < JARAK_LABEL:
                    m.append(f"label '{l.text.split(chr(10))[0][:18]}' menyentuh tepi '{g.text[:20]}'"); break
        for a, b in itertools.combinations([g for g in grp if g.shape == "grup"], 2):
            ra, rb = s.abs_box(a), s.abs_box(b)
            if ra[0] < rb[2] and rb[0] < ra[2] and ra[1] < rb[3] and rb[1] < ra[3]: continue
            if d_kotak(ra, rb) < JARAK_ANTARKOTAK:
                m.append(f"grup rapat {d_kotak(ra, rb):.0f}px: '{a.text[:18]}' x '{b.text[:18]}'")
        # 8. persilangan garis
        for (e, i, a, b), (f, j, c, d) in itertools.combinations(ruas, 2):
            if e is not f and potong(a, b, c, d, dalam=True):
                m.append(f"garis bersilang: {nama(e)} x {nama(f)}")
        return m

# ambang ruang kosong minimum (px geometri)
JARAK_GARIS = 20       # antar ruas garis sejajar
JARAK_KOTAK = 18       # ruas garis ke kotak yang bukan ujungnya
JARAK_ANTARKOTAK = 28  # antar kotak
JARAK_LABEL = 4        # label ke garis lain dan ke kotak
BELOK_MIN = 16         # ruas tengah
PANAH_MIN = 18         # ruas terakhir berkepala panah
PAD_TEKS = 10          # padding teks di dalam kotak
