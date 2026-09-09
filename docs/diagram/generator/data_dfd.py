PROSES = {
 "P1":"P1\nAutentikasi dan\nOtorisasi","P2":"P2\nPengelolaan Pengguna\ndan Wallet",
 "P3":"P3\nPengelolaan Periode\ndan Fase","P4":"P4\nPenugasan Asesor",
 "P5":"P5\nPengelolaan Referensi\nKegiatan","P6":"P6\nEkstraksi dan\nPenerapan Dokumen",
 "P7":"P7\nPengelolaan Kegiatan\ndan Dokumen BKD","P8":"P8\nPerhitungan Kredit\nKegiatan",
 "P9":"P9\nPenilaian, Simpulan,\ndan Penerbitan Token","P10":"P10\nKoreksi Token\ndan Pelaporan",
 "P11":"P11\nVerifikasi Keaslian\nDokumen Bukti","P12":"P12\nPencatatan Jejak\nDokumen"}
STORE = {"D1":"D1  pengguna","D2":"D2  periode_bkd","D3":"D3  lkd","D4":"D4  penugasan_asesor",
 "D5":"D5  referensi_kegiatan","D6":"D6  unggahan_dokumen","D7":"D7  kegiatan",
 "D8":"D8  dokumen_kegiatan","D9":"D9  hasil_penilaian","D10":"D10  simpulan_bkd",
 "D11":"D11  riwayat_transaksi"}
LBL = {"D1":("data_akun","data_pengguna"),"D2":("periode_dan_fase","data_periode"),
 "D3":("dokumen_bkd","status_dokumen_bkd"),"D4":("penugasan_asesor","penugasan_dan_pengesahan"),
 "D5":("referensi_kegiatan","referensi_kegiatan"),"D6":("hasil_ekstraksi","unggahan_dan_koreksi"),
 "D7":("data_kegiatan","kegiatan_dan_nilai_kredit"),"D8":("metadata_bukti","metadata_dan_hasil_pemeriksaan"),
 "D9":("hasil_penilaian","hasil_penilaian"),"D10":("simpulan_bkd","simpulan_dan_hash"),
 "D11":("riwayat_transaksi","catatan_transaksi")}
AKSES = {"P1":{"D1":"r"},"P2":{"D1":"rw"},"P3":{"D2":"rw"},"P4":{"D1":"r","D3":"r","D4":"rw"},
 "P5":{"D5":"r"},"P6":{"D1":"r","D2":"r","D3":"rw","D5":"r","D6":"rw","D7":"rw"},
 "P7":{"D2":"r","D3":"rw","D5":"r","D7":"rw","D8":"rw"},"P8":{"D5":"r","D7":"rw"},
 "P9":{"D1":"r","D2":"r","D3":"rw","D4":"rw","D7":"r","D9":"rw","D10":"w","D11":"w"},
 "P10":{"D1":"r","D2":"r","D3":"r","D9":"r","D10":"r","D11":"r"},
 "P11":{"D1":"r","D5":"r","D7":"r","D8":"rw"},"P12":{"D6":"r","D8":"r","D11":"w"}}
ENT = {"E1":"Dosen","E2":"Asesor","E3":"Administrator","E4":"Smart Contract\nKalkulator BKD",
 "E5":"Smart Contract\nToken SKS","E6":"Smart Contract\nRegistri Dokumen","E7":"Layanan Model\nBahasa Visual"}
KIRI_ENT = {"E1","E2","E3"}
ALIRAN = [("E1","P1","kredensial","sesi_dan_peran"),("E2","P1","kredensial","sesi_dan_peran"),
 ("E3","P1","kredensial","sesi_dan_peran"),("E3","P2","data_pengguna, permintaan_wallet","daftar_pengguna"),
 ("E3","P3","data_periode","status_periode_dan_fase"),("E3","P4","penugasan_asesor","daftar_penugasan"),
 ("E3","P5","permintaan_referensi","daftar_referensi_kegiatan"),
 ("E3","P6","berkas_sk_st, koreksi_baris,\npermintaan_penerapan","pratinjau_pemetaan, temuan_validasi,\nstatus_penerapan"),
 ("E7","P6","hasil_penafsiran_json","citra_halaman,\ninstruksi_skema_keluaran"),
 ("E1","P7","data_kegiatan, parameter_kegiatan,\nberkas_bukti, permintaan_klaim,\nstatus_capaian","daftar_kegiatan,\npesan_hasil_aksi"),
 ("E4","P8","nilai_kredit_x100,\ngalat_input_tidak_valid","nama_fungsi,\nargumen_perhitungan"),
 ("E2","P9","nilai_disetujui, catatan_penilaian,\npermintaan_pengesahan","rincian_kegiatan, nilai_kredit"),
 ("E5","P9","transaction_hash, event_token","alamat_wallet, jumlah_token,\nreferensi_hash_simpulan"),
 ("E3","P10","instruksi_koreksi_token","riwayat_transaksi, log_blockchain,\nrekapitulasi_bkd"),
 ("E1","P10","permintaan_rekapitulasi","simpulan_bkd, rekapitulasi_bkd"),
 ("E5","P10","transaction_hash, saldo_token","alamat_wallet, jumlah_token,\nalasan_koreksi"),
 ("E2","P11","permintaan_periksa_ulang,\npersetujuan_manual","hasil_pemeriksaan_bukti,\npenanda_temuan"),
 ("E7","P11","hasil_penafsiran_json","citra_halaman,\ninstruksi_skema_keluaran"),
 ("E3","P12","permintaan_registri","registri_dokumen"),
 ("E6","P12","transaction_hash,\nevent_pencatatan","hash_dokumen, jenis_aksi,\nreferensi_baris")]
