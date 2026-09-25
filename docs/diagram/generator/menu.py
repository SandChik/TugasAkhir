# -*- coding: utf-8 -*-
"""IV.16 Arsitektur navigasi (Pressman 2001, 29.5.1 struktur hierarkis WebApp dan 29.5.2 navigasi per
peran pengguna). Halaman masuk sebagai gerbang, pengalih beranda berdasarkan peran, lalu pohon menu tiga
ruang kerja. Nama halaman mengikuti Tabel IV.27; struktur diambil dari components/Sidebar.tsx dan app/."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dg import Dia

# simpul: (teks, jenis, anak) ; jenis: peran | seksi | halaman | turunan (dicapai dari induknya) | bersama
ADMIN = ("Ruang kerja Administrator\n/admin", "admin", [
    ("Profil", "halaman", []),
    ("Administrasi", "seksi", [
        ("Pengguna", "halaman", []),
        ("Wallet", "halaman", []),
        ("Periode", "halaman", []),
        ("Penugasan Asesor", "halaman", []),
        ("Referensi Kegiatan", "halaman", []),
        ("Unggah Dokumen", "halaman", [("Detail Unggahan", "turunan", [])]),
        ("Kegiatan", "halaman", [])]),
    ("Blockchain", "seksi", [
        ("Token (tidak ditampilkan pada menu)", "turunan", []),
        ("Log Blockchain", "halaman", []),
        ("Registri Dokumen", "halaman", [])]),
    ("Laporan", "seksi", [("Rekapitulasi", "halaman", [])])])
DOSEN = ("Ruang kerja Dosen\n/dosen", "dosen", [
    ("Profil", "halaman", []),
    ("Pelaksanaan pendidikan", "seksi", [
        ("Pengajaran", "halaman", [("Detail Kegiatan", "turunan", [])]),
        ("Bimbingan mahasiswa", "halaman", [
            ("Detail Kegiatan", "turunan", []),
            ("Tambah Kegiatan", "turunan", []),
            ("Ubah Kegiatan", "turunan", []),
            ("Unggah Bukti", "turunan", [])]),
        ("Pengujian mahasiswa", "halaman", []),
        ("Bahan ajar", "halaman", []),
        ("Pembinaan mahasiswa", "halaman", []),
        ("Tugas tambahan", "halaman", [])]),
    ("Layanan BKD", "seksi", [
        ("Rekap Kegiatan", "halaman", [
            ("Detail Rekap Kegiatan", "turunan", [
                ("Detail Bukti Kegiatan", "turunan", [])])])])])
ASESOR = ("Ruang kerja Asesor\n/asesor", "asesor", [
    ("Profil", "halaman", []),
    ("Pelaksanaan pendidikan", "seksi", [
        ("Enam kategori kegiatan,\nhalaman ruang kerja Dosen", "bersama", [])]),
    ("Layanan BKD", "seksi", [
        ("Rekap Kegiatan,\nhalaman ruang kerja Dosen", "bersama", []),
        ("Asesor BKD", "halaman", [
            ("Penilaian", "turunan", [
                ("Detail Bukti", "turunan", [])])])])])

BW, BH, DY, DX = 230, 32, 42, 26
PERAN = ("admin", "dosen", "asesor")
WARNA = {"admin": "admin", "dosen": "dosen", "asesor": "asesor", "seksi": "entitas",
         "halaman": "putih", "turunan": "putih", "bersama": "putih"}
def tinggi(node):
    teks, jenis, _ = node
    return 44 if jenis in PERAN else (BH + 12 if "\n" in teks else BH)
def pohon(d, x, y, node):
    """gambar simpul pada (x,y) beserta anaknya; kembalikan y berikutnya yang bebas."""
    teks, jenis, anak = node
    h = tinggi(node)
    b = d.box(x, y, BW, h, teks, "rect", WARNA[jenis], 10 if jenis in PERAN else 9,
              bold=jenis in PERAN or jenis == "seksi", dashed=jenis in ("turunan", "bersama"))
    cy = y + h + (DY - BH)
    tx = x + 12
    for a in anak:
        acy = cy + tinggi(a) / 2
        d.edge(b, None, [(tx, b.y1), (tx, acy), (x + DX, acy)], arrow_end=False)
        cy = pohon(d, x + DX, cy, a)
    return cy

KOL, X0, Y0 = 360, 40, 220
d = Dia("Gambar IV.16 Arsitektur Navigasi Sistem LedgerDik", X0 + 3 * KOL + 20, 10)
cx = X0 + 1.5 * KOL - 20
login = d.box(cx - 150, 30, 300, 40, "Halaman Masuk\n/login", "rect", "term", 10, bold=True)
pengalih = d.box(cx - 150, 110, 300, 44, "Beranda /\npengalih berdasarkan peran pada sesi", "rhombus" if False else "rect", "putusan", 9, bold=True)
d.edge(login, pengalih, [(login.cx, login.y1), (pengalih.cx, pengalih.y)])
ymax = 0
for i, n in enumerate((ADMIN, DOSEN, ASESOR)):
    x = X0 + i * KOL
    # dari pengalih ke tiap ruang kerja: turun, mendatar di y=185, turun ke atas kotak peran
    d.edge(pengalih, None, [(pengalih.cx, pengalih.y1), (pengalih.cx, 185), (x + BW / 2, 185), (x + BW / 2, Y0)])
    ymax = max(ymax, pohon(d, x, Y0, n))
d.box(X0, ymax + 30, 3 * KOL - 40, 132,
      "Struktur hierarkis mengikuti Pressman (2001) subbab 29.5.1, dengan jalur navigasi ditetapkan per peran\n"
      "pengguna sesuai subbab 29.5.2. Halaman masuk menjadi gerbang tunggal; beranda mengalihkan pengguna ke\n"
      "ruang kerja perannya, dan permintaan ke ruang kerja peran lain dikembalikan ke sana oleh middleware. Kotak\n"
      "berwarna menyatakan ruang kerja beserta rute dasarnya, kotak abu-abu kelompok menu pada bilah sisi, kotak\n"
      "putih halaman menu, dan kotak putus-putus halaman yang dicapai dari halaman induknya atau halaman yang\n"
      "dipakai bersama. Pengujian mahasiswa, Bahan ajar, Pembinaan mahasiswa, dan Tugas tambahan memiliki halaman\n"
      "turunan yang sama dengan Bimbingan mahasiswa. Nama halaman mengikuti Tabel IV.27.",
      "note", "catatan", 9)
d.h = ymax + 200
d.save_drawio("IV-16-arsitektur-navigasi.drawio"); d.check(); d.render("iv16.png")
