# -*- coding: utf-8 -*-
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dg import Dia, text_size
from dfd2 import bingkai
FS = 8
CO, CL, CG = 20, 48, 26   # data couple: jarak ke garis panggilan, panjang, jarak ke kotak modul
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
d = Dia("Gambar IV.12 Structure Chart Kontrak Kalkulator BKD Pendidikan", 10, 10)
akar = d.box(690, 40, 320, 66, "Modul Orkestrasi Perhitungan\npada lapisan aplikasi web", "rect", "akar", 11, bold=True)
tx_l, tx_r = akar.cx-70, akar.cx+70          # batang kiri/kanan
CW, CH, Y0, DY = 330, 60, 240, 124
for i, (nama, par) in enumerate(MODUL):
    kiri = i < 10; k = i if kiri else i-10
    cy = Y0 + k*DY
    fill = "modul"
    if kiri:
        m = d.box(tx_l - 420 - CW, cy-CH/2, CW, CH, nama, "rect", fill, 9)
        e = d.edge(akar, m, [(tx_l, akar.y1), (tx_l, cy), (m.x1, cy)])
        xa, xb, sg = m.x1+CG, m.x1+CG+CL, 1
    else:
        m = d.box(tx_r + 420, cy-CH/2, CW, CH, nama, "rect", fill, 9)
        e = d.edge(akar, m, [(tx_r, akar.y1), (tx_r, cy), (m.x, cy)])
        xa, xb, sg = m.x-CG, m.x-CG-CL, -1
    # data couple masuk: ekor lingkaran di sisi pemanggil, panah ke arah modul
    if par != "tanpa data couple masuk":
        c = d.edge(None, None, [(xb, cy-CO), (xa, cy-CO)], tail_circle=True)
        w, h = text_size(par, FS); d.label(xa+sg*(w/2+2), cy-CO-7-h/2, par, FS, owner=c)
    # data couple keluar: ekor lingkaran di sisi modul, panah ke arah pemanggil
    c2 = d.edge(None, None, [(xa, cy+CO), (xb, cy+CO)], tail_circle=True)
    w, h = text_size("sksX100", FS); d.label(xa+sg*(w/2+2), cy+CO+7+h/2, "sksX100", FS, owner=c2)
d.box(tx_l - 420 - CW, Y0+10*DY-40, 1480, 96,
      "Notasi mengikuti Pressman (2001): kotak menyatakan modul, panah menyatakan pemanggilan dari modul superordinat ke modul\n"
      "subordinat, dan nama pada panah menyatakan data couple masuk. Seluruh modul perhitungan mengembalikan satu data couple\n"
      "sksX100 bertipe uint256 kepada modul pemanggil. Modul jumlahkanSKS berperan sebagai modul rekapitulasi. Fan-out modul\n"
      "pemanggil berjumlah dua puluh sesuai Tabel IV.21. Hierarki digambar dalam dua kolom hanya untuk menghemat ruang halaman;\n"
      "seluruh modul berada pada tingkat yang sama di bawah modul pemanggil. Urutan, percabangan, dan pengulangan tidak digambarkan.",
      "note", "catatan", 9)
bingkai(d)
d.save_drawio("IV-12-structure-chart-kalkulator.drawio"); d.check(); d.render("iv12.png")

def kipas(d, akar, anak, labels, bus0=30, step=26, keluar=None):
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
            ex = cx + sgn*(20+rank*26)
            pts = [(ex, akar.y1), (ex, bus), (m.cx, bus), (m.cx, m.y)]
        e = d.edge(akar, m, pts)
        # data couple masuk di kiri ruas vertikal terakhir, panah ke bawah (ke modul)
        t = labels[i]; w, h = text_size(t, FS)
        c = d.edge(None, None, [(m.cx-CO, m.y-CG-CL), (m.cx-CO, m.y-CG)], tail_circle=True)
        d.label(m.cx-CO-8-w/2, m.y-CG-CL/2, t, FS, owner=c)
        # data couple keluar di kanan, panah ke atas (ke pemanggil)
        if keluar and keluar[i]:
            c2 = d.edge(None, None, [(m.cx+CO, m.y-CG), (m.cx+CO, m.y-CG-CL)], tail_circle=True)
            w2, h2 = text_size(keluar[i], FS)
            d.label(m.cx+CO+8+w2/2, m.y-CG-CL/2, keluar[i], FS, owner=c2)

# ---------- IV.13 : token ----------
d = Dia("Gambar IV.13 Structure Chart Kontrak Token SKS", 10, 10)
akar = d.box(455, 40, 320, 66, "Modul Integrasi Token\npada lapisan aplikasi web", "rect", "akar", 11, bold=True)
nama = ["constructor","mint","burn","_update\npembatas pemindahan"]
lab = ["admin, initialMinter","to, amount, referenceId","account, amount, reason","from, to, value"]
anak = [d.box(50+i*310, 270, 220, 60, nama[i], "rect", "modul", 10) for i in range(4)]
kipas(d, akar, anak, lab, keluar=["", "transaction hash", "transaction hash", ""])
g1 = d.box(anak[1].x, 470, 220, 55, "Pemeriksa peran\nMINTER_ROLE", "rect", "jaga", 9)
g2 = d.box(anak[2].x, 470, 220, 55, "Pemeriksa peran\nDEFAULT_ADMIN_ROLE", "rect", "jaga", 9)
kipas(d, anak[1], [g1], ["peran_pemanggil"], keluar=["izin"])
kipas(d, anak[2], [g2], ["peran_pemanggil"], keluar=["izin"])
d.box(50, 575, 760, 96,
      "Notasi mengikuti Pressman (2001). Modul mint dan modul burn masing-masing dijaga satu modul pemeriksa\n"
      "peran. Modul _update menahan seluruh jalur transfer bawaan ERC-20 sehingga token bersifat non-transferable.\n"
      "Modul mint dan modul burn mengembalikan data couple transaction hash kepada modul pemanggil.\n"
      "Rincian modul disajikan pada Tabel IV.23. Urutan, percabangan, dan pengulangan tidak digambarkan.",
      "note", "catatan", 9)
bingkai(d)
d.save_drawio("IV-13-structure-chart-token.drawio"); d.check(); d.render("iv13.png")

# ---------- IV.14 : registri ----------
d = Dia("Gambar IV.14 Structure Chart Kontrak Registri Dokumen", 10, 10)
akar = d.box(340, 40, 320, 66, "Modul Pencatatan Jejak Dokumen\npada lapisan aplikasi web", "rect", "akar", 11, bold=True)
c1 = d.box(390, 250, 220, 60, "catat", "rect", "modul", 10)
kipas(d, akar, [c1], ["hashDokumen, aksi, referensi"], keluar=["transaction hash"])
g1 = d.box(90, 460, 220, 55, "Pemeriksa peran\nPENCATAT_ROLE", "rect", "jaga", 9)
g2 = d.box(690, 460, 220, 55, "Pembangkit event\nDokumenTercatat", "rect", "jaga", 9)
kipas(d, c1, [g1, g2], ["peran_pemanggil", "hashDokumen, aksi, referensi"], keluar=["izin", ""])
d.box(60, 575, 760, 84,
      "Notasi mengikuti Pressman (2001). Modul catat dijaga modul pemeriksa peran pencatat dan menolak sidik\n"
      "digital bernilai nol. Keluarannya berupa data couple transaction hash kepada modul pemanggil serta event\n"
      "DokumenTercatat pada jaringan. Jenis aksi ditegakkan lapisan aplikasi sebagai tipe tertutup, bukan\n"
      "divalidasi kontrak. Rincian modul disajikan pada Tabel IV.24.",
      "note", "catatan", 9)
bingkai(d)
d.save_drawio("IV-14-structure-chart-registri.drawio"); d.check(); d.render("iv14.png")
