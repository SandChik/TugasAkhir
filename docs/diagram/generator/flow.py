# -*- coding: utf-8 -*-
"""Diagram alir berlajur (IV.1-IV.4) dengan rute eksplisit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dg import Dia, text_size
LW, BX, BW = 300, 50, 200          # lebar lajur, offset kotak, lebar kotak
KOR_KANAN, KOR_KIRI = 275, 25      # koridor vertikal tiap lajur (lokal), 25 px dari kotak
SY = 1.15                          # pengali jarak vertikal antarlangkah
LG = 8                             # jarak label ke garisnya
FS = 9

PILIH = [a.lower() for a in sys.argv[1:]]
def alir(nama, fn, png, lanes, steps, edges, catatan=None):
    """lanes: [nama]; steps: {kode:(lane_idx, y, h, teks, shape)}; edges: [(a, b, label, mode, {opsi})]
    mode: 'lurus' (vertikal sejajar), 'turun' (turun-datar-turun), 'datar' (horizontal lurus),
          'datar_atas'/'datar_bawah' (pasangan horizontal), 'koridor'/'koridor_kiri' (lewat koridor
          kanan/kiri lajur a lalu masuk sisi b), 'samping_turun' (keluar sisi lalu turun ke atas b),
          'turun_samping' (turun lalu masuk sisi b), 'kanan_luar' (lewat koridor kiri lajur di
          kanan lajur b, masuk sisi kanan b), 'gabung' (dari konektor ke garis lurus menuju b).
    opsi: keluar_dy, masuk_dy (geser titik keluar/masuk), lpos ('awal', 'akhir', 'vertikal'), ldy."""
    if PILIH and png.replace(".png", "") not in PILIH: return
    sy = lambda y: round(40 + (y - 40) * SY)
    steps = {k: (li, sy(y), h, t, sh) for k, (li, y, h, t, sh) in steps.items()}
    tinggi = max(v[1]+v[2] for v in steps.values()) + 60
    W = 40 + len(lanes)*LW + 40
    H = 40 + tinggi + (130 if catatan else 40)
    d = Dia(nama, W, H)
    L = [d.box(40+i*LW, 40, LW, tinggi, nm, "lane", "grup", 11, bold=True) for i, nm in enumerate(lanes)]
    B = {}
    for k, (li, y, h, teks, shape) in steps.items():
        if shape == "term": B[k] = d.box(BX+40, y, 120, 44, teks, "term", "term", FS, parent=L[li])
        elif shape == "dec": B[k] = d.box(BX+5, y, 190, h, teks, "rhombus", "putusan", 8, parent=L[li])
        elif shape == "conn": B[k] = d.box(BX+70, y, 60, 60, teks, "konektor", "konektor", 11, bold=True, parent=L[li])
        elif shape == "conn_r": B[k] = d.box(BX+150, y, 60, 60, teks, "konektor", "konektor", 11, bold=True, parent=L[li])
        else: B[k] = d.box(BX, y, BW, h, teks, "rect", "putih", FS, parent=L[li])
    A = {k: d.abs_box(b) for k, b in B.items()}
    lane_of = {k: steps[k][0] for k in steps}
    def C(k):
        x0, y0, x1, y1 = A[k]; return (x0+x1)/2, (y0+y1)/2, x0, y0, x1, y1
    for ed in edges:
        a, b, lbl, mode = ed[:4]; op = ed[4] if len(ed) > 4 else {}
        ca, cya, ax0, ay0, ax1, ay1 = C(a); cb, cyb, bx0, by0, bx1, by1 = C(b)
        ya, yb = cya + op.get("keluar_dy", 0), cyb + op.get("masuk_dy", 0)
        lx = lambda li, lokal: 40 + li*LW + lokal
        tujuan = B[b]
        if mode == "lurus":
            pts = [(ca, ay1), (cb, by0)]
        elif mode == "datar":
            y = ya if by0 < ya < by1 else yb
            pts = [(ax1, y), (bx0, y)] if cb > ca else [(ax0, y), (bx1, y)]
        elif mode in ("datar_atas", "datar_bawah"):
            y = cya + (-12 if mode == "datar_atas" else 12)
            pts = [(ax1, y), (bx0, y)] if cb > ca else [(ax0, y), (bx1, y)]
        elif mode == "turun":
            ymid = round((ay1 + by0) / 2)
            pts = [(ca, ay1), (ca, ymid), (cb, ymid), (cb, by0)]
        elif mode in ("koridor", "koridor_kiri"):
            kanan = mode == "koridor"
            kx = lx(lane_of[a], KOR_KANAN if kanan else KOR_KIRI)
            sx = ax1 if kanan else ax0
            masuk = (bx0, yb) if cb > kx else (bx1, yb)
            pts = [(sx, ya), (kx, ya), (kx, yb), masuk]
        elif mode == "kanan_luar":
            kx = lx(lane_of[b] + 1, KOR_KIRI)
            pts = [(ax1, ya), (kx, ya), (kx, yb), (bx1, yb)]
        elif mode == "samping_turun":
            sx = ax1 if cb > ca else ax0
            pts = [(sx, ya), (cb, ya), (cb, by0)]
        elif mode == "turun_samping":
            pts = [(ca, ay1), (ca, yb), (bx0, yb) if cb > ca else (bx1, yb)]
        elif mode == "gabung":             # konektor bergabung ke garis vertikal menuju b
            pts = [(ax0, cya), (cb, cya)]; tujuan = None
        e = d.edge(B[a], tujuan, pts)
        if not lbl: continue
        w, h = text_size(lbl, 8)
        dari_putusan = steps[a][4] == "dec"
        lpos = op.get("lpos") or ("kanan" if mode == "lurus" else
                                  "awal" if dari_putusan else
                                  "bawah" if mode == "gabung" else "akhir")
        if lpos == "kanan":                 # di kanan ruas vertikal, dekat titik keluar
            (x0, y0) = pts[0]
            d.label(x0 + LG + w/2, y0 + 14 + h/2 + op.get("ldy", 0), lbl, 8, owner=e)
        elif lpos == "awal":                # di atas ruas pertama, menempel ke titik keluar
            (x0, y0), (x1, y1) = pts[0], pts[1]
            cx = x0 + 4 + w/2 if x1 > x0 else x0 - 4 - w/2
            d.label(cx, y0 - LG + 2 - h/2, lbl, 8, owner=e)
        elif lpos == "akhir":               # di atas ruas horizontal terakhir
            (x0, y0), (x1, y1) = pts[-2], pts[-1]
            d.label((x0 + x1)/2 + op.get("ldx", 0), y0 - LG + 2 - h/2, lbl, 8, owner=e)
        elif lpos == "bawah":               # di bawah konektor
            d.label(ca, ay1 + 6 + h/2, lbl, 8, owner=e)
        elif lpos in ("v_kiri", "v_kanan"): # di samping ruas vertikal terpanjang
            i = max(range(len(pts)-1), key=lambda i: abs(pts[i+1][1]-pts[i][1]) if pts[i][0] == pts[i+1][0] else -1)
            (x0, y0), (x1, y1) = pts[i], pts[i+1]
            cx = x0 + LG + w/2 if lpos == "v_kanan" else x0 - LG - w/2
            d.label(cx, (y0 + y1)/2 + op.get("ldy", 0), lbl, 8, owner=e)
        if mode in ("datar_atas", "datar_bawah"):
            d.labels.pop()
            (x0, y0), (x1, y1) = pts[0], pts[1]
            yl = y0 - 6 - h/2 if mode == "datar_atas" else y0 + 6 + h/2
            d.label((x0 + x1)/2, yl, lbl, 8, owner=e)
    if catatan:
        d.box(40, 40+tinggi+20, 700, 90, catatan, "note", "catatan", 9)
    d.save_drawio(fn); d.check(); d.render(png)

# ================= IV.1 =================
alir("Gambar IV.1 Alur Sistem Berjalan Bagian 1", "IV-01-alur-sistem-berjalan-bagian-1.drawio", "iv1.png",
 ["Ketua Jurusan / Direktur", "Dosen", "Sistem BKD yang Berjalan", "Asesor"],
 {"m": (0, 70, 44, "Mulai", "term"),
  "a1":(0, 160, 70, "Menerbitkan Surat Keputusan\ndan Surat Tugas beserta\nlampiran penugasan", "task"),
  "b1":(1, 280, 75, "Membaca lampiran penugasan\ndan mengetik ulang parameter\nkegiatan pada formulir laporan", "task"),
  "b2":(1, 405, 60, "Melampirkan dokumen\nbukti kegiatan", "task"),
  "kb":(1, 490, 60, "B", "conn_r"),
  "b3":(1, 590, 55, "Mengajukan laporan BKD", "task"),
  "c1":(2, 695, 60, "Menyimpan pengajuan\nlaporan BKD", "task"),
  "d1":(3, 805, 70, "Menerima pengajuan\nAsesor 1 dan Asesor 2\nsecara terpisah", "task"),
  "d2":(3, 925, 60, "Memeriksa kegiatan\ndan dokumen bukti", "task"),
  "ka":(3, 1035, 60, "A", "conn")},
 [("m","a1","","lurus"),("a1","b1","","turun"),("b1","b2","","lurus"),("b2","b3","","lurus"),
  ("kb","b3","dari Gambar IV.2","gabung"),
  ("b3","c1","","turun"),("c1","d1","","turun"),("d1","d2","","lurus"),("d2","ka","","lurus")])

# ================= IV.2 =================
alir("Gambar IV.2 Alur Sistem Berjalan Bagian 2", "IV-02-alur-sistem-berjalan-bagian-2.drawio", "iv2.png",
 ["Asesor", "Dosen", "Sistem BKD yang Berjalan"],
 {"ka":(0, 60, 60, "A", "conn"),
  "e1":(0, 170, 70, "Mencocokkan parameter\nkegiatan dengan Rubrik BKD\npada PO BKD 2021", "task"),
  "e2":(0, 290, 60, "Menghitung nilai kredit SKS\nsecara manual", "task"),
  "e3":(0, 400, 95, "Laporan sesuai\ndokumen dan rubrik?", "dec"),
  "f1":(0, 555, 65, "Mengembalikan laporan kepada\ndosen untuk direvisi", "task"),
  "f2":(1, 555, 65, "Memperbaiki data kegiatan", "task"),
  "kb":(1, 670, 60, "B", "conn"),
  "g1":(0, 690, 70, "Menetapkan nilai kredit\nyang disetujui Asesor 1\ndan Asesor 2 secara terpisah", "task"),
  "g2":(0, 815, 90, "Nilai kedua\nasesor sama?", "dec"),
  "g3":(0, 960, 55, "Merata-ratakan nilai\nkedua asesor", "task"),
  "h1":(2, 1050, 60, "Menyimpan hasil penilaian\ndan simpulan BKD", "task"),
  "s": (2, 1160, 44, "Selesai", "term")},
 [("ka","e1","","lurus"),("e1","e2","","lurus"),("e2","e3","","lurus"),
  ("e3","f1","tidak sesuai","lurus"),("f1","f2","","datar"),("f2","kb","","lurus"),
  ("e3","g1","sesuai","koridor_kiri"),("g1","g2","","lurus"),("g2","g3","berbeda","lurus"),
  ("g3","h1","","turun_samping"),("g2","h1","sama","samping_turun"),("h1","s","","lurus")])

# ================= IV.3 =================
alir("Gambar IV.3 Alur Sistem Diusulkan Bagian 1", "IV-03-alur-sistem-diusulkan-bagian-1.drawio", "iv3.png",
 ["Administrator", "Sistem", "Layanan Ekstraksi Dokumen", "Lapisan On-chain", "Dosen"],
 {"m": (0, 70, 44, "Mulai", "term"),
  "a1":(0, 160, 70, "Menambah periode BKD\nbeserta rentang tiga fase\ndan mengaktifkannya", "task"),
  "a2":(0, 280, 60, "Mengunggah berkas\nSK dan ST", "task"),
  "b1":(2, 390, 70, "Mengekstraksi lampiran\npenugasan menjadi\nbaris penugasan", "task"),
  "c1":(1, 510, 82, "Memetakan baris menjadi\ncalon kegiatan dan\nmencocokkan nama dosen\nke akun", "task"),
  "c2":(1, 630, 70, "Menghitung sidik digital\nberkas dan mencatatkannya\nke kontrak registri", "task"),
  "x1":(3, 630, 70, "BKDDokumenRegistri\nevent DokumenTercatat", "task"),
  "c3":(1, 750, 70, "Menampilkan pratinjau\npemetaan beserta\ntemuan validasi", "task"),
  "a3":(0, 870, 95, "Seluruh baris\ncocok?", "dec"),
  "a4":(0, 1015, 70, "Mengoreksi baris: memilih\nakun, mengubah parameter,\natau melewati baris", "task"),
  "c4":(1, 1140, 65, "Menghitung kredit setiap\nkegiatan yang akan\nditerapkan", "task"),
  "x2":(3, 1140, 75, "KalkulatorBKDPendidikan\nfungsi pure, keluaran\nSKS x100", "task"),
  "c5":(1, 1260, 65, "Membentuk kegiatan\nportofolio dan dokumen\nBKD dosen", "task"),
  "a5":(0, 1380, 65, "Menugaskan dua asesor\npada dokumen BKD", "task"),
  "e1":(4, 1500, 65, "Kegiatan tampil pada\nportofolio dengan penanda\nbelum diklaim", "task"),
  "ka":(4, 1610, 60, "A", "conn")},
 [("m","a1","","lurus"),("a1","a2","","lurus"),("a2","b1","","turun"),("b1","c1","","turun"),
  ("c1","c2","","lurus"),("c2","c3","","lurus"),("c3","a3","","turun"),
  ("a3","a4","tidak","lurus"),("a4","c3","pratinjau ulang","koridor_kiri"),
  ("a3","c4","ya","samping_turun"),("c4","c5","","lurus"),("c5","a5","","turun"),
  ("a5","e1","","turun"),("e1","ka","","lurus"),
  ("c2","x1","hash dokumen","datar_atas"),("x1","c2","transaction hash","datar_bawah"),
  ("c4","x2","parameter kegiatan","datar_atas"),("x2","c4","nilai SKS x100","datar_bawah")],
 None)

# ================= IV.4 =================
alir("Gambar IV.4 Alur Sistem Diusulkan Bagian 2", "IV-04-alur-sistem-diusulkan-bagian-2.drawio", "iv4.png",
 ["Dosen", "Sistem", "Asesor", "Lapisan On-chain"],
 {"ka":(0, 60, 60, "A", "conn"),
  "d1":(0, 165, 70, "Menarik kegiatan dari\nportofolio ke dokumen BKD", "task"),
  "d2":(0, 280, 60, "Mengunggah dokumen\nbukti kegiatan", "task"),
  "s1":(1, 390, 82, "Memeriksa keaslian bukti\nmelalui layanan model\nbahasa visual dan\nmenandai temuan", "task"),
  "s2":(1, 515, 60, "Mencatat jejak dokumen\nbukti ke kontrak registri", "task"),
  "x1":(3, 515, 70, "BKDDokumenRegistri\nevent DokumenTercatat", "task"),
  "d3":(0, 630, 60, "Menyimpan permanen\ndokumen BKD", "task"),
  "a1":(2, 740, 82, "Memverifikasi kesesuaian\nparameter terhadap\ndokumen sumber dan\nmenetapkan status", "task"),
  "a2":(2, 865, 95, "Seluruh kegiatan\ndisetujui?", "dec"),
  "a3":(2, 1010, 65, "Mengembalikan kegiatan\nuntuk diperbaiki", "task"),
  "d4":(0, 1010, 65, "Memperbaiki dokumen\nbukti kegiatan", "task"),
  "a4":(2, 1135, 60, "Mengesahkan penilaian", "task"),
  "s3":(1, 1250, 95, "Kedua asesor sudah\nmengesahkan?", "dec"),
  "s4":(1, 1395, 65, "Membentuk simpulan BKD\nbeserta hash penilaian", "task"),
  "s5":(1, 1515, 65, "Menerbitkan token kredit\nke wallet dosen", "task"),
  "x2":(3, 1515, 75, "BKDSKSToken\nmint dengan referenceId\nberupa hash simpulan", "task"),
  "s6":(1, 1635, 44, "Selesai", "term")},
 [("ka","d1","","lurus"),("d1","d2","","lurus"),("d2","s1","","turun"),("s1","s2","","lurus"),
  ("s2","d3","","turun"),("d3","a1","","turun"),("a1","a2","","lurus"),
  ("a2","a3","tidak","lurus"),("a3","d4","","datar",{"keluar_dy":14}),
  ("d4","a1","nilai ulang","koridor",{"keluar_dy":-14}),
  ("a2","a4","ya","koridor"),("a4","s3","","turun"),
  ("s3","a1","belum, menunggu\nasesor lain","kanan_luar",{"lpos":"v_kanan"}),
  ("s3","s4","sudah","lurus"),("s4","s5","","lurus"),("s5","s6","","lurus"),
  ("s2","x1","hash dokumen","datar_atas"),("x1","s2","transaction hash","datar_bawah"),
  ("s5","x2","alamat wallet, jumlah token","datar_atas"),("x2","s5","transaction hash","datar_bawah")],
 None)
