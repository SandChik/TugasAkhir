# -*- coding: utf-8 -*-
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dg import Dia
from dfd2 import cluster, bingkai
KIRI = [("Dosen","kredensial, data_kegiatan,\nparameter_kegiatan, berkas_bukti,\npermintaan_klaim, status_capaian,\npermintaan_simpan_permanen",
                 "daftar_kegiatan, nilai_kredit,\nstatus_penilaian, catatan_asesor,\nsimpulan_bkd, rekapitulasi_bkd,\npesan_hasil_aksi"),
        ("Asesor","kredensial, nilai_disetujui,\ncatatan_penilaian, status_penilaian,\npermintaan_periksa_ulang,\npersetujuan_manual, permintaan_pengesahan",
                  "daftar_dokumen_bkd, rincian_kegiatan,\ndokumen_bukti, hasil_pemeriksaan_bukti,\nnilai_kredit, penanda_temuan"),
        ("Administrator","kredensial, data_pengguna,\npermintaan_wallet, data_periode,\npenugasan_asesor, berkas_sk_st,\nkoreksi_baris, permintaan_penerapan,\ninstruksi_koreksi_token",
                  "daftar_pengguna, pratinjau_pemetaan,\ntemuan_validasi, status_penerapan,\nriwayat_transaksi, log_blockchain,\nregistri_dokumen, rekapitulasi_bkd")]
KANAN = [("Smart Contract\nKalkulator BKD Pendidikan","nilai_kredit_x100,\ngalat_input_tidak_valid","nama_fungsi,\nargumen_perhitungan"),
         ("Smart Contract\nToken SKS","transaction_hash, saldo_token,\nevent_token","alamat_wallet, jumlah_token,\nreferensi_hash_simpulan,\nalasan_koreksi"),
         ("Smart Contract\nRegistri Dokumen","transaction_hash,\nevent_pencatatan","hash_dokumen, jenis_aksi,\nreferensi_baris"),
         ("Layanan Model\nBahasa Visual","hasil_penafsiran_json","citra_halaman,\ninstruksi_skema_keluaran")]
d = Dia("Gambar IV.6 Diagram Konteks Sistem LedgerDik", 10, 10)
(x0,y0,x1,y1), hub = cluster(d, "0\nSistem Penilaian BKD\n(LedgerDik)", 0, 0, KIRI, KANAN, [],
                             hub_w=300, hub_h=170, ent_w=190, ent_h=70, ent_gap=380, band=230, fs_hub=12)
d.box(x0, y1+60, 760, 124,
      "Notasi mengikuti Pressman (2001): persegi panjang menyatakan entitas eksternal, lingkaran\n"
      "menyatakan proses, dan setiap panah diberi nama sesuai data yang mengalir. Diagram konteks\n"
      "merupakan tingkat tertinggi DFD yang merepresentasikan keseluruhan sistem sebagai satu proses\n"
      "tunggal, sehingga penyimpanan data tidak muncul pada tingkat ini. Rincian aliran disajikan pada\n"
      "Tabel IV.15. Aliran menuju kontrak kalkulator tidak menghasilkan transaksi karena seluruh\n"
      "fungsinya murni; aliran menuju kontrak token dan kontrak registri merupakan transaksi on-chain.",
      "note", "catatan", 9)
bingkai(d)
d.save_drawio("IV-06-diagram-konteks.drawio"); d.check(); d.render("iv6.png")
