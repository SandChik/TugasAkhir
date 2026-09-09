# -*- coding: utf-8 -*-
"""Diagram alir berlajur (IV.1-IV.4) dan arsitektur (IV.5) dengan rute eksplisit."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dg import Dia, text_size
LW, BX, BW = 250, 25, 200          # lebar lajur, offset kotak, lebar kotak
KOR = 238                          # koridor vertikal di sisi kanan tiap lajur (lokal)
FS = 9

def alir(nama, fn, png, lanes, steps, edges, catatan=None):
    """lanes: [nama]; steps: {kode:(lane_idx, y, h, teks, shape)}; edges: [(a,b,label,mode)]
    mode: 'lurus' (vertikal sejajar), 'turun' (turun-datar-turun), 'datar' (horizontal sejajar),
          'koridor' (lewat koridor kanan lajur a, lalu masuk sisi b), 'koridor_kiri'."""
    tinggi = max(v[1]+v[2] for v in steps.values()) + 60
    W = 40 + len(lanes)*LW + 40
    H = 40 + tinggi + (130 if catatan else 40)
    d = Dia(nama, W, H)
    L = [d.box(40+i*LW, 40, LW, tinggi, nm, "lane", "grup", 11, bold=True) for i, nm in enumerate(lanes)]
    B = {}
    warna = {"term":"term","task":"putih","dec":"putusan","conn":"konektor"}
    for k, (li, y, h, teks, shape) in steps.items():
        if shape == "term": B[k] = d.box(BX+40, y, 120, 44, teks, "term", "term", FS, parent=L[li])
        elif shape == "dec": B[k] = d.box(BX+5, y, 190, h, teks, "rhombus", "putusan", 8, parent=L[li])
        elif shape == "conn": B[k] = d.box(BX+70, y, 60, 60, teks, "konektor", "konektor", 11, bold=True, parent=L[li])
        elif shape == "conn_r": B[k] = d.box(BX+135, y, 60, 60, teks, "konektor", "konektor", 11, bold=True, parent=L[li])
        else: B[k] = d.box(BX, y, BW, h, teks, "rect", "putih", FS, parent=L[li])
    A = {k: d.abs_box(b) for k, b in B.items()}
    lane_of = {k: steps[k][0] for k in steps}
    def C(k):
        x0, y0, x1, y1 = A[k]; return (x0+x1)/2, (y0+y1)/2, x0, y0, x1, y1
    def tepi_atas(k):
        cx, cy, x0, y0, x1, y1 = C(k); return (cx, y0)
    def tepi_bawah(k):
        cx, cy, x0, y0, x1, y1 = C(k); return (cx, y1)
    for a, b, lbl, mode in edges:
        ca, cya, ax0, ay0, ax1, ay1 = C(a); cb, cyb, bx0, by0, bx1, by1 = C(b)
        sa, sb = steps[a][4], steps[b][4]
        if mode == "lurus":
            pts = [(ca, ay1), (cb, by0)]
        elif mode == "datar":
            if cb > ca: pts = [(ax1, cya), (bx0, cyb)]
            else: pts = [(ax0, cya), (bx1, cyb)]
        elif mode == "turun":
            ymid = by0 - 22
            pts = [(ca, ay1), (ca, ymid), (cb, ymid), (cb, by0)]
        elif mode in ("koridor", "koridor_kiri"):
            kanan = mode == "koridor"
            kx = 40 + lane_of[a]*LW + (KOR if kanan else LW-KOR)
            sx = ax1 if kanan else ax0
            masuk = (bx0, cyb) if cb > kx else (bx1, cyb)
            pts = [(sx, cya), (kx, cya), (kx, cyb), masuk]
        elif mode in ("datar_atas", "datar_bawah"):
            dy = -10 if mode == "datar_atas" else 10
            if cb > ca: pts = [(ax1, cya+dy), (bx0, cyb+dy)]
            else: pts = [(ax0, cya+dy), (bx1, cyb+dy)]
        elif mode == "samping_turun":   # keluar sisi (putusan) lalu turun ke atas b
            sx = ax1 if cb > ca else ax0
            pts = [(sx, cya), (cb, cya), (cb, by0)]
        e = d.edge(B[a], B[b], pts)
        if lbl and mode in ("koridor", "koridor_kiri"):
            w, h = text_size(lbl, 8)
            kx = pts[1][0]; yl = cya-60 if cyb < cya else cya+60
            d.label(kx-8-w/2 if mode == "koridor" else kx+8+w/2, yl, lbl, 8, owner=e)
        elif lbl:
            w, h = text_size(lbl, 8)
            # label di ruas pertama
            (x0, y0), (x1, y1) = pts[0], pts[1]
            if abs(x1-x0) < 1:   # vertikal: label di kanan garis
                d.label(x0+8+w/2, (y0+y1)/2, lbl, 8, owner=e)
            elif mode == "datar_bawah":
                d.label((x0+x1)/2, y0+6+h/2, lbl, 8, owner=e)
            else:                # horizontal: label di atas garis
                d.label((x0+x1)/2, y0-6-h/2, lbl, 8, owner=e)
    if catatan:
        d.box(40, 40+tinggi+20, 700, 90, catatan, "note", "catatan", 9)
    d.save_drawio(fn); d.check(); d.render(png)

# ================= IV.1 =================
alir("Gambar IV.1 Alur Sistem Berjalan Bagian 1", "IV-01-alur-sistem-berjalan-bagian-1.drawio", "iv1.png",
 ["Ketua Jurusan / Direktur", "Dosen", "Sistem BKD yang Berjalan", "Asesor"],
 {"m": (0, 70, 44, "Mulai", "term"),
  "a1":(0, 160, 70, "Menerbitkan Surat Keputusan dan\nSurat Tugas beserta lampiran penugasan", "task"),
  "b1":(1, 280, 75, "Membaca lampiran penugasan dan\nmengetik ulang parameter kegiatan\npada formulir laporan", "task"),
  "b2":(1, 405, 60, "Melampirkan dokumen bukti kegiatan", "task"),
  "kb":(1, 470, 60, "B", "conn_r"),
  "b3":(1, 570, 55, "Mengajukan laporan BKD", "task"),
  "c1":(2, 675, 60, "Menyimpan pengajuan laporan BKD", "task"),
  "d1":(3, 785, 70, "Menerima pengajuan\nAsesor 1 dan Asesor 2 secara terpisah", "task"),
  "d2":(3, 905, 60, "Memeriksa kegiatan dan dokumen bukti", "task"),
  "ka":(3, 1015, 60, "A", "conn")},
 [("m","a1","","lurus"),("a1","b1","","turun"),("b1","b2","","lurus"),("b2","b3","","lurus"),
  ("kb","b3","dari Gambar IV.2","koridor"),
  ("b3","c1","","turun"),("c1","d1","","turun"),("d1","d2","","lurus"),("d2","ka","","lurus")])

# ================= IV.2 =================
alir("Gambar IV.2 Alur Sistem Berjalan Bagian 2", "IV-02-alur-sistem-berjalan-bagian-2.drawio", "iv2.png",
 ["Asesor", "Dosen", "Sistem BKD yang Berjalan"],
 {"ka":(0, 60, 60, "A", "conn"),
  "e1":(0, 170, 70, "Mencocokkan parameter kegiatan dengan\nRubrik BKD pada PO BKD 2021", "task"),
  "e2":(0, 290, 60, "Menghitung nilai kredit SKS\nsecara manual", "task"),
  "e3":(0, 400, 95, "Laporan sesuai\ndokumen dan rubrik?", "dec"),
  "f1":(0, 555, 65, "Mengembalikan laporan kepada\ndosen untuk direvisi", "task"),
  "f2":(1, 555, 65, "Memperbaiki data kegiatan", "task"),
  "kb":(1, 670, 60, "B", "conn"),
  "g1":(0, 690, 70, "Menetapkan nilai kredit yang disetujui\nAsesor 1 dan Asesor 2 secara terpisah", "task"),
  "g2":(0, 815, 90, "Nilai kedua\nasesor sama?", "dec"),
  "g3":(0, 960, 55, "Merata-ratakan nilai\nkedua asesor", "task"),
  "h1":(2, 1050, 60, "Menyimpan hasil penilaian\ndan simpulan BKD", "task"),
  "s": (2, 1160, 44, "Selesai", "term")},
 [("ka","e1","","lurus"),("e1","e2","","lurus"),("e2","e3","","lurus"),
  ("e3","f1","tidak sesuai","lurus"),("f1","f2","","datar"),("f2","kb","","lurus"),
  ("e3","g1","sesuai","koridor"),("g1","g2","","lurus"),("g2","g3","berbeda","lurus"),
  ("g3","h1","","turun"),("g2","h1","sama","koridor"),("h1","s","","lurus")])

# ================= IV.3 =================
alir("Gambar IV.3 Alur Sistem Diusulkan Bagian 1", "IV-03-alur-sistem-diusulkan-bagian-1.drawio", "iv3.png",
 ["Administrator", "Sistem", "Layanan Ekstraksi Dokumen", "Lapisan On-chain", "Dosen"],
 {"m": (0, 70, 44, "Mulai", "term"),
  "a1":(0, 160, 70, "Menambah periode BKD beserta rentang\ntiga fase dan mengaktifkannya", "task"),
  "a2":(0, 280, 60, "Mengunggah berkas SK dan ST", "task"),
  "b1":(2, 390, 70, "Mengekstraksi lampiran penugasan\nmenjadi baris penugasan", "task"),
  "c1":(1, 510, 70, "Memetakan baris menjadi calon kegiatan\ndan mencocokkan nama dosen ke akun", "task"),
  "c2":(1, 630, 70, "Menghitung sidik digital berkas dan\nmencatatkannya ke kontrak registri", "task"),
  "x1":(3, 630, 70, "BKDDokumenRegistri\nevent DokumenTercatat", "task"),
  "c3":(1, 750, 70, "Menampilkan pratinjau pemetaan\nbeserta temuan validasi", "task"),
  "a3":(0, 870, 95, "Seluruh baris\ncocok?", "dec"),
  "a4":(0, 1015, 70, "Mengoreksi baris: memilih akun,\nmengubah parameter, atau melewati baris", "task"),
  "c4":(1, 1140, 65, "Menghitung kredit setiap kegiatan\nyang akan diterapkan", "task"),
  "x2":(3, 1140, 75, "KalkulatorBKDPendidikan\nfungsi pure, keluaran SKS x100", "task"),
  "c5":(1, 1260, 65, "Membentuk kegiatan portofolio\ndan dokumen BKD dosen", "task"),
  "a5":(0, 1380, 65, "Menugaskan dua asesor\npada dokumen BKD", "task"),
  "e1":(4, 1500, 65, "Kegiatan tampil pada portofolio\ndengan penanda belum diklaim", "task"),
  "ka":(4, 1610, 60, "A", "conn")},
 [("m","a1","","lurus"),("a1","a2","","lurus"),("a2","b1","","turun"),("b1","c1","","turun"),
  ("c1","c2","","lurus"),("c2","c3","","lurus"),("c3","a3","","turun"),
  ("a3","a4","tidak","lurus"),("a4","c3","pratinjau ulang","koridor_kiri"),
  ("a3","c4","ya","samping_turun"),("c4","c5","","lurus"),("c5","a5","","turun"),
  ("a5","e1","","turun"),("e1","ka","","lurus"),
  ("c2","x1","hash dokumen","datar_atas"),("x1","c2","transaction hash","datar_bawah"),
  ("c4","x2","parameter kegiatan","datar_atas"),("x2","c4","nilai SKS x100","datar_bawah")],
 None)
# aliran ke on-chain (dua arah, sejajar) ditambahkan manual di bawah lewat fungsi khusus

# ================= IV.4 =================
alir("Gambar IV.4 Alur Sistem Diusulkan Bagian 2", "IV-04-alur-sistem-diusulkan-bagian-2.drawio", "iv4.png",
 ["Dosen", "Sistem", "Asesor", "Lapisan On-chain"],
 {"ka":(0, 60, 60, "A", "conn"),
  "d1":(0, 165, 70, "Menarik kegiatan dari portofolio\nke dokumen BKD", "task"),
  "d2":(0, 280, 60, "Mengunggah dokumen bukti kegiatan", "task"),
  "s1":(1, 390, 75, "Memeriksa keaslian bukti melalui layanan\nmodel bahasa visual dan menandai temuan", "task"),
  "s2":(1, 515, 60, "Mencatat jejak dokumen bukti\nke kontrak registri", "task"),
  "x1":(3, 515, 70, "BKDDokumenRegistri\nevent DokumenTercatat", "task"),
  "d3":(0, 630, 60, "Menyimpan permanen dokumen BKD", "task"),
  "a1":(2, 740, 75, "Memverifikasi kesesuaian parameter terhadap\ndokumen sumber dan menetapkan status", "task"),
  "a2":(2, 865, 95, "Seluruh kegiatan\ndisetujui?", "dec"),
  "a3":(2, 1010, 65, "Mengembalikan kegiatan\nuntuk diperbaiki", "task"),
  "d4":(0, 1010, 60, "Memperbaiki dokumen bukti kegiatan", "task"),
  "a4":(2, 1135, 60, "Mengesahkan penilaian", "task"),
  "s3":(1, 1250, 95, "Kedua asesor sudah\nmengesahkan?", "dec"),
  "s4":(1, 1395, 65, "Membentuk simpulan BKD\nbeserta hash penilaian", "task"),
  "s5":(1, 1515, 65, "Menerbitkan token kredit\nke wallet dosen", "task"),
  "x2":(3, 1515, 75, "BKDSKSToken\nmint dengan referenceId\nberupa hash simpulan", "task"),
  "s6":(1, 1635, 44, "Selesai", "term")},
 [("ka","d1","","lurus"),("d1","d2","","lurus"),("d2","s1","","turun"),("s1","s2","","lurus"),
  ("s2","d3","","turun"),("d3","a1","","turun"),("a1","a2","","lurus"),
  ("a2","a3","tidak","lurus"),("a3","d4","","datar"),("d4","a1","nilai ulang","koridor"),
  ("a2","a4","ya","koridor"),("a4","s3","","turun"),("s3","a1","belum, menunggu asesor lain","koridor"),
  ("s3","s4","sudah","lurus"),("s4","s5","","lurus"),("s5","s6","","lurus"),
  ("s2","x1","hash dokumen","datar_atas"),("x1","s2","transaction hash","datar_bawah"),
  ("s5","x2","alamat wallet, jumlah token","datar_atas"),("x2","s5","transaction hash","datar_bawah")],
 None)
