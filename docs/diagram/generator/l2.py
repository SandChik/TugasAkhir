# -*- coding: utf-8 -*-
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dg import Dia
from dfd2 import cluster, alir_langsung
from data_dfd import STORE, ENT
def baris(nama_dia, fn, png, subs, langsung, catatan):
    lebar = []
    for kode, nama, st, at in subs:
        w = max(len(st)*172, len(at)*250, 190, 330) + 80
        lebar.append(w)
    W = sum(lebar) + 80
    d = Dia(nama_dia, W, 10)
    ada_atas = any(at for _,_,_,at in subs)
    hub_cy = 60 + (170 if ada_atas else 0) + 58
    x = 40; hubs = {}; ymax = 0
    for (kode, nama, st, at), w in zip(subs, lebar):
        cx = x + w/2
        stores = [(STORE[k], b, t) for k, (b, t) in st.items()]
        atas = [(ENT[e], m, k) for e, m, k in at]
        (x0,y0,x1,y1), hub = cluster(d, f"{kode}\n{nama}", cx, hub_cy, [], [], stores, atas)
        hubs[kode] = hub; ymax = max(ymax, y1); x += w
    for a, b, l in langsung: alir_langsung(d, hubs[a], hubs[b], l)
    d.box(40, ymax+50, 640, 96, catatan, "note", "catatan", 9)
    d.h = ymax+190
    d.save_drawio(fn); d.check(); d.render(png)

baris("Gambar IV.8 DFD Level 2 Proses P6", "IV-08-dfd-level-2-p6.drawio", "iv8.png",
 [("P6.1","Ekstraksi Dokumen\nPenugasan",{"D6":("","keluaran_parser, sidik_digital")},
      [("E3","berkas_sk_st","status_unggahan"),("E7","hasil_penafsiran_json","citra_halaman, instruksi_skema_keluaran")]),
  ("P6.2","Pemetaan Baris dan\nPencocokan Dosen",{"D1":("data_akun",""),"D5":("referensi_kegiatan",""),"D6":("keluaran_parser","peta_baris_dan_temuan")},
      [("E3","","pratinjau_pemetaan, temuan_validasi")]),
  ("P6.3","Koreksi Hasil\nEkstraksi",{"D6":("peta_baris_dan_temuan","koreksi_baris")},[("E3","koreksi_baris","")]),
  ("P6.4","Penerapan Hasil\nEkstraksi",{"D2":("periode_dan_fase",""),"D3":("dokumen_bkd","dokumen_bkd_baru"),"D6":("peta_baris_dan_koreksi",""),"D7":("data_kegiatan","kegiatan_dan_nilai_kredit")},
      [("E3","permintaan_penerapan","status_penerapan")]),
  ("P6.5","Input Kegiatan Berbasis\nPenugasan oleh Administrator",{"D1":("data_akun",""),"D2":("periode_dan_fase",""),"D3":("dokumen_bkd","dokumen_bkd_baru"),"D5":("referensi_kegiatan",""),"D7":("data_kegiatan","kegiatan_dan_nilai_kredit")},
      [("E3","data_kegiatan_penugasan","pesan_hasil_aksi")])],
 [],
 "Uraian proses P6 pada Gambar IV.7. Notasi mengikuti Pressman (2001). Tidak terdapat aliran data\n"
 "langsung antarsubproses; seluruh perpindahan data berlangsung melalui penyimpanan data, yang digambar\n"
 "berulang di dekat subproses pemakainya. Aliran diagram ini seimbang dengan proses P6 pada Gambar IV.7,\n"
 "yaitu membaca D1, D2, D3, D5, D6, dan D7 serta menulis D3, D6, dan D7.")

baris("Gambar IV.9 DFD Level 2 Proses P8", "IV-09-dfd-level-2-p8.drawio", "iv9.png",
 [("P8.1","Penyiapan Argumen\nPerhitungan",{"D5":("referensi_kegiatan, fungsi_contract",""),"D7":("parameter_kegiatan","")},[]),
  ("P8.2","Eksekusi Fungsi\nKontrak Kalkulator",{},[("E4","nilai_kredit_x100, galat_input_tidak_valid","nama_fungsi, argumen_perhitungan")]),
  ("P8.3","Penyimpanan Nilai Kredit\ndan Status Perhitungan",{"D7":("","nilai_kredit_dan_status_perhitungan")},[])],
 [("P8.1","P8.2","argumen_perhitungan"),("P8.2","P8.3","nilai_kredit_x100, status_perhitungan")],
 "Uraian proses P8 pada Gambar IV.7. Notasi mengikuti Pressman (2001). Rangkaian ini pengecualian yang\n"
 "dinyatakan pada subbab IV.2.2.2: keluaran perhitungan langsung dipakai proses pemanggilnya. P8.2 tidak\n"
 "mengakses penyimpanan data karena seluruh fungsi kontrak kalkulator bersifat murni. Aliran diagram ini\n"
 "seimbang dengan proses P8 pada Gambar IV.7, yaitu membaca D5 dan D7 serta menulis D7.")

baris("Gambar IV.10 DFD Level 2 Proses P9", "IV-10-dfd-level-2-p9.drawio", "iv10.png",
 [("P9.1","Penyimpanan Penilaian\nper Asesor",{"D2":("periode_dan_fase",""),"D3":("dokumen_bkd",""),"D7":("data_kegiatan",""),"D9":("hasil_penilaian","nilai_disetujui, status, catatan")},
      [("E2","nilai_disetujui, catatan_penilaian","rincian_kegiatan, nilai_kredit")]),
  ("P9.2","Pengesahan Penilaian",{"D4":("penugasan_asesor","penanda_pengesahan"),"D9":("hasil_penilaian","")},[("E2","permintaan_pengesahan","status_pengesahan")]),
  ("P9.3","Pembentukan Simpulan\ndan Hash",{"D3":("","status_dokumen_bkd"),"D4":("penanda_pengesahan",""),"D7":("data_kegiatan",""),"D9":("hasil_penilaian",""),"D10":("","total_kredit, status_pemenuhan, hash_penilaian")},[]),
  ("P9.4","Penerbitan Token Kredit",{"D1":("alamat_wallet_dosen",""),"D10":("","transaction_hash"),"D11":("","catatan_transaksi")},
      [("E5","transaction_hash, event_token","alamat_wallet, jumlah_token, referensi_hash_simpulan")])],
 [("P9.3","P9.4","hash_penilaian, total_kredit")],
 "Uraian proses P9 pada Gambar IV.7. Notasi mengikuti Pressman (2001). P9.3 dan P9.4 hanya berjalan setelah\n"
 "kedua asesor mengesahkan penilaian. Hash simpulan diteruskan langsung dari P9.3 ke P9.4 karena dipakai\n"
 "sebagai referensi transaksi pada saat yang sama, tanpa dibaca ulang. Aliran diagram ini seimbang dengan\n"
 "proses P9 pada Gambar IV.7, yaitu membaca D1, D2, D3, D4, D7, dan D9 serta menulis D3, D4, D9, D10, dan D11.")

baris("Gambar IV.11 DFD Level 2 Proses P11", "IV-11-dfd-level-2-p11.drawio", "iv11.png",
 [("P11.1","Penyeleksian dan\nPemanggilan Parser Bukti",{"D1":("nama_pemilik_akun",""),"D5":("kode_rule_dan_skema",""),"D7":("parameter_kegiatan",""),"D8":("berkas_bukti, jenis_file","")},
      [("E7","hasil_penafsiran_json","citra_halaman, instruksi_skema_keluaran")]),
  ("P11.2","Penormalan dan\nPencocokan Nama",{},[]),
  ("P11.3","Pemeriksaan Peran dan\nPenetapan Status",{"D8":("","hasil_pemeriksaan_bukti")},[]),
  ("P11.4","Penandaan Temuan pada\nHalaman Penilaian",{"D7":("data_kegiatan",""),"D8":("hasil_pemeriksaan_bukti","")},[("E2","","penanda_temuan")]),
  ("P11.5","Peninjauan dan Persetujuan\nManual oleh Asesor",{"D8":("hasil_pemeriksaan_bukti","penanda_persetujuan_manual")},
      [("E2","permintaan_periksa_ulang, persetujuan_manual","hasil_pemeriksaan_bukti")])],
 [("P11.1","P11.2","daftar_nama_dan_peran_terbaca"),("P11.2","P11.3","hasil_pencocokan_nama")],
 "Uraian proses P11 pada Gambar IV.7. Notasi mengikuti Pressman (2001). P11.2 tidak mengakses penyimpanan\n"
 "data sehingga keluarannya diteruskan langsung ke P11.3. Hasil pemeriksaan diperlakukan sebagai temuan yang\n"
 "mengarahkan perhatian asesor, bukan penolakan otomatis. Aliran diagram ini seimbang dengan proses P11\n"
 "pada Gambar IV.7, yaitu membaca D1, D5, D7, dan D8 serta menulis D8.")
