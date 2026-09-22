# **BAB I** **PENDAHULUAN**

 	Bab ini memaparkan landasan dan kerangka dasar pemikiran yang melatari pelaksanaan Tugas Akhir mengenai pengembangan Sistem Penilaian Beban Kerja Dosen Bidang Pendidikan Berbasis *Smart Contract* yang diberi nama LedgerDik. Pembahasan diawali dengan uraian mengenai kedudukan beban kerja dosen sebagai instrumen penjaminan mutu pendidikan tinggi, disertai persoalan faktual yang muncul pada tahap verifikasi parameter dan pemeriksaan dokumen bukti. Selanjutnya, bab ini merumuskan masalah, menetapkan tujuan dan manfaat pengembangan, mengidentifikasi pemangku kepentingan, menguraikan dukungan data, serta menetapkan ruang lingkup dan batasan pengembangan. Bagian akhir bab memuat sistematika penulisan laporan.

## **I.1 Latar Belakang**

   Beban Kerja Dosen (BKD) adalah instrumen evaluasi tugas dosen di perguruan tinggi. Pasal 72 Undang-Undang Nomor 14 Tahun 2005 tentang Guru dan Dosen menetapkan beban kerja dosen sekurang-kurangnya sepadan dengan 12 satuan kredit semester (SKS) dan sebanyak-banyaknya 16 SKS setiap semester. Ketentuan operasionalnya diatur dalam Keputusan Direktur Jenderal Pendidikan Tinggi Nomor 12/E/KPT/2021 tentang Pedoman Operasional Beban Kerja Dosen (PO BKD). Pedoman ini disusun sebagai respons atas beragamnya penafsiran dan penerapan Pasal 72 oleh perguruan tinggi (Kepdirjendikti, 2021). 
   Aturan perhitungan BKD tersebut dituangkan dalam Rubrik BKD. Rubrik ini merinci setiap butir kegiatan, satuan hasil, bobot SKS per semester, ketentuan dokumen bukti pendukung, metode kalkulasi, serta parameter penugasan yang menjadi masukan perhitungannya. Parameter tersebut mencakup variabel kuantitatif terukur seperti jumlah mahasiswa, porsi pengampuan, dan jumlah pertemuan. Keberagaman butir aturan dan parameter tersebut menuntut mekanisme perhitungan yang konsisten dan sesuai ketentuan resmi demi meningkatkan akuntabilitas evaluasi kinerja dosen.
   PO BKD mengarahkan pengelolaan layanan BKD melalui aplikasi daring yang terintegrasi dengan Sistem Informasi Sumber Daya Terintegrasi (SISTER) agar dosen tidak memasukkan data yang sama secara berulang (Kepdirjendikti, 2021). Namun, antarmuka pengguna pada SISTER saat ini memiliki kelemahan mendasar dalam merepresentasikan porsi pengampuan riil dosen. Antarmuka SISTER menampilkan nilai kredit SKS secara utuh berdasarkan bobot kurikulum mata kuliah penuh, tanpa memperhitungkan pembagian porsi komponen perkuliahan yang diampu oleh dosen yang bersangkutan.
   Sebagai ilustrasi, pada mata kuliah Bahasa Indonesia yang memiliki bobot total 6 SKS (terdiri atas 4 SKS Praktik dan 2 SKS Teori), seorang dosen yang hanya ditugaskan mengajar komponen Praktik seharusnya hanya mendapatkan perhitungan beban sebesar 4 SKS. Akan tetapi, sistem SISTER akan tetap memunculkan angka 6 SKS secara penuh di antarmuka penilaian. Ketidaksesuaian tampilan angka pada antarmuka tersebut memicu efek domino pada tahapan evaluasi berikutnya.
   Karena sistem menampilkan angka SKS yang keliru secara proporsi, asesor tidak dapat langsung menyetujui angka yang disajikan oleh sistem. Asesor terpaksa melakukan kalkulasi ulang secara manual di luar sistem untuk mendapatkan angka SKS yang sesuai dengan porsi pengajaran riil. Berdasarkan wawancara dengan asesor BKD (Nurjannah, 2026), hasil hitungan manual antar-asesor untuk kegiatan yang sama kerap berbeda, dan proses penilaian yang berjalan selama ini sudah punya mekanisme kompromi berupa perata-rataan nilai kredit untuk menyelesaikannya. Begitu angka kompromi disepakati, asesor jarang mengecek ulang kesesuaiannya dengan Rubrik BKD dan lebih memilih langsung menyetujuinya, sehingga angka yang lolos penilaian bisa saja menyimpang dari porsi pengajaran riil dosen tanpa terdeteksi.
   Persoalan tersebut tidak selesai hanya dengan memperbaiki mekanisme kalkulasinya. Sekalipun dibangun aplikasi web baru yang mampu menghitung porsi SKS secara presisi dari parameter penugasan, data penilaiannya akan tetap tersimpan pada basis data yang sepenuhnya dikendalikan oleh administrator institusi. Akibatnya, dosen maupun pihak luar tetap tidak dapat memverifikasi riwayat penilaian secara mandiri, dan angka kompromi tetap dapat diubah sewaktu-waktu tanpa meninggalkan jejak audit yang dapat ditelusuri.
   Guna mengatasi keterbatasan model terpusat tersebut, teknologi blockchain dan smart contract menawarkan mekanisme pencatatan dan kalkulasi yang berbeda. Nakamoto (2008) memperkenalkan blockchain sebagai rantai catatan transaksi bertanda waktu yang ditautkan melalui fungsi hash, sehingga catatan bersifat permanen (immutable). Di atas blockchain, smart contract menjalankan logika perhitungan secara otomatis dan deterministik. Artinya, parameter porsi pengampuan yang sama akan selalu diproses menjadi keluaran SKS yang persis sama berdasarkan formula baku Rubrik BKD. Evaluasi profesional tenaga pendidik memerlukan mekanisme penilaian yang transparan, aman, dan konsisten (Bayan et al., 2024).
   Smart contract memutus rantai masalah tersebut sejak awal. Karena perhitungan SKS langsung mengikuti porsi mengajar masing-masing dosen begitu parameter penugasan dimasukkan, kedua asesor langsung mendapat angka dasar yang sama dan pasti, sehingga tidak perlu lagi menghitung ulang secara manual atau berkompromi lewat rata-rata seperti pada SISTER. Kode smart contract juga bersifat immutable sehingga formula perhitungan tidak dapat diubah sepihak, dan setiap penerbitan kredit tercatat permanen di blockchain sehingga dosen maupun pihak luar dapat menelusuri riwayat penilaian kapan saja.
   Berdasarkan urgensi tersebut, Tugas Akhir ini mengembangkan LedgerDik, sistem penilaian BKD berbasis smart contract di jaringan blockchain Ethereum Virtual Machine (EVM). Sistem ini berfokus mengatasi akar masalah sistem SISTER, yaitu angka SKS yang ditampilkan secara utuh tanpa memperhitungkan porsi pengampuan riil dosen, dengan mengeksekusi Rubrik BKD secara on-chain. Sebagai keluarannya, sistem menerbitkan kredit SKS dalam bentuk token ERC-20 non-transferable yang nilainya dihitung sesuai porsi pengampuan dosen, sehingga asesor tidak perlu lagi menghitung manual atau merata-ratakan nilai. Seluruh pengembangan sistem ini dilaksanakan menggunakan metode waterfall (Sommerville, 2016).

## **I.2 Rumusan Masalah**

   Subbab ini menguraikan permasalahan utama dalam penilaian BKD bidang pendidikan yang berjalan melalui SISTER
   1. Asesor menghitung ulang secara manual ketika angka SKS dari SISTER tidak sesuai porsi mengajar riil dosen, dan hasil hitungan antar-asesor kerap berbeda untuk kegiatan yang sama. Perbedaan ini diselesaikan lewat kompromi rata-rata nilai kredit tanpa dicek ulang kesesuaiannya dengan Rubrik BKD (Nurjannah, 2026), sehingga angka yang lolos penilaian bisa menyimpang dari porsi pengajaran riil dosen tanpa terdeteksi.
   Diperlukan mekanisme yang menjalankan Rubrik BKD secara otomatis mengikuti porsi mengajar dosen, sehingga kegiatan yang sama selalu menghasilkan angka kredit yang sama tanpa perlu dihitung ulang atau dikompromikan.
   2.	Rekam hasil penilaian BKD hanya bisa ditelusuri lewat administrator basis data institusi, sehingga dosen maupun pihak luar tidak bisa memeriksanya sendiri, dan angka kompromi bisa diubah sewaktu-waktu tanpa jejak yang bisa diaudit. Diperlukan pencatatan yang permanen dan bisa ditelusuri kapan saja, tanpa bergantung penuh pada administrator basis data terpusat.

## **I.3 Tujuan dan Manfaat Pengembangan Sistem**

   Berdasarkan rumusan masalah yang telah ditetapkan, tujuan dari pengembangan LedgerDik adalah sebagai berikut.
   1.	Menghasilkan modul ekstraksi parameter penugasan dari berkas SK (Surat Keterangan) dan ST (Surat Tugas) menggunakan VLM (Visual Language Model) dan modul Python, untuk menghitung porsi mengajar riil dosen langsung dari dokumen sumber tanpa pengetikan ulang manual. 
   2.	Menghasilkan mekanisme pencatatan kredit SKS ke blockchain berbasis smart contract dan token ERC-20 non-transferable, untuk menyediakan jejak penilaian permanen yang bisa diverifikasi secara mandiri dari masing-masing pihak.

## **I.4 Pemangku Kepentingan dan Manfaat Hasil Pengembangan Sistem**

   Pengembangan LedgerDik ditujukan untuk mendukung proses penilaian Beban Kerja Dosen (BKD) unsur pendidikan yang berjalan melalui SISTER. Sistem yang dikembangkan diharapkan memberikan manfaat bagi pihak-pihak yang terlibat dalam proses penilaian tersebut. Oleh karena itu, terdapat beberapa pemangku kepentingan yang memperoleh manfaat dari hasil pengembangan LedgerDik.
   1. Dosen
    Kaitan: Sebagai pihak yang dinilai sekaligus pelapor kegiatan BKD.
    Manfaat Aplikatif: Dosen memperoleh nilai SKS yang dihitung dengan formula Rubrik BKD yang sama untuk semua dosen, mengikuti porsi mengajar riilnya masing-masing. Dosen juga memiliki rekam kredit SKS yang terikat pada alamat dompet digital (wallet) miliknya, sehingga riwayat penilaiannya bisa diverifikasi secara mandiri kapan saja tanpa perlu minta akses ke administrator.
   2.	Asesor
    Kaitan: Sebagai dosen yang diberi kewenangan untuk memeriksa, memvalidasi, dan mengesahkan laporan BKD dosen lain.
    Manfaat Aplikatif: Asesor menerima parameter kegiatan yang sudah diekstraksi dari berkas SK/ST sumber, sehingga bisa fokus mengevaluasi kesesuaian penugasan tanpa perlu mengetik ulang data. Pada butir yang dihitung otomatis, kedua asesor menerima nilai SKS yang sama, sehingga tidak perlu lagi menghitung ulang secara manual atau mengompromikannya lewat rata-rata. Jika nilai yang disahkan kedua asesor tetap berbeda, misalnya pada butir yang dinilai manual, sistem menghitung rata-ratanya secara otomatis dan tetap mencatat nilai masing-masing asesor.
   3.	Administrator
    Kaitan: Sebagai staf tata usaha yang mengelola periode penilaian, referensi kegiatan, dan penugasan asesor.
    Manfaat Aplikatif: Administrator cukup mengunggah berkas SK/ST resmi untuk mendistribusikan parameter kegiatan ke portofolio masing-masing dosen, tanpa perlu input manual satu per satu. Administrator juga memperoleh rekapitulasi BKD yang seragam antar-dosen dan antar-periode, beserta jejak penilaian permanen di blockchain yang bisa dipakai menelusuri riwayat penilaian kapan saja.

## **I.5 Dukungan Data**

   Guna mendukung pengembangan dan pengujian sistem LedgerDik, data yang digunakan dihimpun dari tiga kelompok sumber berikut:
   1.	Rubrik BKD pada PO BKD 2021
   Aturan perhitungan kredit yang diimplementasikan ke dalam smart contract bersumber dari Rubrik BKD yang tercantum pada Lampiran Keputusan Direktur Jenderal Pendidikan Tinggi Nomor 12/E/KPT/2021 tentang Pedoman Operasional Beban Kerja Dosen (Kepdirjendikti, 2021). Rubrik tersebut memerinci setiap butir kegiatan beserta satuan hasil, nilai SKS per semester, bukti yang dipersyaratkan, dan penjelasan cara perhitungannya. Pada unsur pendidikan, rubrik memuat dua komponen Pendidikan dan empat belas komponen Pelaksanaan Pendidikan. Rubrik ini menjadi acuan tunggal dalam penurunan logika perhitungan pada smart contract.
   2.	Dokumen Penugasan Dosen
   Dokumen penugasan berupa Surat Tugas (ST) dan Surat Keputusan (SK) yang diterbitkan Ketua Jurusan Teknik Komputer dan Informatika serta Direktur Politeknik Negeri Bandung. Dihimpun enam dokumen dengan rentang penerbitan 1 Maret 2024 hingga 19 Januari 2026, yaitu:
   1.	SK Pembimbing Tugas Akhir Program Studi D3 Teknik Informatika Nomor B/110/PL1.KO/PT.00.06/2024 
   2.	SK Pembimbing Tugas Akhir Program Studi Sarjana Terapan Teknik Informatika Nomor B/111/PL1.KO/PT.00.06/2024 
   3.	ST Penguji Tugas Akhir Nomor 285/KO/AK.18.06/2025 
   4.	ST Penugasan Pengajaran Nomor 408/KO/AK.04.01/2025 
   5.	ST Pembimbing Praktik Kerja Lapangan Nomor 410/KO/AK.04.07/2025 
   6.	SK Pembina Organisasi Kemahasiswaan Nomor 45/PL1/HK.02/2026

## **I.6 Ruang Lingkup & Batasan**

   Subbab ini menetapkan cakupan dan batas kemampuan sistem yang dikembangkan agar pembahasan tetap terarah.
### **I.6.1 Ruang Lingkup**

   Ruang lingkup Tugas Akhir dan pengembangan LedgerDik meliputi:  
   1.	Pengembangan modul ekstraksi parameter kegiatan dari SK dan ST resmi, baik berkas PDF digital maupun berkas hasil pemindaian. 
   2.	Pengembangan modul pemeriksaan dokumen bukti yang mencocokkan nama dan peran pada dokumen dengan dosen pengunggah. 
   3.	Pengembangan logika aturan Rubrik BKD unsur pendidikan di atas jaringan blockchain untuk menjalankan perhitungan kredit SKS. 
   4.	Penerbitan dan pengelolaan token kredit SKS non-transferable sebagai representasi hasil penilaian BKD yang telah disahkan. 
   5.	Pencatatan sidik digital (hash) berkas penugasan dan dokumen bukti pada blockchain untuk menjamin transparasi dan keaslian berkas. 
   6.	Pengembangan aplikasi web berbasis peran (Dosen, Asesor, dan Administrator) yang mengelola alur penilaian dari unggah dokumen hingga penerbitan token.
   7.	Penerapan aturan Rubrik BKD unsur pendidikan pada sebelas butir kegiatan yang perhitungannya bergantung pada parameter terukur. 
   8.	Pengujian fungsionalitas sistem secara bertingkat untuk memastikan ketepatan hasil perhitungan dan keandalan sistem

### **I.6.2 Batasan**

   Batasan Tugas Akhir dan pengembangan LedgerDik meliputi:  
   1. Sistem berupa prototipe fungsional, tidak terintegrasi langsung dengan sistem akademik resmi maupun SISTER. 
   2. Pencatatan blockchain dibatasi pada jaringan uji (testnet Base Sepolia). 
   3.	Cakupan aturan Rubrik BKD dibatasi pada unsur Pendidikan, tidak mencakup unsur Penelitian, Pengabdian kepada Masyarakat, maupun Penunjang dan sebagainya.
   4.	Butir kegiatan yang memerlukan penilaian kualitatif asesor, yang perhitungannya berupa batas maksimum, atau yang belum diotomatisasi tidak dihitung oleh smart contract. Nilai butir tersebut ditetapkan manual oleh asesor. 
   5.	Data pengujian terbatas pada SK dan ST dari JTK POLBAN yang telah disebutkan pada subbab 1.5, kesesuaian terhadap format dokumen di luar konteks itu tidak dijamin. 
   6.	Hasil pembacaan dokumen berbasis VLM bersifat probabilistik, sehingga verifikasi dan persetujuan asesor tetap diwajibkan sebelum data diproses oleh sistem. 
   7.	Pemeriksaan dokumen bukti dibatasi pada kesesuaian isi (nama dan peran), serta tidak mencakup verifikasi keabsahan fisik seperti stempel atau tanda tangan basah. 
   8.	Pengelolaan dompet digital (wallet) dosen ditangani oleh sistem secara internal agar dosen dapat menggunakan aplikasi tanpa harus mengelola private key secara mandiri.
    
29. ## **Sistematika Penulisan**

    Sistematika dalam penulisan Laporan Tugas Akhir ini dibagi menjadi enam bab dengan penjelasan sebagai berikut:


| BAB I   | Pendahuluan                                                                                                                                                                                                                                                                                                                               |
| :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|         | Bab ini menguraikan latar belakang dan urgensi permasalahan penilaian BKD bidang pendidikan, rumusan masalah, tujuan dan manfaat pengembangan, pemangku kepentingan, dukungan data, ruang lingkup dan batasan, serta sistematika penulisan laporan.                                                                                       |
| BAB II  | Tinjauan Pustaka                                                                                                                                                                                                                                                                                                                          |
|         | Bab ini memuat dasar teori yang melandasi pengembangan sistem, mulai dari*blockchain*, *smart contract*, dan standar token ERC-20 hingga ekstraksi dokumen, model bahasa visual, dan teori rekayasa perangkat lunak yang digunakan, disertai kajian karya ilmiah sejenis sebagai pembanding posisi kebaruan sistem LedgerDik.             |
| BAB III | Metodologi Pengembangan Sistem                                                                                                                                                                                                                                                                                                            |
|         | Bab ini menjelaskan model proses*waterfall* yang digunakan, data dan objek pengembangan, perangkat pendukung, serta tahapan pelaksanaan mulai dari analisis dan penetapan spesifikasi persyaratan perangkat lunak hingga *operation* dan *maintenance*, disertai luaran setiap tahap.                                                     |
| BAB IV  | Pembahasan dan Implementasi Solusi                                                                                                                                                                                                                                                                                                        |
|         | Bab ini memaparkan hasil setiap tahapan pengembangan, meliputi analisis sistem berjalan dan penetapan persyaratan, perancangan arsitektur, proses, modul, basis data, dan antarmuka, implementasi*smart contract* beserta aplikasi web dan layanan pendukungnya, hasil pengujian bertingkat, serta pengoperasian dan pemeliharaan sistem. |
| BAB V   | Analisis Dampak Hasil Pengembangan Sistem                                                                                                                                                                                                                                                                                                 |
|         | Bab ini menganalisis dampak hasil pengembangan, mencakup pemetaan tujuan terhadap dampak yang diharapkan, keberterimaan pengguna berdasarkan hasil uji adopsi, rekognisi mitra atas kebermanfaatan produk, serta kelemahan dan keterbatasan hasil pengembangan sebagai dasar saran.                                                       |
| BAB VI  | Penutup                                                                                                                                                                                                                                                                                                                                   |
|         | Bab ini berisi kesimpulan atas ketercapaian tujuan pengembangan sistem LedgerDik, saran bagi pengembangan lanjutan, serta rencana keberlanjutan dan komersialisasi produk.                                                                                                                                                                |
