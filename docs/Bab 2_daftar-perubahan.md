# Daftar Perubahan Bab II untuk Diterapkan ke Docx

Pembanding: `Bab 2.md` (lama) dengan `Bab 2_revisi.md` (baru). Penomoran judul dan huruf miring tidak dicantumkan karena dikerjakan manual. Teks pengganti ditulis polos tanpa format supaya aman ditempel ke Word.

Jenis perubahan:

- **GANTI**: ganti satu paragraf utuh (dipakai bila perubahan dalam paragraf lebih dari dua titik).
- **SUNTING**: cari potongan kalimat lalu ganti. Setiap potongan "Cari" sudah diperiksa muncul tepat satu kali di naskah lama.
- **BARU**: paragraf, tabel, atau subbab yang belum ada di naskah lama.

Ringkasan: 14 paragraf GANTI, 12 SUNTING, 1 tabel baru, 4 paragraf baru di II.1.1, 2 subbab baru (II.1.17 dan II.1.18), 1 judul subbab berubah (II.1.6), dan 2 gambar. Subbab II.1.5, II.1.9, II.1.16, dan isi Tabel Karya Ilmiah Sejenis tidak berubah sama sekali.

---

## Pengantar Bab II

**1. [GANTI] Paragraf pengantar bab (sebelum II.1)**

Cari paragraf yang diawali:

> Bab ini menguraikan dasar teori dan hasil tinjauan karya ilmiah sejenis yang ...

Ganti seluruh paragraf dengan:

Bab ini menguraikan dasar teori dan hasil tinjauan karya ilmiah sejenis yang menjadi landasan pengembangan sistem LedgerDik. Teori yang dimuat dibatasi pada konsep, standar, dan metode yang benar-benar dipakai pada tahap analisis, perancangan, implementasi, dan pengujian sistem, sehingga setiap uraian berujung pada keputusan teknis yang dapat ditelusuri. Pembahasan diawali dengan Beban Kerja Dosen sebagai domain permasalahan, disertai penetapan variabel perhitungan kredit yang menjadi masukan dan keluaran sistem. Bagian berikutnya menguraikan blockchain, smart contract, Ethereum Virtual Machine, jaringan Layer-2, fungsi hash kriptografi, standar token ERC-20, token non-transferable, dan pengelolaan dompet kustodian sebagai landasan mekanisme perhitungan serta pencatatan kredit. Selanjutnya diuraikan ekstraksi tabel pada berkas PDF, model bahasa visual, pencocokan nama orang, dan verifikasi kesesuaian isi dokumen bukti sebagai landasan mekanisme pengadaan parameter dan pemeriksaan bukti. Bagian berikutnya memuat landasan rekayasa perangkat lunak, yaitu model proses pengembangan, perangkat pemodelan terstruktur, pemodelan data, kerangka spesifikasi persyaratan beserta model kualitas produk, dan jenjang pengujian. Bagian akhir bab menyajikan tinjauan karya ilmiah sejenis, analisis kesenjangan, dan posisi kebaruan sistem yang dikembangkan.

---

## II.1.1 Beban Kerja Dosen dan Rubrik Penilaian Unsur Pendidikan

Subbab ini paling banyak berubah. Susunan barunya: P1, P2, P3 (baru), Tabel II.1 (baru), P4 (baru), P5 (baru), P6 (baru), P7. Tiga kalimat "Sifat pertama/kedua/ketiga" yang dulu ada di akhir P2 **dipindah dan ditulis ulang** menjadi P6.

**2. [GANTI] P1**

Cari paragraf yang diawali:

> Beban Kerja Dosen (BKD) merupakan instrumen yang dipakai untuk merencanakan, melaksanakan, dan ...

Ganti seluruh paragraf dengan:

Beban Kerja Dosen (BKD) merupakan instrumen yang dipakai untuk merencanakan, melaksanakan, dan menilai tugas profesional dosen di perguruan tinggi berdasarkan pelaksanaan Tri Dharma Perguruan Tinggi. Pasal 72 Undang-Undang Nomor 14 Tahun 2005 tentang Guru dan Dosen menetapkan beban kerja dosen sekurang-kurangnya sepadan dengan 12 satuan kredit semester (SKS) dan sebanyak-banyaknya 16 SKS setiap semester, sedangkan ketentuan operasionalnya ditetapkan melalui Keputusan Direktur Jenderal Pendidikan Tinggi Nomor 12/E/KPT/2021 tentang Pedoman Operasional Beban Kerja Dosen (Kepdirjendikti, 2021). Pedoman tersebut disusun karena ketentuan Pasal 72 ditafsirkan dan diterapkan secara berbeda-beda antarsatuan pendidikan tinggi. Dua tujuan pedoman tersebut berkaitan langsung dengan sistem yang dikembangkan, yaitu meningkatkan akuntabilitas dosen dalam menyusun laporan BKD secara benar dan meningkatkan kinerja asesor dalam melakukan evaluasi laporan BKD secara tepat (Kepdirjendikti, 2021).

**3. [GANTI] P2 (kalimat "Struktur rubrik tersebut memperlihatkan tiga sifat..." sampai akhir paragraf dibuang dari sini)**

Cari paragraf yang diawali:

> Aturan perhitungan BKD dituangkan dalam Rubrik BKD yang memerinci setiap butir kegiatan ...

Ganti seluruh paragraf dengan:

Aturan perhitungan BKD dituangkan dalam Rubrik BKD yang memerinci setiap butir kegiatan beserta satuan hasil, nilai SKS per semester, bukti yang dipersyaratkan, dan penjelasan cara perhitungannya (Kepdirjendikti, 2021). Pada unsur pendidikan, rubrik tersebut membedakan dua komponen Pendidikan, yaitu pendidikan formal dan pelatihan dasar, dari empat belas komponen Pelaksanaan Pendidikan, di antaranya pelaksanaan perkuliahan, pembimbingan seminar mahasiswa, pembimbingan Praktik Kerja Lapangan, pembimbingan penyusunan tugas akhir, pengujian ujian akhir, pembinaan kegiatan mahasiswa, pengembangan program kuliah, dan pengembangan bahan ajar.

**4. [BARU] P3**

Sisipkan setelah P2:

Cara perhitungan pada rubrik tersebut tidak menetapkan satu angka tetap bagi setiap butir kegiatan, melainkan menurunkan nilai kredit dari sejumlah parameter penugasan yang melekat pada pelaksanaan kegiatan. Parameter itulah yang berkedudukan sebagai variabel perhitungan pada sistem yang dikembangkan, yaitu besaran yang nilainya berubah menurut penugasan tiap dosen dan karenanya menentukan besaran kredit yang diperoleh. Pengelompokan variabel tersebut beserta kedudukannya dalam perhitungan disajikan pada Tabel II.1.

**5. [BARU] Tabel II.1 (sisipkan setelah P3)**


Judul tabel: **Tabel II.1. Kelompok Variabel Perhitungan Kredit pada Rubrik BKD Unsur Pendidikan**

| No. | Kelompok Variabel | Contoh Variabel | Kedudukan dalam Perhitungan | Butir Rubrik yang Memakainya |
| :---: | ---------------- | --------------- | --------------------------- | ---------------------------- |
| 1 | Volume kegiatan | Jumlah mahasiswa yang dibimbing atau diuji, jumlah semester, jumlah naskah | Pengali terhadap bobot baku butir | Pembimbingan tugas akhir, pengujian ujian akhir, pembimbingan seminar, pembimbingan Praktik Kerja Lapangan |
| 2 | Peran pelaksana | Peran pembimbing utama atau pembimbing pendamping, peran ketua atau anggota penguji, peran dalam tim penyusun bahan ajar | Penentu bobot baku yang berlaku bagi dosen yang bersangkutan | Pembimbingan tugas akhir, pengujian ujian akhir, pengembangan bahan ajar |
| 3 | Jenis atau jenjang objek | Jenis tugas akhir (disertasi, tesis, skripsi, laporan akhir studi), jenis bahan ajar, jenjang jabatan pimpinan | Penentu bobot baku yang berlaku bagi kegiatan tersebut | Pembimbingan tugas akhir, pengembangan bahan ajar, jabatan pimpinan perguruan tinggi |
| 4 | Porsi pengampuan | Bobot SKS mata kuliah, komponen teori dan praktik yang dipegang, persentase porsi dosen pada pengampuan bersama | Pengali proporsional yang membagi bobot mata kuliah menurut bagian yang benar-benar diampu | Pelaksanaan perkuliahan |
| 5 | Keterlaksanaan | Keterlaksanaan satu semester penuh, rasio pertemuan terealisasi terhadap pertemuan terencana | Penentu kelayakan sekaligus pengali proporsional atas capaian pelaksanaan | Pelaksanaan perkuliahan |

**6. [BARU] P4, P5, P6**

Sisipkan setelah Tabel II.1, berurutan:

Berdasarkan Tabel II.1, kelima kelompok tersebut berkedudukan sebagai variabel bebas, sedangkan variabel terikatnya adalah nilai kredit SKS pada satu butir kegiatan, yang kemudian diakumulasi menjadi total beban kerja satu semester dan dibandingkan terhadap rentang 12 SKS sampai dengan 16 SKS pada Pasal 72. Hubungan tersebut bersifat fungsional dan tertutup, yaitu nilai kredit sepenuhnya ditentukan oleh nilai variabel bebasnya beserta bobot baku yang ditetapkan rubrik, tanpa menyisakan ruang penafsiran bagi pembacanya. Sifat itulah yang memungkinkan aturan rubrik diterjemahkan menjadi fungsi perhitungan yang dapat dieksekusi mesin.

Kelompok keempat pada Tabel II.1 menempati kedudukan khusus dalam Tugas Akhir ini, karena justru variabel tersebut yang tidak terwakili pada antarmuka penilaian yang berjalan sebagaimana diuraikan pada subbab I.1. Bobot mata kuliah yang ditampilkan secara utuh tanpa pembagian porsi komponen yang diampu menyebabkan angka yang disajikan tidak mencerminkan beban riil dosen, sehingga asesor menghitung ulang di luar sistem dan menempuh perata-rataan ketika hasil hitungannya berbeda. Dengan demikian, persoalan yang dirumuskan pada subbab I.2 pada dasarnya merupakan persoalan variabel perhitungan yang hilang, bukan semata persoalan ketelitian asesor.

Struktur rubrik tersebut juga memperlihatkan tiga sifat yang menentukan rancangan sistem. Sifat pertama, sebagian besar butir menurunkan nilainya dari variabel pada Tabel II.1, yang seluruhnya terbaca langsung pada dokumen penugasan, sehingga perhitungannya bersifat tertutup dan dapat diulang. Sifat kedua, variabel peran dan variabel jenis membedakan besaran nilai secara tajam, misalnya pembimbing utama disertasi bernilai 1,33 SKS setiap mahasiswa sedangkan pembimbing pendamping bernilai 1 SKS setiap mahasiswa, sehingga kekeliruan penetapan peran berdampak langsung pada nilai kredit. Sifat ketiga, sebagian butir menetapkan nilai sebagai batas maksimum yang penetapannya menuntut penilaian kualitatif asesor terhadap mutu luaran, sehingga tidak memenuhi syarat ketertutupan yang dituntut eksekusi mesin.

**7. [GANTI] P7 (paragraf penutup)**

Cari paragraf yang diawali:

> Ketiga sifat tersebut menjadi dasar pembatasan cakupan otomatisasi pada sistem LedgerDik. Butir ...

Ganti seluruh paragraf dengan:

Ketiga sifat tersebut menjadi dasar pembatasan cakupan otomatisasi. Butir yang perhitungannya bersandar pada variabel terukur diterjemahkan menjadi fungsi perhitungan pada smart contract, sedangkan butir bernilai maksimum tetap dapat dilaporkan namun nilainya ditetapkan asesor secara manual, sebagaimana ditetapkan pada batasan di subbab I.6.2. Variabel peran pada kelompok kedua menjadi alasan mengapa pemeriksaan dokumen bukti pada sistem ini tidak berhenti pada keberadaan nama, melainkan berlanjut pada kesesuaian peran, sebagaimana diuraikan pada subbab II.1.13. Oleh karena itu, Rubrik BKD unsur pendidikan menjadi landasan normatif utama pengembangan sistem LedgerDik karena seluruh aturan yang ditanam pada smart contract diturunkan langsung dari pedoman tersebut, butir demi butir, beserta daftar variabel masukannya, tanpa penafsiran ulang oleh pengembang.

---

## II.1.2 Blockchain

**8. [GAMBAR] Gambar II.1 Struktur Rantai Blok**


Placeholder "[LENGKAPI GAMBAR: diagram rantai blok ...]" diganti gambar dari `docs/gambar/Gambar-II-1-Struktur-Rantai-Blok.mermaid`. Judul gambar tetap.

**9. [SUNTING] Paragraf penutup ("Perlu ditegaskan bahwa sifat immutable ...")**

Cari (Ctrl+F):

> karena riwayat penerbitan dan koreksi kredit SKS perlu tersimpan secara permanen

Ganti dengan:

> karena persoalan kedua pada subbab I.2 menuntut riwayat penerbitan dan koreksi kredit SKS tersimpan secara permanen

---

## II.1.3 Smart Contract

**10. [GANTI] Paragraf penutup**

Cari paragraf yang diawali:

> Kedua sifat tersebut menjawab persoalan yang dirumuskan pada subbab I.2. Determinisme menghapus ...

Ganti seluruh paragraf dengan:

Kedua sifat tersebut menjawab persoalan yang dirumuskan pada subbab I.2. Determinisme menghapus sumber perbedaan hasil perhitungan antar-asesor pada tahap kalkulasi, karena variabel penugasan yang sama, termasuk variabel porsi pengampuan pada Tabel II.1, akan menghasilkan nilai kredit yang sama tanpa bergantung pada pembacaan rubrik maupun hitungan manual masing-masing asesor. Dengan demikian, kompromi berupa perata-rataan nilai tidak lagi diperlukan pada butir yang dihitung kontrak, karena kedua asesor menerima angka dasar yang identik sejak awal. Sifat immutable menjamin pula bahwa Rubrik BKD yang telah ditanam tidak dapat diubah administrator sistem maupun pengembang tanpa penerbitan kontrak baru yang juga tercatat pada blockchain. Oleh karena itu, smart contract menjadi landasan utama pengembangan sistem LedgerDik karena kontrak KalkulatorBKDPendidikan diposisikan sebagai mesin aturan yang mengeksekusi Rubrik BKD unsur pendidikan, bukan sekadar sebagai media penyimpanan hasil perhitungan yang dikerjakan di luar rantai.

---

## II.1.4 Ethereum Virtual Machine (EVM)

**11. [GANTI] Paragraf penutup**

Cari paragraf yang diawali:

> Adanya semantik operasional formal tersebut menjadi dasar teoretis pernyataan bahwa perilaku setiap ...

Ganti seluruh paragraf dengan:

Adanya semantik operasional formal tersebut menjadi dasar teoretis pernyataan bahwa perilaku setiap instruksi EVM terdefinisi secara presisi dan dapat diprediksi. Sifat inilah yang membuat hasil pemanggilan fungsi perhitungan dapat dipertanggungjawabkan sebagai keluaran mesin aturan, bukan sebagai keluaran yang bergantung pada implementasi klien tertentu. Konsekuensi teknis yang perlu diperhatikan adalah keterbatasan EVM pada aritmetika bilangan bulat, karena lingkungan tersebut tidak menyediakan tipe bilangan pecahan. Padahal Rubrik BKD memuat nilai pecahan, misalnya 1,33 SKS bagi pembimbing utama disertasi dan nilai porsi pengampuan yang tidak selalu bulat sebagaimana disebut pada Tabel II.1. Oleh karena itu, EVM menjadi landasan penting dalam pengembangan sistem LedgerDik karena seluruh fungsi perhitungan pada kontrak KalkulatorBKDPendidikan dieksekusi di lingkungan tersebut, dan karena keterbatasan aritmetikanya menjadi alasan langsung penetapan konvensi nilai SKS sebagai bilangan bulat berskala seratus kali, yaitu 1 SKS diwakili nilai 100 dan 1,33 SKS diwakili nilai 133, dengan konversi ke bentuk desimal dilakukan hanya pada saat penyajian.

---

## II.1.6 Fungsi Hash Kriptografi

**12. [JUDUL] Judul subbab**


Ubah judul "Fungsi Hash Kriptografi" menjadi **Fungsi Hash Kriptografi dan Sidik Digital Dokumen**.

**13. [SUNTING] Paragraf ketiga (diawali "Pemanfaatan hash sebagai penanda keaslian ..."), tambah satu kalimat di akhir**

Cari (Ctrl+F):

> sekaligus menjaga kerahasiaan isi dokumen.

Ganti dengan:

> sekaligus menjaga kerahasiaan isi dokumen. Keuntungan kedua yang melekat pada pola tersebut adalah terbentuknya jejak audit, karena setiap pencatatan hash menghasilkan event yang memuat alamat pengirim beserta waktu blok, sehingga urutan peristiwa atas satu dokumen dapat direkonstruksi kemudian.

**14. [GANTI] Paragraf penutup (sekarang tiga titik pemakaian hash, bukan dua)**

Cari paragraf yang diawali:

> Oleh karena itu, fungsi hash kriptografi menjadi landasan penting dalam pengembangan sistem ...

Ganti seluruh paragraf dengan:

Oleh karena itu, fungsi hash kriptografi menjadi landasan penting dalam pengembangan sistem LedgerDik karena dipakai pada tiga titik. Titik pertama, konstanta peran pada kontrak token dan kontrak registri dibentuk melalui keccak256 atas literal teks peran, mengikuti konvensi pustaka kontrol akses yang dipakai. Titik kedua, simpulan penilaian yang telah disahkan kedua asesor diserialisasi menjadi JSON kanonis kemudian di-hash menggunakan Keccak-256, dan nilai hash tersebut dikirimkan sebagai parameter rujukan pada transaksi penerbitan token, sehingga isi simpulan tidak perlu disimpan utuh pada rantai tetapi keasliannya tetap dapat dibuktikan kembali dengan menghitung ulang hash atas dokumen simpulan. Titik ketiga, sidik digital berkas penugasan dan dokumen bukti dihitung dari isi berkas menggunakan SHA-256 kemudian dicatat pada rantai sebagai peristiwa unggah, penerapan, atau penghapusan dokumen, sebagaimana ditetapkan pada ruang lingkup di subbab I.6.1. Pencatatan tersebut menjadikan berkas yang dipakai sistem dapat dibuktikan identik dengan berkas yang pernah diunggah, tanpa memindahkan isi dokumen ke rantai.

---

## II.1.8 Token Non-Transferable

**15. [GANTI] Paragraf penutup**

Cari paragraf yang diawali:

> Ohlhaver, Weyl dan Buterin (2022) sendiri mencatat konsekuensi desain yang perlu dinyatakan ...

Ganti seluruh paragraf dengan:

Ohlhaver, Weyl dan Buterin (2022) sendiri mencatat konsekuensi desain yang perlu dinyatakan secara jujur, yaitu ketidakdapatan-pindahan token kredensial memunculkan persoalan pemulihan akses apabila dompet pemiliknya hilang. Konsekuensi tersebut berlaku pula bagi sistem ini, dan penanganannya melalui pengelolaan dompet kustodian diuraikan pada subbab II.1.9. Oleh karena itu, token non-transferable menjadi landasan penting dalam pengembangan sistem LedgerDik karena tujuan kedua pada subbab I.3 menghendaki kredit SKS berkedudukan sebagai kredensial kinerja yang melekat pada dosen yang bersangkutan, sehingga tidak masuk akal apabila kredit tersebut dapat dipindahkan, diperjualbelikan, atau dihimpun pada satu alamat.

---

## II.1.10 Ekstraksi Tabel pada Berkas PDF

**16. [GANTI] Paragraf penutup (sekarang mencakup SK Pembimbing TA dan variabel porsi pengampuan)**

Cari paragraf yang diawali:

> Oleh karena itu, ekstraksi tabel berbasis posisi menjadi landasan penting dalam pengembangan ...

Ganti seluruh paragraf dengan:

Oleh karena itu, ekstraksi tabel berbasis posisi menjadi landasan penting dalam pengembangan sistem LedgerDik karena tujuan pertama pada subbab I.3 menghendaki variabel penugasan diperoleh langsung dari dokumen sumber tanpa pengetikan ulang, sementara sebagian dokumen penugasan pada subbab I.5 berformat digital dengan tata letak lampiran yang seragam. Dokumen dengan karakteristik tersebut, yaitu Surat Tugas pengajaran, Surat Tugas maupun Surat Keputusan pembimbingan, dan Surat Tugas pengujian, ditangani modul ekstraksi deterministik berbasis Python, sedangkan penanganan dokumen di luar karakteristik itu diuraikan pada subbab II.1.11. Jalur deterministik itu pula yang menyediakan variabel porsi pengampuan pada Tabel II.1, karena komponen teori dan praktik yang dipegang tiap dosen tertulis sebagai kolom tersendiri pada lampiran Surat Tugas pengajaran.

---

## II.1.11 Model Bahasa Visual dan Ekstraksi Informasi Terstruktur

**17. [SUNTING] Paragraf ketiga (diawali "Agar keluaran model dapat diproses program ...")**

Cari (Ctrl+F):

> sebelum hasilnya menimbulkan akibat pada penilaian.

Ganti dengan:

> sebelum hasilnya menimbulkan akibat pada penilaian, sebagaimana ditetapkan pada batasan di subbab I.6.2.

**18. [GANTI] Paragraf penutup**

Cari paragraf yang diawali:

> Oleh karena itu, model bahasa visual menjadi landasan penting dalam pengembangan sistem ...

Ganti seluruh paragraf dengan:

Oleh karena itu, model bahasa visual menjadi landasan penting dalam pengembangan sistem LedgerDik karena kedua pendekatan ekstraksi dipakai secara berdampingan sesuai karakteristik dokumennya, yang selanjutnya disebut strategi ekstraksi hibrida sebagaimana dikehendaki tujuan pertama pada subbab I.3. Jalur deterministik menangani dokumen penugasan berformat digital yang tata letaknya diketahui, sedangkan jalur model bahasa visual menangani Surat Keputusan hasil pemindaian serta dokumen bukti unggahan dosen yang formatnya beragam. Pembagian tersebut menempatkan setiap jalur pada dokumen yang sesuai dengan sifatnya, sehingga determinisme tetap dipertahankan selama karakteristik dokumennya memungkinkan.

---

## II.1.12 Pencocokan Nama Orang

**19. [SUNTING] Paragraf penutup**

Cari (Ctrl+F):

> sehingga penugasan dapat diterapkan pada dosen yang tepat

Ganti dengan:

> sehingga variabel penugasan pada Tabel II.1 diterapkan pada dosen yang tepat

---

## II.1.13 Verifikasi Kesesuaian Isi Dokumen Bukti

**20. [SUNTING] Paragraf ketiga (diawali "Pemeriksaan kesesuaian isi karena itu disusun dalam dua lapis ...")**

Cari (Ctrl+F):

> peran yang menjadi parameter perhitungan kegiatan.

Ganti dengan:

> peran yang menjadi variabel perhitungan kegiatan sebagaimana tercantum pada kelompok kedua Tabel II.1.

**21. [SUNTING] Paragraf keempat (diawali "Karena pembacaan dokumen dilakukan model ...")**

Cari (Ctrl+F):

> keadaan ketika parser gagal membaca dokumen

Ganti dengan:

> keadaan ketika modul ekstraksi gagal membaca dokumen

**22. [GANTI] Paragraf penutup (tambatan diganti dari I.2 ke I.6.1 dan I.6.2)**

Cari paragraf yang diawali:

> Oleh karena itu, verifikasi kesesuaian isi menjadi landasan penting dalam pengembangan sistem ...

Ganti seluruh paragraf dengan:

Oleh karena itu, verifikasi kesesuaian isi menjadi landasan penting dalam pengembangan sistem LedgerDik karena ruang lingkup pada subbab I.6.1 menetapkan pemeriksaan dokumen bukti sebagai modul tersendiri, sedangkan batasan pada subbab I.6.2 menegaskan bahwa pemeriksaan tersebut dibatasi pada kesesuaian isi berupa nama dan peran. Pembatasan itu bukan kekurangan yang tidak disadari, melainkan konsekuensi dari pembedaan dua tingkatan di atas, karena keabsahan fisik dokumen seperti stempel dan tanda tangan basah menuntut mekanisme autentikasi yang sama sekali berbeda dan berada di luar lingkup pengembangan ini.

---

## II.1.14 Model Pengembangan Waterfall

**23. [GAMBAR] Gambar II.2 Model Waterfall**


Placeholder "[LENGKAPI GAMBAR: diagram lima tahap model waterfall ...]" diganti gambar dari `docs/gambar/Gambar-II-2-Model-Waterfall.mermaid`. Judul gambar tetap.

**24. [GANTI] Paragraf penutup**

Cari paragraf yang diawali:

> Karakteristik tersebut sesuai dengan sistem yang dikembangkan karena dua alasan. Alasan pertama, ...

Ganti seluruh paragraf dengan:

Karakteristik tersebut sesuai dengan sistem yang dikembangkan karena dua alasan. Alasan pertama, aturan yang menjadi inti sistem, yaitu Rubrik BKD unsur pendidikan beserta daftar variabel perhitungannya pada Tabel II.1, merupakan ketentuan normatif yang telah ditetapkan secara resmi dan tidak berubah selama masa pengembangan, sehingga kebutuhan sistem telah dipahami sejak awal. Alasan kedua, sifat immutable kode smart contract setelah penempatan sebagaimana diuraikan pada subbab II.1.3 menempatkan kontrak pada posisi yang menyerupai sistem kritis dalam pengertian Sommerville (2016), yaitu kekeliruan aturan yang telah ditempatkan tidak dapat diperbaiki dengan menyunting kode, melainkan menuntut penerbitan kontrak baru beserta pemindahan rujukannya. Oleh karena itu, model waterfall menjadi landasan penting dalam pengembangan sistem LedgerDik karena aturan perhitungan menuntut penetapan dan verifikasi yang lengkap pada tahap analisis dan perancangan sebelum kontrak dituliskan, sebagaimana dinyatakan pada subbab I.1, dan penerapan kelima tahapannya beserta kegiatan dan luaran konkret pada setiap tahap diuraikan lebih lanjut pada Bab III, khususnya subbab III.5 mengenai tahapan pelaksanaan pengembangan sistem.

---

## II.1.15 Structured Analysis and Structured Design

**25. [SUNTING] Paragraf pertama**

Cari (Ctrl+F):

> yang pada intinya menerima parameter kegiatan,

Ganti dengan:

> yang pada intinya menerima variabel penugasan pada Tabel II.1,

**26. [SUNTING] Paragraf DFD berjenjang (diawali "DFD disusun secara berjenjang ...")**

Cari (Ctrl+F):

> alur penilaiannya melibatkan banyak aktor dengan kewenangan berbeda,

Ganti dengan:

> alur penilaiannya melibatkan tiga peran pengguna dengan kewenangan berbeda sebagaimana disebut pada subbab I.4,

**27. [SUNTING] Paragraf kamus data (diawali "Elemen data pada kamus data ...")**

Cari (Ctrl+F):

> misalnya sekumpulan parameter yang menjadi masukan

Ganti dengan:

> misalnya sekumpulan variabel yang menjadi masukan

**28. [SUNTING] Paragraf spesifikasi proses (diawali "Penggunaan spesifikasi proses menjadi penting ...")**

Cari (Ctrl+F):

> pengujian unit bagi setiap fungsi perhitungan.

Ganti dengan:

> pengujian unit bagi setiap fungsi perhitungan sebagaimana diuraikan pada subbab II.1.18.

---

## II.1.17 Spesifikasi Persyaratan Perangkat Lunak dan Model Kualitas Produk (SUBBAB BARU)

**29. [BARU] Seluruh subbab II.1.17, lima paragraf**

Sisipkan setelah subbab II.1.16 ERD, dengan judul "Spesifikasi Persyaratan Perangkat Lunak dan Model Kualitas Produk":

Spesifikasi persyaratan perangkat lunak merupakan dokumen yang menyatakan apa yang harus dikerjakan sistem beserta batasan yang mengikat pengerjaannya. Sommerville (2016) membedakan persyaratan fungsional, yaitu pernyataan mengenai layanan yang harus disediakan sistem beserta reaksinya terhadap masukan tertentu, dari persyaratan nonfungsional, yaitu batasan atas layanan maupun fungsi sistem seperti batasan waktu, batasan proses pengembangan, dan batasan yang ditetapkan standar. Sommerville (2016) menegaskan pula bahwa persyaratan nonfungsional kerap lebih menentukan daripada persyaratan fungsional, karena kegagalan memenuhi satu persyaratan nonfungsional dapat menjadikan seluruh sistem tidak terpakai.

Kerangka penyusunan dokumen tersebut mengacu pada IEEE Std 830-1998 tentang praktik yang disarankan bagi spesifikasi persyaratan perangkat lunak (IEEE, 1998). Standar tersebut menetapkan sifat yang harus dipenuhi sebuah spesifikasi agar layak dipakai sebagai acuan pengembangan, yaitu benar, tidak bermakna ganda, lengkap, konsisten, terperingkat menurut kepentingan dan kestabilannya, dapat diverifikasi, dapat dimodifikasi, dan dapat ditelusuri. Sifat dapat ditelusuri itulah yang menjadikan setiap persyaratan dapat dirunut maju menuju rancangan, kode, dan skenario pengujiannya, sekaligus dirunut mundur menuju tujuan pengembangan pada subbab I.3.

Perumusan persyaratan nonfungsional memerlukan acuan aspek mutu agar tidak berhenti pada pernyataan yang tidak terukur. Acuan tersebut disediakan model kualitas produk pada ISO/IEC 25010, yang menguraikan mutu perangkat lunak menjadi sejumlah karakteristik beserta subkarakteristiknya, di antaranya kesesuaian fungsional, efisiensi kinerja, keandalan, keamanan, kapabilitas interaksi, dan kemudahan pemeliharaan (ISO/IEC, 2023). Penguraian tersebut memungkinkan setiap persyaratan nonfungsional ditautkan pada satu karakteristik mutu tertentu, sehingga kriteria penerimaan pada tahap pengujian dapat dirumuskan atas dasar yang sama.

Perlu dinyatakan secara terbuka bahwa tidak seluruh karakteristik pada model tersebut diuji pada pengembangan ini. Pengujian aspek nonfungsional dibatasi pada karakteristik yang benar-benar diterapkan pada sistem, sedangkan karakteristik yang menuntut lingkungan operasional berskala penuh, misalnya pengukuran efisiensi kinerja pada beban nyata satu institusi, berada di luar jangkauan prototipe sebagaimana ditetapkan pada batasan di subbab I.6.2.

Oleh karena itu, kerangka spesifikasi persyaratan beserta model kualitas produk menjadi landasan penting dalam pengembangan sistem LedgerDik karena keduanya menjadi penghubung antara tujuan pengembangan pada subbab I.3 dan kegiatan teknis pada tahap berikutnya, yaitu penetapan persyaratan pada tahap analisis, penurunannya menjadi rancangan dan kode, hingga perumusan kriteria penerimaan pada tahap pengujian, sebagaimana diuraikan pada subbab III.5.1 dan subbab III.5.4.

---

## II.1.18 Pengujian Perangkat Lunak Bertingkat (SUBBAB BARU)

**30. [BARU] Seluruh subbab II.1.18, enam paragraf**

Sisipkan setelah subbab II.1.17, dengan judul "Pengujian Perangkat Lunak Bertingkat":

Pengujian perangkat lunak merupakan kegiatan yang dimaksudkan untuk memperlihatkan bahwa program mengerjakan apa yang dikehendaki sekaligus menemukan cacat sebelum sistem dipakai. Sommerville (2016) menyatakan bahwa pengujian memiliki dua tujuan yang berbeda, yaitu memperlihatkan kepada pengembang dan pelanggan bahwa perangkat lunak memenuhi persyaratannya, dan menemukan keadaan ketika perilaku perangkat lunak keliru atau tidak sesuai spesifikasinya. Tujuan pertama disebut validation testing, yang menuntut penyusunan kasus uji atas masukan yang diharapkan, sedangkan tujuan kedua disebut defect testing, yang justru menuntut penyusunan kasus uji atas masukan tidak lazim maupun kondisi batas.

Sommerville (2016) membagi pengujian pada tahap pengembangan menjadi tiga jenjang yang berbeda cakupannya. Jenjang pertama adalah unit testing, yaitu pengujian atas unit program secara terpisah, misalnya satu fungsi atau satu kelas objek. Jenjang kedua adalah component testing, yaitu pengujian atas beberapa unit yang telah diintegrasikan menjadi komponen, dengan sasaran utama berupa antarmuka antar-unit tersebut. Jenjang ketiga adalah system testing, yaitu pengujian atas sistem secara utuh dengan sasaran interaksi antarkomponen beserta pemenuhan persyaratan fungsional maupun nonfungsionalnya. Sommerville (2016) menekankan bahwa pengujian pada jenjang integrasi berfokus pada cacat yang justru muncul dari interaksi, bukan dari unit penyusunnya yang telah lolos diuji sendiri-sendiri.

Penurunan kasus uji pada ketiga jenjang tersebut dapat ditempuh melalui pendekatan black box, yaitu penyusunan kasus uji berdasarkan spesifikasi masukan dan keluaran yang dikehendaki tanpa memperhatikan struktur internal kode. Pendekatan tersebut sesuai bagi sistem yang aturannya telah dinyatakan normatif, karena hasil yang diharapkan dapat dihitung terlebih dahulu dari rubrik, kemudian dibandingkan terhadap keluaran sistem. Agar hasil pengujian dapat ditinjau kembali, dokumentasinya disusun mengikuti kerangka IEEE Std 829 tentang dokumentasi pengujian perangkat lunak dan sistem (IEEE, 2008), yang menetapkan unsur dokumen mulai dari rencana pengujian, spesifikasi kasus uji, sampai laporan hasilnya.

Sifat determinisme pada smart contract sebagaimana diuraikan pada subbab II.1.3 memberikan konsekuensi khusus pada penetapan kriteria kelulusan. Karena satu himpunan variabel masukan hanya boleh menghasilkan satu nilai kredit, maka pengujian atas fungsi perhitungan tidak mengenal toleransi selisih. Satu kasus uji yang menghasilkan nilai berbeda dari perhitungan manual menurut Rubrik BKD menandakan cacat logika pada penurunan aturannya, bukan sekadar simpangan yang dapat diabaikan.

Perlu dinyatakan secara terbuka bahwa kelulusan seluruh skenario pengujian tidak berarti sistem bebas dari cacat. Jumlah dan variasi skenario yang dapat disusun terbatas dan belum menjangkau seluruh kemungkinan masukan maupun jalur logika, sehingga hasil pengujian membuktikan keberhasilan verifikasi atas skenario yang diuji, bukan menjamin ketiadaan cacat pada skenario yang belum diuji. Keterbatasan tersebut menjadi dasar rekomendasi perluasan cakupan uji pada saran di Bab VI.

Oleh karena itu, pengujian bertingkat menjadi landasan penting dalam pengembangan sistem LedgerDik karena ruang lingkup pada subbab I.6.1 menetapkan pengujian fungsionalitas secara bertingkat sebagai bagian pengembangan, dan karena ketepatan hasil perhitungan merupakan klaim utama yang harus dibuktikan sebelum kredit diterbitkan ke rantai. Penerapan jenjang pengujian tersebut pada sistem LedgerDik beserta jenis pengujian yang dipakai diuraikan pada subbab III.5.4, sedangkan pelaksanaan dan hasilnya diuraikan pada subbab IV.4.

---

## II.2 Karya Ilmiah Sejenis

Isi tabel karya ilmiah sejenis (tujuh baris) **tidak berubah**. Paragraf pengantar dan pembelajaran "Pertama ... Kedua ..." juga tetap.

**31. [SUNTING] Paragraf pembelajaran "Ketiga, Sultana dkk. (2023) ..."**

Cari (Ctrl+F):

> sebagai rujukan transaksi penerbitan token.

Ganti dengan:

> sebagai rujukan transaksi penerbitan token dan melalui pencatatan sidik digital berkas penugasan maupun dokumen bukti sebagaimana diuraikan pada subbab II.1.6.

**32. [GANTI] Paragraf celah pertama**

Cari paragraf yang diawali:

> Berdasarkan analisis kesenjangan terhadap ketujuh karya tersebut, posisi sistem LedgerDik dapat dirumuskan ...

Ganti seluruh paragraf dengan:

Berdasarkan analisis kesenjangan terhadap ketujuh karya tersebut, posisi sistem LedgerDik dapat dirumuskan melalui dua celah yang belum terjawab. Celah pertama berkaitan dengan peran yang dijalankan smart contract. Seluruh karya yang ditinjau menempatkan smart contract sebagai pencatat, penerbit, atau pengendali akses terhadap nilai maupun kredensial yang besarannya telah ditetapkan di luar rantai. Turkanović dkk. (2018) menerbitkan token atas kredit yang nilainya ditetapkan institusi, Ren dkk. (2025) mencatat komponen nilai yang pembobotannya dikonfigurasi institusi, sedangkan Sultana dkk. (2023), Silaghi, Artenie dan Popescu (2025), serta Rustemi dan Dalipi (2026) berperan sebagai lapisan integritas dokumen. Konsekuensinya, jaminan yang diberikan berhenti pada ketakberubahan catatan, sedangkan konsistensi angka yang dicatat tetap bergantung pada proses di luar rantai. Celah tersebut persis merupakan persoalan yang dirumuskan pada subbab I.2 butir pertama, yaitu angka kredit yang lahir dari hitungan manual dan kompromi perata-rataan tetap dapat tercatat rapi tanpa pernah diuji kesesuaiannya terhadap rubrik. Sistem LedgerDik karena itu menempatkan smart contract pada peran yang berbeda, yaitu sebagai mesin aturan yang mengeksekusi Rubrik BKD unsur pendidikan secara deterministik atas variabel penugasan pada Tabel II.1, sehingga konsistensi hasil terjamin sejak tahap perhitungan, bukan hanya pada tahap penyimpanan.

**33. [GANTI] Paragraf celah kedua**

Cari paragraf yang diawali:

> Celah kedua berkaitan dengan keabsahan data yang masuk ke sistem. Seluruh karya ...

Ganti seluruh paragraf dengan:

Celah kedua berkaitan dengan keabsahan data yang masuk ke sistem. Seluruh karya yang ditinjau memperlakukan dokumen maupun nilai yang masuk sebagai masukan yang keabsahannya telah diasumsikan, sehingga fokus jaminan integritasnya berada pada tahap setelah data tercatat. Tidak satu pun di antaranya menurunkan variabel perhitungan langsung dari dokumen penugasan, maupun memeriksa apakah dokumen yang dilampirkan benar-benar memuat identitas pihak yang mengklaimnya beserta peran yang sesuai. Celah tersebut bersifat mendasar, karena catatan yang tidak dapat diubah tetap tidak bernilai apabila yang dicatat sejak awal merupakan klaim yang tidak didukung dokumennya. Sistem LedgerDik menutup celah tersebut dengan menempatkan ekstraksi variabel penugasan langsung dari dokumen sumber dan pemeriksaan kesesuaian isi dokumen bukti sebagai langkah sebelum penilaian ditetapkan, sebagaimana konsep yang diuraikan pada subbab II.1.10 sampai dengan subbab II.1.13 dan sebagaimana dikehendaki tujuan pertama pada subbab I.3.

**34. [SUNTING] Paragraf posisi kebaruan**

Cari (Ctrl+F):

> mengeksekusi perhitungan kredit BKD unsur pendidikan. Peran kedua

Ganti dengan:

> mengeksekusi perhitungan kredit BKD unsur pendidikan menurut porsi pengampuan riil tiap dosen. Peran kedua

---

## Catatan penomoran tabel (akibat sisipan Tabel II.1)

Karena ada tabel baru di II.1.1, tabel lama bergeser satu nomor. Ubah judul tabel **dan** rujukannya di paragraf:

| Tabel | Lama | Baru | Rujukan yang ikut diubah |
| --- | --- | --- | --- |
| Antarmuka Wajib Standar Token ERC-20 | II.1 | II.2 | "dirangkum pada Tabel II.1" dan "Berdasarkan Tabel II.1, empat dari enam" di II.1.7 |
| Ragam Variasi Penulisan Nama | II.2 | II.3 | "disajikan pada Tabel II.2", "Berdasarkan Tabel II.2, keempat", "variasi pada Tabel II.2" di II.1.12 |
| Karya Ilmiah Sejenis | II.3 | II.4 | "dirangkum pada Tabel II.3" di pengantar II.2 |

Urutan disarankan: geser dulu nomor tabel lama dari belakang (II.3 ke II.4, lalu II.2 ke II.3, lalu II.1 ke II.2), baru sisipkan Tabel II.1 yang baru, supaya tidak tertukar.
