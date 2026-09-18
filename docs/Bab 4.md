# **BAB IV** **PEMBAHASAN DAN IMPLEMENTASI SOLUSI**

 	Bab ini memuat dokumentasi teknis pelaksanaan pengembangan sistem LedgerDik beserta hasil setiap tahapannya. Penyajian disusun mengikuti urutan tahapan pengembangan yang telah ditetapkan pada subbab III.5, yaitu analisis dan penetapan spesifikasi persyaratan perangkat lunak, perancangan, implementasi, pengujian, serta *operation* dan *maintenance*. Setiap subbab memaparkan pelaksanaan nyata tahapan tersebut beserta luaran yang dihasilkan, sehingga keterlacakan antara permasalahan yang dirumuskan pada subbab I.2, spesifikasi persyaratan pada dokumen SRS, rancangan, kode program, dan hasil pengujian dapat ditelusuri secara berurutan di dalam satu bab.

## **IV.1	Analisis**

 	Subbab ini memaparkan tahap analisis sebagai langkah awal siklus pengembangan sistem LedgerDik berbasis model *waterfall* sebagaimana ditetapkan pada subbab III.5.1. Tujuan analisis adalah memperoleh pemahaman menyeluruh atas proses penilaian Beban Kerja Dosen bidang pendidikan yang berjalan saat ini, sehingga dapat dirumuskan kebutuhan sistem yang tepat untuk dikembangkan. Berbeda dengan pengembangan yang menggantikan satu sistem informasi tertentu, objek analisis pada Tugas Akhir ini adalah rangkaian prosedur kerja penilaian BKD yang berlangsung di tingkat jurusan, yaitu pengadaan parameter kegiatan, perhitungan kredit, dan pencatatan hasil, sebagaimana ditetapkan sebagai objek pengembangan pada subbab III.3.

 	Kegiatan analisis pada subbab ini mencakup lima hal. Pertama, analisis sistem berjalan berupa penelusuran proses pelaporan kegiatan oleh dosen, proses penilaian oleh asesor, dan proses perhitungan kredit yang berlaku saat ini. Kedua, penarikan kesimpulan analisis berupa identifikasi keterbatasan proses berjalan beserta usulan pemecahan masalahnya. Ketiga, analisis sistem yang akan dikembangkan, yang menurunkan hasil identifikasi kebutuhan memakai kerangka *environment*, *items produced*, *functions*, dan *modes of operation*, disertai justifikasi pemilihan metode dan teknologinya. Keempat, analisis Rubrik BKD unsur pendidikan untuk menetapkan butir aturan yang dapat diotomatisasi. Kelima, penetapan *requirement* yang dihubungkan ke dokumen SRS pada Lampiran 1. Alat bantu yang dipakai pada kegiatan ini meliputi wawancara dengan asesor BKD, pembacaan Rubrik BKD pada PO BKD 2021, penelaahan dokumen penugasan yang dihimpun sebagaimana dirinci pada Tabel III.1, serta perangkat pemodelan kebutuhan.

### **IV.1.1	Analisis Sistem Berjalan**

 	Sistem berjalan yang diamati pada Tugas Akhir ini adalah prosedur penilaian BKD bidang pendidikan yang berlaku di Jurusan Teknik Komputer dan Informatika Politeknik Negeri Bandung. Pengamatan dilaksanakan melalui wawancara dengan asesor BKD (Nurjannah, 2026) serta pembacaan ketentuan normatif pada Pedoman Operasional Beban Kerja Dosen (Kepdirjendikti, 2021). Terhadap prosedur tersebut, hal yang dianalisis meliputi mekanisme kerja, pihak yang terlibat, data yang mengalir, serta keterbatasan yang muncul pada setiap tahapnya. Analisis dipecah menjadi tiga proses berurutan sesuai objek pengembangan pada subbab III.3, yaitu pelaporan kegiatan oleh dosen, penilaian oleh asesor, dan perhitungan kredit kegiatan.

#### **IV.1.1.1	Analisis Proses Pelaporan Kegiatan BKD Pendidikan**

 	Proses pelaporan diawali penerbitan dokumen penugasan berupa Surat Tugas (ST) dan Surat Keputusan (SK) oleh Ketua Jurusan atau Direktur. Dokumen tersebut memuat lampiran berbentuk tabel yang merinci penugasan setiap dosen, misalnya mata kuliah beserta kelas yang diampu, mahasiswa yang dibimbing, atau organisasi kemahasiswaan yang dibina. Pada akhir semester, setiap dosen menyusun laporan BKD dengan cara membaca kembali dokumen penugasan yang diterimanya, kemudian mengetikkan ulang parameter kegiatan ke dalam formulir laporan beserta lampiran dokumen bukti pelaksanaannya.

 	Pengetikan ulang tersebut merupakan titik lemah pertama. Parameter yang menentukan besaran kredit, yaitu bobot mata kuliah, jumlah pertemuan, jumlah mahasiswa yang dibimbing, dan peran dosen pada kegiatan pembimbingan, seluruhnya bersumber dari ingatan dan pembacaan manual dosen atas dokumennya sendiri. Tidak terdapat mekanisme yang menautkan angka pada formulir laporan kembali ke baris tertentu pada lampiran dokumen penugasan. Masukan, proses, dan keluaran pada tahap ini dirangkum pada Tabel IV.1.

Tabel IV.1. Masukan, Proses, dan Keluaran Proses Pelaporan Kegiatan BKD Pendidikan


| Aspek    | Rincian                                                                                                                                                                                                                                                      |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Masukan  | Surat Tugas dan Surat Keputusan penugasan beserta lampirannya; dokumen bukti pelaksanaan kegiatan seperti lembar pengesahan, berita acara bimbingan, dan lembar persetujuan; Rubrik BKD unsur pendidikan sebagai acuan butir kegiatan yang boleh dilaporkan. |
| Proses   | Pembacaan manual lampiran dokumen penugasan oleh dosen; pemilihan butir kegiatan yang sesuai pada Rubrik BKD; pengetikan ulang parameter kegiatan ke formulir laporan; penghimpunan dan pelampiran dokumen bukti.                                            |
| Keluaran | Laporan BKD unsur pendidikan berisi daftar kegiatan beserta parameter yang diketikkan dosen dan berkas bukti yang dilampirkan.                                                                                                                               |

 	Berdasarkan Tabel IV.1, seluruh langkah pada kolom Proses dikerjakan tanpa perantara perangkat lunak yang menautkan keluaran ke masukannya. Akibatnya, kekeliruan pengetikan pada satu parameter tidak dapat dideteksi sistem mana pun sebelum sampai ke tangan asesor, sedangkan dokumen bukti diterima apa adanya tanpa pemeriksaan terhadap identitas pengunggah maupun peran yang diklaimnya.

#### **IV.1.1.2	Analisis Proses Penilaian oleh Asesor**

 	Setiap laporan BKD dinilai dua asesor sebagaimana dipersyaratkan ketentuan penilaian BKD yang berlaku pada institusi. Kedua asesor menilai laporan yang sama secara terpisah, kemudian keduanya menetapkan nilai kredit yang disetujui untuk setiap kegiatan. Wawancara dengan asesor BKD memperlihatkan dua praktik yang menjadi perhatian utama pada analisis ini (Nurjannah, 2026). Praktik pertama, asesor cenderung mempercayai data yang dimasukkan dosen tanpa memeriksa ulang kesesuaiannya terhadap dokumen penugasan, karena pemeriksaan ulang menuntut pembacaan lampiran SK dan ST satu per satu untuk setiap dosen yang dinilai. Praktik kedua, ketika nilai kedua asesor berbeda untuk kegiatan yang sama, perbedaan tersebut diselesaikan melalui perata-rataan. Masukan, proses, dan keluaran pada tahap ini disajikan pada Tabel IV.2.

Tabel IV.2. Masukan, Proses, dan Keluaran Proses Penilaian BKD oleh Asesor


| Aspek    | Rincian                                                                                                                                                                                                                                                            |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Masukan  | Laporan BKD beserta parameter kegiatan yang diisikan dosen; dokumen bukti yang dilampirkan; Rubrik BKD unsur pendidikan sebagai acuan perhitungan.                                                                                                                 |
| Proses   | Pembacaan laporan dan dokumen bukti oleh dua asesor secara terpisah; penetapan nilai kredit per kegiatan menurut penafsiran masing-masing asesor atas Rubrik BKD; perata-rataan nilai apabila kedua asesor menghasilkan angka berbeda; pengesahan hasil penilaian. |
| Keluaran | Hasil penilaian BKD berupa nilai kredit per kegiatan beserta simpulan total dan status pemenuhan beban kerja, yang disimpan sebagai berkas atau catatan pada basis data penyelenggara.                                                                             |

 	Berdasarkan Tabel IV.2, perata-rataan pada kolom Proses menjadi persoalan yang mendasar. Rubrik BKD merupakan ketentuan normatif yang menetapkan satu nilai benar bagi satu himpunan parameter, sehingga perbedaan hasil antar-asesor sesungguhnya menandakan bahwa sekurang-kurangnya satu di antara keduanya keliru menerapkan rubrik. Menyelesaikan perbedaan tersebut dengan perata-rataan menghasilkan angka yang tidak dapat ditelusuri kembali ke butir aturan mana pun pada Rubrik BKD, sehingga hasil penilaian kehilangan dasar normatifnya.

#### **IV.1.1.3	Analisis Proses Perhitungan dan Pencatatan Kredit Kegiatan**

 	Perhitungan kredit kegiatan dikerjakan asesor secara manual dengan cara menerapkan formula pada Rubrik BKD terhadap parameter yang dilaporkan dosen. Rubrik BKD unsur pendidikan memuat dua komponen, yaitu komponen Pendidikan dan komponen Pelaksanaan Pendidikan, dengan setiap butirnya memiliki formula, satuan hasil, dan bukti yang dipersyaratkan (Kepdirjendikti, 2021). Sebagian butir memiliki formula yang bertingkat, misalnya butir pelaksanaan perkuliahan yang mensyaratkan realisasi pertemuan tidak kurang dari separuh rencana dan pembagian bobot menurut porsi dosen pada pengampuan bersama. Hasil akhir perhitungan kemudian dicatat pada berkas rekapitulasi atau basis data penyelenggara. Rincian masukan, proses, dan keluaran tahap ini disajikan pada Tabel IV.3.

Tabel IV.3. Masukan, Proses, dan Keluaran Proses Perhitungan dan Pencatatan Kredit


| Aspek    | Rincian                                                                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Masukan  | Parameter kegiatan yang telah dinilai asesor; formula, bobot, dan ketentuan setiap butir pada Rubrik BKD unsur pendidikan.                                                                                 |
| Proses   | Penerapan formula rubrik atas setiap kegiatan secara manual; penjumlahan kredit seluruh kegiatan; pembandingan total terhadap ambang kewajiban beban kerja; penetapan status memenuhi atau tidak memenuhi. |
| Keluaran | Total kredit BKD unsur pendidikan beserta status pemenuhannya, tercatat pada berkas rekapitulasi atau basis data yang dikelola penyelenggara.                                                              |

 	Berdasarkan Tabel IV.3, keluaran proses ini tersimpan sepenuhnya pada penyimpanan yang dikendalikan penyelenggara. Konsekuensinya, penelusuran rekam penilaian bergantung pada administrator basis data, sehingga dosen yang dinilai maupun pihak yang diberi wewenang institusi tidak memiliki jalur verifikasi yang mandiri (Silaghi, Artenie dan Popescu, 2025). Rangkaian ketiga proses tersebut beserta pelakunya digambarkan sebagai diagram alir pada Gambar IV.1 dan Gambar IV.2.

**[SISIPKAN GAMBAR: diagram alir proses penilaian BKD yang berjalan, bagian pertama, mencakup penerbitan dokumen penugasan hingga penyerahan laporan BKD oleh dosen]**

Gambar IV.1. Diagram Alir Sistem Berjalan Bagian Pertama

**[SISIPKAN GAMBAR: diagram alir proses penilaian BKD yang berjalan, bagian kedua, mencakup penilaian oleh dua asesor, perata-rataan nilai, hingga pencatatan hasil]**

Gambar IV.2. Diagram Alir Sistem Berjalan Bagian Kedua

 	Berdasarkan Gambar IV.1 dan Gambar IV.2, prosedur berjalan sesungguhnya telah lengkap secara administratif, yaitu memiliki dokumen sumber, pelaku yang jelas, penilaian berlapis dua asesor, dan luaran berupa simpulan beban kerja. Keunggulan dan keterbatasan prosedur tersebut dirangkum pada Tabel IV.4.

Tabel IV.4. Keunggulan dan Keterbatasan Sistem Berjalan


| Aspek               | Keunggulan                                                                                  | Keterbatasan                                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Dasar hukum         | Seluruh butir kegiatan dan formulanya bersumber dari ketentuan resmi yang berlaku nasional. | Penerapan formula bergantung pada penafsiran asesor, sehingga ketentuan yang sama dapat menghasilkan angka berbeda.     |
| Pengadaan parameter | Dokumen penugasan terbit resmi dan memuat seluruh parameter yang dibutuhkan.                | Parameter dipindahkan ke laporan melalui pengetikan ulang, tanpa penautan ke baris dokumen sumbernya.                   |
| Pemeriksaan bukti   | Rubrik BKD telah menetapkan jenis bukti yang dipersyaratkan pada setiap butir.              | Kesesuaian isi bukti terhadap identitas pengunggah dan peran yang diklaim tidak diperiksa.                              |
| Penilaian           | Melibatkan dua asesor sehingga terdapat pemeriksaan berlapis.                               | Perbedaan hasil kedua asesor diselesaikan melalui perata-rataan yang bukan penerapan rubrik.                            |
| Pencatatan hasil    | Hasil tersimpan dan dapat direkapitulasi penyelenggara.                                     | Penelusuran bergantung pada administrator basis data, tanpa jalur verifikasi mandiri bagi dosen maupun pihak berwenang. |

 	Berdasarkan Tabel IV.4, kelima keterbatasan pada kolom terakhir seluruhnya bermuara pada satu pola yang sama, yaitu tidak adanya perantara yang menegakkan hubungan antara dokumen sumber, parameter, formula, dan hasil akhir. Pola tersebut menjadi dasar penarikan kesimpulan analisis pada subbab IV.1.2.

### **IV.1.2	Kesimpulan Analisis dan Usulan Pemecahan Masalah**

 	Berdasarkan analisis terhadap sistem berjalan pada subbab IV.1.1, dapat disimpulkan bahwa prosedur penilaian BKD bidang pendidikan yang berlaku saat ini belum menjamin bahwa nilai kredit yang diterbitkan merupakan penerapan Rubrik BKD atas penugasan yang sebenarnya. Keterbatasan tersebut dapat diringkas ke dalam lima poin berikut.

1. Parameter tidak tertaut ke dokumen sumbernya

Parameter kegiatan berpindah dari lampiran SK dan ST ke formulir laporan melalui pengetikan ulang, sedangkan asesor cenderung mempercayai data tersebut tanpa pemeriksaan ulang ke dokumen sumber (Nurjannah, 2026). Akibatnya, nilai kredit dapat menyimpang dari penugasan yang sebenarnya tanpa terdeteksi pada tahap mana pun.

2. Kesesuaian isi dokumen bukti tidak diperiksa

Dokumen bukti diterima sebagai lampiran tanpa pemeriksaan terhadap nama pemilik akun pengunggah maupun peran yang diklaim pada kegiatan. Kondisi ini membuka peluang diterimanya bukti milik dosen lain maupun klaim peran yang berbeda dengan isi dokumen, padahal peran merupakan parameter penentu besaran kredit pada butir pembimbingan (Kepdirjendikti, 2021).

3. Perhitungan tidak konsisten antar-asesor

Perhitungan manual atas formula rubrik yang bertingkat menghasilkan nilai berbeda antar-asesor untuk kegiatan yang sama, dan perbedaan tersebut diselesaikan melalui perata-rataan (Nurjannah, 2026). Angka hasil perata-rataan tidak dapat ditelusuri kembali ke butir aturan mana pun pada Rubrik BKD.

4. Hasil penilaian tidak dapat diverifikasi secara mandiri

Rekam hasil penilaian tersimpan sepenuhnya pada penyimpanan yang dikendalikan penyelenggara, sehingga penelusurannya bergantung pada administrator basis data dan tidak dapat diverifikasi pihak di luar penyelenggara (Silaghi, Artenie dan Popescu, 2025).

5. Tahapan tersebar pada sarana yang terpisah

Pembacaan dokumen penugasan, pemasukan data, perhitungan kredit, dan pengesahan hasil dikerjakan pada sarana yang berbeda dan tidak saling terhubung, sehingga keterkaitan antara dokumen sumber, parameter, dan nilai yang diterbitkan sulit ditelusuri sebagai satu rangkaian.

 	Sebagai usulan pemecahan masalah, dikembangkan sistem LedgerDik, yaitu sistem penilaian BKD bidang pendidikan berbasis web yang memindahkan aturan perhitungan Rubrik BKD ke dalam *smart contract* pada jaringan *blockchain* berbasis EVM, sekaligus menarik parameter kegiatan langsung dari dokumen penugasan dan memeriksa kesesuaian dokumen bukti terhadap klaim dosen. Pemetaan setiap keterbatasan terhadap fitur yang dikembangkan disajikan pada Tabel IV.5.

Tabel IV.5. Pemetaan Keterbatasan Sistem Berjalan terhadap Fitur Sistem LedgerDik


| Keterbatasan                                            | Fitur Usulan                                            | Cara Kerja Ringkas                                                                                                                                                                                                                                                                                              |
| --------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parameter tidak tertaut ke dokumen sumbernya            | Ekstraksi dokumen penugasan dua jalur                   | Berkas SK dan ST diunggah administrator, dibaca layanan ekstraksi, ditampilkan sebagai pratinjau pemetaan yang dapat dikoreksi, kemudian diterapkan menjadi kegiatan dosen dengan berkas sumber terlampir sebagai bukti.                                                                                        |
| Kesesuaian isi dokumen bukti tidak diperiksa            | Pemeriksaan keaslian dokumen bukti                      | Dokumen bukti pada rumpun kegiatan pembimbingan dibaca model bahasa visual untuk mengenali nama orang beserta perannya, lalu dicocokkan terhadap nama pemilik akun dan peran yang diklaim; hasilnya disajikan kepada asesor sebagai temuan.                                                                     |
| Perhitungan tidak konsisten antar-asesor                | *Smart contract* kalkulator BKD pendidikan              | Setiap butir aturan Rubrik BKD diwujudkan sebagai satu fungsi murni pada kontrak yang mengeksekusi formula secara deterministik atas parameter kegiatan.                                                                                                                                                        |
| Hasil penilaian tidak dapat diverifikasi secara mandiri | Token kredit SKS*non-transferable* dan registri dokumen | Kredit yang telah disahkan kedua asesor diterbitkan sebagai token ERC-20 yang tidak dapat dipindahkan ke alamat*wallet* dosen dengan *hash* simpulan sebagai referensi transaksi, sedangkan sidik digital setiap berkas dicatat pada kontrak registri sehingga dapat ditelusuri melalui penjelajah blok publik. |
| Tahapan tersebar pada sarana yang terpisah              | Aplikasi web terpadu berbasis peran                     | Seluruh tahapan mulai dari unggah dokumen penugasan, klaim kegiatan oleh dosen, pemeriksaan bukti, penilaian dua asesor, hingga penerbitan kredit dijalankan pada satu aplikasi dengan pembatasan akses per peran dan gerbang aksi per fase periode.                                                            |

 	Berdasarkan Tabel IV.5, kelima fitur usulan tidak berdiri sendiri melainkan membentuk satu rantai yang berurutan, yaitu parameter diperoleh dari dokumen, bukti diperiksa terhadap klaim, kredit dihitung kontrak, hasil diterbitkan sebagai token, dan seluruhnya dijalankan pada satu aplikasi. Penurunan rantai tersebut menjadi kebutuhan sistem yang terukur diuraikan pada subbab IV.1.3.

### **IV.1.3	Analisis Sistem yang Akan Dikembangkan**

 	Berdasarkan kesimpulan analisis dan usulan pemecahan masalah pada subbab IV.1.2, pada subbab ini diuraikan analisis kebutuhan sistem yang akan dikembangkan. Analisis disajikan melalui kerangka identifikasi kebutuhan yang meliputi *environment*, *items produced*, *functions*, dan *modes of operation*, kemudian dilanjutkan dengan justifikasi pemilihan metode dan teknologi yang dipakai untuk menjalankan setiap proses, serta ditutup dengan pemodelan alur proses sistem yang diusulkan.

#### **IV.1.3.1	Identifikasi Kebutuhan Sistem yang Akan Dikembangkan**

1. *Environment*

Pihak eksternal yang berinteraksi dengan sistem LedgerDik diidentifikasi sebagaimana dirangkum pada Tabel IV.6. Pihak-pihak tersebut berperan sebagai sumber masukan, tujuan keluaran, atau keduanya. Batas sistem ditetapkan mencakup aplikasi web beserta basis data operasionalnya dan layanan ekstraksi dokumen, sedangkan ketiga *smart contract* diperlakukan sebagai entitas eksternal karena berjalan pada jaringan *blockchain* publik yang berada di luar kendali institusi dan tetap ada meskipun aplikasi dihentikan.

Tabel IV.6. Identifikasi *Environment* Sistem LedgerDik


| Pihak Eksternal                            | Peran terhadap Sistem                                                                                                                                                                                                                                                                                                                                                                                                |    Arah Interaksi    |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------: |
| Dosen                                      | Pihak yang dinilai sekaligus pelapor kegiatan. Dosen mengirimkan kredensial, data kegiatan beserta parameternya, dokumen bukti, penarikan kegiatan ke dokumen BKD, dan status capaian; sistem mengembalikan daftar kegiatan beserta nilai kredit, status penilaian, catatan asesor, simpulan, dan rekapitulasi.                                                                                                      | Masukan dan keluaran |
| Asesor                                     | Pihak yang menilai dan mengesahkan. Asesor mengirimkan kredensial, nilai kredit yang disetujui, catatan penilaian, permintaan pemeriksaan ulang dokumen bukti, persetujuan manual atas hasil pemeriksaan, dan pengesahan; sistem mengembalikan daftar dokumen BKD yang ditugaskan, rincian kegiatan, dokumen bukti beserta hasil pemeriksaannya, dan hasil perhitungan kontrak.                                      | Masukan dan keluaran |
| Administrator                              | Pengelola sistem di tingkat jurusan. Administrator mengirimkan kredensial, data pengguna, permintaan penetapan*wallet*, data periode beserta rentang fasenya, penugasan asesor, berkas SK dan ST, koreksi hasil ekstraksi, dan instruksi koreksi token; sistem mengembalikan daftar pengguna, pratinjau pemetaan, status penerapan dokumen, riwayat transaksi, log *blockchain*, registri dokumen, dan rekapitulasi. | Masukan dan keluaran |
| *Smart Contract* Kalkulator BKD Pendidikan | Mesin aturan yang mengeksekusi formula Rubrik BKD. Sistem mengirimkan nama fungsi perhitungan beserta parameter kegiatan; kontrak mengembalikan nilai kredit pada skala kali seratus atau menolak pemanggilan disertai alasan.                                                                                                                                                                                       | Masukan dan keluaran |
| *Smart Contract* Token SKS                 | Pengelola siklus hidup kredit yang telah disahkan. Sistem mengirimkan alamat*wallet* tujuan, jumlah token, referensi berupa *hash* simpulan, dan instruksi penghapusan; kontrak mengembalikan *transaction hash*, saldo per alamat, dan riwayat *event*.                                                                                                                                                             | Masukan dan keluaran |
| *Smart Contract* Registri Dokumen          | Pencatat jejak keberadaan berkas. Sistem mengirimkan sidik digital berkas, jenis aksi, dan referensi baris asalnya; kontrak mengembalikan*transaction hash* dan riwayat *event* pencatatan.                                                                                                                                                                                                                          | Masukan dan keluaran |
| Layanan Model Bahasa Visual                | Penafsir dokumen yang tidak dapat dibaca secara deterministik. Sistem mengirimkan citra halaman dokumen beserta instruksi skema keluaran; layanan mengembalikan hasil penafsiran dalam format JSON terstruktur.                                                                                                                                                                                                      | Masukan dan keluaran |

2. *Items Produced*

Berdasarkan interaksi dengan pihak eksternal pada Tabel IV.6, data yang mengalir pada sistem diklasifikasikan menjadi data masukan, data yang diproses secara internal, dan data keluaran, sebagaimana dirangkum pada Tabel IV.7.

Tabel IV.7. Identifikasi *Items Produced* pada Sistem LedgerDik


| Kategori Data                      | Rincian                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Data masukan dari eksternal        | Kredensial berupa surel dan kata sandi; data pengguna beserta kode dosen dan nomor induk registrasi asesor; data periode BKD beserta rentang fase pengisian, penilaian, dan perbaikan; berkas SK dan ST berformat PDF; koreksi administrator atas baris hasil ekstraksi; parameter kegiatan yang diisikan dosen; berkas dokumen bukti maupun tautannya; nilai kredit yang disetujui, catatan, dan status dari setiap asesor; alasan koreksi token; serta keluaran JSON layanan model bahasa visual.                                                                                                                                                                                               |
| Data yang diproses secara internal | Verifikasi kata sandi terhadap*hash* bcrypt dan penerbitan sesi berbasis JWT; penentuan fase berjalan dari rentang tanggal periode beserta nilai penggantian manualnya; penghitungan *hash* SHA-256 atas isi berkas; pemetaan baris hasil ekstraksi menjadi kegiatan beserta pencocokan berjenjang ke akun dosen; penggabungan koreksi administrator di atas keluaran parser tanpa mengubah keluaran aslinya; pemanggilan fungsi perhitungan pada kontrak kalkulator; pencocokan nama dan peran pada dokumen bukti; perata-rataan nilai kedua asesor per kegiatan; penghitungan *hash* keccak-256 atas muatan simpulan; serta konversi nilai kredit dari skala kali seratus menjadi satuan token. |
| Data keluaran ke eksternal         | Antarmuka web per peran beserta pesan hasil aksi; pratinjau pemetaan dokumen beserta temuan validasi; nilai kredit hasil perhitungan kontrak; hasil pemeriksaan dokumen bukti beserta daftar nama dan peran yang terbaca; simpulan BKD beserta status pemenuhannya; token kredit SKS pada alamat*wallet* dosen; *event* pencatatan dokumen pada registri; riwayat transaksi beserta *transaction hash*; serta rekapitulasi kredit per dosen dan per periode.                                                                                                                                                                                                                                      |

3. *Functions*

Untuk menyikapi data masukan dan menghasilkan keluaran sebagaimana dirangkum pada Tabel IV.7, sistem harus menyediakan dua belas proses utama, yaitu:

1. Autentikasi pengguna dan otorisasi akses berbasis peran;
2. Pengelolaan pengguna beserta penetapan alamat *wallet* kustodian;
3. Pengelolaan periode BKD beserta penentuan fase yang sedang berjalan;
4. Penugasan dua asesor pada setiap dokumen BKD;
5. Pengelolaan data referensi kegiatan beserta pemetaannya ke fungsi perhitungan;
6. Ekstraksi dokumen SK dan ST beserta pemetaan, koreksi, dan penerapannya menjadi kegiatan dosen;
7. Pengelolaan kegiatan, dokumen bukti, dan dokumen BKD oleh dosen;
8. Perhitungan kredit kegiatan melalui pemanggilan *smart contract* kalkulator;
9. Penilaian dan pengesahan oleh dua asesor, pembentukan simpulan, serta penerbitan token kredit;
10. Koreksi token, penelusuran log *blockchain*, dan penyajian rekapitulasi BKD;
11. Verifikasi keaslian dokumen bukti beserta peninjauan dan persetujuan manualnya oleh asesor;
12. Pencatatan jejak dokumen pada registri *on-chain* beserta penyajian riwayatnya.

Kedua belas proses tersebut dimodelkan sebagai dua belas proses utama pada *Data Flow Diagram* level 1 yang dirancang pada subbab IV.2.2.2. Pemodelan berjenjang tersebut menggantikan peran *Use Case Diagram* pada dokumen yang memakai pendekatan berorientasi objek, sesuai batasan perancangan DC-15 pada dokumen SRS di Lampiran 1.

4. *Modes of Operation*

Metode, teknik, dan teknologi yang dibutuhkan untuk menjalankan kedua belas proses tersebut beserta waktu pengoperasiannya dirangkum pada Tabel IV.8.

Tabel IV.8. Identifikasi *Modes of Operation* Sistem LedgerDik


| No. | Nama Proses                               | Metode, Teknik, atau Teknologi                                                                                         | Cara Memproduksi Keluaran                                                                                                                                                                | Waktu Pengoperasian                                                   |
| :---: | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| 1. | Autentikasi dan otorisasi                 | NextAuth.js*credentials provider*, bcrypt, JSON Web *Token*, dan *middleware* Next.js                                  | Memverifikasi kata sandi terhadap*hash* bcrypt, menerbitkan sesi berisi peran, lalu menyaring setiap permintaan halaman menurut prefiks rutenya.                                         | Saat masuk dan pada setiap navigasi halaman terlindungi               |
| 2. | Pengelolaan pengguna dan*wallet*          | Prisma ORM dan derivasi kunci hierarkis BIP-32 dan BIP-44 melalui Ethers.js                                            | Menyimpan data pengguna, lalu menurunkan alamat*wallet* dari satu frasa induk peladen pada indeks yang unik per dosen.                                                                   | Saat administrator menambah pengguna atau menetapkan*wallet*          |
| 3. | Pengelolaan periode dan fase              | Perbandingan tanggal berbasis rentang dengan nilai penggantian manual                                                  | Menentukan fase berjalan dari rentang tanggal periode aktif, atau memakai nilai penggantian apabila terisi.                                                                              | Setiap kali halaman atau*server action* memeriksa gerbang aksi        |
| 4. | Penugasan asesor                          | Transaksi basis data dengan batasan keunikan pasangan dokumen dan urutan                                               | Menyimpan dua penugasan berbeda pada satu dokumen BKD dalam satu transaksi agar pertukaran slot tidak melanggar batasan keunikan.                                                        | Saat administrator menugaskan asesor, satu per satu maupun massal     |
| 5. | Pengelolaan referensi kegiatan            | Data acuan bertipe dokumen semi-terstruktur pada PostgreSQL                                                            | Menyajikan butir aturan beserta skema parameter dan nama fungsi kontraknya sebagai data acuan baca saja.                                                                                 | Saat pembentukan formulir kegiatan dan saat perhitungan               |
| 6. | Ekstraksi dokumen penugasan               | pdfplumber untuk berkas digital dan rasterisasi pypdfium2 beserta penafsiran model bahasa visual untuk berkas pindaian | Membaca lampiran dokumen menjadi baris penugasan terstruktur, memetakannya menjadi calon kegiatan, lalu menerapkannya secara idempoten per baris.                                        | Saat administrator mengunggah dan menerapkan dokumen                  |
| 7. | Pengelolaan kegiatan dan dokumen BKD      | *Server action* Next.js di atas Prisma ORM dengan gerbang fase                                                         | Menyimpan kegiatan beserta parameternya, menautkan dokumen bukti, dan menandai kegiatan yang diklaim ke dokumen BKD periode berjalan.                                                    | Saat fase pengisian dan fase perbaikan berjalan                       |
| 8. | Perhitungan kredit kegiatan               | Pemanggilan fungsi murni pada*smart contract* melalui JSON-RPC dengan Ethers.js                                        | Memetakan parameter kegiatan menjadi argumen fungsi kontrak, lalu menyimpan nilai kredit yang dikembalikan pada skala kali seratus.                                                      | Setiap kali kegiatan disimpan atau parameternya berubah               |
| 9. | Penilaian, simpulan, dan penerbitan token | Penyimpanan penilaian per asesor, perata-rataan nilai,*hash* keccak-256, dan transaksi *mint* pada kontrak token       | Menyimpan penilaian kedua asesor berdampingan, membentuk simpulan setelah keduanya mengesahkan, lalu menerbitkan token ke alamat*wallet* dosen dengan *hash* simpulan sebagai referensi. | Saat fase penilaian dan fase perbaikan berjalan                       |
| 10. | Koreksi token dan pelaporan               | Transaksi*burn* pada kontrak token dan pembacaan *event* berjenjang                                                    | Mengurangi saldo token disertai alasan, lalu membaca riwayat*event* dengan memecah rentang blok menjadi potongan berukuran tetap.                                                        | Saat administrator melakukan koreksi atau membuka log                 |
| 11. | Verifikasi keaslian dokumen bukti         | Penafsiran citra halaman oleh model bahasa visual dan pencocokan nama berjenjang                                       | Membaca nama orang beserta perannya pada dokumen, mencocokkannya terhadap nama pemilik akun dan peran yang diklaim, lalu menyimpan hasilnya menyertai dokumen.                           | Saat dokumen bukti diunggah dan saat asesor meminta pemeriksaan ulang |
| 12. | Pencatatan jejak dokumen                  | *Hash* SHA-256 atas isi berkas dan transaksi pencatatan *event* pada kontrak registri                                  | Menghitung sidik digital berkas, lalu memancarkan*event* berisi sidik tersebut beserta jenis aksi dan referensi baris asalnya.                                                           | Saat dokumen diunggah, diterapkan, atau dihapus                       |

#### **IV.1.3.2	Analisis Pemilihan Metode dan Teknologi**

 	Subbab ini menyajikan justifikasi atas pemilihan metode dan teknologi utama yang dipakai untuk menjalankan proses-proses pada Tabel IV.8, khususnya pada komponen yang menjadi pembeda inti sistem. Justifikasi difokuskan pada keputusan yang berkonsekuensi arsitektural, yaitu keputusan yang tidak dapat diubah tanpa mengubah rancangan lapisan sistem secara keseluruhan.

1. Penempatan aturan perhitungan pada *smart contract*

Terdapat tiga alternatif tempat menaruh aturan perhitungan Rubrik BKD, yaitu sebagai fungsi pada lapisan aplikasi web, sebagai prosedur tersimpan pada basis data, atau sebagai fungsi pada *smart contract*. Ketiganya sama-sama mampu menghasilkan angka yang benar. Yang membedakan adalah siapa yang dapat memeriksa bahwa aturan yang berjalan memang aturan yang dijanjikan. Aturan pada lapisan aplikasi maupun basis data dapat diubah penyelenggara tanpa jejak yang dapat diperiksa pihak luar, sedangkan kode *smart contract* bersifat *immutable* setelah ditempatkan dan kode sumbernya dapat diverifikasi pada penjelajah blok publik (Zheng dkk., 2020). Karena permasalahan yang dirumuskan pada subbab I.2 bukan ketiadaan perhitungan melainkan ketiadaan jaminan konsistensi penerapan rubrik, penempatan aturan pada *smart contract* dipilih. Konsekuensi yang diterima adalah perubahan aturan menuntut penempatan ulang kontrak yang menghasilkan alamat baru, sehingga alamat kontrak diperlakukan sebagai konfigurasi lingkungan dan bukan nilai yang ditulis di dalam kode.

2. Perumusan fungsi perhitungan sebagai fungsi murni tanpa penyimpanan status

Seluruh fungsi perhitungan pada kontrak kalkulator dirumuskan sebagai fungsi murni, yaitu fungsi yang keluarannya sepenuhnya ditentukan masukannya dan tidak membaca maupun menulis status kontrak. Pilihan ini memberi tiga keuntungan sekaligus. Pertama, pemanggilan fungsi perhitungan tidak menghasilkan transaksi sehingga tidak menimbulkan biaya *gas*, padahal perhitungan dijalankan ulang setiap kali parameter kegiatan berubah. Kedua, hasil perhitungan tidak dapat dipengaruhi urutan pemanggilan maupun identitas pemanggil, sehingga sifat deterministik yang menjadi alasan pemilihan *smart contract* benar-benar terpenuhi. Ketiga, fungsi tersebut dapat diuji secara terisolasi pada jaringan simulasi lokal tanpa memerlukan basis data maupun antarmuka. Data penilaian yang sesungguhnya tetap disimpan *off-chain* pada basis data institusi, sehingga data pribadi dosen tidak dipublikasikan pada jaringan publik.

3. Representasi nilai kredit sebagai bilangan bulat berskala kali seratus

*Ethereum Virtual Machine* tidak menyediakan tipe bilangan pecahan, sehingga nilai kredit yang mengandung desimal seperti 0,5 SKS dan 1,33 SKS tidak dapat diwakili secara langsung. Nilai kredit direpresentasikan sebagai bilangan bulat pada skala kali seratus di seluruh lapisan internal, yaitu 1,00 SKS ditulis sebagai 100 dan 0,25 SKS ditulis sebagai 25, kemudian diubah menjadi satuan SKS berdesimal hanya pada saat ditampilkan. Skala kali seratus dipilih karena seluruh nilai pada Rubrik BKD unsur pendidikan dapat dinyatakan tepat dengan dua angka desimal. Konsekuensi yang harus diterima adalah seluruh pembagian pada fungsi perhitungan menghasilkan pemotongan ke bawah, sehingga sisa pembagian hilang; konsekuensi tersebut dinyatakan terbuka dan diuji secara khusus pada subbab IV.4.5.

4. Pemilihan jaringan Base Sepolia

Penempatan kontrak pada jaringan utama *Ethereum* menuntut biaya *gas* nyata untuk setiap transaksi penerbitan dan penghapusan token, sedangkan pengembangan pada tahap ini merupakan prototipe fungsional. Base Sepolia dipilih sebagai jaringan sasaran karena merupakan jaringan uji dari jaringan *Layer-2* Base yang dibangun di atas OP Stack, sehingga karakteristik eksekusinya sepadan dengan jaringan produksinya dan biaya transaksinya jauh lebih rendah dibandingkan jaringan *Layer-1* (Base, 2026). Jaringan tersebut juga menyediakan penjelajah blok publik yang mendukung verifikasi kode sumber kontrak, sehingga syarat keterauditan pada butir pertama tetap terpenuhi.

5. Mekanisme *wallet* kustodian

Penerbitan token menuntut setiap dosen memiliki alamat *wallet*. Menuntut dosen mengelola dompet kripto mandiri bertentangan dengan karakteristik pengguna sasaran yang tidak dapat diasumsikan memahami mekanisme kunci privat maupun biaya transaksi. Oleh karena itu dipilih pendekatan *wallet* kustodian, yaitu alamat setiap dosen diturunkan secara deterministik dari satu frasa induk yang disimpan pada peladen memakai struktur jalur turunan baku dompet hierarkis (Wuille, 2012; Palatinus dan Rusnak, 2014), dengan indeks turunan yang unik untuk setiap dosen. Seluruh transaksi *on-chain* ditandatangani peladen, sehingga dosen dan asesor dapat menyelesaikan seluruh alur kerjanya tanpa pernah dihadapkan pada konsep alamat *wallet* maupun penandatanganan transaksi. Konsekuensi yang harus dinyatakan terbuka adalah kendali kriptografis atas *wallet* dosen berada pada penyelenggara sistem, sebagaimana dicatat sebagai persyaratan lain OR-06 pada dokumen SRS.

6. Pembatasan pemindahan token sebagai penanda kredensial

Kredit BKD merupakan pengakuan atas kinerja seorang dosen tertentu, sehingga tidak boleh berpindah tangan. Sifat tersebut diwujudkan dengan menahan seluruh jalur pemindahan antar-alamat yang disediakan standar ERC-20 dan hanya mengizinkan penerbitan serta penghapusan, sejalan dengan gagasan token yang melekat pada pemiliknya (Ohlhaver, Weyl dan Buterin, 2022; Pericàs-Gornals dkk., 2024). Koreksi kredit karenanya diwujudkan sebagai transaksi penghapusan token yang baru disertai alasan, bukan sebagai penghapusan catatan lama pada *blockchain*.

7. Strategi ekstraksi dokumen dua jalur

Dokumen penugasan yang dihimpun terbit dalam dua bentuk yang berbeda karakteristiknya sebagaimana dirinci pada Tabel III.1, yaitu PDF digital dengan lapisan teks utuh dan PDF hasil pemindaian dengan lapisan teks terdegradasi. Menerapkan satu jalur ekstraksi untuk keduanya menghasilkan salah satu dari dua kerugian, yaitu jalur deterministik gagal total pada dokumen pindaian, atau jalur penafsiran model dipakai pada dokumen digital yang sebenarnya dapat dibaca secara pasti sehingga hasil yang seharusnya deterministik menjadi probabilistik. Oleh karena itu ditetapkan dua jalur ekstraksi yang dipilih menurut bentuk dokumennya. Jalur pertama membaca struktur tabel berdasarkan garis bingkai dan posisi kata memakai pdfplumber, sesuai konsep rekonstruksi tabel yang diuraikan pada subbab II.1.10. Jalur kedua merasterisasi halaman menjadi citra lalu menyerahkannya kepada model bahasa visual dengan skema keluaran yang ditentukan, sesuai konsep ekstraksi informasi terstruktur pada subbab II.1.11. Keluaran kedua jalur bermuara pada satu lapisan validasi dan satu tahap koreksi administrator yang sama.

8. Perlakuan hasil pemeriksaan dokumen bukti sebagai temuan

Keluaran model bahasa visual bersifat probabilistik dan tidak menjamin hasil identik pada setiap eksekusi untuk masukan yang sama. Menjadikan keluaran tersebut sebagai penentu diterima atau ditolaknya suatu bukti berarti menyerahkan keputusan penilaian kepada komponen yang tidak deterministik. Oleh karena itu hasil pemeriksaan diperlakukan sebagai temuan yang mengarahkan perhatian asesor, bukan sebagai keputusan penolakan otomatis. Sistem tidak pernah menolak pengunggahan berdasarkan hasil pemeriksaan, dan asesor berwenang menyetujui secara manual apabila hasil pemeriksaan dinilai keliru, dengan hasil pembacaan asli tetap tersimpan sebagai jejak. Ketentuan ini menjadi dasar perumusan persyaratan NFR-14 pada Tabel IV.11.

9. Pencatatan jejak dokumen sebagai *event log* tanpa penyimpanan status

Penelusuran keberadaan berkas menuntut bukti bahwa suatu berkas benar-benar pernah ada pada waktu tertentu dan tidak berubah sesudahnya. Menyimpan berkas itu sendiri pada *blockchain* tidak layak karena berukuran besar dan memuat data pribadi. Pendekatan yang dipilih adalah mencatat hanya sidik digitalnya, yaitu *hash* SHA-256 atas isi berkas untuk berkas yang tersimpan pada peladen dan *hash* keccak-256 atas alamat tautan untuk bukti berupa pranala luar, sejalan dengan pola pengenal ringkas *on-chain* dengan berkas di luar rantai (Sultana dkk., 2023). Kontrak registri dirancang tanpa penyimpanan status sama sekali dan hanya memancarkan *event*, sehingga biaya transaksinya minimal dan waktu kejadiannya cukup dibaca dari *timestamp* blok. Karena pencatatan ini bersifat pelengkap, kegagalannya tidak boleh menggagalkan aksi pengguna, sehingga dijalankan sebagai upaya terbaik yang hasilnya tetap dicatat pada riwayat transaksi baik ketika berhasil maupun gagal.

10. Pemilihan pendekatan analisis dan perancangan terstruktur

Pemodelan kebutuhan dan perancangan memakai pendekatan *structured analysis and structured design* sebagaimana diuraikan pada subbab II.1.15, bukan pendekatan berorientasi objek. Pilihan tersebut diambil karena logika inti sistem berupa aturan perhitungan yang bersifat prosedural dan deterministik, sedangkan *smart contract* kalkulator justru dirancang tanpa status sehingga tidak memiliki objek yang perlu dimodelkan siklus hidupnya. Artefak yang dihasilkan berupa diagram konteks, *Data Flow Diagram* berjenjang, kamus data, spesifikasi proses, dan *structure chart*, sedangkan struktur penyimpanan operasional dimodelkan sebagai *Entity Relationship Diagram* memakai notasi Chen sebagaimana ditetapkan pada subbab II.1.16.

11. Pemilihan tumpukan teknologi aplikasi web

Aplikasi web dikembangkan memakai Next.js dengan *App Router* dan *React Server Components*. Pertimbangan utamanya adalah seluruh operasi *on-chain* harus dieksekusi di sisi peladen agar kunci privat penandatangan tidak pernah terpapar ke peramban. Pendekatan *server action* memungkinkan setiap mutasi data dijalankan sebagai fungsi peladen yang dipanggil langsung dari formulir, sehingga tidak diperlukan lapisan API tersendiri yang justru memperbanyak titik yang harus diamankan. Basis data relasional PostgreSQL dipilih karena kebutuhan relasi antartabel yang kompleks sekaligus dukungan tipe data semi-terstruktur untuk menyimpan keluaran utuh parser sebagai bukti audit, dan diakses melalui Prisma ORM dengan satu berkas skema sebagai sumber kebenaran tunggal beserta migrasi terversi.

#### **IV.1.3.3	Alur Proses Sistem yang Diusulkan**

 	Berdasarkan identifikasi kebutuhan pada subbab IV.1.3.1 dan pemilihan metode serta teknologi pada subbab IV.1.3.2, alur proses sistem yang diusulkan disusun sebagai satu rangkaian yang melintasi tiga peran pengguna dan dibatasi fase periode yang sedang berjalan. Alur tersebut disajikan pada Gambar IV.3 dan Gambar IV.4.

**[SISIPKAN GAMBAR: diagram alir sistem yang diusulkan, bagian pertama, mencakup penyiapan periode dan penugasan asesor oleh administrator, unggah dokumen penugasan, pratinjau pemetaan, koreksi baris, hingga penerapan menjadi kegiatan portofolio dosen]**

Gambar IV.3. Diagram Alir Sistem yang Diusulkan Bagian Pertama

**[SISIPKAN GAMBAR: diagram alir sistem yang diusulkan, bagian kedua, mencakup klaim kegiatan dan unggah bukti oleh dosen, pemeriksaan keaslian bukti, penilaian dua asesor, pembentukan simpulan, hingga penerbitan token kredit]**

Gambar IV.4. Diagram Alir Sistem yang Diusulkan Bagian Kedua

 	Berdasarkan Gambar IV.3 dan Gambar IV.4, terdapat tiga perbedaan mendasar dibandingkan alur berjalan pada Gambar IV.1 dan Gambar IV.2. Perbedaan pertama, parameter kegiatan tidak lagi diketikkan dosen melainkan diturunkan dari lampiran dokumen penugasan, dengan koreksi administrator sebagai tahap yang eksplisit dan terekam sebagai selisih terhadap keluaran parser. Perbedaan kedua, perhitungan kredit tidak lagi dikerjakan asesor melainkan dieksekusi kontrak kalkulator, sehingga penilaian asesor bergeser dari menghitung menjadi memverifikasi kesesuaian parameter terhadap dokumen sumber dan menyetujui hasilnya. Perbedaan ketiga, hasil yang telah disahkan kedua asesor diterbitkan sebagai token pada alamat *wallet* dosen dengan *hash* simpulan sebagai referensi transaksi, sehingga keaslian simpulan dapat dibuktikan pihak luar dengan menghitung ulang *hash* tersebut tanpa mengakses basis data institusi.

### **IV.1.4	Analisis Aturan Penilaian BKD Pendidikan yang Diimplementasikan**

 	Subbab ini menguraikan penurunan Rubrik BKD unsur pendidikan menjadi spesifikasi fungsi perhitungan yang dapat dieksekusi *smart contract*. Penurunan dikerjakan butir per butir dengan satu kriteria penyaring, yaitu determinisme. Suatu butir hanya dapat diotomatisasi apabila nilai kreditnya sepenuhnya ditentukan parameter yang terukur, sehingga himpunan parameter yang sama selalu menghasilkan nilai yang sama. Butir yang nilainya dinyatakan sebagai batas maksimum pada PO BKD 2021 tidak memenuhi kriteria tersebut, karena penetapan nilainya bergantung pada penilaian kualitatif asesor atas mutu luaran (Kepdirjendikti, 2021).

 	Hasil penurunan tersebut diwujudkan sebagai fungsi perhitungan pada kontrak KalkulatorBKDPendidikan. Setiap butir aturan atau setiap kelompok butir yang berpola perhitungan sama diwakili satu fungsi mandiri sesuai batasan perancangan DC-01, sehingga butir yang hanya berbeda pada nilai bobotnya digabungkan ke dalam satu fungsi dengan parameter bertipe enumerasi sebagai pembedanya. Sebagai contoh, butir pembimbingan disertasi, tesis, skripsi, dan laporan akhir studi dengan peran pembimbing utama maupun pembimbing pendamping diwakili satu fungsi hitungPembimbinganTugasAkhir dengan parameter jenis tugas akhir dan peran pembimbing. Keseluruhan fungsi perhitungan yang diimplementasikan beserta formulanya disajikan pada Tabel IV.9.

Tabel IV.9. Fungsi Perhitungan pada Kontrak Kalkulator BKD Pendidikan


| No. | Fungsi Perhitungan                            | Butir Rubrik BKD yang Diwakili                                                    | Parameter                                                                                                      | Formula pada Skala Kali Seratus                                                                                                                                                                                                                              |
| :---: | ----------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. | hitungPendidikanFormalDoktor                  | Mengikuti pendidikan formal program doktor                                        | jumlahSemester                                                                                                 | 1200 dikali jumlahSemester                                                                                                                                                                                                                                   |
| 2. | hitungPelatihanDasar                          | Mengikuti pelatihan dasar atau prajabatan                                         | jumlahSertifikat                                                                                               | 200 dikali jumlahSertifikat                                                                                                                                                                                                                                  |
| 3. | hitungPengajaran                              | Melaksanakan perkuliahan, tutorial, praktikum, studio, atau pembelajaran daring   | sksMataKuliah, jumlahPertemuanRencana, jumlahPertemuanRealisasi, semesterPenuh, teamTeaching, persenPorsiDosen | Bernilai nol apabila realisasi kurang dari separuh rencana atau kegiatan tidak berlangsung satu semester penuh; selain itu sksMataKuliah dikali seratus dikali realisasi dibagi rencana, lalu dikali persenPorsiDosen dibagi seratus bila pengampuan bersama |
| 4. | hitungPendidikanDokterEvaluasiPeserta         | Pendidikan profesi dokter, evaluasi peserta didik                                 | tanpa parameter                                                                                                | 400                                                                                                                                                                                                                                                          |
| 5. | hitungPendidikanDokterKomunikasiSpesialis     | Pendidikan profesi dokter, komunikasi dengan spesialis lain                       | tanpa parameter                                                                                                | 200                                                                                                                                                                                                                                                          |
| 6. | hitungPendidikanDokterPelaksanaanPembelajaran | Pendidikan profesi dokter, pelaksanaan pembelajaran                               | tanpa parameter                                                                                                | 300                                                                                                                                                                                                                                                          |
| 7. | hitungPendidikanDokterKeputusanKlinisAkhir    | Pendidikan profesi dokter, pengambilan keputusan klinis akhir                     | tanpa parameter                                                                                                | 100                                                                                                                                                                                                                                                          |
| 8. | hitungBimbinganSeminarMahasiswa               | Membimbing seminar mahasiswa                                                      | jumlahSemester                                                                                                 | 100 dikali jumlahSemester                                                                                                                                                                                                                                    |
| 9. | hitungBimbinganKKNPKLMagang                   | Membimbing Kuliah Kerja Nyata, Praktik Kerja Lapangan, atau magang                | jumlahSemester                                                                                                 | 200 dikali jumlahSemester                                                                                                                                                                                                                                    |
| 10. | hitungPembimbinganTugasAkhir                  | Membimbing dan ikut membimbing disertasi, tesis, skripsi, dan laporan akhir studi | peran, jenisTugasAkhir, jumlahMahasiswa                                                                        | Nilai per mahasiswa dikali jumlahMahasiswa, dengan nilai per mahasiswa 133 dan 100 untuk disertasi, 100 dan 75 untuk tesis, serta 50 dan 25 untuk skripsi maupun laporan akhir studi, berturut-turut bagi pembimbing utama dan pembimbing pendamping         |
| 11. | hitungPengujiUjianAkhir                       | Bertugas sebagai penguji pada ujian akhir atau ujian profesi                      | peranPenguji, jumlahMahasiswa                                                                                  | 50 dikali jumlahMahasiswa bagi ketua penguji, 25 dikali jumlahMahasiswa bagi anggota penguji                                                                                                                                                                 |
| 12. | hitungPembinaKegiatanMahasiswa                | Membina kegiatan mahasiswa bidang akademik dan kemahasiswaan                      | jumlahSemester                                                                                                 | 200 dikali jumlahSemester                                                                                                                                                                                                                                    |
| 13. | hitungPengembanganProgramKuliah               | Melakukan kegiatan pengembangan program kuliah tatap muka atau daring             | jumlahSemester                                                                                                 | 50 dikali jumlahSemester                                                                                                                                                                                                                                     |
| 14. | hitungPengembanganBahanAjar                   | Mengembangkan bahan ajar berupa buku ajar, modul, atau bahan ajar lain            | jenisBahanAjar, jumlahNaskah, peranTim, jumlahAnggotaTim                                                       | Nilai dasar 500 untuk buku ajar dan modul serta 200 untuk bahan ajar lain, dikali jumlahNaskah, lalu diambil seluruhnya bagi penyusun perseorangan, enam puluh persen bagi ketua tim, atau empat puluh persen dibagi jumlahAnggotaTim bagi anggota tim       |
| 15. | hitungOrasiIlmiah                             | Menyampaikan orasi ilmiah                                                         | jumlahOrasi                                                                                                    | 100 dikali jumlahOrasi                                                                                                                                                                                                                                       |
| 16. | hitungJabatanPimpinanPerguruanTinggi          | Menduduki jabatan pimpinan perguruan tinggi                                       | jabatan, jumlahSemester                                                                                        | Nilai per semester dikali jumlahSemester, dengan nilai per semester 600, 500, 400, 400, 300, dan 300 menurut jenjang jabatan mulai dari rektor hingga kepala bagian program studi                                                                            |
| 17. | hitungMembimbingDosenLebihRendah              | Membimbing dosen yang lebih rendah jabatannya                                     | jenis, jumlahOrang, jumlahSemester                                                                             | 50 dikali jumlahOrang dikali jumlahSemester bagi pencangkokan, 25 dikali jumlahOrang dikali jumlahSemester bagi bimbingan reguler                                                                                                                            |
| 18. | hitungDetaseringPencangkokan                  | Melaksanakan kegiatan detasering dan pencangkokan di luar institusi               | lokasi, jumlahKegiatan                                                                                         | 600 dikali jumlahKegiatan pada institusi berperingkat seratus besar dunia, 300 dikali jumlahKegiatan pada institusi nasional                                                                                                                                 |
| 19. | hitungPendampinganMahasiswaLuarInstitusi      | Melaksanakan pendampingan mahasiswa di luar institusi                             | jenjang, jumlahSemester                                                                                        | 1200 dikali jumlahSemester bagi lektor ke atas, 500 dikali jumlahSemester bagi asisten ahli dan dosen lain                                                                                                                                                   |
| 20. | jumlahkanSKS                                  | Fungsi rekapitulasi, bukan butir rubrik                                           | daftarNilaiSKSX100                                                                                             | Penjumlahan seluruh elemen daftar                                                                                                                                                                                                                            |

 	Berdasarkan Tabel IV.9, kontrak kalkulator memuat sembilan belas fungsi perhitungan ditambah satu fungsi rekapitulasi. Seluruhnya menolak parameter bernilai nol pada besaran pengali dengan memancarkan galat khusus InputTidakValid disertai alasannya, kecuali empat fungsi pendidikan profesi dokter yang memang tidak menerima parameter. Perlu dicatat satu perilaku yang disengaja pada fungsi hitungPengajaran, yaitu realisasi pertemuan kurang dari separuh rencana menghasilkan nilai nol dan bukan penolakan, karena kondisi tersebut merupakan hasil penilaian yang sah menurut Rubrik BKD dan bukan kesalahan masukan.

 	Tidak seluruh fungsi pada Tabel IV.9 dipakai sistem pada penerapan di Jurusan Teknik Komputer dan Informatika. Data referensi kegiatan yang dimuat ke basis data disaring menurut ketersediaan data penugasan yang nyata pada jurusan tersebut, sehingga menghasilkan sebelas butir referensi sebagaimana disajikan pada Tabel IV.10.

Tabel IV.10. Data Referensi Kegiatan yang Dimuat ke Sistem beserta Status Perhitungannya


| No. | Kode Aturan | Seksi Rubrik BKD                                                                  | Fungsi Kontrak                       | Status Perhitungan |
| :---: | :-----------: | ----------------------------------------------------------------------------------- | -------------------------------------- | -------------------- |
| 1. |   EDU001   | Pendidikan formal                                                                 | hitungPendidikanFormalDoktor         | Diotomatisasi      |
| 2. |   EDU101   | A. Melaksanakan perkuliahan, tutorial, dan praktikum                              | hitungPengajaran                     | Diotomatisasi      |
| 3. |   EDU201   | B. Membimbing seminar mahasiswa                                                   | hitungBimbinganSeminarMahasiswa      | Diotomatisasi      |
| 4. |   EDU202   | C. Membimbing Kuliah Kerja Nyata, Praktik Kerja Nyata, dan Praktik Kerja Lapangan | hitungBimbinganKKNPKLMagang          | Diotomatisasi      |
| 5. |   EDU203   | D. Membimbing tugas akhir                                                         | hitungPembimbinganTugasAkhir         | Diotomatisasi      |
| 6. |   EDU301   | E. Bertugas sebagai penguji pada ujian akhir                                      | hitungPengujiUjianAkhir              | Diotomatisasi      |
| 7. |   EDU401   | F. Membina kegiatan mahasiswa                                                     | hitungPembinaKegiatanMahasiswa       | Diotomatisasi      |
| 8. |   EDU402   | F. Membina kegiatan mahasiswa, produk saintifik dan kompetisi                     | tidak dipetakan                      | Ditetapkan asesor  |
| 9. |   EDU501   | G. Mengembangkan program kuliah                                                   | tidak dipetakan                      | Ditetapkan asesor  |
| 10. |   EDU502   | H. Mengembangkan bahan kuliah                                                     | tidak dipetakan                      | Ditetapkan asesor  |
| 11. |   EDU701   | J. Menduduki jabatan pimpinan perguruan tinggi                                    | hitungJabatanPimpinanPerguruanTinggi | Diotomatisasi      |

 	Berdasarkan Tabel IV.10, delapan butir dieksekusi kontrak dan tiga butir nilainya ditetapkan asesor. Ketiga butir yang tidak dipetakan memiliki alasan yang berbeda. Butir EDU402 tidak dipetakan karena nilainya dinyatakan sebagai batas maksimum pada PO BKD 2021 sehingga tidak memenuhi kriteria determinisme, sesuai batasan perancangan DC-02. Butir EDU501 dan EDU502 memiliki fungsi kontrak yang telah ditulis, yaitu hitungPengembanganProgramKuliah dan hitungPengembanganBahanAjar pada Tabel IV.9, namun keduanya sengaja tidak dipautkan pada data referensi karena penilaian kelayakan luaran pengembangan program kuliah dan bahan ajar tetap menuntut pertimbangan asesor atas mutu naskahnya. Kegiatan pada ketiga butir tersebut tetap dapat dilaporkan dosen dan ditandai berstatus perhitungan tidak diotomatisasi.

 	Selisih antara sembilan belas fungsi pada Tabel IV.9 dan sebelas butir referensi pada Tabel IV.10 terdiri atas dua kelompok. Kelompok pertama adalah lima butir yang aturannya telah diimplementasikan pada kontrak namun tidak dimuat ke data referensi karena tidak terdapat data penugasannya di jurusan, yaitu orasi ilmiah, membimbing dosen yang lebih rendah jabatannya, detasering dan pencangkokan, pendampingan mahasiswa di luar institusi, serta pelatihan dasar dan prajabatan. Kelompok kedua adalah empat butir pendidikan profesi dokter yang tidak relevan bagi program studi bidang informatika. Kedelapan fungsi tersebut tetap dipertahankan pada kontrak karena penambahan butir referensi di kemudian hari cukup dilakukan pada data acuan tanpa menempatkan ulang kontrak, sedangkan penempatan ulang kontrak justru mengubah alamatnya. Pembatasan cakupan ini dinyatakan terbuka agar klaim otomatisasi pada laporan ini tidak melampaui butir yang benar-benar dieksekusi sistem, sejalan dengan batasan pada subbab I.6.2.

### **IV.1.5	Penetapan *Requirement* Sistem yang Dikembangkan**

 	Berdasarkan hasil identifikasi kebutuhan pada subbab IV.1.3.1, pemilihan metode dan teknologi pada subbab IV.1.3.2, serta analisis aturan penilaian pada subbab IV.1.4, ditetapkan *requirement* sistem LedgerDik yang terdiri atas persyaratan fungsional (*Functional Requirement*/FR) dan persyaratan nonfungsional (*Non-Functional Requirement*/NFR). Persyaratan fungsional dikelompokkan berdasarkan modul sebagaimana dirangkum pada Tabel IV.11, sedangkan persyaratan nonfungsional dirangkum pada Tabel IV.12 dengan mengacu pada model kualitas produk ISO/IEC 25010 (ISO/IEC, 2023). Penetapan *requirement* ini didokumentasikan secara lengkap dan terstruktur mengikuti kerangka IEEE Std 830-1998 (IEEE, 1998) pada dokumen SRS yang disertakan pada Lampiran 1, beserta batasan sisi klien, batasan perancangan, aturan bisnis, dan spesifikasi prosesnya.

Tabel IV.11. Ringkasan Persyaratan Fungsional per Modul


| Modul                                | Kode FR | Persyaratan Fungsional                                                                                                                                                                                                                                                                                               |
| -------------------------------------- | :-------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Autentikasi dan Otorisasi            |  FR-01  | Sistem harus menyediakan mekanisme masuk memakai surel dan kata sandi, dengan verifikasi kata sandi dilakukan terhadap*hash* yang tersimpan.                                                                                                                                                                         |
|                                      |  FR-02  | Sistem harus membatasi akses halaman berdasarkan peran pengguna dan mengarahkan pengguna ke ruang kerja sesuai perannya.                                                                                                                                                                                             |
|                                      |  FR-32  | Sistem harus menampilkan data profil akun pengguna yang sedang masuk sebagai tampilan baca saja pada ketiga ruang kerja.                                                                                                                                                                                             |
| Pengelolaan Pengguna dan*Wallet*     |  FR-03  | Sistem harus menyediakan penambahan akun pengguna, pengisian kode dosen, pengisian nomor induk registrasi asesor yang unik lintas akun, serta pengaktifan dan penonaktifan akun bagi administrator.                                                                                                                  |
|                                      |  FR-04  | Sistem harus dapat menetapkan alamat*wallet* kustodian bagi dosen yang diturunkan secara deterministik dari frasa induk pada peladen, dengan indeks penurunan yang unik untuk setiap dosen.                                                                                                                          |
| Pengelolaan Periode dan Fase         |  FR-05  | Sistem harus menyediakan penambahan periode BKD beserta rentang fase pengisian, penilaian, dan perbaikan, serta menjamin hanya satu periode berstatus aktif pada satu waktu.                                                                                                                                         |
|                                      |  FR-06  | Sistem harus menentukan fase yang sedang berjalan dan membatasi aksi pengguna sesuai fase tersebut, dengan nilai penggantian manual diutamakan apabila terisi.                                                                                                                                                       |
| Penugasan Asesor                     |  FR-07  | Sistem harus dapat menugaskan dua asesor yang berbeda pada satu dokumen BKD dengan urutan asesor pertama dan kedua, baik satu per satu maupun secara massal.                                                                                                                                                         |
| Referensi Kegiatan                   |  FR-08  | Sistem harus menyediakan daftar referensi kegiatan sesuai Rubrik BKD PO BKD 2021 beserta skema parameter dan pemetaannya ke fungsi perhitungan pada*smart contract*.                                                                                                                                                 |
| Ekstraksi dan Penerapan Dokumen      |  FR-09  | Sistem harus dapat menerima unggahan berkas SK dan ST untuk diekstraksi menjadi baris penugasan terstruktur, dengan jalur ekstraksi yang dipilih sesuai bentuk dokumen.                                                                                                                                              |
|                                      |  FR-10  | Sistem harus menampilkan pratinjau pemetaan baris penugasan menjadi kegiatan beserta temuan validasi dan status pencocokan dosen berupa cocok, ambigu, atau tidak cocok.                                                                                                                                             |
|                                      |  FR-11  | Sistem harus dapat menerima koreksi atau penandaan lewati pada setiap baris hasil ekstraksi tanpa mengubah hasil ekstraksi asli, serta dapat mengembalikan baris ke nilai aslinya.                                                                                                                                   |
|                                      |  FR-12  | Sistem harus dapat menerapkan hasil ekstraksi menjadi kegiatan dosen secara idempoten per baris dan melampirkan berkas sumber sebagai dokumen bukti, tanpa mengubah kegiatan yang telah diklaim dosen.                                                                                                               |
|                                      |  FR-31  | Sistem harus menyediakan penginputan kegiatan berbasis penugasan atas nama seorang dosen bagi administrator, terbatas pada butir aturan yang dasarnya penugasan institusi, dengan kegiatan terbentuk sebagai portofolio yang belum diklaim dan nilai kreditnya dihitung melalui kontrak kalkulator.                  |
| Pengelolaan Kegiatan dan Dokumen BKD |  FR-13  | Sistem harus menyediakan penambahan, penyuntingan, dan penghapusan kegiatan beserta parameternya bagi dosen, dengan isian formulir yang dibangkitkan dari skema parameter butir aturan.                                                                                                                              |
|                                      |  FR-14  | Sistem harus menyediakan pengunggahan dan penghapusan dokumen bukti pada suatu kegiatan, dengan berkas disimpan pada peladen dan basis data hanya menyimpan metadata beserta lokasinya.                                                                                                                              |
|                                      |  FR-15  | Sistem harus dapat menarik kegiatan dari portofolio ke dokumen BKD periode berjalan dan membatalkan klaim tersebut selama kegiatan belum dinilai.                                                                                                                                                                    |
|                                      |  FR-16  | Sistem harus dapat menetapkan status capaian kegiatan sebagai keterangan pendamping nilai kredit.                                                                                                                                                                                                                    |
|                                      |  FR-17  | Sistem harus menyediakan penyimpanan dokumen BKD secara sementara maupun permanen, dengan penyimpanan permanen menjadi prasyarat pengesahan oleh asesor.                                                                                                                                                             |
| Perhitungan Kredit Kegiatan          |  FR-18  | Sistem harus menghitung nilai kredit kegiatan melalui pemanggilan fungsi pada*smart contract* kalkulator berdasarkan parameter kegiatan, dan menyimpan hasilnya beserta status perhitungan.                                                                                                                          |
|                                      |  FR-19  | Sistem harus menandai kegiatan yang butir aturannya tidak diotomatisasi agar nilai kreditnya ditetapkan asesor.                                                                                                                                                                                                      |
| Penilaian dan Pengesahan             |  FR-20  | Sistem harus dapat menerima nilai kredit yang disetujui, jumlah pertemuan keputusan, persentase capaian, status, dan catatan dari setiap asesor pada setiap kegiatan yang ditugaskan kepadanya, dengan satu penilaian per asesor per kegiatan.                                                                       |
|                                      |  FR-21  | Sistem harus dapat mencatat pengesahan penilaian oleh asesor setelah memastikan dokumen BKD telah disimpan permanen dan seluruh kegiatan yang diklaim telah dinilai.                                                                                                                                                 |
| Simpulan dan Penerbitan Token        |  FR-22  | Sistem harus membentuk simpulan BKD berupa total kredit beserta status memenuhi atau tidak memenuhi setelah kedua asesor mengesahkan, dengan nilai per kegiatan dihitung dari perataan nilai kedua asesor.                                                                                                           |
|                                      |  FR-23  | Sistem harus menghitung*hash* kriptografi atas muatan simpulan penilaian dan menggunakannya sebagai referensi transaksi penerbitan token.                                                                                                                                                                            |
|                                      |  FR-24  | Sistem harus menerbitkan token kredit SKS yang bersifat*non-transferable* ke alamat *wallet* dosen dan mencatat *transaction hash* beserta status transaksinya, baik ketika berhasil maupun gagal.                                                                                                                   |
| Koreksi Token dan Pelaporan          |  FR-25  | Sistem harus dapat menghapus token pada alamat*wallet* dosen disertai alasan koreksi, dan mencatat riwayat transaksinya baik ketika berhasil maupun gagal.                                                                                                                                                           |
|                                      |  FR-26  | Sistem harus menampilkan riwayat penerbitan dan penghapusan token yang dibaca langsung dari*blockchain*, dengan pembacaan berjenjang agar tidak melampaui batas rentang blok penyedia RPC.                                                                                                                           |
|                                      |  FR-27  | Sistem harus menampilkan rekapitulasi kredit BKD per dosen dan per periode.                                                                                                                                                                                                                                          |
| Verifikasi Keaslian Dokumen Bukti    |  FR-28  | Sistem harus memeriksa dokumen bukti berformat PDF pada kegiatan rumpun pembimbingan dengan membaca nama orang beserta perannya, mencocokkannya terhadap nama pemilik akun dan peran yang diklaim kegiatan, lalu menyimpan hasilnya menyertai dokumen tanpa menggagalkan pengunggahan ketika layanan tidak tersedia. |
|                                      |  FR-29  | Sistem harus menandai kegiatan yang dokumen buktinya berstatus tidak cocok atau peran tidak sesuai sebagai temuan pada halaman penilaian asesor, dan tidak menandai status yang tidak menyimpulkan apa pun, yaitu tanpa nama dan gagal.                                                                              |
|                                      |  FR-30  | Sistem harus menyediakan pemeriksaan ulang atas satu dokumen bukti bagi asesor, serta persetujuan dan pencabutan persetujuan atas hasil pemeriksaan, tanpa menghapus hasil pemeriksaan asli.                                                                                                                         |
| Registri Dokumen                     |  FR-33  | Sistem harus mencatatkan sidik digital berkas ke kontrak registri pada saat unggahan dokumen penugasan dibuat, diterapkan, dan dihapus, serta pada saat dokumen bukti diunggah dan dihapus, dengan kegagalan pencatatan tidak membatalkan aksi pengguna.                                                             |
|                                      |  FR-34  | Sistem harus menampilkan riwayat pencatatan dokumen yang dibaca langsung dari*blockchain* beserta penautannya ke baris unggahan dokumen atau dokumen bukti yang bersangkutan.                                                                                                                                        |

Tabel IV.12. Ringkasan Persyaratan Nonfungsional


| Kode NFR | Karakteristik ISO/IEC 25010                             | Persyaratan Nonfungsional                                                                                                     | Kriteria Penerimaan                                                                                                                                         |
| :--------: | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  NFR-01  | *Functional suitability* (*functional correctness*)     | Nilai kredit yang dihasilkan sistem harus identik dengan hasil perhitungan manual berdasarkan Rubrik BKD PO BKD 2021.         | Seluruh kasus uji akurasi perhitungan menghasilkan nilai yang sama dengan perhitungan manual.                                                               |
|  NFR-02  | *Reliability* (*maturity*)                              | Hasil perhitungan untuk parameter yang sama harus konsisten pada pemanggilan berulang dan lintas waktu.                       | Pemanggilan berulang fungsi perhitungan dengan parameter identik menghasilkan keluaran identik.                                                             |
|  NFR-03  | *Reliability* (*fault tolerance*)                       | Kegagalan pemanggilan*blockchain* tidak boleh menghilangkan data operasional yang telah tersimpan.                            | Kegagalan transaksi tercatat pada riwayat transaksi dengan status gagal, sedangkan data penilaian tetap tersimpan.                                          |
|  NFR-04  | *Security* (*confidentiality*)                          | Kata sandi pengguna tidak boleh tersimpan dalam bentuk asli, dan kunci privat tidak boleh terpapar ke sisi klien.             | Basis data hanya menyimpan*hash* bcrypt; kunci privat hanya dibaca dari variabel lingkungan di sisi peladen.                                                |
|  NFR-05  | *Security* (*authenticity*)                             | Setiap akses halaman terlindungi harus disertai sesi yang sah dan peran yang sesuai.                                          | Permintaan tanpa sesi diarahkan ke halaman masuk; permintaan dengan peran tidak sesuai diarahkan ke ruang kerja perannya.                                   |
|  NFR-06  | *Security* (*integrity*)                                | Hasil penilaian yang telah disahkan harus dapat dibuktikan keasliannya oleh pihak di luar penyelenggara sistem.               | *Hash* simpulan tercatat pada *event* transaksi dan dapat dihitung ulang dari dokumen simpulan.                                                             |
|  NFR-07  | *Maintainability* (*modularity*)                        | Setiap butir aturan yang diotomatisasi harus terwujud sebagai satu fungsi mandiri yang dapat ditelusuri ke butir aturannya.   | Setiap kode aturan yang diotomatisasi pada data referensi terpetakan ke tepat satu nama fungsi kontrak.                                                     |
|  NFR-08  | *Maintainability* (*testability*)                       | Fungsi perhitungan harus dapat diuji tanpa memerlukan basis data maupun antarmuka.                                            | Fungsi perhitungan dapat dieksekusi pada jaringan simulasi lokal tanpa dependensi lapisan aplikasi.                                                         |
|  NFR-09  | *Usability* (*user error protection*)                   | Aksi yang tidak dapat dibatalkan harus dilindungi konfirmasi eksplisit.                                                       | Penyimpanan permanen dokumen BKD, pengesahan penilaian, penerapan hasil ekstraksi, dan penghapusan token menampilkan dialog konfirmasi sebelum dieksekusi.  |
|  NFR-10  | *Usability* (*operability*)                             | Pengguna harus dapat menyelesaikan alur kerjanya tanpa memahami mekanisme*blockchain*.                                        | Dosen dan asesor tidak diwajibkan memiliki dompet kripto maupun menandatangani transaksi.                                                                   |
|  NFR-11  | *Portability* (*installability*)                        | Sistem harus dapat dipasang pada lingkungan peladen baku dengan langkah yang terdokumentasi.                                  | Sistem berhasil dijalankan mengikuti prosedur pemasangan pada dokumen penyiapan.                                                                            |
|  NFR-12  | *Performance efficiency* (*time behaviour*)             | Pembacaan riwayat*event* dari *blockchain* tidak boleh melampaui batas rentang blok yang diizinkan penyedia RPC.              | Pembacaan*event* dijalankan berjenjang dengan batas rentang blok sehingga tidak menghasilkan galat penyedia RPC.                                            |
|  NFR-13  | *Reliability* (*fault tolerance*)                       | Kegagalan atau ketidaktersediaan layanan pemeriksaan dokumen bukti tidak boleh menggagalkan proses unggah dokumen oleh dosen. | Dokumen tetap tersimpan ketika layanan ekstraksi tidak dapat dihubungi, dengan hasil pemeriksaan tercatat berstatus gagal beserta pesan penyebabnya.        |
|  NFR-14  | *Functional suitability* (*functional appropriateness*) | Hasil pemeriksaan dokumen bukti tidak boleh menjadi penentu tunggal diterima atau ditolaknya suatu bukti.                     | Sistem tidak menolak unggahan berdasarkan hasil pemeriksaan, dan asesor dapat menyetujui hasil pemeriksaan secara manual dengan hasil asli tetap tersimpan. |
|  NFR-15  | *Reliability* (*fault tolerance*)                       | Kegagalan pencatatan pada kontrak registri tidak boleh membatalkan aksi unggah, penerapan, maupun penghapusan dokumen.        | Aksi pengguna tetap tersimpan ketika pencatatan gagal, dengan riwayat transaksi tercatat berstatus gagal beserta alasannya.                                 |

 	Perlu dicatat bahwa kode FR dan NFR pada kedua tabel di atas berfungsi sebagai pengenal tetap, bukan sebagai penanda urutan pelaksanaan. Modul verifikasi keaslian dokumen bukti memperoleh kode FR-28 sampai FR-30 karena dirumuskan setelah dua puluh tujuh persyaratan sebelumnya ditetapkan, meskipun pada alur kerja sistem modul tersebut berjalan di antara pengelolaan kegiatan dan penilaian asesor. Hal yang sama berlaku bagi modul registri dokumen yang memperoleh kode FR-33 dan FR-34.

 	Dengan ditetapkannya persyaratan fungsional dan nonfungsional di atas, hasil tahap analisis ini menjadi dasar bagi tahap perancangan yang diuraikan pada subbab IV.2, sekaligus terdokumentasi secara formal pada dokumen SRS sebagai acuan verifikasi pada tahap pengujian di subbab IV.4.

## **IV.2	Perancangan**

 	Subbab ini menyajikan tahap perancangan sistem yang dikonstruksi berdasarkan spesifikasi persyaratan yang telah ditetapkan pada subbab IV.1. Sebagaimana diuraikan pada subbab III.5.2, kegiatan ini bertujuan menghasilkan cetak biru teknis yang presisi sebelum siklus pengodean dimulai, dengan setiap keputusan rancangan diturunkan langsung dari persyaratan fungsional pada Tabel IV.11, persyaratan nonfungsional pada Tabel IV.12, serta batasan perancangan dan aturan bisnis yang terdokumentasi pada dokumen SRS di Lampiran 1.

 	Mengikuti pendekatan analisis dan perancangan terstruktur yang telah dijustifikasi pada subbab IV.1.3.2, perancangan diuraikan melalui lima aspek yang dikerjakan secara berurutan. Aspek pertama adalah perancangan arsitektur sistem sebagai kerangka teknis fundamental yang menetapkan pembagian tanggung jawab antarlapisan. Aspek kedua adalah perancangan proses yang memodelkan aliran data melalui diagram konteks, *Data Flow Diagram* berjenjang, kamus data, dan spesifikasi proses. Aspek ketiga adalah perancangan modul yang menurunkan hasil pemodelan proses menjadi hierarki modul program dalam bentuk *structure chart* beserta spesifikasinya. Aspek keempat adalah perancangan basis data yang mendefinisikan struktur penyimpanan operasional beserta relasinya. Aspek kelima adalah perancangan antarmuka pengguna yang memetakan struktur navigasi dan tata letak setiap halaman.

 	Kegiatan perancangan didokumentasikan dengan dukungan sejumlah perangkat bantu, yaitu perangkat pembuat diagram untuk diagram arsitektur, diagram konteks, *Data Flow Diagram*, dan *structure chart*; berkas skema Prisma yang divisualisasikan sebagai *Entity Relationship Diagram*; serta Figma untuk perancangan antarmuka secara iteratif. Seluruh model rancangan pada subbab ini berfungsi sebagai acuan tunggal bagi tahap implementasi yang diuraikan pada subbab IV.3 dan sebagai dasar penyusunan skenario pengujian pada subbab IV.4.

### **IV.2.1	Perancangan Arsitektur Sistem**

 	Arsitektur sistem LedgerDik dirancang sebagai susunan berlapis yang memisahkan lima tanggung jawab, yaitu penyajian antarmuka, orkestrasi proses, persistensi data operasional, ekstraksi dokumen, dan eksekusi aturan perhitungan. Pemisahan tersebut diperlukan karena kelima tanggung jawab itu berbeda dalam tiga hal, yaitu laju perubahannya, kebutuhan sumber dayanya, dan tingkat keterauditan yang dituntut atasnya. Aturan perhitungan menuntut keterauditan publik sehingga ditempatkan pada jaringan *blockchain*. Ekstraksi dokumen menuntut pustaka pengolah PDF dan citra beserta lingkungan Python tersendiri sehingga dipisahkan sebagai layanan mandiri. Data operasional memuat data pribadi dosen sehingga tetap disimpan pada basis data institusi. Gambaran arsitektur sistem secara keseluruhan disajikan pada Gambar IV.5.

**[SISIPKAN GAMBAR: `docs/gambar/Gambar-III-1-Arsitektur-Sistem-LedgerDik.mermaid` setelah ditambahkan kontrak BKDDokumenRegistri pada subgraf lapisan on-chain]**

Gambar IV.5. Arsitektur Sistem LedgerDik

 	Seperti terlihat pada Gambar IV.5, permintaan pengguna selalu masuk melalui *middleware* pada lapisan aplikasi web sebelum mencapai halaman mana pun, kemudian mutasi data dijalankan *server action* yang memanggil modul orkestrasi. Modul orkestrasi merupakan satu-satunya titik yang berhubungan dengan lapisan di luar aplikasi web, yaitu lapisan penyimpanan melalui Prisma ORM, lapisan ekstraksi melalui HTTP, dan lapisan *on-chain* melalui JSON-RPC. Pemusatan tersebut merupakan realisasi persyaratan NFR-07, sehingga perubahan konfigurasi jaringan maupun alamat layanan tidak tersebar pada banyak berkas. Deskripsi tanggung jawab setiap lapisan disajikan pada Tabel IV.13.

Tabel IV.13. Deskripsi Lapisan Arsitektur Sistem LedgerDik


| Lapisan                 | Tanggung Jawab                                                                                                                                                                       | Alasan Dipisahkan                                                                                                                                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Aplikasi web            | Menyajikan antarmuka per peran, menegakkan pembatasan akses dan gerbang fase, memvalidasi masukan, serta mengorkestrasi pemanggilan lapisan lain.                                    | Merupakan satu-satunya lapisan yang berinteraksi dengan pengguna, sekaligus satu-satunya lapisan yang memegang kunci penandatangan sehingga kunci tidak pernah terpapar ke peramban. |
| Penyimpanan operasional | Menyimpan seluruh data operasional beserta relasinya, yaitu akun, periode, dokumen BKD, kegiatan, dokumen bukti, hasil penilaian, simpulan, unggahan dokumen, dan riwayat transaksi. | Memuat data pribadi dosen dan isi penilaian yang tidak boleh dipublikasikan pada jaringan publik, sesuai batasan perancangan DC-06.                                                  |
| Ekstraksi dokumen       | Mengubah berkas SK, ST, dan dokumen bukti menjadi data terstruktur melalui dua jalur, yaitu pembacaan tabel deterministik dan penafsiran citra halaman.                              | Menuntut pustaka pengolah PDF dan citra beserta lingkungan Python tersendiri, dan perlu dapat dikembangkan serta diuji terpisah dari aplikasi web.                                   |
| *On-chain*              | Mengeksekusi aturan perhitungan Rubrik BKD, mengelola siklus hidup token kredit, dan mencatat jejak keberadaan dokumen.                                                              | Menuntut keterauditan publik atas aturan yang berjalan dan atas hasil yang diterbitkan, yang tidak dapat dipenuhi lapisan yang dikendalikan penyelenggara.                           |

 	Berdasarkan Tabel IV.13, lapisan *on-chain* memuat tiga kontrak dengan tanggung jawab yang berbeda. Kontrak KalkulatorBKDPendidikan bersifat murni tanpa penyimpanan status sehingga pemanggilannya tidak menghasilkan transaksi. Kontrak BKDSKSToken mengelola siklus hidup token kredit dan menuntut penandatanganan oleh pemegang peran yang sesuai. Kontrak BKDDokumenRegistri hanya memancarkan *event* tanpa menyimpan status. Perangkat lunak utama beserta versinya yang menyusun setiap lapisan dirangkum pada Tabel IV.14.

Tabel IV.14. Perangkat Lunak Utama pada Setiap Lapisan Arsitektur


| Lapisan                 | Perangkat Lunak        | Versi | Peran                                                                                          |
| ------------------------- | ------------------------ | :------: | ------------------------------------------------------------------------------------------------ |
| Aplikasi web            | Next.js                |  14.2  | Kerangka kerja aplikasi web dengan*App Router*, *React Server Components*, dan *server action* |
|                         | React                  |  18.3  | Pustaka penyusun antarmuka                                                                     |
|                         | TypeScript             |  6.0  | Sistem tipe statis pada seluruh kode aplikasi                                                  |
|                         | NextAuth.js            |  4.24  | Pengelolaan sesi berbasis JWT dan*credentials provider*                                        |
|                         | bcryptjs               |  3.0  | Pembentukan dan pembandingan*hash* kata sandi                                                  |
|                         | Ethers.js              |  6.17  | Antarmuka JSON-RPC menuju jaringan*blockchain* dan derivasi *wallet*                           |
|                         | Tailwind CSS           |  3.4  | Kerangka gaya berbasis kelas utilitas                                                          |
|                         | pdfjs-dist             |  6.2  | Perenderan pratinjau berkas PDF pada peramban                                                  |
|                         | SweetAlert2            | 11.26 | Dialog konfirmasi dan pesan hasil aksi                                                         |
| Penyimpanan operasional | PostgreSQL             |   16   | Sistem manajemen basis data relasional                                                         |
|                         | Prisma ORM             |  6.19  | Pemetaan objek-relasional, migrasi terversi, dan akses bertipe                                 |
| Ekstraksi dokumen       | Python                 |  3.12  | Lingkungan eksekusi layanan ekstraksi                                                          |
|                         | FastAPI                | 0.121 | Kerangka kerja layanan HTTP beserta validasi berbasis anotasi tipe                             |
|                         | Uvicorn                |  0.38  | Peladen ASGI                                                                                   |
|                         | pdfplumber             |  0.11  | Pembacaan teks dan tabel deterministik pada berkas PDF digital                                 |
|                         | pypdfium2              |  5.9  | Rasterisasi halaman PDF menjadi citra                                                          |
|                         | Pillow                 |  12.2  | Pengolahan dan penyandian citra halaman                                                        |
|                         | requests               |  2.32  | Pemanggilan layanan model bahasa visual                                                        |
| *On-chain*              | Solidity               | 0.8.28 | Bahasa penulisan ketiga*smart contract*                                                        |
|                         | Hardhat                |  3.11  | Kompilasi, pengujian, penempatan, dan verifikasi kontrak                                       |
|                         | OpenZeppelin Contracts |  5.6  | Implementasi baku ERC-20 dan AccessControl                                                     |

### **IV.2.2	Perancangan Proses**

 	Perancangan proses memodelkan aliran data yang mengalir masuk ke sistem, diolah di dalamnya, dan keluar kembali ke entitas eksternal. Pemodelan disusun berjenjang, dimulai dari diagram konteks yang memperlakukan seluruh sistem sebagai satu proses tunggal, kemudian diuraikan menjadi *Data Flow Diagram* level 1 yang memperlihatkan dua belas proses utama, lalu diuraikan lebih lanjut menjadi *Data Flow Diagram* level 2 bagi proses yang logikanya bertingkat. Setiap aliran data dan penyimpanan data pada diagram didefinisikan pada kamus data, sedangkan logika pemrosesan setiap proses terendah dituliskan sebagai spesifikasi proses.

#### **IV.2.2.1	Diagram Konteks**

 	Diagram konteks menetapkan batas sistem beserta seluruh entitas eksternal yang berinteraksi dengannya, sebagaimana telah diidentifikasi pada Tabel IV.6. Batas sistem mencakup aplikasi web beserta basis data operasionalnya dan layanan ekstraksi dokumen, sedangkan ketiga *smart contract* dan layanan model bahasa visual berada di luar batas tersebut. Konsekuensi penetapan batas ini adalah basis data tidak dimodelkan sebagai entitas eksternal melainkan sebagai penyimpanan data di dalam sistem. Diagram konteks sistem disajikan pada Gambar IV.6.

**[SISIPKAN GAMBAR: diagram konteks dengan satu proses tunggal "Sistem Penilaian BKD (LedgerDik)" dan tujuh entitas eksternal, yaitu Dosen, Asesor, Administrator, Smart Contract Kalkulator BKD, Smart Contract Token SKS, Smart Contract Registri Dokumen, dan Layanan Model Bahasa Visual, beserta aliran data masuk dan keluar sesuai Tabel IV.15]**

Gambar IV.6. Diagram Konteks Sistem LedgerDik

 	Berdasarkan Gambar IV.6, seluruh entitas eksternal memiliki aliran dua arah. Rincian aliran data yang masuk dan keluar pada setiap entitas disajikan pada Tabel IV.15.

Tabel IV.15. Aliran Data pada Diagram Konteks


| Entitas Eksternal                 | Aliran Data Masuk ke Sistem                                                                                                                              | Aliran Data Keluar dari Sistem                                                                                                                |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Dosen                             | kredensial, data_kegiatan, parameter_kegiatan, berkas_bukti, permintaan_klaim, status_capaian, permintaan_simpan_permanen                                | daftar_kegiatan, nilai_kredit, status_penilaian, catatan_asesor, simpulan_bkd, rekapitulasi_bkd, pesan_hasil_aksi                             |
| Asesor                            | kredensial, nilai_disetujui, catatan_penilaian, status_penilaian, permintaan_periksa_ulang, persetujuan_manual, permintaan_pengesahan                    | daftar_dokumen_bkd, rincian_kegiatan, dokumen_bukti, hasil_pemeriksaan_bukti, nilai_kredit, penanda_temuan                                    |
| Administrator                     | kredensial, data_pengguna, permintaan_wallet, data_periode, penugasan_asesor, berkas_sk_st, koreksi_baris, permintaan_penerapan, instruksi_koreksi_token | daftar_pengguna, pratinjau_pemetaan, temuan_validasi, status_penerapan, riwayat_transaksi, log_blockchain, registri_dokumen, rekapitulasi_bkd |
| *Smart Contract* Kalkulator BKD   | nilai_kredit_x100, galat_input_tidak_valid                                                                                                               | nama_fungsi, argumen_perhitungan                                                                                                              |
| *Smart Contract* Token SKS        | transaction_hash, saldo_token, event_token                                                                                                               | alamat_wallet, jumlah_token, referensi_hash_simpulan, alasan_koreksi                                                                          |
| *Smart Contract* Registri Dokumen | transaction_hash, event_pencatatan                                                                                                                       | hash_dokumen, jenis_aksi, referensi_baris                                                                                                     |
| Layanan Model Bahasa Visual       | hasil_penafsiran_json                                                                                                                                    | citra_halaman, instruksi_skema_keluaran                                                                                                       |

 	Berdasarkan Tabel IV.15, perlu diperhatikan bahwa aliran menuju kontrak kalkulator tidak menghasilkan transaksi karena seluruh fungsinya dideklarasikan sebagai fungsi murni, sedangkan aliran menuju kontrak token dan kontrak registri merupakan transaksi yang mengubah keadaan *blockchain* dan menuntut penandatanganan oleh alamat pemegang peran yang sesuai.

#### **IV.2.2.2	Diagram Aliran Data Level 1**

 	Diagram aliran data level 1 menguraikan proses tunggal pada Gambar IV.6 menjadi dua belas proses utama sesuai daftar fungsi pada subbab IV.1.3.1, beserta sebelas penyimpanan data yang menjadi perantara antarproses. Diagram tersebut disajikan pada Gambar IV.7.

**[SISIPKAN GAMBAR: DFD level 1 dengan dua belas proses P1 sampai P12 sesuai Tabel IV.16, tujuh entitas eksternal, dan sebelas penyimpanan data D1 sampai D11 sesuai Tabel IV.17]**

Gambar IV.7. Diagram Aliran Data Level 1

 	Sebagaimana terlihat pada Gambar IV.7, tidak terdapat aliran data langsung antarproses tanpa melalui penyimpanan data, kecuali pada rangkaian perhitungan kredit yang keluarannya langsung dipakai proses pemanggilnya. Rancangan ini menjaga agar setiap proses dapat dijalankan tanpa bergantung pada urutan eksekusi proses lain. Deskripsi setiap proses beserta persyaratan fungsional yang direalisasikannya disajikan pada Tabel IV.16.

Tabel IV.16. Deskripsi Proses pada Diagram Aliran Data Level 1


| Kode | Nama Proses                               | Deskripsi                                                                                                                                                                                        | FR Terkait                        |
| :----: | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
|  P1  | Autentikasi dan Otorisasi                 | Memverifikasi kredensial terhadap*hash* tersimpan, menerbitkan sesi berisi peran, menyaring setiap permintaan halaman menurut peran, dan menyajikan profil akun.                                 | FR-01, FR-02, FR-32               |
|  P2  | Pengelolaan Pengguna dan*Wallet*          | Menambah dan memutakhirkan akun beserta identitasnya, mengaktifkan dan menonaktifkan akun, serta menurunkan alamat*wallet* kustodian pada indeks yang unik.                                      | FR-03, FR-04                      |
|  P3  | Pengelolaan Periode dan Fase              | Menambah dan mengubah periode beserta rentang fasenya, menjamin hanya satu periode aktif, dan menentukan fase yang sedang berjalan.                                                              | FR-05, FR-06                      |
|  P4  | Penugasan Asesor                          | Menugaskan dua asesor berbeda pada satu dokumen BKD dengan urutan tertentu, baik satu per satu maupun secara massal, serta melepas penugasan yang belum menghasilkan penilaian.                  | FR-07                             |
|  P5  | Pengelolaan Referensi Kegiatan            | Menyajikan data acuan butir aturan beserta skema parameter dan pemetaannya ke fungsi perhitungan.                                                                                                | FR-08                             |
|  P6  | Ekstraksi dan Penerapan Dokumen           | Menerima unggahan berkas SK dan ST, mengekstraksinya menjadi baris penugasan, memetakannya menjadi calon kegiatan, menerima koreksi administrator, dan menerapkannya menjadi kegiatan dosen.     | FR-09, FR-10, FR-11, FR-12, FR-31 |
|  P7  | Pengelolaan Kegiatan dan Dokumen BKD      | Menambah, menyunting, dan menghapus kegiatan beserta parameternya, menautkan dokumen bukti, menarik kegiatan ke dokumen BKD, menetapkan capaian, dan menyimpan dokumen BKD.                      | FR-13, FR-14, FR-15, FR-16, FR-17 |
|  P8  | Perhitungan Kredit Kegiatan               | Memetakan parameter kegiatan menjadi argumen fungsi kontrak, memanggil fungsi perhitungan, dan menyimpan nilai kredit beserta status perhitungannya.                                             | FR-18, FR-19                      |
|  P9  | Penilaian, Simpulan, dan Penerbitan Token | Menyimpan penilaian setiap asesor, mencatat pengesahan, membentuk simpulan beserta*hash*-nya setelah kedua asesor mengesahkan, dan menerbitkan token kredit.                                     | FR-20, FR-21, FR-22, FR-23, FR-24 |
| P10 | Koreksi Token dan Pelaporan               | Menghapus token disertai alasan koreksi, membaca riwayat*event* dari *blockchain* secara berjenjang, dan menyajikan rekapitulasi kredit.                                                         | FR-25, FR-26, FR-27               |
| P11 | Verifikasi Keaslian Dokumen Bukti         | Membaca nama orang beserta perannya pada dokumen bukti, mencocokkannya terhadap identitas dan peran yang diklaim, menandai temuan bagi asesor, dan menerima peninjauan serta persetujuan manual. | FR-28, FR-29, FR-30               |
| P12 | Pencatatan Jejak Dokumen                  | Menghitung sidik digital berkas, mencatatkannya ke kontrak registri beserta jenis aksi dan referensi baris asalnya, serta menyajikan riwayat pencatatannya.                                      | FR-33, FR-34                      |

 	Berdasarkan Tabel IV.16, kedua belas proses tersebut berbagi sebelas penyimpanan data yang dirangkum pada Tabel IV.17. Penomoran D1 sampai D11 dipakai konsisten pada seluruh diagram aliran data maupun pada spesifikasi proses di Lampiran 1.

Tabel IV.17. Penyimpanan Data pada Diagram Aliran Data Level 1


| Kode | Penyimpanan Data   | Isi                                                                                                                      | Proses yang Mengaksesnya     |
| :----: | -------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
|  D1  | pengguna           | Akun ketiga peran beserta identitas, penanda aktif, alamat*wallet*, dan indeks turunannya.                               | P1, P2, P4, P6, P9, P10, P11 |
|  D2  | periode_bkd        | Periode penilaian beserta rentang ketiga fase, nilai penggantian fase, dan status aktif.                                 | P3, P6, P7, P9, P10          |
|  D3  | lkd                | Dokumen BKD per dosen per periode per jenis beserta status dan penanda simpan permanennya.                               | P4, P6, P7, P9, P10          |
|  D4  | penugasan_asesor   | Penugasan asesor pada suatu dokumen BKD beserta urutan dan penanda pengesahannya.                                        | P4, P9                       |
|  D5  | referensi_kegiatan | Data acuan butir aturan beserta kategori, skema parameter, dan nama fungsi kontraknya.                                   | P5, P6, P7, P8, P11          |
|  D6  | unggahan_dokumen   | Berkas SK dan ST beserta sidik digitalnya, keluaran utuh parser, ringkasan, dan koreksi administrator.                   | P6, P12                      |
|  D7  | kegiatan           | Kegiatan yang dilaporkan dosen beserta parameter, nilai kredit, status, status capaian, penanda klaim, dan asal datanya. | P6, P7, P8, P9, P11          |
|  D8  | dokumen_kegiatan   | Metadata dokumen bukti beserta lokasi berkasnya dan muatan hasil pemeriksaan keasliannya.                                | P7, P11, P12                 |
|  D9  | hasil_penilaian    | Penilaian satu kegiatan oleh satu asesor beserta nilai disetujui, status, dan catatannya.                                | P9, P10                      |
| D10 | simpulan_bkd       | Simpulan satu dokumen BKD beserta total kredit, status pemenuhan,*hash* penilaian, dan *transaction hash*-nya.           | P9, P10                      |
| D11 | riwayat_transaksi  | Riwayat setiap upaya transaksi*on-chain* beserta jenis, alamat kontrak, *transaction hash*, dan statusnya.               | P9, P10, P12                 |

#### **IV.2.2.3	Diagram Aliran Data Level 2**

 	Empat proses pada Tabel IV.16 memiliki logika bertingkat sehingga diuraikan lebih lanjut menjadi diagram aliran data level 2, yaitu P6 Ekstraksi dan Penerapan Dokumen, P8 Perhitungan Kredit Kegiatan, P9 Penilaian, Simpulan, dan Penerbitan Token, serta P11 Verifikasi Keaslian Dokumen Bukti. Delapan proses lainnya tidak diuraikan karena logikanya sudah berada pada tingkat terendah dan langsung dituliskan sebagai spesifikasi proses.

 	Proses P6 diuraikan menjadi lima subproses karena memuat rantai pengolahan yang panjang dari berkas mentah hingga kegiatan yang terbentuk, sebagaimana disajikan pada Gambar IV.8.

**[SISIPKAN GAMBAR: DFD level 2 proses P6 dengan lima subproses, yaitu P6.1 Ekstraksi Dokumen Penugasan, P6.2 Pemetaan Baris dan Pencocokan Dosen, P6.3 Koreksi Hasil Ekstraksi, P6.4 Penerapan Hasil Ekstraksi, dan P6.5 Input Kegiatan Berbasis Penugasan oleh Administrator]**

Gambar IV.8. Diagram Aliran Data Level 2 Proses Ekstraksi dan Penerapan Dokumen

 	Berdasarkan Gambar IV.8, subproses P6.1 menyimpan keluaran parser secara utuh ke D6 sebagai bukti audit, sedangkan subproses P6.3 menyimpan koreksi administrator pada atribut terpisah sebagai selisih terhadap keluaran tersebut. Rancangan ini merupakan realisasi aturan bisnis BR-18, yaitu keluaran mentah parser tidak pernah diubah. Subproses P6.4 membaca keduanya dan menggabungkannya di dalam memori sebelum membentuk kegiatan, sehingga administrator dapat mengembalikan setiap baris ke nilai aslinya kapan pun.

 	Proses P8 diuraikan menjadi tiga subproses karena melibatkan perpindahan dari representasi parameter berbentuk dokumen semi-terstruktur menjadi argumen fungsi kontrak yang bertipe ketat, sebagaimana disajikan pada Gambar IV.9.

**[SISIPKAN GAMBAR: DFD level 2 proses P8 dengan tiga subproses, yaitu P8.1 Penyiapan Argumen Perhitungan, P8.2 Eksekusi Fungsi Kontrak Kalkulator, dan P8.3 Penyimpanan Nilai Kredit dan Status Perhitungan]**

Gambar IV.9. Diagram Aliran Data Level 2 Proses Perhitungan Kredit Kegiatan

 	Seperti terlihat pada Gambar IV.9, subproses P8.1 membaca skema parameter dari D5 untuk menentukan urutan dan tipe argumen, sehingga urutan opsi pada skema parameter wajib identik dengan urutan anggota enumerasi pada kontrak. Subproses P8.3 menyimpan hasil ke D7 dengan tiga kemungkinan status, yaitu berhasil, gagal, atau tidak diotomatisasi, sehingga kegagalan pemanggilan kontrak tidak membatalkan penyimpanan kegiatan.

 	Proses P9 diuraikan menjadi empat subproses karena penerbitan token merupakan tindakan yang dikondisikan pada pengesahan kedua asesor, sebagaimana disajikan pada Gambar IV.10.

**[SISIPKAN GAMBAR: DFD level 2 proses P9 dengan empat subproses, yaitu P9.1 Penyimpanan Penilaian per Asesor, P9.2 Pengesahan Penilaian, P9.3 Pembentukan Simpulan dan Hash, dan P9.4 Penerbitan Token Kredit]**

Gambar IV.10. Diagram Aliran Data Level 2 Proses Penilaian, Simpulan, dan Penerbitan Token

 	Berdasarkan Gambar IV.10, subproses P9.3 hanya dijalankan setelah subproses P9.2 mendapati seluruh penugasan pada dokumen BKD yang bersangkutan telah disahkan. Subproses P9.4 dirancang agar kegagalannya tidak membatalkan keluaran P9.3, sehingga simpulan tetap tersimpan pada D10 dan kegagalan tercatat pada D11 berstatus gagal. Rancangan ini merupakan realisasi persyaratan NFR-03.

 	Proses P11 diuraikan menjadi lima subproses karena pemeriksaan keaslian melibatkan penafsiran dokumen, penormalan nama, pemeriksaan peran, penandaan temuan, dan peninjauan asesor, sebagaimana disajikan pada Gambar IV.11.

**[SISIPKAN GAMBAR: DFD level 2 proses P11 dengan lima subproses, yaitu P11.1 Penyeleksian dan Pemanggilan Parser Bukti, P11.2 Penormalan dan Pencocokan Nama, P11.3 Pemeriksaan Peran dan Penetapan Status, P11.4 Penandaan Temuan pada Halaman Penilaian, dan P11.5 Peninjauan dan Persetujuan Manual oleh Asesor]**

Gambar IV.11. Diagram Aliran Data Level 2 Proses Verifikasi Keaslian Dokumen Bukti

 	Seperti terlihat pada Gambar IV.11, subproses P11.5 menambahkan penanda persetujuan asesor ke dalam muatan hasil pemeriksaan yang sama tanpa menghapus hasil pembacaan parser, sesuai aturan bisnis BR-32. Subproses P11.4 hanya memperlakukan status tidak cocok dan peran tidak sesuai sebagai temuan, sedangkan status tanpa nama dan gagal tidak diperlakukan sebagai indikasi ketidaksesuaian karena keduanya menandakan pemeriksaan tidak menyimpulkan apa pun.

#### **IV.2.2.4	Kamus Data**

 	Kamus data mendefinisikan setiap aliran data dan penyimpanan data yang muncul pada diagram konteks maupun diagram aliran data, sehingga tidak terdapat nama data yang maknanya bergantung pada penafsiran pembaca. Penulisan memakai notasi analisis terstruktur, yaitu tanda sama dengan untuk definisi, tanda tambah untuk komposisi, kurung biasa untuk elemen opsional, kurung kurawal untuk elemen berulang, serta kurung siku dengan pemisah garis tegak untuk pilihan. Definisi struktur data komposit yang mengalir pada sistem disajikan pada Tabel IV.18.

Tabel IV.18. Kamus Data Struktur Komposit


| Nama Data               | Definisi                                                                                                                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| data_pengguna           | nama + surel + kata_sandi + peran + (nidn) + (nip) + (program_studi) + (jabatan_fungsional) + (kode_dosen) + (nira) + (kelompok_bidang)                                                    |
| data_periode            | nama_periode + tahun_ajaran + semester + rentang_periode + rentang_pengisian + rentang_penilaian + rentang_perbaikan + (fase_override) + status_periode                                    |
| rentang_periode         | tanggal_mulai + tanggal_selesai                                                                                                                                                            |
| berkas_sk_st            | nama_file + jenis_unggahan + isi_berkas_pdf + sha256 + (nomor_surat) + (tanggal_surat)                                                                                                     |
| hasil_parse             | metadata_surat + {baris_penugasan} + ringkasan_parse + {temuan_validasi} + {baris_ditolak}                                                                                                 |
| baris_penugasan         | penanda_baris + nama_dosen + (kode_dosen) + (nip) + judul_kegiatan + parameter_kegiatan                                                                                                    |
| pratinjau_pemetaan      | {baris_penugasan + kode_rule + status_pencocokan + (nilai_koreksi) + penanda_lewati}                                                                                                       |
| status_pencocokan       | [ cocok\| ambigu \| tidak_cocok ]                                                                                                                                                          |
| data_kegiatan           | judul + kode_rule + parameter_kegiatan + (detail_kegiatan) + sumber_data + penanda_klaim + (status_capaian)                                                                                |
| parameter_kegiatan      | {nama_parameter + nilai_parameter}                                                                                                                                                         |
| dokumen_bukti           | nama_dokumen + jenis_dokumen + [ berkas_pdf\| tautan_luar ] + (keterangan) + (hasil_pemeriksaan_bukti)                                                                                     |
| hasil_pemeriksaan_bukti | status_pemeriksaan + nama_akun + (nama_cocok) + {nama_terdeteksi} + (peran_diharapkan) + (peran_terdeteksi) + (jenis_dokumen_terbaca) + (pesan) + waktu_pemeriksaan + (persetujuan_manual) |
| status_pemeriksaan      | [ cocok\| peran_tidak_sesuai \| tidak_cocok \| tanpa_nama \| gagal ]                                                                                                                       |
| persetujuan_manual      | nama_asesor + id_asesor + waktu_persetujuan                                                                                                                                                |
| data_penilaian          | id_kegiatan + id_penugasan + sks_disetujui_x100 + (pertemuan_keputusan) + (capaian_persen) + status_penilaian + (catatan)                                                                  |
| simpulan_bkd            | total_sks_pendidikan_x100 + status_kewajiban_khusus + status_final + hash_penilaian + (tx_hash)                                                                                            |
| muatan_hash_simpulan    | id_lkd + total_sks_x100 + {id_kegiatan + nilai_rata_x100} + {id_asesor_pengesah}                                                                                                           |
| transaksi_onchain       | jenis_transaksi + (contract_address) + (tx_hash) + (jumlah_token_x100) + (alamat_wallet) + (reference_id) + (alasan) + status_transaksi                                                    |
| catatan_registri        | hash_dokumen + jenis_aksi + referensi_baris                                                                                                                                                |
| rekapitulasi_bkd        | {nama_dosen + total_sks_diajukan + total_sks_disahkan + status_final}                                                                                                                      |

 	Berdasarkan Tabel IV.18, struktur muatan_hash_simpulan perlu digarisbawahi karena menjadi masukan penghitungan *hash* yang dipakai sebagai referensi transaksi penerbitan token. Susunan atributnya ditetapkan tetap dan diurutkan secara kanonis, sehingga penghitungan ulang atas data yang sama selalu menghasilkan *hash* yang identik. Sifat inilah yang memungkinkan pihak luar membuktikan keaslian simpulan tanpa mengakses basis data institusi. Elemen data yang tidak dapat diuraikan lebih lanjut beserta tipe dan batasannya disajikan pada Tabel IV.19.

Tabel IV.19. Kamus Data Elemen Data


| Nama Elemen        | Tipe           | Batasan Nilai                                                                                |
| -------------------- | ---------------- | ---------------------------------------------------------------------------------------------- |
| surel              | teks           | unik lintas akun, berformat alamat surel                                                     |
| kata_sandi         | teks           | sekurang-kurangnya delapan karakter, disimpan hanya sebagai*hash* bcrypt                     |
| peran              | enumerasi      | dosen, asesor, admin                                                                         |
| kode_dosen         | teks           | unik lintas akun apabila terisi, mengikuti kolom Kd Dosen pada lampiran surat                |
| nira               | teks           | unik lintas akun apabila terisi, hanya bagi peran asesor                                     |
| wallet_index       | bilangan bulat | unik lintas akun, tidak berubah setelah ditetapkan                                           |
| alamat_wallet      | teks           | alamat heksadesimal empat puluh dua karakter berawalan 0x                                    |
| fase_override      | enumerasi      | pengisian, penilaian, perbaikan, selesai, atau kosong                                        |
| status_periode     | enumerasi      | aktif, nonaktif; tepat satu periode boleh berstatus aktif                                    |
| jenis_lkd          | enumerasi      | rencana, laporan                                                                             |
| status_lkd         | enumerasi      | draft, diajukan, dinilai, final                                                              |
| urutan             | bilangan bulat | 1 untuk asesor pertama, 2 untuk asesor kedua; unik per dokumen BKD                           |
| kode_rule          | teks           | unik pada data referensi, berformat EDU diikuti tiga digit                                   |
| sks_dihitung_x100  | bilangan bulat | bilangan bulat tak bertanda pada skala kali seratus                                          |
| sks_disetujui_x100 | bilangan bulat | bilangan bulat tak bertanda pada skala kali seratus                                          |
| status_perhitungan | enumerasi      | berhasil, gagal, tidak_diotomatisasi                                                         |
| status_kegiatan    | enumerasi      | draft, diajukan, dihitung, disetujui, ditolak, revisi                                        |
| status_capaian     | enumerasi      | selesai, gagal, beban_lebih                                                                  |
| status_penilaian   | enumerasi      | disetujui, ditolak, revisi                                                                   |
| status_final       | enumerasi      | M untuk memenuhi, TM untuk tidak memenuhi                                                    |
| sumber_data        | teks           | manual, admin, surat_tugas                                                                   |
| jenis_unggahan     | enumerasi      | st_pengajaran, st_bimbingan, st_pengujian, sk_pembinaan, artefak                             |
| status_unggahan    | enumerasi      | terparse, gagal, diterapkan                                                                  |
| sha256             | teks           | enam puluh empat karakter heksadesimal                                                       |
| hash_penilaian     | teks           | *hash* keccak-256, enam puluh enam karakter berawalan 0x                                     |
| jenis_transaksi    | enumerasi      | mint, burn, catat_dokumen                                                                    |
| status_transaksi   | enumerasi      | pending, success, failed                                                                     |
| tx_hash            | teks           | unik lintas transaksi, enam puluh enam karakter berawalan 0x                                 |
| jenis_aksi         | teks           | unggah, terapkan, hapus                                                                      |
| referensi_baris    | teks           | berformat unggahan diikuti titik dua dan pengenal, atau bukti diikuti titik dua dan pengenal |

#### **IV.2.2.5	Spesifikasi Proses**

 	Spesifikasi proses menuliskan logika pemrosesan setiap proses pada tingkat terendah diagram aliran data memakai bahasa terstruktur, sehingga menjadi acuan langsung bagi pengodean pada subbab IV.3 sekaligus menjadi dasar penurunan skenario pengujian pada subbab IV.4. Spesifikasi proses menggantikan peran *Fully Dressed Use Case* pada dokumen yang memakai pendekatan berorientasi objek. Setiap spesifikasi memuat identitas proses, aliran data masuk dan keluar, penyimpanan data yang diakses, persyaratan fungsional yang direalisasikan, serta logika pemrosesan dalam bentuk *pseudocode*. Daftar seluruh spesifikasi proses beserta proses yang diwakilinya disajikan pada Tabel IV.20, sedangkan uraian lengkapnya disajikan pada Lampiran 1.

Tabel IV.20. Daftar Spesifikasi Proses


|   Kode   | Nama Spesifikasi Proses                              |   Proses DFD   | FR Terkait                        |
| :--------: | ------------------------------------------------------ | :--------------: | ----------------------------------- |
| PSPEC-01 | Autentikasi dan Otorisasi                            |       P1       | FR-01, FR-02, FR-32               |
| PSPEC-02 | Pengelolaan Pengguna dan*Wallet*                     |       P2       | FR-03, FR-04                      |
| PSPEC-03 | Pengelolaan Periode dan Fase                         |       P3       | FR-05, FR-06                      |
| PSPEC-04 | Penugasan Asesor                                     |       P4       | FR-07                             |
| PSPEC-05 | Ekstraksi Dokumen Penugasan                          |      P6.1      | FR-09                             |
| PSPEC-06 | Pemetaan Baris dan Pencocokan Dosen                  |      P6.2      | FR-10                             |
| PSPEC-07 | Koreksi dan Penerapan Hasil Ekstraksi                |   P6.3, P6.4   | FR-11, FR-12                      |
| PSPEC-08 | Pengelolaan Kegiatan dan Dokumen BKD                 |       P7       | FR-13, FR-14, FR-15, FR-16, FR-17 |
| PSPEC-09 | Orkestrasi Perhitungan Kredit                        | P5, P8.1, P8.3 | FR-08, FR-18, FR-19               |
| PSPEC-10 | *Smart Contract* Kalkulator BKD Pendidikan           |      P8.2      | FR-18                             |
| PSPEC-11 | Penilaian dan Pengesahan Asesor                      |   P9.1, P9.2   | FR-20, FR-21                      |
| PSPEC-12 | Pembentukan Simpulan BKD                             |      P9.3      | FR-22, FR-23                      |
| PSPEC-13 | Integrasi Token pada Lapisan Orkestrasi              |   P9.4, P10   | FR-24, FR-25                      |
| PSPEC-14 | *Smart Contract* Token SKS                           |   P9.4, P10   | FR-24, FR-25                      |
| PSPEC-15 | Log*Blockchain* dan Rekapitulasi                     |      P10      | FR-26, FR-27                      |
| PSPEC-16 | Penyeleksian dan Pemanggilan Parser Bukti            |     P11.1     | FR-28                             |
| PSPEC-17 | Penormalan dan Pencocokan Nama Dokumen Bukti         |     P11.2     | FR-28                             |
| PSPEC-18 | Pemeriksaan Peran dan Penetapan Status Pemeriksaan   |  P11.3, P11.4  | FR-28, FR-29                      |
| PSPEC-19 | Peninjauan Hasil Pemeriksaan oleh Asesor             |     P11.5     | FR-30                             |
| PSPEC-20 | Input Kegiatan Berbasis Penugasan oleh Administrator |      P6.5      | FR-31                             |
| PSPEC-21 | Pencatatan Jejak Dokumen pada Registri               |      P12      | FR-33, FR-34                      |

 	Berdasarkan Tabel IV.20, dua spesifikasi proses perlu digarisbawahi karena keduanya berpasangan namun berada pada lapisan yang berbeda. PSPEC-09 menuliskan logika penyiapan argumen dan penyimpanan hasil pada lapisan aplikasi web, sedangkan PSPEC-10 menuliskan logika perhitungan yang dieksekusi kontrak. Pemisahan yang sama berlaku bagi PSPEC-13 dan PSPEC-14 pada pengelolaan token. Pemisahan tersebut menegaskan batas tanggung jawab antara lapisan yang dapat diubah penyelenggara dan lapisan yang bersifat *immutable*. Sebagai contoh penulisan, logika pemrosesan PSPEC-12 disajikan berikut ini.

```
PROCEDURE Pembentukan_Simpulan_BKD
  RECEIVE idLkd
  BACA seluruhPenugasan DARI D4 WHERE id_lkd = idLkd
  IF JUMLAH(seluruhPenugasan) < 2 THEN
    HENTIKAN "Menunggu penugasan asesor lengkap"
  ENDIF
  IF ADA penugasan DALAM seluruhPenugasan WHERE disahkan = salah THEN
    HENTIKAN "Menunggu pengesahan asesor lain"
  ENDIF

  totalX100 = 0
  rincian = KOSONG
  FOR EACH kegiatan DALAM D7 WHERE id_lkd = idLkd AND diklaim = benar
    BACA daftarNilai DARI D9
      WHERE id_kegiatan = kegiatan.id AND status = "disetujui"
    IF JUMLAH(daftarNilai) > 0 THEN
      rataX100 = PEMBULATAN(JUMLAHKAN(daftarNilai.sks_disetujui_x100)
                            / JUMLAH(daftarNilai))
      totalX100 = totalX100 + rataX100
      TAMBAHKAN (kegiatan.id, rataX100) KE rincian
    ENDIF
  ENDFOR

  IF totalX100 / 100 >= AMBANG_KEWAJIBAN_PENDIDIKAN THEN
    statusFinal = "M"
  ELSE
    statusFinal = "TM"
  ENDIF

  muatan = (idLkd, totalX100, rincian, daftarIdAsesorPengesah)
  hashPenilaian = KECCAK256(SERIALISASI_KANONIS(muatan))

  SIMPAN simpulan KE D10 BERISI (idLkd, totalX100, statusFinal, hashPenilaian)
  UBAH lkd DI D3 SET status = "final"
  KIRIM (idLkd, totalX100, hashPenilaian) KE P9.4
END PROCEDURE
```

 	Logika di atas memperlihatkan dua ketentuan yang menjadi inti pembentukan simpulan. Ketentuan pertama, nilai final setiap kegiatan merupakan perataan nilai yang disetujui kedua asesor, sesuai aturan bisnis BR-11. Perlu dibedakan bahwa perataan pada rancangan ini berlaku atas nilai yang telah disetujui kedua asesor terhadap hasil perhitungan kontrak yang sama, sehingga berbeda sifatnya dengan perata-rataan pada sistem berjalan yang menyelesaikan perbedaan hasil perhitungan manual sebagaimana dianalisis pada subbab IV.1.1.2. Ketentuan kedua, pembentukan simpulan hanya berjalan setelah seluruh penugasan disahkan, sesuai aturan bisnis BR-22.

### **IV.2.3	Perancangan Modul**

 	Perancangan modul menurunkan hasil pemodelan proses pada subbab IV.2.2 menjadi hierarki modul program beserta spesifikasi rincinya. Penurunan difokuskan pada lapisan *on-chain* karena lapisan tersebut memuat logika inti sistem sekaligus bersifat *immutable* setelah ditempatkan, sehingga struktur modulnya harus ditetapkan lengkap sebelum pengodean dimulai. Hierarki modul digambarkan sebagai *structure chart* sebagaimana diuraikan pada subbab II.1.15, yaitu bagan yang memperlihatkan modul beserta pemanggilan dan aliran parameter di antaranya.

 	Kriteria yang dipakai dalam menentukan batas modul adalah *cohesion* yang tinggi dan *coupling* yang rendah. Penerapannya menghasilkan satu keputusan rancangan utama, yaitu satu butir aturan Rubrik BKD atau satu kelompok butir yang berpola perhitungan sama diwakili tepat satu modul mandiri. Keputusan tersebut merupakan realisasi batasan perancangan DC-01 sekaligus persyaratan NFR-07, sehingga setiap butir aturan dapat ditelusuri dan diuji secara terpisah.

#### **IV.2.3.1	*Structure Chart* Kontrak Kalkulator BKD Pendidikan**

 	Kontrak kalkulator dirancang sebagai kumpulan modul sejajar tanpa modul pengendali di dalam kontrak itu sendiri. Pemanggil modul berada di lapisan aplikasi web, yaitu modul orkestrasi perhitungan yang memilih modul mana yang dipanggil berdasarkan atribut fungsi kontrak pada data referensi kegiatan. Rancangan tanpa pengendali internal tersebut dipilih agar penambahan butir aturan baru tidak menuntut penyuntingan modul yang telah ada, sehingga risiko penempatan ulang kontrak dapat dikendalikan. *Structure chart* kontrak kalkulator disajikan pada Gambar IV.12.

**[SISIPKAN GAMBAR: structure chart kontrak KalkulatorBKDPendidikan dengan modul orkestrasi perhitungan pada lapisan aplikasi sebagai pemanggil, dan sembilan belas modul perhitungan beserta satu modul rekapitulasi sebagai modul terpanggil, disertai aliran parameter masuk berupa parameter kegiatan dan aliran keluar berupa nilai SKS kali seratus]**

Gambar IV.12. *Structure Chart* Kontrak Kalkulator BKD Pendidikan

 	Berdasarkan Gambar IV.12, seluruh modul perhitungan berada pada satu tingkat yang sama dan tidak saling memanggil. Sifat ini menjadikan *coupling* antarmodul bernilai nol, karena tidak terdapat modul yang bergantung pada keluaran maupun keadaan modul lain. Pemetaan setiap butir aturan yang diotomatisasi terhadap modul perhitungannya disajikan pada Tabel IV.21.

Tabel IV.21. Pemetaan Butir Aturan yang Diotomatisasi terhadap Modul Perhitungan


| Kode Aturan | Butir Rubrik BKD                                                               | Modul Perhitungan                    | Parameter Masuk                                                                                                | Keluaran |
| :-----------: | -------------------------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------- |
|   EDU001   | Mengikuti pendidikan formal program doktor                                     | hitungPendidikanFormalDoktor         | jumlahSemester                                                                                                 | sksX100  |
|   EDU101   | Melaksanakan perkuliahan, tutorial, dan praktikum                              | hitungPengajaran                     | sksMataKuliah, jumlahPertemuanRencana, jumlahPertemuanRealisasi, semesterPenuh, teamTeaching, persenPorsiDosen | sksX100  |
|   EDU201   | Membimbing seminar mahasiswa                                                   | hitungBimbinganSeminarMahasiswa      | jumlahSemester                                                                                                 | sksX100  |
|   EDU202   | Membimbing Kuliah Kerja Nyata, Praktik Kerja Nyata, dan Praktik Kerja Lapangan | hitungBimbinganKKNPKLMagang          | jumlahSemester                                                                                                 | sksX100  |
|   EDU203   | Membimbing tugas akhir                                                         | hitungPembimbinganTugasAkhir         | peran, jenisTugasAkhir, jumlahMahasiswa                                                                        | sksX100  |
|   EDU301   | Bertugas sebagai penguji pada ujian akhir                                      | hitungPengujiUjianAkhir              | peranPenguji, jumlahMahasiswa                                                                                  | sksX100  |
|   EDU401   | Membina kegiatan mahasiswa                                                     | hitungPembinaKegiatanMahasiswa       | jumlahSemester                                                                                                 | sksX100  |
|   EDU701   | Menduduki jabatan pimpinan perguruan tinggi                                    | hitungJabatanPimpinanPerguruanTinggi | jabatan, jumlahSemester                                                                                        | sksX100  |

 	Berdasarkan Tabel IV.21, kolom Parameter Masuk sekaligus menjadi spesifikasi skema parameter yang disimpan pada data referensi kegiatan, karena urutan dan tipe parameter pada kolom tersebut dipakai modul orkestrasi untuk menyusun argumen pemanggilan. Konsekuensinya, urutan opsi pada parameter bertipe pilihan wajib identik dengan urutan anggota enumerasi pada kontrak. Sebelas modul perhitungan lain pada Gambar IV.12 telah dirancang dan diimplementasikan namun belum dipautkan ke data referensi, sesuai penjelasan pada subbab IV.1.4.

#### **IV.2.3.2	*Structure Chart* Kontrak Token SKS dan Kontrak Registri Dokumen**

 	Berbeda dengan kontrak kalkulator yang bersifat murni, kedua kontrak lainnya mengubah keadaan *blockchain* sehingga setiap modulnya dijaga modul kontrol akses berbasis peran yang diwarisi dari pustaka OpenZeppelin. *Structure chart* kontrak token SKS disajikan pada Gambar IV.13.

**[SISIPKAN GAMBAR: structure chart kontrak BKDSKSToken dengan modul integrasi token pada lapisan aplikasi sebagai pemanggil, modul mint dan modul burn sebagai modul terpanggil yang masing-masing dijaga modul pemeriksa peran, serta modul pembatas pemindahan yang menahan seluruh jalur transfer bawaan ERC-20]**

Gambar IV.13. *Structure Chart* Kontrak Token SKS

 	Seperti terlihat pada Gambar IV.13, modul pembatas pemindahan tidak dipanggil modul mana pun dari lapisan aplikasi, melainkan disisipkan pada jalur pemutakhiran saldo bawaan standar ERC-20. Rancangan tersebut menjamin bahwa seluruh jalur pemindahan yang disediakan standar, termasuk pemindahan langsung maupun pemindahan atas nama pihak lain, tertahan tanpa perlu menimpa setiap fungsinya satu per satu. *Structure chart* kontrak registri dokumen disajikan pada Gambar IV.14.

**[SISIPKAN GAMBAR: structure chart kontrak BKDDokumenRegistri dengan modul pencatatan jejak dokumen pada lapisan aplikasi sebagai pemanggil, satu modul catat sebagai modul terpanggil yang dijaga modul pemeriksa peran pencatat, dan aliran keluar berupa event DokumenTercatat]**

Gambar IV.14. *Structure Chart* Kontrak Registri Dokumen

 	Berdasarkan Gambar IV.14, kontrak registri hanya memiliki satu modul fungsional. Kesederhanaan tersebut merupakan konsekuensi keputusan rancangan pada subbab IV.1.3.2 butir kesembilan, yaitu kontrak tidak menyimpan status apa pun dan hanya memancarkan *event*, sehingga riwayat pencatatan dibaca kembali melalui penelusuran *event log* dan bukan melalui pembacaan variabel kontrak.

#### **IV.2.3.3	Spesifikasi Modul**

 	Setiap modul pada ketiga *structure chart* dituliskan spesifikasinya sebagai acuan pengodean. Spesifikasi memuat identitas modul, tanggung jawab, parameter masuk beserta batasannya, keluaran, kondisi penolakan, dan kejadian yang dipancarkan. Ringkasan spesifikasi ketiga kontrak disajikan pada Tabel IV.22 sampai dengan Tabel IV.24.

Tabel IV.22. Spesifikasi Modul CD-001 Kontrak Kalkulator BKD Pendidikan


| Atribut           | Keterangan                                                                                                                                                                                                                                          |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pengenal modul    | CD-001                                                                                                                                                                                                                                              |
| Nama kontrak      | KalkulatorBKDPendidikan                                                                                                                                                                                                                             |
| Tanggung jawab    | Mengeksekusi formula Rubrik BKD unsur pendidikan atas parameter kegiatan dan mengembalikan nilai kredit pada skala kali seratus.                                                                                                                    |
| Sifat modul       | Seluruh fungsi bersifat murni, tanpa penyimpanan status, tanpa kontrol akses, dan tanpa kejadian.                                                                                                                                                   |
| Pewarisan         | Tidak ada.                                                                                                                                                                                                                                          |
| Jumlah modul      | Sembilan belas modul perhitungan dan satu modul rekapitulasi.                                                                                                                                                                                       |
| Parameter masuk   | Bilangan bulat tak bertanda untuk besaran terukur, nilai*boolean* untuk penanda kondisi, dan tipe enumerasi untuk pilihan peran, jenis, jabatan, atau lokasi.                                                                                       |
| Keluaran          | Bilangan bulat tak bertanda bernama sksX100.                                                                                                                                                                                                        |
| Kondisi penolakan | Galat khusus InputTidakValid disertai alasan, dipancarkan ketika besaran pengali bernilai nol, ketika realisasi pertemuan melampaui rencana, atau ketika persentase porsi dosen berada di luar rentang satu sampai seratus pada pengampuan bersama. |
| Perilaku khusus   | Realisasi pertemuan kurang dari separuh rencana dan kegiatan yang tidak berlangsung satu semester penuh menghasilkan nilai nol, bukan penolakan.                                                                                                    |

Tabel IV.23. Spesifikasi Modul CD-002 Kontrak Token SKS


| Atribut                   | Keterangan                                                                                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Pengenal modul            | CD-002                                                                                                                                                                                         |
| Nama kontrak              | BKDSKSToken                                                                                                                                                                                    |
| Tanggung jawab            | Mengelola siklus hidup token kredit SKS yang melekat pada alamat*wallet* dosen.                                                                                                                |
| Pewarisan                 | ERC20 dan AccessControl dari pustaka OpenZeppelin.                                                                                                                                             |
| Identitas token           | Nama BKD SKS Token, simbol SKS, jumlah desimal mengikuti nilai baku standar.                                                                                                                   |
| Peran                     | MINTER_ROLE bagi penerbitan token, dan peran administrator kontrak bagi penghapusan token.                                                                                                     |
| Modul mint                | Menerima alamat tujuan, jumlah token, dan referensi berupa*hash* simpulan; menolak alamat nol dan jumlah nol; memancarkan kejadian SKSMinted berisi operator, penerima, jumlah, dan referensi. |
| Modul burn                | Menerima alamat sasaran, jumlah token, dan alasan koreksi; menolak alamat nol dan jumlah nol; memancarkan kejadian SKSBurned berisi operator, pemilik, jumlah, dan alasan.                     |
| Modul pembatas pemindahan | Menahan seluruh pemindahan antar-alamat dengan memancarkan galat khusus TokenNonTransferable, dan hanya meneruskan jalur penerbitan serta penghapusan.                                         |
| Kondisi penolakan         | Galat khusus InvalidAddress untuk alamat nol, penolakan jumlah nol, penolakan pemanggilan oleh alamat tanpa peran yang sesuai, dan galat TokenNonTransferable untuk setiap upaya pemindahan.   |

Tabel IV.24. Spesifikasi Modul CD-003 Kontrak Registri Dokumen


| Atribut            | Keterangan                                                                                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pengenal modul     | CD-003                                                                                                                                                                                            |
| Nama kontrak       | BKDDokumenRegistri                                                                                                                                                                                |
| Tanggung jawab     | Mencatat jejak keberadaan berkas dokumen sebagai kejadian pada*blockchain* tanpa menyimpan isi dokumennya.                                                                                        |
| Pewarisan          | AccessControl dari pustaka OpenZeppelin.                                                                                                                                                          |
| Peran              | PENCATAT_ROLE bagi pencatatan, dan peran administrator kontrak bagi pengelolaan peran.                                                                                                            |
| Modul catat        | Menerima sidik digital dokumen, jenis aksi, dan referensi baris asal; menolak sidik bernilai nol; memancarkan kejadian DokumenTercatat berisi operator, sidik digital, jenis aksi, dan referensi. |
| Penyimpanan status | Tidak ada. Waktu kejadian dibaca dari penanda waktu blok, dan riwayat dibaca melalui penelusuran*event log*.                                                                                      |
| Kondisi penolakan  | Galat khusus InvalidHash untuk sidik bernilai nol, dan penolakan pemanggilan oleh alamat tanpa peran pencatat.                                                                                    |
| Perilaku khusus    | Nilai jenis aksi tidak divalidasi kontrak melainkan ditegakkan lapisan aplikasi sebagai tipe tertutup, agar kontrak tetap dapat dipakai bagi jenis aksi baru tanpa penempatan ulang.              |

 	Berdasarkan Tabel IV.22 sampai dengan Tabel IV.24, terdapat satu perbedaan rancangan yang disengaja pada kontrak token, yaitu penerbitan dan penghapusan token dijaga peran yang berbeda. Penerbitan cukup dijaga peran penerbit karena dijalankan sistem secara otomatis setelah kedua asesor mengesahkan, sedangkan penghapusan dijaga peran administrator kontrak karena merupakan tindakan koreksi yang dijalankan manusia dan berdampak mengurangi kredit yang telah diakui.

### **IV.2.4	Perancangan Basis Data**

 	Perancangan basis data mendefinisikan struktur penyimpanan operasional bagi kesebelas penyimpanan data pada Tabel IV.17. Pemodelan memakai model *entity-relationship* yang diperkenalkan Chen (1976) dengan notasi Chen sebagaimana ditetapkan pada subbab II.1.16, kemudian diturunkan menjadi skema relasional pada PostgreSQL melalui satu berkas skema Prisma yang berperan sebagai sumber kebenaran tunggal beserta migrasi terversi, sesuai batasan perancangan DC-14. Diagram relasi antarentitas disajikan pada Gambar IV.15.

**[SISIPKAN GAMBAR: Entity Relationship Diagram notasi Chen dengan sebelas entitas, yaitu pengguna, periode_bkd, lkd, penugasan_asesor, referensi_kegiatan, kegiatan, unggahan_dokumen, dokumen_kegiatan, hasil_penilaian, simpulan_bkd, dan riwayat_transaksi, beserta relasi dan kardinalitasnya]**

Gambar IV.15. *Entity Relationship Diagram* Sistem LedgerDik

 	Berdasarkan Gambar IV.15, entitas lkd berperan sebagai poros yang menghubungkan dosen, periode, kegiatan, penugasan asesor, dan simpulan. Rancangan tersebut merupakan konsekuensi aturan bisnis BR-05, yaitu setiap dosen memiliki paling banyak satu dokumen BKD per periode untuk setiap jenis, sehingga kombinasi dosen, periode, dan jenis ditetapkan sebagai batasan keunikan. Rekapitulasi entitas beserta atribut kunci dan relasinya disajikan pada Tabel IV.25.

Tabel IV.25. Rekapitulasi Entitas Basis Data


| Kode | Entitas            | Atribut Kunci dan Batasan                                                                                                                | Relasi                                                                                                             |
| :----: | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
|  D1  | pengguna           | Kunci utama id_pengguna; email dan wallet_index wajib unik; peran membedakan ketiga kelompok pengguna.                                   | Satu pengguna memiliki banyak lkd, banyak penugasan asesor, banyak unggahan dokumen, dan banyak riwayat transaksi. |
|  D2  | periode_bkd        | Kunci utama id_periode; hanya satu baris boleh berstatus aktif; memuat tiga pasang tanggal rentang fase dan satu nilai penggantian fase. | Satu periode memiliki banyak lkd dan banyak unggahan dokumen.                                                      |
|  D3  | lkd                | Kunci utama id_lkd; kombinasi id_pengguna, id_periode, dan jenis wajib unik.                                                             | Satu lkd memiliki banyak kegiatan, banyak penugasan asesor, dan tepat satu simpulan.                               |
|  D4  | penugasan_asesor   | Kunci utama id_penugasan; pasangan id_lkd dan urutan wajib unik, demikian pula pasangan id_lkd dan id_asesor.                            | Satu penugasan memiliki banyak hasil penilaian.                                                                    |
|  D5  | referensi_kegiatan | Kunci utama id_referensi; kode_rule wajib unik; fungsi_contract bernilai kosong bagi butir yang tidak diotomatisasi.                     | Satu referensi dipakai banyak kegiatan.                                                                            |
|  D6  | unggahan_dokumen   | Kunci utama id_unggahan; menyimpan keluaran utuh parser dan koreksi administrator pada atribut yang terpisah.                            | Satu unggahan menurunkan banyak kegiatan, dengan relasi bersifat opsional sebagai jejak asal data.                 |
|  D7  | kegiatan           | Kunci utama id_kegiatan; parameter dan detail kegiatan disimpan sebagai dokumen semi-terstruktur.                                        | Satu kegiatan memiliki banyak dokumen bukti dan banyak hasil penilaian.                                            |
|  D8  | dokumen_kegiatan   | Kunci utama id_dokumen; atribut verifikasi menampung muatan hasil pemeriksaan keaslian beserta penanda persetujuan asesor.               | Banyak dokumen bukti dimiliki satu kegiatan.                                                                       |
|  D9  | hasil_penilaian    | Kunci utama id_hasil; pasangan id_kegiatan dan id_penugasan wajib unik sehingga satu asesor hanya memiliki satu penilaian per kegiatan.  | Satu hasil penilaian dapat menurunkan banyak riwayat transaksi.                                                    |
| D10 | simpulan_bkd       | Kunci utama id_simpulan; id_lkd wajib unik sehingga relasinya satu ke satu.                                                              | Satu simpulan dimiliki tepat satu lkd.                                                                             |
| D11 | riwayat_transaksi  | Kunci utama id_transaksi; tx_hash wajib unik; dicatat baik ketika transaksi berhasil maupun gagal.                                       | Banyak riwayat transaksi menunjuk satu hasil penilaian dan satu administrator, keduanya bersifat opsional.         |

 	Berdasarkan Tabel IV.25, ketentuan integritas ditetapkan agar riwayat penilaian tidak dapat hilang. Penghapusan entitas yang menjadi rujukan riwayat penilaian dibatasi, sehingga kegiatan yang telah dinilai maupun penugasan asesor yang telah mengesahkan tidak dapat dihapus. Penghapusan unggahan dokumen tidak menghapus kegiatan yang telah dibentuk darinya, melainkan hanya mengosongkan jejak asal datanya. Nilai berhingga pada atribut status dan jenis dimodelkan sebagai tipe enumerasi, bukan sebagai teks bebas, agar tidak dapat terisi di luar himpunan yang dirancang. Daftar tipe enumerasi disajikan pada Tabel IV.26.

Tabel IV.26. Tipe Enumerasi pada Basis Data


| No. | Nama Enumerasi     | Nilai                                                            |
| :---: | -------------------- | ------------------------------------------------------------------ |
| 1. | peran_pengguna     | dosen, asesor, admin                                             |
| 2. | status_periode     | aktif, nonaktif                                                  |
| 3. | fase_bkd           | pengisian, penilaian, perbaikan, selesai                         |
| 4. | jenis_lkd          | rencana, laporan                                                 |
| 5. | status_lkd         | draft, diajukan, dinilai, final                                  |
| 6. | status_kegiatan    | draft, diajukan, dihitung, disetujui, ditolak, revisi            |
| 7. | status_capaian     | selesai, gagal, beban_lebih                                      |
| 8. | status_perhitungan | berhasil, gagal, tidak_diotomatisasi                             |
| 9. | status_penilaian   | disetujui, ditolak, revisi                                       |
| 10. | status_simpulan    | M, TM                                                            |
| 11. | jenis_transaksi    | mint, burn, catat_dokumen                                        |
| 12. | jenis_unggahan     | st_pengajaran, st_bimbingan, st_pengujian, sk_pembinaan, artefak |
| 13. | status_unggahan    | terparse, gagal, diterapkan                                      |
| 14. | status_transaksi   | pending, success, failed                                         |

 	Berdasarkan Tabel IV.26, terdapat empat belas tipe enumerasi yang membatasi nilai atribut status dan jenis pada kesebelas entitas. Perlu dicatat bahwa enumerasi jenis_transaksi memuat nilai catat_dokumen sehingga riwayat transaksi menampung ketiga jenis interaksi *on-chain* pada satu entitas yang sama, yaitu penerbitan token, penghapusan token, dan pencatatan jejak dokumen.

### **IV.2.5	Perancangan Antarmuka Pengguna**

 	Perancangan antarmuka pengguna menetapkan struktur navigasi dan tata letak halaman bagi ketiga peran. Prinsip yang dipegang adalah menyembunyikan kompleksitas *blockchain* dari pengguna non-teknis sebagaimana dituntut persyaratan NFR-10, sehingga dosen dan asesor tidak pernah dihadapkan pada konsep alamat *wallet*, biaya transaksi, maupun penandatanganan. Perancangan dikerjakan secara iteratif memakai Figma, dimulai dari *wireframe* fidelitas rendah hingga *mockup* fidelitas tinggi, kemudian diturunkan menjadi token desain pada berkas konfigurasi Tailwind CSS.

#### **IV.2.5.1	Arsitektur Navigasi**

 	Navigasi dirancang sebagai tiga ruang kerja terpisah yang ditentukan peran pengguna, dengan satu kerangka tampilan yang sama pada seluruh halaman pasca-autentikasi. Kerangka tersebut terdiri atas bilah sisi berisi menu sesuai peran, bilah atas berisi identitas sistem dan tombol keluar, serta area konten yang diawali jalur navigasi dan judul halaman. Struktur navigasi ketiga ruang kerja disajikan pada Gambar IV.16.

**[SISIPKAN GAMBAR: bagan arsitektur navigasi tiga ruang kerja, memperlihatkan halaman masuk sebagai gerbang, pengalihan berdasarkan peran, serta pohon menu ruang kerja administrator, ruang kerja asesor, dan ruang kerja dosen beserta halaman turunannya]**

Gambar IV.16. Arsitektur Navigasi Sistem LedgerDik

 	Sebagaimana terlihat pada Gambar IV.16, setiap peran memiliki halaman beranda yang berperan sebagai pengalih menuju halaman kerja pertamanya, sehingga upaya mengakses ruang kerja peran lain selalu bermuara kembali ke ruang kerja pengguna yang bersangkutan. Rancangan tersebut merupakan realisasi persyaratan FR-02. Perlu dicatat satu ketentuan yang disengaja, yaitu ruang kerja dosen juga dapat diakses pengguna berperan asesor, karena asesor pada dasarnya juga merupakan dosen yang melaporkan beban kerjanya sendiri. Daftar halaman pada ketiga ruang kerja disajikan pada Tabel IV.27.

Tabel IV.27. Daftar Halaman Sistem per Peran


| Peran         | Halaman                      | Fungsi Utama                                                                                                                                |
| --------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Publik        | Masuk                        | Menerima surel dan kata sandi, lalu mengalihkan pengguna ke ruang kerja perannya.                                                           |
| Administrator | Pengguna                     | Menambah akun, menyunting identitas, serta mengaktifkan dan menonaktifkan akun.                                                             |
|               | *Wallet*                     | Menetapkan alamat*wallet* kustodian bagi dosen dan asesor yang belum memilikinya.                                                           |
|               | Periode                      | Menambah dan menyunting periode beserta rentang fasenya, mengaktifkan periode, dan menetapkan nilai penggantian fase.                       |
|               | Penugasan Asesor             | Menugaskan dua asesor pada setiap dokumen BKD, baik satu per satu maupun secara massal.                                                     |
|               | Referensi Kegiatan           | Menyajikan daftar butir aturan beserta skema parameter dan status otomatisasinya.                                                           |
|               | Kegiatan                     | Menginput dan menghapus kegiatan berbasis penugasan atas nama seorang dosen.                                                                |
|               | Unggah Dokumen               | Mengunggah berkas SK dan ST, memantau status ekstraksi, dan menghapus unggahan.                                                             |
|               | Detail Unggahan              | Menampilkan pratinjau pemetaan, menerima koreksi per baris, dan menerapkan hasil ekstraksi.                                                 |
|               | Token                        | Menampilkan saldo token setiap dosen dan menjalankan koreksi token disertai alasan.                                                         |
|               | Log*Blockchain*              | Menampilkan riwayat penerbitan dan penghapusan token yang dibaca dari*blockchain*.                                                          |
|               | Registri Dokumen             | Menampilkan riwayat pencatatan jejak dokumen beserta penautannya ke baris asalnya.                                                          |
|               | Rekapitulasi                 | Menyajikan rekapitulasi kredit diajukan dan disahkan per dosen pada periode aktif.                                                          |
|               | Profil                       | Menampilkan data akun yang sedang masuk sebagai tampilan baca saja.                                                                         |
| Asesor        | Asesor BKD                   | Menampilkan daftar dokumen BKD yang ditugaskan beserta status kesiapannya untuk dinilai.                                                    |
|               | Penilaian                    | Menampilkan seluruh kegiatan yang diklaim, menerima nilai dan catatan per kegiatan, serta mengesahkan penilaian.                            |
|               | Detail Bukti                 | Menampilkan dokumen bukti beserta hasil pemeriksaan keasliannya, menjalankan pemeriksaan ulang, dan menyetujui hasil secara manual.         |
|               | Profil                       | Menampilkan data akun yang sedang masuk sebagai tampilan baca saja.                                                                         |
| Dosen         | Pengajaran                   | Menampilkan kegiatan pengajaran hasil penerapan dokumen penugasan sebagai tampilan baca saja.                                               |
|               | Daftar Kegiatan per Kategori | Menampilkan kegiatan pada satu kategori, serta menambah, menyunting, dan menghapus kegiatan yang bersumber dari input mandiri.              |
|               | Detail Kegiatan              | Menampilkan rincian kegiatan beserta dokumen buktinya, dan menerima penyuntingan rincian yang diizinkan.                                    |
|               | Unggah Bukti                 | Menerima pengunggahan dan penghapusan dokumen bukti pada suatu kegiatan.                                                                    |
|               | Rekap Kegiatan               | Menampilkan daftar periode beserta dokumen BKD dosen dan membuat dokumen BKD periode berjalan.                                              |
|               | Detail Rekap Kegiatan        | Menarik kegiatan ke dokumen BKD per seksi, menetapkan capaian, membatalkan klaim, serta menyimpan dokumen secara sementara maupun permanen. |
|               | Profil                       | Menampilkan data akun yang sedang masuk sebagai tampilan baca saja.                                                                         |

#### **IV.2.5.2	Rancangan Tampilan Antarmuka**

 	Berdasarkan daftar halaman pada Tabel IV.27, rancangan tampilan disusun bagi seluruh halaman. Pada subbab ini disajikan tiga rancangan yang mewakili ketiga peran sekaligus mewakili tiga pola tata letak yang dipakai berulang, yaitu halaman gerbang tanpa kerangka, halaman kerja berbasis seksi, dan halaman kerja berbasis formulir per baris. Rancangan halaman lainnya mengikuti salah satu dari ketiga pola tersebut. Rancangan halaman masuk disajikan pada Gambar IV.17.

**[SISIPKAN GAMBAR: rancangan antarmuka halaman masuk, berupa kartu terpusat berisi logo dan nama sistem, isian surel, isian kata sandi dengan tombol penampil, dan tombol masuk]**

Gambar IV.17. Rancangan Antarmuka Halaman Masuk

 	Rincian komponen penyusun halaman masuk beserta persyaratan yang direalisasikannya disajikan pada Tabel IV.28.

Tabel IV.28. Rancangan Antarmuka Halaman Masuk


| No. | Komponen         | Keterangan                                                                                | FR Terkait |
| :---: | ------------------ | ------------------------------------------------------------------------------------------- | :----------: |
| 1. | Identitas sistem | Menampilkan logo dan nama sistem sebagai penanda halaman gerbang.                         | Tidak ada |
| 2. | Isian surel      | Menerima alamat surel akun dengan tipe masukan yang sesuai.                               |   FR-01   |
| 3. | Isian kata sandi | Menerima kata sandi dengan tampilan tersamar dan tombol penampil sementara.               |   FR-01   |
| 4. | Tombol masuk     | Mengirimkan kredensial dan menampilkan indikator proses selama verifikasi berlangsung.    |   FR-01   |
| 5. | Pesan kesalahan  | Menampilkan satu pesan seragam bagi kredensial yang salah maupun akun yang dinonaktifkan. |   FR-01   |

 	Berdasarkan Tabel IV.28, pesan kesalahan sengaja dirancang seragam bagi ketiga penyebab kegagalan, yaitu surel tidak terdaftar, kata sandi keliru, dan akun dinonaktifkan. Rancangan tersebut mencegah halaman masuk dipakai untuk menyimpulkan surel mana yang terdaftar pada sistem. Rancangan halaman rekap kegiatan dosen disajikan pada Gambar IV.18.

**[SISIPKAN GAMBAR: rancangan antarmuka halaman detail rekap kegiatan dosen, memperlihatkan bilah sisi menu dosen, tiga tab biodata, pendidikan, dan simpulan, panel daftar seksi A sampai J di sisi kiri area konten, tabel kegiatan per seksi di sisi kanan, serta bilah aksi bawah berisi tombol simpan sementara dan simpan permanen]**

Gambar IV.18. Rancangan Antarmuka Halaman Detail Rekap Kegiatan Dosen

 	Rincian komponen penyusun halaman tersebut disajikan pada Tabel IV.29.

Tabel IV.29. Rancangan Antarmuka Halaman Detail Rekap Kegiatan Dosen


| No. | Komponen                 | Keterangan                                                                                                             |  FR Terkait  |
| :---: | -------------------------- | ------------------------------------------------------------------------------------------------------------------------ | :-------------: |
| 1. | Tab bagian dokumen       | Memisahkan biodata, daftar kegiatan unsur pendidikan, dan simpulan pada satu halaman yang sama.                        |     FR-17     |
| 2. | Panel daftar seksi       | Menampilkan seksi A sampai J beserta jumlah kegiatan yang telah diklaim pada masing-masing seksi.                      |     FR-15     |
| 3. | Tabel kegiatan per seksi | Menampilkan kegiatan pada seksi terpilih beserta parameter, nilai kredit, status capaian, dan tautan dokumen buktinya. | FR-15, FR-16 |
| 4. | Tombol tarik data        | Menarik kegiatan portofolio ke dokumen BKD, baik untuk seluruh seksi maupun untuk satu seksi terpilih.                 |     FR-15     |
| 5. | Kendali status capaian   | Menerima penetapan status capaian pada setiap kegiatan yang telah diklaim.                                             |     FR-16     |
| 6. | Tombol batal klaim       | Mengembalikan satu kegiatan dari dokumen BKD ke daftar portofolio.                                                     |     FR-15     |
| 7. | Bilah aksi bawah         | Menyediakan tombol simpan sementara dan simpan permanen, dengan tombol simpan permanen dilindungi dialog konfirmasi.   | FR-17, NFR-09 |

 	Berdasarkan Tabel IV.29, tombol simpan permanen dirancang tidak aktif selama masih terdapat seksi wajib yang belum berisi kegiatan yang diklaim. Rancangan tersebut mencegah dokumen BKD terkunci dalam keadaan tidak lengkap, mengingat penyimpanan permanen merupakan aksi yang tidak dapat dibatalkan sekaligus prasyarat pengesahan asesor. Rancangan halaman penilaian asesor disajikan pada Gambar IV.19.

**[SISIPKAN GAMBAR: rancangan antarmuka halaman penilaian asesor, memperlihatkan kepala halaman berisi identitas dosen dan periode, tabel kegiatan dengan kolom isian nilai disetujui, status, dan catatan per baris, penanda temuan pada baris yang dokumen buktinya tidak sesuai, serta bilah aksi bawah berisi tombol simpan penilaian dan sahkan penilaian]**

Gambar IV.19. Rancangan Antarmuka Halaman Penilaian Asesor

 	Rincian komponen penyusun halaman tersebut disajikan pada Tabel IV.30.

Tabel IV.30. Rancangan Antarmuka Halaman Penilaian Asesor


| No. | Komponen                   | Keterangan                                                                                                                    |  FR Terkait  |
| :---: | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | :-------------: |
| 1. | Kepala halaman             | Menampilkan identitas dosen yang dinilai, periode berjalan, urutan asesor, dan status pengesahan.                             |     FR-21     |
| 2. | Tabel kegiatan             | Menampilkan seluruh kegiatan yang diklaim beserta parameter, nilai hasil perhitungan kontrak, dan tautan dokumen buktinya.    |     FR-20     |
| 3. | Isian nilai disetujui      | Menerima nilai kredit yang disetujui asesor pada setiap baris kegiatan, dengan nilai hasil perhitungan sebagai nilai awalnya. |     FR-20     |
| 4. | Kendali status dan catatan | Menerima status penilaian beserta catatan, dengan catatan diwajibkan pada status selain disetujui.                            |     FR-20     |
| 5. | Penanda temuan bukti       | Menandai baris yang dokumen buktinya berstatus tidak cocok atau peran tidak sesuai dan belum disetujui secara manual.         |     FR-29     |
| 6. | Tautan detail bukti        | Membuka halaman rincian dokumen bukti beserta daftar nama dan peran yang terbaca.                                             |     FR-30     |
| 7. | Bilah aksi bawah           | Menyediakan tombol simpan penilaian dan tombol sahkan penilaian, dengan pengesahan dilindungi dialog konfirmasi.              | FR-21, NFR-09 |

 	Berdasarkan Tabel IV.30, tombol sahkan penilaian dirancang hanya dapat dijalankan setelah seluruh kegiatan yang diklaim telah dinilai dan seluruh nilainya berstatus disetujui. Rancangan tersebut menjaga agar pengesahan tidak menghasilkan simpulan yang memuat kegiatan yang masih dipersoalkan. Seluruh rancangan pada subbab IV.2 selanjutnya direalisasikan menjadi kode program sebagaimana diuraikan pada subbab IV.3.

## **IV.3	Implementasi**

 	Subbab ini memaparkan realisasi rancangan pada subbab IV.2 menjadi kode program yang dapat dieksekusi. Implementasi dikerjakan berurutan mengikuti ketergantungan antarlapisan sebagaimana ditetapkan pada subbab III.5.3. Lapisan *on-chain* dikerjakan terlebih dahulu karena menjadi sumber kebenaran perhitungan sekaligus bersifat *immutable* setelah ditempatkan. Lapisan basis data dikerjakan berikutnya melalui pendefinisian skema dan penerapan migrasi. Lapisan aplikasi web dikerjakan setelahnya, dan lapisan ekstraksi dokumen dikerjakan sebagai layanan mandiri yang dapat dikembangkan serta diuji terpisah.

 	Setiap subbab modul disajikan dengan struktur yang seragam, yaitu paragraf pembuka yang menyatakan fungsi modul beserta persyaratan fungsional yang direalisasikannya, potongan kode inti beserta penjelasan logikanya, hasil implementasi berupa tangkapan layar atau keluaran eksekusi, dan tabel keterkaitan *requirement* sebagai penutup. Penyajian difokuskan pada logika inti; kode pendukung seperti *boilerplate* kerangka kerja, definisi tipe hasil pembangkitan, dan penataan tampilan tidak ditampilkan. Setiap potongan kode disajikan sebagai satu tabel berkolom tunggal berjudul agar ikut terdaftar pada Daftar Tabel, dengan isi tabel memakai huruf Courier New sembilan poin.

### **IV.3.1	Lingkungan Pengembangan**

 	Implementasi dikerjakan pada satu lingkungan pengembangan lokal yang menjalankan seluruh lapisan sistem secara bersamaan, yaitu aplikasi web, basis data, layanan ekstraksi dokumen, dan jaringan simulasi *blockchain*. Spesifikasi lingkungan tersebut disajikan pada Tabel IV.31.

Tabel IV.31. Spesifikasi Lingkungan Pengembangan


| No. | Komponen                          | Spesifikasi                                           |
| :---: | ----------------------------------- | ------------------------------------------------------- |
| 1. | Perangkat pengembangan            | **[LENGKAPI: merek dan tipe perangkat]**              |
| 2. | Prosesor                          | **[LENGKAPI: nama prosesor dan jumlah inti]**         |
| 3. | Memori                            | **[LENGKAPI: kapasitas RAM]**                         |
| 4. | Penyimpanan                       | **[LENGKAPI: kapasitas dan jenis penyimpanan]**       |
| 5. | Sistem operasi                    | macOS**[LENGKAPI: versi]**                            |
| 6. | Editor kode                       | Visual Studio Code                                    |
| 7. | Lingkungan eksekusi JavaScript    | Node.js**[LENGKAPI: versi]**                          |
| 8. | Lingkungan eksekusi Python        | Python 3.12                                           |
| 9. | Basis data                        | PostgreSQL 16 dalam*container* Docker                 |
| 10. | Jaringan pengembangan*blockchain* | Jaringan simulasi Hardhat dengan tipe rantai OP Stack |
| 11. | Jaringan sasaran penempatan       | Base Sepolia,*chain id* 84532                         |
| 12. | Peramban pengujian                | **[LENGKAPI: nama dan versi peramban]**               |
| 13. | Sistem kontrol versi              | Git dengan repositori terpusat pada GitHub            |

 	Berdasarkan Tabel IV.31, jaringan simulasi Hardhat dikonfigurasi memakai tipe rantai OP Stack agar perilaku eksekusinya sepadan dengan jaringan sasaran, mengingat Base merupakan jaringan *Layer-2* yang dibangun di atas OP Stack. Basis data dan layanan ekstraksi dijalankan sebagai *container* terpisah melalui berkas komposisi, sehingga seluruh lapisan dapat dihidupkan dengan satu perintah.

### **IV.3.2	Matriks Implementasi**

 	Sebelum uraian tiap modul disajikan, keterkaitan antara modul implementasi, spesifikasi proses yang direalisasikannya, dan persyaratan fungsional yang dipenuhinya dirangkum pada Tabel IV.32. Matriks ini menjadi peta penelusuran dari rancangan pada subbab IV.2 menuju kode program, sekaligus menjadi dasar penyusunan objek pengujian pada subbab IV.4.

Tabel IV.32. Matriks Implementasi Modul


| Subbab | Modul Implementasi                                           | Lapisan                    | PSPEC                                  | FR yang Direalisasikan                          |
| :-------: | -------------------------------------------------------------- | ---------------------------- | ---------------------------------------- | ------------------------------------------------- |
| IV.3.3 | *Smart Contract* Kalkulator BKD Pendidikan                   | *On-chain*                 | PSPEC-10                               | FR-18                                           |
| IV.3.4 | *Smart Contract* Token SKS                                   | *On-chain*                 | PSPEC-14                               | FR-24, FR-25                                    |
| IV.3.5 | *Smart Contract* Registri Dokumen                            | *On-chain*                 | PSPEC-21                               | FR-33                                           |
| IV.3.6 | Integrasi*Blockchain*                                        | Aplikasi web               | PSPEC-09, PSPEC-13, PSPEC-15           | FR-04, FR-18, FR-23, FR-24, FR-25, FR-26        |
| IV.3.7 | Autentikasi dan Otorisasi                                    | Aplikasi web               | PSPEC-01                               | FR-01, FR-02, FR-32                             |
| IV.3.8 | Pengelolaan Pengguna,*Wallet*, Periode, dan Penugasan Asesor | Aplikasi web               | PSPEC-02, PSPEC-03, PSPEC-04           | FR-03, FR-04, FR-05, FR-06, FR-07               |
| IV.3.9 | Ekstraksi dan Penerapan Dokumen                              | Ekstraksi dan aplikasi web | PSPEC-05, PSPEC-06, PSPEC-07, PSPEC-20 | FR-09, FR-10, FR-11, FR-12, FR-31               |
| IV.3.10 | Pengelolaan Kegiatan dan Dokumen BKD                         | Aplikasi web               | PSPEC-08, PSPEC-09                     | FR-08, FR-13, FR-14, FR-15, FR-16, FR-17, FR-19 |
| IV.3.11 | Verifikasi Keaslian Dokumen Bukti                            | Ekstraksi dan aplikasi web | PSPEC-16, PSPEC-17, PSPEC-18, PSPEC-19 | FR-28, FR-29, FR-30                             |
| IV.3.12 | Penilaian, Simpulan, dan Penerbitan Token                    | Aplikasi web               | PSPEC-11, PSPEC-12, PSPEC-13           | FR-20, FR-21, FR-22, FR-23, FR-24               |
| IV.3.13 | Registri Dokumen, Log*Blockchain*, dan Rekapitulasi          | Aplikasi web               | PSPEC-15, PSPEC-21                     | FR-26, FR-27, FR-34                             |

 	Berdasarkan Tabel IV.32, seluruh tiga puluh empat persyaratan fungsional terdistribusi pada sebelas modul implementasi tanpa ada persyaratan yang tidak terpetakan. Beberapa persyaratan muncul pada lebih dari satu modul karena realisasinya melintasi lapisan, misalnya FR-24 yang diwujudkan modul kontrak token pada lapisan *on-chain* sekaligus modul integrasi *blockchain* dan modul penilaian pada lapisan aplikasi web.

### **IV.3.3	Implementasi Modul *Smart Contract* Kalkulator BKD Pendidikan**

 	Modul ini merealisasikan PSPEC-10 dan menjadi mesin aturan yang mengeksekusi Rubrik BKD unsur pendidikan, sehingga memenuhi FR-18. Kontrak ditulis memakai Solidity dan dikompilasi dengan versi kompilator 0.8.28 beserta pengoptimal yang diaktifkan pada dua ratus putaran. Kontrak tidak mewarisi kontrak lain, tidak memiliki variabel keadaan, tidak memancarkan kejadian, dan tidak memiliki kontrol akses, sehingga seluruh fungsinya dapat dipanggil siapa pun tanpa menghasilkan transaksi. Seluruh nilai kembalian bertipe bilangan bulat tak bertanda pada skala kali seratus.

 	Fungsi hitungPengajaran merupakan fungsi paling kompleks pada kontrak ini karena memuat gerbang ambang realisasi, gerbang keberlangsungan semester, perhitungan proporsional, dan pembagian porsi pada pengampuan bersama. Potongan kodenya disajikan pada Tabel IV.33.

Tabel IV.33. Potongan Kode Implementasi Fungsi hitungPengajaran

```solidity
function hitungPengajaran(
    uint256 sksMataKuliah,
    uint256 jumlahPertemuanRencana,
    uint256 jumlahPertemuanRealisasi,
    bool semesterPenuh,
    bool teamTeaching,
    uint256 persenPorsiDosen
) public pure returns (uint256 sksX100) {
    if (sksMataKuliah == 0) {
        revert InputTidakValid("sksMataKuliah harus > 0");
    }
    if (jumlahPertemuanRencana == 0) {
        revert InputTidakValid("jumlahPertemuanRencana harus > 0");
    }
    if (jumlahPertemuanRealisasi > jumlahPertemuanRencana) {
        revert InputTidakValid("jumlahPertemuanRealisasi tidak valid");
    }

    uint256 persentaseRealisasi =
        (jumlahPertemuanRealisasi * 100) / jumlahPertemuanRencana;
    if (persentaseRealisasi < 50) {
        return 0;
    }
    if (!semesterPenuh) {
        return 0;
    }

    uint256 sksDasarX100 =
        (sksMataKuliah * 100 * jumlahPertemuanRealisasi)
        / jumlahPertemuanRencana;

    if (teamTeaching) {
        if (persenPorsiDosen == 0 || persenPorsiDosen > 100) {
            revert InputTidakValid("persenPorsiDosen harus 1..100");
        }
        return (sksDasarX100 * persenPorsiDosen) / 100;
    }

    return sksDasarX100;
}
```

 	Berdasarkan Tabel IV.33, terdapat tiga hal yang perlu dijelaskan. Pertama, urutan pemeriksaan sengaja menempatkan penolakan masukan tidak valid sebelum gerbang ambang, sehingga masukan yang mustahil, yaitu realisasi melampaui rencana, tetap ditolak dan tidak diperlakukan sebagai nilai nol. Kedua, realisasi kurang dari separuh rencana dan kegiatan yang tidak berlangsung satu semester penuh menghasilkan nilai nol dan bukan penolakan, karena keduanya merupakan hasil penilaian yang sah menurut Rubrik BKD sesuai aturan bisnis BR-15. Ketiga, perkalian dengan seratus dikerjakan sebelum pembagian dengan jumlah pertemuan rencana agar pemotongan pecahan hanya terjadi satu kali pada langkah terakhir.

 	Fungsi hitungPembimbinganTugasAkhir mewakili pola perhitungan berbasis tabel tarif, yaitu delapan butir rubrik yang berbeda hanya pada bobotnya digabungkan ke dalam satu fungsi dengan dua parameter bertipe enumerasi sebagai pembedanya. Potongan kodenya disajikan pada Tabel IV.34.

Tabel IV.34. Potongan Kode Implementasi Fungsi hitungPembimbinganTugasAkhir

```solidity
function hitungPembimbinganTugasAkhir(
    PeranPembimbing peran,
    JenisTugasAkhir jenisTugasAkhir,
    uint256 jumlahMahasiswa
) public pure returns (uint256 sksX100) {
    if (jumlahMahasiswa == 0) {
        revert InputTidakValid("jumlahMahasiswa harus > 0");
    }

    uint256 nilaiPerMahasiswaX100;

    if (jenisTugasAkhir == JenisTugasAkhir.Disertasi) {
        nilaiPerMahasiswaX100 =
            peran == PeranPembimbing.PembimbingUtama ? 133 : 100;
    } else if (jenisTugasAkhir == JenisTugasAkhir.Tesis) {
        nilaiPerMahasiswaX100 =
            peran == PeranPembimbing.PembimbingUtama ? 100 : 75;
    } else {
        nilaiPerMahasiswaX100 =
            peran == PeranPembimbing.PembimbingUtama ? 50 : 25;
    }

    return nilaiPerMahasiswaX100 * jumlahMahasiswa;
}
```

 	Berdasarkan Tabel IV.34, nilai 133 merupakan representasi 1,33 SKS pada skala kali seratus yang dituliskan sebagai konstanta, bukan hasil pembagian pada saat eksekusi. Penulisan sebagai konstanta dipilih agar nilai yang dihasilkan identik dengan angka yang tercantum pada Rubrik BKD, sehingga tidak muncul selisih akibat pemotongan pecahan. Hasil kompilasi ketiga kontrak beserta penempatannya pada jaringan simulasi disajikan pada Gambar IV.20.

**[SISIPKAN GAMBAR: keluaran terminal perintah kompilasi dan penempatan kontrak, memperlihatkan pesan kompilasi tiga berkas Solidity dengan solc 0.8.28 dan alamat ketiga kontrak yang berhasil ditempatkan]**

Gambar IV.20. Hasil Kompilasi dan Penempatan Kontrak pada Jaringan Simulasi

 	Keterkaitan modul ini terhadap persyaratan yang direalisasikannya disajikan pada Tabel IV.35.

Tabel IV.35. Realisasi *Requirement* Modul *Smart Contract* Kalkulator BKD Pendidikan


|  Kode  | *Requirement*                                                                                                                            |  PSPEC  | Status Implementasi |
| :------: | ------------------------------------------------------------------------------------------------------------------------------------------ | :--------: | :-------------------: |
| FR-18 | Sistem harus menghitung nilai kredit kegiatan melalui pemanggilan fungsi pada*smart contract* kalkulator berdasarkan parameter kegiatan. | PSPEC-10 |   Terimplementasi   |
| NFR-01 | Nilai kredit yang dihasilkan harus identik dengan hasil perhitungan manual berdasarkan Rubrik BKD.                                       | PSPEC-10 |   Terimplementasi   |
| NFR-02 | Hasil perhitungan untuk parameter yang sama harus konsisten pada pemanggilan berulang.                                                   | PSPEC-10 |   Terimplementasi   |
| NFR-07 | Setiap butir aturan yang diotomatisasi harus terwujud sebagai satu fungsi mandiri.                                                       | PSPEC-10 |   Terimplementasi   |
| NFR-08 | Fungsi perhitungan harus dapat diuji tanpa memerlukan basis data maupun antarmuka.                                                       | PSPEC-10 |   Terimplementasi   |

### **IV.3.4	Implementasi Modul *Smart Contract* Token SKS**

 	Modul ini merealisasikan PSPEC-14 dan mengelola siklus hidup kredit yang telah disahkan, sehingga memenuhi FR-24 dan FR-25. Kontrak mewarisi implementasi ERC20 dan AccessControl dari pustaka OpenZeppelin versi 5, dengan nama token BKD SKS Token dan simbol SKS. Pembatasan kewenangan dibagi menjadi dua, yaitu penerbitan token dijaga peran penerbit dan penghapusan token dijaga peran administrator kontrak. Pembagian tersebut dipilih karena penerbitan dijalankan sistem secara otomatis setelah kedua asesor mengesahkan, sedangkan penghapusan merupakan tindakan koreksi yang dijalankan manusia.

 	Sifat *non-transferable* diwujudkan dengan menimpa satu fungsi internal yang menjadi jalur tunggal seluruh pemutakhiran saldo pada pustaka OpenZeppelin versi 5. Potongan kodenya disajikan pada Tabel IV.36.

Tabel IV.36. Potongan Kode Implementasi Pembatasan Pemindahan Token

```solidity
function _update(
    address from,
    address to,
    uint256 value
) internal override {
    // izinkan mint
    if (from == address(0)) {
        super._update(from, to, value);
        return;
    }

    // izinkan burn
    if (to == address(0)) {
        super._update(from, to, value);
        return;
    }

    // selain itu, transfer dilarang
    revert TokenNonTransferable();
}
```

 	Berdasarkan Tabel IV.36, pendekatan menimpa satu jalur tunggal dipilih karena lebih andal dibandingkan menimpa setiap fungsi pemindahan satu per satu. Seluruh jalur pemindahan yang disediakan standar ERC-20, yaitu pemindahan langsung maupun pemindahan atas nama pihak lain melalui mekanisme persetujuan, pada akhirnya bermuara pada fungsi internal tersebut, sehingga tidak ada jalur yang terlewat. Penerbitan token beserta pencatatan referensinya disajikan pada Tabel IV.37.

Tabel IV.37. Potongan Kode Implementasi Fungsi mint dan burn

```solidity
function mint(
    address to,
    uint256 amount,
    string calldata referenceId
) external onlyRole(MINTER_ROLE) {
    if (to == address(0)) revert InvalidAddress();
    require(amount > 0, "Amount must be > 0");

    _mint(to, amount);
    emit SKSMinted(msg.sender, to, amount, referenceId);
}

function burn(
    address account,
    uint256 amount,
    string calldata reason
) external onlyRole(DEFAULT_ADMIN_ROLE) {
    if (account == address(0)) revert InvalidAddress();
    require(amount > 0, "Amount must be > 0");

    _burn(account, amount);
    emit SKSBurned(msg.sender, account, amount, reason);
}
```

 	Berdasarkan Tabel IV.37, parameter referenceId pada fungsi penerbitan diisi *hash* simpulan penilaian, sehingga setiap penerbitan token membawa penunjuk yang dapat dihitung ulang dari dokumen simpulan. Parameter reason pada fungsi penghapusan diisi alasan koreksi, sehingga koreksi kredit tidak pernah terjadi tanpa keterangan. Kedua nilai tersebut tercatat permanen pada kejadian yang dipancarkan dan dapat dibaca pihak mana pun melalui penjelajah blok. Hasil penerbitan token yang tercatat pada penjelajah blok disajikan pada Gambar IV.21.

**[SISIPKAN GAMBAR: tangkapan layar Basescan yang memperlihatkan transaksi penerbitan token beserta event SKSMinted, alamat penerima, jumlah token, dan referenceId berupa hash simpulan]**

Gambar IV.21. Transaksi Penerbitan Token pada Penjelajah Blok

 	Keterkaitan modul ini terhadap persyaratan yang direalisasikannya disajikan pada Tabel IV.38.

Tabel IV.38. Realisasi *Requirement* Modul *Smart Contract* Token SKS


|  Kode  | *Requirement*                                                                                            |  PSPEC  | Status Implementasi |
| :------: | ---------------------------------------------------------------------------------------------------------- | :--------: | :-------------------: |
| FR-24 | Sistem harus menerbitkan token kredit SKS yang bersifat*non-transferable* ke alamat *wallet* dosen.      | PSPEC-14 |   Terimplementasi   |
| FR-25 | Sistem harus dapat menghapus token pada alamat*wallet* dosen disertai alasan koreksi.                    | PSPEC-14 |   Terimplementasi   |
| NFR-06 | Hasil penilaian yang telah disahkan harus dapat dibuktikan keasliannya oleh pihak di luar penyelenggara. | PSPEC-14 |   Terimplementasi   |

### **IV.3.5	Implementasi Modul *Smart Contract* Registri Dokumen**

 	Modul ini merealisasikan PSPEC-21 dan mencatat jejak keberadaan berkas dokumen pada *blockchain*, sehingga memenuhi FR-33. Kontrak mewarisi AccessControl dari pustaka OpenZeppelin dan menjaga satu-satunya fungsi tulisnya dengan peran pencatat. Berbeda dengan kedua kontrak lain, kontrak ini tidak memiliki variabel keadaan sama sekali dan hanya memancarkan kejadian, sesuai keputusan rancangan pada subbab IV.1.3.2 butir kesembilan. Potongan kodenya disajikan pada Tabel IV.39.

Tabel IV.39. Potongan Kode Implementasi Fungsi catat

```solidity
event DokumenTercatat(
    address indexed operator,
    bytes32 indexed hashDokumen,
    string aksi,
    string referensi
);

function catat(
    bytes32 hashDokumen,
    string calldata aksi,
    string calldata referensi
) external onlyRole(PENCATAT_ROLE) {
    if (hashDokumen == bytes32(0)) revert InvalidHash();

    emit DokumenTercatat(msg.sender, hashDokumen, aksi, referensi);
}
```

 	Berdasarkan Tabel IV.39, dua parameter pertama kejadian ditandai terindeks agar penelusuran berdasarkan alamat operator maupun berdasarkan sidik digital dokumen dapat dijalankan langsung oleh penyedia RPC tanpa membaca seluruh riwayat. Nilai parameter aksi sengaja tidak divalidasi kontrak melainkan ditegakkan lapisan aplikasi sebagai tipe tertutup bernilai unggah, terapkan, atau hapus. Keputusan tersebut menjaga agar penambahan jenis aksi baru di kemudian hari tidak menuntut penempatan ulang kontrak yang akan mengubah alamatnya. Keterkaitan modul ini terhadap persyaratan yang direalisasikannya disajikan pada Tabel IV.40.

Tabel IV.40. Realisasi *Requirement* Modul *Smart Contract* Registri Dokumen


| Kode | *Requirement*                                                                                                          |  PSPEC  | Status Implementasi |
| :-----: | ------------------------------------------------------------------------------------------------------------------------ | :--------: | :-------------------: |
| FR-33 | Sistem harus mencatatkan sidik digital berkas ke kontrak registri pada saat dokumen diunggah, diterapkan, dan dihapus. | PSPEC-21 |   Terimplementasi   |

### **IV.3.6	Implementasi Modul Integrasi *Blockchain***

 	Modul ini merealisasikan PSPEC-09, PSPEC-13, dan PSPEC-15 pada sisi lapisan aplikasi web, dan berperan sebagai satu-satunya pintu aplikasi menuju jaringan *blockchain*. Pemusatan seluruh akses *on-chain* pada satu berkas merupakan realisasi persyaratan NFR-07, sehingga perubahan konfigurasi jaringan tidak tersebar pada banyak berkas. Modul ini memisahkan penggunaan penyedia dan penanda tangan menurut sifat pemanggilannya, yaitu kontrak kalkulator disambungkan ke penyedia saja karena seluruh fungsinya bersifat murni, sedangkan kontrak token dan kontrak registri disambungkan ke penanda tangan peladen karena keduanya menghasilkan transaksi.

 	Pemanggilan fungsi perhitungan dijalankan secara dinamis berdasarkan skema parameter pada data referensi kegiatan, sehingga penambahan butir aturan baru tidak menuntut penambahan kode pemanggil. Potongan kodenya disajikan pada Tabel IV.41.

Tabel IV.41. Potongan Kode Implementasi Fungsi hitungViaKontrak

```typescript
export async function hitungViaKontrak(
  fungsi: string,
  fields: { name: string; type: string; options?: string[] }[],
  values: Record<string, string>
): Promise<bigint> {
  const contract = getKalkulatorContract() as any;
  if (typeof contract[fungsi] !== "function") {
    throw new Error(`Fungsi kontrak tidak dikenal: ${fungsi}`);
  }
  const args = fields.map((f) => {
    const raw = values[f.name];
    if (f.type === "boolean") return raw === "true" || raw === "on";
    if (f.type === "select") {
      const idx = (f.options ?? []).indexOf(raw);
      if (idx < 0) throw new Error(`Opsi tidak valid untuk ${f.name}: ${raw}`);
      return BigInt(idx);
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) throw new Error(`Nilai tidak valid untuk ${f.name}`);
    return BigInt(Math.round(n));
  });
  const hasil: bigint = await contract[fungsi](...args);
  return hasil;
}
```

 	Berdasarkan Tabel IV.41, parameter bertipe pilihan dikonversi menjadi indeks opsi pada daftar yang tersimpan di data referensi. Konsekuensi rancangan tersebut adalah urutan opsi pada data referensi wajib identik dengan urutan anggota enumerasi pada kontrak, sebagaimana telah dinyatakan pada subbab IV.2.3.1. Ketidaksesuaian urutan tidak akan memunculkan galat melainkan menghasilkan nilai yang keliru secara diam-diam, sehingga kesesuaian tersebut diuji secara khusus pada subbab IV.4.5.

 	Penurunan alamat *wallet* dosen beserta penjagaannya terhadap pemakaian frasa induk publik disajikan pada Tabel IV.42.

Tabel IV.42. Potongan Kode Implementasi Fungsi deriveDosenWallet

```typescript
const DEFAULT_HARDHAT_MNEMONIC =
  "test test test test test test test test test test test junk";

export function deriveDosenWallet(index: number): { address: string; path: string } {
  const phrase = process.env.WALLET_MNEMONIC;
  if (!phrase) throw new Error("WALLET_MNEMONIC belum diset di environment");

  if (phrase.trim() === DEFAULT_HARDHAT_MNEMONIC &&
      process.env.NEXT_PUBLIC_CHAIN_ID !== "31337") {
    throw new Error(
      "WALLET_MNEMONIC masih memakai mnemonic default Hardhat (publik, dipakai " +
      "semua orang di dunia). Address yang diturunkan darinya akan bentrok dengan " +
      "pengguna lain di jaringan publik."
    );
  }

  const path = `m/44'/60'/0'/0/${index}`;
  const wallet = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(phrase), path);
  return { address: wallet.address, path };
}
```

 	Berdasarkan Tabel IV.42, hanya alamat dan jalur turunan yang dikembalikan fungsi tersebut, sedangkan kunci privatnya tidak pernah keluar dari peladen. Penjagaan terhadap frasa induk bawaan Hardhat ditambahkan karena frasa tersebut bersifat publik dan dipakai luas, sehingga alamat yang diturunkan darinya akan bertabrakan dengan pengguna lain apabila dipakai pada jaringan publik. Penjagaan hanya berlaku ketika jaringan sasaran bukan jaringan simulasi lokal, sehingga pengembangan lokal tetap dapat berjalan tanpa penyiapan tambahan.

 	Penghitungan referensi transaksi dan konversi satuan token disajikan pada Tabel IV.43.

Tabel IV.43. Potongan Kode Implementasi Fungsi hashPenilaian dan keSatuanToken

```typescript
export function hashPenilaian(payload: unknown): string {
  const canonical = JSON.stringify(payload, Object.keys(payload as object).sort());
  return keccak256(toUtf8Bytes(canonical));
}

export function keSatuanToken(jumlahX100: bigint, decimals: number): bigint {
  return (jumlahX100 * 10n ** BigInt(decimals)) / 100n;
}
```

 	Berdasarkan Tabel IV.43, penghitungan *hash* dijalankan atas bentuk JSON kanonis dengan kunci yang diurutkan, sehingga muatan yang sama selalu menghasilkan *hash* identik tanpa dipengaruhi urutan penulisan atributnya. Sifat inilah yang memungkinkan pihak luar membuktikan keaslian simpulan dengan menghitung ulang nilainya. Konversi satuan token dikerjakan sepenuhnya dengan aritmetika bilangan bulat besar tanpa bilangan pecahan, dan pembagian dengan seratus selalu habis karena jumlah desimal token bernilai jauh lebih besar dari dua.

 	Pembacaan riwayat kejadian dari jaringan dijalankan secara berjenjang sebagai realisasi persyaratan NFR-12. Potongan kodenya disajikan pada Tabel IV.44.

Tabel IV.44. Potongan Kode Implementasi Pembacaan *Event* Berjenjang

```typescript
const MAX_BLOCK_RANGE = 10_000;

async function queryFilterChunked(contract, filter, fromBlock: number, toBlock: number) {
  const events = [];
  for (let start = fromBlock; start <= toBlock; start += MAX_BLOCK_RANGE) {
    const end = Math.min(start + MAX_BLOCK_RANGE - 1, toBlock);
    events.push(...(await contract.queryFilter(filter, start, end)));
  }
  return events;
}
```

 	Berdasarkan Tabel IV.44, penelusuran dimulai dari blok penempatan kontrak dan bukan dari blok nol, karena jaringan Base Sepolia telah memuat jutaan blok sehingga penelusuran dari awal rantai menghabiskan waktu tanpa hasil tambahan. Batas sepuluh ribu blok per permintaan ditetapkan mengikuti kebijakan penyedia RPC yang dipakai. Keterkaitan modul ini terhadap persyaratan yang direalisasikannya disajikan pada Tabel IV.45.

Tabel IV.45. Realisasi *Requirement* Modul Integrasi *Blockchain*


|  Kode  | *Requirement*                                                                                                                         |       PSPEC       | Status Implementasi |
| :------: | --------------------------------------------------------------------------------------------------------------------------------------- | :------------------: | :-------------------: |
| FR-04 | Sistem harus dapat menetapkan alamat*wallet* kustodian bagi dosen yang diturunkan secara deterministik dari frasa induk pada peladen. |      PSPEC-02      |   Terimplementasi   |
| FR-18 | Sistem harus menghitung nilai kredit kegiatan melalui pemanggilan fungsi pada*smart contract* kalkulator.                             |      PSPEC-09      |   Terimplementasi   |
| FR-23 | Sistem harus menghitung*hash* kriptografi atas muatan simpulan penilaian.                                                             |      PSPEC-12      |   Terimplementasi   |
| FR-24 | Sistem harus menerbitkan token kredit SKS ke alamat*wallet* dosen.                                                                    |      PSPEC-13      |   Terimplementasi   |
| FR-25 | Sistem harus dapat menghapus token pada alamat*wallet* dosen disertai alasan koreksi.                                                 |      PSPEC-13      |   Terimplementasi   |
| FR-26 | Sistem harus menampilkan riwayat penerbitan dan penghapusan token dengan pembacaan berjenjang.                                        |      PSPEC-15      |   Terimplementasi   |
| NFR-04 | Kunci privat tidak boleh terpapar ke sisi klien.                                                                                      | PSPEC-02, PSPEC-13 |   Terimplementasi   |
| NFR-12 | Pembacaan riwayat*event* tidak boleh melampaui batas rentang blok penyedia RPC.                                                       |      PSPEC-15      |   Terimplementasi   |

### **IV.3.7	Implementasi Modul Autentikasi dan Otorisasi**

 	Modul ini merealisasikan PSPEC-01 dan memenuhi FR-01, FR-02, serta FR-32. Autentikasi dibangun memakai NextAuth.js dengan penyedia kredensial dan sesi berbasis JWT tanpa tabel sesi pada basis data. Verifikasi kata sandi dijalankan terhadap *hash* bcrypt yang tersimpan, sehingga kata sandi asli tidak pernah disimpan sistem. Potongan kode fungsi verifikasi kredensial disajikan pada Tabel IV.46.

Tabel IV.46. Potongan Kode Implementasi Verifikasi Kredensial

```typescript
async authorize(credentials) {
  if (!credentials?.email || !credentials.password) return null;

  const user = await prisma.pengguna.findUnique({
    where: { email: credentials.email },
  });
  if (!user || !user.aktif || !user.password_hash) return null;

  const valid = await bcrypt.compare(credentials.password, user.password_hash);
  if (!valid) return null;

  return {
    id: user.id_pengguna,
    name: user.nama,
    email: user.email,
    peran: user.peran,
  } as any;
}
```

 	Berdasarkan Tabel IV.46, seluruh kondisi kegagalan mengembalikan nilai kosong yang sama, yaitu surel tidak terdaftar, akun dinonaktifkan, dan kata sandi keliru. Keseragaman tersebut menghasilkan satu pesan kesalahan yang sama pada antarmuka, sehingga halaman masuk tidak dapat dipakai untuk menyimpulkan surel mana yang terdaftar pada sistem. Pemeriksaan penanda aktif ditempatkan pada titik ini agar akun yang dinonaktifkan tertolak sejak awal tanpa perlu pemeriksaan tambahan pada setiap halaman.

 	Otorisasi dijalankan pada lapisan *middleware* yang menyaring setiap permintaan sebelum mencapai halaman mana pun. Potongan kodenya disajikan pada Tabel IV.47.

Tabel IV.47. Potongan Kode Implementasi Pembatasan Akses per Peran

```typescript
export default withAuth(
  function middleware(req) {
    const peran = req.nextauth.token?.peran as string | undefined;
    const path = req.nextUrl.pathname;

    const wrongRole =
      (path.startsWith("/admin") && peran !== "admin") ||
      (path.startsWith("/asesor") && peran !== "asesor") ||
      (path.startsWith("/dosen") && peran !== "dosen" && peran !== "asesor");

    if (wrongRole) {
      const home = peran === "admin" ? "/admin"
                 : peran === "asesor" ? "/asesor" : "/dosen";
      return NextResponse.redirect(new URL(home, req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: ["/dosen/:path*", "/asesor/:path*", "/admin/:path*"],
};
```

 	Berdasarkan Tabel IV.47, pengguna berperan asesor sengaja diizinkan mengakses ruang kerja dosen, karena asesor pada dasarnya juga merupakan dosen yang melaporkan beban kerjanya sendiri. Perlakuan terhadap peran yang tidak sesuai berupa pengalihan ke beranda peran pengguna, bukan penolakan dengan kode kesalahan, agar pengguna tidak terjebak pada halaman buntu. Perlu ditegaskan bahwa *middleware* hanya memeriksa peran dan tidak memeriksa kepemilikan data, sehingga pemeriksaan kepemilikan dikerjakan ulang pada setiap halaman dan setiap *server action* yang menyentuh data milik pengguna tertentu. Tampilan halaman masuk disajikan pada Gambar IV.22.

 	Perlu dicatat pula satu konsekuensi dari pembatasan cakupan *matcher* pada potongan kode di atas. Karena *matcher* hanya mencakup ketiga awalan ruang kerja, dua titik akhir pada direktori API berada di luar penyaringan *middleware*, yaitu titik akhir penyajian berkas dan titik akhir pembacaan daftar butir aturan. Titik akhir penyajian berkas memeriksa keberadaan sesi secara mandiri dan menolak permintaan tanpa sesi, serta menolak jalur berkas yang memuat pola penelusuran direktori, namun belum memeriksa peran maupun kepemilikan berkas yang diminta. Titik akhir pembacaan daftar butir aturan tidak memeriksa sesi sama sekali karena isinya berupa data acuan Rubrik BKD yang bersifat publik. Kondisi tersebut dinyatakan terbuka sebagai kelemahan pada realisasi NFR-05 dan menjadi dasar rekomendasi penguatan pada saran Bab VI.

**[SISIPKAN GAMBAR: tangkapan layar halaman masuk sistem LedgerDik]**

Gambar IV.22. Tampilan Halaman Masuk

 	Keterkaitan modul ini terhadap persyaratan yang direalisasikannya disajikan pada Tabel IV.48.

Tabel IV.48. Realisasi *Requirement* Modul Autentikasi dan Otorisasi


|  Kode  | *Requirement*                                                                                                     |  PSPEC  | Status Implementasi |
| :------: | ------------------------------------------------------------------------------------------------------------------- | :--------: | :-------------------: |
| FR-01 | Sistem harus menyediakan mekanisme masuk memakai surel dan kata sandi dengan verifikasi terhadap*hash* tersimpan. | PSPEC-01 |   Terimplementasi   |
| FR-02 | Sistem harus membatasi akses halaman berdasarkan peran pengguna.                                                  | PSPEC-01 |   Terimplementasi   |
| FR-32 | Sistem harus menampilkan data profil akun pengguna yang sedang masuk sebagai tampilan baca saja.                  | PSPEC-01 |   Terimplementasi   |
| NFR-04 | Kata sandi pengguna tidak boleh tersimpan dalam bentuk asli.                                                      | PSPEC-01 |   Terimplementasi   |
| NFR-05 | Setiap akses halaman terlindungi harus disertai sesi yang sah dan peran yang sesuai.                              | PSPEC-01 |   Terimplementasi   |

### **IV.3.8	Implementasi Modul Pengelolaan Pengguna, *Wallet*, Periode, dan Penugasan Asesor**

 	Modul ini merealisasikan PSPEC-02, PSPEC-03, dan PSPEC-04, sehingga memenuhi FR-03 sampai FR-07. Keempat kelompok fungsi tersebut disatukan pada satu subbab karena seluruhnya merupakan penyiapan data induk yang dikerjakan administrator sebelum siklus penilaian dimulai. Seluruh mutasi dijalankan sebagai *server action* dengan pola yang seragam, yaitu pembacaan data formulir, validasi, penulisan ke basis data, penyegaran laman, dan pengalihan kembali disertai pesan hasil.

 	Aturan bisnis BR-03 menetapkan hanya satu periode boleh berstatus aktif pada satu waktu. Aturan tersebut diwujudkan sebagai satu transaksi basis data yang menonaktifkan seluruh periode lain sekaligus mengaktifkan periode terpilih, sebagaimana disajikan pada Tabel IV.49.

Tabel IV.49. Potongan Kode Implementasi Pengaktifan Periode

```typescript
export async function aktifkanPeriode(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect(withFlash(DASAR, { err: "Periode tidak dikenal" }));

  const [, p] = await prisma.$transaction([
    prisma.periode_bkd.updateMany({
      where: { status: "aktif" },
      data: { status: "nonaktif" },
    }),
    prisma.periode_bkd.update({
      where: { id_periode: id },
      data: { status: "aktif" },
    }),
  ]);
  revalidatePath(DASAR);
  redirect(withFlash(DASAR, {
    ok: `Periode ${p.nama_periode} diaktifkan — periode lain dinonaktifkan`,
  }));
}
```

 	Berdasarkan Tabel IV.49, kedua operasi dibungkus satu transaksi sehingga tidak pernah muncul keadaan antara dengan dua periode aktif maupun tanpa periode aktif sama sekali. Penetapan fase yang sedang berjalan beserta gerbang aksi yang diturunkan darinya disajikan pada Tabel IV.50.

Tabel IV.50. Potongan Kode Implementasi Penentuan Fase dan Gerbang Aksi

```typescript
export function faseAktif(periode: any, now: Date = new Date()): Fase {
  if (periode?.fase_override) return periode.fase_override as Fase;
  if (inRange(now, periode?.pengisian_mulai, periode?.pengisian_selesai)) return "pengisian";
  if (inRange(now, periode?.penilaian_mulai, periode?.penilaian_selesai)) return "penilaian";
  if (inRange(now, periode?.perbaikan_mulai, periode?.perbaikan_selesai)) return "perbaikan";
  if (periode?.pengisian_mulai && now < periode.pengisian_mulai) return "pengisian";
  return "selesai";
}

export const bolehDosenInput    = (f: Fase) => f === "pengisian";
export const bolehDosenPerbaiki = (f: Fase) => f === "pengisian" || f === "perbaikan";
export const bolehAsesorNilai   = (f: Fase) => f === "penilaian" || f === "perbaikan";

export function bolehUbahBukti(kegiatan: any): boolean {
  const fase = faseAktif(kegiatan?.lkd?.periode_bkd);
  if (!kegiatan?.lkd?.simpan_permanen && bolehDosenInput(fase)) return true;
  return bolehDosenPerbaiki(fase) && perluPerbaikan(kegiatan);
}
```

 	Berdasarkan Tabel IV.50, nilai penggantian manual diperiksa paling awal sehingga selalu mengungguli perbandingan tanggal. Ketentuan tersebut diperlukan agar administrator dapat memindahkan fase tanpa mengubah rentang tanggal periode, misalnya ketika jadwal penilaian dimajukan. Fungsi bolehUbahBukti dirancang sebagai gerbang tunggal yang dipakai bersama oleh *server action* dan antarmuka, sehingga keduanya tidak pernah berbeda. Pemeriksaan tetap dijalankan di sisi peladen karena penyembunyian tombol pada antarmuka bukan merupakan pengaman; kiriman formulir dapat dibuat secara manual. Tampilan halaman pengelolaan periode dan halaman penugasan asesor disajikan pada Gambar IV.23 dan Gambar IV.24.

**[SISIPKAN GAMBAR: tangkapan layar halaman pengelolaan periode, memperlihatkan daftar periode beserta fase berjalan, rentang tanggal, dan kendali pengaktifan]**

Gambar IV.23. Tampilan Halaman Pengelolaan Periode

**[SISIPKAN GAMBAR: tangkapan layar halaman penugasan asesor, memperlihatkan daftar dokumen BKD beserta dua slot asesor dan kendali penugasan massal]**

Gambar IV.24. Tampilan Halaman Penugasan Asesor

 	Keterkaitan modul ini terhadap persyaratan yang direalisasikannya disajikan pada Tabel IV.51.

Tabel IV.51. Realisasi *Requirement* Modul Pengelolaan Pengguna, *Wallet*, Periode, dan Penugasan Asesor


| Kode | *Requirement*                                                                                                             |  PSPEC  | Status Implementasi |
| :-----: | --------------------------------------------------------------------------------------------------------------------------- | :--------: | :-------------------: |
| FR-03 | Sistem harus menyediakan penambahan akun pengguna beserta pengisian identitasnya dan pengaktifan serta penonaktifan akun. | PSPEC-02 |   Terimplementasi   |
| FR-04 | Sistem harus dapat menetapkan alamat*wallet* kustodian dengan indeks penurunan yang unik.                                 | PSPEC-02 |   Terimplementasi   |
| FR-05 | Sistem harus menyediakan penambahan periode BKD dan menjamin hanya satu periode aktif.                                    | PSPEC-03 |   Terimplementasi   |
| FR-06 | Sistem harus menentukan fase yang sedang berjalan dan membatasi aksi sesuai fase tersebut.                                | PSPEC-03 |   Terimplementasi   |
| FR-07 | Sistem harus dapat menugaskan dua asesor berbeda pada satu dokumen BKD.                                                   | PSPEC-04 |   Terimplementasi   |

### **IV.3.9	Implementasi Modul Ekstraksi dan Penerapan Dokumen**

 	Modul ini merealisasikan PSPEC-05, PSPEC-06, PSPEC-07, dan PSPEC-20, sehingga memenuhi FR-09 sampai FR-12 dan FR-31. Implementasinya terbagi pada dua lapisan, yaitu layanan ekstraksi berbahasa Python yang mengubah berkas menjadi data terstruktur, dan lapisan aplikasi web yang memetakan hasil ekstraksi menjadi kegiatan, menerima koreksi administrator, lalu menerapkannya.

 	Layanan ekstraksi dibangun memakai FastAPI dan menyediakan lima titik akhir ekstraksi ditambah satu titik akhir pemeriksaan kesehatan. Setiap titik akhir ekstraksi dilindungi kunci API pada *header* permintaan, sedangkan titik akhir pemeriksaan kesehatan dibiarkan terbuka agar aplikasi web dapat memantau ketersediaan layanan tanpa membocorkan kunci. Daftar titik akhir beserta mesin ekstraksinya disajikan pada Tabel IV.52.

Tabel IV.52. Titik Akhir Layanan Ekstraksi Dokumen


| Titik Akhir         | Mesin Ekstraksi     | Dokumen Sasaran                                                                          |      Butir Aturan Sasaran      |
| --------------------- | --------------------- | ------------------------------------------------------------------------------------------ | :------------------------------: |
| /parse/pengajaran   | pdfplumber          | Surat Penugasan Pengajaran                                                               |             EDU101             |
| /parse/bimbingan    | pdfplumber          | Surat Tugas Pembimbing Praktik Kerja Lapangan dan Surat Keputusan Pembimbing Tugas Akhir |         EDU202, EDU203         |
| /parse/pengujian    | pdfplumber          | Surat Tugas Penguji Tugas Akhir                                                          |             EDU301             |
| /parse/sk-pembinaan | Model bahasa visual | Surat Keputusan Pembina Organisasi Kemahasiswaan hasil pemindaian                        |             EDU401             |
| /parse/artefak      | Model bahasa visual | Dokumen bukti kegiatan yang tidak berformat baku                                         | EDU202, EDU203, EDU301, EDU401 |
| /health             | Tidak ada           | Pemeriksaan ketersediaan layanan                                                         |           Tidak ada           |

 	Berdasarkan Tabel IV.52, ketiga titik akhir jalur deterministik memakai pendekatan yang berbeda meskipun sama-sama bertumpu pada pdfplumber, karena struktur lampiran ketiga dokumen tersebut berbeda. Lampiran Surat Penugasan Pengajaran memiliki bingkai lengkap pada setiap sel, sehingga sel dibentuk langsung dari persegi panjang bingkai dan setiap kata ditempatkan menurut titik tengahnya. Lampiran Surat Tugas Pembimbing hanya memiliki sebagian garis, sehingga batas kolom disimpulkan dari posisi garis tegak dan peran setiap kolom dibaca dari teks kepala tabelnya, bukan dari urutan kolom. Lampiran Surat Tugas Penguji tidak memiliki garis baris sama sekali, sehingga baris disimpulkan dari posisi teks dengan nomor induk mahasiswa sebagai jangkarnya.

 	Validasi hasil ekstraksi jalur deterministik tidak bertumpu pada kecocokan format semata, melainkan pada invarian dokumen. Sebagai contoh, pada lampiran Surat Penugasan Pengajaran diperiksa bahwa jumlah beban teori dan beban praktik sama dengan bobot SKS yang tercantum, serta jumlah jam sama dengan beban teori ditambah dua kali beban praktik. Pemeriksaan berbasis invarian tersebut memungkinkan pergeseran kolom terdeteksi sebagai temuan, bukan lolos sebagai angka yang tampak wajar.

 	Hasil ekstraksi kemudian dipetakan menjadi calon kegiatan pada lapisan aplikasi web. Agar koreksi administrator tetap menempel pada baris yang benar meskipun dokumen diproses ulang, setiap baris diberi penanda stabil yang tidak bergantung pada indeks. Potongan kodenya disajikan pada Tabel IV.53.

Tabel IV.53. Potongan Kode Implementasi Pemberian Penanda Baris

```typescript
function bubuhiTanda(daftar: TanpaTanda[]): PenugasanTerpetakan[] {
  const terpakai = new Map<string, number>();
  return daftar.map((p) => {
    const dasar = `${p.kodeRule}|${kunciNama(p.namaDokumen)}|${p.judul}`;
    const ke = (terpakai.get(dasar) ?? 0) + 1;
    terpakai.set(dasar, ke);
    return { ...p, tanda: ke === 1 ? dasar : `${dasar}#${ke}` };
  });
}
```

 	Berdasarkan Tabel IV.53, penanda disusun dari kode butir aturan, kunci nama dosen tanpa gelar, dan judul asli baris. Penggunaan indeks baris sengaja dihindari karena pengurutan hasil ekstraksi dapat berubah ketika dokumen diproses ulang, sehingga koreksi yang menempel pada indeks akan berpindah ke baris yang salah. Koreksi administrator disimpan sebagai selisih terhadap keluaran parser dan digabungkan di dalam memori pada saat penerapan, sebagaimana disajikan pada Tabel IV.54.

Tabel IV.54. Potongan Kode Implementasi Penggabungan Koreksi Administrator

```typescript
export function gabungKoreksi(peta: PemetaanDokumen, koreksi: unknown) {
  const surat = (koreksi as PetaKoreksi | null)?._surat ?? {};
  const nomorSurat = teks(surat.nomor) ?? peta.nomorSurat;
  const tanggalSurat = teks(surat.tanggal) ?? peta.tanggalSurat;

  const penugasan = peta.penugasan.map((p) => {
    const k = koreksiBaris(koreksi, p.tanda);
    const parameter = { ...p.parameter, ...(k.parameter ?? {}) };
    const judul = teks(k.judul) ?? p.judul;

    const dikoreksi =
      Boolean(teks(k.judul) && k.judul !== p.judul) ||
      Boolean(k.id_pengguna) ||
      Object.keys(k.parameter ?? {}).some(
        (nama) => String(parameter[nama]) !== String(p.parameter[nama])
      );

    return {
      ...p, judul, parameter,
      judulAsli: p.judul,
      parameterAsli: p.parameter,
      dikoreksi,
      lewati: Boolean(k.lewati),
      idPenggunaPaksa: k.id_pengguna ?? null,
    };
  });

  return { penugasan, nomorSurat, tanggalSurat };
}
```

 	Berdasarkan Tabel IV.54, keluaran parser tidak pernah diubah sehingga jejak audit tetap dapat dibandingkan dengan apa yang akhirnya diterapkan, sesuai aturan bisnis BR-18. Nilai asal setiap baris tetap dibawa pada atribut judulAsli dan parameterAsli agar antarmuka dapat menampilkan hasil ekstraksi berdampingan dengan koreksinya, sebagaimana dituntut persyaratan SA-USB-04.

 	Penerapan hasil ekstraksi dirancang idempoten per baris sehingga administrator dapat menerapkan dokumen yang sama berulang kali tanpa menggandakan kegiatan. Potongan kodenya disajikan pada Tabel IV.55.

Tabel IV.55. Potongan Kode Implementasi Penerapan Idempoten per Baris

```typescript
// Baris yang sama (tanda_baris) dari unggahan ini: perbarui, jangan gandakan.
const adaSebelumnya = await prisma.kegiatan.findFirst({
  where: {
    id_unggahan: rec!.id_unggahan,
    id_lkd: idLkd,
    detail_kegiatan: { path: ["tanda_baris"], equals: p.tanda },
  },
});

// Unggahan lain (dokumen sama diunggah ulang / baris lama tanpa tanda_baris)
// dikenali lewat judul PLUS nomor surat.
const seragam =
  adaSebelumnya ??
  (await prisma.kegiatan.findFirst({
    where: {
      id_lkd: idLkd,
      id_referensi: ref.id_referensi,
      judul: p.judulAsli,
      ...(p.detail?.no_sk
        ? { detail_kegiatan: { path: ["no_sk"], equals: p.detail.no_sk } }
        : {}),
    },
  }));

if (seragam) {
  if (seragam.diklaim) {
    terkunci++;   // sudah masuk laporan dosen, jangan diubah
    continue;
  }
  ...
}
```

 	Berdasarkan Tabel IV.55, pencocokan dijalankan dua tahap. Tahap pertama memakai penanda baris pada unggahan yang sama. Tahap kedua dipakai ketika dokumen yang sama diunggah sebagai berkas baru, dan mensyaratkan kecocokan judul asli sekaligus nomor surat. Persyaratan nomor surat diperlukan karena judul kegiatan pembimbingan bersifat generik dan identik lintas surat yang berbeda, sehingga tanpa syarat tersebut dua surat berbeda akan digabung menjadi satu kegiatan yang saling menimpa. Kegiatan yang telah diklaim dosen tidak pernah diubah, sesuai aturan bisnis BR-19. Tampilan halaman unggah dokumen dan halaman pratinjau pemetaan disajikan pada Gambar IV.25 dan Gambar IV.26.

**[SISIPKAN GAMBAR: tangkapan layar halaman unggah dokumen, memperlihatkan ubin ringkasan status, penyaring jenis dokumen, indikator kesehatan layanan parser, dan daftar unggahan]**

Gambar IV.25. Tampilan Halaman Unggah Dokumen Penugasan

**[SISIPKAN GAMBAR: tangkapan layar halaman pratinjau pemetaan, memperlihatkan baris hasil ekstraksi beserta status pencocokan dosen, penanda baris yang dikoreksi, dan tombol terapkan]**

Gambar IV.26. Tampilan Halaman Pratinjau Pemetaan Hasil Ekstraksi

 	Keterkaitan modul ini terhadap persyaratan yang direalisasikannya disajikan pada Tabel IV.56.

Tabel IV.56. Realisasi *Requirement* Modul Ekstraksi dan Penerapan Dokumen


|  Kode  | *Requirement*                                                                                                                 |  PSPEC  | Status Implementasi |
| :------: | ------------------------------------------------------------------------------------------------------------------------------- | :--------: | :-------------------: |
| FR-09 | Sistem harus dapat menerima unggahan berkas SK dan ST untuk diekstraksi menjadi baris penugasan terstruktur.                  | PSPEC-05 |   Terimplementasi   |
| FR-10 | Sistem harus menampilkan pratinjau pemetaan beserta temuan validasi dan status pencocokan dosen.                              | PSPEC-06 |   Terimplementasi   |
| FR-11 | Sistem harus dapat menerima koreksi atau penandaan lewati tanpa mengubah hasil ekstraksi asli.                                | PSPEC-07 |   Terimplementasi   |
| FR-12 | Sistem harus dapat menerapkan hasil ekstraksi secara idempoten per baris dan melampirkan berkas sumber sebagai dokumen bukti. | PSPEC-07 |   Terimplementasi   |
| FR-31 | Sistem harus menyediakan penginputan kegiatan berbasis penugasan atas nama seorang dosen bagi administrator.                  | PSPEC-20 |   Terimplementasi   |
| NFR-14 | Hasil ekstraksi tidak boleh menjadi sumber kebenaran tunggal tanpa koreksi administrator.                                     | PSPEC-07 |   Terimplementasi   |

### **IV.3.10	Implementasi Modul Pengelolaan Kegiatan dan Dokumen BKD**

 	Modul ini merealisasikan PSPEC-08 dan PSPEC-09 pada sisi dosen, sehingga memenuhi FR-08, FR-13 sampai FR-17, dan FR-19. Formulir kegiatan tidak ditulis tetap melainkan dibangkitkan dari skema parameter pada data referensi butir aturan, sehingga penambahan butir aturan baru tidak menuntut penambahan halaman baru. Parameter yang nilainya telah ditentukan konteks pelaporan tidak pernah dibaca dari formulir, sebagaimana disajikan pada Tabel IV.57.

Tabel IV.57. Potongan Kode Implementasi Pembacaan Parameter Kegiatan

```typescript
export const PARAMETER_TETAP: Record<string, number> = {
  jumlahSemester: 1,
};

export function fieldFormulir<T extends { name: string }>(fields: T[]): T[] {
  return fields.filter((f) => !(f.name in PARAMETER_TETAP));
}

export function bacaParameterForm(
  fields: { name: string; type: string }[],
  formData: FormData
): { parameter: Record<string, any>; rawValues: Record<string, string> } {
  const parameter: Record<string, any> = {};
  const rawValues: Record<string, string> = {};

  for (const f of fields) {
    const tetap = PARAMETER_TETAP[f.name];
    const raw =
      tetap !== undefined ? String(tetap) : String(formData.get(`p_${f.name}`) ?? "");
    rawValues[f.name] = raw;
    parameter[f.name] =
      f.type === "boolean" ? raw === "true" || raw === "on"
      : f.type === "number" ? Number(raw)
      : raw;
  }

  return { parameter, rawValues };
}
```

 	Berdasarkan Tabel IV.57, parameter jumlahSemester selalu bernilai satu karena satu dokumen BKD mencakup tepat satu periode yang setara satu semester. Nilai tersebut diambil dari konstanta dan bukan dari masukan, sehingga kiriman formulir yang dibuat secara manual pun tidak dapat mengubahnya. Ketentuan ini penting karena parameter tersebut merupakan pengali langsung pada sembilan fungsi perhitungan, sehingga pemalsuan nilainya akan langsung menggandakan kredit yang dihasilkan.

 	Setiap penyimpanan kegiatan memicu perhitungan ulang nilai kredit melalui kontrak kalkulator sesuai aturan bisnis BR-16. Pemanggilan tersebut dibungkus penanganan kesalahan sehingga kegagalannya tidak membatalkan penyimpanan kegiatan, melainkan menandai status perhitungannya sebagai gagal. Butir aturan yang tidak memiliki fungsi kontrak ditandai berstatus tidak diotomatisasi sebagai realisasi FR-19, sehingga asesor mengetahui bahwa nilai kegiatan tersebut harus ditetapkannya sendiri. Tampilan halaman daftar kegiatan dan halaman rekap kegiatan disajikan pada Gambar IV.27 dan Gambar IV.28.

**[SISIPKAN GAMBAR: tangkapan layar halaman daftar kegiatan dosen pada satu kategori, memperlihatkan kolom parameter, nilai SKS hasil perhitungan kontrak, sumber data, dan status]**

Gambar IV.27. Tampilan Halaman Daftar Kegiatan Dosen

 	Satu ketidakseragaman ditemukan pada penerapan gerbang fase di modul ini dan dinyatakan terbuka. Sebagian besar aksi pada dokumen BKD, yaitu penambahan, penyuntingan, penghapusan kegiatan, penarikan kegiatan ke dokumen BKD, serta penyimpanan sementara dan permanen, dijaga tiga lapis pemeriksaan sekaligus, yaitu kepemilikan dokumen, penanda simpan permanen, dan gerbang fase. Dua aksi lain, yaitu pembatalan klaim kegiatan dan penetapan status capaian, baru dijaga dua lapis pertama tanpa gerbang fase. Akibatnya kedua aksi tersebut masih dapat dijalankan di luar fase pengisian selama dokumen BKD belum disimpan permanen. Ketidakseragaman ini merupakan kelemahan pada realisasi FR-06 dan menjadi dasar rekomendasi penyeragaman gerbang fase pada saran Bab VI.

**[SISIPKAN GAMBAR: tangkapan layar halaman detail rekap kegiatan dosen, memperlihatkan panel seksi A sampai J, tabel kegiatan yang diklaim, dan bilah aksi simpan sementara serta simpan permanen]**

Gambar IV.28. Tampilan Halaman Detail Rekap Kegiatan Dosen

 	Keterkaitan modul ini terhadap persyaratan yang direalisasikannya disajikan pada Tabel IV.58.

Tabel IV.58. Realisasi *Requirement* Modul Pengelolaan Kegiatan dan Dokumen BKD


|  Kode  | *Requirement*                                                                                                     |  PSPEC  | Status Implementasi |
| :------: | ------------------------------------------------------------------------------------------------------------------- | :--------: | :-------------------: |
| FR-08 | Sistem harus menyediakan daftar referensi kegiatan beserta skema parameter dan pemetaannya ke fungsi perhitungan. | PSPEC-09 |   Terimplementasi   |
| FR-13 | Sistem harus menyediakan penambahan, penyuntingan, dan penghapusan kegiatan beserta parameternya bagi dosen.      | PSPEC-08 |   Terimplementasi   |
| FR-14 | Sistem harus menyediakan pengunggahan dan penghapusan dokumen bukti pada suatu kegiatan.                          | PSPEC-08 |   Terimplementasi   |
| FR-15 | Sistem harus dapat menarik kegiatan ke dokumen BKD periode berjalan dan membatalkan klaim tersebut.               | PSPEC-08 |   Terimplementasi   |
| FR-16 | Sistem harus dapat menetapkan status capaian kegiatan.                                                            | PSPEC-08 |   Terimplementasi   |
| FR-17 | Sistem harus menyediakan penyimpanan dokumen BKD secara sementara maupun permanen.                                | PSPEC-08 |   Terimplementasi   |
| FR-19 | Sistem harus menandai kegiatan yang butir aturannya tidak diotomatisasi.                                          | PSPEC-09 |   Terimplementasi   |
| NFR-09 | Aksi yang tidak dapat dibatalkan harus dilindungi konfirmasi eksplisit.                                           | PSPEC-08 |   Terimplementasi   |

### **IV.3.11	Implementasi Modul Verifikasi Keaslian Dokumen Bukti**

 	Modul ini merealisasikan PSPEC-16 sampai PSPEC-19, sehingga memenuhi FR-28, FR-29, dan FR-30. Pemeriksaan dijalankan atas dokumen bukti pada rumpun kegiatan pembimbingan, yaitu butir EDU201, EDU202, dan EDU203, karena ketiganya merupakan butir yang pembuktiannya bersandar pada dokumen unggahan dosen dan yang nilai kreditnya dipengaruhi peran. Penyeleksian dokumen yang memenuhi syarat pemeriksaan disajikan pada Tabel IV.59.

Tabel IV.59. Potongan Kode Implementasi Penyeleksian Dokumen yang Diperiksa

```typescript
export function bisaDiverifikasi(dok: {
  file_url?: string | null;
  jenis_file?: string | null;
}): boolean {
  return (
    parserDikonfigurasi() &&
    Boolean(dok.file_url?.startsWith("/uploads/")) &&
    (/\.pdf$/i.test(dok.file_url ?? "") || dok.jenis_file === "application/pdf")
  );
}
```

 	Berdasarkan Tabel IV.59, hanya berkas PDF yang tersimpan pada peladen yang diperiksa. Bukti berupa pranala luar sengaja tidak diperiksa karena isinya berada di luar kendali sistem dan dapat berubah setelah pemeriksaan dijalankan, sehingga hasil pemeriksaan atasnya akan menyesatkan. Pemeriksaan juga dilewati ketika layanan ekstraksi belum dikonfigurasi, sehingga sistem tetap dapat dijalankan pada lingkungan tanpa layanan tersebut.

 	Pemeriksaan itu sendiri dirancang tidak pernah melempar galat ke pemanggilnya, sebagaimana disajikan pada Tabel IV.60.

Tabel IV.60. Potongan Kode Implementasi Pemeriksaan Nama pada Dokumen Bukti

```typescript
export async function verifikasiNamaBukti(
  fileUrl: string,
  namaFileAsli: string | null,
  namaDosen: string,
  infoKegiatan?: InfoKegiatan
): Promise<HasilVerifikasi> {
  const dasar: HasilVerifikasi = {
    status: "gagal",
    nama_akun: namaDosen,
    nama_terdeteksi: [],
    diperiksa_pada: new Date().toISOString(),
  };

  try {
    const lokal = path.join(process.cwd(), "public", fileUrl.replace(/^\/+/, ""));
    const bytes = await readFile(lokal);
    const file = new File([new Uint8Array(bytes)], namaFileAsli ?? path.basename(lokal), {
      type: "application/pdf",
    });

    const hasil = await parseDokumen("artefak", file);
    const orang: any[] = Array.isArray(hasil?.dokumen?.orang) ? hasil.dokumen.orang : [];
    const perDosen: any[] = Array.isArray(hasil?.per_dosen) ? hasil.per_dosen : [];
    const namaTerdeteksi = [ ...new Set(
      [...perDosen.map((d) => d?.nama), ...orang.map((o) => o?.nama)]
        .map((n) => String(n ?? "").trim())
        .filter(Boolean)
    )];
    ...
  } catch (e: any) {
    return { ...dasar, pesan: pesanGalat(e) };
  }
}
```

 	Berdasarkan Tabel IV.60, seluruh badan fungsi dibungkus penanganan kesalahan dan setiap kegagalan dikembalikan sebagai hasil berstatus gagal beserta pesan penyebabnya. Rancangan tersebut merupakan realisasi persyaratan NFR-13, sehingga ketidaktersediaan layanan pemeriksaan tidak pernah menggagalkan pengunggahan dokumen oleh dosen. Nama yang terbaca dihimpun dari dua sumber pada keluaran parser, yaitu daftar orang pada tingkat dokumen dan ringkasan per dosen, lalu digabung tanpa duplikat.

 	Hasil pemeriksaan menghasilkan salah satu dari lima status, yaitu cocok ketika nama pemilik akun ditemukan dan perannya sesuai, peran tidak sesuai ketika nama ditemukan namun perannya berbeda dari yang diklaim, tidak cocok ketika nama pemilik akun tidak ditemukan padahal dokumen memuat nama orang, tanpa nama ketika dokumen tidak memuat nama orang sama sekali, dan gagal ketika pemeriksaan tidak dapat dijalankan. Hanya dua status pertama dari ketiga status yang menyimpulkan sesuatu, yaitu tidak cocok dan peran tidak sesuai, yang ditandai sebagai temuan pada halaman penilaian asesor. Status tanpa nama dan gagal sengaja tidak ditandai karena keduanya menandakan pemeriksaan tidak menyimpulkan apa pun, sesuai aturan bisnis BR-31. Tampilan halaman rincian dokumen bukti disajikan pada Gambar IV.29.

**[SISIPKAN GAMBAR: tangkapan layar halaman rincian dokumen bukti pada ruang kerja asesor, memperlihatkan panel hasil pemeriksaan yang dibentangkan berisi daftar nama dan peran yang terbaca, status pemeriksaan, tombol periksa ulang, dan tombol persetujuan manual]**

Gambar IV.29. Tampilan Halaman Rincian Dokumen Bukti

 	Keterkaitan modul ini terhadap persyaratan yang direalisasikannya disajikan pada Tabel IV.61.

Tabel IV.61. Realisasi *Requirement* Modul Verifikasi Keaslian Dokumen Bukti


|  Kode  | *Requirement*                                                                                                    |       PSPEC       | Status Implementasi |
| :------: | ------------------------------------------------------------------------------------------------------------------ | :------------------: | :-------------------: |
| FR-28 | Sistem harus memeriksa dokumen bukti pada kegiatan rumpun pembimbingan dan menyimpan hasilnya menyertai dokumen. | PSPEC-16, PSPEC-17 |   Terimplementasi   |
| FR-29 | Sistem harus menandai kegiatan yang buktinya berstatus tidak cocok atau peran tidak sesuai sebagai temuan.       |      PSPEC-18      |   Terimplementasi   |
| FR-30 | Sistem harus menyediakan pemeriksaan ulang serta persetujuan dan pencabutan persetujuan bagi asesor.             |      PSPEC-19      |   Terimplementasi   |
| NFR-13 | Kegagalan layanan pemeriksaan tidak boleh menggagalkan proses unggah dokumen.                                    |      PSPEC-16      |   Terimplementasi   |
| NFR-14 | Hasil pemeriksaan tidak boleh menjadi penentu tunggal diterima atau ditolaknya suatu bukti.                      | PSPEC-18, PSPEC-19 |   Terimplementasi   |

### **IV.3.12	Implementasi Modul Penilaian, Simpulan, dan Penerbitan Token**

 	Modul ini merealisasikan PSPEC-11, PSPEC-12, dan PSPEC-13, sehingga memenuhi FR-20 sampai FR-24. Modul ini merupakan simpul terpenting sistem karena menautkan penilaian manusia, pembentukan simpulan, dan penerbitan kredit *on-chain* menjadi satu rangkaian. Penyimpanan penilaian dijaga empat gerbang berurutan sebagaimana disajikan pada Tabel IV.62.

Tabel IV.62. Potongan Kode Implementasi Gerbang Penyimpanan Penilaian

```typescript
const pn = await penugasanMilikAsesor(idPenugasan, session.user.id);
if (!pn)
  redirect(flash(idPenugasan, { err: "Penugasan tidak ditemukan" }));
if (!pn!.lkd.simpan_permanen)
  redirect(flash(idPenugasan, { err: "Dosen belum simpan permanen" }));
if (!bolehAsesorNilai(faseAktif(pn!.lkd.periode_bkd)))
  redirect(flash(idPenugasan, { err: "Di luar masa penilaian" }));
if (pn.disahkan)
  redirect(flash(idPenugasan, { err: "Penilaian sudah disahkan, tidak dapat diubah" }));

for (const k of kegiatanDiklaim) {
  const status = String(formData.get(`status_${k.id_kegiatan}`) ?? "");
  const catatan = String(formData.get(`catatan_${k.id_kegiatan}`) ?? "").trim() || null;
  if (!["disetujui", "ditolak", "revisi"].includes(status)) continue;
  // PSPEC-11: tolak/revisi wajib catatan
  if (status !== "disetujui" && !catatan) {
    butuhKomentar.push(k.judul);
    continue;
  }
  ...
}
```

 	Berdasarkan Tabel IV.62, gerbang pertama memastikan penugasan benar-benar milik asesor yang sedang masuk, sehingga seorang asesor tidak dapat menilai dokumen BKD yang tidak ditugaskan kepadanya. Gerbang kedua menegakkan aturan bisnis BR-08, gerbang ketiga menegakkan gerbang fase, dan gerbang keempat mencegah penilaian yang telah disahkan diubah kembali. Kewajiban mencantumkan catatan pada status selain disetujui ditegakkan per baris, dengan baris yang dilewati dilaporkan kembali kepada asesor agar tidak ada penilaian yang hilang tanpa pemberitahuan.

 	Pembentukan simpulan beserta penerbitan token dijalankan setelah kedua asesor mengesahkan, sebagaimana disajikan pada Tabel IV.63.

Tabel IV.63. Potongan Kode Implementasi Pembentukan Simpulan dan Penerbitan Token

```typescript
const semua = await prisma.penugasan_asesor.findMany({ where: { id_lkd: pn!.id_lkd } });
const semuaSah = semua.length >= 2 && semua.every((x) => x.disahkan);
if (!semuaSah) {
  redirect(flash(idPenugasan, { ok: "Penilaian Anda disahkan. Menunggu asesor lain." }));
}

// rata-rata SKS disetujui per kegiatan
const perKegiatan: Record<string, number[]> = {};
for (const h of hasil) {
  if (h.status !== "disetujui" || h.sks_disetujui_x100 == null) continue;
  (perKegiatan[h.id_kegiatan] = perKegiatan[h.id_kegiatan] || []).push(h.sks_disetujui_x100);
}
let totalX100 = 0;
const rincian: Record<string, number> = {};
for (const [idKeg, arr] of Object.entries(perKegiatan)) {
  const avg = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  rincian[idKeg] = avg;
  totalX100 += avg;
}

const memenuhi = totalX100 / 100 >= 9;
const payload = {
  id_lkd: pn!.id_lkd,
  total_sks_x100: totalX100,
  rincian,
  disahkan_oleh: semua.map((x) => x.id_asesor).sort(),
};
const hash = hashPenilaian(payload);

await prisma.simpulan_bkd.upsert({ ... hash_penilaian: hash ... });
await prisma.lkd.update({ where: { id_lkd: pn!.id_lkd }, data: { status: "final" } });

if (dosen?.alamat_wallet && totalX100 > 0) {
  let txHash: string | null = null;
  let status: "success" | "failed" = "failed";
  try {
    const res = await mintSks(dosen.alamat_wallet, BigInt(totalX100), hash);
    txHash = res.txHash;
    status = "success";
  } catch (e) {
    console.error("mint gagal:", e);
  }
  await prisma.riwayat_transaksi.create({
    data: { jenis_transaksi: "mint", tx_hash: txHash, jumlah_token_x100: totalX100,
            reference_id: hash, status },
  });
}
```

 	Berdasarkan Tabel IV.63, terdapat empat ketentuan yang perlu dijelaskan. Pertama, nilai final setiap kegiatan merupakan pembulatan rata-rata nilai yang disetujui kedua asesor, dihitung pada skala kali seratus sehingga tetap berupa bilangan bulat. Kedua, ambang pemenuhan kewajiban unsur pendidikan ditetapkan sembilan SKS mengikuti ketentuan beban kerja bidang pendidikan dan penelitian pada PO BKD 2021. Ketiga, muatan yang di-*hash* memuat pengenal dokumen BKD, total kredit, rincian per kegiatan, dan daftar pengenal asesor yang mengesahkan dalam urutan tetap, sehingga *hash* yang sama hanya dapat dihasilkan dari simpulan yang sama. Keempat, penerbitan token dibungkus penanganan kesalahan dan hasilnya dicatat pada riwayat transaksi baik ketika berhasil maupun gagal, sehingga kegagalan jaringan tidak menghilangkan simpulan yang telah terbentuk. Ketentuan terakhir tersebut merupakan realisasi persyaratan NFR-03 dan aturan bisnis BR-27. Tampilan halaman penilaian asesor dan halaman token disajikan pada Gambar IV.30 dan Gambar IV.31.

**[SISIPKAN GAMBAR: tangkapan layar halaman penilaian asesor, memperlihatkan tabel kegiatan beserta isian nilai disetujui, status, catatan, penanda temuan bukti, dan bilah aksi simpan serta sahkan]**

Gambar IV.30. Tampilan Halaman Penilaian Asesor

**[SISIPKAN GAMBAR: tangkapan layar halaman token pada ruang kerja administrator, memperlihatkan saldo token per dosen, formulir koreksi token disertai alasan, dan riwayat transaksi]**

Gambar IV.31. Tampilan Halaman Token dan Koreksi Kredit

 	Keterkaitan modul ini terhadap persyaratan yang direalisasikannya disajikan pada Tabel IV.64.

Tabel IV.64. Realisasi *Requirement* Modul Penilaian, Simpulan, dan Penerbitan Token


|  Kode  | *Requirement*                                                                                                                     |  PSPEC  | Status Implementasi |
| :------: | ----------------------------------------------------------------------------------------------------------------------------------- | :--------: | :-------------------: |
| FR-20 | Sistem harus dapat menerima nilai kredit yang disetujui, status, dan catatan dari setiap asesor pada setiap kegiatan.             | PSPEC-11 |   Terimplementasi   |
| FR-21 | Sistem harus dapat mencatat pengesahan penilaian setelah dokumen BKD disimpan permanen dan seluruh kegiatan dinilai.              | PSPEC-11 |   Terimplementasi   |
| FR-22 | Sistem harus membentuk simpulan BKD setelah kedua asesor mengesahkan, dengan nilai per kegiatan dari perataan nilai kedua asesor. | PSPEC-12 |   Terimplementasi   |
| FR-23 | Sistem harus menghitung*hash* kriptografi atas muatan simpulan dan menggunakannya sebagai referensi transaksi.                    | PSPEC-12 |   Terimplementasi   |
| FR-24 | Sistem harus menerbitkan token kredit SKS dan mencatat*transaction hash* beserta statusnya.                                       | PSPEC-13 |   Terimplementasi   |
| NFR-03 | Kegagalan pemanggilan*blockchain* tidak boleh menghilangkan data operasional yang telah tersimpan.                                | PSPEC-13 |   Terimplementasi   |
| NFR-09 | Aksi yang tidak dapat dibatalkan harus dilindungi konfirmasi eksplisit.                                                           | PSPEC-11 |   Terimplementasi   |

### **IV.3.13	Implementasi Modul Registri Dokumen, Log *Blockchain*, dan Rekapitulasi**

 	Modul ini merealisasikan PSPEC-15 dan PSPEC-21 pada sisi lapisan aplikasi web, sehingga memenuhi FR-26, FR-27, dan FR-34. Pencatatan jejak dokumen dipanggil pada enam titik, yaitu ketika unggahan dokumen penugasan dibuat baik berhasil maupun gagal diparse, ketika unggahan diterapkan, ketika unggahan dihapus, serta ketika dokumen bukti diunggah dan dihapus. Potongan kodenya disajikan pada Tabel IV.65.

Tabel IV.65. Potongan Kode Implementasi Pencatatan Jejak Dokumen

```typescript
export const hashIsiBerkas = (bytes: Buffer): string =>
  crypto.createHash("sha256").update(bytes).digest("hex");

export async function hashBerkasBukti(fileUrl: string): Promise<string> {
  if (fileUrl.startsWith("/uploads/")) {
    try {
      const data = await readFile(
        path.join(process.cwd(), "public", fileUrl.replace(/^\/+/, ""))
      );
      return hashIsiBerkas(data);
    } catch {
      // berkas tidak terbaca; jatuhkan ke hash URL supaya tetap tercatat
    }
  }
  return keccak256(toUtf8Bytes(fileUrl)).slice(2);
}

export async function catatDokumenDenganRiwayat(opsi: {
  hashHex: string; aksi: AksiDokumen; referensi: string;
  keterangan: string; idPengguna?: string | null;
}): Promise<boolean> {
  let txHash: string | null = null;
  let status: "success" | "failed" = "failed";
  let contractAddress = process.env.NEXT_PUBLIC_DOKUMEN_REGISTRI_ADDRESS ?? null;

  try {
    const res = await catatDokumen(opsi.hashHex, opsi.aksi, opsi.referensi);
    txHash = res.txHash;
    contractAddress = res.contractAddress;
    status = "success";
  } catch (e) {
    console.error(`catatDokumen ${opsi.aksi} gagal:`, e);
  }

  try {
    await prisma.riwayat_transaksi.create({
      data: {
        jenis_transaksi: "catat_dokumen",
        contract_address: contractAddress,
        tx_hash: txHash,
        reference_id: opsi.referensi,
        alasan: `${opsi.aksi}: ${opsi.keterangan}`,
        status,
        id_admin: opsi.idPengguna ?? null,
      },
    });
  } catch (e) {
    console.error("riwayat catat_dokumen gagal disimpan:", e);
  }
  return status === "success";
}
```

 	Berdasarkan Tabel IV.65, terdapat dua tingkat penanganan kesalahan. Tingkat pertama membungkus pemanggilan kontrak sehingga kegagalan jaringan tidak menggagalkan aksi pengguna, sesuai persyaratan NFR-15. Tingkat kedua membungkus penulisan riwayat transaksi sehingga kegagalan pencatatan riwayat pun tidak menggagalkan aksi. Berkas bukti yang berupa pranala luar tetap dicatat dengan memakai *hash* atas alamat pranalanya, sehingga tidak ada dokumen yang lolos tanpa jejak sama sekali.

 	Pembacaan riwayat pada halaman log *blockchain* dan halaman registri dokumen dijalankan langsung dari jaringan, bukan dari basis data. Keputusan tersebut disengaja agar halaman tersebut benar-benar memperlihatkan keadaan *on-chain* dan bukan salinannya, sehingga selisih antara catatan basis data dan catatan jaringan dapat terlihat. Halaman registri dokumen menautkan setiap *event* kembali ke baris unggahan dokumen atau dokumen bukti yang bersangkutan melalui atribut referensi, sehingga administrator dapat menelusuri dari catatan *on-chain* menuju data operasionalnya. Tampilan ketiga halaman tersebut disajikan pada Gambar IV.32 sampai dengan Gambar IV.34.

**[SISIPKAN GAMBAR: tangkapan layar halaman log blockchain, memperlihatkan daftar event penerbitan dan penghapusan token beserta alamat wallet, jumlah SKS, referensi, dan tautan ke penjelajah blok]**

Gambar IV.32. Tampilan Halaman Log *Blockchain*

**[SISIPKAN GAMBAR: tangkapan layar halaman registri dokumen, memperlihatkan daftar event pencatatan beserta sidik digital dokumen, jenis aksi, dan penautannya ke baris unggahan atau dokumen bukti]**

Gambar IV.33. Tampilan Halaman Registri Dokumen

**[SISIPKAN GAMBAR: tangkapan layar halaman rekapitulasi, memperlihatkan total SKS diajukan dan SKS disahkan per dosen pada periode aktif beserta status simpulannya]**

Gambar IV.34. Tampilan Halaman Rekapitulasi BKD

 	Keterkaitan modul ini terhadap persyaratan yang direalisasikannya disajikan pada Tabel IV.66.

Tabel IV.66. Realisasi *Requirement* Modul Registri Dokumen, Log *Blockchain*, dan Rekapitulasi


|  Kode  | *Requirement*                                                                                                                   |  PSPEC  | Status Implementasi |
| :------: | --------------------------------------------------------------------------------------------------------------------------------- | :--------: | :-------------------: |
| FR-26 | Sistem harus menampilkan riwayat penerbitan dan penghapusan token yang dibaca langsung dari*blockchain*.                        | PSPEC-15 |   Terimplementasi   |
| FR-27 | Sistem harus menampilkan rekapitulasi kredit BKD per dosen dan per periode.                                                     | PSPEC-15 |   Terimplementasi   |
| FR-33 | Sistem harus mencatatkan sidik digital berkas ke kontrak registri, dengan kegagalan pencatatan tidak membatalkan aksi pengguna. | PSPEC-21 |   Terimplementasi   |
| FR-34 | Sistem harus menampilkan riwayat pencatatan dokumen beserta penautannya ke baris asalnya.                                       | PSPEC-21 |   Terimplementasi   |
| NFR-15 | Kegagalan pencatatan pada kontrak registri tidak boleh membatalkan aksi unggah, penerapan, maupun penghapusan dokumen.          | PSPEC-21 |   Terimplementasi   |

 	Dengan selesainya kesebelas modul di atas, seluruh tiga puluh empat persyaratan fungsional pada Tabel IV.11 telah terimplementasi. Verifikasi atas kebenaran implementasi tersebut diuraikan pada subbab IV.4.

## **IV.4	Pengujian**

 	Subbab ini menyajikan seluruh proses dan hasil pengujian sistem LedgerDik sebagai tahap penjaminan mutu pada siklus pengembangan berbasis model *waterfall*, sebagaimana ditetapkan pada subbab III.5.4. Pengujian dilaksanakan secara bertingkat untuk memvalidasi pemenuhan seluruh persyaratan fungsional pada Tabel IV.11 dan persyaratan nonfungsional pada Tabel IV.12. Secara berurutan, subbab ini memuat rencana pengujian yang mendefinisikan metode, strategi, dan lingkungan uji, diikuti hasil *unit testing* terhadap lima puluh tujuh skenario pada lapisan *on-chain*, *integration testing* terhadap interaksi lintas lapisan, *system testing* terhadap alur pemakaian lengkap, uji akurasi perhitungan kredit terhadap Rubrik BKD, pengujian aspek nonfungsional mengacu pada ISO/IEC 25010, serta kesimpulan menyeluruh atas hasil pengujian.

### **IV.4.1	*Test Plan***

 	*Test plan* mendefinisikan kerangka kerja pelaksanaan seluruh pengujian sebelum eksekusi dijalankan, mencakup acuan, tahapan, jenis pengujian, objek pengujian, lingkungan, format skenario, batasan, kriteria kelulusan, kriteria penghentian, dan produk pengujian. Objek yang diuji meliputi seluruh persyaratan fungsional yang terdistribusi pada sebelas modul implementasi sebagaimana dirangkum pada Tabel IV.32, sekaligus memverifikasi pemenuhan sebagian persyaratan nonfungsional yang dievaluasi mengacu pada model kualitas produk ISO/IEC 25010 (ISO/IEC, 2023). Penyusunan dokumentasi pengujian mengikuti kerangka IEEE Std 829 tentang dokumentasi pengujian perangkat lunak (IEEE, 2008), dengan pemetaan setiap elemen kerangka tersebut terhadap bagian laporan disajikan pada Tabel IV.67.

Tabel IV.67. Pemetaan Elemen Dokumentasi Pengujian IEEE Std 829 ke Laporan


| Elemen Dokumentasi IEEE Std 829                     | Bagian pada Laporan                                                 |
| ----------------------------------------------------- | --------------------------------------------------------------------- |
| *Test plan identifier* dan *introduction*           | Pengantar subbab IV.4.1                                             |
| *Approach* dan *testing tasks*                      | Tahapan Pengujian (IV.4.1.1) dan Jenis Pengujian (IV.4.1.2)         |
| *Test items*                                        | *Test Items* (IV.4.1.4)                                             |
| *Features to be tested*                             | *Features to be Tested* (IV.4.1.5)                                  |
| *Features not to be tested*                         | *Features Not to be Tested* (IV.4.1.6)                              |
| *Environmental needs*                               | Lingkungan Pengujian (IV.4.1.7)                                     |
| *Test design* dan *test case specification*         | Format Skenario Pengujian (IV.4.1.8) beserta seluruh tabel skenario |
| *Risks and contingencies*                           | Batasan Pengujian (IV.4.1.9)                                        |
| *Item pass/fail criteria* dan *entry/exit criteria* | Kriteria Kelulusan Item Uji (IV.4.1.10)                             |
| *Suspension criteria* dan *resumption requirements* | Kriteria Penghentian dan Persyaratan Pelanjutan (IV.4.1.11)         |
| *Test deliverables*                                 | Produk Pengujian (IV.4.1.12)                                        |
| *Test levels*                                       | Subbab IV.4.2 sampai IV.4.6, serta uji adopsi pengguna pada Bab V   |

#### **IV.4.1.1	Tahapan Pengujian**

 	Pengujian mengikuti siklus hidup pengujian perangkat lunak yang ditempuh berurutan sebagaimana disajikan pada Gambar IV.35.

* [ ]  **[SISIPKAN GAMBAR: bagan lima tahapan pengujian berurutan, yaitu perencanaan pengujian, penyusunan skenario uji, pelaksanaan pengujian, pencatatan dan analisis hasil, serta perbaikan dan pengujian ulang, dengan panah kembali dari tahap terakhir menuju tahap pelaksanaan]**

Gambar IV.35. Tahapan Pengujian Sistem LedgerDik

 	Berdasarkan Gambar IV.35, kelima tahapan tersebut diuraikan sebagai berikut.

1. Perencanaan pengujian

Menetapkan ruang lingkup, metode, lingkungan pengujian, dan kriteria keberhasilan yang mengacu pada persyaratan fungsional dan nonfungsional. Kriteria kelulusan ditetapkan pada tahap ini, yaitu sebelum eksekusi dijalankan, agar penilaian hasil tidak disesuaikan dengan keluaran yang terjadi.

2. Penyusunan skenario uji

Menurunkan skenario pengujian dari persyaratan fungsional dan spesifikasi proses, dengan setiap skenario diberi pengenal yang menyebut modul dan nomor urutnya serta ditautkan ke persyaratan yang diverifikasinya.

3. Pelaksanaan pengujian

Mengeksekusi skenario pada lingkungan yang telah ditetapkan. Skenario lapisan *on-chain* dieksekusi otomatis melalui kerangka pengujian Hardhat pada jaringan simulasi, sedangkan skenario lintas lapisan dan alur pengguna dijalankan pada lingkungan operasional lengkap.

4. Pencatatan dan analisis hasil

Membandingkan hasil aktual terhadap hasil yang diharapkan, menetapkan status setiap skenario, dan merekapitulasinya per modul.

5. Perbaikan dan pengujian ulang

Memperbaiki kode apabila terdapat skenario yang gagal, kemudian menguji ulang seluruh skenario pada modul yang bersangkutan hingga seluruhnya lulus.

#### **IV.4.1.2	Jenis Pengujian**

 	Pengujian fungsional memakai metode *black box*, yaitu evaluasi berdasarkan masukan dan keluaran tanpa memperhatikan struktur internal kode. Pemilihan metode tersebut sesuai dengan sifat sistem yang keluarannya memiliki jawaban benar tunggal yang dapat dihitung dari Rubrik BKD, sehingga kebenaran dapat dinilai sepenuhnya dari pasangan masukan dan keluaran. Ringkasan jenis pengujian beserta pendekatan dan tujuannya disajikan pada Tabel IV.68.

Tabel IV.68. Jenis Pengujian Sistem LedgerDik


| No. | Jenis Pengujian                | Pendekatan                                                            | Tujuan                                                                                                                                        |
| :---: | -------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. | *Unit Testing*                 | *Black box* memakai kerangka pengujian Hardhat pada jaringan simulasi | Memverifikasi setiap fungsi perhitungan, setiap fungsi siklus hidup token, dan fungsi pencatatan registri secara terisolasi.                  |
| 2. | *Integration Testing*          | *Black box* pada lingkungan operasional lengkap                       | Memverifikasi interaksi lintas lapisan, yaitu aplikasi web dengan basis data, dengan layanan ekstraksi, dan dengan ketiga*smart contract*.    |
| 3. | *System Testing*               | *Black box* secara *end-to-end* pada peramban                         | Memverifikasi sistem yang telah terintegrasi penuh terhadap alur pemakaian lengkap yang melintasi beberapa modul dan beberapa peran pengguna. |
| 4. | Uji Akurasi Perhitungan Kredit | Pembandingan keluaran kontrak terhadap perhitungan manual Rubrik BKD  | Memverifikasi bahwa nilai kredit yang dihasilkan sistem identik dengan nilai yang dihitung manual dari rubrik.                                |
| 5. | Pengujian Aspek Nonfungsional  | Inspeksi, analisis statis, dan uji fungsional terarah                 | Memverifikasi pemenuhan persyaratan nonfungsional pada aspek yang benar-benar telah diterapkan, mengacu pada ISO/IEC 25010.                   |
| 6. | *User Acceptance Test*         | Demonstrasi kepada pengguna nyata                                     | Mengevaluasi keberterimaan sistem oleh pengguna, diuraikan pada Bab V.                                                                        |

#### **IV.4.1.3	Klasifikasi Skenario Pengujian**

 	Agar cakupan pengujian dapat dinilai secara adil, setiap skenario *unit testing* dikelompokkan ke dalam tiga kategori sebagaimana dijelaskan pada Tabel IV.69. Kategori tersebut dicantumkan di awal kolom Deskripsi pada setiap tabel skenario, dan skenario diurutkan mengikuti urutan positif, negatif, lalu *edge*.

Tabel IV.69. Klasifikasi Skenario Pengujian


| Kategori | Definisi                                                                                                                                                       | Contoh pada Sistem LedgerDik                                                       |
| :--------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Positif | Menguji perilaku sistem pada kondisi dan masukan yang valid, dengan harapan operasi berhasil dijalankan.                                                       | Perhitungan pengajaran dengan realisasi pertemuan penuh mengembalikan nilai penuh. |
| Negatif | Menguji penanganan sistem terhadap masukan tidak valid, pemanggilan tanpa kewenangan, atau kondisi kesalahan, dengan harapan sistem menolak secara terkendali. | Penerbitan token oleh alamat tanpa peran penerbit ditolak kontrak.                 |
|  *Edge*  | Menguji kondisi batas atau tidak lazim yang tetap valid, seperti nilai tepat pada ambang, daftar kosong, dan pemanggilan berulang.                             | Realisasi pertemuan tepat pada ambang lima puluh persen tetap dinilai.             |

 	Cakupan kategori dilaporkan apa adanya sesuai skenario yang benar-benar dieksekusi. Distribusi kategori per modul disajikan pada Tabel IV.70.

Tabel IV.70. Distribusi Kategori Skenario *Unit Testing* per Modul


| Modul                     | Positif | Negatif | *Edge* | Total |
| --------------------------- | :-------: | :-------: | :------: | :------: |
| Kalkulator BKD Pendidikan |   18   |   13   |   5   |   36   |
| Token SKS                 |    6    |    7    |   2   |   15   |
| Registri Dokumen          |    3    |    2    |   1   |   6   |
| **Total**                 | **27** | **22** | **8** | **57** |

 	Berdasarkan Tabel IV.70, sebaran skenario memperlihatkan bahwa jalur berhasil dan penanganan kesalahan memperoleh porsi yang hampir seimbang, yaitu dua puluh tujuh skenario positif dan dua puluh dua skenario negatif, sedangkan kondisi batas memperoleh delapan skenario. Porsi skenario negatif yang besar merupakan konsekuensi sifat kontrak yang tidak dapat diperbaiki setelah ditempatkan, sehingga setiap kondisi penolakan wajib dipastikan bekerja sebelum penempatan.

#### **IV.4.1.4	*Test Items***

 	Item yang diuji dikelompokkan menurut jenis pengujian yang mencakupnya sebagaimana disajikan pada Tabel IV.71.

Tabel IV.71. *Test Items* menurut Jenis Pengujian


| No. | Jenis Pengujian                | *Test Item*                                                                                                                           | Cakupan                                                                                                                         |
| :---: | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1. | *Unit Testing*                 | Ketiga*smart contract*, yaitu KalkulatorBKDPendidikan, BKDSKSToken, dan BKDDokumenRegistri, dikompilasi dengan solc 0.8.28            | Verifikasi setiap fungsi secara terisolasi pada jaringan simulasi tanpa basis data maupun antarmuka                             |
| 2. | *Integration Testing*          | Aplikasi web beserta modul orkestrasinya, basis data PostgreSQL, layanan ekstraksi dokumen, dan titik akhir RPC jaringan Base Sepolia | Verifikasi kontrak antarlapisan pada jalur perhitungan, ekstraksi, pemeriksaan bukti, penerbitan token, dan pencatatan registri |
| 3. | *System Testing*               | Sistem LedgerDik terintegrasi penuh pada lingkungan operasional                                                                       | Verifikasi alur pemakaian lengkap yang melintasi tiga peran pengguna dari penyiapan periode hingga penerbitan kredit            |
| 4. | Uji Akurasi Perhitungan Kredit | Kedelapan fungsi perhitungan yang dipautkan pada data referensi kegiatan                                                              | Pembandingan keluaran kontrak terhadap perhitungan manual Rubrik BKD unsur pendidikan                                           |
| 5. | Pengujian Aspek Nonfungsional  | Seluruh lapisan sistem                                                                                                                | Verifikasi persyaratan NFR-01 sampai NFR-15 pada aspek yang telah diterapkan                                                    |

#### **IV.4.1.5	*Features to be Tested***

 	Seluruh persyaratan fungsional ditetapkan sebagai objek pengujian. Pemetaan setiap kelompok persyaratan terhadap cara verifikasi dan jenis pengujian yang mencakupnya disajikan pada Tabel IV.72.

Tabel IV.72. Objek Pengujian dan Keterkaitannya dengan Persyaratan Fungsional


| Modul                                                        |          Kode FR          | Cara Verifikasi                                                                                                                                           | Jenis Pengujian                                                |
| -------------------------------------------------------------- | :-------------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Autentikasi dan Otorisasi                                    |    FR-01, FR-02, FR-32    | Percobaan masuk dengan kredensial sah, tidak sah, dan akun nonaktif, serta percobaan mengakses ruang kerja peran lain                                     | *Integration testing*, *system testing*                        |
| Pengelolaan Pengguna,*Wallet*, Periode, dan Penugasan Asesor |    FR-03 sampai FR-07    | Percobaan pengelolaan akun, penetapan*wallet*, pembuatan dan pengaktifan periode, serta penugasan asesor satu per satu dan massal                         | *Integration testing*, *system testing*                        |
| Referensi Kegiatan                                           |           FR-08           | Peninjauan daftar referensi terhadap Rubrik BKD dan terhadap nama fungsi kontrak                                                                          | *Integration testing*                                          |
| Ekstraksi dan Penerapan Dokumen                              | FR-09 sampai FR-12, FR-31 | Unggah kelima jenis dokumen, peninjauan pratinjau, koreksi baris, penerapan, dan penerapan ulang                                                          | *Integration testing*, *system testing*                        |
| Pengelolaan Kegiatan dan Dokumen BKD                         |    FR-13 sampai FR-17    | Pengelolaan kegiatan dan dokumen bukti, penarikan kegiatan, penetapan capaian, dan penyimpanan permanen                                                   | *Integration testing*, *system testing*                        |
| Perhitungan Kredit Kegiatan                                  |       FR-18, FR-19       | Pemanggilan seluruh fungsi perhitungan dengan parameter valid, tidak valid, dan kondisi batas                                                             | *Unit testing*, uji akurasi perhitungan, *integration testing* |
| Penilaian, Simpulan, dan Penerbitan Token                    |    FR-20 sampai FR-24    | Penilaian oleh dua asesor, pengesahan berjenjang, pembentukan simpulan, dan penerbitan token                                                              | *Unit testing*, *integration testing*, *system testing*        |
| Koreksi Token dan Pelaporan                                  |    FR-25 sampai FR-27    | Koreksi token, pembacaan log*on-chain*, dan peninjauan rekapitulasi                                                                                       | *Unit testing*, *integration testing*, *system testing*        |
| Verifikasi Keaslian Dokumen Bukti                            |    FR-28 sampai FR-30    | Unggah dokumen bukti milik dosen sendiri dan milik dosen lain, unggah dengan peran berbeda, pemeriksaan ulang, serta persetujuan manual dan pencabutannya | *Integration testing*, *system testing*                        |
| Registri Dokumen                                             |       FR-33, FR-34       | Pencatatan pada keenam titik pemanggilan, pembacaan riwayat, dan penautannya ke baris asal                                                                | *Unit testing*, *integration testing*                          |

#### **IV.4.1.6	*Features Not to be Tested***

 	Sejumlah aspek sengaja dikecualikan dari pengujian pada Tugas Akhir ini. Pengecualian beserta alasannya disajikan pada Tabel IV.73.

Tabel IV.73. *Features Not to be Tested*


| Aspek yang Dikecualikan                                                                                   | Alasan Pengecualian                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sebelas fungsi perhitungan pada kontrak yang tidak dipautkan ke data referensi                            | Butir aturannya tidak dipakai pada penerapan di Jurusan Teknik Komputer dan Informatika sebagaimana dijelaskan pada subbab IV.1.4, sehingga tidak memiliki data uji yang bersumber dari dokumen nyata. |
| Implementasi baku ERC20 dan AccessControl dari pustaka OpenZeppelin                                       | Merupakan pustaka pihak ketiga yang telah diaudit dan diuji penyusunnya; yang diuji pada Tugas Akhir ini adalah perilaku hasil penyesuaiannya, yaitu pembatasan pemindahan dan pembagian peran.        |
| Ketahanan terhadap serangan spesifik*smart contract* seperti *reentrancy* dan manipulasi urutan transaksi | Kontrak kalkulator tidak menyimpan status dan tidak memindahkan aset, sedangkan pengujian penetrasi berada di luar lingkup pengembangan sebagaimana ditetapkan pada subbab I.6.2.                      |
| Akurasi model bahasa visual sebagai model pembelajaran mesin                                              | Keluarannya bersifat probabilistik dan diperlakukan sebagai temuan, bukan sebagai keputusan; yang diuji adalah perilaku sistem terhadap keluaran tersebut, bukan mutu model itu sendiri.               |
| Kinerja pada beban tinggi, yaitu*load testing* dan *stress testing*                                       | Sistem dioperasikan pada lingkup satu jurusan dengan jumlah pengguna terbatas, dan pengujian beban menuntut lingkungan produksi yang tidak tersedia pada tahap ini.                                    |
| Kompatibilitas lintas peramban dan lintas perangkat secara menyeluruh                                     | Pengujian dijalankan pada satu peramban acuan; cakupan lintas peramban dinyatakan sebagai keterbatasan dan direkomendasikan pada saran Bab VI.                                                         |

#### **IV.4.1.7	Lingkungan Pengujian**

 	Pengujian dijalankan pada dua lingkungan yang berbeda sesuai jenis pengujiannya. Spesifikasi kedua lingkungan tersebut disajikan pada Tabel IV.74.

Tabel IV.74. Spesifikasi Lingkungan Pengujian


| No. | Komponen             | Lingkungan*Unit Testing*                                                 | Lingkungan*Integration* dan *System Testing*                                |
| :---: | ---------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1. | Jaringan*blockchain* | Jaringan simulasi Hardhat dengan tipe rantai OP Stack                    | Base Sepolia,*chain id* 84532, melalui titik akhir RPC publik               |
| 2. | Kerangka pengujian   | Hardhat 3.11 dengan pelari uji bawaan Node.js                            | Peramban dan antarmuka aplikasi                                             |
| 3. | Kompilator           | solc 0.8.28, pengoptimal aktif pada dua ratus putaran, target EVM cancun | Sama                                                                        |
| 4. | Basis data           | Tidak diperlukan                                                         | PostgreSQL 16 dalam*container* Docker                                       |
| 5. | Layanan ekstraksi    | Tidak diperlukan                                                         | FastAPI pada porta 8000 dengan kunci API aktif                              |
| 6. | Aplikasi web         | Tidak diperlukan                                                         | Next.js pada porta 3000                                                     |
| 7. | Peramban             | Tidak diperlukan                                                         | **[LENGKAPI: nama dan versi peramban]**                                     |
| 8. | Data uji             | Nilai parameter yang diturunkan langsung dari Rubrik BKD                 | Keenam dokumen penugasan pada Tabel III.1 dan tiga puluh delapan akun dosen |

 	Berdasarkan Tabel IV.74, *unit testing* sengaja dijalankan pada jaringan simulasi dan bukan pada jaringan uji publik. Pemilihan tersebut memberi dua keuntungan, yaitu eksekusi berlangsung tanpa biaya *gas* dan tanpa ketergantungan pada ketersediaan jaringan, sehingga seluruh skenario dapat dijalankan ulang kapan pun. Kesetaraan perilaku tetap terjaga karena jaringan simulasi dikonfigurasi memakai tipe rantai OP Stack yang sama dengan jaringan sasaran.

#### **IV.4.1.8	Format Skenario Pengujian**

 	Setiap skenario pengujian dituliskan memakai format tujuh kolom yang seragam. Definisi setiap kolom disajikan pada Tabel IV.75.

Tabel IV.75. Aturan Format Skenario Pengujian


| Kolom                 | Keterangan                                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| ID Skenario           | Pengenal unik berformat kode jenis pengujian, kode modul, dan nomor urut tiga digit, misalnya UT-KAL-001. |
| FR Terkait            | Persyaratan fungsional atau nonfungsional yang diverifikasi skenario tersebut.                            |
| Deskripsi             | Uraian singkat skenario, diawali kategori dalam kurung, yaitu Positif, Negatif, atau*Edge*.               |
| Kondisi Awal          | Keadaan sistem sebelum langkah pengujian dijalankan.                                                      |
| Langkah Pengujian     | Tindakan yang dijalankan beserta nilai masukannya.                                                        |
| Hasil yang Diharapkan | Keluaran atau perubahan keadaan yang seharusnya terjadi.                                                  |
| Status                | Lulus apabila hasil aktual identik dengan hasil yang diharapkan, Gagal apabila berbeda.                   |

#### **IV.4.1.9	Batasan Pengujian**

 	Pengujian pada Tugas Akhir ini dibatasi oleh sejumlah kondisi yang dinyatakan terbuka sebagai berikut.

1. Cakupan *unit testing* terbatas pada lapisan *on-chain*. Modul pada lapisan aplikasi web tidak memiliki pengujian unit otomatis, melainkan diverifikasi melalui *integration testing* dan *system testing* beserta pemeriksaan tipe statis pada tahap kompilasi.
2. Jumlah dan variasi skenario masih terbatas dan belum menjangkau seluruh kemungkinan kombinasi masukan maupun seluruh jalur logika.
3. Data uji bersumber dari dokumen penugasan satu jurusan, sehingga kesesuaian terhadap variasi tata letak dokumen di luar konteks tersebut tidak diverifikasi.
4. Pengujian keluaran model bahasa visual tidak dapat diulang dengan hasil yang persis identik karena keluarannya bersifat probabilistik, sehingga yang diverifikasi adalah perilaku sistem terhadap setiap kemungkinan status hasil pemeriksaan.
5. Pengujian pada jaringan Base Sepolia bergantung pada ketersediaan titik akhir RPC pihak ketiga yang berada di luar kendali pengembangan.
6. Skenario pengujian pembatasan akses hanya menjangkau halaman ruang kerja yang berada dalam cakupan *matcher* *middleware*, dan belum menjangkau kedua titik akhir API di luar cakupan tersebut sebagaimana dinyatakan pada subbab IV.3.7.
7. Skenario pengujian gerbang fase pada subbab IV.4.4 hanya menjangkau aksi yang gerbangnya telah diterapkan, sedangkan kedua aksi yang gerbangnya belum seragam sebagaimana dinyatakan pada subbab IV.3.10 tidak dimasukkan sebagai skenario.

#### **IV.4.1.10	Kriteria Kelulusan Item Uji**

 	Kriteria kelulusan ditetapkan sebelum eksekusi dijalankan agar penilaian hasil tidak disesuaikan dengan keluaran yang terjadi. Kriteria per jenis pengujian disajikan pada Tabel IV.76.

Tabel IV.76. Kriteria Kelulusan Item Uji per Jenis Pengujian


| Jenis Pengujian                | Kriteria Masuk                                      | Kriteria Kelulusan                                                                                                                                                                                                                        | Kriteria Keluar                                         |
| -------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| *Unit Testing*                 | Ketiga kontrak berhasil dikompilasi tanpa galat     | Suatu skenario lulus apabila nilai kembalian atau kondisi penolakan identik dengan yang diharapkan. Suatu modul lulus apabila seluruh skenarionya lulus.                                                                                  | Seluruh skenario pada ketiga modul berstatus lulus      |
| *Integration Testing*          | Seluruh lapisan berjalan dan dapat saling dihubungi | Suatu skenario lulus apabila data yang dipertukarkan antarlapisan sesuai kontrak yang dirancang, dan kegagalan pada satu lapisan ditangani sesuai persyaratan toleransi kesalahan.                                                        | Seluruh titik integrasi terverifikasi                   |
| *System Testing*               | Seluruh skenario*integration testing* telah lulus   | Suatu alur lulus apabila seluruh langkahnya dapat diselesaikan dan keadaan akhir sistem sesuai yang diharapkan.                                                                                                                           | Seluruh alur pengguna terverifikasi                     |
| Uji Akurasi Perhitungan Kredit | Kontrak kalkulator telah lulus*unit testing*        | Suatu kasus lulus apabila nilai kredit yang dihasilkan kontrak identik dengan perhitungan manual Rubrik BKD. Tidak ada toleransi selisih, karena aturan bersifat deterministik sehingga satu ketidaksesuaian pun menandakan cacat logika. | Seluruh kasus uji menghasilkan nilai identik            |
| Pengujian Aspek Nonfungsional  | Sistem telah lulus*system testing*                  | Suatu persyaratan terpenuhi apabila kriteria penerimaan pada Tabel IV.12 terbukti melalui cara verifikasi yang ditetapkan.                                                                                                                | Seluruh persyaratan yang tercakup lingkup terverifikasi |

#### **IV.4.1.11	Kriteria Penghentian dan Persyaratan Pelanjutan**

 	Pengujian dihentikan sementara apabila terjadi salah satu dari tiga kondisi berikut. Kondisi pertama, ketiga kontrak gagal dikompilasi sehingga tidak ada item yang dapat diuji. Kondisi kedua, lingkungan pengujian tidak dapat dijalankan, misalnya basis data atau layanan ekstraksi tidak dapat dihubungi, sehingga kegagalan skenario tidak dapat dibedakan antara cacat perangkat lunak dan gangguan lingkungan. Kondisi ketiga, ditemukan cacat yang menghalangi eksekusi skenario berikutnya pada modul yang sama.

 	Pengujian dilanjutkan setelah tiga persyaratan terpenuhi, yaitu cacat telah diperbaiki dan terpasang pada versi yang diuji, lingkungan telah dipulihkan beserta data uji yang diinisialisasi ulang ke kondisi awal, serta seluruh skenario yang telah dieksekusi sebelum penghentian dijalankan ulang sebagai pengujian regresi pada modul terkait. Mekanisme tersebut konsisten dengan tahap perbaikan dan pengujian ulang pada subbab IV.4.1.1, sehingga status lulus pada tabel skenario selalu merepresentasikan hasil terhadap versi yang telah memuat seluruh perbaikan.

#### **IV.4.1.12	Produk Pengujian**

 	Produk pengujian yang dihasilkan beserta letaknya pada laporan disajikan pada Tabel IV.77, termasuk produk yang tidak tersedia beserta alasannya.

Tabel IV.77. Produk Pengujian dan Letaknya pada Laporan


| Produk Pengujian                       | Letak                                     | Ketersediaan                                                                                                                                                                                                                 |
| ---------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| *Test plan*                            | Subbab IV.4.1                             | Tersedia                                                                                                                                                                                                                     |
| Spesifikasi skenario uji               | Tabel IV.78 sampai Tabel IV.85            | Tersedia                                                                                                                                                                                                                     |
| Laporan hasil eksekusi*unit testing*   | Gambar IV.36 dan Tabel IV.81              | Tersedia                                                                                                                                                                                                                     |
| Rekapitulasi hasil pengujian           | Tabel IV.81, Tabel IV.83, dan Tabel IV.88 | Tersedia                                                                                                                                                                                                                     |
| Berkas kode pengujian otomatis         | Repositori kode pada direktori pengujian  | Tersedia                                                                                                                                                                                                                     |
| Laporan hasil pengujian nonfungsional  | Tabel IV.87                               | Tersedia                                                                                                                                                                                                                     |
| *Test incident report* terpisah        | Tidak ada                                 | Tidak tersedia. Cacat yang ditemukan selama pengembangan diperbaiki langsung pada siklus yang sama dan dicatat sebagai kegiatan pemeliharaan pada subbab IV.5.2, sehingga tidak dikelola sebagai dokumen insiden tersendiri. |
| Laporan cakupan kode (*code coverage*) | Tidak ada                                 | Tidak tersedia. Pengujian memakai pendekatan*black box* sehingga cakupan dinilai dari cakupan persyaratan, bukan dari cakupan baris kode.                                                                                    |
| *Test log* harian                      | Tidak ada                                 | Tidak tersedia. Eksekusi pengujian otomatis menghasilkan keluaran pelari uji yang dapat dibangkitkan ulang kapan pun, sehingga catatan harian tidak dipelihara terpisah.                                                     |

### **IV.4.2	*Unit Testing***

 	*Unit testing* memverifikasi setiap fungsi pada ketiga *smart contract* secara terisolasi pada jaringan simulasi, tanpa basis data maupun antarmuka. Kemampuan menjalankan pengujian secara terisolasi tersebut merupakan konsekuensi langsung dari keputusan rancangan pada subbab IV.1.3.2 butir kedua, yaitu seluruh fungsi perhitungan dirumuskan sebagai fungsi murni tanpa penyimpanan status. Seluruh skenario dieksekusi memakai kerangka pengujian Hardhat dengan pelari uji bawaan Node.js. Skenario pada modul kalkulator disajikan pada Tabel IV.78.

Tabel IV.78. Skenario *Unit Testing* Modul Kalkulator BKD Pendidikan


| ID Skenario | FR Terkait | Deskripsi                                                           | Kondisi Awal                         | Langkah Pengujian                                                                                             | Hasil yang Diharapkan                                    | Status |
| ------------- | :----------: | --------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | :------: |
| UT-KAL-001  |   FR-18   | (Positif) Pendidikan formal doktor satu semester                    | Kontrak kalkulator telah ditempatkan | Memanggil hitungPendidikanFormalDoktor dengan jumlahSemester bernilai 1                                       | Nilai kembalian 1200 setara 12,00 SKS                    | Lulus |
| UT-KAL-002  |   FR-18   | (Negatif) Pendidikan formal doktor nol semester                     | Kontrak kalkulator telah ditempatkan | Memanggil hitungPendidikanFormalDoktor dengan jumlahSemester bernilai 0                                       | Pemanggilan ditolak dengan galat InputTidakValid         | Lulus |
| UT-KAL-003  |   FR-18   | (Positif) Pengajaran realisasi penuh                                | Kontrak kalkulator telah ditempatkan | Memanggil hitungPengajaran dengan bobot 3, rencana 16, realisasi 16, semester penuh, tanpa pengampuan bersama | Nilai kembalian 300 setara 3,00 SKS                      | Lulus |
| UT-KAL-004  |   FR-18   | (Positif) Pengajaran realisasi sebagian                             | Kontrak kalkulator telah ditempatkan | Memanggil hitungPengajaran dengan bobot 3, rencana 16, realisasi 12, semester penuh                           | Nilai kembalian 225 setara 2,25 SKS                      | Lulus |
| UT-KAL-005  |   FR-18   | (Positif) Pengajaran dengan pengampuan bersama                      | Kontrak kalkulator telah ditempatkan | Memanggil hitungPengajaran dengan bobot 3, realisasi penuh, pengampuan bersama, porsi 50 persen               | Nilai kembalian 150 setara 1,50 SKS                      | Lulus |
| UT-KAL-006  |   FR-18   | (*Edge*) Realisasi tepat pada ambang lima puluh persen              | Kontrak kalkulator telah ditempatkan | Memanggil hitungPengajaran dengan bobot 2, rencana 16, realisasi 8, semester penuh                            | Nilai kembalian 100 setara 1,00 SKS, bukan nol           | Lulus |
| UT-KAL-007  |   FR-18   | (*Edge*) Realisasi tepat di bawah ambang                            | Kontrak kalkulator telah ditempatkan | Memanggil hitungPengajaran dengan bobot 2, rencana 16, realisasi 7, semester penuh                            | Nilai kembalian 0                                        | Lulus |
| UT-KAL-008  |   FR-18   | (*Edge*) Pembulatan ke bawah pada pengampuan bersama                | Kontrak kalkulator telah ditempatkan | Memanggil hitungPengajaran dengan bobot 3, realisasi penuh, pengampuan bersama, porsi 33 persen               | Nilai kembalian 99 setara 0,99 SKS                       | Lulus |
| UT-KAL-009  |   FR-18   | (Negatif) Kegiatan tidak berlangsung satu semester penuh            | Kontrak kalkulator telah ditempatkan | Memanggil hitungPengajaran dengan penanda semester penuh bernilai salah                                       | Nilai kembalian 0 tanpa penolakan                        | Lulus |
| UT-KAL-010  |   FR-18   | (Negatif) Realisasi melebihi rencana                                | Kontrak kalkulator telah ditempatkan | Memanggil hitungPengajaran dengan rencana 16 dan realisasi 17                                                 | Pemanggilan ditolak dengan galat InputTidakValid         | Lulus |
| UT-KAL-011  |   FR-18   | (Negatif) Bobot mata kuliah nol                                     | Kontrak kalkulator telah ditempatkan | Memanggil hitungPengajaran dengan sksMataKuliah bernilai 0                                                    | Pemanggilan ditolak dengan galat InputTidakValid         | Lulus |
| UT-KAL-012  |   FR-18   | (Negatif) Rencana pertemuan nol                                     | Kontrak kalkulator telah ditempatkan | Memanggil hitungPengajaran dengan jumlahPertemuanRencana bernilai 0                                           | Pemanggilan ditolak dengan galat InputTidakValid         | Lulus |
| UT-KAL-013  |   FR-18   | (Negatif) Porsi dosen nol pada pengampuan bersama                   | Kontrak kalkulator telah ditempatkan | Memanggil hitungPengajaran dengan pengampuan bersama dan porsi 0                                              | Pemanggilan ditolak dengan galat InputTidakValid         | Lulus |
| UT-KAL-014  |   FR-18   | (Negatif) Porsi dosen melebihi seratus                              | Kontrak kalkulator telah ditempatkan | Memanggil hitungPengajaran dengan pengampuan bersama dan porsi 101                                            | Pemanggilan ditolak dengan galat InputTidakValid         | Lulus |
| UT-KAL-015  |   FR-18   | (Positif) Bimbingan seminar mahasiswa satu semester                 | Kontrak kalkulator telah ditempatkan | Memanggil hitungBimbinganSeminarMahasiswa dengan jumlahSemester bernilai 1                                    | Nilai kembalian 100 setara 1,00 SKS                      | Lulus |
| UT-KAL-016  |   FR-18   | (Negatif) Bimbingan seminar nol semester                            | Kontrak kalkulator telah ditempatkan | Memanggil hitungBimbinganSeminarMahasiswa dengan jumlahSemester bernilai 0                                    | Pemanggilan ditolak dengan galat InputTidakValid         | Lulus |
| UT-KAL-017  |   FR-18   | (Positif) Bimbingan KKN, PKL, atau magang satu semester             | Kontrak kalkulator telah ditempatkan | Memanggil hitungBimbinganKKNPKLMagang dengan jumlahSemester bernilai 1                                        | Nilai kembalian 200 setara 2,00 SKS                      | Lulus |
| UT-KAL-018  |   FR-18   | (Negatif) Bimbingan KKN, PKL, atau magang nol semester              | Kontrak kalkulator telah ditempatkan | Memanggil hitungBimbinganKKNPKLMagang dengan jumlahSemester bernilai 0                                        | Pemanggilan ditolak dengan galat InputTidakValid         | Lulus |
| UT-KAL-019  |   FR-18   | (Positif) Pembimbing utama disertasi dua mahasiswa                  | Kontrak kalkulator telah ditempatkan | Memanggil hitungPembimbinganTugasAkhir dengan peran utama, jenis disertasi, dua mahasiswa                     | Nilai kembalian 266 setara 2,66 SKS                      | Lulus |
| UT-KAL-020  |   FR-18   | (Positif) Pembimbing pendamping disertasi satu mahasiswa            | Kontrak kalkulator telah ditempatkan | Memanggil hitungPembimbinganTugasAkhir dengan peran pendamping, jenis disertasi, satu mahasiswa               | Nilai kembalian 100 setara 1,00 SKS                      | Lulus |
| UT-KAL-021  |   FR-18   | (Positif) Pembimbing utama tesis satu mahasiswa                     | Kontrak kalkulator telah ditempatkan | Memanggil hitungPembimbinganTugasAkhir dengan peran utama, jenis tesis, satu mahasiswa                        | Nilai kembalian 100 setara 1,00 SKS                      | Lulus |
| UT-KAL-022  |   FR-18   | (Positif) Pembimbing pendamping tesis dua mahasiswa                 | Kontrak kalkulator telah ditempatkan | Memanggil hitungPembimbinganTugasAkhir dengan peran pendamping, jenis tesis, dua mahasiswa                    | Nilai kembalian 150 setara 1,50 SKS                      | Lulus |
| UT-KAL-023  |   FR-18   | (Positif) Pembimbing utama skripsi empat mahasiswa                  | Kontrak kalkulator telah ditempatkan | Memanggil hitungPembimbinganTugasAkhir dengan peran utama, jenis skripsi, empat mahasiswa                     | Nilai kembalian 200 setara 2,00 SKS                      | Lulus |
| UT-KAL-024  |   FR-18   | (Positif) Pembimbing pendamping laporan akhir studi empat mahasiswa | Kontrak kalkulator telah ditempatkan | Memanggil hitungPembimbinganTugasAkhir dengan peran pendamping, jenis laporan akhir studi, empat mahasiswa    | Nilai kembalian 100 setara 1,00 SKS                      | Lulus |
| UT-KAL-025  |   FR-18   | (Negatif) Pembimbingan tugas akhir nol mahasiswa                    | Kontrak kalkulator telah ditempatkan | Memanggil hitungPembimbinganTugasAkhir dengan jumlahMahasiswa bernilai 0                                      | Pemanggilan ditolak dengan galat InputTidakValid         | Lulus |
| UT-KAL-026  |   FR-18   | (Positif) Ketua penguji empat mahasiswa                             | Kontrak kalkulator telah ditempatkan | Memanggil hitungPengujiUjianAkhir dengan peran ketua dan empat mahasiswa                                      | Nilai kembalian 200 setara 2,00 SKS                      | Lulus |
| UT-KAL-027  |   FR-18   | (Positif) Anggota penguji empat mahasiswa                           | Kontrak kalkulator telah ditempatkan | Memanggil hitungPengujiUjianAkhir dengan peran anggota dan empat mahasiswa                                    | Nilai kembalian 100 setara 1,00 SKS                      | Lulus |
| UT-KAL-028  |   FR-18   | (Negatif) Penguji ujian akhir nol mahasiswa                         | Kontrak kalkulator telah ditempatkan | Memanggil hitungPengujiUjianAkhir dengan jumlahMahasiswa bernilai 0                                           | Pemanggilan ditolak dengan galat InputTidakValid         | Lulus |
| UT-KAL-029  |   FR-18   | (Positif) Pembina kegiatan mahasiswa satu semester                  | Kontrak kalkulator telah ditempatkan | Memanggil hitungPembinaKegiatanMahasiswa dengan jumlahSemester bernilai 1                                     | Nilai kembalian 200 setara 2,00 SKS                      | Lulus |
| UT-KAL-030  |   FR-18   | (Negatif) Pembina kegiatan mahasiswa nol semester                   | Kontrak kalkulator telah ditempatkan | Memanggil hitungPembinaKegiatanMahasiswa dengan jumlahSemester bernilai 0                                     | Pemanggilan ditolak dengan galat InputTidakValid         | Lulus |
| UT-KAL-031  |   FR-18   | (Positif) Jabatan rektor satu semester                              | Kontrak kalkulator telah ditempatkan | Memanggil hitungJabatanPimpinanPerguruanTinggi dengan jabatan rektor dan satu semester                        | Nilai kembalian 600 setara 6,00 SKS                      | Lulus |
| UT-KAL-032  |   FR-18   | (Positif) Jabatan ketua jurusan satu semester                       | Kontrak kalkulator telah ditempatkan | Memanggil hitungJabatanPimpinanPerguruanTinggi dengan jabatan ketua jurusan dan satu semester                 | Nilai kembalian 300 setara 3,00 SKS                      | Lulus |
| UT-KAL-033  |   FR-18   | (Negatif) Jabatan pimpinan nol semester                             | Kontrak kalkulator telah ditempatkan | Memanggil hitungJabatanPimpinanPerguruanTinggi dengan jumlahSemester bernilai 0                               | Pemanggilan ditolak dengan galat InputTidakValid         | Lulus |
| UT-KAL-034  |   FR-18   | (Positif) Rekapitulasi nilai kredit                                 | Kontrak kalkulator telah ditempatkan | Memanggil jumlahkanSKS dengan daftar bernilai 300, 150, dan 200                                               | Nilai kembalian 650 setara 6,50 SKS                      | Lulus |
| UT-KAL-035  |   FR-18   | (*Edge*) Rekapitulasi daftar kosong                                 | Kontrak kalkulator telah ditempatkan | Memanggil jumlahkanSKS dengan daftar kosong                                                                   | Nilai kembalian 0 tanpa penolakan                        | Lulus |
| UT-KAL-036  |   NFR-02   | (*Edge*) Determinisme pemanggilan berulang                          | Kontrak kalkulator telah ditempatkan | Memanggil hitungPengajaran tiga kali dengan parameter identik                                                 | Ketiga pemanggilan mengembalikan nilai identik, yaitu 90 | Lulus |

 	Berdasarkan Tabel IV.78, seluruh tiga puluh enam skenario pada modul kalkulator berstatus lulus. Dua skenario perlu digarisbawahi karena keduanya memverifikasi perilaku yang mudah keliru diterapkan. Skenario UT-KAL-006 dan UT-KAL-007 memverifikasi perlakuan tepat pada ambang lima puluh persen, yaitu realisasi delapan dari enam belas pertemuan tetap dinilai sedangkan tujuh dari enam belas bernilai nol. Skenario UT-KAL-009 memverifikasi bahwa kegiatan yang tidak berlangsung satu semester penuh mengembalikan nilai nol dan bukan penolakan, sesuai aturan bisnis BR-15. Skenario pada modul token disajikan pada Tabel IV.79.

Tabel IV.79. Skenario *Unit Testing* Modul Token SKS


| ID Skenario |  FR Terkait  | Deskripsi                                               | Kondisi Awal                                                    | Langkah Pengujian                                                | Hasil yang Diharapkan                                                         | Status |
| ------------- | :-------------: | --------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------- | :------: |
| UT-TOK-001  |     FR-24     | (Positif) Identitas token sesuai rancangan              | Kontrak token telah ditempatkan                                 | Membaca nama, simbol, dan jumlah desimal token                   | Nama BKD SKS Token, simbol SKS, jumlah desimal 18                             | Lulus |
| UT-TOK-002  |     FR-24     | (Positif) Penerbitan oleh pemegang peran penerbit       | Kontrak token telah ditempatkan dengan peran penerbit diberikan | Menerbitkan 350 satuan ke alamat dosen                           | Saldo dosen menjadi 350 dan pasokan total menjadi 350                         | Lulus |
| UT-TOK-003  | FR-23, FR-24 | (Positif) Kejadian penerbitan memuat referensi simpulan | Kontrak token telah ditempatkan                                 | Menerbitkan 900 satuan disertai referensi berupa*hash* simpulan  | Kejadian SKSMinted memuat operator, penerima, jumlah, dan referensi yang sama | Lulus |
| UT-TOK-004  |     FR-24     | (Positif) Penerbitan berulang mengakumulasi saldo       | Alamat dosen telah memiliki saldo 350                           | Menerbitkan tambahan 250 satuan ke alamat yang sama              | Saldo dosen menjadi 600                                                       | Lulus |
| UT-TOK-005  |     FR-25     | (Positif) Penghapusan oleh administrator kontrak        | Alamat dosen memiliki saldo 500                                 | Menghapus 200 satuan disertai alasan koreksi                     | Saldo dosen menjadi 300                                                       | Lulus |
| UT-TOK-006  |     FR-25     | (Positif) Kejadian penghapusan memuat alasan koreksi    | Alamat dosen memiliki saldo 500                                 | Menghapus 200 satuan disertai alasan koreksi nilai kegiatan      | Kejadian SKSBurned memuat operator, pemilik, jumlah, dan alasan yang sama     | Lulus |
| UT-TOK-007  | FR-24, NFR-06 | (Negatif) Penerbitan tanpa peran penerbit               | Kontrak token telah ditempatkan                                 | Menerbitkan token dari alamat yang tidak memegang peran penerbit | Pemanggilan ditolak dengan galat AccessControlUnauthorizedAccount             | Lulus |
| UT-TOK-008  | FR-25, NFR-06 | (Negatif) Penghapusan tanpa peran administrator         | Alamat dosen memiliki saldo 500                                 | Menghapus token dari alamat pemegang peran penerbit saja         | Pemanggilan ditolak dengan galat AccessControlUnauthorizedAccount             | Lulus |
| UT-TOK-009  |     FR-24     | (Negatif) Penerbitan ke alamat nol                      | Kontrak token telah ditempatkan                                 | Menerbitkan 100 satuan ke alamat nol                             | Pemanggilan ditolak dengan galat InvalidAddress                               | Lulus |
| UT-TOK-010  |     FR-24     | (Negatif) Penerbitan dengan jumlah nol                  | Kontrak token telah ditempatkan                                 | Menerbitkan 0 satuan ke alamat dosen                             | Pemanggilan ditolak disertai pesan jumlah harus lebih dari nol                | Lulus |
| UT-TOK-011  |     FR-25     | (Negatif) Penghapusan dengan jumlah nol                 | Alamat dosen memiliki saldo 500                                 | Menghapus 0 satuan                                               | Pemanggilan ditolak disertai pesan jumlah harus lebih dari nol                | Lulus |
| UT-TOK-012  | FR-24, NFR-06 | (Negatif) Pemindahan langsung antar-alamat              | Alamat dosen memiliki saldo 500                                 | Memindahkan 100 satuan ke alamat lain                            | Pemanggilan ditolak dengan galat TokenNonTransferable                         | Lulus |
| UT-TOK-013  | FR-24, NFR-06 | (Negatif) Pemindahan atas nama pihak lain               | Alamat dosen memiliki saldo 500 dan telah memberi persetujuan   | Memindahkan 100 satuan melalui mekanisme persetujuan             | Pemanggilan ditolak dengan galat TokenNonTransferable                         | Lulus |
| UT-TOK-014  |     FR-25     | (*Edge*) Penghapusan melebihi saldo                     | Alamat dosen memiliki saldo 100                                 | Menghapus 200 satuan                                             | Pemanggilan ditolak dengan galat ERC20InsufficientBalance                     | Lulus |
| UT-TOK-015  |     FR-25     | (*Edge*) Penghapusan seluruh saldo                      | Alamat dosen memiliki saldo 400                                 | Menghapus 400 satuan                                             | Saldo dosen menjadi 0 dan pasokan total menjadi 0                             | Lulus |

 	Berdasarkan Tabel IV.79, skenario UT-TOK-012 dan UT-TOK-013 merupakan verifikasi terpenting pada modul ini karena keduanya membuktikan bahwa sifat *non-transferable* benar-benar menutup seluruh jalur pemindahan yang disediakan standar ERC-20, bukan hanya jalur pemindahan langsung. Skenario pada modul registri disajikan pada Tabel IV.80.

Tabel IV.80. Skenario *Unit Testing* Modul Registri Dokumen


| ID Skenario |  FR Terkait  | Deskripsi                                                | Kondisi Awal                                                       | Langkah Pengujian                                                                       | Hasil yang Diharapkan                                                                  | Status |
| ------------- | :-------------: | ---------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | :------: |
| UT-REG-001  |     FR-33     | (Positif) Pencatatan oleh pemegang peran pencatat        | Kontrak registri telah ditempatkan dengan peran pencatat diberikan | Mencatat sidik digital dokumen dengan aksi unggah dan referensi baris unggahan          | Kejadian DokumenTercatat memuat operator, sidik digital, aksi, dan referensi yang sama | Lulus |
| UT-REG-002  |     FR-33     | (Positif) Ketiga jenis aksi tercatat apa adanya          | Kontrak registri telah ditempatkan                                 | Mencatat sidik digital yang sama berturut-turut dengan aksi unggah, terapkan, dan hapus | Setiap kejadian memuat nilai aksi yang sesuai                                          | Lulus |
| UT-REG-003  |     FR-34     | (Positif) Referensi dokumen bukti tercatat apa adanya    | Kontrak registri telah ditempatkan                                 | Mencatat sidik digital dengan referensi berformat penunjuk dokumen bukti                | Kejadian memuat referensi yang identik dengan masukan                                  | Lulus |
| UT-REG-004  | FR-33, NFR-06 | (Negatif) Pencatatan tanpa peran pencatat                | Kontrak registri telah ditempatkan                                 | Mencatat sidik digital dari alamat yang tidak memegang peran pencatat                   | Pemanggilan ditolak dengan galat AccessControlUnauthorizedAccount                      | Lulus |
| UT-REG-005  |     FR-33     | (Negatif) Pencatatan dengan sidik digital bernilai nol   | Kontrak registri telah ditempatkan                                 | Mencatat sidik digital bernilai nol                                                     | Pemanggilan ditolak dengan galat InvalidHash                                           | Lulus |
| UT-REG-006  |     FR-33     | (*Edge*) Sidik digital sama dicatat lebih dari satu kali | Kontrak registri telah ditempatkan                                 | Mencatat sidik digital yang sama dua kali dengan aksi berbeda                           | Kedua pencatatan berhasil dan menghasilkan dua kejadian terpisah                       | Lulus |

 	Berdasarkan Tabel IV.80, skenario UT-REG-006 memverifikasi perilaku yang disengaja, yaitu kontrak registri sengaja tidak mencegah pencatatan berulang atas sidik digital yang sama. Perilaku tersebut diperlukan karena satu berkas yang sama memang dicatat lebih dari sekali sepanjang siklus hidupnya, yaitu ketika diunggah, ketika diterapkan, dan ketika dihapus. Hasil eksekusi seluruh skenario disajikan pada Gambar IV.36.

**[SISIPKAN GAMBAR: keluaran terminal eksekusi perintah pengujian kontrak, memperlihatkan ketiga suite beserta seluruh skenario berstatus lulus dan baris rekapitulasi tests 57, suites 3, pass 57, fail 0]**

Gambar IV.36. Hasil Eksekusi *Unit Testing*

 	Rekapitulasi hasil *unit testing* per modul disajikan pada Tabel IV.81.

Tabel IV.81. Rekapitulasi Hasil *Unit Testing* per Modul


| No. | Modul                     | Jumlah Skenario | Lulus | Gagal | Persentase Kelulusan |
| :---: | --------------------------- | :---------------: | :------: | :-----: | :--------------------: |
| 1. | Kalkulator BKD Pendidikan |       36       |   36   |   0   |         100%         |
| 2. | Token SKS                 |       15       |   15   |   0   |         100%         |
| 3. | Registri Dokumen          |        6        |   6   |   0   |         100%         |
|    | **Total**                 |     **57**     | **57** | **0** |       **100%**       |

 	Berdasarkan Tabel IV.81, seluruh lima puluh tujuh skenario berstatus lulus dengan waktu eksekusi keseluruhan sekitar seratus tiga puluh empat milidetik. Capaian tersebut memverifikasi bahwa ketiga kontrak berperilaku sesuai spesifikasi modul pada Tabel IV.22 sampai Tabel IV.24. Perlu ditegaskan bahwa status lulus pada seluruh skenario tidak berarti kode bebas dari cacat; pernyataan mengenai batas makna capaian ini disampaikan pada subbab IV.4.7.

### **IV.4.3	*Integration Testing***

 	*Integration testing* memverifikasi kontrak antarlapisan pada titik-titik tempat data berpindah dari satu lapisan ke lapisan lain. Berbeda dengan *unit testing* yang menguji fungsi secara terisolasi, pengujian ini menuntut seluruh lapisan berjalan dan dapat saling dihubungi, yaitu aplikasi web, basis data PostgreSQL, layanan ekstraksi dokumen, dan titik akhir RPC jaringan Base Sepolia. Fokus verifikasi diarahkan pada dua hal, yaitu kesesuaian data yang dipertukarkan terhadap kontrak yang dirancang, dan perilaku sistem ketika salah satu lapisan tidak dapat dihubungi. Skenario pengujian disajikan pada Tabel IV.82.

Tabel IV.82. Skenario *Integration Testing*


| ID Skenario |  FR Terkait  | Deskripsi                                                                       | Kondisi Awal                                                                   | Langkah Pengujian                                                            | Hasil yang Diharapkan                                                                         |     Status     |
| ------------- | :-------------: | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | :--------------: |
| IT-001      | FR-01, FR-02 | (Positif) Aplikasi web terhadap basis data pada jalur autentikasi               | Akun dosen aktif tersedia pada basis data                                      | Masuk memakai surel dan kata sandi yang tersimpan                            | Sesi terbit berisi peran yang benar dan pengguna diarahkan ke ruang kerjanya                  | **[LENGKAPI]** |
| IT-002      |     FR-01     | (Negatif) Autentikasi dengan akun yang dinonaktifkan                            | Akun dosen berstatus nonaktif                                                  | Masuk memakai kredensial yang benar dari akun nonaktif                       | Masuk ditolak dengan pesan yang sama seperti kredensial keliru                                | **[LENGKAPI]** |
| IT-003      |     FR-04     | (Positif) Aplikasi web terhadap derivasi*wallet*                                | Akun dosen belum memiliki alamat*wallet*                                       | Menetapkan*wallet* bagi dosen tersebut                                       | Alamat*wallet* tersimpan beserta indeks turunan yang unik                                     | **[LENGKAPI]** |
| IT-004      |     FR-18     | (Positif) Aplikasi web terhadap kontrak kalkulator                              | Periode aktif tersedia dan kontrak kalkulator dapat dihubungi                  | Menyimpan kegiatan pengajaran dengan parameter valid                         | Nilai kredit tersimpan pada kegiatan dengan status perhitungan berhasil                       | **[LENGKAPI]** |
| IT-005      | FR-18, NFR-03 | (Negatif) Perhitungan dengan parameter yang ditolak kontrak                     | Periode aktif tersedia                                                         | Menyimpan kegiatan pengajaran dengan realisasi melebihi rencana              | Kegiatan tetap tersimpan dengan status perhitungan gagal dan nilai kredit kosong              | **[LENGKAPI]** |
| IT-006      | FR-18, NFR-03 | (Negatif) Perhitungan ketika titik akhir RPC tidak dapat dihubungi              | Titik akhir RPC dinonaktifkan                                                  | Menyimpan kegiatan dengan parameter valid                                    | Kegiatan tetap tersimpan dengan status perhitungan gagal disertai pesan hasil aksi            | **[LENGKAPI]** |
| IT-007      |     FR-09     | (Positif) Aplikasi web terhadap layanan ekstraksi jalur deterministik           | Layanan ekstraksi berjalan dan kunci API terkonfigurasi                        | Mengunggah Surat Penugasan Pengajaran berformat PDF digital                  | Keluaran parser tersimpan utuh dan baris penugasan tampil pada pratinjau                      | **[LENGKAPI]** |
| IT-008      |     FR-09     | (Positif) Aplikasi web terhadap layanan ekstraksi jalur model bahasa visual     | Layanan ekstraksi berjalan dan kunci model terkonfigurasi                      | Mengunggah Surat Keputusan Pembina Organisasi Kemahasiswaan hasil pemindaian | Hasil penafsiran tersimpan dan baris pembina tampil pada pratinjau                            | **[LENGKAPI]** |
| IT-009      |     FR-09     | (Negatif) Unggah berkas bukan PDF                                               | Layanan ekstraksi berjalan                                                     | Mengunggah berkas berformat selain PDF                                       | Unggahan ditolak sebelum dikirimkan ke layanan ekstraksi                                      | **[LENGKAPI]** |
| IT-010      | FR-09, NFR-13 | (Negatif) Unggah ketika layanan ekstraksi tidak dapat dihubungi                 | Layanan ekstraksi dihentikan                                                   | Mengunggah Surat Penugasan Pengajaran                                        | Baris unggahan tercatat berstatus gagal beserta pesan penyebabnya, aplikasi tetap berjalan    | **[LENGKAPI]** |
| IT-011      |     FR-12     | (*Edge*) Penerapan hasil ekstraksi secara berulang                              | Unggahan telah berstatus terparse dan pernah diterapkan                        | Menerapkan unggahan yang sama untuk kedua kalinya                            | Kegiatan diperbarui tanpa penggandaan, dan kegiatan yang telah diklaim tidak berubah          | **[LENGKAPI]** |
| IT-012      |     FR-28     | (Positif) Aplikasi web terhadap layanan pemeriksaan dokumen bukti               | Kegiatan rumpun pembimbingan tersedia dan layanan ekstraksi berjalan           | Mengunggah dokumen bukti berformat PDF yang memuat nama pemilik akun         | Hasil pemeriksaan tersimpan menyertai dokumen dengan status cocok                             | **[LENGKAPI]** |
| IT-013      | FR-28, NFR-13 | (Negatif) Unggah dokumen bukti ketika layanan pemeriksaan tidak dapat dihubungi | Layanan ekstraksi dihentikan                                                   | Mengunggah dokumen bukti pada kegiatan rumpun pembimbingan                   | Dokumen tetap tersimpan, hasil pemeriksaan tercatat berstatus gagal beserta pesan penyebabnya | **[LENGKAPI]** |
| IT-014      |     FR-28     | (Negatif) Unggah dokumen bukti berupa pranala luar                              | Kegiatan rumpun pembimbingan tersedia                                          | Menambahkan bukti berupa pranala luar                                        | Pemeriksaan tidak dijalankan, dokumen tetap tersimpan tanpa muatan hasil pemeriksaan          | **[LENGKAPI]** |
| IT-015      |     FR-24     | (Positif) Aplikasi web terhadap kontrak token pada penerbitan                   | Kedua asesor telah mengesahkan dan dosen memiliki alamat*wallet*               | Menjalankan pengesahan oleh asesor kedua                                     | Token terbit,*transaction hash* tersimpan, dan saldo *wallet* dosen bertambah                 | **[LENGKAPI]** |
| IT-016      | FR-24, NFR-03 | (Negatif) Penerbitan token ketika titik akhir RPC tidak dapat dihubungi         | Titik akhir RPC dinonaktifkan                                                  | Menjalankan pengesahan oleh asesor kedua                                     | Simpulan tetap tersimpan dan riwayat transaksi tercatat berstatus gagal                       | **[LENGKAPI]** |
| IT-017      |     FR-25     | (Positif) Aplikasi web terhadap kontrak token pada koreksi                      | Alamat*wallet* dosen memiliki saldo token                                      | Menghapus sebagian token disertai alasan koreksi                             | Saldo berkurang, kejadian penghapusan tercatat, riwayat transaksi tersimpan                   | **[LENGKAPI]** |
| IT-018      | FR-26, NFR-12 | (*Edge*) Pembacaan riwayat *event* pada rentang blok melebihi batas penyedia    | Kontrak token telah ditempatkan pada Base Sepolia sejak ribuan blok sebelumnya | Membuka halaman log*blockchain*                                              | Pembacaan berjenjang berhasil dan seluruh kejadian tampil tanpa galat penyedia                | **[LENGKAPI]** |
| IT-019      | FR-33, NFR-15 | (Positif) Aplikasi web terhadap kontrak registri                                | Kontrak registri dapat dihubungi                                               | Mengunggah dokumen penugasan                                                 | Sidik digital tercatat pada registri dan riwayat transaksi tersimpan berstatus berhasil       | **[LENGKAPI]** |
| IT-020      | FR-33, NFR-15 | (Negatif) Pencatatan registri ketika titik akhir RPC tidak dapat dihubungi      | Titik akhir RPC dinonaktifkan                                                  | Mengunggah dokumen penugasan                                                 | Unggahan tetap tersimpan dan riwayat transaksi tercatat berstatus gagal                       | **[LENGKAPI]** |

 	Rekapitulasi hasil *integration testing* per titik integrasi disajikan pada Tabel IV.83.

Tabel IV.83. Rekapitulasi Hasil *Integration Testing* per Titik Integrasi


| No. | Titik Integrasi                                 | Jumlah Skenario |     Lulus     |     Gagal     | Persentase Kelulusan |
| :---: | ------------------------------------------------- | :---------------: | :--------------: | :--------------: | :--------------------: |
| 1. | Aplikasi web terhadap basis data                |        3        | **[LENGKAPI]** | **[LENGKAPI]** |    **[LENGKAPI]**    |
| 2. | Aplikasi web terhadap kontrak kalkulator        |        3        | **[LENGKAPI]** | **[LENGKAPI]** |    **[LENGKAPI]**    |
| 3. | Aplikasi web terhadap layanan ekstraksi dokumen |        5        | **[LENGKAPI]** | **[LENGKAPI]** |    **[LENGKAPI]**    |
| 4. | Aplikasi web terhadap layanan pemeriksaan bukti |        3        | **[LENGKAPI]** | **[LENGKAPI]** |    **[LENGKAPI]**    |
| 5. | Aplikasi web terhadap kontrak token             |        4        | **[LENGKAPI]** | **[LENGKAPI]** |    **[LENGKAPI]**    |
| 6. | Aplikasi web terhadap kontrak registri          |        2        | **[LENGKAPI]** | **[LENGKAPI]** |    **[LENGKAPI]**    |
|    | **Total**                                       |     **20**     | **[LENGKAPI]** | **[LENGKAPI]** |    **[LENGKAPI]**    |

 	Berdasarkan Tabel IV.82 dan Tabel IV.83, enam dari dua puluh skenario secara khusus menguji perilaku sistem ketika lapisan luar tidak dapat dihubungi, yaitu IT-005, IT-006, IT-010, IT-013, IT-016, dan IT-020. Porsi tersebut disengaja karena ketahanan terhadap kegagalan lapisan luar merupakan persyaratan nonfungsional yang eksplisit, yaitu NFR-03, NFR-13, dan NFR-15, sekaligus merupakan konsekuensi keputusan menempatkan aturan perhitungan dan pencatatan hasil di luar kendali institusi.

### **IV.4.4	*System Testing***

 	Sesuai model *waterfall* sebagaimana diuraikan pada subbab II.1.14, fase pengintegrasian dan pengujian sistem mencakup dua aktivitas yang berbeda cakupannya. *Integration testing* pada subbab IV.4.3 memverifikasi kontrak antarkomponen pada setiap titik integrasi secara terpisah, sedangkan *system testing* memverifikasi sistem yang telah terintegrasi penuh terhadap alur pemakaian yang lengkap. Pengujian ini dilaksanakan secara *end-to-end*, yaitu menelusuri satu alur kerja dari awal hingga akhir yang bersambung melintasi beberapa modul, beberapa peran pengguna, dan beberapa lapisan sistem. Skenario pengujian disajikan pada Tabel IV.84.

Tabel IV.84. Skenario *System Testing* Berbasis Alur Pengguna


| ID Skenario |        FR Terkait        | Deskripsi                                                                           | Kondisi Awal                                                    | Langkah Pengujian                                                                                                                                                       | Hasil yang Diharapkan                                                                                                                                      |     Status     |
| ------------- | :-------------------------: | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------: |
| ST-SYS-01   |    FR-03 sampai FR-07    | (Positif) Penyiapan periode, akun,*wallet*, dan penugasan asesor oleh administrator | Basis data telah berisi data referensi kegiatan                 | Membuat periode beserta rentang ketiga fasenya, mengaktifkannya, menambah akun dosen dan asesor, menetapkan*wallet* dosen, lalu menugaskan dua asesor secara massal     | Periode aktif dengan fase pengisian berjalan, setiap dosen memiliki alamat*wallet* unik, dan setiap dokumen BKD memiliki dua asesor berbeda                | **[LENGKAPI]** |
| ST-SYS-02   |    FR-09 sampai FR-12    | (Positif) Ekstraksi dokumen penugasan menjadi kegiatan portofolio                   | Periode aktif berjalan dan layanan ekstraksi tersedia           | Mengunggah keenam dokumen penugasan, meninjau pratinjau, mengoreksi baris yang keliru, menerapkan hasil, lalu menerapkan ulang                                          | Kegiatan terbentuk pada dokumen BKD dosen yang sesuai dengan berkas sumber terlampir sebagai bukti, dan penerapan ulang tidak menggandakan kegiatan        | **[LENGKAPI]** |
| ST-SYS-03   | FR-13 sampai FR-17, FR-28 | (Positif) Pengisian dan pengajuan dokumen BKD oleh dosen                            | Kegiatan portofolio telah terbentuk dan fase pengisian berjalan | Menarik kegiatan ke dokumen BKD, menambah kegiatan mandiri, mengunggah dokumen bukti, menetapkan capaian, lalu menyimpan permanen                                       | Dokumen BKD berisi kegiatan lengkap beserta nilai kredit hasil perhitungan kontrak dan berstatus siap dinilai                                              | **[LENGKAPI]** |
| ST-SYS-04   |    FR-20 sampai FR-24    | (Positif) Penilaian dua asesor hingga penerbitan token                              | Dokumen BKD telah disimpan permanen dan fase penilaian berjalan | Asesor pertama menilai seluruh kegiatan lalu mengesahkan, kemudian asesor kedua menilai dan mengesahkan                                                                 | Simpulan terbentuk dengan status memenuhi atau tidak memenuhi, token terbit ke*wallet* dosen, *transaction hash* tercatat, dan dokumen BKD berstatus final | **[LENGKAPI]** |
| ST-SYS-05   | FR-25 sampai FR-27, FR-34 | (Positif) Koreksi kredit dan penelusuran hasil                                      | Token telah terbit pada alamat*wallet* dosen                    | Administrator menghapus sebagian token disertai alasan, kemudian meninjau log*blockchain*, registri dokumen, dan rekapitulasi                                           | Saldo dosen berkurang, kejadian penghapusan tampil pada log, registri menampilkan jejak dokumen, dan rekapitulasi menampilkan nilai yang konsisten         | **[LENGKAPI]** |
| ST-SYS-06   |       FR-02, NFR-05       | (Negatif) Pembatasan akses lintas peran                                             | Ketiga akun peran tersedia                                      | Dosen mencoba mengakses ruang kerja asesor dan administrator, asesor mencoba mengakses ruang kerja administrator, dan administrator mencoba mengakses ruang kerja dosen | Setiap percobaan diarahkan kembali ke beranda peran pengguna yang bersangkutan                                                                             | **[LENGKAPI]** |
| ST-SYS-07   |       FR-28, FR-29       | (Negatif) Deteksi bukti yang bukan milik dosen bersangkutan                         | Kegiatan pembimbingan tersedia dan layanan pemeriksaan berjalan | Dosen mengunggah lembar pengesahan yang memuat nama dosen lain, kemudian asesor membuka halaman penilaian dan halaman rincian bukti                                     | Kegiatan tersebut tampil sebagai temuan pada halaman penilaian asesor, dan panel rincian menampilkan seluruh nama yang terbaca beserta perannya            | **[LENGKAPI]** |
| ST-SYS-08   |       FR-28, FR-29       | (Negatif) Deteksi peran yang tidak sesuai klaim                                     | Kegiatan pembimbingan dengan peran pembimbing utama tersedia    | Dosen mengunggah dokumen yang memuat namanya sebagai pembimbing pendamping                                                                                              | Hasil pemeriksaan berstatus peran tidak sesuai dan kegiatan ditandai sebagai temuan                                                                        | **[LENGKAPI]** |
| ST-SYS-09   |       FR-30, NFR-14       | (Positif) Persetujuan manual asesor atas hasil pemeriksaan                          | Terdapat dokumen bukti berstatus temuan                         | Asesor menjalankan pemeriksaan ulang, kemudian menyetujui hasil secara manual, lalu mencabut persetujuannya                                                             | Penanda temuan hilang setelah disetujui dan muncul kembali setelah dicabut, dengan hasil pembacaan parser tetap tersimpan                                  | **[LENGKAPI]** |
| ST-SYS-10   |       FR-06, NFR-09       | (Negatif) Pembatasan aksi di luar fase yang berlaku                                 | Periode aktif berada pada fase penilaian                        | Dosen mencoba menyunting kegiatan dan mengunggah bukti, asesor mencoba menilai pada fase pengisian                                                                      | Setiap aksi ditolak disertai pesan yang menyebut fase yang sedang berjalan                                                                                 | **[LENGKAPI]** |

 	Berdasarkan Tabel IV.84, kesepuluh skenario tersebut secara bersama-sama menelusuri seluruh rantai kerja sistem dari penyiapan periode hingga penelusuran hasil, sehingga setiap persyaratan fungsional dilewati sekurang-kurangnya satu kali pada konteks pemakaian nyata. Empat skenario terakhir sengaja bersifat negatif karena menguji penegakan pembatasan yang menjadi inti jaminan mutu sistem, yaitu pembatasan akses per peran, pembatasan aksi per fase, dan penandaan ketidaksesuaian dokumen bukti.

### **IV.4.5	Uji Akurasi Perhitungan Kredit**

 	Uji akurasi memverifikasi persyaratan NFR-01, yaitu nilai kredit yang dihasilkan sistem harus identik dengan hasil perhitungan manual berdasarkan Rubrik BKD unsur pendidikan. Pengujian ini dibedakan dari *unit testing* pada subbab IV.4.2 karena sudut pandangnya berbeda. *Unit testing* memverifikasi bahwa kode berperilaku sesuai spesifikasi modul, sedangkan uji akurasi memverifikasi bahwa spesifikasi modul itu sendiri merupakan penerjemahan yang benar atas ketentuan normatif pada rubrik. Nilai acuan pada kolom perhitungan manual diturunkan langsung dari Rubrik BKD, bukan dari kode. Kasus uji beserta hasilnya disajikan pada Tabel IV.85.

Tabel IV.85. Kasus Uji Akurasi Perhitungan Kredit terhadap Rubrik BKD


| No. | Butir Rubrik                      | Parameter Kasus Uji                                                       | Perhitungan Manual menurut Rubrik                                | Nilai Rujukan (SKS) | Keluaran Kontrak (skala kali seratus) | Kesesuaian |
| :---: | ----------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------ | :-------------------: | :-------------------------------------: | :----------: |
| 1. | Pendidikan formal doktor          | 1 semester                                                                | 12 dikali 1                                                      |        12,00        |                 1200                 |   Sesuai   |
| 2. | Pelaksanaan perkuliahan           | Bobot 3 SKS, rencana 16, realisasi 16, satu semester penuh, dosen tunggal | 3 dikali 16 dibagi 16                                            |        3,00        |                  300                  |   Sesuai   |
| 3. | Pelaksanaan perkuliahan           | Bobot 3 SKS, rencana 16, realisasi 12, satu semester penuh, dosen tunggal | 3 dikali 12 dibagi 16                                            |        2,25        |                  225                  |   Sesuai   |
| 4. | Pelaksanaan perkuliahan           | Bobot 3 SKS, realisasi penuh, pengampuan bersama porsi 50 persen          | 3 dikali 50 persen                                               |        1,50        |                  150                  |   Sesuai   |
| 5. | Pelaksanaan perkuliahan           | Bobot 2 SKS, rencana 16, realisasi 8, satu semester penuh                 | Realisasi tepat 50 persen, memenuhi ambang; 2 dikali 8 dibagi 16 |        1,00        |                  100                  |   Sesuai   |
| 6. | Pelaksanaan perkuliahan           | Bobot 2 SKS, rencana 16, realisasi 7, satu semester penuh                 | Realisasi 43,75 persen, di bawah ambang 50 persen                |        0,00        |                   0                   |   Sesuai   |
| 7. | Membimbing seminar mahasiswa      | 1 semester                                                                | 1 dikali 1                                                       |        1,00        |                  100                  |   Sesuai   |
| 8. | Membimbing KKN, PKL, atau magang  | 1 semester                                                                | 2 dikali 1                                                       |        2,00        |                  200                  |   Sesuai   |
| 9. | Membimbing tugas akhir            | Pembimbing utama, disertasi, 2 mahasiswa                                  | 1,33 dikali 2                                                    |        2,66        |                  266                  |   Sesuai   |
| 10. | Membimbing tugas akhir            | Pembimbing pendamping, tesis, 2 mahasiswa                                 | 0,75 dikali 2                                                    |        1,50        |                  150                  |   Sesuai   |
| 11. | Membimbing tugas akhir            | Pembimbing utama, skripsi, 4 mahasiswa                                    | 0,50 dikali 4                                                    |        2,00        |                  200                  |   Sesuai   |
| 12. | Membimbing tugas akhir            | Pembimbing pendamping, laporan akhir studi, 4 mahasiswa                   | 0,25 dikali 4                                                    |        1,00        |                  100                  |   Sesuai   |
| 13. | Penguji ujian akhir               | Ketua penguji, 4 mahasiswa                                                | 0,50 dikali 4                                                    |        2,00        |                  200                  |   Sesuai   |
| 14. | Penguji ujian akhir               | Anggota penguji, 4 mahasiswa                                              | 0,25 dikali 4                                                    |        1,00        |                  100                  |   Sesuai   |
| 15. | Membina kegiatan mahasiswa        | 1 semester                                                                | 2 dikali 1                                                       |        2,00        |                  200                  |   Sesuai   |
| 16. | Jabatan pimpinan perguruan tinggi | Rektor, 1 semester                                                        | 6 dikali 1                                                       |        6,00        |                  600                  |   Sesuai   |
| 17. | Jabatan pimpinan perguruan tinggi | Ketua jurusan, 1 semester                                                 | 3 dikali 1                                                       |        3,00        |                  300                  |   Sesuai   |
| 18. | Rekapitulasi total                | Daftar nilai 3,00 SKS, 1,50 SKS, dan 2,00 SKS                             | Penjumlahan langsung                                             |        6,50        |                  650                  |   Sesuai   |

 	Berdasarkan Tabel IV.85, seluruh delapan belas kasus uji menghasilkan nilai yang identik dengan perhitungan manual, sehingga persyaratan NFR-01 terpenuhi tanpa selisih sama sekali. Ketiadaan toleransi selisih pada kriteria kelulusan bukan merupakan penetapan yang terlalu ketat, melainkan konsekuensi langsung dari sifat rubrik yang deterministik, sehingga satu ketidaksesuaian pun menandakan cacat logika dan bukan galat pembulatan yang dapat ditoleransi.

 	Selain kesesuaian nilai, uji akurasi juga memeriksa satu titik yang dapat menghasilkan nilai keliru tanpa memunculkan galat, yaitu kesesuaian urutan opsi pada skema parameter data referensi terhadap urutan anggota enumerasi pada kontrak. Ketidaksesuaian pada titik tersebut tidak akan ditolak kontrak melainkan menghasilkan nilai peran atau jenis yang salah secara diam-diam. Hasil pemeriksaan disajikan pada Tabel IV.86.

Tabel IV.86. Pemeriksaan Kesesuaian Urutan Opsi Parameter terhadap Enumerasi Kontrak


| Butir Aturan | Nama Parameter  | Urutan Opsi pada Data Referensi                                      | Urutan Anggota Enumerasi pada Kontrak          | Kesesuaian |
| :------------: | ----------------- | ---------------------------------------------------------------------- | ------------------------------------------------ | :----------: |
|    EDU203    | peran           | Pembimbing Utama, Pembimbing Pendamping                              | PembimbingUtama, PembimbingPendamping          |   Sesuai   |
|    EDU203    | jenisTugasAkhir | Disertasi, Tesis, Skripsi, Tugas Akhir                               | Disertasi, Tesis, Skripsi, TugasAkhir          |   Sesuai   |
|    EDU301    | peranPenguji    | Ketua, Anggota                                                       | Ketua, Anggota                                 |   Sesuai   |
|    EDU701    | jabatan         | Enam jenjang jabatan mulai rektor hingga kepala bagian program studi | Enam anggota enumerasi dengan urutan yang sama |   Sesuai   |

 	Berdasarkan Tabel IV.86, seluruh parameter bertipe pilihan pada data referensi memiliki urutan opsi yang identik dengan urutan anggota enumerasi pada kontrak, sehingga konversi indeks pada fungsi hitungViaKontrak menghasilkan argumen yang benar. Pemeriksaan ini perlu diulang setiap kali butir aturan baru ditambahkan pada data referensi, dan kebutuhan tersebut dicatat sebagai bagian pemeliharaan pada subbab IV.5.2.

### **IV.4.6	Pengujian Aspek Nonfungsional**

 	Pengujian aspek nonfungsional memverifikasi pemenuhan persyaratan pada Tabel IV.12 dengan kriteria penerimaan mengacu pada model kualitas produk ISO/IEC 25010 (ISO/IEC, 2023). Verifikasi difokuskan pada aspek yang benar-benar telah diterapkan pada sistem, bukan pada seluruh sub-karakteristik model kualitas tersebut. Pemetaan setiap persyaratan terhadap sub-karakteristik, cara verifikasi, dan hasilnya disajikan pada Tabel IV.87.

Tabel IV.87. Pemetaan Persyaratan Nonfungsional ke Sub-karakteristik ISO/IEC 25010 beserta Hasilnya


|  Kode  | Karakteristik            | Sub-karakteristik            | Cara Verifikasi                                                                                                                | Hasil                                                                                                                               |
| :------: | -------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-01 | *Functional suitability* | *Functional correctness*     | Uji akurasi perhitungan pada subbab IV.4.5                                                                                     | Terpenuhi, seluruh 18 kasus uji menghasilkan nilai identik dengan perhitungan manual                                                |
| NFR-02 | *Reliability*            | *Maturity*                   | Skenario UT-KAL-036, pemanggilan berulang dengan parameter identik                                                             | Terpenuhi, ketiga pemanggilan menghasilkan nilai identik                                                                            |
| NFR-03 | *Reliability*            | *Fault tolerance*            | Skenario IT-005, IT-006, dan IT-016                                                                                            | **[LENGKAPI]**                                                                                                                      |
| NFR-04 | *Security*               | *Confidentiality*            | Inspeksi isi kolom kata sandi pada basis data dan pemeriksaan bahwa kunci privat tidak muncul pada berkas keluaran*build*      | **[LENGKAPI]**                                                                                                                      |
| NFR-05 | *Security*               | *Authenticity*               | Skenario ST-SYS-06, percobaan akses lintas peran                                                                               | **[LENGKAPI]**                                                                                                                      |
| NFR-06 | *Security*               | *Integrity*                  | Skenario UT-TOK-007, UT-TOK-008, UT-TOK-012, UT-TOK-013, dan UT-REG-004, serta penghitungan ulang*hash* simpulan               | Terpenuhi pada bagian kontrol akses dan pembatasan pemindahan; penghitungan ulang*hash* **[LENGKAPI]**                              |
| NFR-07 | *Maintainability*        | *Modularity*                 | Pemeriksaan pemetaan butir aturan terhadap modul perhitungan pada Tabel IV.21 dan pemusatan akses*on-chain* pada satu modul    | Terpenuhi, kedelapan butir yang diotomatisasi terpetakan ke tepat satu modul, dan seluruh akses*on-chain* terpusat pada satu berkas |
| NFR-08 | *Maintainability*        | *Testability*                | Eksekusi 57 skenario*unit testing* pada jaringan simulasi tanpa basis data dan antarmuka                                       | Terpenuhi, seluruh skenario berjalan tanpa dependensi lapisan aplikasi dalam 134 milidetik                                          |
| NFR-09 | *Usability*              | *User error protection*      | Pengamatan dialog konfirmasi pada penyimpanan permanen, pengesahan penilaian, penerapan hasil ekstraksi, dan penghapusan token | **[LENGKAPI]**                                                                                                                      |
| NFR-10 | *Usability*              | *Operability*                | Pengamatan bahwa alur dosen dan asesor pada ST-SYS-03 dan ST-SYS-04 dapat diselesaikan tanpa dompet kripto                     | **[LENGKAPI]**                                                                                                                      |
| NFR-11 | *Portability*            | *Installability*             | Pemasangan ulang sistem pada lingkungan bersih mengikuti prosedur pada dokumen penyiapan                                       | **[LENGKAPI]**                                                                                                                      |
| NFR-12 | *Performance efficiency* | *Time behaviour*             | Skenario IT-018, pembacaan*event* pada rentang blok melebihi batas penyedia                                                    | **[LENGKAPI]**                                                                                                                      |
| NFR-13 | *Reliability*            | *Fault tolerance*            | Skenario IT-013, unggah dokumen bukti ketika layanan pemeriksaan tidak dapat dihubungi                                         | **[LENGKAPI]**                                                                                                                      |
| NFR-14 | *Functional suitability* | *Functional appropriateness* | Skenario ST-SYS-09, persetujuan manual asesor beserta pencabutannya                                                            | **[LENGKAPI]**                                                                                                                      |
| NFR-15 | *Reliability*            | *Fault tolerance*            | Skenario IT-020, pencatatan registri ketika titik akhir RPC tidak dapat dihubungi                                              | **[LENGKAPI]**                                                                                                                      |

 	Berdasarkan Tabel IV.87, aspek yang telah terverifikasi sepenuhnya melalui pengujian otomatis adalah *functional correctness*, *maturity*, *modularity*, dan *testability*, karena keempatnya dapat dinilai tanpa memerlukan lingkungan operasional lengkap. Aspek lainnya menuntut eksekusi pada lingkungan operasional dan dilengkapi setelah *integration testing* serta *system testing* dijalankan.

 	Sejumlah sub-karakteristik pada ISO/IEC 25010 dinyatakan tidak diuji pada Tugas Akhir ini, yaitu *performance efficiency* pada sub-karakteristik *resource utilization* dan *capacity* karena tidak dilakukan *load testing* maupun *stress testing*, *compatibility* pada *co-existence* dan *interoperability* karena sistem tidak diintegrasikan dengan sistem akademik lain sesuai batasan pada subbab I.6.2, *security* pada *non-repudiation* dan *accountability* karena tidak dilakukan pengujian penetrasi, *reliability* pada *recoverability* karena prosedur pemulihan bencana berada di luar lingkup, serta sebagian sub-karakteristik *usability* seperti *learnability* dan *user interface aesthetics* yang baru tercermin melalui uji adopsi pengguna pada Bab V. Aspek tersebut menjadi rekomendasi pengujian lanjutan pada saran Bab VI.

### **IV.4.7	Kesimpulan Hasil Pengujian**

 	Subbab ini menyatukan capaian setiap jenis pengujian menjadi satu simpulan ringkas. Rekapitulasi seluruh pengujian disajikan pada Tabel IV.88.

Tabel IV.88. Rekapitulasi Seluruh Pengujian


| No. | Jenis Pengujian                | Jumlah Item Uji |     Lulus     |     Gagal     | Persentase Kelulusan |
| :---: | -------------------------------- | :----------------: | :--------------: | :--------------: | :--------------------: |
| 1. | *Unit Testing*                 |   57 skenario   |       57       |       0       |         100%         |
| 2. | *Integration Testing*          |   20 skenario   | **[LENGKAPI]** | **[LENGKAPI]** |    **[LENGKAPI]**    |
| 3. | *System Testing*               | 10 alur pengguna | **[LENGKAPI]** | **[LENGKAPI]** |    **[LENGKAPI]**    |
| 4. | Uji Akurasi Perhitungan Kredit |   18 kasus uji   |       18       |       0       |         100%         |
| 5. | Pengujian Aspek Nonfungsional  |  15 persyaratan  | **[LENGKAPI]** | **[LENGKAPI]** |    **[LENGKAPI]**    |

 	Berdasarkan Tabel IV.88, pengujian yang telah dieksekusi sepenuhnya, yaitu *unit testing* dan uji akurasi perhitungan kredit, mencapai kelulusan seratus persen. Capaian tersebut memverifikasi dua hal yang berbeda. Kelulusan *unit testing* memverifikasi bahwa ketiga kontrak berperilaku sesuai spesifikasi modul yang dirancang pada subbab IV.2.3, sedangkan kelulusan uji akurasi memverifikasi bahwa spesifikasi modul tersebut merupakan penerjemahan yang benar atas Rubrik BKD unsur pendidikan. Keduanya bersama-sama menjawab permasalahan ketidakkonsistenan perhitungan yang dirumuskan pada subbab I.2 butir ketiga.

 	Perlu ditegaskan bahwa status lulus pada seluruh skenario tidak berarti kode bebas dari cacat. Jumlah dan variasi skenario masih terbatas dan belum menjangkau seluruh kemungkinan kombinasi masukan maupun seluruh jalur logika, sedangkan cakupan *unit testing* otomatis terbatas pada lapisan *on-chain* sehingga modul pada lapisan aplikasi web tidak memiliki pengujian unit tersendiri. **Persentase sempurna ini membuktikan keberhasilan verifikasi atas skenario yang didefinisikan, bukan jaminan bahwa sistem bebas dari *bug*.** Keterbatasan kedalaman pengujian tersebut menjadi dasar rekomendasi perluasan cakupan uji pada saran Bab VI.

 	Capaian kelulusan pada lapisan *on-chain* juga tidak terjadi secara kebetulan, melainkan merupakan konsekuensi langsung dari keputusan arsitektural pada subbab IV.1.3.2. Perumusan seluruh fungsi perhitungan sebagai fungsi murni tanpa penyimpanan status menghilangkan seluruh sumber ketidakpastian yang lazim muncul pada pengujian, yaitu urutan eksekusi, keadaan sebelumnya, dan identitas pemanggil. Pemisahan satu butir aturan menjadi satu fungsi mandiri menjadikan setiap kegagalan dapat dilokalisasi ke satu butir rubrik tertentu. Kedua keputusan tersebut menjadikan lapisan yang paling kritis pada sistem ini sekaligus menjadi lapisan yang paling mudah diverifikasi.

 	Dengan selesainya tahap pengujian, verifikasi teknis atas pemenuhan spesifikasi telah dituntaskan dan sistem siap memasuki tahap pengoperasian yang diuraikan pada subbab IV.5. Adapun pengukuran sejauh mana sistem yang telah terverifikasi ini memberikan dampak nyata bagi penggunanya menjadi pembahasan pada Bab V.

## **IV.5	*Operation* dan *Maintenance***

 	Setelah tahap pengujian pada subbab IV.4 memverifikasi pemenuhan spesifikasi, sistem memasuki tahap terakhir model *waterfall*, yaitu operasi dan pemeliharaan. Menurut Sommerville (2016), tahap ini merupakan fase dengan rentang waktu terpanjang dalam siklus hidup perangkat lunak, karena mencakup keseluruhan masa penggunaan sistem secara praktis di lingkungan operasional. Pada fase ini sistem dipasang dan dioperasikan pada lingkungan sesungguhnya, sementara pemeliharaan berlangsung untuk memperbaiki kesalahan yang belum terdeteksi pada tahap sebelumnya, menyesuaikan sistem terhadap perubahan lingkungan, sekaligus menyempurnakan implementasinya.

 	Pada pengembangan sistem LedgerDik, tahap ini telah dijalankan secara nyata selama masa Tugas Akhir dalam bentuk penempatan ketiga *smart contract* ke jaringan uji Base Sepolia, pengoperasian aplikasi web beserta basis data dan layanan ekstraksi pada lingkungan peladen, serta serangkaian kegiatan pemeliharaan yang diturunkan dari temuan pemakaian nyata. Subbab ini menguraikan kedua aspek tersebut secara berurutan, dimulai dari operasi sistem pada subbab IV.5.1 dan dilanjutkan dengan pemeliharaan sistem pada subbab IV.5.2.

### **IV.5.1	Operasi Sistem**

 	Kegiatan penempatan yang mengawali fase operasional memiliki karakteristik khusus dibandingkan sistem konvensional karena melibatkan dua sasaran yang berbeda sifatnya, yaitu lapisan *on-chain* yang penempatannya bersifat sekali jalan dan menghasilkan alamat permanen, serta lapisan *off-chain* yang dapat diperbarui berulang kali. Kedua sasaran tersebut diuraikan terpisah pada sub-subbab berikut.

#### **IV.5.1.1	Penempatan Lapisan *On-Chain***

 	Ketiga *smart contract* ditempatkan ke jaringan uji Base Sepolia melalui skrip penempatan yang dijalankan kerangka kerja Hardhat. Skrip tersebut menempatkan kontrak kalkulator tanpa argumen konstruktor, kemudian menempatkan kontrak token dan kontrak registri dengan alamat penempat sebagai pemegang seluruh peran awalnya. Setelah penempatan selesai, kode sumber setiap kontrak diverifikasi pada penjelajah blok Basescan agar aturan yang berjalan dapat ditinjau pihak eksternal, sesuai aturan bisnis BR-28. Identitas penempatan ketiga kontrak disajikan pada Tabel IV.89.

Tabel IV.89. Identitas Penempatan Kontrak pada Jaringan Base Sepolia


| Kontrak                 | Alamat Kontrak                                               |      Blok Penempatan      | Peran Awal                                                  |
| ------------------------- | -------------------------------------------------------------- | :--------------------------: | ------------------------------------------------------------- |
| KalkulatorBKDPendidikan | **[VERIFIKASI: 0xb1Ad6763A8FD2738613E235940Eafc75b920fC22]** |         Tidak ada         | Tidak ada, seluruh fungsi bersifat murni dan terbuka        |
| BKDSKSToken             | **[VERIFIKASI: 0xa824ee509C23632b54c9436808B71ED46213D288]** | **[VERIFIKASI: 44731594]** | Administrator kontrak dan penerbit dipegang alamat penempat |
| BKDDokumenRegistri      | **[VERIFIKASI: 0xdCdeb7969f5680fC960aBF7863a6315C26c187c7]** | **[VERIFIKASI: 46031066]** | Administrator kontrak dan pencatat dipegang alamat penempat |

 	Berdasarkan Tabel IV.89, kontrak kalkulator tidak mencantumkan blok penempatan karena tidak memancarkan kejadian apa pun sehingga tidak pernah ditelusuri riwayatnya, sedangkan kedua kontrak lainnya mencantumkan blok penempatan karena nilai tersebut menjadi titik awal penelusuran *event* sebagaimana diuraikan pada subbab IV.3.6. Alamat ketiga kontrak diperlakukan sebagai konfigurasi lingkungan dan tidak dituliskan di dalam kode, sesuai batasan perancangan DC-10, sehingga penempatan ulang kontrak cukup ditindaklanjuti dengan penyesuaian variabel lingkungan tanpa mengubah kode aplikasi. Hasil verifikasi kode sumber kontrak pada penjelajah blok disajikan pada Gambar IV.37.

**[SISIPKAN GAMBAR: tangkapan layar Basescan yang memperlihatkan kode sumber ketiga kontrak dalam keadaan terverifikasi beserta penanda contract source code verified]**

Gambar IV.37. Verifikasi Kode Sumber Kontrak pada Basescan

 	Perlu ditegaskan bahwa penempatan dibatasi pada jaringan uji Base Sepolia dan tidak dilanjutkan ke jaringan produksi, sesuai batasan yang ditetapkan pada subbab I.6.2 dan persyaratan lain OR-02 pada dokumen SRS. Konsekuensi pembatasan tersebut adalah token kredit yang diterbitkan tidak memiliki nilai ekonomis dan jaringan uji dapat direset penyelenggaranya, sehingga sistem pada tahap ini merupakan prototipe fungsional dan belum dapat dipakai sebagai rekam resmi institusi.

#### **IV.5.1.2	Pengoperasian Lapisan *Off-Chain***

 	Lapisan *off-chain* dioperasikan pada satu peladen virtual dengan seluruh komponennya dikemas sebagai kontainer yang diorkestrasi melalui satu berkas komposisi. Konfigurasi operasional setiap layanan disajikan pada Tabel IV.90.

Tabel IV.90. Konfigurasi Operasional Lapisan *Off-Chain*


| Layanan | Peran                        | Konfigurasi Operasional                                                                                                                                                                     |
| --------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| db      | Basis data operasional       | PostgreSQL 16 berbasis citra ringan, data disimpan pada volume persisten, dilengkapi pemeriksaan kesehatan melalui perintah kesiapan basis data                                             |
| api     | Layanan ekstraksi dokumen    | Uvicorn menjalankan aplikasi FastAPI pada porta 8000, dilengkapi pemeriksaan kesehatan berkala terhadap titik akhir kesehatan, dan disetel memulai ulang otomatis kecuali dihentikan manual |
| migrate | Penerapan migrasi basis data | Dijalankan sekali pada setiap penempatan untuk menerapkan migrasi Prisma sebelum layanan web dihidupkan                                                                                     |
| web     | Aplikasi web                 | Next.js dalam mode keluaran mandiri pada porta 3000, dijalankan setelah layanan basis data dinyatakan sehat dan migrasi selesai                                                             |

 	Berdasarkan Tabel IV.90, urutan penyalaan layanan ditetapkan secara eksplisit melalui ketergantungan antarlayanan, yaitu layanan web hanya dihidupkan setelah basis data dinyatakan sehat dan migrasi selesai diterapkan. Pengaturan tersebut mencegah aplikasi berjalan di atas skema basis data yang belum dimutakhirkan. Layanan ekstraksi dan basis data dikonfigurasi memulai ulang secara otomatis, sehingga kegagalan sesaat pada tingkat proses dipulihkan tanpa campur tangan operator.

 	Pemutakhiran sistem operasional dijalankan otomatis melalui alur integrasi berkelanjutan yang terpicu pada setiap perubahan yang masuk ke cabang utama repositori. Alur tersebut menghubungi peladen melalui SSH dan menjalankan satu skrip penempatan yang menarik perubahan terbaru lalu menyalakan ulang seluruh kontainer. Kunci SSH yang dipakai dikunci pada satu perintah tetap di sisi peladen, sehingga kunci tersebut tidak dapat dipakai menjalankan perintah lain meskipun bocor. Penempatan juga dibatasi satu proses pada satu waktu, sehingga beberapa perubahan yang masuk beruntun akan mengantre dan tidak saling memotong.

#### **IV.5.1.3	Pemuatan Data Awal**

 	Sebelum sistem dapat dioperasikan, data acuan dan data induk dimuat ke basis data melalui berkas *seed*. Rincian data yang dimuat disajikan pada Tabel IV.91.

Tabel IV.91. Data Awal yang Dimuat ke Sistem


| Kelompok Data                                      |  Jumlah  | Sumber                                                                                                |
| ---------------------------------------------------- | :---------: | ------------------------------------------------------------------------------------------------------- |
| Referensi kegiatan                                 | 11 butir | Rubrik BKD unsur pendidikan pada PO BKD 2021, disaring menurut ketersediaan data penugasan di jurusan |
| Akun dosen Jurusan Teknik Komputer dan Informatika |  38 akun  | Keenam dokumen penugasan pada Tabel III.1, setelah penggabungan varian penulisan nama                 |
| Periode BKD                                        | 2 periode | Satu periode aktif dan satu periode sebelumnya sebagai data pembanding                                |

 	Berdasarkan Tabel IV.91, ketiga puluh delapan akun dosen seluruhnya diturunkan dari dokumen penugasan yang dihimpun, bukan data karangan. Tiga puluh tiga di antaranya membawa kode dosen sebagaimana tercantum pada lampiran Surat Penugasan Pengajaran, sehingga hasil ekstraksi dapat dicocokkan langsung ke akun yang bersangkutan tanpa bergantung pada kemiripan nama. Nomor Induk Dosen Nasional dan jabatan fungsional dibiarkan kosong karena tidak tersedia pada dokumen sumber, kecuali satu Nomor Induk Pegawai yang terbaca konsisten pada kedua lampiran Surat Keputusan Pembina Organisasi Kemahasiswaan. Pengosongan tersebut merupakan keputusan yang disengaja agar data yang tidak terdukung dokumen tidak dimasukkan ke sistem.

### **IV.5.2	Pemeliharaan Sistem**

 	Selama sistem beroperasi, dilaksanakan kegiatan pemeliharaan yang dikelompokkan menjadi tiga jenis sesuai klasifikasi pemeliharaan perangkat lunak, yaitu korektif, adaptif, dan perfektif. Seluruh kegiatan pemeliharaan tercatat sebagai riwayat perubahan pada repositori Git, sehingga setiap perubahan dapat ditelusuri beserta alasannya.

#### **IV.5.2.1	Pemeliharaan Korektif**

 	Pemeliharaan korektif memperbaiki kesalahan yang tidak terdeteksi pada tahap pengujian dan baru muncul pada pemakaian nyata. Tiga temuan utama diuraikan berikut ini.

 	Temuan pertama berkaitan dengan penyedia RPC publik yang menolak permintaan JSON-RPC berkelompok. Pustaka Ethers.js secara bawaan menggabungkan beberapa permintaan menjadi satu kiriman untuk menghemat lalu lintas jaringan, namun sebagian penyedia gratis menolak kiriman yang memuat lebih dari tiga permintaan. Perbaikannya adalah mematikan penggabungan otomatis pada pembuatan objek penyedia, sehingga setiap permintaan dikirimkan terpisah.

 	Temuan kedua berkaitan dengan pembacaan riwayat kejadian yang gagal pada jaringan Base Sepolia. Penelusuran dari blok nol ditolak penyedia karena melampaui batas sepuluh ribu blok per permintaan. Perbaikannya adalah memecah rentang penelusuran menjadi potongan berukuran tetap dan memulainya dari blok penempatan kontrak, sebagaimana diuraikan pada subbab IV.3.6.

 	Temuan ketiga berkaitan dengan perbedaan skala nilai token pada riwayat *on-chain*. Sejumlah transaksi awal terlanjur dikirimkan memakai nilai berskala kali seratus apa adanya tanpa dikalikan faktor desimal token, sehingga log *on-chain* memuat dua skala yang berbeda. Karena catatan pada *blockchain* tidak dapat diubah, perbaikannya tidak dapat dilakukan dengan menyunting data lama, melainkan dengan menambahkan penafsir pada sisi pembacaan yang membedakan kedua skala melalui ambang nilai tertentu. Temuan ini memperlihatkan konsekuensi nyata dari sifat *immutable* yang menjadi kekuatan sekaligus keterbatasan pendekatan *blockchain*.

#### **IV.5.2.2	Pemeliharaan Adaptif**

 	Pemeliharaan adaptif menyesuaikan sistem terhadap perubahan lingkungan di luar kendali pengembangan. Dua kegiatan utama diuraikan berikut ini.

 	Kegiatan pertama adalah penyesuaian aturan ekstraksi lampiran dokumen pembimbingan. Pendekatan awal memakai kalibrasi batas kolom tetap, namun pendekatan tersebut gagal ketika diterapkan pada lampiran Surat Keputusan Pembimbing Tugas Akhir yang lebar kolomnya berbeda dari lampiran Surat Tugas Pembimbing Praktik Kerja Lapangan. Penyesuaiannya adalah mengganti kalibrasi tetap dengan penurunan batas kolom dari posisi garis bingkai tabel, sehingga perbedaan lebar kolom antar-program studi tidak lagi menyebabkan kegagalan ekstraksi. Penyesuaian ini merupakan realisasi batasan perancangan DC-08.

 	Kegiatan kedua adalah penyesuaian data referensi kegiatan terhadap ketersediaan data penugasan nyata di jurusan. Lima butir aturan yang semula dimuat sebagai data referensi dikeluarkan karena tidak terdapat dokumen penugasannya, sebagaimana telah diuraikan pada subbab IV.1.4. Penyesuaian tersebut dijalankan pada tingkat data acuan tanpa mengubah kontrak, sehingga tidak menuntut penempatan ulang.

#### **IV.5.2.3	Pemeliharaan Perfektif**

 	Pemeliharaan perfektif menyempurnakan implementasi dan menambahkan kapabilitas baru sesuai kebutuhan yang muncul. Empat kegiatan utama diuraikan berikut ini.

 	Kegiatan pertama adalah penambahan kontrak registri dokumen beserta modul pencatatannya. Kebutuhan tersebut muncul setelah sistem dioperasikan, ketika disadari bahwa jejak *on-chain* yang tersedia hanya mencakup hasil akhir penilaian dan belum mencakup keberadaan dokumen yang menjadi dasarnya. Penambahan ini dikerjakan sebagai kontrak baru yang berdiri sendiri, sehingga kedua kontrak yang telah beroperasi tidak perlu ditempatkan ulang.

 	Kegiatan kedua adalah pemisahan halaman registri dokumen dari halaman log *blockchain*. Kedua jenis kejadian semula disajikan pada satu halaman, namun keduanya memiliki pembaca dan tujuan penelusuran yang berbeda, sehingga penyatuannya justru menyulitkan penelusuran.

 	Kegiatan ketiga adalah pembukaan akses ruang kerja dosen bagi pengguna berperan asesor. Kebutuhan tersebut muncul karena asesor pada dasarnya juga merupakan dosen yang melaporkan beban kerjanya sendiri, sehingga pembatasan awal yang memisahkan keduanya secara kaku menuntut satu orang memiliki dua akun.

 	Kegiatan keempat adalah penyeragaman komponen antarmuka, khususnya penerapan satu templat tabel yang membawa pencarian, penyaring per kolom, pengurutan, dan pagination secara seragam pada seluruh halaman. Penyeragaman tersebut sekaligus menghapus data contoh yang sebelumnya masih dirender ke layar. Rekapitulasi seluruh kegiatan pemeliharaan disajikan pada Tabel IV.92.

Tabel IV.92. Rekapitulasi Kegiatan Pemeliharaan Sistem


| No. | Jenis     | Kegiatan Pemeliharaan                                                                             | Pemicu                                                                            | Dampak terhadap Lapisan                     |
| :---: | ----------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------- |
| 1. | Korektif  | Mematikan penggabungan permintaan JSON-RPC otomatis                                               | Penyedia RPC publik menolak permintaan berkelompok                                | Modul integrasi*blockchain*                 |
| 2. | Korektif  | Memecah penelusuran*event* menjadi potongan sepuluh ribu blok dan memulainya dari blok penempatan | Penyedia RPC menolak rentang blok yang terlalu lebar                              | Modul integrasi*blockchain*                 |
| 3. | Korektif  | Menambahkan penafsir dua skala nilai token pada sisi pembacaan                                    | Transaksi awal terlanjur tercatat pada skala berbeda dan tidak dapat diubah       | Modul integrasi*blockchain* dan halaman log |
| 4. | Korektif  | Menambahkan syarat kecocokan nomor surat pada pencocokan kegiatan                                 | Judul kegiatan pembimbingan bersifat generik sehingga dua surat berbeda tergabung | Modul ekstraksi dan penerapan dokumen       |
| 5. | Adaptif   | Mengganti kalibrasi kolom tetap dengan penurunan batas dari garis bingkai tabel                   | Perbedaan lebar kolom lampiran antar-program studi                                | Layanan ekstraksi dokumen                   |
| 6. | Adaptif   | Menyesuaikan data referensi terhadap ketersediaan data penugasan di jurusan                       | Lima butir aturan tidak memiliki dokumen penugasan                                | Data acuan basis data                       |
| 7. | Perfektif | Menambahkan kontrak registri dokumen beserta modul pencatatannya                                  | Kebutuhan jejak*on-chain* atas keberadaan dokumen sumber                          | Lapisan*on-chain* dan aplikasi web          |
| 8. | Perfektif | Memisahkan halaman registri dokumen dari halaman log*blockchain*                                  | Kedua jenis kejadian memiliki tujuan penelusuran berbeda                          | Aplikasi web                                |
| 9. | Perfektif | Membuka akses ruang kerja dosen bagi pengguna berperan asesor                                     | Asesor juga melaporkan beban kerjanya sendiri                                     | Aplikasi web                                |
| 10. | Perfektif | Menyeragamkan templat tabel dan menghapus data contoh dari tampilan                               | Ketidakseragaman perilaku tabel antarhalaman                                      | Aplikasi web                                |
| 11. | Perfektif | Menampilkan surat penugasan sebagai dokumen bukti pada daftar bukti dosen                         | Dosen perlu melihat berkas sumber kegiatannya                                     | Aplikasi web                                |
| 12. | Perfektif | Mengemas seluruh lapisan sebagai kontainer dengan satu berkas komposisi                           | Kebutuhan penyiapan lingkungan yang dapat diulang                                 | Seluruh lapisan                             |

 	Berdasarkan Tabel IV.92, dari dua belas kegiatan pemeliharaan yang tercatat, empat bersifat korektif, dua bersifat adaptif, dan enam bersifat perfektif. Sebaran tersebut memperlihatkan bahwa mayoritas pemeliharaan bukan berupa perbaikan cacat melainkan penyempurnaan yang muncul dari pemakaian nyata. Perlu digarisbawahi pula bahwa tiga dari empat pemeliharaan korektif berkaitan dengan perilaku penyedia RPC dan sifat *immutable* catatan *on-chain*, yaitu titik-titik yang berada di luar kendali pengembangan. Temuan tersebut memperkuat keputusan rancangan memusatkan seluruh akses *on-chain* pada satu modul, karena ketiga perbaikan tersebut cukup dikerjakan pada satu berkas tanpa menyentuh modul lain.

 	Dengan terlaksananya tahap operasi dan pemeliharaan, seluruh lima tahapan pengembangan yang direncanakan pada subbab III.5 telah dituntaskan. Analisis dampak hasil pengembangan sistem beserta keberterimaan penggunanya diuraikan pada Bab V, sedangkan rencana keberlanjutan dan komersialisasi produk dibahas pada Bab VI.
