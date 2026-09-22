# Daftar Perubahan Bab III untuk Diterapkan ke Docx

Pembanding: `Bab 3.md` (lama) dengan `Bab 3_revisi.md` (baru). Penomoran judul dan huruf miring tidak dicantumkan karena dikerjakan manual. Teks pengganti ditulis polos tanpa format supaya aman ditempel ke Word, jadi istilah asing (smart contract, on-chain, black box, waterfall, dan sejenisnya) perlu dimiringkan lagi setelah ditempel.

Jenis perubahan:

- **GANTI**: ganti satu paragraf utuh (dipakai bila perubahan dalam paragraf lebih dari dua titik).
- **SUNTING**: cari potongan kalimat lalu ganti. Setiap potongan "Cari" sudah diperiksa muncul tepat satu kali di naskah lama dan panjangnya di bawah batas 255 karakter kotak Find di Word.
- **BARU**: paragraf, judul, tabel, atau sub-subbab yang belum ada di naskah lama.
- **HAPUS**: paragraf yang dibuang dari posisinya.
- **GAMBAR**: gambar yang perlu dirender ulang.

Ringkasan: 66 butir, terdiri atas 33 GANTI, 26 SUNTING, 5 BARU, 1 HAPUS, dan 1 GAMBAR. Perubahan terbesar ada di III.3 (sub-subbab variabel baru dengan dua tabel), Tabel III.4 (isi referensi kegiatan disesuaikan dengan kode), dan tabel tahapan (kolom indikator capaian). Subbab III.1.2 dan perangkat pendukung III.4.5, III.4.7 sampai III.4.10, III.4.14, III.4.17, III.4.19, III.4.21, serta III.4.23 tidak berubah sama sekali.

Urutan kerja yang disarankan:

1. Ubah dulu nomor tabel tahapan dari Tabel III.6 menjadi Tabel III.8 (lihat catatan penomoran di bagian akhir), supaya tidak bentrok dengan Tabel III.6 yang baru.
2. Kerjakan butir dari atas ke bawah.
3. Terakhir, isi penanda [LENGKAPI] di Tabel III.2 dan render ulang Gambar III.1.

---

## Pengantar Bab III

**1. [GANTI] Paragraf pengantar bab (sebelum III.1)**

Rujukan "subbab I.3.1" diganti "subbab I.3" karena Bab I revisi tidak lagi memecah I.3. Ditambah variabel dan indikator capaian.

Cari paragraf yang diawali:

> Pada bab ini dijelaskan metodologi pengembangan sistem LedgerDik sebagai landasan ...

Ganti seluruh paragraf dengan:

Pada bab ini dijelaskan metodologi pengembangan sistem LedgerDik sebagai landasan pelaksanaan proses pengembangan. Uraian dalam bab ini meliputi waktu dan tempat pelaksanaan, jenis pengembangan, data pengembangan, objek pengembangan beserta variabel yang diamati, perangkat pendukung, serta prosedur pengembangan yang digunakan. Pembahasan juga mencakup tahapan pengembangan secara berurutan, mulai dari analisis dan penetapan spesifikasi persyaratan perangkat lunak, perancangan, implementasi, pengujian, hingga operation dan maintenance, disertai tujuan, kegiatan, luaran, dan indikator capaian tiap tahap. Dengan demikian, bab ini menjadi rencana kerja yang memastikan pengembangan sistem LedgerDik dilaksanakan secara sistematis dan terukur, serta dapat ditelusuri kembali terhadap rumusan masalah pada subbab I.2 dan tujuan pengembangan pada subbab I.3.

---

## III.1 Penjelasan Pengembangan Sistem

**2. [GANTI] Paragraf pembuka III.1**

Kalimat ketiga ditautkan ke dua rumusan masalah Bab I revisi dan tiga peran kebaruan di II.2.

Cari paragraf yang diawali:

> Pengembangan sistem LedgerDik merupakan kegiatan pengembangan produk inovatif berupa ...

Ganti seluruh paragraf dengan:

Pengembangan sistem LedgerDik merupakan kegiatan pengembangan produk inovatif berupa sistem berbasis web yang terintegrasi dengan smart contract pada jaringan blockchain berbasis Ethereum Virtual Machine (EVM). Dalam dokumen Tugas Akhir, jenis Tugas Akhir ini dinyatakan sebagai Pengembangan Produk Inovatif, dengan judul "Pengembangan Sistem Penilaian Beban Kerja Dosen Bidang Pendidikan Berbasis Smart Contract untuk Otomatisasi Perhitungan Kredit Kegiatan". Sistem ini tidak dikembangkan semata sebagai media pemasukan dan penyimpanan data kegiatan, melainkan untuk menjawab dua persoalan yang dirumuskan pada subbab I.2, yaitu angka kredit yang tidak mengikuti porsi pengampuan riil dosen sehingga dihitung ulang dan dikompromikan asesor, serta rekam hasil penilaian yang hanya dapat ditelusuri melalui administrator basis data. Untuk itu, sistem memadukan tiga peran yang dirumuskan sebagai posisi kebaruan pada subbab II.2, yaitu mesin aturan yang mengeksekusi Rubrik BKD unsur pendidikan secara deterministik, penerbit token kredit bersifat non-transferable yang dapat ditelusuri, serta lapisan ekstraksi dan pemeriksaan dokumen yang menarik parameter kegiatan langsung dari dokumen penugasan dan memeriksa kesesuaian dokumen bukti terhadap klaim dosen.

---

## III.1.1 Waktu Pengembangan

**3. [GANTI] Kalimat pengantar sebelum daftar bulan**

Cari paragraf yang diawali:

> Waktu pengembangan sistem LedgerDik dilaksanakan selama empat bulan, dengan tahapan ...

Ganti seluruh paragraf dengan:

Waktu pengembangan sistem LedgerDik dilaksanakan selama empat bulan, dengan tahapan pengerjaan yang disusun berurutan mengikuti tahap pra-pengembangan dan kelima tahap model waterfall yang diuraikan pada subbab III.5.

**4. [GANTI] Daftar bernomor bulan (3 butir lama menjadi 4 butir)**

Implementasi dipisah menjadi butir sendiri supaya tidak tercampur di butir bulan kedua. Hapus ketiga butir lama yang diawali:

> Pada bulan pertama, kegiatan difokuskan pada identifikasi ...
> Pada bulan kedua, kegiatan berlanjut pada studi pustaka, ...
> Pada bulan ketiga hingga keempat, kegiatan dilanjutkan ...

Ganti dengan empat butir bernomor berikut:

1. Pada bulan pertama, kegiatan difokuskan pada identifikasi masalah dan analisis domain masalah, yaitu penelusuran praktik penilaian BKD yang berjalan melalui SISTER dengan mewawancarai asesor BKD, pembacaan Rubrik BKD unsur pendidikan pada PO BKD 2021, serta penghimpunan dokumen Surat Keputusan dan Surat Tugas sebagai sumber parameter kegiatan.
2. Pada bulan kedua, kegiatan berlanjut pada studi pustaka, analisis dan penetapan spesifikasi persyaratan perangkat lunak, serta perancangan sistem. Tahap ini menjadi fase penting karena Rubrik BKD dibaca butir per butir untuk ditetapkan variabel perhitungannya dan diterjemahkan menjadi spesifikasi fungsi perhitungan, yang kemudian menjadi dasar penyusunan diagram konteks, Data Flow Diagram berjenjang, kamus data, spesifikasi proses, structure chart, rancangan basis data, dan rancangan antarmuka.
3. Pada bulan kedua hingga ketiga, dilakukan implementasi, yaitu penerjemahan hasil rancangan ke dalam kode ketiga smart contract, basis data, aplikasi web, dan layanan ekstraksi dokumen.
4. Pada bulan ketiga hingga keempat, kegiatan dilanjutkan dengan pengujian bertingkat, penempatan ketiga kontrak ke jaringan uji Base Sepolia beserta verifikasi kode sumbernya, pengoperasian sistem pada lingkungan peladen, uji adopsi kepada calon pengguna, pemeliharaan, serta penyusunan laporan.

**5. [GANTI] Paragraf penutup setelah daftar bulan**

Cari paragraf yang diawali:

> Dengan pembagian waktu tersebut, proses pengembangan berjalan dari tahap konseptual ...

Ganti seluruh paragraf dengan:

Rentang bulan pada butir ketiga dan keempat saling bersinggungan karena batas antartahap tidak selalu jatuh tepat pada pergantian bulan. Meskipun demikian, urutan tahapnya tetap dipertahankan, yaitu setiap tahap dikerjakan berdasarkan luaran tahap sebelumnya sesuai sifat model waterfall yang diuraikan pada subbab II.1.14. Dengan pembagian waktu tersebut, proses pengembangan berjalan dari tahap konseptual hingga validasi produk secara berurutan dan terukur.

---

## III.1.3 Jenis Pengembangan

III.1.2 Tempat Pelaksanaan tidak berubah.

**6. [GANTI] P1**

Cari paragraf yang diawali:

> LedgerDik merupakan sistem penilaian BKD bidang pendidikan berbasis smart contract yang ...

Ganti seluruh paragraf dengan:

LedgerDik merupakan sistem penilaian BKD bidang pendidikan berbasis smart contract yang dikembangkan menggunakan model proses waterfall sebagaimana dirumuskan Sommerville (2016) dan telah diuraikan landasannya pada subbab II.1.14. Pengembangan dimulai dari identifikasi permasalahan nyata pada proses penilaian BKD, analisis kebutuhan pengguna, perancangan solusi memakai pendekatan analisis dan perancangan terstruktur sebagaimana diuraikan pada subbab II.1.15, implementasi seluruh lapisan sistem, pengujian bertingkat, hingga penempatan dan pemeliharaan pada tahap operation dan maintenance.

**7. [GANTI] P2 (tiga lapisan menjadi empat lapisan, dua kontrak menjadi tiga kontrak)**

Kode sekarang punya tiga kontrak: KalkulatorBKDPendidikan, BKDSKSToken, dan BKDDokumenRegistri (contracts/registri.sol). Bab 4 juga sudah memakai tiga kontrak.

Cari paragraf yang diawali:

> Secara teknis, sistem dibangun di atas tiga lapisan yang terpisah namun terintegrasi. ...

Ganti seluruh paragraf dengan:

Secara teknis, sistem dibangun di atas empat lapisan yang terpisah namun terintegrasi. Lapisan on-chain memuat tiga smart contract berbahasa Solidity, yaitu kontrak KalkulatorBKDPendidikan sebagai mesin aturan perhitungan kredit, kontrak BKDSKSToken sebagai representasi kredit SKS dalam bentuk token ERC-20 bersifat non-transferable, dan kontrak BKDDokumenRegistri sebagai pencatat sidik digital berkas penugasan dan dokumen bukti. Lapisan aplikasi web dibangun memakai framework Next.js yang sekaligus menyediakan antarmuka pengguna dan lapisan orkestrasi di sisi peladen. Lapisan penyimpanan operasional memakai basis data PostgreSQL yang diakses melalui Prisma ORM. Lapisan ekstraksi dokumen dibangun sebagai layanan mandiri berbasis Python dan FastAPI dengan dua tanggung jawab, yaitu mengubah Surat Keputusan dan Surat Tugas menjadi parameter kegiatan terstruktur, serta membaca dokumen bukti unggahan dosen menjadi daftar nama beserta perannya. Komunikasi antara lapisan aplikasi web dan lapisan on-chain dijembatani pustaka Ethers.js melalui titik akhir Remote Procedure Call (RPC), sedangkan komunikasi antara lapisan aplikasi web dan lapisan ekstraksi dokumen dilaksanakan melalui HTTP dengan autentikasi kunci API yang hanya dikenal sisi peladen. Keterkaitan keempat lapisan tersebut digambarkan pada Gambar III.1.

**8. [GAMBAR] Gambar III.1 Arsitektur Lapisan Sistem LedgerDik**

Render ulang dari `docs/gambar/Gambar-III-1-Arsitektur-Sistem-LedgerDik.mermaid` yang sudah diperbarui: ditambah kontrak BKDDokumenRegistri beserta alirannya, modul registriDokumen, serta entitas penugasan_asesor dan dokumen_kegiatan. Gambar yang sama dipakai Gambar IV.5 di Bab 4, jadi ganti juga di sana.

**9. [GANTI] P3 (pembahasan Gambar III.1)**

Ditambah pencatatan sidik digital pada kontrak registri dan skala nilai kali seratus.

Cari paragraf yang diawali:

> Sebagaimana terlihat pada Gambar III.1, dokumen Surat Keputusan dan Surat Tugas yang ...

Ganti seluruh paragraf dengan:

Sebagaimana terlihat pada Gambar III.1, dokumen Surat Keputusan dan Surat Tugas yang diunggah administrator diteruskan ke lapisan ekstraksi untuk menghasilkan parameter kegiatan terstruktur. Parameter tersebut dikoreksi dan diterapkan administrator menjadi kegiatan dosen, kemudian dikirimkan ke kontrak KalkulatorBKDPendidikan untuk dihitung nilai kreditnya dalam bentuk bilangan bulat berskala kali seratus sebagaimana ditetapkan pada subbab II.1.4. Pada rumpun kegiatan pembimbingan, setiap dokumen bukti berformat PDF yang diunggah dosen diteruskan kembali ke lapisan ekstraksi untuk dibaca nama dan peran orang di dalamnya, lalu dicocokkan terhadap identitas pemilik akun dan peran yang diklaim. Hasil pencocokan tersebut disimpan menyertai dokumen dan disajikan kepada asesor sebagai temuan. Setiap kali berkas penugasan diunggah, diterapkan, atau dihapus, serta setiap kali dokumen bukti diunggah atau dihapus, sidik digital berkas tersebut dicatat pada kontrak BKDDokumenRegistri, yaitu hash SHA-256 atas isi berkas atau hash Keccak-256 atas alamat tautan bagi bukti berupa pranala. Seluruh data operasional disimpan pada PostgreSQL dan ditinjau dua asesor. Setelah kedua asesor mengesahkan penilaian, sistem membentuk simpulan BKD, menghitung hash Keccak-256 atas simpulan tersebut sebagaimana konsep yang diuraikan pada subbab II.1.6, kemudian menerbitkan token SKS ke alamat wallet kustodian dosen melalui kontrak BKDSKSToken dengan hash tersebut sebagai pengenal rujukan. Dengan pola tersebut, isi penilaian tetap tersimpan di luar rantai pada basis data institusi, sementara bukti keasliannya tercatat permanen pada blockchain dan dapat ditelusuri melalui penjelajah blok publik tanpa akses ke basis data institusi.

---

## III.2 Data Pengembangan Sistem

**10. [GANTI] P1**

Bab I revisi subbab I.5 hanya memuat Rubrik BKD dan dokumen penugasan, jadi kalimat "Berdasarkan subbab I.5 ... empat kelompok" tidak cocok lagi. "Pemeriksaan keaslian bukti" diganti "pemeriksaan kesesuaian isi dokumen bukti" mengikuti istilah II.1.13.

Cari paragraf yang diawali:

> Berdasarkan subbab I.5, data yang digunakan dalam pengembangan sistem LedgerDik terdiri ...

Ganti seluruh paragraf dengan:

Data pengembangan sistem LedgerDik dihimpun dari sumber yang ditetapkan pada dukungan data di subbab I.5, yaitu Rubrik BKD pada PO BKD 2021 dan dokumen penugasan dosen, kemudian dilengkapi dokumen bukti kegiatan yang diunggah dosen. Dari sumber tersebut, data dikelompokkan menjadi empat kelompok yang saling melengkapi. Kelompok pertama adalah dokumen penugasan resmi berupa Surat Tugas (ST) dan Surat Keputusan (SK) yang menjadi sumber variabel perhitungan. Kelompok kedua adalah Rubrik BKD unsur pendidikan yang menjadi dasar logika perhitungan. Kelompok ketiga adalah data induk dosen yang diturunkan dari dokumen penugasan dan menjadi sasaran pencocokan hasil ekstraksi sekaligus penerima kredit. Kelompok keempat adalah dokumen bukti kegiatan pembimbingan yang menjadi bahan uji mekanisme pemeriksaan kesesuaian isi dokumen bukti. Selain keempat kelompok tersebut, hasil wawancara dengan asesor BKD (Nurjannah, 2026) dipakai sebagai data kualitatif pada analisis sistem berjalan, bukan sebagai masukan sistem. Seluruh data operasional dikelola dalam basis data PostgreSQL melalui Prisma ORM dan diakses oleh lapisan aplikasi web berbasis Next.js.

**11. [GANTI] P2 kelayakan data**

Rentang waktu "Juni 2025 hingga Januari 2026" salah. Dua SK Pembimbing TA bernomor tahun 2024, dan Bab I revisi menulis 1 Maret 2024 sampai 19 Januari 2026.

Cari paragraf yang diawali:

> Kelayakan data dinilai memakai lima kriteria, yaitu relevansi, kesesuaian waktu (time ...

Ganti seluruh paragraf dengan:

Kelayakan data dinilai memakai lima kriteria, yaitu relevansi, kesesuaian waktu (time suitability), validitas, kecukupan, dan akurasi. Kriteria relevansi terpenuhi karena seluruh dokumen yang dihimpun memuat penugasan pada kategori kegiatan yang menjadi fokus implementasi, yaitu pengajaran, pembimbingan, pengujian, dan pembinaan kegiatan mahasiswa, sekaligus memuat variabel perhitungan pada Tabel II.1 secara tertulis. Kriteria kesesuaian waktu terpenuhi karena dokumen diterbitkan pada rentang 1 Maret 2024 hingga 19 Januari 2026, sehingga format lampirannya mencerminkan format yang berlaku pada saat pengembangan. Kriteria validitas terpenuhi karena seluruh dokumen merupakan terbitan resmi institusi yang memuat nomor surat, dan nilai hash SHA-256 setiap berkas dicatat sebagai penanda keutuhan sehingga dokumen yang dipakai pada pengembangan dapat dibuktikan identik dengan dokumen yang dihimpun. Kriteria kecukupan terpenuhi karena keenam dokumen mencakup empat kategori kegiatan berbeda, mewakili dua bentuk berkas yang menuntut jalur ekstraksi berbeda, dan menghasilkan 38 akun dosen unik sebagai data induk. Kriteria akurasi dijaga melalui verifikasi hasil ekstraksi terhadap dokumen sumber, dengan mekanisme koreksi manual oleh administrator sebelum hasil ekstraksi diterapkan menjadi kegiatan dosen. Rincian dokumen penugasan yang dihimpun disajikan pada Tabel III.1.

**12. [SUNTING] Paragraf setelah Tabel III.1 (titik koma)**

Cari (Ctrl+F):

> yang namanya terbaca pada tiap dokumen; gabungan keenamnya

Ganti dengan:

> yang namanya terbaca pada tiap dokumen, dan gabungan keenamnya

**13. [SUNTING] Tabel III.2, kolom Contoh Data baris kode_mk**

Parser (backend-extract/parse_st_pengajaran.py) hanya menerima kode mata kuliah berformat dua angka, dua huruf, empat angka, jadi KO1234 tidak mungkin muncul. Isi dengan kode asli dari lampiran, dan pastikan nama_mk, kelas, beban_te, beban_pr pada baris itu berasal dari baris lampiran yang sama.

Cari (Ctrl+F):

> KO1234

Ganti dengan:

> [LENGKAPI: kode mata kuliah asli dari lampiran ST 408/KO/AK.04.01/2025]

**14. [GANTI] Paragraf setelah Tabel III.2**

Sekarang menautkan kolom lampiran ke variabel porsi pengampuan (Tabel II.1) dan ilustrasi 6 SKS di I.1.

Cari paragraf yang diawali:

> Berdasarkan Tabel III.2, kolom sks_slot perlu dibedakan dari bobot kurikulum mata kuliah. ...

Ganti seluruh paragraf dengan:

Berdasarkan Tabel III.2, kolom beban_te dan beban_pr merupakan wujud tertulis variabel porsi pengampuan pada kelompok keempat Tabel II.1, karena keduanya memuat bobot komponen teori dan praktik yang benar-benar dipegang satu dosen pada satu kelas. Kolom tersebut perlu dibedakan dari bobot kurikulum mata kuliah secara keseluruhan. Apabila ilustrasi pada subbab I.1 dituangkan ke dalam struktur tersebut, dosen yang hanya mengampu komponen praktik pada mata kuliah berbobot 6 SKS tercatat dengan beban_te bernilai 0 dan beban_pr bernilai 4, sehingga bobot yang menjadi masukan perhitungan adalah 4 SKS, bukan 6 SKS. Struktur tersebut juga memperlihatkan pengampuan bersama, karena satu komponen yang dipegang lebih dari satu dosen tercetak dengan bobot penuh pada baris masing-masing dosen, sehingga penjumlahan mentah seluruh baris milik seorang dosen akan melebihi beban yang sebenarnya diampu. Penurunan kolom tersebut menjadi parameter perhitungan diuraikan pada subbab III.3.2, sedangkan penerapannya pada butir aturan pengajaran diuraikan pada subbab IV.1.4.

**15. [GANTI] Paragraf kelompok data kedua**

"enam belas butir" salah. Seed sekarang memuat sebelas butir (prisma/seed.mjs).

Cari paragraf yang diawali:

> Kelompok data kedua berupa Rubrik BKD unsur pendidikan pada PO BKD 2021, yang ...

Ganti seluruh paragraf dengan:

Kelompok data kedua berupa Rubrik BKD unsur pendidikan pada PO BKD 2021, yang diterjemahkan menjadi referensi kegiatan dan dimuat ke basis data melalui berkas seed sebagai data acuan sistem. Setiap butir referensi menyimpan daftar variabel masukannya sebagai skema parameter, sehingga variabel pada Tabel II.1 tidak berhenti sebagai uraian konseptual, melainkan tersimpan sebagai data yang menentukan isian dan urutan argumen fungsi kontrak. Struktur data referensi kegiatan tersebut disajikan pada Tabel III.3.

**16. [GANTI] Paragraf setelah Tabel III.3**

Cari paragraf yang diawali:

> Berdasarkan Tabel III.3, kolom fungsi_contract menjadi penghubung antara ketentuan ...

Ganti seluruh paragraf dengan:

Berdasarkan Tabel III.3, kolom fungsi_contract menjadi penghubung antara ketentuan normatif pada Rubrik BKD dan implementasi teknisnya pada lapisan on-chain. Referensi kegiatan yang dimuat ke sistem disaring menurut ketersediaan data penugasan yang nyata di Jurusan Teknik Komputer dan Informatika, sehingga menghasilkan sebelas butir sebagaimana disajikan pada Tabel III.4.

**17. [GANTI] Tabel III.4 (judul dan seluruh isi)**

Isi lama (16 butir, 15 diotomatisasi) tidak sesuai kode. Sekarang 11 butir: 8 dihitung kontrak, 3 ditetapkan asesor (EDU402, EDU501, EDU502). Ada kolom baru Status Perhitungan. Hapus tabel lama, ganti dengan:

Tabel III.4. Referensi Kegiatan BKD Unsur Pendidikan yang Dimuat ke Sistem beserta Fungsi Kontraknya

| No. | Kode Aturan | Nama Kegiatan | Fungsi Smart Contract | Status Perhitungan |
| :---: | :---: | ----- | ----- | ----- |
| 1. | EDU001 | Menempuh pendidikan formal doktor | hitungPendidikanFormalDoktor | Diotomatisasi |
| 2. | EDU101 | Melaksanakan perkuliahan, tutorial, praktikum, studio, atau pembelajaran daring | hitungPengajaran | Diotomatisasi |
| 3. | EDU201 | Membimbing seminar mahasiswa | hitungBimbinganSeminarMahasiswa | Diotomatisasi |
| 4. | EDU202 | Membimbing Kuliah Kerja Nyata, Praktik Kerja Lapangan, atau magang | hitungBimbinganKKNPKLMagang | Diotomatisasi |
| 5. | EDU203 | Membimbing dan ikut membimbing disertasi, tesis, skripsi, dan laporan akhir studi | hitungPembimbinganTugasAkhir | Diotomatisasi |
| 6. | EDU301 | Bertugas sebagai penguji pada ujian akhir atau ujian profesi | hitungPengujiUjianAkhir | Diotomatisasi |
| 7. | EDU401 | Membina kegiatan mahasiswa bidang akademik dan kemahasiswaan | hitungPembinaKegiatanMahasiswa | Diotomatisasi |
| 8. | EDU402 | Membimbing mahasiswa menghasilkan produk saintifik atau mengikuti kompetisi | tidak dipetakan | Ditetapkan asesor |
| 9. | EDU501 | Melakukan kegiatan pengembangan program kuliah tatap muka atau daring | tidak dipetakan | Ditetapkan asesor |
| 10. | EDU502 | Mengembangkan bahan ajar berupa buku ajar, modul, atau bahan ajar lain | tidak dipetakan | Ditetapkan asesor |
| 11. | EDU701 | Menduduki jabatan pimpinan perguruan tinggi | hitungJabatanPimpinanPerguruanTinggi | Diotomatisasi |

**18. [GANTI] Paragraf setelah Tabel III.4**

Cari paragraf yang diawali:

> Berdasarkan Tabel III.4, butir EDU402 merupakan satu-satunya butir yang tidak dipetakan ...

Ganti seluruh paragraf dengan:

Berdasarkan Tabel III.4, delapan butir dieksekusi kontrak dan tiga butir nilainya ditetapkan asesor secara manual. Butir EDU402 tidak dipetakan karena nilai kreditnya pada PO BKD 2021 dinyatakan sebagai batas maksimum yang penetapannya bergantung pada penilaian kualitatif asesor terhadap mutu luaran, sehingga tidak memenuhi syarat ketertutupan yang dituntut eksekusi mesin sebagaimana diuraikan pada subbab II.1.1. Butir EDU501 dan EDU502 sebenarnya telah memiliki fungsi pada kontrak, namun sengaja tidak dipautkan karena kelayakan luaran pengembangan program kuliah dan bahan ajar tetap menuntut pertimbangan asesor atas mutu naskahnya. Ketiga butir tersebut tetap tersedia sebagai kegiatan yang dapat dilaporkan dosen dan ditandai berstatus perhitungan tidak diotomatisasi. Adapun fungsi kontrak yang tidak muncul pada Tabel III.4, yaitu fungsi bagi butir yang tidak memiliki data penugasan di jurusan dan fungsi bagi butir pendidikan profesi dokter, tetap dipertahankan pada kontrak agar penambahan butir referensi di kemudian hari cukup dilakukan pada data acuan tanpa menempatkan ulang kontrak. Rincian seluruh fungsi kontrak beserta formulanya diuraikan pada subbab IV.1.4. Pemisahan eksplisit tersebut menjaga agar klaim otomatisasi pada laporan ini tidak melampaui butir yang benar-benar dieksekusi sistem, sejalan dengan batasan yang ditetapkan pada subbab I.6.2.

**19. [SUNTING] Paragraf kelompok data ketiga**

Cari (Ctrl+F):

> Seluruh akun tersebut diturunkan dari keenam dokumen pada Tabel III.1, bukan data karangan.

Ganti dengan:

> Seluruh akun tersebut diturunkan dari keenam dokumen pada Tabel III.1, bukan data karangan, setelah varian penulisan nama yang merujuk orang yang sama digabungkan melalui normalisasi nama sebagaimana diuraikan pada subbab II.1.12.

**20. [SUNTING] Paragraf kelompok data keempat**

Cari (Ctrl+F):

> data uji yang tepat bagi mekanisme pemeriksaan keaslian bukti

Ganti dengan:

> data uji yang tepat bagi mekanisme pemeriksaan kesesuaian isi dokumen bukti

**21. [SUNTING] Paragraf penutup III.2 (bagian A)**

Cari (Ctrl+F):

> penugasan asesor, hasil penilaian, simpulan BKD

Ganti dengan:

> penugasan asesor, dokumen bukti kegiatan, hasil penilaian, simpulan BKD

**22. [SUNTING] Paragraf penutup III.2 (bagian B)**

Cari (Ctrl+F):

> Objek pengembangan yang memanfaatkan data tersebut diuraikan pada subbab III.3.

Ganti dengan:

> Objek pengembangan yang memanfaatkan data tersebut beserta variabel yang diturunkan darinya diuraikan pada subbab III.3.

---

## III.3 Objek Pengembangan Sistem

Subbab ini paling banyak berubah. Susunan barunya: paragraf pengantar (baru), III.3.1 Objek Pengembangan (judul baru, tiga paragraf lama ditulis ulang), III.3.2 Variabel Pengembangan (seluruhnya baru, berisi dua tabel baru).

**23. [BARU] Paragraf pengantar III.3**

Sisipkan tepat di bawah judul III.3 (panduan melarang judul subbab langsung disusul judul sub-subbab):

Subbab ini menetapkan objek yang dikembangkan beserta variabel yang diamati pada objek tersebut. Objek pengembangan menentukan batas proses yang dimodelkan pada tahap analisis dan perancangan, sedangkan variabel pengembangan menentukan besaran yang diolah sistem sekaligus besaran yang dipakai untuk menilai ketercapaian tujuan pada tahap pengujian.

**24. [BARU] Judul sub-subbab III.3.1 Objek Pengembangan**

Sisipkan setelah paragraf pengantar di atas, sebelum paragraf "Objek pengembangan pada Tugas Akhir ini ...". Gaya judul sama dengan sub-subbab lain (Heading 3).

**25. [GANTI] P1 III.3.1**

Cari paragraf yang diawali:

> Objek pengembangan pada Tugas Akhir ini adalah proses penilaian Beban Kerja Dosen bidang ...

Ganti seluruh paragraf dengan:

Objek pengembangan pada Tugas Akhir ini adalah proses penilaian Beban Kerja Dosen bidang pendidikan di Jurusan Teknik Komputer dan Informatika, khususnya rangkaian pengadaan parameter, perhitungan kredit, dan pencatatan hasil yang selama ini berjalan melalui SISTER dan diselesaikan asesor secara manual. Objek tersebut dipilih bukan sebagai proses pemasukan data semata, melainkan sebagai rangkaian keputusan yang menentukan besaran beban kerja yang diakui bagi seorang dosen pada satu semester, sehingga kekeliruan pada satu tahapnya berdampak langsung pada hasil akhir penilaian.

**26. [GANTI] P2 III.3.1 (dua titik masalah disesuaikan dengan I.2 revisi)**

Versi lama memakai masalah "asesor mempercayai data dosen tanpa cek ke SK", yang sudah tidak ada di Bab I revisi. Sekarang: (1) SKS utuh tanpa porsi, hitung ulang, kompromi rata-rata; (2) rekam hasil hanya lewat admin basis data.

Cari paragraf yang diawali:

> Fokus pengembangan diarahkan pada objek tersebut karena permasalahan utama penilaian BKD ...

Ganti seluruh paragraf dengan:

Fokus pengembangan diarahkan pada objek tersebut karena permasalahan utama penilaian BKD tidak terletak pada ketiadaan sistem pencatatan, melainkan pada dua titik yang dirumuskan pada subbab I.2. Titik pertama adalah perhitungan kredit. Antarmuka penilaian yang berjalan menampilkan bobot SKS mata kuliah secara utuh tanpa memperhitungkan porsi komponen yang benar-benar diampu dosen, sehingga asesor menghitung ulang di luar sistem, hasil hitungan antar-asesor kerap berbeda, dan perbedaan tersebut diselesaikan melalui perata-rataan yang tidak dicek ulang kesesuaiannya dengan Rubrik BKD (Nurjannah, 2026). Sebagaimana disimpulkan pada subbab II.1.1, persoalan tersebut pada dasarnya merupakan persoalan variabel porsi pengampuan yang hilang dari masukan perhitungan. Titik kedua adalah pencatatan hasil. Rekam hasil penilaian hanya dapat ditelusuri melalui administrator basis data institusi, sehingga dosen maupun pihak luar tidak dapat memeriksanya secara mandiri dan angka kompromi dapat berubah tanpa jejak yang dapat diaudit.

**27. [GANTI] P3 III.3.1 (pemetaan proses ke rumusan masalah dan tujuan)**

Cari paragraf yang diawali:

> Berdasarkan kedua titik tersebut, objek pengembangan dirinci menjadi tiga proses ...

Ganti seluruh paragraf dengan:

Berdasarkan kedua titik tersebut, objek pengembangan dirinci menjadi tiga proses berurutan yang menjadi ruang lingkup pemodelan pada tahap analisis dan perancangan. Proses pertama adalah pengadaan parameter kegiatan, yaitu perolehan variabel penugasan langsung dari dokumen SK dan ST beserta pemeriksaan kesesuaian dokumen bukti terhadap identitas dan peran pengunggahnya, sehingga variabel porsi pengampuan tersedia sejak awal dan masukan perhitungan tidak lagi bergantung pada pengetikan ulang. Proses kedua adalah perhitungan kredit, yaitu eksekusi butir aturan Rubrik BKD unsur pendidikan oleh smart contract atas variabel yang telah diverifikasi, sehingga kedua asesor menerima angka dasar yang sama tanpa hitung ulang maupun kompromi. Proses pertama dan kedua bersama-sama menjawab rumusan masalah pertama dan menjadi sasaran tujuan pertama pada subbab I.3. Proses ketiga adalah pencatatan hasil, yaitu penerbitan kredit yang telah disahkan kedua asesor sebagai token yang melekat pada wallet dosen beserta hash simpulan penilaiannya, disertai pencatatan sidik digital dokumen pada kontrak registri. Proses ketiga menjawab rumusan masalah kedua dan menjadi sasaran tujuan kedua pada subbab I.3.

**28. [BARU] Sub-subbab III.3.2 Variabel Pengembangan (judul, lima paragraf, Tabel III.6, Tabel III.7)**

Sisipkan setelah P3 III.3.1, sebelum judul III.4. Ini jawaban atas "variabel penelitian": variabel bebas dan terikat dari Tabel II.1 diturunkan menjadi parameter kontrak (Tabel III.6), lalu indikator ketercapaian tujuan (Tabel III.7). Urutannya persis seperti di bawah:

**Judul: III.3.2 Variabel Pengembangan**

Variabel pengembangan pada Tugas Akhir ini diturunkan dari kerangka variabel perhitungan pada subbab II.1.1. Kelima kelompok parameter penugasan pada Tabel II.1 berkedudukan sebagai variabel bebas, sedangkan nilai kredit SKS berkedudukan sebagai variabel terikat. Pada sistem yang dikembangkan, hubungan fungsional di antara keduanya diwujudkan secara harfiah, yaitu variabel bebas menjadi parameter masukan fungsi pada kontrak KalkulatorBKDPendidikan dan variabel terikat menjadi nilai kembalian fungsi tersebut. Operasionalisasi setiap variabel, yaitu wujud konkretnya pada sistem, tipe dan rentang nilainya, serta sumber nilainya, disajikan pada Tabel III.6.

Tabel III.6. Operasionalisasi Variabel Perhitungan Kredit

| No. | Variabel | Jenis | Wujud pada Sistem | Tipe dan Rentang Nilai | Sumber Nilai |
| :---: | ----- | :---: | ----- | ----- | ----- |
| 1. | Volume kegiatan | Bebas | jumlahMahasiswa, jumlahSemester | Bilangan bulat lebih dari nol | jumlahMahasiswa dihitung dari banyaknya mahasiswa per dosen per peran pada lampiran SK Pembimbing Tugas Akhir dan ST Penguji Tugas Akhir; jumlahSemester ditetapkan bernilai satu karena satu laporan BKD mencakup satu semester |
| 2. | Peran pelaksana | Bebas | peran, peranPenguji | Enumerasi pembimbing utama atau pembimbing pendamping; enumerasi ketua atau anggota penguji | Kolom peran pada lampiran, yaitu Pembimbing I menjadi pembimbing utama dan Pembimbing II menjadi pembimbing pendamping, serta Penguji 1 menjadi ketua dan Penguji 2 menjadi anggota |
| 3. | Jenis atau jenjang objek | Bebas | jenisTugasAkhir, jabatan | Enumerasi empat jenis tugas akhir; enumerasi enam jenjang jabatan pimpinan | Jenis tugas akhir ditetapkan laporan akhir studi bagi SK Pembimbing Tugas Akhir program Diploma 3 dan Sarjana Terapan; jabatan diisi dosen pada formulir kegiatan dan diverifikasi asesor terhadap dokumen bukti |
| 4. | Porsi pengampuan | Bebas | sksMataKuliah, teamTeaching, persenPorsiDosen | Bilangan bulat lebih dari nol; nilai benar atau salah; bilangan bulat 1 sampai 100 | Kolom beban_te dan beban_pr lampiran ST Pengajaran. sksMataKuliah adalah jumlah bobot komponen yang dipegang dosen pada satu kelas, teamTeaching bernilai benar apabila satu komponen dipegang lebih dari satu dosen, dan persenPorsiDosen adalah beban efektif dibagi beban tercatat dikali seratus |
| 5. | Keterlaksanaan | Bebas | jumlahPertemuanRencana, jumlahPertemuanRealisasi, semesterPenuh | Bilangan bulat lebih dari nol dengan realisasi tidak melebihi rencana; nilai benar atau salah | Tidak tercantum pada ST Pengajaran, sehingga pada kegiatan hasil ekstraksi ditetapkan 16 pertemuan terencana dan terlaksana penuh, dan dapat dikoreksi administrator sebelum diterapkan |
| 6. | Nilai kredit kegiatan | Terikat | Nilai kembalian fungsi kontrak, disimpan sebagai sks_dihitung_x100 | Bilangan bulat tak bertanda pada skala kali seratus | Dihitung kontrak KalkulatorBKDPendidikan; kosong pada butir yang tidak diotomatisasi |
| 7. | Nilai kredit disahkan | Terikat | sks_disetujui_x100 dari setiap asesor, kemudian nilai final per kegiatan | Bilangan bulat pada skala kali seratus | Ditetapkan masing-masing asesor; nilai final merupakan pembulatan rata-rata nilai kedua asesor |
| 8. | Total kredit semester | Terikat | total_sks_x100 pada simpulan BKD beserta status memenuhi atau tidak memenuhi | Bilangan bulat pada skala kali seratus | Penjumlahan nilai final seluruh kegiatan, dibandingkan terhadap ambang kewajiban 9 SKS; jumlah token yang diterbitkan setara dengan total tersebut |

Berdasarkan Tabel III.6, variabel porsi pengampuan pada baris keempat merupakan variabel yang tidak terwakili pada antarmuka penilaian yang berjalan, sehingga penurunannya dari lampiran ST Pengajaran menjadi inti kontribusi tujuan pertama. Sebagai ilustrasi, apabila dua dosen sama-sama tercatat memegang komponen praktik berbobot 4 SKS pada kelas yang sama, masing-masing memperoleh sksMataKuliah bernilai 4, teamTeaching bernilai benar, dan persenPorsiDosen bernilai 50, sehingga dengan keterlaksanaan penuh kontrak menghasilkan nilai 200 atau 2,00 SKS bagi setiap dosen, bukan 6 SKS sebagaimana bobot utuh mata kuliahnya.

Baris kelima perlu dinyatakan secara terbuka sebagai keterbatasan. Keterlaksanaan pertemuan tidak terbaca pada dokumen penugasan, sehingga pada kegiatan hasil ekstraksi variabel tersebut ditetapkan pada nilai baku dan hanya berubah apabila dikoreksi administrator. Keterbatasan tersebut menjadi bahan saran pengembangan lanjutan, yaitu penarikan data realisasi pertemuan dari sumber yang mencatatnya. Di luar kedelapan variabel tersebut, bobot baku setiap butir rubrik, misalnya 50 per mahasiswa bagi pembimbing utama tugas akhir, berkedudukan sebagai konstanta yang ditanam pada kode kontrak, bukan sebagai variabel, sehingga tidak dapat diubah melalui antarmuka maupun basis data. Seluruh nilai kredit disimpan dan dipertukarkan sebagai bilangan bulat berskala kali seratus sesuai konvensi pada subbab II.1.4, dan baru dikonversi menjadi bentuk desimal pada saat ditampilkan.

Selain variabel perhitungan, ketercapaian tujuan pengembangan diukur melalui indikator yang ditetapkan sebelum pengujian dijalankan, agar penilaian hasil tidak disesuaikan dengan keluaran yang terjadi. Indikator tersebut diturunkan dari rumusan masalah pada subbab I.2 dan tujuan pada subbab I.3, kemudian dirumuskan sebagai persyaratan nonfungsional yang mengacu pada model kualitas produk ISO/IEC 25010 sebagaimana diuraikan pada subbab II.1.17. Keterkaitan tujuan, indikator, dan tempat pembuktiannya disajikan pada Tabel III.7.

Tabel III.7. Indikator Ketercapaian Tujuan Pengembangan

| No. | Tujuan Pengembangan | Indikator | Kriteria Ketercapaian | Tempat Pembuktian |
| :---: | ----- | ----- | ----- | ----- |
| 1. | Tujuan pertama | Ketersediaan variabel penugasan dari dokumen sumber | Keenam dokumen pada Tabel III.1 menghasilkan baris penugasan terstruktur melalui jalur ekstraksi yang sesuai, dan setiap baris terpetakan ke akun dosen atau dilaporkan ambigu tanpa ditebak | Subbab IV.4.3 dan IV.4.4 |
| 2. | Tujuan pertama | Ketepatan nilai kredit terhadap Rubrik BKD | Seluruh kasus uji akurasi, termasuk kasus pengampuan bersama, menghasilkan nilai kontrak yang identik dengan perhitungan manual menurut rubrik tanpa toleransi selisih | Subbab IV.4.5 |
| 3. | Tujuan pertama | Konsistensi hasil perhitungan | Pemanggilan berulang dengan parameter identik menghasilkan nilai identik | Subbab IV.4.6 |
| 4. | Tujuan kedua | Keterlacakan penerbitan dan koreksi kredit | Setiap penerbitan dan penghapusan token menghasilkan transaction hash yang tercatat pada riwayat transaksi dan dapat ditelusuri pada penjelajah blok | Subbab IV.4.3 dan IV.5.1 |
| 5. | Tujuan kedua | Keaslian simpulan penilaian | Hash simpulan pada kejadian penerbitan token dapat dihitung ulang dari dokumen simpulan | Subbab IV.4.6 |
| 6. | Tujuan kedua | Ketidakdapatan-pindahan kredit | Seluruh upaya pemindahan token antaralamat ditolak kontrak | Subbab IV.4.2 |
| 7. | Tujuan kedua | Keutuhan dokumen penugasan dan bukti | Sidik digital berkas penugasan dan dokumen bukti tercatat pada kontrak registri | Subbab IV.4.2 dan IV.4.3 |
| 8. | Kedua tujuan | Keberterimaan oleh pengguna | Uji adopsi terlaksana pada dosen, asesor, dan administrator | Bab V |

Berdasarkan Tabel III.7, indikator nomor satu sampai tujuh diperiksa melalui skenario pengujian dengan kriteria lulus atau tidak lulus, sedangkan indikator kedelapan bersifat persepsional dan diukur melalui uji adopsi. Pembedaan tersebut sejalan dengan batas klaim pengujian pada subbab II.1.18, yaitu kelulusan skenario membuktikan pemenuhan spesifikasi atas skenario yang diuji, sedangkan keberterimaan pengguna dinilai terpisah pada analisis dampak di Bab V.

---

## III.4 Perangkat Pendukung

**29. [SUNTING] Paragraf pengantar III.4**

Cari (Ctrl+F):

> Perangkat yang digunakan dikelompokkan mengikuti tiga lapisan sistem sebagaimana diuraikan pada subbab III.1.3, yaitu perangkat lapisan on-chain, perangkat lapisan aplikasi web, dan perangkat lapisan ekstraksi dokumen

Ganti dengan:

> Perangkat yang digunakan dikelompokkan mengikuti lapisan sistem sebagaimana diuraikan pada subbab III.1.3, yaitu perangkat lapisan on-chain, perangkat lapisan aplikasi web beserta penyimpanan operasionalnya, dan perangkat lapisan ekstraksi dokumen

**30. [SUNTING] III.4.1 Solidity, paragraf kedua**

Cari (Ctrl+F):

> kontrak KalkulatorBKDPendidikan yang memuat seluruh fungsi perhitungan kredit dan kontrak BKDSKSToken yang mewarisi standar ERC-20.

Ganti dengan:

> kontrak KalkulatorBKDPendidikan yang memuat seluruh fungsi perhitungan kredit, kontrak BKDSKSToken yang mewarisi standar ERC-20, dan kontrak BKDDokumenRegistri yang memancarkan event pencatatan sidik digital dokumen.

**31. [SUNTING] III.4.2 Hardhat, paragraf kedua**

Cari (Ctrl+F):

> pengujian unit terhadap logika perhitungan kredit melalui

Ganti dengan:

> pengujian unit terhadap ketiga kontrak melalui

**32. [SUNTING] III.4.3 OpenZeppelin, paragraf kedua (tambah satu kalimat)**

Cari (Ctrl+F):

> tetap berada pada peran administrator baku. Pemisahan tersebut

Ganti dengan:

> tetap berada pada peran administrator baku. Komponen yang sama dipakai pada kontrak BKDDokumenRegistri untuk membatasi pencatatan sidik digital hanya kepada alamat pemegang peran PENCATAT_ROLE. Pemisahan tersebut

**33. [GANTI] III.4.4 Ethers.js, paragraf kedua**

Konteks pembacaan kini menyebut pemanggilan fungsi kalkulator, konteks penulisan menyebut kontrak registri.

Cari paragraf yang diawali:

> Pada sistem LedgerDik, Ethers.js versi 6.17 berperan sebagai satu-satunya jembatan ...

Ganti seluruh paragraf dengan:

Pada sistem LedgerDik, Ethers.js versi 6.17 berperan sebagai satu-satunya jembatan komunikasi antara lapisan aplikasi web dan kontrak yang telah ditempatkan. Pustaka tersebut dipakai pada tiga konteks. Konteks pertama adalah pembacaan data, yaitu pemanggilan fungsi perhitungan pada kontrak kalkulator yang tidak menghasilkan transaksi, serta pengambilan saldo token dan riwayat kejadian yang ditampilkan pada halaman rekapitulasi dan log blockchain. Konteks kedua adalah penulisan data, yaitu eksekusi transaksi penerbitan dan penghapusan token serta pencatatan sidik digital dokumen pada kontrak registri, yang seluruhnya ditandatangani wallet peladen. Konteks ketiga adalah penurunan alamat wallet dosen dari satu frasa induk melalui utilitas dompet deterministik hierarkis sesuai jalur turunan baku yang diuraikan pada subbab II.1.9, sehingga dosen sebagai pengguna akhir tidak diwajibkan memiliki dompet kripto maupun memahami mekanisme gas.

**34. [GANTI] III.4.6 Basescan, paragraf kedua**

"kedua kontrak" menjadi "ketiga kontrak". Rujukan "tujuan keempat subbab I.3.1" salah karena Bab I revisi hanya punya dua tujuan.

Cari paragraf yang diawali:

> Dalam pengembangan sistem LedgerDik, Basescan dimanfaatkan sebagai instrumen verifikasi ...

Ganti seluruh paragraf dengan:

Dalam pengembangan sistem LedgerDik, Basescan dimanfaatkan sebagai instrumen verifikasi dan audit publik terhadap ketiga kontrak yang telah ditempatkan ke Base Sepolia. Proses verifikasi dijalankan melalui fasilitas verifikasi Hardhat yang mengirimkan kode sumber Solidity beserta argumen konstruktornya ke antarmuka pemrograman Etherscan. Setelah verifikasi berhasil, kode sumber kontrak dapat ditinjau siapa pun tanpa memerlukan akses terhadap repositori pengembang, yang menjadi bentuk pemenuhan jejak penilaian yang dapat diverifikasi secara mandiri sebagaimana dikehendaki tujuan kedua pada subbab I.3. Penjelajah blok tersebut juga dipakai selama pengembangan untuk memeriksa kejadian yang terpancar dari kontrak dan memvalidasi bahwa transaksi penerbitan token maupun pencatatan sidik digital dokumen tercatat dengan parameter yang sesuai.

**35. [SUNTING] III.4.11 NextAuth.js, paragraf kedua**

Batasan tentang single sign-on tidak ada di I.6.2 revisi.

Cari (Ctrl+F):

> sejalan dengan batasan tiadanya integrasi single sign-on institusi pada subbab I.6.2

Ganti dengan:

> sejalan dengan batasan pada subbab I.6.2 bahwa sistem berupa prototipe yang tidak terintegrasi langsung dengan sistem akademik resmi

**36. [SUNTING] III.4.12 Prisma ORM, paragraf kedua**

Skema Prisma punya sebelas model, termasuk dokumen_kegiatan.

Cari (Ctrl+F):

> unggahan dokumen, hasil penilaian, simpulan BKD, dan riwayat transaksi

Ganti dengan:

> unggahan dokumen, dokumen kegiatan, hasil penilaian, simpulan BKD, dan riwayat transaksi

**37. [GANTI] III.4.13 PostgreSQL, paragraf kedua**

Tambah versi 16 (docker-compose.yml) dan sidik digital dokumen sebagai data on-chain.

Cari paragraf yang diawali:

> Pada arsitektur sistem LedgerDik, PostgreSQL dikonfigurasikan sebagai media penyimpanan ...

Ganti seluruh paragraf dengan:

Pada arsitektur sistem LedgerDik, PostgreSQL versi 16 dikonfigurasikan sebagai media penyimpanan persisten bagi seluruh data yang bersifat off-chain. Pemisahan tanggung jawab antara PostgreSQL dan smart contract dilakukan berdasarkan sifat data yang dikelola. PostgreSQL menyimpan data bervolume besar yang tidak menuntut jaminan ketakberubahan, mencakup berkas SK dan ST hasil unggahan, keluaran mentah proses ekstraksi, hasil pemeriksaan dokumen bukti, metadata pengguna beserta hash kata sandinya, dan riwayat aktivitas sistem. Sebaliknya, yang dicatatkan ke lapisan on-chain hanyalah jumlah kredit yang telah disahkan beserta hash simpulan penilaiannya, serta sidik digital berkas dokumen. Pemisahan tersebut menghindarkan sistem dari biaya penyimpanan on-chain yang tidak proporsional, sekaligus menjaga agar data pribadi dosen tidak dipublikasikan pada jaringan publik. Dukungan tipe data semi-terstruktur dimanfaatkan untuk menyimpan skema parameter tiap butir aturan dan keluaran parser yang bentuknya berbeda antar-jenis dokumen.

**38. [SUNTING] III.4.15 FastAPI, paragraf kedua**

Cari (Ctrl+F):

> mengekspos lima titik akhir, yaitu tiga titik akhir bagi jalur ekstraksi deterministik dan dua titik akhir bagi jalur berbasis model bahasa visual.

Ganti dengan:

> mengekspos lima titik akhir pemrosesan, yaitu tiga titik akhir bagi jalur ekstraksi deterministik dan dua titik akhir bagi jalur berbasis model bahasa visual, ditambah satu titik akhir pemeriksaan kesehatan layanan.

**39. [SUNTING] III.4.16 pdfplumber, paragraf pertama (sitasi tiga penulis)**

Disamakan dengan Bab II revisi yang menulis tiga penulis lengkap.

Cari (Ctrl+F):

> Yang dkk. (2024)

Ganti dengan:

> Yang, Cao dan Zhao (2024)

**40. [SUNTING] III.4.18 Layanan Model Bahasa Visual, paragraf kedua**

Cari (Ctrl+F):

> mekanisme pemeriksaan keaslian dokumen bukti

Ganti dengan:

> mekanisme pemeriksaan kesesuaian isi dokumen bukti

**41. [GANTI] III.4.20 Docker, paragraf kedua**

Versi lama bilang hanya layanan ekstraksi yang dikemas. Nyatanya docker-compose.yml menjalankan empat layanan (db, api, migrate, web), sama dengan Tabel IV.90 di Bab 4.

Cari paragraf yang diawali:

> Pada sistem LedgerDik, Docker dipakai untuk mengemas lapisan ekstraksi dokumen. ...

Ganti seluruh paragraf dengan:

Pada sistem LedgerDik, Docker dipakai untuk mengemas seluruh komponen lapisan off-chain agar sistem dapat dipasang pada peladen baku dengan langkah yang sama. Satu berkas komposisi mendefinisikan empat layanan, yaitu basis data PostgreSQL, layanan ekstraksi dokumen, layanan penerapan migrasi basis data, dan aplikasi web Next.js, beserta urutan penyalaannya, sehingga aplikasi web baru dijalankan setelah basis data siap dan migrasi selesai diterapkan. Layanan ekstraksi dokumen tetap dibangun dari definisi image tersendiri karena bergantung pada pustaka Python yang proses pemasangannya berbeda antar-sistem operasi. Setiap definisi image tidak menyertakan dokumen uji maupun berkas konfigurasi rahasia, menjalankan proses sebagai pengguna non-root, dan menerima seluruh konfigurasi termasuk kunci API melalui variabel lingkungan pada saat eksekusi. Dengan demikian, kunci rahasia tidak pernah tertanam di dalam image yang didistribusikan.

**42. [SUNTING] III.4.22 Git dan GitHub, paragraf kedua (bagian A)**

Cari (Ctrl+F):

> selama pengembangan ketiga lapisan berlangsung

Ganti dengan:

> selama pengembangan berlangsung

**43. [SUNTING] III.4.22 Git dan GitHub, paragraf kedua (bagian B, tambah satu kalimat di akhir)**

Cari (Ctrl+F):

> apabila suatu perubahan menimbulkan regresi pada perilaku sistem.

Ganti dengan:

> apabila suatu perubahan menimbulkan regresi pada perilaku sistem. Fasilitas GitHub Actions juga dimanfaatkan sebagai alur integrasi berkelanjutan yang menjalankan penempatan ulang sistem ke peladen setiap kali perubahan masuk ke cabang utama, sehingga setiap kegiatan pemeliharaan pada tahap operation dan maintenance tercatat dan diterapkan melalui jalur yang sama.

---

## III.5 Tahapan Pelaksanaan Pengembangan Sistem

**44. [GANTI] Butir alasan pertama (daftar bernomor alasan waterfall)**

Butir kedua dan ketiga tidak berubah.

Cari paragraf yang diawali:

> Aturan yang menjadi inti sistem, yaitu Rubrik BKD unsur pendidikan pada PO BKD 2021, ...

Ganti seluruh paragraf dengan:

Aturan yang menjadi inti sistem, yaitu Rubrik BKD unsur pendidikan pada PO BKD 2021 beserta variabel perhitungannya pada Tabel II.1, merupakan ketentuan normatif yang telah ditetapkan secara resmi dan tidak berubah selama masa pengembangan. Formula, variabel, dan bobot setiap butir kegiatan dapat dibaca lengkap sejak awal pengembangan, sehingga spesifikasi kebutuhan tidak bergantung pada eksplorasi bertahap maupun umpan balik pengguna yang berulang.

**45. [GANTI] Paragraf rujukan Gambar III.2 (sebelum gambar)**

Isi tentang pra-pengembangan dipindah ke paragraf pembahasan setelah gambar (pola rujukan, gambar, pembahasan).

Cari paragraf yang diawali:

> Metodologi pengembangan sistem LedgerDik secara keseluruhan digambarkan dari tahap awal ...

Ganti seluruh paragraf dengan:

Metodologi pengembangan sistem LedgerDik secara keseluruhan, mulai dari tahap pra-pengembangan hingga penyusunan laporan, digambarkan pada Gambar III.2.

**46. [HAPUS] Paragraf catatan unit testing (sebelum gambar)**

Cari paragraf yang diawali:

> Perlu dicatat bahwa dalam pelaksanaannya, aktivitas unit testing dipisahkan secara ...

Hapus paragraf ini dari posisinya sekarang (di antara rujukan dan gambar). Versi barunya disisipkan setelah gambar pada butir berikutnya.

**47. [BARU] Paragraf pembahasan Gambar III.2**

Sisipkan tepat setelah judul Gambar III.2:

Sebagaimana terlihat pada Gambar III.2, metodologi pengembangan terbagi menjadi tiga bagian. Bagian pertama adalah pra-pengembangan, yang terdiri atas identifikasi masalah dengan luaran latar belakang dan rumusan masalah, analisis domain masalah dengan luaran tujuan, manfaat, ruang lingkup, dan potensi produk, serta studi pustaka dengan luaran dasar teori, tinjauan karya ilmiah sejenis, dan posisi kebaruan produk. Bagian tersebut dilaksanakan melalui wawancara dengan asesor BKD, pembacaan PO BKD 2021, penghimpunan dokumen penugasan, dan penelaahan pustaka, dan hasilnya telah dituangkan pada Bab I dan Bab II. Bagian kedua adalah lima tahapan inti pengembangan perangkat lunak di dalam model waterfall, yang masing-masing menghasilkan luaran berupa dokumen atau artefak yang menjadi masukan tahapan berikutnya. Panah putus-putus dari tahap operation dan maintenance menuju tahapan sebelumnya menunjukkan bahwa temuan pemeliharaan dapat menuntut peninjauan kembali persyaratan, rancangan, kode, maupun pengujian, sesuai sifat umpan balik antarfase pada model waterfall yang digambarkan pada Gambar II.2. Bagian ketiga adalah penyusunan laporan Tugas Akhir yang menghimpun luaran seluruh tahap. Oleh karena itu, subbab ini berfokus pada kelima tahapan inti pada bagian kedua.

**48. [BARU] Paragraf penyesuaian terhadap model waterfall (pengganti paragraf yang dihapus)**

Sisipkan setelah paragraf pembahasan Gambar III.2. Sekarang ada penyesuaian kedua: UAT ditaruh di tahap operation dan maintenance, dan alasannya disebut.

Perlu dicatat dua penyesuaian terhadap susunan fase pada model waterfall yang diuraikan pada subbab II.1.14. Penyesuaian pertama, aktivitas unit testing dipisahkan secara eksplisit dari aktivitas pengodean ke dalam tahapan Pengujian tersendiri, meskipun keduanya secara teoretis tergabung dalam satu fase yang sama, yaitu implementation and unit testing (Sommerville, 2016). Pemisahan tersebut dilakukan untuk kebutuhan pelaporan dan pengelolaan mutu yang lebih terstruktur. Penyesuaian kedua, uji adopsi oleh pengguna dilaksanakan pada tahap operation dan maintenance, bukan pada tahap pengujian, karena uji tersebut menuntut sistem yang telah beroperasi pada lingkungan peladen dan terhubung dengan kontrak yang telah ditempatkan di jaringan uji. Kedua penyesuaian tersebut tidak mengubah esensi maupun urutan model waterfall yang diterapkan.

**49. [SUNTING] Paragraf rujukan tabel tahapan**

Cari (Ctrl+F):

> Rincian kegiatan dan luaran pada setiap tahapan dirangkum pada Tabel III.6

Ganti dengan:

> Rincian kegiatan, luaran, dan indikator capaian pada setiap tahapan dirangkum pada Tabel III.8

**50. [GANTI] Tabel III.6 lama menjadi Tabel III.8 (judul, kolom baru Indikator Capaian, isi)**

Pengantar bab menjanjikan "indikator capaian tiap tahap", tapi tabel lama belum punya kolomnya. Tambahkan kolom kelima. Isi kolom Kegiatan dan Luaran baris 1, 3, 4, 5 juga berubah (tiga kontrak, variabel, IEEE Std 829). Ganti seluruh tabel dengan:

Tabel III.8. Tahapan, Kegiatan, Luaran, dan Indikator Capaian Pengembangan Sistem LedgerDik

| No. | Tahapan | Kegiatan Utama | Luaran | Indikator Capaian |
| :---: | ----- | ----- | ----- | ----- |
| 1. | Analisis dan penetapan spesifikasi persyaratan perangkat lunak | Analisis sistem berjalan, identifikasi kebutuhan melalui kerangka environment, items produced, functions, dan modes of operation, analisis pemilihan metode dan teknologi, penurunan Rubrik BKD menjadi variabel dan spesifikasi fungsi perhitungan, perumusan persyaratan fungsional dan nonfungsional | Dokumen Software Requirements Specification (SRS) beserta daftar persyaratan fungsional, persyaratan nonfungsional, batasan perancangan, dan pemetaan butir rubrik terhadap fungsi kontrak | Setiap persyaratan tertelusur ke rumusan masalah atau tujuan pengembangan, setiap butir referensi kegiatan memiliki status perhitungan yang ditetapkan, dan setiap persyaratan nonfungsional tertaut pada satu karakteristik ISO/IEC 25010 |
| 2. | Perancangan | Perancangan arsitektur sistem, pemodelan proses melalui diagram konteks dan DFD berjenjang, penyusunan kamus data dan spesifikasi proses, perancangan basis data, perancangan modul melalui structure chart, perancangan antarmuka pengguna | Diagram arsitektur, diagram konteks, DFD berjenjang, kamus data, spesifikasi proses, ERD, structure chart, rancangan antarmuka | Setiap persyaratan fungsional terpetakan ke proses pada DFD dan modul pada structure chart, aliran data seimbang antarjenjang DFD, dan setiap penyimpanan data memiliki entitas pada ERD |
| 3. | Implementasi | Penulisan kode ketiga smart contract, basis data, aplikasi web, dan layanan ekstraksi dokumen; kompilasi dan penempatan kontrak ke jaringan simulasi lokal | Kode sumber seluruh lapisan sistem, artefak kompilasi kontrak beserta definisi tipenya, berkas build aplikasi web | Seluruh persyaratan fungsional terealisasi pada matriks implementasi, kontrak berhasil dikompilasi, dan kode aplikasi web lolos pemeriksaan tipe serta proses build |
| 4. | Pengujian | Unit testing, integration testing, system testing, uji akurasi perhitungan kredit, dan pengujian aspek nonfungsional | Dokumentasi hasil pengujian mengikuti IEEE Std 829 beserta rekapitulasi status kelulusan setiap skenario | Seluruh skenario lulus, seluruh kasus uji akurasi menghasilkan nilai identik dengan perhitungan manual, dan persyaratan nonfungsional yang diterapkan terverifikasi |
| 5. | Operation dan maintenance | Penempatan ketiga kontrak ke jaringan uji Base Sepolia beserta verifikasi kode sumbernya, pengoperasian aplikasi web, basis data, dan layanan ekstraksi, uji adopsi pengguna, pemeliharaan korektif, adaptif, dan perfektif | Kontrak yang beroperasi dan terverifikasi di Base Sepolia, sistem yang berjalan pada lingkungan operasional, hasil uji adopsi pengguna, catatan pemeliharaan | Ketiga kontrak terverifikasi kode sumbernya pada penjelajah blok, seluruh layanan off-chain berjalan pada peladen, uji adopsi terlaksana, dan setiap pemeliharaan tercatat pada riwayat repositori |

**51. [GANTI] Paragraf setelah tabel tahapan**

Cari paragraf yang diawali:

> Berdasarkan Tabel III.6, setiap tahapan menghasilkan luaran yang menjadi masukan bagi ...

Ganti seluruh paragraf dengan:

Berdasarkan Tabel III.8, setiap tahapan menghasilkan luaran yang menjadi masukan bagi tahapan berikutnya, sehingga keterlacakan antara kebutuhan, rancangan, kode, dan hasil pengujian dapat dipelihara sepanjang pengembangan. Indikator capaian pada kolom terakhir menjadi syarat untuk menyatakan suatu tahapan selesai sebelum tahapan berikutnya dimulai. Urutan kelima tahapan tersebut dipakai sebagai urutan penyajian hasil pelaksanaannya pada subbab IV.1 sampai dengan subbab IV.5.

---

## III.5.1 Analisis dan Penetapan Spesifikasi Persyaratan Perangkat Lunak

**52. [GANTI] Paragraf kegiatan**

Butir ketiga menambah kontrak registri, butir keempat menambah penurunan variabel (Tabel III.6), butir kelima menautkan ke Tabel III.7.

Cari paragraf yang diawali:

> Kegiatan pada tahap ini meliputi lima hal. Pertama, analisis sistem berjalan berupa ...

Ganti seluruh paragraf dengan:

Kegiatan pada tahap ini meliputi lima hal. Pertama, analisis sistem berjalan berupa penelusuran proses pengajuan kegiatan oleh dosen, proses penilaian oleh asesor, dan proses perhitungan kredit yang berlaku saat ini, yang dilaksanakan melalui wawancara dengan asesor BKD dan pembacaan dokumen pedoman. Kedua, identifikasi kebutuhan sistem yang akan dikembangkan memakai kerangka environment, items produced, functions, dan modes of operation, yang menghasilkan daftar entitas eksternal, klasifikasi data masukan dan keluaran, daftar proses utama, serta mode operasi tiap peran pengguna. Ketiga, analisis pemilihan metode dan teknologi beserta justifikasinya, khususnya pada komponen yang menjadi pembeda inti sistem, yaitu penempatan aturan perhitungan pada smart contract, pemilihan jaringan Layer-2, mekanisme wallet kustodian, strategi ekstraksi dokumen dua jalur, dan pencatatan jejak dokumen pada kontrak registri. Keempat, penurunan Rubrik BKD unsur pendidikan menjadi variabel perhitungan dan spesifikasi fungsi perhitungan butir per butir, yang menghasilkan operasionalisasi variabel pada Tabel III.6 serta pemetaan pada Tabel III.4 beserta penetapan butir yang tidak diotomatisasi. Kelima, penetapan persyaratan fungsional dan persyaratan nonfungsional, dengan persyaratan nonfungsional dirumuskan mengacu pada model kualitas produk ISO/IEC 25010 (ISO/IEC, 2023) sehingga indikator pada Tabel III.7 memperoleh kriteria penerimaan yang terukur.

**53. [SUNTING] Paragraf luaran (tambah kalimat indikator)**

Cari (Ctrl+F):

> didokumentasikan secara lengkap pada Lampiran 1. Hasil pelaksanaan tahap ini diuraikan pada subbab IV.1.

Ganti dengan:

> didokumentasikan secara lengkap pada Lampiran 1. Indikator capaian tahap ini adalah setiap persyaratan dapat ditelusuri ke rumusan masalah atau tujuan pengembangan, setiap butir referensi kegiatan telah ditetapkan status perhitungannya, dan setiap persyaratan nonfungsional tertaut pada satu karakteristik mutu. Hasil pelaksanaan tahap ini diuraikan pada subbab IV.1.

---

## III.5.2 Perancangan

**54. [SUNTING] Butir 1 Perancangan arsitektur sistem**

Cari (Ctrl+F):

> serta lapisan on-chain berbasis Solidity pada jaringan Base.

Ganti dengan:

> serta lapisan on-chain berupa tiga kontrak berbahasa Solidity pada jaringan Base.

**55. [SUNTING] Butir 2 Perancangan proses**

Cari (Ctrl+F):

> didefinisikan pada kamus data, sedangkan logika pemrosesan

Ganti dengan:

> didefinisikan pada kamus data, termasuk kesepadanan tipe variabel perhitungan antara lapisan on-chain dan lapisan off-chain, sedangkan logika pemrosesan

**56. [SUNTING] Paragraf luaran (tambah kalimat indikator)**

Cari (Ctrl+F):

> ERD, structure chart, dan rancangan antarmuka. Hasil pelaksanaan tahap ini diuraikan pada subbab IV.2.

Ganti dengan:

> ERD, structure chart, dan rancangan antarmuka. Indikator capaian tahap ini adalah setiap persyaratan fungsional terpetakan ke proses pada DFD dan modul pada structure chart, aliran data seimbang antarjenjang DFD, dan setiap penyimpanan data memiliki entitas pada ERD. Hasil pelaksanaan tahap ini diuraikan pada subbab IV.2.

---

## III.5.3 Implementasi

**57. [SUNTING] Paragraf kedua (tambah kontrak registri)**

Cari (Ctrl+F):

> perhitungannya dan kontrak BKDSKSToken yang mewarisi ERC20 dan AccessControl, kemudian dikompilasi

Ganti dengan:

> perhitungannya, kontrak BKDSKSToken yang mewarisi ERC20 dan AccessControl, serta kontrak BKDDokumenRegistri yang mewarisi AccessControl, kemudian dikompilasi

**58. [GANTI] Paragraf ketiga (luaran dan indikator)**

Cari paragraf yang diawali:

> Seluruh kode dikelola pada repositori Git dengan strategi feature branching sehingga ...

Ganti seluruh paragraf dengan:

Seluruh kode dikelola pada repositori Git dengan strategi feature branching sehingga pengerjaan setiap fungsionalitas baru terisolasi hingga dinyatakan siap diintegrasikan, disertai verifikasi unit secara informal selama pengodean. Luaran tahap ini adalah kode sumber seluruh lapisan sistem, artefak kompilasi kontrak beserta definisi tipe hasil pembangkitan, serta berkas build aplikasi web yang dapat dieksekusi. Indikator capaian tahap ini adalah seluruh persyaratan fungsional terealisasi pada matriks implementasi, ketiga kontrak berhasil dikompilasi, dan kode aplikasi web lolos pemeriksaan tipe serta proses build. Hasil pelaksanaan tahap ini diuraikan pada subbab IV.3.

---

## III.5.4 Pengujian

**59. [GANTI] Paragraf kedua (metode dan jenjang pengujian)**

Ditautkan ke II.1.18: component testing diwujudkan sebagai integration testing, validation testing dan defect testing, serta IEEE Std 829.

Cari paragraf yang diawali:

> Pengujian fungsional memakai metode black box, yaitu evaluasi berdasarkan masukan dan ...

Ganti seluruh paragraf dengan:

Pengujian fungsional memakai metode black box, yaitu evaluasi berdasarkan masukan dan keluaran sistem tanpa memperhatikan struktur internal kode, sebagaimana diuraikan pada subbab II.1.18. Jenjang pengujian mengikuti tiga jenjang menurut Sommerville (2016), dengan jenjang component testing diwujudkan sebagai integration testing karena komponen pada sistem ini berupa lapisan yang berkomunikasi melalui antarmuka jaringan, sehingga cacat yang dicari justru muncul pada titik temu antarlapisan. Setiap skenario disusun dalam dua sudut pandang, yaitu skenario positif yang memperlihatkan pemenuhan persyaratan sebagai wujud validation testing, serta skenario negatif dan skenario batas yang sengaja mencari perilaku keliru sebagai wujud defect testing. Dokumentasi pengujian disusun mengikuti kerangka IEEE Std 829 (IEEE, 2008), mulai dari rencana pengujian, spesifikasi skenario, hingga laporan hasilnya. Pengujian dilaksanakan melalui lima jenis pengujian berikut.

**60. [GANTI] Isi butir 1 Unit Testing**

Unit test di repo hanya untuk tiga kontrak (test/bkd.test.js, token.test.js, registri.test.js), sama dengan Tabel IV.68. Klaim "modul aplikasi web diuji unit" dihapus.

Cari paragraf yang diawali:

> Memvalidasi setiap fungsi perhitungan pada kontrak KalkulatorBKDPendidikan dan setiap ...

Ganti seluruh paragraf dengan:

Memvalidasi setiap fungsi perhitungan pada kontrak KalkulatorBKDPendidikan, setiap fungsi siklus hidup token pada kontrak BKDSKSToken, dan fungsi pencatatan pada kontrak BKDDokumenRegistri secara terisolasi melalui kerangka pengujian Hardhat pada jaringan simulasi. Setiap skenario mendefinisikan kondisi awal, langkah eksekusi, dan hasil yang diharapkan, dengan cakupan jalur normal, jalur penolakan masukan tidak valid, dan kondisi batas.

**61. [GANTI] Isi butir 2 Integration Testing**

Cari paragraf yang diawali:

> Memvalidasi interaksi lintas lapisan, mencakup integrasi aplikasi web dengan smart ...

Ganti seluruh paragraf dengan:

Memvalidasi interaksi lintas lapisan, mencakup integrasi aplikasi web dengan ketiga smart contract melalui titik akhir RPC, integrasi aplikasi web dengan layanan ekstraksi dokumen melalui HTTP pada jalur ekstraksi penugasan maupun jalur pemeriksaan dokumen bukti, serta integrasi aplikasi web dengan basis data melalui Prisma ORM. Pengujian pada jalur pemeriksaan bukti dan jalur pencatatan registri mencakup pula perilaku sistem ketika layanan ekstraksi maupun titik akhir RPC tidak dapat dihubungi, yaitu memastikan kegagalan layanan pendukung tidak menggagalkan aksi pengguna.

**62. [GANTI] Isi butir 4 Uji Akurasi Perhitungan Kredit**

Cari paragraf yang diawali:

> Mengukur kesesuaian hasil perhitungan smart contract terhadap perhitungan manual ...

Ganti seluruh paragraf dengan:

Mengukur kesesuaian hasil perhitungan smart contract terhadap perhitungan manual berdasarkan Rubrik BKD unsur pendidikan, dengan nilai acuan yang diturunkan langsung dari rubrik dan bukan dari kode. Kasus uji disusun atas kombinasi variabel pada Tabel III.6, termasuk kasus pengampuan bersama dan kasus keterlaksanaan di bawah penuh. Pengujian dinyatakan berhasil apabila seluruh kasus uji menghasilkan nilai kredit yang identik dengan perhitungan manual, mengingat aturan perhitungan bersifat deterministik sehingga satu ketidaksesuaian pun menandakan cacat logika.

**63. [SUNTING] Paragraf penutup (tambah kalimat indikator)**

Cari (Ctrl+F):

> beserta rekapitulasi status kelulusan setiap skenario. Hasil pelaksanaan tahap ini diuraikan pada subbab IV.4.

Ganti dengan:

> beserta rekapitulasi status kelulusan setiap skenario. Indikator capaian tahap ini adalah seluruh skenario dinyatakan lulus, seluruh kasus uji akurasi menghasilkan nilai identik dengan perhitungan manual, dan persyaratan nonfungsional yang diterapkan terverifikasi, sehingga indikator nomor satu sampai tujuh pada Tabel III.7 dapat dinilai. Hasil pelaksanaan tahap ini diuraikan pada subbab IV.4.

---

## III.5.5 Operation dan Maintenance

**64. [SUNTING] Paragraf kedua (bagian A)**

Cari (Ctrl+F):

> penerbitan kedua smart contract

Ganti dengan:

> penerbitan ketiga smart contract

**65. [SUNTING] Paragraf kedua (bagian B)**

Cari (Ctrl+F):

> dan layanan ekstraksi dokumen pada lingkungan peladen.

Ganti dengan:

> dan layanan ekstraksi dokumen sebagai kontainer pada lingkungan peladen.

**66. [GANTI] Paragraf luaran**

Cari paragraf yang diawali:

> Luaran tahap ini adalah kedua kontrak yang telah beroperasi dan terverifikasi di jaringan ...

Ganti seluruh paragraf dengan:

Luaran tahap ini adalah ketiga kontrak yang telah beroperasi dan terverifikasi di jaringan Base Sepolia, sistem yang berjalan pada lingkungan operasional, hasil uji adopsi pengguna, serta catatan kegiatan pemeliharaan. Indikator capaian tahap ini adalah ketiga kontrak terverifikasi kode sumbernya pada penjelajah blok, seluruh layanan off-chain berjalan pada peladen, uji adopsi terlaksana sehingga indikator kedelapan pada Tabel III.7 dapat dinilai, dan setiap kegiatan pemeliharaan tercatat pada riwayat repositori. Hasil pelaksanaan tahap ini diuraikan pada subbab IV.5, sedangkan analisis dampak hasil pengembangan termasuk hasil uji adopsi diuraikan pada Bab V, dan rencana keberlanjutan serta komersialisasi produk dibahas pada Bab VI.

---

## Catatan penomoran tabel

Dua tabel baru disisipkan di III.3.2, jadi tabel tahapan bergeser dua nomor. Tabel III.1 sampai III.5 sengaja tidak digeser karena Bab 4 merujuk Tabel III.1 di empat tempat.

| Tabel | Lama | Baru | Rujukan yang ikut diubah |
| --- | --- | --- | --- |
| Operasionalisasi Variabel Perhitungan Kredit | belum ada | III.6 | Sudah tercakup di butir III.3.2 dan paragraf kegiatan III.5.1 |
| Indikator Ketercapaian Tujuan Pengembangan | belum ada | III.7 | Sudah tercakup di butir III.3.2, III.5.1, III.5.4, dan III.5.5 |
| Tahapan, Kegiatan, Luaran, dan Indikator Capaian | III.6 | III.8 | "dirangkum pada Tabel III.6" dan "Berdasarkan Tabel III.6, setiap tahapan" di III.5, keduanya sudah tercakup di butir III.5 |

## Gambar

- Gambar III.1: render ulang dari mermaid yang sudah diperbarui. Gambar IV.5 di Bab 4 memakai berkas yang sama.
- Gambar III.2: tidak berubah.

## Rujukan silang yang sudah diperiksa

- Semua rujukan ke Bab II (II.1.1 sampai II.1.18, II.2, Tabel II.1, Gambar II.2) cocok dengan `Bab 2_revisi.md`.
- Semua rujukan ke Bab IV (IV.1.3.2, IV.1.4, IV.2.4, IV.4.2 sampai IV.4.6, IV.5.1) cocok dengan judul di `Bab 4.md`.
- Urutan III.5.1 sampai III.5.5 sama dengan IV.1 sampai IV.5.
- Rujukan dari bab lain ke Bab III (Bab 2 ke III.5, III.5.1, III.5.4; Bab 4 ke Tabel III.1, III.3, III.5.1 sampai III.5.4) tetap valid.

## Hal di bab lain yang perlu disesuaikan (tidak diubah di revisi ini)

1. **Bab 1 revisi, I.3 tujuan pertama** menulis "SK (Surat Keterangan)", sedangkan I.5 dan seluruh Bab III menulis Surat Keputusan. Samakan menjadi Surat Keputusan.
2. **Bab 1 revisi, I.5** menulis "dihimpun dari tiga kelompok sumber berikut", tetapi hanya dua butir yang dicantumkan. Pilih salah satu: ubah menjadi "dua kelompok", atau tambah butir ketiga "Dokumen bukti kegiatan pembimbingan yang diunggah dosen" (paling cocok dengan III.2).
3. **Bab 1 revisi, I.6.1 butir 7** menulis "sebelas butir kegiatan yang perhitungannya bergantung pada parameter terukur". Sebelas butir memang dimuat, tetapi hanya delapan yang dihitung kontrak (Tabel III.4). Usul: "Penerapan aturan Rubrik BKD unsur pendidikan pada sebelas butir kegiatan, delapan di antaranya dihitung smart contract berdasarkan parameter terukur."
4. **Bab 1 revisi, I.6.2 butir 5**: "subbab 1.5" menjadi "subbab I.5".
5. **Bab 2 revisi, II.1.1 paragraf setelah Tabel II.1** menyebut total kredit "dibandingkan terhadap rentang 12 SKS sampai dengan 16 SKS pada Pasal 72". Kode (`app/asesor/penilaian/[id]/actions.ts`) dan Bab 4 (paragraf setelah Tabel IV.63) memakai ambang 9 SKS untuk menentukan status memenuhi. Tabel III.6 mengikuti kode. Sesuaikan kalimat Bab 2 supaya menyebut ambang 9 SKS, setelah dicek ulang ke teks PO BKD 2021.
6. **Bab 2 revisi, II.1.16 paragraf penutup**: daftar entitas belum memuat "dokumen kegiatan", padahal ERD di Bab 4 punya sebelas entitas.
7. **Bab V dan Bab VI**: III.3.2 menyatakan keterbatasan variabel keterlaksanaan (nilai baku 16 pertemuan pada hasil ekstraksi) sebagai bahan saran. Pastikan keterbatasan itu muncul di V.4 dan sarannya di VI.2.
