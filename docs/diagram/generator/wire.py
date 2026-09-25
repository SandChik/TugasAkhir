# -*- coding: utf-8 -*-
"""IV.17 sampai IV.19: rancangan tata letak layar (screen layout, Pressman 2001 subbab 15.4.1).
Koordinat ditulis dalam piksel halaman asli (viewport 1440x900, dipotret dengan Playwright) lalu
diskalakan 0,75 supaya rancangan mendekati halaman yang berjalan. Nomor lingkaran merujuk baris komponen
pada Tabel IV.28 sampai Tabel IV.30."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dg import Dia, text_size

PILIH = [a.lower() for a in sys.argv[1:]]
PUTIH = "#ffffff"; ABU = "#6b7280"; NAVY = "#14315e"; MERAH = "#c62828"; BIRU = "#1f5eff"; HIJAU = "#2e7d4f"
R = 0.75; OX, OY = 40, 40
def S(v): return v * R

class Layar:
    """pembungkus: koordinat piksel asli -> kanvas."""
    def __init__(s, d, W=1440, H=900):
        s.d = d; s.fr = d.box(OX, OY, S(W), S(H), "", "wadah", "layar", 9)
    def kotak(s, x, y, w, h, text, shape="rect", warna="garis", fs=8, parent=None, **kw):
        if parent is None:
            return s.d.box(OX + S(x), OY + S(y), S(w), S(h), text, shape, warna, fs, **kw)
        return s.d.box(S(x), S(y), S(w), S(h), text, shape, warna, fs, parent=parent, **kw)
    def teks(s, x, y, w, h, text, fs=8, parent=None, **kw):
        kw.setdefault("align", "left")
        return s.kotak(x, y, w, h, text, "text", "putih", fs, parent=parent, **kw)

def callout(d, n, target, sisi, jarak=34, geser=0):
    """lingkaran bernomor di sisi kotak target dengan garis penunjuk pendek."""
    x0, y0, x1, y1 = d.abs_box(target); r = 11
    if sisi == "kanan":   cx, cy = x1 + jarak, (y0 + y1) / 2 + geser; p = [(cx - r, cy), (x1, cy)]
    elif sisi == "kiri":  cx, cy = x0 - jarak, (y0 + y1) / 2 + geser; p = [(cx + r, cy), (x0, cy)]
    elif sisi == "bawah": cx, cy = (x0 + x1) / 2 + geser, y1 + jarak; p = [(cx, cy - r), (cx, y1)]
    else:                 cx, cy = (x0 + x1) / 2 + geser, y0 - jarak; p = [(cx, cy + r), (cx, y0)]
    c = d.box(cx - r, cy - r, 2 * r, 2 * r, str(n), "bulat", "navy", 9, fc=PUTIH)
    d.edge(c, target, p, arrow_end=False)
    return c

SEKSI = [("A", "Melaksanakan perkuliahan (tutorial,\ntatap muka, dan/atau daring) dan..."),
         ("B", "Membimbing seminar mahasiswa"),
         ("C", "Membimbing Kuliah Kerja Nyata,\nPraktek Kerja Nyata, Praktek..."),
         ("D", "Membimbing dan ikut membimbing\ndalam menghasilkan disertasi,..."),
         ("E", "Bertugas sebagai penguji pada ujian\nakhir/profesi"),
         ("F", "Membina kegiatan mahasiswa di\nbidang akademik dan kemahasis..."),
         ("G", "Melakukan kegiatan pengembangan\nprogram kuliah tatap muka/daring..."),
         ("H", "Mengembangkan bahan kuliah"),
         ("I", "Menduduki jabatan pimpinan\nperguruan tinggi"),
         ("J", "Melakukan kegiatan pengembangan\ndiri untuk meningkatkan...")]
MENU = [(None, ["Profil"]),
        ("Pelaksanaan pendidikan", ["Pengajaran", "Bimbingan mahasiswa", "Pengujian mahasiswa", "Bahan ajar", "Pembinaan mahasiswa", "Tugas tambahan"]),
        ("Layanan BKD", ["Rekap kegiatan", "Asesor BKD"])]

def kerangka(L, nama, deskripsi, aktif, remah, judul, asesor=False):
    """bilah sisi 240 px, bilah atas 56 px, remah, judul; mengikuti AppShell."""
    sb = L.kotak(0, 0, 240, 900, "", "wadah", "navy", 9)
    L.kotak(20, 16, 28, 28, "L", "rect", "logo", 7, parent=sb, fc=PUTIH, bold=True)
    L.teks(56, 16, 160, 28, "LedgerDik", 8, parent=sb, bold=True, fc=PUTIH)
    L.teks(20, 72, 210, 20, nama, 7, parent=sb, bold=True, fc=PUTIH)
    L.teks(20, 90, 210, 18, deskripsi, 6, parent=sb, fc="#c7d2e6")
    y = 132
    for seksi, items in MENU:
        if seksi:
            L.teks(20, y, 210, 22, seksi, 7, parent=sb, bold=True, fc=PUTIH); y += 28
        for it in items:
            if it == "Asesor BKD" and not asesor: continue
            if it == aktif: L.kotak(20, y, 200, 32, it, "tombol", "primer", 7, parent=sb, fc=PUTIH, align="left")
            else: L.teks(32, y, 190, 32, it, 7, parent=sb, fc="#c7d2e6")
            y += 33
        y += 8
    tb = L.kotak(240, 0, 1200, 56, "", "wadah", "kartu", 9)
    L.teks(24, 14, 200, 28, "Institusi A", 7, parent=tb, bold=True, fc=NAVY)
    L.teks(1040, 14, 140, 28, "Pengaturan       Keluar", 6, parent=tb, fc=ABU, align="center")
    L.teks(264, 74, 700, 20, remah, 6, fc=ABU)
    L.teks(264, 108, 800, 34, judul, 10, bold=True, fc=NAVY)

def panel_seksi(L, x, y, aktif, badge, penanda=None):
    """daftar seksi seperti PanelSeksi: lebar 248, baris 43 px."""
    n = len(SEKSI); p = L.kotak(x, y, 248, n * 43 + 2, "", "wadah", "kartu", 8)
    for i, (huruf, nama) in enumerate(SEKSI):
        yy = 1 + i * 43
        if huruf == aktif: L.kotak(1, yy, 246, 43, "", "wadah", "lembut", 8, parent=p)
        L.kotak(10, yy + 11, 21, 21, huruf, "rect", "primer" if huruf == aktif else "abu", 5, parent=p, bold=True,
                fc=PUTIH if huruf == aktif else ABU)
        L.teks(34, yy + 4, 178, 35, nama, 5, parent=p, fc=BIRU if huruf == aktif else ABU)
        if penanda and penanda[i]: L.teks(206, yy + 12, 22, 17, penanda[i], 6, parent=p, fc=BIRU, align="center")
        L.teks(226, yy + 12, 22, 17, badge[i], 6, parent=p, fc=ABU, align="center")
    return p

def tabel(L, x, y, kolom, lebar, th, baris, rh, fs=7):
    """sel = teks (rata kiri, tengah vertikal) atau daftar anak (dx, dy, w, h, teks, shape, warna, fs, fc)."""
    sel = {}
    cx = x
    for j, (k, w) in enumerate(zip(kolom, lebar)):
        sel[(-1, j)] = L.kotak(cx, y, w, th, k, "rect", "kepala", fs, bold=True, align="left", fc=NAVY); cx += w
    for i, b in enumerate(baris):
        cx = x; yy = y + th + i * rh
        for j, (isi, w) in enumerate(zip(b, lebar)):
            if isinstance(isi, list):
                c = L.kotak(cx, yy, w, rh, "", "rect", "garis", fs); sel[(i, j)] = c
                for (dx, dy, aw, ah, t, shape, warna, afs, fc) in isi:
                    if shape == "text": L.teks(dx, dy, aw, ah, t, afs, parent=c, fc=fc)
                    else: L.kotak(dx, dy, aw, ah, t, shape, warna, afs, parent=c, fc=fc, bold=True)
            else:
                sel[(i, j)] = L.kotak(cx, yy, w, rh, isi, "rect", "garis", fs, align="left")
            cx += w
    return sel

def bilah_aksi(L, info, tombol):
    """bilah aksi menempel di dasar layar (BarAksi); tombol = [(label, warna, fc)] dari kanan."""
    ba = L.kotak(240, 840, 1200, 60, "", "wadah", "kartu", 8)
    L.kotak(24, 14, 90, 34, "←  Kembali", "tombol", "garis", 7, parent=ba, fc=ABU)
    L.teks(126, 14, 520, 34, info, 6, parent=ba, fc=ABU)
    x = 1176; out = []
    for label, warna, fc in tombol:
        w = 30 + text_size(label, 7)[0] / R
        x -= w; out.append(L.kotak(x, 13, w, 36, label, "tombol", warna, 7, parent=ba, fc=fc)); x -= 12
    return ba, out

# ================= IV.17 Halaman Masuk =================
if not PILIH or "iv17" in PILIH:
    d = Dia("Gambar IV.17 Rancangan Antarmuka Halaman Masuk", S(1440) + 80 + 60, S(900) + 190)
    d.cek_ruang = False   # wireframe mengikuti tata letak UI; aturan jarak diagram tidak berlaku
    L = Layar(d)
    # hero kiri
    logo = L.kotak(168, 270, 44, 44, "L", "rect", "navy", 9, fc=PUTIH, bold=True)
    nama = L.teks(224, 268, 444, 48, "LedgerDik\nBuku Besar Pendidikan & Penilaian Dosen Berbasis Smart Contract", 7, fc=NAVY)
    L.teks(168, 340, 620, 60, "Selamat Datang di LedgerDik", 20, bold=True, fc=NAVY)
    L.teks(168, 412, 620, 34, "Automasi Penilaian BKD, Tercatat di Blockchain", 10, bold=True, fc=NAVY)
    L.teks(168, 452, 560, 120, "Pantau dan validasi Beban Kinerja Dosen bidang pendidikan dalam satu\nplatform yang transparan dan terotomatisasi. LedgerDik membantu dosen,\nasesor, dan admin mewujudkan proses penilaian dan pengesahan kredit SKS\nyang akurat, transparan, dan tercatat permanen dengan menggunakan\nsmart contract di atas jaringan blockchain.", 7, fc=ABU)
    for i, (t, w) in enumerate([("Transparan", 92), ("Terverifikasi On-chain", 150), ("Akurat", 68)]):
        x = 168 + [0, 104, 266][i]
        L.kotak(x, 598, w, 34, t, "tombol", "lembut", 6, fc=BIRU, bold=True)
    # kartu masuk
    k = L.kotak(782, 230, 448, 440, "", "wadah", "kartu", 9)
    L.teks(40, 44, 360, 28, "Masuk ke Akun Anda", 10, parent=k, bold=True, fc=NAVY)
    L.teks(40, 74, 360, 20, "Gunakan email dan password yang ditetapkan admin", 6, parent=k, fc=ABU)
    L.teks(40, 114, 200, 20, "Email", 7, parent=k, bold=True)
    surel = L.kotak(40, 136, 368, 44, "nama@polban.ac.id", "rect", "garis", 7, parent=k, align="left", fc=ABU)
    L.teks(40, 202, 200, 20, "Password", 7, parent=k, bold=True)
    sandi = L.kotak(40, 224, 322, 44, "••••••••••", "rect", "garis", 7, parent=k, align="left", fc=ABU)
    mata = L.kotak(362, 224, 46, 44, "lihat", "rect", "garis", 6, parent=k, fc=ABU)
    L.teks(240, 280, 168, 20, "Lupa Password?", 6, parent=k, fc=BIRU, align="right")
    galat = L.kotak(40, 304, 368, 30, "Email atau password salah, atau akun dinonaktifkan.", "rect", "bahaya", 5, parent=k, align="left", fc=MERAH, dashed=True)
    masuk = L.kotak(40, 346, 368, 44, "Masuk", "tombol", "primer", 8, parent=k, fc=PUTIH, bold=True)
    L.teks(40, 400, 368, 20, "Akun Dosen, Asesor, dan Admin dibuat oleh Administrator sistem.", 5, parent=k, fc=ABU, align="center")
    callout(d, 1, nama, "atas", 30)
    callout(d, 2, surel, "kanan", 60)
    callout(d, 3, mata, "kanan", 60)
    callout(d, 5, galat, "kanan", 60, geser=0)
    callout(d, 4, masuk, "kanan", 60)
    d.box(OX, OY + S(900) + 32, S(1440), 56,
          "Tata letak layar mengikuti Pressman (2001) subbab 15.4.1, disusun pada viewport 1440 x 900. Nomor merujuk komponen pada\n"
          "Tabel IV.28. Halaman gerbang tanpa kerangka bilah sisi: panel pengantar di kiri, kartu masuk di kanan. Kotak putus-putus\n"
          "menyatakan pesan yang hanya tampil saat kredensial ditolak; saat verifikasi berjalan tombol berlabel “Memproses...”.",
          "note", "catatan", 8)
    d.save_drawio("IV-17-antarmuka-halaman-masuk.drawio"); d.check(); d.render("iv17.png")

# ================= IV.18 Detail Rekap Kegiatan Dosen =================
if not PILIH or "iv18" in PILIH:
    d = Dia("Gambar IV.18 Rancangan Antarmuka Halaman Detail Rekap Kegiatan Dosen", S(1440) + 80 + 60, S(900) + 190)
    d.cek_ruang = False   # wireframe mengikuti tata letak UI; aturan jarak diagram tidak berlaku
    L = Layar(d)
    kerangka(L, "Nama Dosen, S.T., M.T.", "Dosen, D3 Teknik Informatika", "Rekap kegiatan",
             "Beranda / Layanan BKD / Rekap kegiatan / Laporan Kinerja", "Laporan Kinerja Dosen - Semester 2025/2026 Genap")
    L.kotak(1300, 108, 116, 30, "Masa Pengisian", "rect", "garis", 6, fc=NAVY)
    # tab
    tabs = []
    for i, (t, x, w) in enumerate([("Biodata", 264, 68), ("Pelaksanaan Pendidikan", 340, 166), ("Simpulan", 514, 76)]):
        tabs.append(L.kotak(x, 155, w, 34, t, "rect", "primer" if i == 1 else "layar", 7, fc=PUTIH if i == 1 else ABU))
    L.kotak(264, 190, 1152, 1, "", "wadah", "abu", 6)
    # bilah info + tombol tarik semua
    info = L.kotak(264, 211, 1152, 40, "", "wadah", "kartu", 8)
    L.teks(16, 8, 640, 24, "Masa Pengisian        Kegiatan diklaim: 2        Total SKS diklaim: 4.00", 6, parent=info, fc=ABU)
    tarik = L.kotak(870, 5, 270, 30, "Tarik Semua Kinerja dari Portofolio (5)", "tombol", "primer", 6, parent=info, fc=PUTIH)
    # panel seksi + kartu seksi
    panel = panel_seksi(L, 264, 267, "A", ["2", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
                        ["*", "+1", "+2", "", "*", "", "+1", "", "", "+1"])
    kartu = L.kotak(528, 267, 888, 392, "", "wadah", "kartu", 8)
    L.teks(16, 10, 600, 40, "A. Melaksanakan perkuliahan (tutorial, tatap muka, dan/atau daring) dan membimbing,\nmenguji serta menyelenggarakan pendidikan di laboratorium sesuai penugasan", 6, parent=kartu, bold=True, fc=NAVY)
    L.kotak(596, 14, 50, 24, "Wajib", "rect", "abu", 5, parent=kartu, fc=ABU)
    L.teks(654, 14, 128, 24, "2 kegiatan · 4.00 sks", 5, parent=kartu, fc=ABU)
    tarik1 = L.kotak(790, 12, 84, 28, "Tarik data (1)", "tombol", "lembut", 5, parent=kartu, fc=BIRU)
    kol = ["No", "Kegiatan", "Rencana\nPertemuan", "sks MK\nterhitung", "sks BKD", "Status", "Status Penilaian", "Aksi"]
    leb = [44, 182, 116, 116, 88, 112, 116, 82]
    bukti_ok = (10, 46, 110, 28, "1 bukti pendukung", "rect", "hijau_l", 5, HIJAU)
    bukti_no = (10, 46, 140, 28, "Belum ada bukti pendukung", "rect", "bahaya", 5, MERAH)
    baris = [["1", [(10, 8, 170, 36, "Dasar-Dasar\nPemrograman / 1C", "text", None, 6, None), bukti_ok], "16 Pertemuan", "2 sks", "2.00",
              [(10, 30, 92, 26, "Terpenuhi", "rect", "hijau_l", 5, HIJAU)], "-", [(6, 30, 34, 26, "ubah", "rect", "kuning", 4, None), (46, 30, 26, 26, "x", "rect", "bahaya", 6, MERAH)]],
             ["2", [(10, 8, 170, 36, "Dasar-Dasar\nPemrograman / 1D", "text", None, 6, None), bukti_no], "16 Pertemuan", "2 sks", "2.00",
              [(10, 30, 92, 26, "Belum diisi", "rect", "abu", 5, ABU)], "-", [(6, 30, 34, 26, "ubah", "rect", "kuning", 4, None), (46, 30, 26, 26, "x", "rect", "bahaya", 6, MERAH)]]]
    sel = tabel(L, 545, 340, kol, leb, 56, baris, 86, fs=6)
    ty = 340 + 56 + 2 * 86
    tot = L.kotak(545, ty, sum(leb), 36, "", "wadah", "kepala", 6)
    L.teks(56, 6, 200, 24, "Total sks", 6, parent=tot, bold=True, fc=NAVY)
    L.teks(470, 6, 80, 24, "4.00", 6, parent=tot, bold=True, fc=NAVY)
    L.kotak(1194, 680, 222, 34, "B. Membimbing seminar mahasiswa  ›", "tombol", "garis", 6, fc=NAVY)
    ba, tombol = bilah_aksi(L, "2 kegiatan diklaim · 4.00 sks        Seksi wajib belum terisi: E", [("Simpan Permanen (final)", "sukses", PUTIH), ("Simpan Sementara", "garis", NAVY)])
    callout(d, 1, tabs[2], "kanan", 40)
    callout(d, 2, panel, "bawah", 30)
    callout(d, 3, kartu, "kanan", 30)
    callout(d, 4, tarik, "atas", 30, geser=60)
    callout(d, 5, sel[(1, 5)], "bawah", 40)
    callout(d, 6, sel[(1, 7)], "bawah", 40)
    callout(d, 7, ba, "atas", 30, geser=-300)
    d.box(OX, OY + S(900) + 32, S(1440), 56,
          "Tata letak layar mengikuti Pressman (2001) subbab 15.4.1, disusun pada viewport 1440 x 900 mengikuti kerangka halaman\n"
          "(bilah sisi, bilah atas, remah, judul). Nomor merujuk komponen pada Tabel IV.29. Pola halaman kerja berbasis seksi: daftar seksi\n"
          "di kiri dengan penanda seksi wajib (*) dan jumlah kegiatan siap ditarik (+n), tabel seksi terpilih di kanan, bilah aksi di dasar layar.",
          "note", "catatan", 8)
    d.save_drawio("IV-18-antarmuka-detail-rekap-kegiatan.drawio"); d.check(); d.render("iv18.png")

# ================= IV.19 Penilaian Asesor =================
if not PILIH or "iv19" in PILIH:
    d = Dia("Gambar IV.19 Rancangan Antarmuka Halaman Penilaian Asesor", S(1440) + 80 + 60, S(900) + 190)
    d.cek_ruang = False   # wireframe mengikuti tata letak UI; aturan jarak diagram tidak berlaku
    L = Layar(d)
    kerangka(L, "Nama Asesor, S.T., M.T.", "Asesor, Teknik Informatika", "Asesor BKD",
             "Beranda / Layanan BKD / Asesor BKD / Peserta BKD / Rincian Peserta", "Penilaian Laporan Kinerja Dosen (LKD) - Semester 2025/2026 Genap", asesor=True)
    # kepala halaman: dua kartu
    k1 = L.kotak(264, 155, 568, 177, "", "wadah", "kartu", 8)
    L.kotak(0, 0, 568, 38, "Laporan", "wadah", "kepala", 7, parent=k1, fc=NAVY)
    L.teks(16, 50, 260, 40, "Dosen\nNama Dosen, S.T., M.T.", 6, parent=k1, fc=ABU)
    L.teks(292, 50, 260, 40, "NIDN\n0012345678", 6, parent=k1, fc=ABU)
    L.teks(16, 98, 260, 40, "Periode\n2025/2026 Genap", 6, parent=k1, fc=ABU)
    L.teks(292, 98, 260, 40, "Fase\nMasa Penilaian Asesor", 6, parent=k1, fc=ABU)
    k2 = L.kotak(848, 155, 568, 177, "", "wadah", "kartu", 8)
    L.kotak(0, 0, 568, 38, "Status penilaian", "wadah", "kepala", 7, parent=k2, fc=NAVY)
    L.teks(16, 50, 260, 40, "Kegiatan diklaim\n2", 6, parent=k2, fc=ABU)
    L.teks(292, 50, 260, 40, "Sudah Anda nilai\n1 dari 2", 6, parent=k2, fc=ABU)
    L.teks(16, 108, 300, 24, "Asesor ke-1 (Anda)", 6, parent=k2, fc=ABU)
    L.kotak(430, 108, 122, 24, "Belum mengesahkan", "rect", "abu", 5, parent=k2, fc=ABU)
    L.teks(16, 140, 300, 24, "Asesor ke-2 (Nama Asesor 2)", 6, parent=k2, fc=ABU)
    L.kotak(430, 140, 122, 24, "Sudah mengesahkan", "rect", "hijau_l", 5, parent=k2, fc=HIJAU)
    temuan = L.kotak(264, 350, 1152, 40, "Verifikasi nama: 1 kegiatan dengan bukti tidak sesuai   •   Dasar-Dasar Pemrograman / 1D (1 dokumen)", "rect", "bahaya", 6, align="left", fc=MERAH)
    panel = panel_seksi(L, 264, 406, "A", ["1/2", "0", "0", "0", "0", "0", "0", "0", "0", "0"], ["!", "", "", "", "", "", "", "", "", ""])
    kartu = L.kotak(528, 406, 888, 270, "", "wadah", "kartu", 8)
    L.teks(16, 10, 640, 40, "A. Melaksanakan perkuliahan (tutorial, tatap muka, dan/atau daring) dan membimbing,\nmenguji serta menyelenggarakan pendidikan di laboratorium sesuai penugasan", 6, parent=kartu, bold=True, fc=NAVY)
    L.teks(740, 14, 136, 24, "1/2 kegiatan dinilai", 5, parent=kartu, fc=ABU)
    kol = ["No", "Nama Kegiatan", "Bukti", "SKS Kontrak", "Penilaian (sks)", "Status", "Komentar"]
    leb = [44, 250, 92, 100, 106, 110, 154]
    baris = [["1", [(10, 8, 230, 40, "Dasar-Dasar Pemrograman / 1C\nEDU101", "text", None, 6, ABU)], [(10, 14, 40, 26, "1", "tombol", "primer", 6, PUTIH)], "2.00",
              [(8, 12, 72, 30, "2.00", "rect", "garis", 6, None)], [(8, 12, 94, 30, "Disetujui  ▼", "rect", "garis", 6, None)], [(8, 12, 138, 30, "Komentar/rekomendasi", "rect", "garis", 5, ABU)]],
             ["2", [(10, 8, 230, 40, "Dasar-Dasar Pemrograman / 1D\nEDU101", "text", None, 6, ABU)], [(10, 14, 40, 26, "1", "tombol", "bahaya", 6, MERAH), (56, 14, 26, 26, "!", "rect", "bahaya", 6, MERAH)], "2.00",
              [(8, 12, 72, 30, "2.00", "rect", "garis", 6, None)], [(8, 12, 94, 30, "Revisi  ▼", "rect", "garis", 6, None)], [(8, 12, 138, 30, "Bukti atas nama dosen lain", "rect", "garis", 5, None)]]]
    sel = tabel(L, 545, 470, kol, leb, 40, baris, 54, fs=6)
    L.kotak(1194, 690, 222, 34, "B. Membimbing seminar mahasiswa  ›", "tombol", "garis", 6, fc=NAVY)
    ba, tombol = bilah_aksi(L, "1/2 kegiatan dinilai", [("Sahkan Penilaian (final)", "navy", PUTIH), ("Simpan Penilaian", "sukses", PUTIH)])
    callout(d, 1, k2, "kanan", 30)
    callout(d, 2, kartu, "kanan", 30)
    callout(d, 3, sel[(1, 4)], "bawah", 40)
    callout(d, 4, sel[(1, 6)], "bawah", 40, geser=-40)
    callout(d, 5, temuan, "kanan", 30)
    callout(d, 6, sel[(1, 2)], "bawah", 40)
    callout(d, 7, ba, "atas", 30, geser=40)
    d.box(OX, OY + S(900) + 32, S(1440), 66,
          "Tata letak layar mengikuti Pressman (2001) subbab 15.4.1, disusun pada viewport 1440 x 900 mengikuti kerangka halaman.\n"
          "Nomor merujuk komponen pada Tabel IV.30. Pola halaman kerja berbasis formulir per baris: isian nilai, status, dan komentar\n"
          "berada pada tiap baris kegiatan; spanduk merah dan tanda seru menandai bukti yang tidak sesuai; angka pada kolom Bukti\n"
          "membuka halaman rincian dokumen bukti.",
          "note", "catatan", 8)
    d.save_drawio("IV-19-antarmuka-penilaian-asesor.drawio"); d.check(); d.render("iv19.png")
