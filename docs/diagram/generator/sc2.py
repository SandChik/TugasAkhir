# -*- coding: utf-8 -*-
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dg import Dia, text_size
FS = 8
MODUL = [("hitungPendidikanFormalDoktor","jumlahSemester"),("hitungPelatihanDasar","jumlahSertifikat"),
 ("hitungPengajaran","sksMataKuliah, jumlahPertemuanRencana,\njumlahPertemuanRealisasi, semesterPenuh,\nteamTeaching, persenPorsiDosen"),
 ("hitungPendidikanDokterEvaluasiPeserta","tanpa data couple masuk"),
 ("hitungPendidikanDokterKomunikasiSpesialis","tanpa data couple masuk"),
 ("hitungPendidikanDokterPelaksanaanPembelajaran","tanpa data couple masuk"),
 ("hitungPendidikanDokterKeputusanKlinisAkhir","tanpa data couple masuk"),
 ("hitungBimbinganSeminarMahasiswa","jumlahSemester"),("hitungBimbinganKKNPKLMagang","jumlahSemester"),
 ("hitungPembimbinganTugasAkhir","peran, jenisTugasAkhir,\njumlahMahasiswa"),
 ("hitungPengujiUjianAkhir","peranPenguji, jumlahMahasiswa"),("hitungPembinaKegiatanMahasiswa","jumlahSemester"),
 ("hitungPengembanganProgramKuliah","jumlahSemester"),
 ("hitungPengembanganBahanAjar","jenisBahanAjar, jumlahNaskah,\nperanTim, jumlahAnggotaTim"),
 ("hitungOrasiIlmiah","jumlahOrasi"),("hitungJabatanPimpinanPerguruanTinggi","jabatan, jumlahSemester"),
 ("hitungMembimbingDosenLebihRendah","jenis, jumlahOrang,\njumlahSemester"),
 ("hitungDetaseringPencangkokan","lokasi, jumlahKegiatan"),
 ("hitungPendampinganMahasiswaLuarInstitusi","jenjang, jumlahSemester"),
 ("jumlahkanSKS","daftarNilaiSKSX100")]
# ---------- IV.12 : pohon dua kolom ----------
d = Dia("Gambar IV.12 Structure Chart Kontrak Kalkulator BKD Pendidikan", 1700, 1330)
akar = d.box(690, 40, 320, 66, "Modul Orkestrasi Perhitungan\npada lapisan aplikasi web", "rect", "akar", 11, bold=True)
tx_l, tx_r = akar.cx-70, akar.cx+70          # batang kiri/kanan
CW, CH, Y0, DY = 300, 60, 210, 100
for i, (nama, par) in enumerate(MODUL):
    kiri = i < 10; k = i if kiri else i-10
    cy = Y0 + k*DY
    fill = "modul"
    if kiri:
        m = d.box(110, cy-CH/2, CW, CH, nama, "rect", fill, 9)
        pts = [(tx_l, akar.y1), (tx_l, cy), (m.x1, cy)]
        e = d.edge(akar, m, pts)
        t = par; w, h = text_size(t, FS)
        d.label(m.x1+12+w/2, cy-5-h/2, t, FS, owner=e)
    else:
        m = d.box(1290, cy-CH/2, CW, CH, nama, "rect", fill, 9)
        pts = [(tx_r, akar.y1), (tx_r, cy), (m.x, cy)]
        e = d.edge(akar, m, pts)
        t = par; w, h = text_size(t, FS)
        d.label(m.x-12-w/2, cy-5-h/2, t, FS, owner=e)
d.box(110, Y0+10*DY-20, 1480, 96,
      "Notasi mengikuti Pressman (2001): kotak menyatakan modul, panah menyatakan pemanggilan dari modul superordinat ke modul\n"
      "subordinat, dan nama pada panah menyatakan data couple masuk. Seluruh modul perhitungan mengembalikan satu data couple\n"
      "sksX100 bertipe uint256 kepada modul pemanggil. Modul jumlahkanSKS berperan sebagai modul rekapitulasi. Fan-out modul\n"
      "pemanggil berjumlah dua puluh sesuai Tabel IV.21. Hierarki digambar dalam dua kolom hanya untuk menghemat ruang halaman;\n"
      "seluruh modul berada pada tingkat yang sama di bawah modul pemanggil. Urutan, percabangan, dan pengulangan tidak digambarkan.",
      "note", "catatan", 9)
d.save_drawio("IV-12-structure-chart-kalkulator.drawio"); d.check(); d.render("iv12.png")

def kipas(d, akar, anak, labels, bus0=26, step=22):
    """panah dari akar ke deretan anak sebaris di bawahnya, tanpa persilangan (aturan sarang)."""
    n = len(anak); cx = akar.cx
    order = sorted(range(n), key=lambda i: abs(anak[i].cx-cx))
    ki = [i for i in range(n) if anak[i].cx < cx-1]; ka = [i for i in range(n) if anak[i].cx > cx+1]
    R = max(len(ki), len(ka), 1)-1
    for i, m in enumerate(anak):
        if abs(m.cx-cx) <= 1:
            pts = [(cx, akar.y1), (cx, m.y)]
        else:
            grp = ki if i in ki else ka
            rank = sorted(grp, key=lambda k: abs(anak[k].cx-cx)).index(i)
            bus = akar.y1 + bus0 + (R-rank)*step
            sgn = -1 if i in ki else 1
            ex = cx + sgn*(14+rank*16)
            pts = [(ex, akar.y1), (ex, bus), (m.cx, bus), (m.cx, m.y)]
        e = d.edge(akar, m, pts)
        t = labels[i]; w, h = text_size(t, FS)
        d.label(m.cx+8+w/2, m.y-12-h/2, t, FS, owner=e)

# ---------- IV.13 : token ----------
d = Dia("Gambar IV.13 Structure Chart Kontrak Token SKS", 1150, 640)
akar = d.box(415, 40, 320, 66, "Modul Integrasi Token\npada lapisan aplikasi web", "rect", "akar", 11, bold=True)
nama = ["constructor","mint","burn","_update\npembatas pemindahan"]
lab = ["admin, initialMinter","to, amount, referenceId","account, amount, reason","from, to, value"]
anak = [d.box(50+i*270, 260, 220, 60, nama[i], "rect", "modul", 10) for i in range(4)]
kipas(d, akar, anak, lab)
g1 = d.box(320, 400, 220, 55, "Pemeriksa peran\nMINTER_ROLE", "rect", "jaga", 9)
g2 = d.box(590, 400, 220, 55, "Pemeriksa peran\nDEFAULT_ADMIN_ROLE", "rect", "jaga", 9)
for m, g in ((anak[1], g1), (anak[2], g2)):
    e = d.edge(m, g, [(m.cx, m.y1), (g.cx, g.y)])
    w, h = text_size("peran_pemanggil", FS); d.label(g.cx+8+w/2, g.y-12-h/2, "peran_pemanggil", FS, owner=e)
d.box(50, 500, 760, 96,
      "Notasi mengikuti Pressman (2001). Modul mint dan modul burn masing-masing dijaga satu modul pemeriksa\n"
      "peran. Modul _update menahan seluruh jalur transfer bawaan ERC-20 sehingga token bersifat non-transferable.\n"
      "Modul mint dan modul burn mengembalikan data couple transaction hash kepada modul pemanggil.\n"
      "Rincian modul disajikan pada Tabel IV.23. Urutan, percabangan, dan pengulangan tidak digambarkan.",
      "note", "catatan", 9)
d.save_drawio("IV-13-structure-chart-token.drawio"); d.check(); d.render("iv13.png")

# ---------- IV.14 : registri ----------
d = Dia("Gambar IV.14 Structure Chart Kontrak Registri Dokumen", 1000, 600)
akar = d.box(340, 40, 320, 66, "Modul Pencatatan Jejak Dokumen\npada lapisan aplikasi web", "rect", "akar", 11, bold=True)
c1 = d.box(390, 240, 220, 60, "catat", "rect", "modul", 10)
kipas(d, akar, [c1], ["hashDokumen, aksi, referensi"])
g1 = d.box(120, 400, 220, 55, "Pemeriksa peran\nPENCATAT_ROLE", "rect", "jaga", 9)
g2 = d.box(660, 400, 220, 55, "Pembangkit event\nDokumenTercatat", "rect", "jaga", 9)
kipas(d, c1, [g1, g2], ["peran_pemanggil", "hashDokumen, aksi, referensi"])
d.box(60, 490, 760, 84,
      "Notasi mengikuti Pressman (2001). Modul catat dijaga modul pemeriksa peran pencatat dan menolak sidik\n"
      "digital bernilai nol. Keluarannya berupa data couple transaction hash kepada modul pemanggil serta event\n"
      "DokumenTercatat pada jaringan. Jenis aksi ditegakkan lapisan aplikasi sebagai tipe tertutup, bukan\n"
      "divalidasi kontrak. Rincian modul disajikan pada Tabel IV.24.",
      "note", "catatan", 9)
d.save_drawio("IV-14-structure-chart-registri.drawio"); d.check(); d.render("iv14.png")
