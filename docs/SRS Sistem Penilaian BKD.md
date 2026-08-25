**LEDGERDIK**

**Sistem Penilaian Beban Kinerja Dosen Bidang Pendidikan Berbasis *Smart Contract***

**Software Requirements Specification**

**Version 1.0**

**REVISION HISTORY**

| Date | Version | Description | Author |
| :---: | :---: | ----- | ----- |
| 07/08/2026 | 1.0 | Penyusunan awal dokumen. Dokumen menggunakan pendekatan analisis dan perancangan terstruktur (*Structured Analysis and Structured Design*), sehingga pemodelan kebutuhan disajikan melalui Diagram Konteks, *Data Flow Diagram* berjenjang, dan Spesifikasi Proses (PSPEC), bukan melalui *Use Case Diagram* maupun *Fully Dressed Use Case*. Pemilihan pendekatan ini didasarkan pada karakteristik logika inti sistem yang berupa transformasi parameter menjadi nilai kredit melalui aturan prosedural dan deterministik pada *smart contract*, sebagaimana dijustifikasi pada Bab IV.1.3.2 Laporan Tugas Akhir. | Farrel Rahandika, Rohiid Naufal Juliardi |

**TABLE OF CONTENTS**

*Catatan: nomor halaman dibangkitkan ulang oleh pengolah kata pada saat dokumen dikonversi.*

**[Section 1 \- Introduction](#section-1---introduction)**
[I.1	Purpose](#purpose)
[I.2	Scope](#scope)
[I.3	Definitions, Acronyms, and Abbreviations](#definitions-acronyms-and-abbreviations)
[I.4	References](#references)
[I.5	Overview](#overview)
**[Section 2 \- Overall Description](#section-2---overall-description)**
[II.1	Product Perspective](#product-perspective)
[II.1.1	System Interfaces](#system-interfaces)
[II.1.2	User Interfaces](#user-interfaces)
[II.1.3	Hardware Interfaces](#hardware-interfaces)
[II.1.4	Software Interfaces](#software-interfaces)
[II.1.5	Communications Interfaces](#communications-interfaces)
[II.1.6	Memory Constraints](#memory-constraints)
[II.1.7	Operations](#operations)
[II.2	Product Functions](#product-functions)
[II.3	User Characteristics](#user-characteristics)
[II.4	Constraints](#constraints)
[II.5	Assumptions and Dependencies](#assumptions-and-dependencies)
[II.5.1	Assumptions](#assumptions)
[II.5.2	Dependencies](#dependencies)
**[Section 3 \- Specific Requirements](#section-3---specific-requirements)**
[III.1	External Interface Requirements](#external-interface-requirements)
[III.1.1	User Interfaces](#user-interfaces-1)
[III.1.2	Hardware Interfaces](#hardware-interfaces-1)
[III.1.3	Software Interfaces](#software-interfaces-1)
[III.1.4	Communications Interfaces](#communications-interfaces-1)
[III.2	System Features](#system-features)
[III.2.1	Autentikasi dan Otorisasi (AUT)](#autentikasi-dan-otorisasi-aut)
[III.2.2	Manajemen Pengguna dan Wallet (USR)](#manajemen-pengguna-dan-wallet-usr)
[III.2.3	Manajemen Periode dan Fase BKD (PRD)](#manajemen-periode-dan-fase-bkd-prd)
[III.2.4	Penugasan Asesor (ASR)](#penugasan-asesor-asr)
[III.2.5	Referensi Kegiatan BKD (REF)](#referensi-kegiatan-bkd-ref)
[III.2.6	Ekstraksi dan Penerapan Dokumen Penugasan (EKS)](#ekstraksi-dan-penerapan-dokumen-penugasan-eks)
[III.2.7	Pengelolaan Kegiatan dan Dokumen BKD (KEG)](#pengelolaan-kegiatan-dan-dokumen-bkd-keg)
[III.2.8	Perhitungan Kredit Kegiatan (HIT)](#perhitungan-kredit-kegiatan-hit)
[III.2.9	Penilaian dan Pengesahan Asesor (NIL)](#penilaian-dan-pengesahan-asesor-nil)
[III.2.10	Simpulan BKD dan Penerbitan Token (TOK)](#simpulan-bkd-dan-penerbitan-token-tok)
[III.2.11	Koreksi Token dan Pelaporan (LAP)](#pelaporan-dan-penelusuran-lap)
[III.2.12	Verifikasi Keaslian Dokumen Bukti (VER)](#verifikasi-keaslian-dokumen-bukti-ver)
[III.3	Performance Requirements](#performance-requirements)
[III.4	Logical Database Requirements](#logical-database-requirements)
[III.5	Design Constraints](#design-constraints)
[III.6	Software System Attributes](#software-system-attributes)
[III.6.1	Functional Suitability](#functional-suitability)
[III.6.2	Reliability](#reliability)
[III.6.3	Availability](#availability)
[III.6.4	Security](#security)
[III.6.5	Maintainability](#maintainability)
[III.6.6	Usability](#usability)
[III.6.7	Portability](#portability)
[III.7	Business Rules](#business-rules)
[III.8	Other Requirements](#other-requirements)
**[Appendices](#appendices)**
[Appendix A: Spesifikasi Proses (PSPEC)](#appendix-a-spesifikasi-proses-pspec)
[Appendix B: Matriks Keterlacakan](#appendix-b-matriks-keterlacakan)

# **Section 1 \- Introduction** {#section-1---introduction}

1. ## **Purpose** {#purpose}

Dokumen *Software Requirements Specification* (SRS) ini bertujuan mendefinisikan secara lengkap dan tidak ambigu seluruh persyaratan fungsional dan nonfungsional dari Sistem Penilaian Beban Kinerja Dosen (BKD) Bidang Pendidikan Berbasis *Smart Contract* yang diberi nama produk LedgerDik. Dokumen ini menjadi acuan formal yang menjembatani pemahaman antara tim pengembang dan pemangku kepentingan mengenai kapabilitas yang harus disediakan sistem.

Audiens yang dituju mencakup tim pengembang sebagai pelaksana perancangan dan implementasi, dosen pembimbing sebagai pihak yang memvalidasi kelayakan rekayasa, penguji yang menggunakan dokumen ini sebagai dasar verifikasi kesesuaian produk akhir, serta pengelola BKD di lingkungan jurusan sebagai calon pengguna yang perlu memastikan bahwa aturan penilaian yang dikodekan sesuai dengan ketentuan resmi yang berlaku.

Dokumen ini merupakan lampiran dari Laporan Tugas Akhir dengan judul “Pengembangan Sistem Penilaian Beban Kinerja Dosen Bidang Pendidikan Berbasis Smart Contract untuk Otomatisasi Perhitungan Kredit Kegiatan”, dan seluruh pengidentifikasi persyaratan pada dokumen ini konsisten dengan pengidentifikasi yang digunakan pada Bab IV laporan tersebut.

2. ## **Scope** {#scope}

Produk yang dispesifikasikan dalam dokumen ini adalah LedgerDik, sebuah sistem berbasis web yang terintegrasi dengan *smart contract* pada jaringan *blockchain* berbasis *Ethereum Virtual Machine* (EVM) Layer-2. Sistem berfungsi mengotomatisasi perhitungan kredit kegiatan BKD unsur pendidikan sesuai Pedoman Operasional Beban Kerja Dosen (PO BKD) tahun 2021, serta mencatat hasil penilaian yang telah disahkan asesor pada *blockchain* sebagai token kredit yang melekat pada dosen.

Sistem menyediakan empat kapabilitas utama yang saling melengkapi. Pertama, ekstraksi parameter kegiatan langsung dari berkas Surat Keputusan (SK) dan Surat Tugas (ST), sehingga parameter yang diproses berasal dari dokumen sumber dan bukan dari pengetikan ulang. Kedua, eksekusi aturan penilaian PO BKD 2021 melalui *smart contract* sebagai mesin aturan deterministik, sehingga hasil perhitungan konsisten lintas asesor dan lintas waktu. Ketiga, penerbitan kredit yang telah disahkan dua asesor sebagai token ERC-20 bersifat *non-transferable* beserta pencatatan *hash* simpulan penilaian, sehingga riwayat penerbitan dan koreksi kredit dapat ditelusuri melalui *transaction hash*. Keempat, pemeriksaan keaslian dokumen bukti pada kegiatan pembimbingan melalui pembacaan nama dan peran pada dokumen, sehingga bukti yang tidak memuat nama pengunggah atau menuliskan peran yang berbeda dari yang diklaim tersaji sebagai temuan bagi asesor.

Manfaat utama yang ditargetkan adalah hilangnya variasi hasil perhitungan yang selama ini timbul dari kalkulasi manual antar-asesor, berkurangnya ketergantungan pada pembacaan manual dokumen penugasan, serta tersedianya mekanisme penelusuran hasil penilaian yang dapat dilakukan secara mandiri tanpa bergantung pada administrator basis data institusi.

Hal-hal berikut secara eksplisit berada di luar lingkup (*out of scope*) sistem ini:

1. Unsur BKD selain unsur pendidikan, yaitu unsur penelitian, pengabdian kepada masyarakat, dan penunjang. Struktur data menyediakan tempat bagi ketiga unsur tersebut, namun aturan perhitungannya tidak diotomatisasi.
2. Butir aturan pada unsur pendidikan yang nilainya merupakan batas maksimum dan penetapannya bergantung pada penilaian kualitatif asesor terhadap mutu luaran. Butir tersebut tetap dapat dilaporkan, tetapi nilainya ditetapkan asesor secara manual.
3. Integrasi langsung dengan sistem akademik resmi perguruan tinggi maupun sistem BKD nasional. Sinkronisasi dengan sumber data eksternal disediakan sebagai simulasi prototipe, bukan sebagai integrasi produksi.
4. *Deployment smart contract* ke jaringan produksi. Penempatan kontrak dibatasi pada jaringan uji Base Sepolia.
5. Integrasi identitas formal seperti *single sign-on* institusi.
6. Verifikasi keabsahan formal dokumen, yaitu pemeriksaan tanda tangan, stempel, dan nomor surat terhadap unit penerbitnya. Pemeriksaan yang disediakan sistem terbatas pada kesesuaian isi dokumen bukti terhadap identitas dan peran yang diklaim, bukan pada keabsahan penerbitan dokumen tersebut.
7. Pengelolaan dompet kripto mandiri oleh dosen. Alamat *wallet* diturunkan dan dikendalikan peladen sebagai *wallet* kustodian.
8. Aspek infrastruktur jaringan *blockchain* seperti mekanisme konsensus, pengelolaan *node*, dan optimasi performa jaringan.

3. ## **Definitions, Acronyms, and Abbreviations** {#definitions-acronyms-and-abbreviations}

Subbab ini memuat definisi istilah, kepanjangan akronim, dan pengidentifikasi yang diperlukan untuk menafsirkan dokumen ini secara tepat. Definisi istilah domain dan teknis disajikan pada Tabel I.1, daftar akronim pada Tabel I.2, dan daftar kode pengidentifikasi pada Tabel I.3.

Tabel I.1. Definisi Istilah

| Istilah | Definisi |
| ----- | ----- |
| Aturan (*rule*) | Satu butir ketentuan perhitungan kredit pada rubrik PO BKD 2021 yang memiliki kode pengidentifikasi, parameter masukan, dan formula tersendiri. |
| *Blockchain* | Buku besar digital terdistribusi yang menyimpan transaksi dalam blok yang saling terhubung menggunakan fungsi *hash* kriptografi, sehingga catatan yang telah tersimpan tidak dapat diubah tanpa terdeteksi. |
| Dokumen BKD | Satu dokumen penilaian milik satu dosen pada satu periode untuk satu jenis, yaitu rencana atau laporan. Pada basis data direpresentasikan sebagai entitas lkd. |
| Dokumen bukti | Berkas atau tautan yang dilampirkan dosen pada suatu kegiatan sebagai bukti pelaksanaan, misalnya lembar pengesahan, berita acara, atau surat tugas. |
| Fase | Tahap yang sedang berjalan pada suatu periode BKD, yaitu pengisian, penilaian, perbaikan, atau selesai, yang menentukan aksi apa saja yang boleh dijalankan setiap peran. |
| Kegiatan | Satu catatan aktivitas pendidikan yang dilaporkan dosen, memuat butir aturan yang berlaku, parameter perhitungan, dokumen bukti, dan nilai kredit hasil perhitungan. |
| Kredit kegiatan | Nilai beban kerja suatu kegiatan yang dinyatakan dalam Satuan Kredit Semester (SKS) sesuai rubrik PO BKD. |
| *Non-transferable* | Sifat token yang tidak dapat dipindahkan antar-alamat, sehingga token tetap melekat pada alamat penerimanya. |
| Parser artefak universal | Titik akhir layanan ekstraksi yang membaca dokumen dosen berbentuk bebas menggunakan model bahasa visual dan mengembalikan daftar orang beserta perannya, jenis dokumen, dan penanda isian tulisan tangan. |
| Parameter kegiatan | Kumpulan nilai masukan yang dibutuhkan suatu butir aturan untuk menghitung kredit, misalnya jumlah SKS mata kuliah dan jumlah pertemuan realisasi. |
| Pemeriksaan keaslian dokumen bukti | Proses membandingkan nama dan peran yang terbaca pada dokumen bukti terhadap nama pemilik akun pengunggah dan peran yang diklaim kegiatan, dengan lima kemungkinan status, yaitu cocok, peran tidak sesuai, tidak cocok, tanpa nama, dan gagal. |
| Penerbitan token (*mint*) | Operasi pembuatan token baru dan penambahannya ke saldo suatu alamat. |
| Penghapusan token (*burn*) | Operasi pengurangan token dari saldo suatu alamat, digunakan sebagai mekanisme koreksi. |
| Penugasan asesor | Penetapan seorang asesor pada suatu dokumen BKD dengan urutan tertentu, yaitu asesor pertama atau asesor kedua. |
| Periode BKD | Rentang waktu penilaian, umumnya satu semester akademik, yang memuat rentang tanggal untuk setiap fase. |
| Persetujuan manual asesor | Penanda yang ditambahkan asesor pada hasil pemeriksaan keaslian dokumen bukti untuk mengesampingkan penanda ketidaksesuaian, tanpa menghapus hasil pembacaan parser. |
| Simpulan BKD | Rekapitulasi akhir suatu dokumen BKD berupa total kredit per unsur beserta status memenuhi atau tidak memenuhi, yang dibentuk setelah kedua asesor mengesahkan penilaiannya. |
| Skala kali seratus | Representasi nilai kredit sebagai bilangan bulat yang telah dikalikan seratus, dipakai karena bahasa Solidity tidak mendukung bilangan desimal. Nilai 1,00 SKS dinyatakan sebagai 100. |
| *Smart contract* | Program yang disimpan dan dieksekusi pada *blockchain*, yang menjalankan aturan tertentu secara otomatis dan deterministik tanpa memerlukan pihak ketiga. |
| Temuan | Kegiatan yang dokumen buktinya berstatus tidak cocok atau peran tidak sesuai dan belum disetujui manual, yang ditandai bagi asesor pada halaman penilaian. |
| Token kredit SKS | Representasi digital kredit BKD yang telah disahkan, diterbitkan sebagai token ERC-20 pada alamat *wallet* dosen. |
| *Transaction hash* | Pengenal unik suatu transaksi pada *blockchain* yang dapat digunakan untuk menelusuri transaksi tersebut melalui penjelajah blok publik. |
| *Wallet* kustodian | Alamat *blockchain* milik dosen yang kunci privatnya diturunkan dan disimpan peladen sistem, bukan oleh dosen yang bersangkutan. |

Tabel I.2. Daftar Akronim

| Akronim | Kepanjangan |
| ----- | ----- |
| ABI | *Application Binary Interface* |
| ACID | *Atomicity, Consistency, Isolation, Durability* |
| API | *Application Programming Interface* |
| ASGI | *Asynchronous Server Gateway Interface* |
| BKD | Beban Kinerja Dosen |
| DFD | *Data Flow Diagram* |
| ERC-20 | *Ethereum Request for Comments* 20 |
| ERD | *Entity Relationship Diagram* |
| EVM | *Ethereum Virtual Machine* |
| FR | *Functional Requirement* |
| HD *wallet* | *Hierarchical Deterministic wallet* |
| HTTPS | *Hypertext Transfer Protocol Secure* |
| JSON | *JavaScript Object Notation* |
| JWT | *JSON Web Token* |
| LKD | Laporan Kinerja Dosen |
| MIME | *Multipurpose Internet Mail Extensions* |
| NFR | *Non-Functional Requirement* |
| NIRA | Nomor Induk Registrasi Asesor |
| ORM | *Object-Relational Mapping* |
| PDF | *Portable Document Format* |
| PO BKD | Pedoman Operasional Beban Kerja Dosen |
| PSPEC | *Process Specification* |
| RBAC | *Role-Based Access Control* |
| RBKD | Rencana Beban Kinerja Dosen |
| RPC | *Remote Procedure Call* |
| SK | Surat Keputusan |
| SKS | Satuan Kredit Semester |
| SRS | *Software Requirements Specification* |
| ST | Surat Tugas |
| TLS | *Transport Layer Security* |
| UUID | *Universally Unique Identifier* |
| VLM | *Vision Language Model* |

Tabel I.3. Daftar Kode Pengidentifikasi

| Kode | Makna | Letak |
| ----- | ----- | ----- |
| CON-xx | *Constraint* dari sisi klien dan lingkungan eksternal | Subbab II.4 |
| P-x | Proses utama pada *Data Flow Diagram* level 1 | Subbab II.2 |
| D-x | Penyimpanan data pada *Data Flow Diagram* | Subbab III.4 |
| UI-xx | Persyaratan antarmuka pengguna | Subbab III.1.1 |
| HW-xx | Persyaratan antarmuka perangkat keras | Subbab III.1.2 |
| SW-xx | Persyaratan antarmuka perangkat lunak | Subbab III.1.3 |
| COM-xx | Persyaratan antarmuka komunikasi | Subbab III.1.4 |
| FR-xx | Persyaratan fungsional | Subbab III.2 |
| PR-xx | Persyaratan performa | Subbab III.3 |
| DC-xx | *Design constraint* yang ditetapkan tim pengembang | Subbab III.5 |
| SA-xxx-xx | Kriteria atribut kualitas perangkat lunak | Subbab III.6 |
| NFR-xx | Persyaratan nonfungsional sebagaimana dirujuk Laporan Tugas Akhir | Subbab III.6 |
| BR-xx | Aturan bisnis | Subbab III.7 |
| OR-xx | Persyaratan lain | Subbab III.8 |
| PSPEC-xx | Spesifikasi proses | Appendix A |

4. ## **References** {#references}

1. IEEE Std 830-1998, *IEEE Recommended Practice for Software Requirements Specifications*.
2. ISO/IEC 25010:2011, *Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models*.
3. Keputusan Direktur Jenderal Pendidikan Tinggi, *Pedoman Operasional Beban Kerja Dosen* (PO BKD), 2021.
4. Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.
5. Pressman, R. S., *Software Engineering: A Practitioner's Approach*, 5th ed., McGraw-Hill, 2001 (acuan pendekatan analisis dan perancangan terstruktur).
6. Sommerville, I., *Software Engineering*, 9th ed., Addison-Wesley, 2011 (acuan model proses *Waterfall*).
7. Chen, P. P., “The Entity-Relationship Model — Toward a Unified View of Data”, *ACM Transactions on Database Systems*, 1(1), 1976.
8. Vogelsteller, F. dan Buterin, V., *EIP-20: Token Standard*, Ethereum Improvement Proposals, 2015.
9. Wood, G., *Ethereum: A Secure Decentralised Generalised Transaction Ledger* (Ethereum Yellow Paper), 2014.
10. OpenZeppelin, *OpenZeppelin Contracts 5.x Documentation*, tersedia di https://docs.openzeppelin.com/contracts/5.x
11. Base, *Base Documentation*, tersedia di https://docs.base.org
12. Dokumentasi resmi Solidity, Hardhat, Ethers.js, Next.js, NextAuth.js, Prisma ORM, PostgreSQL, FastAPI, dan pdfplumber.
13. Laporan Tugas Akhir “Pengembangan Sistem Penilaian Beban Kinerja Dosen Bidang Pendidikan Berbasis Smart Contract untuk Otomatisasi Perhitungan Kredit Kegiatan”, khususnya Bab IV sebagai sumber hasil analisis dan perancangan.

5. ## **Overview** {#overview}

Dokumen ini disusun mengikuti kerangka IEEE Std 830-1998.

| Section 1 | Introduction |
| :---- | :---- |
|  | Memuat pendahuluan yang menjelaskan tujuan, ruang lingkup, terminologi, dan rujukan dokumen. |
| **Section 2** | Overall Description |
|  | Memberikan gambaran umum yang menjadi latar belakang persyaratan, mencakup perspektif produk beserta seluruh antarmuka eksternalnya, fungsi produk, karakteristik pengguna, batasan, serta asumsi dan ketergantungan. |
| **Section 3** | Specific Requirements |
|  | Memuat persyaratan spesifik yang diorganisasikan berdasarkan fitur sistem, masing-masing disertai persyaratan fungsional yang dapat diverifikasi, dilengkapi persyaratan performa, kebutuhan basis data logis, batasan perancangan, atribut kualitas perangkat lunak, aturan bisnis, dan persyaratan lain. |
| **Appendices** | Informasi Pendukung |
|  | Memuat spesifikasi proses sebagai pelengkap *Data Flow Diagram*, serta matriks keterlacakan antara persyaratan fungsional, proses, modul, dan rencana verifikasi. |

# **Section 2 \- Overall Description** {#section-2---overall-description}

1. ## **Product Perspective** {#product-perspective}

LedgerDik merupakan sistem yang terdiri atas tiga bagian yang saling terhubung namun dijalankan pada lingkungan berbeda. Bagian pertama adalah aplikasi web yang menyediakan antarmuka bagi ketiga peran pengguna sekaligus bertindak sebagai lapisan orkestrasi di sisi peladen. Bagian kedua adalah layanan ekstraksi dokumen yang berjalan sebagai proses mandiri dan mengubah berkas SK dan ST menjadi data terstruktur. Bagian ketiga adalah dua *smart contract* yang berjalan pada jaringan *blockchain* publik dan menjalankan aturan perhitungan serta mengelola siklus hidup token kredit.

Sistem ini bukan merupakan pengganti sistem BKD nasional. Sistem menempati posisi sebagai perangkat pendukung penilaian pada tingkat jurusan yang mengambil alih dua pekerjaan yang selama ini dilakukan manual, yaitu pemindahan parameter dari dokumen penugasan dan perhitungan kredit kegiatan, sekaligus menambahkan lapisan pencatatan hasil yang dapat diaudit publik.

Dari sudut pandang eksternal, Gambar I.1 menyajikan diagram konteks yang memetakan posisi sistem di lingkungan operasinya. Diagram ini menunjukkan batas sistem beserta aliran informasi dengan entitas eksternal, yaitu dosen, asesor, dan administrator sebagai aktor manusia, kedua *smart contract* sebagai mitra pertukaran data pada jaringan *blockchain*, serta layanan model bahasa visual sebagai penyedia penafsiran dokumen pindaian.

**\[LENGKAPI GAMBAR: diagram konteks — proses tunggal "Sistem Penilaian BKD (LedgerDik)" dengan enam entitas eksternal beserta aliran data masuk dan keluar sesuai Tabel II.1. Gambar identik dengan Gambar IV.6 pada Laporan Tugas Akhir.\]**

Gambar I.1. Diagram Konteks Sistem Penilaian BKD

Batas sistem ditetapkan mencakup aplikasi web beserta basis data operasional dan layanan ekstraksi dokumen. Kedua *smart contract* diperlakukan sebagai entitas eksternal karena berjalan pada jaringan *blockchain* publik yang berada di luar kendali institusi dan tetap ada meskipun aplikasi dihentikan. Konsekuensinya, basis data tidak dimodelkan sebagai entitas eksternal melainkan sebagai penyimpanan data di dalam sistem. Tabel II.1 merangkum entitas eksternal beserta jenis antarmuka dan arah komunikasinya.

Tabel II.1. Entitas Eksternal dan Jenis Antarmuka

| Entitas Eksternal | Jenis Antarmuka | Arah Komunikasi |
| ----- | ----- | ----- |
| Dosen | *User Interface* (peramban web) | Dua arah: dosen mengirimkan kredensial, data kegiatan, parameter, dokumen bukti, penarikan kegiatan, dan status capaian ke sistem → sistem mengembalikan daftar kegiatan beserta nilai kredit, status penilaian, catatan asesor, simpulan, dan rekapitulasi. |
| Asesor | *User Interface* (peramban web) | Dua arah: asesor mengirimkan kredensial, nilai kredit yang disetujui, catatan penilaian, dan pengesahan → sistem mengembalikan daftar dokumen BKD yang ditugaskan, rincian kegiatan, dokumen bukti, dan hasil perhitungan. |
| Administrator | *User Interface* (peramban web) | Dua arah: administrator mengirimkan kredensial, data pengguna, penetapan *wallet*, data periode dan fase, penugasan asesor, berkas SK dan ST, koreksi hasil ekstraksi, dan instruksi koreksi token → sistem mengembalikan daftar pengguna, status penerapan dokumen, riwayat transaksi, log *blockchain*, dan rekapitulasi. |
| *Smart Contract* Kalkulator BKD | *Software Interface* (JSON-RPC melalui Ethers.js) | Dua arah: sistem mengirimkan nama fungsi perhitungan beserta parameter kegiatan → kontrak mengembalikan nilai kredit pada skala kali seratus, atau menolak disertai alasan. |
| *Smart Contract* Token SKS | *Software Interface* (JSON-RPC melalui Ethers.js) | Dua arah: sistem mengirimkan alamat *wallet* tujuan, jumlah token, referensi berupa *hash* simpulan, dan instruksi penghapusan → kontrak mengembalikan *transaction hash*, saldo per alamat, dan riwayat *event*. |
| Layanan Model Bahasa Visual | *Software Interface* (HTTPS dengan kunci API) | Dua arah: sistem mengirimkan citra halaman dokumen pindaian beserta instruksi skema keluaran → layanan mengembalikan hasil penafsiran dalam format JSON terstruktur. |

1. ### **System Interfaces** {#system-interfaces}

Sistem berinteraksi dengan jaringan *blockchain* berbasis EVM melalui titik akhir *Remote Procedure Call* (RPC). Interaksi ini terbagi menjadi dua sifat yang berbeda. Pemanggilan fungsi perhitungan pada kontrak kalkulator bersifat baca dan tidak menghasilkan transaksi maupun biaya *gas*, karena seluruh fungsi kontrak tersebut dideklarasikan sebagai fungsi murni tanpa penyimpanan status. Sebaliknya, pemanggilan fungsi penerbitan dan penghapusan token pada kontrak token merupakan transaksi yang mengubah keadaan *blockchain*, memerlukan penandatanganan oleh alamat yang memegang peran yang sesuai, dan menimbulkan biaya *gas*.

Sistem juga berinteraksi dengan layanan ekstraksi dokumen melalui protokol HTTP pada jaringan internal. Antarmuka ini menjadi dasar bagi fungsionalitas ekstraksi parameter dari berkas SK dan ST, dan dirancang sedemikian rupa sehingga kegagalan pada layanan ekstraksi tidak menghentikan operasi sistem secara keseluruhan.

2. ### **User Interfaces** {#user-interfaces}

Antarmuka pengguna disajikan dalam bentuk aplikasi web yang diakses melalui peramban, dengan navigasi berbasis halaman yang terbagi menjadi tiga ruang kerja terpisah sesuai peran pengguna. Seluruh halaman pasca-autentikasi menggunakan satu kerangka tampilan yang sama, terdiri atas bilah sisi berisi menu sesuai peran, bilah atas berisi identitas institusi, dan area konten.

Antarmuka dirancang untuk menyembunyikan kompleksitas *blockchain* dari pengguna non-teknis. Dosen dan asesor tidak pernah dihadapkan pada konsep alamat *wallet*, biaya *gas*, maupun penandatanganan transaksi, karena seluruh interaksi *on-chain* dijalankan lapisan orkestrasi di sisi peladen. Antarmuka juga wajib menampilkan dialog konfirmasi pada aksi yang tidak dapat dibatalkan, yaitu pengesahan penilaian oleh asesor dan penghapusan token oleh administrator. Ketentuan rinci yang diturunkan dari prinsip ini dispesifikasikan pada subbab III.1.1.

3. ### **Hardware Interfaces** {#hardware-interfaces}

Sistem tidak memiliki antarmuka langsung dengan perangkat keras khusus. Seluruh fungsi beroperasi menggunakan kapabilitas standar peladen dan perangkat klien. Pada sisi klien, sistem hanya memerlukan perangkat yang mampu menjalankan peramban modern. Pada sisi peladen, sistem memerlukan penyimpanan berkas untuk menampung dokumen SK, ST, dan dokumen bukti kegiatan yang diunggah pengguna.

4. ### **Software Interfaces** {#software-interfaces}

Sistem berinteraksi dengan sejumlah perangkat lunak eksternal sebagaimana dirangkum pada Tabel II.2.

Tabel II.2. Perangkat Lunak Eksternal yang Berinteraksi dengan Sistem

| Perangkat Lunak | Peran | Sumber |
| ----- | ----- | ----- |
| Jaringan Base Sepolia beserta penyedia RPC | Lingkungan eksekusi kedua *smart contract* dan titik akses pembacaan maupun penulisan *on-chain* | Base (OP Stack) |
| Kontrak ERC20 dan AccessControl OpenZeppelin | Basis implementasi standar token dan kontrol akses berbasis peran | OpenZeppelin Contracts 5.x |
| PostgreSQL | Sistem manajemen basis data relasional untuk seluruh data operasional | PostgreSQL Global Development Group |
| Prisma ORM | Pemetaan objek-relasional dan pengelolaan migrasi skema | Prisma |
| Layanan model bahasa visual melalui API | Penafsiran citra halaman dokumen hasil pemindaian | Penyedia API pihak ketiga |
| pdfplumber | Ekstraksi teks dan tabel deterministik dari berkas PDF digital | pdfplumber |
| Penjelajah blok (Basescan/Etherscan) | Verifikasi kode sumber kontrak dan penelusuran transaksi oleh pihak eksternal | Etherscan |

5. ### **Communications Interfaces** {#communications-interfaces}

Komunikasi antara peramban pengguna dan peladen aplikasi berlangsung melalui HTTPS. Komunikasi antara lapisan orkestrasi dan jaringan *blockchain* berlangsung melalui JSON-RPC di atas HTTPS menuju titik akhir RPC jaringan Base Sepolia. Komunikasi antara lapisan orkestrasi dan layanan ekstraksi dokumen berlangsung melalui HTTP dengan autentikasi berbasis kunci API pada *header* permintaan.

Karena penyedia RPC publik umumnya membatasi rentang blok yang boleh ditelusuri dalam satu permintaan, pembacaan riwayat *event* dilakukan secara berjenjang dengan memecah rentang penelusuran menjadi potongan berukuran tetap.

6. ### **Memory Constraints** {#memory-constraints}

Sistem tidak menetapkan batasan memori khusus pada sisi klien karena seluruh pemrosesan berat dijalankan di sisi peladen. Pada sisi peladen, konsumsi memori terbesar berasal dari proses ekstraksi dokumen, khususnya rasterisasi halaman PDF pindaian menjadi citra sebelum dikirimkan ke layanan model bahasa visual. Proses ini dijalankan pada kumpulan *thread* terpisah agar tidak menahan penanganan permintaan lain.

Keluaran mentah parser disimpan secara utuh pada basis data sebagai bukti audit. Karena berkas dokumen penugasan dapat memuat ratusan baris, penyimpanan tersebut menggunakan tipe data dokumen semi-terstruktur agar tetap dapat dikueri tanpa membentuk tabel dengan kolom yang sebagian besar kosong.

7. ### **Operations** {#operations}

Sistem beroperasi dalam mode multi-pengguna dengan pemisahan ruang kerja berdasarkan peran. Aksi yang boleh dijalankan setiap peran dibatasi oleh fase yang sedang berjalan pada periode aktif, sehingga dosen tidak dapat menyunting kegiatan pada fase penilaian dan asesor tidak dapat menilai sebelum dosen menyimpan dokumennya secara permanen.

Sistem menyimpan catatan riwayat untuk seluruh peristiwa krusial, yaitu keluaran mentah parser beserta koreksi administrator, hasil penilaian per asesor, simpulan beserta *hash*-nya, dan riwayat transaksi *on-chain* beserta statusnya. Riwayat transaksi dicatat baik ketika transaksi berhasil maupun gagal, sehingga gangguan jaringan tidak menghilangkan jejak upaya penerbitan.

Operasi pencadangan dan pemulihan data dilakukan pada tingkat basis data. Data yang telah tercatat *on-chain* tidak dapat dan tidak perlu dicadangkan, karena bersifat permanen pada jaringan *blockchain*.

2. ## **Product Functions** {#product-functions}

Secara garis besar, LedgerDik menyediakan kelompok fungsi utama sebagai berikut.

1. Autentikasi pengguna dan otorisasi akses berbasis peran.
2. Pengelolaan pengguna beserta penetapan alamat *wallet* kustodian bagi dosen.
3. Pengelolaan periode BKD beserta penentuan fase yang sedang berjalan.
4. Penugasan dua asesor pada setiap dokumen BKD.
5. Pengelolaan data referensi kegiatan beserta pemetaannya ke fungsi perhitungan pada *smart contract*.
6. Ekstraksi dokumen SK dan ST beserta pemetaan, koreksi, dan penerapannya menjadi kegiatan dosen.
7. Pengelolaan kegiatan, dokumen bukti, dan dokumen BKD oleh dosen.
8. Perhitungan kredit kegiatan melalui pemanggilan *smart contract* kalkulator.
9. Penilaian dan pengesahan oleh dua asesor, pembentukan simpulan, serta penerbitan token kredit.
10. Koreksi token, penelusuran log *blockchain*, dan penyajian rekapitulasi BKD.
11. Verifikasi keaslian dokumen bukti melalui pembacaan nama dan peran pada dokumen, beserta peninjauan dan persetujuan manualnya oleh asesor.

Kesebelas kelompok fungsi tersebut dimodelkan sebagai sebelas proses utama pada *Data Flow Diagram* level 1 sebagaimana dirangkum pada Tabel II.3. Pemodelan berjenjang ini menggantikan peran *Use Case Diagram* pada dokumen yang menggunakan pendekatan berorientasi objek. Rincian logika setiap proses disajikan pada Appendix A.

**\[LENGKAPI GAMBAR: DFD level 1 dengan sebelas proses P1–P11, enam entitas eksternal, dan sebelas penyimpanan data. Gambar identik dengan Gambar IV.7 pada Laporan Tugas Akhir.\]**

Gambar I.2. *Data Flow Diagram* Level 1

Tabel II.3. Ringkasan Proses Sistem

| Kode Proses | Nama Proses | Aktor Terkait | FR Terkait |
| :---: | ----- | ----- | ----- |
| P1 | Autentikasi dan Otorisasi | Dosen, Asesor, Administrator | FR-01, FR-02, FR-32 |
| P2 | Pengelolaan Pengguna dan *Wallet* | Administrator | FR-03, FR-04 |
| P3 | Pengelolaan Periode dan Fase | Administrator | FR-05, FR-06 |
| P4 | Penugasan Asesor | Administrator | FR-07 |
| P5 | Pengelolaan Referensi Kegiatan | Administrator | FR-08 |
| P6 | Ekstraksi dan Penerapan Dokumen | Administrator, Layanan Model Bahasa Visual | FR-09, FR-10, FR-11, FR-12, FR-31 |
| P7 | Pengelolaan Kegiatan dan Dokumen BKD | Dosen | FR-13, FR-14, FR-15, FR-16, FR-17 |
| P8 | Perhitungan Kredit Kegiatan | *Smart Contract* Kalkulator BKD | FR-18, FR-19 |
| P9 | Penilaian, Simpulan, dan Penerbitan Token | Asesor, *Smart Contract* Token SKS | FR-20, FR-21, FR-22, FR-23, FR-24 |
| P10 | Koreksi Token dan Pelaporan | Administrator, *Smart Contract* Token SKS | FR-25, FR-26, FR-27 |
| P11 | Verifikasi Keaslian Dokumen Bukti | Dosen, Asesor, Layanan Model Bahasa Visual | FR-28, FR-29, FR-30 |

3. ## **User Characteristics** {#user-characteristics}

Sistem melayani tiga kelompok pengguna dengan karakteristik yang berbeda.

1. **Dosen** merupakan pihak yang dinilai. Kelompok ini merupakan tenaga pendidik perguruan tinggi yang terbiasa mengoperasikan aplikasi web administratif akademik, namun tidak dapat diasumsikan memiliki pemahaman mengenai teknologi *blockchain*, dompet kripto, maupun mekanisme biaya transaksi. Kompetensi minimum yang diasumsikan adalah kemampuan mengisi formulir, mengunggah berkas, dan membaca tabel rekapitulasi. Konsekuensinya, seluruh interaksi *on-chain* wajib disembunyikan dari kelompok ini.

2. **Asesor** merupakan pihak yang menilai. Kelompok ini merupakan dosen yang memperoleh penugasan sebagai asesor BKD dan telah memahami rubrik PO BKD beserta ketentuan penilaiannya. Kompetensi tambahan yang diasumsikan adalah kemampuan menilai kesesuaian antara parameter kegiatan dan dokumen penugasan yang menjadi sumbernya, serta kemampuan menetapkan nilai pada butir aturan yang tidak diotomatisasi. Sama seperti dosen, kelompok ini tidak diasumsikan memahami teknologi *blockchain*.

3. **Administrator** merupakan pengelola sistem di tingkat jurusan. Kompetensi minimum yang diasumsikan mencakup kemampuan mengelola data induk melalui antarmuka web, kemampuan membaca dokumen SK dan ST untuk memverifikasi hasil ekstraksi, serta pemahaman dasar mengenai konsekuensi operasi koreksi token. Berbeda dengan dua kelompok sebelumnya, administrator perlu memahami bahwa operasi koreksi token bersifat permanen dan tercatat pada *blockchain*.

Perbedaan karakteristik ketiga kelompok ini menjadi dasar pembedaan hak akses berbasis peran yang dispesifikasikan lebih lanjut pada Section 3.

4. ## **Constraints** {#constraints}

Subbab ini memuat batasan yang berasal dari sisi klien serta lingkungan eksternal tempat sistem dioperasikan, mencakup batasan regulasi, ketentuan institusi, karakteristik dokumen sumber, dan keterbatasan lingkungan teknis. Batasan pada Tabel II.4 bersifat *given*, yaitu berada di luar kendali langsung tim pengembang, dan menjadi sumber penurunan bagi *Design Constraints* pada subbab III.5.

Tabel II.4. Daftar *Constraints*

| ID | Batasan | Sumber/Asal |
| :---: | ----- | ----- |
| **CON-01** | Aturan perhitungan kredit kegiatan wajib mengikuti rubrik unsur pendidikan pada PO BKD tahun 2021 tanpa penyesuaian sepihak, termasuk pada butir yang nilainya merupakan batas maksimum. | Regulasi: Pedoman Operasional Beban Kerja Dosen tahun 2021. |
| **CON-02** | Penilaian BKD wajib melibatkan dua asesor untuk setiap dosen, dan hasil akhir baru sah setelah kedua asesor mengesahkan penilaiannya. | Ketentuan penilaian BKD yang berlaku pada institusi. |
| **CON-03** | Sistem mengelola data pribadi dosen, sehingga wajib mematuhi peraturan perlindungan data pribadi dalam mengumpulkan, menyimpan, dan memproses data tersebut. | Hukum: Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi. |
| **CON-04** | Dokumen sumber berupa SK dan ST diterbitkan dalam dua bentuk yang berbeda karakteristiknya, yaitu PDF digital dengan lapisan teks utuh dan PDF hasil pemindaian dengan lapisan teks terdegradasi. | Praktik penerbitan dokumen pada institusi penerbit. |
| **CON-05** | Tata letak lampiran dokumen penugasan tidak seragam antar-unit penerbit dan antar-program studi, termasuk perbedaan lebar kolom pada tabel lampiran. | Praktik penerbitan dokumen pada institusi penerbit. |
| **CON-06** | Dosen dan asesor sebagai pengguna akhir tidak dapat diasumsikan memiliki dompet kripto maupun memahami mekanisme biaya transaksi *blockchain*. | Karakteristik pengguna sasaran. |
| **CON-07** | Kode *smart contract* bersifat *immutable* setelah ditempatkan pada jaringan, sehingga perubahan aturan menuntut penempatan ulang kontrak yang menghasilkan alamat baru. | Karakteristik teknologi *blockchain*. |
| **CON-08** | Penyedia titik akhir RPC publik membatasi rentang blok yang boleh ditelusuri dalam satu permintaan pembacaan *event*. | Kebijakan penyedia layanan RPC pihak ketiga. |
| **CON-09** | Keluaran layanan model bahasa visual bersifat probabilistik dan tidak menjamin hasil yang identik pada setiap eksekusi untuk masukan yang sama. | Karakteristik teknologi model pembelajaran mesin. |
| **CON-10** | Antarmuka dan konten utama harus disajikan dalam Bahasa Indonesia karena pengguna sasaran merupakan sivitas akademika perguruan tinggi di Indonesia. | Karakteristik pengguna sasaran. |

5. ## **Assumptions and Dependencies** {#assumptions-and-dependencies}

Subbab ini memuat asumsi yang dianggap benar pada saat penyusunan dokumen serta ketergantungan sistem terhadap komponen eksternal. Asumsi digunakan sebagai landasan perumusan persyaratan, sedangkan ketergantungan menandai komponen di luar kendali tim yang perubahannya dapat berdampak langsung pada pemenuhan persyaratan terkait.

1. ### **Assumptions** {#assumptions}

Persyaratan dalam dokumen ini disusun dengan asumsi berikut yang dianggap benar pada saat penulisan, namun dapat berubah seiring perkembangan proyek.

1. Rubrik unsur pendidikan pada PO BKD tahun 2021 tidak berubah selama masa pengembangan, sehingga aturan yang dikodekan ke dalam *smart contract* tetap sahih.
2. Dokumen SK dan ST yang diunggah administrator merupakan dokumen resmi yang keasliannya telah dipastikan di luar sistem.
3. Struktur tabel lampiran pada dokumen penugasan yang berasal dari satu unit penerbit relatif konsisten antar-periode, sehingga aturan ekstraksi deterministik tetap berlaku.
4. Administrator memiliki akses terhadap dokumen sumber sehingga dapat memverifikasi dan mengoreksi hasil ekstraksi sebelum diterapkan.
5. Peladen aplikasi, basis data, layanan ekstraksi, dan titik akhir RPC tersedia dan dapat dijangkau selama operasi normal sistem.
6. Alamat *wallet* kustodian yang telah ditetapkan bagi seorang dosen tidak berubah sepanjang masa penggunaan sistem, sehingga akumulasi kredit tetap berada pada satu alamat.

2. ### **Dependencies** {#dependencies}

Persyaratan sistem memiliki ketergantungan terhadap komponen eksternal berikut. Perubahan pada komponen ini dapat berdampak langsung pada persyaratan terkait.

1. **Jaringan Base Sepolia dan penyedia RPC.** Seluruh operasi perhitungan kredit dan penerbitan token bergantung pada ketersediaan jaringan dan titik akhir RPC. Gangguan pada komponen ini berdampak pada FR-18, FR-24, FR-25, dan FR-26. Perubahan kebijakan pembatasan rentang blok oleh penyedia RPC berdampak pada NFR-12.

2. **Pustaka OpenZeppelin Contracts.** Kontrak token diturunkan dari implementasi ERC20 dan AccessControl pada pustaka ini. Perubahan mayor pada pustaka berdampak pada perilaku pembatasan pemindahan token dan kontrol akses, yaitu FR-24 dan FR-25.

3. **Layanan model bahasa visual melalui API.** Ekstraksi dokumen hasil pemindaian dan pemeriksaan keaslian dokumen bukti bergantung sepenuhnya pada layanan ini. Ketidaktersediaan layanan atau perubahan model yang digunakan berdampak pada FR-09 khusus untuk jenis dokumen pindaian, dan pada FR-28 untuk seluruh pemeriksaan dokumen bukti.

4. **PostgreSQL dan Prisma ORM.** Integritas dan performa seluruh data operasional bergantung pada versi yang digunakan. Perubahan mayor berdampak pada seluruh persyaratan yang melibatkan penyimpanan data.

5. **Tata letak dokumen SK dan ST.** Aturan ekstraksi deterministik disusun berdasarkan struktur kolom dokumen yang berlaku. Perubahan tata letak oleh unit penerbit menuntut penyesuaian aturan ekstraksi dan berdampak pada FR-09 dan FR-10.

Sistem dirancang agar kegagalan pada ketergantungan nomor 1 dan nomor 3 tidak menghentikan operasi secara keseluruhan. Kegagalan pemanggilan *blockchain* dicatat sebagai transaksi berstatus gagal tanpa membatalkan data penilaian yang telah tersimpan, kegagalan layanan ekstraksi dikembalikan sebagai pesan galat yang dapat dibedakan penyebabnya oleh administrator, dan kegagalan pemeriksaan dokumen bukti disimpan sebagai hasil berstatus gagal tanpa membatalkan pengunggahan dokumen oleh dosen.

# **Section 3 \- Specific Requirements** {#section-3---specific-requirements}

Bagian ini memuat seluruh persyaratan secara rinci agar dapat dirancang dan diuji. Persyaratan fungsional diorganisasikan berdasarkan fitur sistem (*system features*) dan diberi pengidentifikasi unik berformat FR-NN agar dapat ditelusuri terhadap proses pada *Data Flow Diagram*, modul implementasi, dan skenario pengujian. Penomoran FR pada dokumen ini identik dengan penomoran pada Tabel IV.10 Laporan Tugas Akhir.

Berbeda dengan dokumen yang menggunakan pendekatan berorientasi objek, penurunan persyaratan pada dokumen ini bertumpu pada dekomposisi proses dan aliran data sebagaimana disajikan pada Gambar I.1 dan Gambar I.2. Setiap fitur sistem pada subbab III.2 berkorespondensi dengan satu atau lebih proses pada Tabel II.3, dan logika pemrosesan rincinya disajikan sebagai spesifikasi proses pada Appendix A.

1. ## **External Interface Requirements** {#external-interface-requirements}

Subbab ini merinci seluruh persyaratan antarmuka eksternal sistem, yaitu antarmuka dengan pengguna, perangkat keras, perangkat lunak lain, dan jaringan komunikasi. Uraian di sini melengkapi gambaran umum pada subbab II.1 dengan tingkat kedetailan yang cukup bagi perancang untuk membangun sistem dan bagi penguji untuk memverifikasinya. Setiap ketentuan diberi pengidentifikasi unik agar dapat ditelusuri ke perancangan dan skenario pengujian.

1. ### **User Interfaces** {#user-interfaces-1}

Antarmuka pengguna dirancang di atas dua landasan. Secara struktural, seluruh halaman pasca-autentikasi menggunakan satu kerangka tampilan yang seragam agar pengguna tidak perlu menyesuaikan diri ketika berpindah antarhalaman. Secara perilaku, antarmuka diturunkan dari kebutuhan menyembunyikan kompleksitas *blockchain* dan melindungi pengguna dari aksi yang tidak dapat dibatalkan. Antarmuka pengguna mengikuti ketentuan berikut.

1. Sistem harus menyediakan tiga ruang kerja terpisah sesuai peran, yaitu ruang kerja dosen, asesor, dan administrator, masing-masing dengan menu bilah sisi yang hanya memuat halaman yang boleh diakses peran tersebut. \[UI-01\]
2. Sistem harus menggunakan kerangka tampilan seragam pada seluruh halaman pasca-autentikasi, terdiri atas bilah sisi navigasi, bilah atas identitas institusi, dan area konten. \[UI-02\]
3. Sistem harus menampilkan umpan balik visual langsung atas setiap aksi peladen yang selesai dijalankan, baik ketika berhasil maupun ketika gagal, disertai pesan yang menjelaskan penyebab kegagalan. \[UI-03\]
4. Sistem harus menampilkan dialog konfirmasi sebelum mengeksekusi aksi yang tidak dapat dibatalkan, yaitu penyimpanan permanen dokumen BKD oleh dosen, pengesahan penilaian oleh asesor, penerapan hasil ekstraksi dokumen, dan penghapusan token oleh administrator. \[UI-04\]
5. Sistem tidak boleh mensyaratkan dosen dan asesor memahami mekanisme *blockchain*, yaitu tidak menampilkan biaya *gas*, tidak meminta penandatanganan transaksi, dan tidak menuntut kepemilikan dompet kripto. Alamat *wallet* kustodian boleh ditampilkan sebagai keterangan identitas baca saja pada halaman profil dan pada blok biodata dokumen BKD sebagai keterbukaan atas alamat tujuan kredit, dan tidak boleh disajikan sebagai elemen yang menuntut tindakan pengguna. \[UI-05\]
6. Sistem harus menampilkan nilai kredit kepada pengguna dalam satuan SKS berdesimal, bukan dalam skala kali seratus yang digunakan secara internal. \[UI-06\]
7. Sistem harus menyediakan pratinjau dokumen bukti berformat PDF di dalam halaman, tanpa memaksa pengguna mengunduh berkas terlebih dahulu. \[UI-07\]
8. Sistem harus menyediakan penyaring, pencarian, dan paginasi pada halaman yang berpotensi menampilkan lebih dari dua puluh baris data, khususnya halaman pratinjau hasil ekstraksi dokumen. \[UI-08\]
9. Sistem harus menampilkan nilai asli hasil ekstraksi berdampingan dengan nilai koreksi pada setiap baris yang telah dikoreksi administrator. \[UI-09\]
10. Sistem harus menampilkan penanda status kegiatan, status penilaian, dan status transaksi menggunakan perlakuan visual yang seragam di seluruh halaman. \[UI-10\]
11. Seluruh teks antarmuka dan konten utama harus disajikan dalam Bahasa Indonesia. \[UI-11\]
12. Sistem harus menyajikan hasil pemeriksaan keaslian dokumen bukti kepada asesor sebagai panel rincian yang memuat seluruh nama yang terbaca beserta perannya menurut dokumen, sehingga asesor dapat menilai kewajaran pembacaan parser sebelum mengambil keputusan. \[UI-12\]
13. Sistem harus membedakan penyajian status pemeriksaan yang menyimpulkan ketidaksesuaian dari status yang tidak menyimpulkan apa pun, sehingga kegagalan layanan tidak tersaji sebagai tuduhan terhadap dosen. \[UI-13\]

2. ### **Hardware Interfaces** {#hardware-interfaces-1}

Sistem tidak memiliki antarmuka langsung dengan perangkat keras eksternal khusus. Ketentuan perangkat keras minimum yang harus dipenuhi adalah sebagai berikut.

1. Sistem harus dapat diakses melalui peramban modern pada perangkat komputer maupun perangkat bergerak, tanpa memerlukan perangkat keras tambahan. \[HW-01\]
2. Sistem harus menggunakan penyimpanan berkas pada peladen untuk menampung dokumen SK, ST, dan dokumen bukti kegiatan yang diunggah pengguna, dengan basis data hanya menyimpan metadata dan lokasi berkas. \[HW-02\]

3. ### **Software Interfaces** {#software-interfaces-1}

Sistem berinteraksi dengan perangkat lunak eksternal sebagaimana dirinci pada Tabel II.2, dengan ketentuan antarmuka berikut.

1. Sistem harus mengakses kedua *smart contract* melalui satu modul integrasi tunggal yang menggunakan pustaka Ethers.js di atas titik akhir RPC, sehingga tidak ada pemanggilan *blockchain* yang berlangsung di luar modul tersebut. \[SW-01\]
2. Sistem harus memanggil fungsi perhitungan pada kontrak kalkulator sebagai pemanggilan baca yang tidak menghasilkan transaksi, dan memanggil fungsi penerbitan maupun penghapusan token sebagai transaksi yang ditandatangani alamat pemegang peran. \[SW-02\]
3. Sistem harus mengakses basis data melalui Prisma ORM ke PostgreSQL dengan satu berkas skema sebagai sumber kebenaran tunggal, dan seluruh perubahan struktur dikelola melalui berkas migrasi terversi. \[SW-03\]
4. Sistem harus mengakses layanan ekstraksi dokumen melalui HTTP dengan autentikasi kunci API pada *header* permintaan, dan menerima hasil dalam format JSON terstruktur. \[SW-04\]
5. Sistem harus membedakan penanganan kegagalan layanan ekstraksi berdasarkan kode status yang dikembalikan, mencakup berkas tidak sesuai, kunci tidak sah, perubahan tata letak dokumen, kegagalan layanan model bahasa visual, dan konfigurasi belum lengkap. \[SW-05\]
6. Sistem harus memverifikasi kode sumber kedua kontrak pada penjelajah blok setelah penempatan, sehingga aturan yang berjalan dapat ditinjau pihak eksternal. \[SW-06\]
7. Sistem harus memakai titik akhir parser artefak universal pada layanan yang sama untuk membaca nama orang beserta perannya dari dokumen bukti, dan memperlakukan ketidaktersediaan titik akhir tersebut sebagai hasil pemeriksaan berstatus gagal, bukan sebagai kegagalan operasi pemanggilnya. \[SW-07\]

4. ### **Communications Interfaces** {#communications-interfaces-1}

Subbab ini menetapkan protokol dan ketentuan komunikasi jaringan antara komponen sistem dan pihak eksternal.

1. Sistem harus melayani seluruh komunikasi antara peramban dan peladen aplikasi melalui HTTPS. \[COM-01\]
2. Sistem harus memvalidasi sesi pada setiap permintaan menuju halaman terlindungi, dan mengarahkan permintaan tanpa sesi sah ke halaman masuk. \[COM-02\]
3. Sistem harus menggunakan JSON-RPC di atas HTTPS untuk seluruh komunikasi dengan jaringan *blockchain*. \[COM-03\]
4. Sistem harus membaca riwayat *event* dari *blockchain* secara berjenjang dengan memecah rentang penelusuran menjadi potongan berukuran tetap, agar tidak melampaui batas rentang blok yang diizinkan penyedia RPC. \[COM-04\]
5. Sistem harus menyimpan seluruh nilai rahasia, yaitu kunci privat penandatangan, frasa induk *wallet*, rahasia sesi, dan kunci API, sebagai variabel lingkungan pada sisi peladen dan tidak pernah mengirimkannya ke peramban. \[COM-05\]

2. ## **System Features** {#system-features}

Subbab ini merinci fitur sistem dengan mengikuti kerangka template A.5 pada Annex A IEEE Std 830-1998. Setiap fitur dijabarkan ke dalam tiga bagian, yaitu Pendahuluan yang menjelaskan layanan yang disediakan beserta prioritas dan aktor terkait, Urutan Stimulus dan Respons yang menggambarkan interaksi antara aktor dan sistem, serta Persyaratan Fungsional Terkait yang menuliskan setiap kebutuhan fungsional beserta proses sumbernya. Aktor yang terlibat adalah Dosen, Asesor, Administrator, dan Sistem, dengan Sistem mencakup lapisan orkestrasi, kedua *smart contract*, dan layanan ekstraksi dokumen.

1. ### **Autentikasi dan Otorisasi (AUT)** {#autentikasi-dan-otorisasi-aut}

Fitur Autentikasi dan Otorisasi merupakan gerbang masuk sistem yang mengatur identitas, sesi, dan pembatasan akses berbasis peran, serta menjadi prasyarat bagi akses ke seluruh fitur lain.

1. #### **Pendahuluan**

Fitur ini menyediakan mekanisme masuk berbasis surel dan kata sandi yang dikelola sistem sendiri, tanpa bergantung pada penyedia identitas eksternal. Pemilihan mekanisme ini didasarkan pada kenyataan bahwa pengguna sistem merupakan dosen dan pengelola jurusan yang datanya telah tercatat pada basis data internal. Sesi diterbitkan dalam bentuk JWT yang memuat pengenal pengguna beserta perannya, sehingga otorisasi dapat dijalankan tanpa membaca basis data pada setiap permintaan halaman. Prioritas fitur ini Tinggi karena menjadi prasyarat akses seluruh fitur lain, dengan aktor terkait Dosen, Asesor, Administrator, dan Sistem. Fitur ini merealisasikan proses P1.

2. #### **Urutan Stimulus**

Tabel III.1 menjabarkan urutan interaksi antara pengguna dan sistem pada fitur Autentikasi dan Otorisasi.

Tabel III.1. Urutan Stimulus dan Respons AUT

| No. | Stimulus | Respons |
| ----- | ----- | ----- |
| **Masuk ke Sistem** |  |  |
| 1\. | Pengguna membuka alamat sistem tanpa sesi aktif. | Sistem mengarahkan pengguna ke halaman masuk. |
| 2\. | Pengguna mengisi surel dan kata sandi lalu menekan tombol masuk. | Sistem mencari akun berdasarkan surel, membandingkan kata sandi terhadap *hash* yang tersimpan, menerbitkan sesi berisi pengenal dan peran, lalu mengarahkan pengguna ke beranda sesuai perannya. |
| 3\. | Kredensial tidak cocok atau akun tidak ditemukan. | Sistem menolak permintaan, tidak menerbitkan sesi, menampilkan pesan kesalahan, dan menahan pengguna di halaman masuk. |
| **Pembatasan Akses** |  |  |
| 4\. | Pengguna dengan sesi aktif membuka halaman pada ruang kerja perannya. | Sistem menampilkan halaman yang diminta. |
| 5\. | Pengguna mencoba membuka halaman pada ruang kerja peran lain. | Sistem menolak permintaan dan mengarahkan pengguna kembali ke beranda perannya sendiri. |
| 6\. | Permintaan menuju halaman terlindungi datang tanpa sesi sah. | Sistem mengarahkan permintaan ke halaman masuk. |
| **Profil Akun** |  |  |
| 7\. | Pengguna membuka halaman profil pada ruang kerjanya. | Sistem menampilkan data akun pengguna tersebut secara baca saja, meliputi identitas akademik, atribut asesor bagi pemegang peran asesor, dan alamat *wallet* kustodian bagi dosen. |
| 8\. | Pengguna berupaya menyunting data profilnya sendiri. | Sistem tidak menyediakan penyuntingan pada halaman tersebut, karena perubahan data akun merupakan kewenangan administrator. |

3. #### **Functional Requirement Terkait**

Tabel III.2 merangkum persyaratan fungsional fitur Autentikasi dan Otorisasi beserta rujukan prosesnya.

Tabel III.2. *Functional Requirement* AUT

| No. | ID | Deskripsi | Sumber |
| :---: | ----- | ----- | :---: |
| 1\. | FR-01 | Sistem harus menyediakan mekanisme masuk menggunakan surel dan kata sandi, dengan verifikasi kata sandi dilakukan terhadap *hash* yang tersimpan. | P1 / PSPEC-01 |
| 2\. | FR-02 | Sistem harus membatasi akses halaman berdasarkan peran pengguna dan mengarahkan pengguna ke ruang kerja sesuai perannya. | P1 / PSPEC-01 |
| 3\. | FR-32 | Sistem harus menampilkan data profil akun pengguna yang sedang masuk sebagai tampilan baca saja pada ketiga ruang kerja, tanpa menyediakan penyuntingan mandiri. | P1 / PSPEC-01 |

2. ### **Manajemen Pengguna dan Wallet (USR)** {#manajemen-pengguna-dan-wallet-usr}

Fitur Manajemen Pengguna dan Wallet menyediakan pengelolaan akun bagi ketiga peran serta penetapan alamat *blockchain* bagi dosen sebagai tujuan penerbitan kredit.

1. #### **Pendahuluan**

Fitur ini memungkinkan administrator menambah akun, mengisi kode dosen sebagaimana tercantum pada dokumen penugasan, mengisi nomor induk registrasi asesor bagi pemegang peran asesor, serta mengaktifkan dan menonaktifkan akun. Fitur ini juga menyediakan penetapan alamat *wallet* kustodian bagi dosen, yaitu alamat yang diturunkan secara deterministik dari satu frasa induk pada peladen sehingga dosen tidak perlu memiliki dompet kripto sendiri. Pengisian kode dosen menjadi prasyarat penting karena kode tersebut merupakan penanda utama yang dipakai untuk mencocokkan baris hasil ekstraksi dokumen ke akun dosen yang bersangkutan. Prioritas fitur ini Tinggi karena menjadi prasyarat bagi ekstraksi dokumen dan penerbitan token, dengan aktor terkait Administrator dan Sistem. Fitur ini merealisasikan proses P2.

2. #### **Urutan Stimulus**

Tabel III.3 menjabarkan urutan interaksi pada fitur Manajemen Pengguna dan Wallet.

Tabel III.3. Urutan Stimulus dan Respons USR

| No. | Stimulus | Respons |
| ----- | ----- | ----- |
| 1\. | Administrator mengisi data akun baru berupa nama, surel, kata sandi awal, dan peran, lalu menyimpan. | Sistem memvalidasi keunikan surel, menyimpan kata sandi dalam bentuk *hash*, dan menambahkan akun ke daftar pengguna. |
| 2\. | Administrator mengisi kode dosen pada akun dosen tertentu. | Sistem menyimpan kode dosen tersebut dan melepaskan kode yang sama apabila sebelumnya melekat pada akun lain, agar pencocokan hasil ekstraksi tidak menjadi ambigu. |
| 3\. | Administrator mengisi nomor induk registrasi asesor pada akun asesor tertentu. | Sistem memvalidasi bahwa nomor tersebut belum dipakai akun lain, lalu menyimpannya; pengosongan nilai diperlakukan sebagai pencabutan nomor. |
| 4\. | Administrator menonaktifkan sebuah akun. | Sistem menandai akun sebagai tidak aktif sehingga akun tersebut tidak dapat lagi masuk ke sistem, tanpa menghapus data yang tertaut padanya. |
| 5\. | Administrator menetapkan *wallet* bagi seorang dosen yang belum memilikinya. | Sistem mencari indeks *wallet* terbesar yang telah terpakai, menurunkan alamat pada indeks berikutnya dari frasa induk, lalu menyimpan alamat beserta indeksnya pada akun dosen. |
| 6\. | Administrator menetapkan *wallet* bagi dosen yang telah memilikinya. | Sistem menolak permintaan agar akumulasi kredit yang telah terbit tetap berada pada satu alamat. |

3. #### **Functional Requirement Terkait**

Tabel III.4. *Functional Requirement* USR

| No. | ID | Deskripsi | Sumber |
| :---: | ----- | ----- | :---: |
| 1\. | FR-03 | Sistem harus menyediakan penambahan akun pengguna, pengisian kode dosen, pengisian nomor induk registrasi asesor yang unik lintas akun, serta pengaktifan dan penonaktifan akun bagi administrator. | P2 / PSPEC-02 |
| 2\. | FR-04 | Sistem harus dapat menetapkan alamat *wallet* kustodian bagi dosen yang diturunkan secara deterministik dari frasa induk pada peladen, dengan indeks penurunan yang unik untuk setiap dosen. | P2 / PSPEC-02 |

3. ### **Manajemen Periode dan Fase BKD (PRD)** {#manajemen-periode-dan-fase-bkd-prd}

Fitur Manajemen Periode dan Fase BKD mengatur rentang waktu penilaian beserta tahap yang sedang berjalan, yang menentukan aksi apa saja yang boleh dijalankan setiap peran.

1. #### **Pendahuluan**

Fitur ini memungkinkan administrator mengelola periode penilaian beserta rentang tanggal untuk fase pengisian, penilaian, dan perbaikan. Fase yang sedang berjalan ditentukan secara otomatis dari perbandingan tanggal berjalan terhadap rentang tersebut, namun tetap dapat dipaksakan administrator melalui nilai penggantian manual ketika terjadi penyesuaian jadwal. Sistem menegakkan ketentuan bahwa hanya satu periode boleh berstatus aktif pada satu waktu. Prioritas fitur ini Tinggi karena seluruh pembatasan aksi pada fitur lain bergantung pada fase yang dihasilkan fitur ini, dengan aktor terkait Administrator dan Sistem. Fitur ini merealisasikan proses P3.

2. #### **Urutan Stimulus**

Tabel III.5. Urutan Stimulus dan Respons PRD

| No. | Stimulus | Respons |
| ----- | ----- | ----- |
| 1\. | Administrator menambah periode baru beserta tahun ajaran, semester, dan rentang tanggal ketiga fase. | Sistem menyimpan periode dengan status tidak aktif. |
| 2\. | Administrator mengaktifkan sebuah periode. | Sistem menonaktifkan periode lain yang sedang aktif, kemudian menandai periode tersebut sebagai aktif. |
| 3\. | Pengguna membuka halaman yang aksinya bergantung fase. | Sistem menentukan fase berjalan dari tanggal hari ini terhadap rentang fase periode aktif, lalu mengaktifkan atau menonaktifkan aksi sesuai fase tersebut. |
| 4\. | Administrator menetapkan nilai penggantian fase secara manual. | Sistem mengutamakan nilai penggantian tersebut dan mengabaikan perhitungan berbasis tanggal selama nilai penggantian masih terisi. |

3. #### **Functional Requirement Terkait**

Tabel III.6. *Functional Requirement* PRD

| No. | ID | Deskripsi | Sumber |
| :---: | ----- | ----- | :---: |
| 1\. | FR-05 | Sistem harus menyediakan penambahan periode BKD beserta rentang fase pengisian, penilaian, dan perbaikan, serta menjamin hanya satu periode berstatus aktif pada satu waktu. | P3 / PSPEC-03 |
| 2\. | FR-06 | Sistem harus menentukan fase yang sedang berjalan dan membatasi aksi pengguna sesuai fase tersebut, dengan nilai penggantian manual diutamakan apabila terisi. | P3 / PSPEC-03 |

4. ### **Penugasan Asesor (ASR)** {#penugasan-asesor-asr}

Fitur Penugasan Asesor menetapkan dua asesor yang berwenang menilai setiap dokumen BKD, sesuai ketentuan penilaian BKD yang berlaku.

1. #### **Pendahuluan**

Fitur ini memungkinkan administrator menugaskan asesor pertama dan asesor kedua pada setiap dokumen BKD, baik satu per satu maupun secara massal untuk seluruh dosen sekaligus. Sistem menegakkan dua ketentuan pada tingkat basis data, yaitu tidak boleh ada dua asesor yang menempati urutan sama pada satu dokumen dan satu asesor tidak boleh ditugaskan dua kali pada dokumen yang sama. Kedua ketentuan tersebut diperlukan karena mekanisme pengesahan berjenjang mensyaratkan dua asesor yang berbeda. Prioritas fitur ini Tinggi karena penerbitan kredit tidak dapat berlangsung tanpa dua asesor yang sah, dengan aktor terkait Administrator dan Sistem. Fitur ini merealisasikan proses P4.

2. #### **Urutan Stimulus**

Tabel III.7. Urutan Stimulus dan Respons ASR

| No. | Stimulus | Respons |
| ----- | ----- | ----- |
| 1\. | Administrator memilih dokumen BKD seorang dosen dan menetapkan asesor pada urutan pertama. | Sistem menyimpan penugasan tersebut dan menampilkannya pada daftar penugasan. |
| 2\. | Administrator menetapkan asesor pada urutan kedua untuk dokumen yang sama. | Sistem memvalidasi bahwa asesor tersebut berbeda dari asesor pertama, kemudian menyimpan penugasan. |
| 3\. | Administrator menetapkan asesor yang sama pada kedua urutan. | Sistem menolak permintaan disertai pesan kesalahan. |
| 4\. | Administrator menjalankan penugasan massal untuk seluruh dosen pada periode aktif. | Sistem membentuk penugasan bagi dokumen BKD yang belum memiliki asesor, dan melewati dokumen yang penugasannya telah lengkap. |
| 5\. | Administrator menghapus sebuah penugasan. | Sistem menghapus penugasan beserta seluruh hasil penilaian yang terkait dengannya, sepanjang penilaian tersebut belum disahkan. |

3. #### **Functional Requirement Terkait**

Tabel III.8. *Functional Requirement* ASR

| No. | ID | Deskripsi | Sumber |
| :---: | ----- | ----- | :---: |
| 1\. | FR-07 | Sistem harus dapat menugaskan dua asesor yang berbeda pada satu dokumen BKD dengan urutan asesor pertama dan kedua, baik satu per satu maupun secara massal. | P4 / PSPEC-04 |

5. ### **Referensi Kegiatan BKD (REF)** {#referensi-kegiatan-bkd-ref}

Fitur Referensi Kegiatan BKD menyediakan data acuan butir aturan PO BKD beserta pemetaannya ke fungsi perhitungan pada *smart contract*.

1. #### **Pendahuluan**

Fitur ini menyimpan setiap butir aturan pada rubrik unsur pendidikan beserta kode aturan, kategori seksi, nama fungsi perhitungan pada kontrak, skema parameter yang dibutuhkan, dan batas SKS maksimal apabila berlaku. Skema parameter disimpan sebagai dokumen semi-terstruktur karena setiap butir aturan memiliki jumlah dan nama parameter yang berbeda. Butir aturan yang penilaiannya tidak diotomatisasi ditandai dengan nama fungsi yang dibiarkan kosong, sehingga lapisan aplikasi dapat membedakan kedua jenis butir tanpa daftar pengecualian yang ditulis di dalam kode. Prioritas fitur ini Tinggi karena menjadi sumber kebenaran bagi perhitungan kredit dan pemetaan hasil ekstraksi, dengan aktor terkait Administrator dan Sistem. Fitur ini merealisasikan proses P5.

2. #### **Urutan Stimulus**

Tabel III.9. Urutan Stimulus dan Respons REF

| No. | Stimulus | Respons |
| ----- | ----- | ----- |
| 1\. | Sistem dipasang dan data acuan dimuat melalui berkas *seed*. | Sistem menyimpan seluruh butir referensi kegiatan beserta kode aturan, kategori, nama fungsi kontrak, dan skema parameternya. |
| 2\. | Administrator membuka halaman referensi kegiatan. | Sistem menampilkan seluruh butir aturan beserta pemetaannya ke fungsi kontrak, dikelompokkan berdasarkan kategori seksi. |
| 3\. | Dosen membuka formulir tambah kegiatan pada suatu kategori. | Sistem mengambil skema parameter butir aturan yang dipilih dan membangkitkan isian formulir sesuai skema tersebut. |
| 4\. | Butir aturan yang dipilih tidak memiliki fungsi kontrak. | Sistem menandai kegiatan tersebut sebagai tidak diotomatisasi dan tidak memanggil kontrak kalkulator. |

3. #### **Functional Requirement Terkait**

Tabel III.10. *Functional Requirement* REF

| No. | ID | Deskripsi | Sumber |
| :---: | ----- | ----- | :---: |
| 1\. | FR-08 | Sistem harus menyediakan daftar referensi kegiatan sesuai rubrik PO BKD 2021 beserta skema parameter dan pemetaannya ke fungsi perhitungan pada *smart contract*. | P5 / PSPEC-09 |

6. ### **Ekstraksi dan Penerapan Dokumen Penugasan (EKS)** {#ekstraksi-dan-penerapan-dokumen-penugasan-eks}

Fitur Ekstraksi dan Penerapan Dokumen Penugasan mengubah berkas SK dan ST menjadi kegiatan BKD per dosen, sehingga parameter yang diproses sistem berasal langsung dari dokumen sumber, dan menyediakan jalur masukan manual bagi penugasan yang dokumennya tidak tersedia atau tidak terbaca parser.

1. #### **Pendahuluan**

Fitur ini merupakan pembeda utama sistem terhadap praktik yang berjalan. Administrator mengunggah satu atau beberapa berkas PDF, sistem mengekstraksi barisnya menjadi struktur data, memetakannya menjadi calon kegiatan lengkap dengan kode aturan dan parameter, mencocokkan setiap baris ke akun dosen, lalu menampilkan pratinjau sebelum diterapkan.

Sistem menyediakan dua jalur ekstraksi yang berbeda sesuai bentuk dokumen. Jalur deterministik berbasis posisi kolom digunakan bagi dokumen yang berasal dari sumber digital dan memiliki lapisan teks utuh, karena menghasilkan keluaran identik pada setiap eksekusi. Jalur penafsiran citra oleh model bahasa visual digunakan bagi dokumen hasil pemindaian yang lapisan teksnya terdegradasi. Karena keluaran jalur kedua bersifat probabilistik, hasilnya wajib melalui koreksi administrator sebelum diterapkan.

Koreksi administrator disimpan sebagai selisih pada kolom terpisah, tidak dengan menimpa hasil ekstraksi asli, sehingga keluaran mentah parser tetap utuh sebagai bukti audit.

Fitur ini juga menyediakan jalur masukan manual sebagai pelengkap kedua jalur ekstraksi di atas. Jalur manual diperlukan untuk penugasan yang dokumen resminya belum terbit, tidak tersedia dalam bentuk berkas, atau tidak terbaca kedua parser. Melalui jalur ini administrator menginput kegiatan berbasis penugasan atas nama seorang dosen dengan hasil akhir yang setara dengan penerapan hasil ekstraksi, yaitu kegiatan berstatus portofolio yang belum diklaim. Jalur manual dibatasi pada butir aturan yang dasarnya penugasan institusi, yaitu perkuliahan, pembimbingan, pengujian, dan pembinaan mahasiswa, sehingga butir yang menjadi hak pengisian dosen tetap tidak dapat diisikan administrator. Prioritas fitur ini Tinggi karena menjadi sumber utama kegiatan dosen sekaligus jaminan bahwa parameter berasal dari dokumen resmi, dengan aktor terkait Administrator, Layanan Model Bahasa Visual, dan Sistem. Fitur ini merealisasikan proses P6.

2. #### **Urutan Stimulus**

Tabel III.11. Urutan Stimulus dan Respons EKS

| No. | Stimulus | Respons |
| ----- | ----- | ----- |
| **Unggah dan Ekstraksi** |  |  |
| 1\. | Administrator memilih satu atau beberapa berkas PDF dan menentukan jenis dokumennya. | Sistem menyimpan berkas beserta nilai *hash* integritasnya, kemudian meneruskannya ke jalur ekstraksi yang sesuai dengan jenis dokumen. |
| 2\. | Administrator tidak menentukan jenis dokumen secara manual. | Sistem mendeteksi jenis dokumen dari nama berkas sebagai nilai awal, dan tetap mengizinkan administrator mengubahnya. |
| 3\. | Berkas berhasil diekstraksi. | Sistem menyimpan keluaran parser secara utuh sebagai bukti audit, menandai unggahan berstatus terparse, dan menampilkan ringkasan hasil. |
| 4\. | Parser menolak berkas karena bukan PDF, tata letak berubah, atau layanan model bahasa visual tidak tersedia. | Sistem menandai unggahan berstatus gagal dan menampilkan pesan galat yang membedakan penyebab kegagalan tersebut. |
| **Pratinjau dan Koreksi** |  |  |
| 5\. | Administrator membuka halaman pratinjau unggahan. | Sistem menampilkan pemetaan setiap baris dokumen menjadi calon kegiatan beserta kode aturan, parameter, dosen tujuan, dan temuan validasi, dilengkapi kartu ringkasan yang berfungsi sebagai penyaring. |
| 6\. | Sistem mencocokkan baris ke akun dosen. | Sistem mencocokkan secara berjenjang melalui kode dosen, nomor induk pegawai, lalu nama tanpa gelar, dan menandai hasilnya sebagai cocok, ambigu, atau tidak cocok. |
| 7\. | Administrator mengubah nama kegiatan, parameter, atau dosen tujuan pada suatu baris. | Sistem menyimpan perubahan tersebut sebagai selisih koreksi tanpa mengubah hasil ekstraksi asli, dan menampilkan nilai asli berdampingan dengan nilai koreksi. |
| 8\. | Administrator menandai sebuah baris agar dilewati. | Sistem mengecualikan baris tersebut dari penerapan. |
| 9\. | Administrator membatalkan koreksi pada suatu baris. | Sistem mengembalikan baris tersebut ke nilai hasil ekstraksi asli. |
| **Penerapan** |  |  |
| 10\. | Administrator menekan tombol terapkan. | Sistem membentuk kegiatan pada dokumen BKD periode aktif untuk setiap baris yang tidak dilewati, menghitung nilai kreditnya melalui kontrak kalkulator, dan melampirkan berkas sumber sebagai dokumen bukti. |
| 11\. | Administrator menerapkan ulang unggahan yang sama setelah mengoreksi sebagian baris. | Sistem memperbarui di tempat baris yang koreksinya berubah, melewati baris yang sudah sesuai, dan tidak mengubah kegiatan yang telah diklaim dosen. |
| **Input Manual Penugasan** |  |  |
| 12\. | Administrator memilih dosen tujuan dan butir aturan berbasis penugasan, mengisi rincian dan parameter kegiatan, lalu menyimpan. | Sistem membentuk kegiatan pada dokumen BKD laporan periode aktif milik dosen tersebut sebagai portofolio yang belum diklaim, dan menghitung nilai kreditnya melalui kontrak kalkulator. |
| 13\. | Administrator memilih butir aturan yang pengisiannya merupakan hak dosen, misalnya bahan ajar atau tugas tambahan. | Sistem menolak penyimpanan dan menyatakan bahwa jenis kegiatan tersebut diisi sendiri oleh dosen. |
| 14\. | Administrator menyimpan kegiatan yang judul dan butir aturannya telah tercatat pada dosen yang sama. | Sistem menolak penyimpanan agar kegiatan tidak tercatat ganda akibat pengiriman formulir berulang. |
| 15\. | Administrator mengubah atau menghapus kegiatan hasil input administrator yang telah diklaim dosen. | Sistem menolak aksi tersebut dan meminta klaim dibatalkan terlebih dahulu oleh dosen yang bersangkutan. |
| 16\. | Administrator menyimpan kegiatan bagi dosen yang dokumen BKD-nya telah disimpan permanen. | Sistem menolak penyimpanan karena kegiatan baru tidak akan dapat diklaim dosen tersebut. |

3. #### **Functional Requirement Terkait**

Tabel III.12. *Functional Requirement* EKS

| No. | ID | Deskripsi | Sumber |
| :---: | ----- | ----- | :---: |
| 1\. | FR-09 | Sistem harus dapat menerima unggahan berkas SK dan ST untuk diekstraksi menjadi baris penugasan terstruktur, dengan jalur ekstraksi yang dipilih sesuai bentuk dokumen. | P6 / PSPEC-05 |
| 2\. | FR-10 | Sistem harus menampilkan pratinjau pemetaan baris penugasan menjadi kegiatan beserta temuan validasi dan status pencocokan dosen berupa cocok, ambigu, atau tidak cocok. | P6 / PSPEC-06 |
| 3\. | FR-11 | Sistem harus dapat menerima koreksi atau penandaan lewati pada setiap baris hasil ekstraksi tanpa mengubah hasil ekstraksi asli, serta dapat mengembalikan baris ke nilai aslinya. | P6 / PSPEC-07 |
| 4\. | FR-12 | Sistem harus dapat menerapkan hasil ekstraksi menjadi kegiatan dosen secara idempoten per baris dan melampirkan berkas sumber sebagai dokumen bukti, tanpa mengubah kegiatan yang telah diklaim dosen. | P6 / PSPEC-07 |
| 5\. | FR-31 | Sistem harus menyediakan penginputan kegiatan berbasis penugasan atas nama seorang dosen bagi administrator, terbatas pada butir aturan yang dasarnya penugasan institusi, dengan kegiatan terbentuk sebagai portofolio yang belum diklaim dan nilai kreditnya dihitung melalui kontrak kalkulator. | P6 / PSPEC-20 |

7. ### **Pengelolaan Kegiatan dan Dokumen BKD (KEG)** {#pengelolaan-kegiatan-dan-dokumen-bkd-keg}

Fitur Pengelolaan Kegiatan dan Dokumen BKD menyediakan seluruh aksi yang dijalankan dosen atas kegiatan yang dilaporkannya pada satu periode.

1. #### **Pendahuluan**

Fitur ini memisahkan dua konsep yang berbeda, yaitu kegiatan sebagai portofolio dan kegiatan sebagai isi dokumen BKD. Kegiatan yang dibentuk dari penerapan dokumen penugasan maupun dari sinkronisasi sumber eksternal masuk sebagai portofolio dengan penanda belum diklaim, sehingga dosen tetap memegang keputusan apakah kegiatan tersebut dilaporkan pada periode berjalan. Kegiatan baru masuk ke dokumen BKD setelah dosen menariknya secara eksplisit.

Fitur ini juga menyediakan pengunggahan dokumen bukti, penetapan status capaian kegiatan, serta dua tingkat penyimpanan dokumen BKD. Penyimpanan sementara memungkinkan dosen melanjutkan pengisian di lain waktu, sedangkan penyimpanan permanen menandai dokumen siap dinilai dan menjadi prasyarat bagi asesor untuk dapat mengesahkan penilaiannya. Seluruh aksi pada fitur ini dibatasi oleh fase yang sedang berjalan. Prioritas fitur ini Tinggi karena merupakan jalur utama masuknya data yang dinilai, dengan aktor terkait Dosen dan Sistem. Fitur ini merealisasikan proses P7.

2. #### **Urutan Stimulus**

Tabel III.13. Urutan Stimulus dan Respons KEG

| No. | Stimulus | Respons |
| ----- | ----- | ----- |
| **Pengelolaan Kegiatan** |  |  |
| 1\. | Dosen memilih kategori kegiatan dan menekan tambah kegiatan. | Sistem menampilkan formulir yang isiannya dibangkitkan dari skema parameter butir aturan yang dipilih. |
| 2\. | Dosen mengisi parameter dan menyimpan kegiatan. | Sistem memvalidasi kelengkapan parameter terhadap skema, memanggil kontrak kalkulator untuk menghitung kredit, lalu menyimpan kegiatan beserta nilai dan status perhitungannya. |
| 3\. | Dosen menyunting parameter kegiatan yang telah tersimpan. | Sistem menghitung ulang nilai kredit melalui kontrak kalkulator dan memperbarui kegiatan. |
| 4\. | Dosen menghapus kegiatan yang belum dinilai. | Sistem menghapus kegiatan beserta dokumen bukti yang tertaut padanya. |
| 5\. | Dosen mencoba menyunting kegiatan di luar fase pengisian dan perbaikan. | Sistem menolak aksi tersebut dan menampilkan keterangan fase yang sedang berjalan. |
| **Dokumen Bukti** |  |  |
| 6\. | Dosen mengunggah berkas bukti pada suatu kegiatan. | Sistem menyimpan berkas pada penyimpanan peladen dan mencatat metadata beserta lokasinya pada basis data. |
| 7\. | Dosen membuka dokumen bukti berformat PDF. | Sistem menampilkan pratinjau dokumen di dalam halaman tanpa mengharuskan berkas diunduh. |
| 8\. | Dosen menghapus dokumen bukti. | Sistem menghapus metadata dokumen tersebut dari kegiatan terkait. |
| **Dokumen BKD** |  |  |
| 9\. | Dosen membuka dokumen BKD periode berjalan. | Sistem menampilkan kegiatan yang telah diklaim, dikelompokkan menurut seksi rubrik, beserta nilai kredit dan status penilaiannya. |
| 10\. | Dosen menarik kegiatan dari portofolio ke dokumen BKD. | Sistem menandai kegiatan tersebut sebagai diklaim sehingga masuk ke dalam dokumen BKD periode berjalan. |
| 11\. | Dosen membatalkan klaim atas suatu kegiatan. | Sistem mengembalikan kegiatan tersebut ke portofolio, sepanjang kegiatan belum dinilai asesor. |
| 12\. | Dosen menetapkan status capaian suatu kegiatan. | Sistem menyimpan status capaian tersebut sebagai keterangan pendamping nilai kredit. |
| 13\. | Dosen menyimpan dokumen BKD secara sementara. | Sistem menyimpan perubahan tanpa mengubah kesiapan dokumen untuk dinilai. |
| 14\. | Dosen menyimpan dokumen BKD secara permanen setelah mengonfirmasi melalui dialog. | Sistem menandai dokumen sebagai siap dinilai, sehingga asesor dapat mulai mengesahkan penilaiannya. |

3. #### **Functional Requirement Terkait**

Tabel III.14. *Functional Requirement* KEG

| No. | ID | Deskripsi | Sumber |
| :---: | ----- | ----- | :---: |
| 1\. | FR-13 | Sistem harus menyediakan penambahan, penyuntingan, dan penghapusan kegiatan beserta parameternya bagi dosen, dengan isian formulir yang dibangkitkan dari skema parameter butir aturan. | P7 / PSPEC-08 |
| 2\. | FR-14 | Sistem harus menyediakan pengunggahan dan penghapusan dokumen bukti pada suatu kegiatan, dengan berkas disimpan pada peladen dan basis data hanya menyimpan metadata beserta lokasinya. | P7 / PSPEC-08 |
| 3\. | FR-15 | Sistem harus dapat menarik kegiatan dari portofolio ke dokumen BKD periode berjalan dan membatalkan klaim tersebut selama kegiatan belum dinilai. | P7 / PSPEC-08 |
| 4\. | FR-16 | Sistem harus dapat menetapkan status capaian kegiatan sebagai keterangan pendamping nilai kredit. | P7 / PSPEC-08 |
| 5\. | FR-17 | Sistem harus menyediakan penyimpanan dokumen BKD secara sementara maupun permanen, dengan penyimpanan permanen menjadi prasyarat pengesahan oleh asesor. | P7 / PSPEC-08 |

8. ### **Perhitungan Kredit Kegiatan (HIT)** {#perhitungan-kredit-kegiatan-hit}

Fitur Perhitungan Kredit Kegiatan menjalankan aturan penilaian PO BKD 2021 secara deterministik melalui *smart contract*, dan merupakan inti dari solusi yang ditawarkan sistem.

1. #### **Pendahuluan**

Fitur ini menerima parameter kegiatan, memvalidasinya terhadap skema butir aturan, kemudian memanggil fungsi perhitungan yang bersesuaian pada kontrak kalkulator. Seluruh fungsi pada kontrak tersebut merupakan fungsi murni tanpa penyimpanan status, sehingga pemanggilannya tidak menghasilkan transaksi dan tidak menimbulkan biaya, serta dapat dijalankan sesering yang dibutuhkan selama dosen menyunting kegiatan.

Nilai kredit direpresentasikan secara internal pada skala kali seratus karena bahasa Solidity tidak mendukung bilangan desimal. Representasi ini menghindari kehilangan presisi pada butir aturan yang bobotnya bukan bilangan bulat. Butir aturan yang tidak memiliki fungsi kontrak dialihkan tanpa memanggil kontrak dan ditandai berstatus tidak diotomatisasi, sehingga nilainya ditetapkan asesor. Prioritas fitur ini Tinggi karena merupakan realisasi langsung tujuan pengembangan sistem, dengan aktor terkait *Smart Contract* Kalkulator BKD dan Sistem. Fitur ini merealisasikan proses P8.

2. #### **Urutan Stimulus**

Tabel III.15. Urutan Stimulus dan Respons HIT

| No. | Stimulus | Respons |
| ----- | ----- | ----- |
| 1\. | Kegiatan disimpan atau disunting, baik oleh dosen maupun melalui penerapan dokumen penugasan. | Sistem membaca nama fungsi dan skema parameter dari data referensi kegiatan, lalu memvalidasi kelengkapan dan tipe parameter terhadap skema tersebut. |
| 2\. | Parameter lengkap dan butir aturan memiliki fungsi kontrak. | Sistem memanggil fungsi perhitungan pada kontrak kalkulator dan menyimpan nilai kembalian sebagai nilai kredit kegiatan dengan status perhitungan berhasil. |
| 3\. | Kontrak menolak parameter karena tidak valid. | Sistem menandai status perhitungan sebagai gagal beserta alasan penolakan dari kontrak, tanpa membatalkan penyimpanan kegiatan. |
| 4\. | Butir aturan tidak memiliki fungsi kontrak. | Sistem menandai status perhitungan sebagai tidak diotomatisasi dan mengosongkan nilai kredit agar ditetapkan asesor. |
| 5\. | Titik akhir RPC tidak dapat dijangkau. | Sistem menandai status perhitungan sebagai gagal, menyimpan kegiatan, dan mengizinkan perhitungan ulang setelah jaringan pulih. |
| 6\. | Nilai kredit ditampilkan kepada pengguna. | Sistem mengubah nilai dari skala kali seratus menjadi satuan SKS berdesimal sebelum ditampilkan. |

3. #### **Functional Requirement Terkait**

Tabel III.16. *Functional Requirement* HIT

| No. | ID | Deskripsi | Sumber |
| :---: | ----- | ----- | :---: |
| 1\. | FR-18 | Sistem harus menghitung nilai kredit kegiatan melalui pemanggilan fungsi pada *smart contract* kalkulator berdasarkan parameter kegiatan, dan menyimpan hasilnya beserta status perhitungan. | P8 / PSPEC-09, PSPEC-10 |
| 2\. | FR-19 | Sistem harus menandai kegiatan yang butir aturannya tidak diotomatisasi agar nilai kreditnya ditetapkan asesor. | P8 / PSPEC-09 |

9. ### **Penilaian dan Pengesahan Asesor (NIL)** {#penilaian-dan-pengesahan-asesor-nil}

Fitur Penilaian dan Pengesahan Asesor menyediakan mekanisme verifikasi hasil perhitungan oleh dua asesor sebelum kredit diterbitkan.

1. #### **Pendahuluan**

Fitur ini memindahkan peran asesor dari pelaksana perhitungan menjadi pemverifikasi kesesuaian parameter terhadap dokumen sumber. Setiap asesor menilai kegiatan secara terpisah dan hasilnya tersimpan berdampingan, sehingga dua penilaian berbeda atas kegiatan yang sama dapat direkam tanpa saling menimpa. Struktur ini merupakan prasyarat bagi mekanisme perataan nilai pada pembentukan simpulan.

Asesor dapat menetapkan nilai kredit yang disetujui, jumlah pertemuan keputusan pada kegiatan pengajaran, persentase capaian pada kegiatan yang memerlukannya, status penilaian, dan catatan. Pengesahan hanya dapat dijalankan setelah dokumen BKD disimpan permanen oleh dosen dan seluruh kegiatan yang diklaim telah dinilai asesor yang bersangkutan. Prioritas fitur ini Tinggi karena menjadi satu-satunya jalur menuju penerbitan kredit, dengan aktor terkait Asesor dan Sistem. Fitur ini merealisasikan proses P9 pada bagian penilaian dan pengesahan.

2. #### **Urutan Stimulus**

Tabel III.17. Urutan Stimulus dan Respons NIL

| No. | Stimulus | Respons |
| ----- | ----- | ----- |
| 1\. | Asesor membuka daftar dokumen BKD yang ditugaskan kepadanya. | Sistem menampilkan dokumen BKD beserta status kesiapannya untuk dinilai. |
| 2\. | Asesor membuka dokumen BKD yang belum disimpan permanen dosen. | Sistem menampilkan penanda bahwa dokumen belum siap dinilai dan menonaktifkan aksi pengesahan. |
| 3\. | Asesor membuka rincian suatu kegiatan. | Sistem menampilkan parameter kegiatan, nilai kredit hasil perhitungan sistem, dan dokumen bukti yang dapat ditinjau langsung di halaman. |
| 4\. | Asesor mengisi nilai kredit yang disetujui, catatan, dan status penilaian pada suatu kegiatan. | Sistem menyimpan penilaian tersebut untuk penugasan asesor yang bersangkutan, memperbarui penilaian sebelumnya apabila sudah ada. |
| 5\. | Asesor menilai kegiatan yang butir aturannya tidak diotomatisasi. | Sistem menerima nilai kredit yang ditetapkan asesor sebagai nilai yang berlaku bagi kegiatan tersebut. |
| 6\. | Asesor menekan tombol sahkan sebelum seluruh kegiatan dinilai. | Sistem menolak permintaan dan menampilkan daftar kegiatan yang belum dinilai. |
| 7\. | Asesor menekan tombol sahkan dan mengonfirmasi melalui dialog, dengan seluruh kegiatan telah dinilai. | Sistem menandai penugasan asesor tersebut sebagai disahkan beserta waktu pengesahannya. |

3. #### **Functional Requirement Terkait**

Tabel III.18. *Functional Requirement* NIL

| No. | ID | Deskripsi | Sumber |
| :---: | ----- | ----- | :---: |
| 1\. | FR-20 | Sistem harus dapat menerima nilai kredit yang disetujui, jumlah pertemuan keputusan, persentase capaian, status, dan catatan dari setiap asesor pada setiap kegiatan yang ditugaskan kepadanya, dengan satu penilaian per asesor per kegiatan. | P9 / PSPEC-11 |
| 2\. | FR-21 | Sistem harus dapat mencatat pengesahan penilaian oleh asesor setelah memastikan dokumen BKD telah disimpan permanen dan seluruh kegiatan yang diklaim telah dinilai. | P9 / PSPEC-11 |

10. ### **Simpulan BKD dan Penerbitan Token (TOK)** {#simpulan-bkd-dan-penerbitan-token-tok}

Fitur Simpulan BKD dan Penerbitan Token membentuk hasil akhir penilaian dan mencatatnya secara permanen pada *blockchain*.

1. #### **Pendahuluan**

Fitur ini dipicu ketika asesor kedua mengesahkan penilaiannya. Sistem merata-ratakan nilai yang disetujui kedua asesor pada setiap kegiatan, menjumlahkan seluruh nilai menjadi total kredit, menetapkan status memenuhi atau tidak memenuhi sesuai ambang beban yang berlaku, kemudian menghitung *hash* kriptografi atas muatan simpulan tersebut.

Nilai *hash* dikirimkan sebagai referensi pada transaksi penerbitan token, sehingga isi penilaian tetap tersimpan pada basis data institusi sedangkan yang tercatat permanen pada *blockchain* hanyalah sidik jarinya. Pihak mana pun yang memperoleh dokumen simpulan dapat menghitung ulang *hash*-nya dan membandingkannya terhadap nilai pada *event* transaksi untuk membuktikan bahwa dokumen tersebut tidak berubah sejak disahkan.

Token yang diterbitkan bersifat *non-transferable*, sehingga tidak dapat dipindahkan antar-alamat dan tetap melekat pada dosen yang bersangkutan sebagai kredensial kinerja. Prioritas fitur ini Tinggi karena merupakan luaran akhir sistem, dengan aktor terkait *Smart Contract* Token SKS dan Sistem. Fitur ini merealisasikan proses P9 pada bagian simpulan dan penerbitan.

2. #### **Urutan Stimulus**

Tabel III.19. Urutan Stimulus dan Respons TOK

| No. | Stimulus | Respons |
| ----- | ----- | ----- |
| 1\. | Asesor pertama mengesahkan penilaiannya, asesor kedua belum. | Sistem mencatat pengesahan tersebut dan menghentikan proses tanpa membentuk simpulan maupun menerbitkan token. |
| 2\. | Asesor kedua mengesahkan penilaiannya. | Sistem merata-ratakan nilai kedua asesor pada setiap kegiatan, menjumlahkannya menjadi total kredit, dan menetapkan status memenuhi atau tidak memenuhi. |
| 3\. | Simpulan terbentuk. | Sistem menghitung *hash* kriptografi atas muatan simpulan, menyimpan simpulan beserta *hash* tersebut, dan menandai dokumen BKD berstatus final sehingga terkunci dari perubahan. |
| 4\. | Simpulan siap dicatatkan *on-chain*. | Sistem mengubah total kredit menjadi satuan token, lalu memanggil fungsi penerbitan pada kontrak token dengan alamat *wallet* dosen sebagai tujuan dan *hash* simpulan sebagai referensi. |
| 5\. | Transaksi penerbitan berhasil. | Sistem menyimpan *transaction hash* pada simpulan dan mencatat riwayat transaksi berstatus berhasil. |
| 6\. | Transaksi penerbitan gagal karena jaringan tidak dapat dijangkau. | Sistem mencatat riwayat transaksi berstatus gagal, mempertahankan simpulan yang telah tersimpan, dan mengizinkan penerbitan diulang tanpa menilai ulang seluruh kegiatan. |
| 7\. | Pihak eksternal mencoba memindahkan token antar-alamat. | Kontrak token menolak seluruh pemindahan, termasuk pemindahan atas persetujuan pihak ketiga. |

3. #### **Functional Requirement Terkait**

Tabel III.20. *Functional Requirement* TOK

| No. | ID | Deskripsi | Sumber |
| :---: | ----- | ----- | :---: |
| 1\. | FR-22 | Sistem harus membentuk simpulan BKD berupa total kredit beserta status memenuhi atau tidak memenuhi setelah kedua asesor mengesahkan, dengan nilai per kegiatan dihitung dari perataan nilai kedua asesor. | P9 / PSPEC-12 |
| 2\. | FR-23 | Sistem harus menghitung *hash* kriptografi atas muatan simpulan penilaian dan menggunakannya sebagai referensi transaksi penerbitan token. | P9 / PSPEC-12 |
| 3\. | FR-24 | Sistem harus menerbitkan token kredit SKS yang bersifat *non-transferable* ke alamat *wallet* dosen dan mencatat *transaction hash* beserta status transaksinya, baik ketika berhasil maupun gagal. | P9 / PSPEC-13, PSPEC-14 |

11. ### **Koreksi Token dan Pelaporan (LAP)** {#pelaporan-dan-penelusuran-lap}

Fitur Koreksi Token dan Pelaporan menyediakan mekanisme perbaikan atas kredit yang telah diterbitkan serta penyajian rekapitulasi dan riwayat transaksi *on-chain*.

1. #### **Pendahuluan**

Fitur ini menyediakan dua kelompok layanan. Kelompok pertama adalah koreksi token, yaitu penghapusan sebagian atau seluruh token pada alamat *wallet* dosen disertai alasan koreksi, yang digunakan apabila ditemukan kesalahan parameter atau dilakukan peninjauan ulang hasil penilaian. Karena catatan pada *blockchain* tidak dapat dihapus, koreksi diwujudkan sebagai transaksi baru yang mengurangi saldo, bukan sebagai penghapusan catatan lama.

Kelompok kedua adalah pelaporan, yaitu penyajian riwayat penerbitan dan penghapusan token yang dibaca langsung dari *blockchain*, serta rekapitulasi kredit per dosen dan per periode. Riwayat *event* sengaja dibaca dari jaringan alih-alih dari basis data agar tampilan merupakan cerminan keadaan *on-chain* yang sesungguhnya, sehingga selisih antara catatan basis data dan catatan *blockchain* dapat terlihat. Prioritas fitur ini Sedang karena tidak menghalangi alur utama penilaian, namun menjadi penopang klaim keterauditan sistem. Aktor terkait adalah Administrator, *Smart Contract* Token SKS, dan Sistem. Fitur ini merealisasikan proses P10.

2. #### **Urutan Stimulus**

Tabel III.21. Urutan Stimulus dan Respons LAP

| No. | Stimulus | Respons |
| ----- | ----- | ----- |
| 1\. | Administrator membuka halaman operasi token. | Sistem menampilkan riwayat transaksi beserta statusnya dan daftar dosen beserta saldo token yang dibaca dari *blockchain*. |
| 2\. | Titik akhir RPC tidak dapat dijangkau saat halaman dibuka. | Sistem tetap menampilkan riwayat dari basis data dan mengosongkan kolom saldo tanpa menghentikan halaman. |
| 3\. | Administrator mengisi jumlah token yang dikoreksi beserta alasannya, lalu mengonfirmasi melalui dialog. | Sistem memanggil fungsi penghapusan pada kontrak token dan mencatat riwayat transaksi beserta statusnya. |
| 4\. | Administrator membuka halaman log *blockchain*. | Sistem membaca *event* penerbitan dan penghapusan dari jaringan secara berjenjang dengan batas rentang blok, lalu menampilkannya beserta alamat, jumlah, dan referensinya. |
| 5\. | Riwayat memuat transaksi yang tercatat pada skala jumlah token yang berbeda. | Sistem membedakan skala tersebut melalui ambang batas nilai sehingga seluruh riwayat tetap terbaca konsisten. |
| 6\. | Administrator membuka halaman rekapitulasi. | Sistem mengagregasi kredit per dosen dan per periode dari basis data dan menampilkannya dalam bentuk tabel. |
| 7\. | Dosen membuka rekapitulasi miliknya sendiri. | Sistem menampilkan capaian kredit dosen tersebut beserta status simpulan pada setiap periode. |

3. #### **Functional Requirement Terkait**

Tabel III.22. *Functional Requirement* LAP

| No. | ID | Deskripsi | Sumber |
| :---: | ----- | ----- | :---: |
| 1\. | FR-25 | Sistem harus dapat menghapus token pada alamat *wallet* dosen disertai alasan koreksi, dan mencatat riwayat transaksinya baik ketika berhasil maupun gagal. | P10 / PSPEC-13, PSPEC-14 |
| 2\. | FR-26 | Sistem harus menampilkan riwayat penerbitan dan penghapusan token yang dibaca langsung dari *blockchain*, dengan pembacaan berjenjang agar tidak melampaui batas rentang blok penyedia RPC. | P10 / PSPEC-15 |
| 3\. | FR-27 | Sistem harus menampilkan rekapitulasi kredit BKD per dosen dan per periode. | P10 / PSPEC-15 |

12. ### **Verifikasi Keaslian Dokumen Bukti (VER)** {#verifikasi-keaslian-dokumen-bukti-ver}

Fitur Verifikasi Keaslian Dokumen Bukti memeriksa apakah dokumen bukti yang diunggah dosen benar-benar memuat nama pemilik akun beserta peran yang diklaim pada kegiatan, sehingga bukti pembimbingan tidak dapat dipenuhi dengan dokumen milik dosen lain.

1. #### **Pendahuluan**

Fitur ini menjawab celah yang tersisa setelah parameter kegiatan bersumber dari dokumen penugasan resmi. Parameter memang tidak lagi diketikkan dosen, namun dokumen bukti yang dilampirkan pada kegiatan tetap merupakan berkas yang dipilih sendiri oleh dosen. Tanpa pemeriksaan, satu lembar pengesahan yang sama dapat dilampirkan beberapa dosen, dan seorang dosen yang berperan sebagai pembimbing pendamping dapat melampirkan dokumen yang menuliskan namanya sebagai pembimbing utama. Fitur ini membaca isi dokumen melalui parser artefak universal, kemudian mencocokkan nama dan peran yang terbaca terhadap nama pemilik akun dan peran yang menjadi parameter kegiatan.

Pemeriksaan berjalan pada dua titik pemicu. Titik pertama bersifat otomatis, yaitu segera setelah dosen mengunggah dokumen bukti pada kegiatan yang kode aturannya termasuk rumpun pembimbingan. Titik kedua bersifat atas permintaan asesor, yang diperlukan bagi dokumen yang diunggah sebelum mekanisme otomatis tersedia dan bagi dokumen yang pemeriksaan otomatisnya gagal karena layanan ekstraksi tidak dapat dihubungi. Penguji peran pada titik kedua mencakup pula butir pengujian tugas akhir, sehingga asesor dapat memeriksa dokumen di luar rumpun pembimbingan apabila diperlukan.

Dua sifat fitur ini bersifat mengikat. Pertama, pemeriksaan tidak pernah menggagalkan pengunggahan. Kegagalan layanan ditangkap dan disimpan sebagai status gagal beserta pesan penyebabnya, sedangkan dokumen tetap tersimpan. Kedua, hasil pemeriksaan bersifat temuan bagi asesor, bukan penentu diterima atau ditolaknya bukti. Asesor tetap memegang keputusan akhir dan dapat menyetujui hasil pemeriksaan secara manual tanpa menghapus hasil pembacaan parser. Prioritas fitur ini Sedang karena tidak menghalangi alur utama penilaian, namun menopang keandalan bukti yang menjadi dasar penilaian. Aktor terkait adalah Dosen, Asesor, Layanan Model Bahasa Visual, dan Sistem. Fitur ini merealisasikan proses P11.

2. #### **Urutan Stimulus**

Tabel III.23 menjabarkan urutan interaksi pada fitur Verifikasi Keaslian Dokumen Bukti.

Tabel III.23. Urutan Stimulus dan Respons VER

| No. | Stimulus | Respons |
| ----- | ----- | ----- |
| **Pemeriksaan Otomatis** |  |  |
| 1\. | Dosen mengunggah berkas PDF sebagai bukti pada kegiatan rumpun pembimbingan. | Sistem menyimpan dokumen, mengirimkan berkas ke parser artefak universal, mencocokkan nama dan peran yang terbaca terhadap akun pengunggah, lalu menyimpan hasilnya menyertai dokumen. |
| 2\. | Nama pemilik akun ditemukan pada dokumen dan perannya tidak bertentangan. | Sistem menetapkan status cocok dan menampilkan keterangan singkat bahwa nama dosen terverifikasi pada dokumen. |
| 3\. | Nama pemilik akun ditemukan, tetapi peran yang tertulis pada dokumen bertentangan dengan peran yang diklaim kegiatan. | Sistem menetapkan status peran tidak sesuai beserta peran yang diklaim dan peran yang tertulis, lalu menampilkannya sebagai peringatan kepada dosen. |
| 4\. | Tidak satu pun nama pada dokumen bersesuaian dengan pemilik akun. | Sistem menetapkan status tidak cocok dan menampilkan peringatan bahwa nama dosen tidak ditemukan pada dokumen. |
| 5\. | Parser tidak menemukan nama orang pada dokumen. | Sistem menetapkan status tanpa nama, yaitu pemeriksaan tidak dapat menyimpulkan apa pun, bukan indikasi ketidaksesuaian. |
| 6\. | Layanan ekstraksi tidak dapat dihubungi atau melampaui batas waktu. | Sistem tetap menyimpan dokumen, menetapkan status gagal beserta pesan penyebabnya, dan tidak membatalkan pengunggahan. |
| 7\. | Dosen mengunggah bukti berupa tautan luar, berkas bukan PDF, atau bukti pada kegiatan di luar rumpun pembimbingan. | Sistem menyimpan dokumen tanpa hasil pemeriksaan, karena dokumen tersebut tidak memenuhi syarat pemeriksaan. |
| **Peninjauan oleh Asesor** |  |  |
| 8\. | Asesor membuka halaman penilaian suatu dokumen BKD. | Sistem menampilkan kegiatan yang dokumen buktinya berstatus tidak cocok atau peran tidak sesuai sebagai temuan, kecuali dokumen yang telah disetujui manual. |
| 9\. | Asesor membuka halaman bukti suatu kegiatan. | Sistem menampilkan panel rincian berisi seluruh nama yang terbaca beserta peran menurut dokumen, jenis dokumen menurut parser, dan waktu pemeriksaan. |
| 10\. | Asesor menekan aksi pemeriksaan pada satu dokumen bukti. | Sistem menjalankan pemeriksaan atas dokumen tersebut dan menimpa hasil sebelumnya dengan hasil yang baru. |
| 11\. | Asesor menekan aksi pemeriksaan atas dokumen yang tidak memenuhi syarat. | Sistem menolak aksi tersebut dan menyatakan bahwa dokumen bukan berkas PDF unggahan lokal atau layanan parser belum aktif. |
| 12\. | Asesor menilai pembacaan parser keliru lalu menyetujui hasil pemeriksaan secara manual. | Sistem menambahkan penanda persetujuan berisi identitas asesor dan waktunya ke dalam hasil pemeriksaan, sehingga penanda ketidaksesuaian tidak lagi dihitung sebagai temuan, sedangkan hasil pembacaan parser tetap tersimpan. |
| 13\. | Asesor mencabut persetujuan manual yang telah diberikan. | Sistem menghapus penanda persetujuan tersebut sehingga penanda ketidaksesuaian berlaku kembali. |

3. #### **Functional Requirement Terkait**

Tabel III.24. *Functional Requirement* VER

| No. | ID | Deskripsi | Sumber |
| :---: | ----- | ----- | :---: |
| 1\. | FR-28 | Sistem harus memeriksa dokumen bukti berformat PDF pada kegiatan rumpun pembimbingan dengan membaca nama orang beserta perannya melalui parser artefak universal, mencocokkannya terhadap nama pemilik akun dan peran yang diklaim kegiatan, lalu menyimpan hasilnya menyertai dokumen tanpa menggagalkan pengunggahan ketika layanan tidak tersedia. | P11 / PSPEC-16, PSPEC-17, PSPEC-18 |
| 2\. | FR-29 | Sistem harus menandai kegiatan yang dokumen buktinya berstatus tidak cocok atau peran tidak sesuai sebagai temuan pada halaman penilaian asesor, dan tidak menandai status yang tidak menyimpulkan apa pun, yaitu tanpa nama dan gagal. | P11 / PSPEC-18 |
| 3\. | FR-30 | Sistem harus menyediakan pemeriksaan ulang atas satu dokumen bukti bagi asesor, serta persetujuan dan pencabutan persetujuan atas hasil pemeriksaan, tanpa menghapus hasil pemeriksaan asli. | P11 / PSPEC-19 |

3. ## **Performance Requirements** {#performance-requirements}

Persyaratan performa disusun dengan mempertimbangkan bahwa sebagian operasi sistem bergantung pada layanan pihak ketiga yang waktu tanggapannya tidak sepenuhnya berada dalam kendali tim pengembang, yaitu jaringan *blockchain* dan layanan model bahasa visual. Oleh karena itu, ambang waktu dibedakan antara operasi yang sepenuhnya lokal dan operasi yang melibatkan layanan eksternal.

Tabel III.25. *Non-Functional Requirement* — *Performance*

| ID | Persyaratan | NFR Terkait |
| :---: | ----- | :---: |
| PR-01 | Waktu tanggapan untuk operasi yang sepenuhnya diproses pada peladen dan basis data, seperti penyimpanan kegiatan tanpa perhitungan, pemuatan daftar, dan penyimpanan penilaian, tidak melebihi 2 detik pada kondisi jaringan normal. | — |
| PR-02 | Waktu tanggapan untuk operasi yang melibatkan pemanggilan baca ke kontrak kalkulator tidak melebihi 5 detik, mengingat pemanggilan tersebut melintasi titik akhir RPC publik. | — |
| PR-03 | Operasi penerbitan dan penghapusan token tidak diberi ambang waktu tanggapan sinkron, karena waktu konfirmasi blok berada di luar kendali sistem. Sistem harus menyelesaikan penyimpanan simpulan terlebih dahulu, kemudian mencatat hasil transaksi setelah konfirmasi diterima. | NFR-03 |
| PR-04 | Proses ekstraksi satu berkas dokumen penugasan melalui jalur deterministik tidak melebihi 30 detik untuk dokumen dengan jumlah baris hingga 150 baris. | — |
| PR-05 | Proses ekstraksi satu berkas dokumen pindaian melalui jalur model bahasa visual diberi batas waktu yang dapat dikonfigurasi, dan kegagalan akibat pelampauan batas waktu harus dikembalikan sebagai pesan galat yang dapat dibedakan penyebabnya, bukan sebagai kegagalan diam. | — |
| PR-06 | Pembacaan riwayat *event* dari *blockchain* harus dijalankan secara berjenjang dengan batas rentang blok sehingga tidak menghasilkan galat penolakan dari penyedia RPC, berapa pun jarak antara blok penempatan kontrak dan blok terkini. | NFR-12 |
| PR-07 | Halaman yang berpotensi menampilkan lebih dari dua puluh baris data harus menerapkan paginasi sehingga jumlah baris yang dimuat sekaligus tetap terbatas. | — |
| PR-08 | Pemeriksaan keaslian satu dokumen bukti tunduk pada batas waktu yang sama dengan jalur ekstraksi model bahasa visual dan dijalankan menyatu dengan aksi pengunggahan, sehingga pelampauan batas waktu dikembalikan sebagai hasil pemeriksaan berstatus gagal tanpa membatalkan penyimpanan dokumen. | NFR-13 |

4. ## **Logical Database Requirements** {#logical-database-requirements}

Sistem harus menggunakan basis data relasional yang mendukung transaksi ACID untuk menjamin konsistensi data. Spesifikasi teknis implementasi basis data ditetapkan pada subbab III.5. Setiap entitas menggunakan kunci primer bertipe UUID yang dibangkitkan basis data, bukan bilangan berurut, agar pengenal baris tidak mengungkapkan jumlah maupun urutan data kepada pihak yang mengaksesnya melalui alamat halaman. Penamaan tabel dan kolom mengikuti gaya *snake_case*.

Entitas utama beserta atribut kuncinya dirangkum pada Tabel III.26. Setiap entitas berkorespondensi dengan satu penyimpanan data pada *Data Flow Diagram* sebagaimana dirujuk pada kolom Kode.

Tabel III.26. Entitas Basis Data Logis

| Kode | Entitas | Atribut Kunci | Keterangan dan Relasi |
| :---: | ----- | ----- | ----- |
| D1 | pengguna | id\_pengguna, nama, email, password\_hash, peran, aktif, alamat\_wallet, wallet\_index, nip, nidn, kode\_dosen, nira, kelompok\_bidang | Akun untuk ketiga peran, dibedakan melalui atribut peran. Atribut wallet\_index wajib unik. Memiliki banyak dokumen BKD, penugasan asesor, riwayat transaksi, dan unggahan dokumen. |
| D2 | periode\_bkd | id\_periode, nama\_periode, tahun\_ajaran, semester, rentang tanggal ketiga fase, fase\_override, status | Periode penilaian beserta rentang fase. Hanya satu periode boleh berstatus aktif. Memiliki banyak dokumen BKD dan unggahan dokumen. |
| D3 | lkd | id\_lkd, id\_pengguna, id\_periode, jenis, status, simpan\_permanen | Dokumen BKD per dosen per periode per jenis. Kombinasi ketiganya wajib unik. Memiliki banyak kegiatan dan penugasan asesor, serta satu simpulan. |
| D4 | penugasan\_asesor | id\_penugasan, id\_lkd, id\_asesor, urutan, disahkan, tanggal\_pengesahan | Penugasan asesor pada suatu dokumen BKD. Pasangan dokumen dan urutan wajib unik, demikian pula pasangan dokumen dan asesor. |
| D5 | referensi\_kegiatan | id\_referensi, kode\_rule, kategori, nama\_kegiatan, fungsi\_contract, skema\_parameter, sks\_maksimal\_x100 | Data acuan butir aturan PO BKD. Atribut kode\_rule wajib unik. Atribut fungsi\_contract bernilai kosong untuk butir yang tidak diotomatisasi. |
| D6 | unggahan\_dokumen | id\_unggahan, id\_periode, id\_admin, jenis, nama\_file, sha256, nomor\_surat, status, hasil\_parse, ringkasan, koreksi, statistik penerapan | Berkas SK dan ST beserta keluaran utuh parser sebagai bukti audit dan selisih koreksi administrator yang disimpan terpisah. |
| D7 | kegiatan | id\_kegiatan, id\_lkd, id\_referensi, judul, detail\_kegiatan, parameter, sks\_dihitung\_x100, status\_perhitungan, status, status\_capaian, diklaim, sumber\_data, id\_unggahan | Kegiatan yang dilaporkan dosen. Relasi menuju unggahan dokumen bersifat opsional sebagai jejak asal data. |
| D8 | dokumen\_kegiatan | id\_dokumen, id\_kegiatan, nama\_dokumen, nama\_file, jenis\_file, jenis\_dokumen, file\_url, verifikasi | Metadata dokumen bukti. Satu kegiatan dapat memiliki lebih dari satu dokumen. Berkas fisik disimpan di luar basis data. Atribut verifikasi bertipe JSONB menampung hasil pemeriksaan keaslian dokumen beserta penanda persetujuan asesor, dan bernilai kosong bagi dokumen yang tidak memenuhi syarat pemeriksaan. |
| D9 | hasil\_penilaian | id\_hasil, id\_kegiatan, id\_penugasan, sks\_disetujui\_x100, pertemuan\_keputusan, capaian\_persen, status, catatan | Penilaian satu kegiatan oleh satu asesor. Pasangan kegiatan dan penugasan wajib unik. |
| D10 | simpulan\_bkd | id\_simpulan, id\_lkd, total per unsur, status\_kewajiban\_khusus, status\_final, hash\_penilaian, tx\_hash | Simpulan satu dokumen BKD. Berelasi satu ke satu terhadap dokumen BKD. |
| D11 | riwayat\_transaksi | id\_transaksi, id\_hasil, id\_admin, jenis\_transaksi, contract\_address, tx\_hash, jumlah\_token\_x100, alamat\_wallet, reference\_id, alasan, status | Riwayat transaksi *on-chain*. Atribut tx\_hash wajib unik. Dicatat baik ketika transaksi berhasil maupun gagal. |

Nilai berhingga pada atribut status dan jenis harus dimodelkan sebagai tipe enumerasi, bukan sebagai teks bebas, agar tidak dapat terisi di luar himpunan yang dirancang. Daftar tipe enumerasi disajikan pada Tabel III.27.

Tabel III.27. Tipe Enumerasi Basis Data

| No. | Nama Enumerasi | Nilai |
| :---: | ----- | ----- |
| 1\. | peran\_pengguna | dosen, asesor, admin |
| 2\. | status\_periode | aktif, nonaktif |
| 3\. | fase\_bkd | pengisian, penilaian, perbaikan, selesai |
| 4\. | jenis\_lkd | rencana, laporan |
| 5\. | status\_lkd | draft, diajukan, dinilai, final |
| 6\. | status\_kegiatan | draft, diajukan, dihitung, disetujui, ditolak, revisi |
| 7\. | status\_capaian | selesai, gagal, beban\_lebih |
| 8\. | status\_perhitungan | berhasil, gagal, tidak\_diotomatisasi |
| 9\. | status\_penilaian | disetujui, ditolak, revisi |
| 10\. | status\_simpulan | M, TM |
| 11\. | jenis\_transaksi | mint, burn |
| 12\. | status\_transaksi | pending, success, failed |
| 13\. | jenis\_unggahan | st\_pengajaran, st\_bimbingan, st\_pengujian, sk\_pembinaan, artefak |
| 14\. | status\_unggahan | terparse, gagal, diterapkan |

Catatan integritas dan retensi data:

1. Penghapusan entitas yang menjadi rujukan riwayat penilaian dibatasi, sehingga kegiatan yang telah dinilai maupun penugasan asesor yang telah mengesahkan tidak dapat dihapus begitu saja.
2. Penghapusan unggahan dokumen tidak menghapus kegiatan yang telah dibentuk darinya, melainkan hanya mengosongkan jejak asal datanya.
3. Kata sandi wajib disimpan hanya dalam bentuk *hash*, tidak pernah dalam bentuk asli.
4. Data yang telah dicatatkan pada *blockchain* tidak dapat dihapus maupun diubah, sehingga koreksi diwujudkan sebagai transaksi baru, bukan sebagai penghapusan catatan lama.
5. Hasil pemeriksaan keaslian dokumen bukti hanya boleh ditimpa oleh pemeriksaan ulang atas dokumen yang sama. Persetujuan manual asesor ditambahkan sebagai blok tersendiri di dalam muatan yang sama dan tidak boleh menghapus hasil pembacaan parser.

5. ## **Design Constraints** {#design-constraints}

*Design Constraints* merupakan batasan perancangan yang ditetapkan tim pengembang sebagai respons terhadap batasan sisi klien pada subbab II.4 maupun kebutuhan data pada subbab III.4, sehingga keterkaitan antara keputusan eksternal dan keputusan perancangan menjadi eksplisit.

Tabel III.28. *Design Constraints*

| ID | Batasan Desain | Diturunkan dari |
| :---: | ----- | ----- |
| **DC-01** | Aturan perhitungan diimplementasikan sebagai kumpulan fungsi terpisah pada *smart contract*, dengan satu butir aturan atau satu kelompok aturan berpola sama diwakili satu fungsi mandiri, agar setiap butir dapat ditelusuri dan diuji secara terpisah. | CON-01 |
| **DC-02** | Butir aturan yang nilainya merupakan batas maksimum tidak dipetakan ke fungsi kontrak, melainkan ditandai sebagai kegiatan yang penilaiannya tidak diotomatisasi. | CON-01 |
| **DC-03** | Nilai kredit direpresentasikan sebagai bilangan bulat pada skala kali seratus di seluruh lapisan internal, dan hanya diubah menjadi satuan SKS berdesimal pada saat ditampilkan. | CON-01 |
| **DC-04** | Struktur data penilaian dirancang menampung dua penilaian berbeda atas kegiatan yang sama, dan penerbitan token dikondisikan pada pengesahan kedua asesor. | CON-02 |
| **DC-05** | Kata sandi disimpan dalam bentuk *hash* bcrypt, dan seluruh nilai rahasia dimuat dari variabel lingkungan peladen tanpa pernah dikirimkan ke peramban. | CON-03 |
| **DC-06** | Isi penilaian disimpan *off-chain* pada basis data institusi, sedangkan yang dicatatkan *on-chain* hanya jumlah token beserta *hash* simpulan, sehingga data pribadi dosen tidak dipublikasikan pada jaringan publik. | CON-03 |
| **DC-07** | Sistem menyediakan dua jalur ekstraksi dokumen, yaitu jalur deterministik berbasis posisi kolom bagi dokumen digital dan jalur penafsiran citra bagi dokumen pindaian. | CON-04 |
| **DC-08** | Pembacaan tabel lampiran dilakukan berdasarkan garis bingkai tabel, bukan koordinat tetap, agar perbedaan lebar kolom antar-program studi tidak menyebabkan kegagalan ekstraksi. | CON-05 |
| **DC-09** | Alamat *wallet* dosen diturunkan secara deterministik dari satu frasa induk pada peladen, dan seluruh operasi *on-chain* ditandatangani peladen, sehingga dosen dan asesor tidak perlu memiliki dompet kripto. | CON-06 |
| **DC-10** | Alamat kedua kontrak diperlakukan sebagai konfigurasi lingkungan, bukan sebagai nilai yang ditulis di dalam kode, sehingga penempatan ulang kontrak tidak menuntut perubahan kode aplikasi. | CON-07 |
| **DC-11** | Pembacaan riwayat *event* dilakukan secara berjenjang dengan memecah rentang penelusuran menjadi potongan berukuran tetap. | CON-08 |
| **DC-12** | Hasil ekstraksi jalur model bahasa visual tidak diperlakukan sebagai sumber kebenaran tunggal, melainkan wajib melalui tahap koreksi administrator sebelum diterapkan, dengan keluaran asli disimpan terpisah dari koreksi sebagai bukti audit. | CON-09 |
| **DC-13** | Seluruh antarmuka dan pesan sistem disajikan dalam Bahasa Indonesia. | CON-10 |
| **DC-14** | Sistem menggunakan PostgreSQL sebagai basis data relasional yang diakses melalui Prisma ORM dengan satu berkas skema sebagai sumber kebenaran tunggal dan migrasi terversi, atas dasar dukungan ACID dan kebutuhan relasi antartabel yang kompleks. | Subbab III.4 |
| **DC-15** | Pemodelan kebutuhan dan perancangan menggunakan pendekatan analisis dan perancangan terstruktur, dengan artefak berupa diagram konteks, *Data Flow Diagram* berjenjang, kamus data, spesifikasi proses, dan *structure chart*. | Karakteristik logika inti sistem yang bersifat prosedural dan deterministik |
| **DC-16** | Pengembangan dan dokumentasi mengacu pada standar IEEE Std 830-1998 dan ISO/IEC 25010. | CON-01, CON-03 |

6. ## **Software System Attributes** {#software-system-attributes}

Subbab ini menetapkan atribut kualitas perangkat lunak beserta kriteria dan cara verifikasinya, mengacu pada model kualitas produk ISO/IEC 25010. Kolom NFR menautkan setiap kriteria ke pengidentifikasi persyaratan nonfungsional yang digunakan pada Tabel IV.11 Laporan Tugas Akhir.

1. ### **Functional Suitability** {#functional-suitability}

Kesesuaian fungsional mengacu pada kemampuan sistem menyediakan fungsi yang memenuhi kebutuhan yang dinyatakan. Pada sistem ini, kesesuaian fungsional bersifat kritis karena keluaran utama sistem berupa nilai kredit yang akan menjadi dasar penilaian kinerja dosen. Berbeda dengan sistem yang keluarannya bersifat perkiraan, nilai kredit BKD memiliki jawaban benar tunggal yang dapat dihitung manual dari rubrik, sehingga penyimpangan sekecil apa pun menandakan cacat logika.

Tabel III.29. *Non-Functional Requirement* — *Functional Suitability*

| ID | Kriteria Kualitas | Deskripsi | Cara Verifikasi | NFR |
| ----- | ----- | ----- | ----- | :---: |
| SA-FUN-01 | *Functional correctness* | Nilai kredit yang dihasilkan sistem identik dengan hasil perhitungan manual berdasarkan rubrik PO BKD 2021 untuk seluruh butir aturan yang diotomatisasi. | Uji akurasi perhitungan dengan pembandingan terhadap perhitungan manual | NFR-01 |
| SA-FUN-02 | *Functional completeness* | Seluruh butir aturan pada rubrik unsur pendidikan tersedia pada data referensi, baik yang diotomatisasi maupun yang penilaiannya diserahkan kepada asesor. | Pemeriksaan kelengkapan data referensi terhadap rubrik | — |
| SA-FUN-03 | *Functional appropriateness* | Hasil pemeriksaan keaslian dokumen bukti tidak menjadi penentu tunggal diterima atau ditolaknya suatu bukti. Sistem tidak menolak unggahan berdasarkan hasil pemeriksaan, dan asesor dapat menyetujui hasil pemeriksaan secara manual dengan hasil pembacaan parser tetap tersimpan. | Uji alur persetujuan manual asesor beserta pemeriksaan muatan hasil pemeriksaan setelahnya | NFR-14 |

2. ### **Reliability** {#reliability}

Keandalan mengacu pada kemampuan sistem beroperasi dengan benar dan konsisten selama periode penggunaan normal. Pada sistem ini, keandalan paling kritis pada dua titik, yaitu konsistensi hasil perhitungan yang menjadi alasan utama pemilihan *smart contract*, dan ketahanan terhadap kegagalan jaringan pada saat penerbitan token.

Tabel III.30. *Non-Functional Requirement* — *Reliability*

| ID | Kriteria Kualitas | Deskripsi | Cara Verifikasi | NFR |
| ----- | ----- | ----- | ----- | :---: |
| SA-REL-01 | *Maturity* | Hasil perhitungan untuk parameter yang sama konsisten pada pemanggilan berulang dan lintas waktu, tanpa dipengaruhi pengguna yang memanggil. | Pemanggilan berulang fungsi perhitungan dengan parameter identik | NFR-02 |
| SA-REL-02 | *Fault tolerance* | Kegagalan pemanggilan *blockchain* tidak menghilangkan data operasional yang telah tersimpan; kegagalan dicatat sebagai transaksi berstatus gagal dan operasi dapat diulang. | Uji fungsional dengan titik akhir RPC dinonaktifkan | NFR-03 |
| SA-REL-03 | *Fault tolerance* | Kegagalan layanan ekstraksi tidak menghentikan operasi sistem lain, dan penyebab kegagalan dikembalikan sebagai pesan yang dapat dibedakan. | Uji fungsional dengan layanan ekstraksi dinonaktifkan | — |
| SA-REL-04 | *Fault tolerance* | Kegagalan maupun ketidaktersediaan layanan pemeriksaan dokumen bukti tidak menggagalkan pengunggahan dokumen oleh dosen; dokumen tetap tersimpan dengan hasil pemeriksaan berstatus gagal beserta pesan penyebabnya, dan pemeriksaan dapat diulang tanpa mengunggah ulang berkas. | Uji unggah dokumen bukti dengan layanan ekstraksi dinonaktifkan | NFR-13 |

3. ### **Availability** {#availability}

Ketersediaan mengacu pada proporsi waktu sistem dapat digunakan sebagaimana mestinya. Karena sistem ini dioperasikan pada rentang waktu penilaian yang terjadwal dan bukan sepanjang waktu, ketersediaan diukur pada masa periode aktif berjalan, bukan sebagai ketersediaan sepanjang tahun.

Tabel III.31. *Non-Functional Requirement* — *Availability*

| ID | Kriteria Kualitas | Deskripsi | Cara Verifikasi | NFR |
| ----- | ----- | ----- | ----- | :---: |
| SA-AVL-01 | *Availability* | Aplikasi web dan basis data tersedia selama rentang fase pengisian, penilaian, dan perbaikan pada periode aktif. | Pemantauan ketersediaan layanan selama periode aktif | — |
| SA-AVL-02 | *Graceful degradation* | Fungsi yang tidak bergantung pada jaringan *blockchain*, yaitu pengisian kegiatan, unggah dokumen bukti, dan penelusuran rekapitulasi, tetap dapat dijalankan ketika titik akhir RPC tidak dapat dijangkau. | Uji fungsional dengan titik akhir RPC dinonaktifkan | — |

4. ### **Security** {#security}

Keamanan mencakup perlindungan terhadap akses tidak sah, kerahasiaan data, dan integritas informasi. Sistem ini menangani data pribadi dosen dan hasil penilaian kinerja, serta memegang kunci privat yang berwenang menerbitkan kredit, sehingga keamanan menjadi atribut yang tidak dapat dikompromikan.

Tabel III.32. *Non-Functional Requirement* — *Security*

| ID | Kriteria Kualitas | Deskripsi | Cara Verifikasi | NFR |
| ----- | ----- | ----- | ----- | :---: |
| SA-SEC-01 | *Confidentiality* | Kata sandi disimpan hanya dalam bentuk *hash* bcrypt, sehingga isi basis data tidak dapat dimanfaatkan untuk memulihkan kredensial. | Inspeksi kolom kata sandi pada basis data | NFR-04 |
| SA-SEC-02 | *Confidentiality* | Kunci privat penandatangan dan frasa induk *wallet* hanya dibaca dari variabel lingkungan peladen dan tidak pernah muncul pada berkas yang dikirimkan ke peramban. | Inspeksi berkas keluaran *build* dan lalu lintas jaringan | NFR-04 |
| SA-SEC-03 | *Authenticity* | Setiap akses halaman terlindungi disertai sesi yang sah, dan permintaan dengan peran tidak sesuai diarahkan ke ruang kerja perannya sendiri. | Uji akses lintas peran dan akses tanpa sesi | NFR-05 |
| SA-SEC-04 | *Integrity* | Hasil penilaian yang telah disahkan dapat dibuktikan keasliannya melalui penghitungan ulang *hash* simpulan dan pembandingannya terhadap referensi pada *event* transaksi. | Penghitungan ulang *hash* atas dokumen simpulan | NFR-06 |
| SA-SEC-05 | *Integrity* | Penerbitan token hanya dapat dilakukan alamat pemegang peran penerbit, dan penghapusan token hanya oleh alamat pemegang peran administrator kontrak. | Uji pemanggilan fungsi kontrak oleh alamat tanpa peran | NFR-06 |
| SA-SEC-06 | *Integrity* | Token tidak dapat dipindahkan antar-alamat melalui jalur mana pun yang disediakan standar ERC-20. | Uji pemindahan token antar-alamat | NFR-06 |
| SA-SEC-07 | *Confidentiality* | Seluruh komunikasi antara peramban dan peladen berlangsung melalui HTTPS. | Analisis lalu lintas jaringan | — |

5. ### **Maintainability** {#maintainability}

Pemeliharaan mengacu pada kemampuan sistem dimodifikasi, diperbaiki, dan dikembangkan secara efisien. Pada sistem ini, keterpeliharaan memiliki dimensi tambahan yang tidak dimiliki sistem konvensional, yaitu bahwa lapisan *on-chain* tidak dapat dimutakhirkan di tempat, sehingga keterlacakan antara butir aturan dan kode menjadi prasyarat agar penempatan ulang kontrak dapat dilakukan dengan risiko terkendali.

Tabel III.33. *Non-Functional Requirement* — *Maintainability*

| ID | Kriteria Kualitas | Deskripsi | Cara Verifikasi | NFR |
| ----- | ----- | ----- | ----- | :---: |
| SA-MNT-01 | *Modularity* | Setiap butir aturan PO BKD terwujud sebagai satu fungsi mandiri yang dapat ditelusuri ke butir aturannya melalui data referensi. | Pemeriksaan pemetaan kode aturan terhadap nama fungsi kontrak | NFR-07 |
| SA-MNT-02 | *Modularity* | Seluruh akses menuju jaringan *blockchain* dipusatkan pada satu modul integrasi, sehingga perubahan konfigurasi jaringan tidak tersebar pada banyak berkas. | Analisis ketergantungan antarmodul | NFR-07 |
| SA-MNT-03 | *Testability* | Fungsi perhitungan dapat diuji secara terisolasi pada jaringan simulasi lokal tanpa memerlukan basis data maupun antarmuka. | Eksekusi pengujian unit pada jaringan simulasi | NFR-08 |
| SA-MNT-04 | *Modifiability* | Struktur menu kategori, susunan kolom tabel, dan pembagian seksi dokumen BKD didefinisikan sebagai konfigurasi terpisah dari kode halaman. | Peninjauan berkas konfigurasi terhadap kode halaman | — |

6. ### **Usability** {#usability}

Kegunaan mengacu pada kemudahan pengguna mencapai tujuannya. Karena pengguna utama sistem tidak memiliki latar belakang teknologi *blockchain*, tolok ukur utama kegunaan pada sistem ini adalah sejauh mana kompleksitas teknis berhasil disembunyikan.

Tabel III.34. *Non-Functional Requirement* — *Usability*

| ID | Kriteria Kualitas | Deskripsi | Cara Verifikasi | NFR |
| ----- | ----- | ----- | ----- | :---: |
| SA-USB-01 | *User error protection* | Aksi yang tidak dapat dibatalkan, yaitu penyimpanan permanen dokumen BKD, pengesahan penilaian, penerapan hasil ekstraksi, dan penghapusan token, dilindungi dialog konfirmasi. | Uji alur setiap aksi krusial | NFR-09 |
| SA-USB-02 | *Operability* | Dosen dan asesor dapat menyelesaikan seluruh alur kerjanya tanpa memiliki dompet kripto dan tanpa menandatangani transaksi. | Uji alur pengguna dosen dan asesor secara menyeluruh | NFR-10 |
| SA-USB-03 | *Appropriateness recognizability* | Nilai kredit ditampilkan dalam satuan SKS berdesimal, bukan dalam skala internal kali seratus. | Pemeriksaan tampilan nilai pada seluruh halaman | — |
| SA-USB-04 | *User error protection* | Hasil ekstraksi ditampilkan berdampingan dengan nilai koreksinya, sehingga administrator dapat memeriksa perubahan sebelum menerapkannya. | Uji alur koreksi hasil ekstraksi | — |

7. ### **Portability** {#portability}

Portabilitas mengacu pada kemampuan sistem dipasang dan dioperasikan pada lingkungan yang berbeda.

Tabel III.35. *Non-Functional Requirement* — *Portability*

| ID | Kriteria Kualitas | Deskripsi | Cara Verifikasi | NFR |
| ----- | ----- | ----- | ----- | :---: |
| SA-PRT-01 | *Installability* | Sistem dapat dipasang pada lingkungan peladen baku dengan mengikuti prosedur pemasangan yang terdokumentasi. | Pemasangan ulang pada lingkungan bersih mengikuti dokumen penyiapan | NFR-11 |
| SA-PRT-02 | *Adaptability* | Layanan ekstraksi dokumen dapat dijalankan pada lingkungan lain tanpa penyiapan dependensi secara manual melalui berkas konfigurasi kontainer. | Menjalankan layanan pada lingkungan berbeda | — |
| SA-PRT-03 | *Replaceability* | Alamat kontrak, titik akhir RPC, dan alamat layanan ekstraksi dikonfigurasi melalui variabel lingkungan, sehingga penggantiannya tidak menuntut perubahan kode. | Penggantian konfigurasi tanpa kompilasi ulang | — |

7. ## **Business Rules** {#business-rules}

*Business Rules* mendefinisikan kebijakan dan batasan domain yang mengatur perilaku sistem, terlepas dari detail implementasinya. Aturan ini menjadi dasar bagi persyaratan fungsional pada subbab III.2 sekaligus jangkar penelusuran, sehingga setiap aturan dirujuk oleh satu atau beberapa fitur yang menegakkannya.

Tabel III.36. Daftar *Business Rules*

| ID | Kategori | Aturan Bisnis | Rujukan |
| :---: | ----- | ----- | ----- |
| BR-01 | Akses dan Peran | Sistem mengenali tiga peran, yaitu dosen, asesor, dan administrator, dan setiap pengguna hanya dapat mengakses ruang kerja sesuai perannya. | AUT; FR-02; SA-SEC-03 |
| BR-02 | Akses dan Peran | Kata sandi pengguna tidak pernah disimpan dalam bentuk asli. | AUT; FR-01; SA-SEC-01 |
| BR-03 | Periode dan Fase | Hanya satu periode BKD boleh berstatus aktif pada satu waktu. | PRD; FR-05 |
| BR-04 | Periode dan Fase | Aksi dosen atas kegiatan hanya diizinkan pada fase pengisian dan perbaikan, sedangkan aksi penilaian oleh asesor hanya diizinkan pada fase penilaian. | PRD; KEG; NIL; FR-06 |
| BR-05 | Dokumen BKD | Setiap dosen memiliki paling banyak satu dokumen BKD per periode untuk setiap jenis, yaitu rencana dan laporan. | KEG; FR-17 |
| BR-06 | Dokumen BKD | Dokumen BKD yang telah berstatus final terkunci dari perubahan lebih lanjut. | TOK; FR-22 |
| BR-07 | Penugasan Asesor | Setiap dokumen BKD dinilai oleh tepat dua asesor yang berbeda, dengan urutan asesor pertama dan asesor kedua. | ASR; FR-07 |
| BR-08 | Penilaian | Asesor tidak dapat mengesahkan penilaian sebelum dosen menyimpan dokumen BKD secara permanen. | NIL; FR-17; FR-21 |
| BR-09 | Penilaian | Asesor tidak dapat mengesahkan penilaian sebelum seluruh kegiatan yang diklaim dosen telah dinilai olehnya. | NIL; FR-21 |
| BR-10 | Penilaian | Setiap asesor hanya memiliki satu penilaian untuk setiap kegiatan, dan penilaian kedua asesor tersimpan berdampingan tanpa saling menimpa. | NIL; FR-20 |
| BR-11 | Penilaian | Nilai final setiap kegiatan merupakan rata-rata nilai yang disetujui kedua asesor. | TOK; FR-22 |
| BR-12 | Perhitungan | Aturan perhitungan kredit mengikuti rubrik unsur pendidikan PO BKD 2021 tanpa penyesuaian sepihak. | HIT; FR-18; CON-01 |
| BR-13 | Perhitungan | Butir aturan yang nilainya merupakan batas maksimum tidak dihitung otomatis, melainkan ditetapkan asesor. | HIT; REF; FR-19; DC-02 |
| BR-14 | Perhitungan | Nilai kredit direpresentasikan secara internal sebagai bilangan bulat pada skala kali seratus, dan hanya diubah menjadi satuan SKS berdesimal pada saat ditampilkan. | HIT; DC-03; SA-USB-03 |
| BR-15 | Perhitungan | Kegiatan pengajaran bernilai nol apabila realisasi pertemuan kurang dari separuh rencana atau kegiatan tidak berlangsung satu semester penuh; kondisi tersebut merupakan hasil penilaian yang sah, bukan kesalahan masukan. | HIT; FR-18 |
| BR-16 | Perhitungan | Nilai kredit dihitung ulang setiap kali parameter kegiatan berubah. | HIT; FR-13; FR-18 |
| BR-17 | Ekstraksi Dokumen | Kegiatan yang lahir dari penerapan dokumen penugasan masuk sebagai portofolio dengan penanda belum diklaim, sehingga keputusan melaporkannya tetap berada pada dosen. | EKS; KEG; FR-12; FR-15 |
| BR-18 | Ekstraksi Dokumen | Keluaran mentah parser tidak pernah diubah, dan koreksi administrator disimpan terpisah sebagai selisih. | EKS; FR-11; DC-12 |
| BR-19 | Ekstraksi Dokumen | Penerapan ulang hasil ekstraksi bersifat idempoten per baris dan tidak mengubah kegiatan yang telah diklaim dosen. | EKS; FR-12 |
| BR-20 | Ekstraksi Dokumen | Pencocokan baris dokumen ke akun dosen dilakukan berjenjang melalui kode dosen, nomor induk pegawai, lalu nama tanpa gelar, dengan hasil dibedakan menjadi cocok, ambigu, dan tidak cocok. | EKS; USR; FR-10 |
| BR-21 | Token dan Wallet | Setiap dosen memiliki tepat satu alamat *wallet* dengan indeks penurunan yang unik, dan alamat tersebut tidak diganti setelah ditetapkan. | USR; FR-04 |
| BR-22 | Token dan Wallet | Token kredit hanya diterbitkan setelah kedua asesor mengesahkan penilaiannya. | TOK; FR-21; FR-24 |
| BR-23 | Token dan Wallet | Token kredit bersifat *non-transferable* dan tidak dapat dipindahkan antar-alamat. | TOK; FR-24; SA-SEC-06 |
| BR-24 | Token dan Wallet | Penerbitan token hanya dapat dilakukan pemegang peran penerbit, dan penghapusan token hanya oleh pemegang peran administrator kontrak. | TOK; LAP; SA-SEC-05 |
| BR-25 | Token dan Wallet | Referensi transaksi penerbitan token berupa *hash* kriptografi atas muatan simpulan penilaian, bukan isi penilaian itu sendiri. | TOK; FR-23; SA-SEC-04 |
| BR-26 | Token dan Wallet | Koreksi kredit diwujudkan sebagai transaksi penghapusan token yang baru disertai alasan, bukan sebagai penghapusan catatan lama pada *blockchain*. | LAP; FR-25 |
| BR-27 | Jejak dan Audit | Setiap upaya transaksi *on-chain* dicatat pada riwayat transaksi beserta statusnya, baik ketika berhasil maupun gagal. | TOK; LAP; FR-24; FR-25; SA-REL-02 |
| BR-28 | Jejak dan Audit | Kode sumber kedua kontrak diverifikasi pada penjelajah blok publik agar aturan yang berjalan dapat ditinjau pihak eksternal. | SW-06; DC-01 |
| BR-29 | Verifikasi Bukti | Dokumen bukti pada kegiatan rumpun pembimbingan diperiksa terhadap nama pemilik akun dan peran yang diklaim kegiatan, dan hasilnya melekat pada dokumen yang bersangkutan. | VER; FR-28 |
| BR-30 | Verifikasi Bukti | Hasil pemeriksaan bersifat temuan bagi asesor dan tidak pernah menolak unggahan maupun menggugurkan kegiatan secara otomatis. | VER; FR-28; FR-29; SA-FUN-03 |
| BR-31 | Verifikasi Bukti | Hanya status tidak cocok dan peran tidak sesuai yang dihitung sebagai temuan. Status tanpa nama dan gagal menandakan pemeriksaan tidak menyimpulkan apa pun dan tidak boleh diperlakukan sebagai indikasi ketidaksesuaian. | VER; FR-29 |
| BR-32 | Verifikasi Bukti | Keputusan asesor yang mengesampingkan hasil pemeriksaan dicatat sebagai persetujuan manual beserta identitas dan waktunya, tanpa menghapus hasil pembacaan parser. | VER; FR-30; SA-FUN-03 |

8. ## **Other Requirements** {#other-requirements}

Tabel III.37. *Other Requirements*

| ID | Deskripsi |
| :---: | ----- |
| OR-01 | Sistem dikembangkan sebagai prototipe fungsional dan tidak terintegrasi dengan sistem akademik resmi perguruan tinggi maupun sistem BKD nasional. |
| OR-02 | Penempatan *smart contract* dibatasi pada jaringan uji Base Sepolia; penempatan ke jaringan produksi berada di luar lingkup pengembangan. |
| OR-03 | Antarmuka dan konten utama disajikan dalam Bahasa Indonesia. |
| OR-04 | Data pengujian sistem terbatas pada dokumen penugasan yang diperoleh dari Jurusan Teknik Komputer dan Informatika Politeknik Negeri Bandung, sehingga kesesuaian terhadap variasi format dokumen di luar konteks tersebut tidak dijamin. |
| OR-05 | Sistem tidak menangani verifikasi keaslian dokumen SK dan ST, seperti pemeriksaan tanda tangan atau stempel. |
| OR-06 | Kendali kriptografis atas *wallet* dosen berada pada penyelenggara sistem sebagai konsekuensi pemilihan *wallet* kustodian; konsekuensi ini dinyatakan terbuka dan menjadi dasar saran pengembangan lanjutan. |

# **Appendices** {#appendices}

## **Appendix A: Spesifikasi Proses (PSPEC)** {#appendix-a-spesifikasi-proses-pspec}

*Appendix* ini menyajikan spesifikasi rinci untuk setiap proses pada tingkat terendah *Data Flow Diagram*, sebagai pelengkap Diagram Konteks pada Gambar I.1 dan *Data Flow Diagram* Level 1 pada Gambar I.2. Spesifikasi proses menggantikan peran *Fully Dressed Use Case* pada dokumen yang menggunakan pendekatan berorientasi objek, dan dituliskan menggunakan bahasa terstruktur sesuai kaidah analisis terstruktur.

Setiap spesifikasi memuat identitas proses, aliran data masuk dan keluar, penyimpanan data yang diakses, persyaratan fungsional yang direalisasikan, serta logika pemrosesan dalam bentuk *pseudocode*. Penomoran PSPEC pada *appendix* ini identik dengan penomoran pada Tabel IV.20 Laporan Tugas Akhir.

### **PSPEC-01 — Autentikasi dan Otorisasi**

| Atribut | Keterangan |
| :---- | :---- |
| **Proses DFD** | P1 |
| **Masukan** | Surel, kata sandi, permintaan halaman, sesi aktif |
| **Keluaran** | Sesi berisi pengenal dan peran, pengalihan halaman, pesan kesalahan |
| **Penyimpanan Data** | D1 pengguna (baca) |
| **FR Terkait** | FR-01, FR-02 |

Logika pemrosesan:

```
PROCEDURE Autentikasi_dan_Otorisasi
  CASE aksi = "masuk"
    RECEIVE surel, kataSandi
    CARI akun DARI D1 WHERE email = surel AND aktif = benar
    IF akun TIDAK DITEMUKAN THEN
      TOLAK "Kredensial tidak valid"
    ENDIF
    IF BANDINGKAN_HASH(kataSandi, akun.password_hash) = salah THEN
      TOLAK "Kredensial tidak valid"
    ENDIF
    TERBITKAN sesi BERISI (akun.id_pengguna, akun.peran)
    ALIHKAN KE beranda(akun.peran)
  ENDCASE

  CASE aksi = "akses halaman terlindungi"
    RECEIVE alamatDiminta, sesi
    IF sesi TIDAK ADA THEN
      ALIHKAN KE halaman_masuk
    ENDIF
    ruangKerja = AWALAN(alamatDiminta)
    IF ruangKerja <> beranda(sesi.peran) THEN
      ALIHKAN KE beranda(sesi.peran)
    ENDIF
    LANJUTKAN permintaan
  ENDCASE
END PROCEDURE
```

### **PSPEC-02 — Pengelolaan Pengguna dan Wallet**

| Atribut | Keterangan |
| :---- | :---- |
| **Proses DFD** | P2 |
| **Masukan** | Data akun, kode dosen, penanda aktif, permintaan penetapan *wallet* |
| **Keluaran** | Akun tersimpan, alamat *wallet* beserta indeksnya |
| **Penyimpanan Data** | D1 pengguna (baca, tulis) |
| **FR Terkait** | FR-03, FR-04 |

Logika pemrosesan:

```
PROCEDURE Pengelolaan_Pengguna_dan_Wallet
  CASE aksi = "tambah akun"
    RECEIVE nama, surel, kataSandi, peran
    IF surel SUDAH ADA DI D1 THEN
      TOLAK "Surel sudah terdaftar"
    ENDIF
    SIMPAN KE D1 (nama, surel, HASH(kataSandi), peran, aktif = benar)
  ENDCASE

  CASE aksi = "isi kode dosen"
    RECEIVE idPengguna, kodeDosen
    KOSONGKAN kode_dosen PADA D1 WHERE kode_dosen = kodeDosen
    SIMPAN kodeDosen KE D1 WHERE id_pengguna = idPengguna
  ENDCASE

  CASE aksi = "tetapkan wallet"
    RECEIVE idPengguna
    BACA akun DARI D1 WHERE id_pengguna = idPengguna
    IF akun.alamat_wallet SUDAH TERISI THEN
      TOLAK "Wallet sudah ditetapkan"
    ENDIF
    indeksMaks = MAKS(wallet_index) DARI D1
    indeksBaru = indeksMaks + 1
    alamat = TURUNKAN_ALAMAT(frasaInduk, "m/44'/60'/0'/0/" + indeksBaru)
    SIMPAN (alamat, indeksBaru) KE D1 WHERE id_pengguna = idPengguna
  ENDCASE
END PROCEDURE
```

### **PSPEC-03 — Pengelolaan Periode dan Fase**

| Atribut | Keterangan |
| :---- | :---- |
| **Proses DFD** | P3 |
| **Masukan** | Data periode, rentang tanggal fase, nilai penggantian fase, tanggal berjalan |
| **Keluaran** | Periode tersimpan, periode aktif, fase yang sedang berjalan |
| **Penyimpanan Data** | D2 periode\_bkd (baca, tulis) |
| **FR Terkait** | FR-05, FR-06 |

Logika pemrosesan:

```
PROCEDURE Pengelolaan_Periode_dan_Fase
  CASE aksi = "aktifkan periode"
    RECEIVE idPeriode
    SET status = "nonaktif" PADA SELURUH D2
    SET status = "aktif" PADA D2 WHERE id_periode = idPeriode
  ENDCASE

  CASE aksi = "tentukan fase berjalan"
    BACA periode DARI D2 WHERE status = "aktif"
    IF periode TIDAK DITEMUKAN THEN
      RETURN "selesai"
    ENDIF
    IF periode.fase_override TERISI THEN
      RETURN periode.fase_override
    ENDIF
    hariIni = TANGGAL_SEKARANG
    IF hariIni DI ANTARA periode.pengisian_mulai DAN periode.pengisian_selesai THEN
      RETURN "pengisian"
    ELSE IF hariIni DI ANTARA periode.penilaian_mulai DAN periode.penilaian_selesai THEN
      RETURN "penilaian"
    ELSE IF hariIni DI ANTARA periode.perbaikan_mulai DAN periode.perbaikan_selesai THEN
      RETURN "perbaikan"
    ELSE
      RETURN "selesai"
    ENDIF
  ENDCASE
END PROCEDURE
```

### **PSPEC-04 — Penugasan Asesor**

| Atribut | Keterangan |
| :---- | :---- |
| **Proses DFD** | P4 |
| **Masukan** | Pengenal dokumen BKD, pengenal asesor, urutan |
| **Keluaran** | Penugasan asesor tersimpan atau penolakan |
| **Penyimpanan Data** | D3 lkd (baca), D4 penugasan\_asesor (baca, tulis) |
| **FR Terkait** | FR-07 |

Logika pemrosesan:

```
PROCEDURE Penugasan_Asesor
  CASE aksi = "tugaskan"
    RECEIVE idLkd, idAsesor, urutan
    IF ADA D4 WHERE id_lkd = idLkd AND urutan = urutan THEN
      PERBARUI penugasan tersebut DENGAN idAsesor
    ELSE
      IF ADA D4 WHERE id_lkd = idLkd AND id_asesor = idAsesor THEN
        TOLAK "Asesor sudah ditugaskan pada dokumen ini"
      ENDIF
      SIMPAN KE D4 (idLkd, idAsesor, urutan, disahkan = salah)
    ENDIF
  ENDCASE

  CASE aksi = "tugaskan massal"
    RECEIVE idPeriode, asesorPertama, asesorKedua
    FOR SETIAP lkd DALAM D3 WHERE id_periode = idPeriode DO
      IF lkd BELUM MEMILIKI penugasan urutan 1 THEN
        SIMPAN KE D4 (lkd.id_lkd, asesorPertama, 1)
      ENDIF
      IF lkd BELUM MEMILIKI penugasan urutan 2 THEN
        SIMPAN KE D4 (lkd.id_lkd, asesorKedua, 2)
      ENDIF
    ENDFOR
  ENDCASE
END PROCEDURE
```

### **PSPEC-05 — Ekstraksi Dokumen Penugasan**

| Atribut | Keterangan |
| :---- | :---- |
| **Proses DFD** | P6.1 dan P6.2 |
| **Masukan** | Berkas PDF, jenis dokumen |
| **Keluaran** | Keluaran parser dalam format JSON, status unggahan, pesan galat |
| **Penyimpanan Data** | D6 unggahan\_dokumen (tulis) |
| **FR Terkait** | FR-09 |

Logika pemrosesan:

```
PROCEDURE Ekstraksi_Dokumen
  RECEIVE berkas, jenisDokumen
  IF berkas BUKAN PDF THEN
    TOLAK "Berkas harus berformat PDF"
  ENDIF
  nilaiHash = SHA256(berkas)
  SIMPAN berkas KE penyimpanan_peladen
  SIMPAN KE D6 (jenisDokumen, namaBerkas, nilaiHash, status = "terparse")

  CASE jenisDokumen
    "st_pengajaran", "st_bimbingan", "st_pengujian":
      hasil = EKSTRAKSI_DETERMINISTIK(berkas)   -- berbasis posisi kolom dan garis bingkai tabel
    "sk_pembinaan":
      citra = RASTERISASI_HALAMAN(berkas)
      hasil = PENAFSIRAN_MODEL_BAHASA_VISUAL(citra, skemaKeluaranJSON)
  ENDCASE

  IF hasil KOSONG ATAU tata letak tidak dikenali THEN
    SET status = "gagal" PADA D6
    SET pesan_galat = "Tata letak dokumen tidak dikenali"
    RETURN
  ENDIF
  IF layanan model bahasa visual TIDAK TERSEDIA THEN
    SET status = "gagal" PADA D6
    SET pesan_galat = "Layanan penafsiran dokumen tidak tersedia"
    RETURN
  ENDIF
  SIMPAN hasil UTUH KE D6.hasil_parse
  SIMPAN ringkasan KE D6.ringkasan
END PROCEDURE
```

### **PSPEC-06 — Pemetaan Baris dan Pencocokan Dosen**

| Atribut | Keterangan |
| :---- | :---- |
| **Proses DFD** | P6.3 |
| **Masukan** | Keluaran parser, data referensi kegiatan, data akun dosen |
| **Keluaran** | Daftar calon kegiatan beserta status pencocokan dosen |
| **Penyimpanan Data** | D1 pengguna (baca), D5 referensi\_kegiatan (baca), D6 unggahan\_dokumen (baca) |
| **FR Terkait** | FR-10 |

Logika pemrosesan:

```
PROCEDURE Pemetaan_dan_Pencocokan
  RECEIVE hasilParse, jenisDokumen
  daftarCalon = KOSONG
  FOR SETIAP baris DALAM hasilParse DO
    kodeRule = PETAKAN_JENIS_KE_KODE_RULE(jenisDokumen, baris)
    skema    = BACA skema_parameter DARI D5 WHERE kode_rule = kodeRule
    parameter = BENTUK_PARAMETER(baris, skema)
    tandaBaris = BENTUK_TANDA_BARIS(baris)   -- penanda stabil untuk penerapan idempoten

    -- pencocokan dosen secara berjenjang
    IF baris.kodeDosen TERISI DAN COCOK TUNGGAL DI D1 THEN
      statusCocok = "cocok"
    ELSE IF baris.nip TERISI DAN COCOK TUNGGAL DI D1 THEN
      statusCocok = "cocok"
    ELSE
      kandidat = CARI DI D1 BERDASARKAN nama tanpa gelar
      IF JUMLAH(kandidat) = 1 THEN statusCocok = "cocok"
      ELSE IF JUMLAH(kandidat) > 1 THEN statusCocok = "ambigu"
      ELSE statusCocok = "tidak_cocok"
      ENDIF
    ENDIF

    TAMBAHKAN (tandaBaris, kodeRule, parameter, dosenTujuan, statusCocok) KE daftarCalon
  ENDFOR
  RETURN daftarCalon
END PROCEDURE
```

### **PSPEC-07 — Koreksi dan Penerapan Hasil Ekstraksi**

| Atribut | Keterangan |
| :---- | :---- |
| **Proses DFD** | P6.4 dan P6.5 |
| **Masukan** | Koreksi administrator per baris, daftar calon kegiatan, perintah terapkan |
| **Keluaran** | Kegiatan tersimpan pada dokumen BKD, dokumen bukti terlampir, ringkasan hasil penerapan |
| **Penyimpanan Data** | D2 periode\_bkd (baca), D3 lkd (baca, tulis), D6 unggahan\_dokumen (baca, tulis), D7 kegiatan (baca, tulis), D8 dokumen\_kegiatan (tulis) |
| **FR Terkait** | FR-11, FR-12 |

Logika pemrosesan:

```
PROCEDURE Koreksi_dan_Penerapan
  CASE aksi = "simpan koreksi baris"
    RECEIVE idUnggahan, tandaBaris, nilaiKoreksi
    SIMPAN nilaiKoreksi KE D6.koreksi[tandaBaris]   -- hasil_parse TIDAK diubah
  ENDCASE

  CASE aksi = "kembalikan ke hasil asli"
    RECEIVE idUnggahan, tandaBaris
    HAPUS D6.koreksi[tandaBaris]
  ENDCASE

  CASE aksi = "terapkan"
    RECEIVE idUnggahan
    periodeAktif = BACA D2 WHERE status = "aktif"
    daftarCalon  = GABUNGKAN(D6.hasil_parse, D6.koreksi)
    FOR SETIAP calon DALAM daftarCalon DO
      IF calon DITANDAI "lewati" THEN LANJUT ENDIF
      IF calon.statusCocok <> "cocok" THEN LANJUT ENDIF

      lkd = CARI ATAU BUAT D3 (calon.dosenTujuan, periodeAktif, jenis = "laporan")
      kegiatanLama = CARI D7 WHERE id_lkd = lkd AND tanda_baris = calon.tandaBaris

      IF kegiatanLama ADA THEN
        IF kegiatanLama.diklaim = benar THEN
          CATAT "dilewati karena sudah diklaim dosen"
          LANJUT
        ENDIF
        PERBARUI kegiatanLama DENGAN calon.parameter
        sksX100 = PANGGIL PSPEC-09 (calon.kodeRule, calon.parameter)
        SIMPAN sksX100 KE kegiatanLama
      ELSE
        sksX100 = PANGGIL PSPEC-09 (calon.kodeRule, calon.parameter)
        SIMPAN KE D7 (lkd, calon.kodeRule, calon.parameter, sksX100,
                      diklaim = salah, sumber_data = "surat_tugas", idUnggahan)
        SIMPAN KE D8 (kegiatanBaru, berkasSumber, jenis_dokumen = "SK Penugasan")
      ENDIF
    ENDFOR
    SET status = "diterapkan" PADA D6
  ENDCASE
END PROCEDURE
```

### **PSPEC-08 — Pengelolaan Kegiatan dan Dokumen BKD**

| Atribut | Keterangan |
| :---- | :---- |
| **Proses DFD** | P7 |
| **Masukan** | Data kegiatan, parameter, berkas bukti, perintah tarik data, status capaian, perintah simpan |
| **Keluaran** | Kegiatan tersimpan, dokumen bukti tersimpan, dokumen BKD siap dinilai |
| **Penyimpanan Data** | D2 periode\_bkd (baca), D3 lkd (baca, tulis), D5 referensi\_kegiatan (baca), D7 kegiatan (baca, tulis), D8 dokumen\_kegiatan (baca, tulis) |
| **FR Terkait** | FR-13, FR-14, FR-15, FR-16, FR-17 |

Logika pemrosesan:

```
PROCEDURE Pengelolaan_Kegiatan_dan_Dokumen_BKD
  faseBerjalan = PANGGIL PSPEC-03 ("tentukan fase berjalan")

  CASE aksi DALAM ("tambah", "ubah", "hapus", "tarik data", "batal klaim", "ubah capaian")
    IF faseBerjalan BUKAN "pengisian" DAN BUKAN "perbaikan" THEN
      TOLAK "Aksi tidak diizinkan pada fase berjalan"
    ENDIF
  ENDCASE

  CASE aksi = "tambah" ATAU "ubah"
    RECEIVE kodeRule, parameter
    skema = BACA skema_parameter DARI D5 WHERE kode_rule = kodeRule
    IF parameter TIDAK LENGKAP TERHADAP skema THEN
      TOLAK "Parameter belum lengkap"
    ENDIF
    sksX100 = PANGGIL PSPEC-09 (kodeRule, parameter)
    SIMPAN KE D7 (kodeRule, parameter, sksX100, statusPerhitungan)
  ENDCASE

  CASE aksi = "unggah bukti"
    RECEIVE idKegiatan, berkas
    SIMPAN berkas KE penyimpanan_peladen
    SIMPAN metadata KE D8 (idKegiatan, namaBerkas, lokasiBerkas)
  ENDCASE

  CASE aksi = "tarik data"
    RECEIVE idKegiatan
    SET diklaim = benar PADA D7 WHERE id_kegiatan = idKegiatan
  ENDCASE

  CASE aksi = "batal klaim"
    RECEIVE idKegiatan
    IF ADA hasil penilaian UNTUK idKegiatan THEN
      TOLAK "Kegiatan sudah dinilai"
    ENDIF
    SET diklaim = salah PADA D7
  ENDCASE

  CASE aksi = "simpan permanen"
    RECEIVE idLkd
    SET simpan_permanen = benar PADA D3 WHERE id_lkd = idLkd
  ENDCASE
END PROCEDURE
```

### **PSPEC-09 — Orkestrasi Perhitungan Kredit**

| Atribut | Keterangan |
| :---- | :---- |
| **Proses DFD** | P8.1 sampai P8.3 |
| **Masukan** | Kode aturan, parameter kegiatan |
| **Keluaran** | Nilai kredit pada skala kali seratus, status perhitungan |
| **Penyimpanan Data** | D5 referensi\_kegiatan (baca), D7 kegiatan (tulis) |
| **FR Terkait** | FR-18, FR-19 |

Logika pemrosesan:

```
PROCEDURE Orkestrasi_Perhitungan_Kredit
  RECEIVE kodeRule, parameter
  referensi = BACA D5 WHERE kode_rule = kodeRule

  IF referensi.fungsi_contract KOSONG THEN
    RETURN (nilai = kosong, status = "tidak_diotomatisasi")
  ENDIF

  IF parameter TIDAK SESUAI referensi.skema_parameter THEN
    RETURN (nilai = kosong, status = "gagal", alasan = "Parameter tidak sesuai skema")
  ENDIF

  TRY
    sksX100 = PANGGIL_KONTRAK_KALKULATOR(referensi.fungsi_contract, parameter)
    RETURN (nilai = sksX100, status = "berhasil")
  CATCH penolakanKontrak
    RETURN (nilai = kosong, status = "gagal", alasan = penolakanKontrak.alasan)
  CATCH kegagalanJaringan
    RETURN (nilai = kosong, status = "gagal", alasan = "Jaringan tidak dapat dijangkau")
  ENDTRY
END PROCEDURE
```

### **PSPEC-10 — Smart Contract Kalkulator BKD Pendidikan**

| Atribut | Keterangan |
| :---- | :---- |
| **Proses DFD** | P8 (entitas eksternal *Smart Contract* Kalkulator BKD) |
| **Masukan** | Nama fungsi perhitungan dan parameter kegiatan sesuai butir aturan |
| **Keluaran** | Nilai kredit pada skala kali seratus, atau penolakan disertai alasan |
| **Penyimpanan Data** | Tidak ada; seluruh fungsi bersifat murni tanpa penyimpanan status |
| **FR Terkait** | FR-18 |

Logika pemrosesan (dicontohkan pada tiga butir aturan yang paling representatif; logika lengkap seluruh butir disajikan pada Tabel IV.22 Laporan Tugas Akhir):

```
PROCEDURE Kalkulator_BKD_Pendidikan
  CASE fungsi = "hitungPengajaran"
    RECEIVE sksMataKuliah, rencana, realisasi, semesterPenuh, teamTeaching, persenPorsi
    IF sksMataKuliah = 0 THEN REVERT "sksMataKuliah harus > 0" ENDIF
    IF rencana = 0 THEN REVERT "jumlahPertemuanRencana harus > 0" ENDIF
    IF realisasi > rencana THEN REVERT "jumlahPertemuanRealisasi tidak valid" ENDIF
    persentase = realisasi * 100 / rencana
    IF persentase < 50 THEN RETURN 0 ENDIF
    IF semesterPenuh = salah THEN RETURN 0 ENDIF
    sksDasarX100 = sksMataKuliah * 100 * realisasi / rencana
    IF teamTeaching = benar THEN
      IF persenPorsi = 0 ATAU persenPorsi > 100 THEN REVERT "persenPorsiDosen harus 1..100" ENDIF
      RETURN sksDasarX100 * persenPorsi / 100
    ENDIF
    RETURN sksDasarX100
  ENDCASE

  CASE fungsi = "hitungPembimbinganTugasAkhir"
    RECEIVE peran, jenisTugasAkhir, jumlahMahasiswa
    IF jumlahMahasiswa = 0 THEN REVERT "jumlahMahasiswa harus > 0" ENDIF
    IF peran = "PembimbingUtama" THEN
      nilaiPerMahasiswaX100 = PILIH(Disertasi=133, Tesis=100, Skripsi=50, TugasAkhir=50)
    ELSE
      nilaiPerMahasiswaX100 = PILIH(Disertasi=100, Tesis=75, Skripsi=25, TugasAkhir=25)
    ENDIF
    RETURN nilaiPerMahasiswaX100 * jumlahMahasiswa
  ENDCASE

  CASE fungsi = "hitungPengembanganBahanAjar"
    RECEIVE jenisBahanAjar, jumlahNaskah, peranTim, jumlahAnggotaTim
    IF jumlahNaskah = 0 THEN REVERT "jumlahNaskah harus > 0" ENDIF
    nilaiDasarX100 = PILIH(BukuAjar=500, ModulPedoman=500, BahanAjarLain=200)
    totalDasarX100 = nilaiDasarX100 * jumlahNaskah
    IF peranTim = "Individu" THEN RETURN totalDasarX100 ENDIF
    IF peranTim = "Ketua"    THEN RETURN totalDasarX100 * 60 / 100 ENDIF
    IF peranTim = "Anggota"  THEN
      IF jumlahAnggotaTim = 0 THEN REVERT "jumlahAnggotaTim harus > 0" ENDIF
      RETURN (totalDasarX100 * 40 / 100) / jumlahAnggotaTim
    ENDIF
    REVERT "peranTim tidak valid"
  ENDCASE
END PROCEDURE
```

### **PSPEC-11 — Penilaian dan Pengesahan Asesor**

| Atribut | Keterangan |
| :---- | :---- |
| **Proses DFD** | P9.1 dan P9.2 |
| **Masukan** | Nilai disetujui, pertemuan keputusan, persentase capaian, status, catatan, perintah sahkan |
| **Keluaran** | Hasil penilaian tersimpan, penanda pengesahan asesor |
| **Penyimpanan Data** | D3 lkd (baca), D4 penugasan\_asesor (baca, tulis), D7 kegiatan (baca), D9 hasil\_penilaian (baca, tulis) |
| **FR Terkait** | FR-20, FR-21 |

Logika pemrosesan:

```
PROCEDURE Penilaian_dan_Pengesahan
  CASE aksi = "simpan penilaian"
    RECEIVE idKegiatan, idPenugasan, sksDisetujuiX100, pertemuanKeputusan,
            capaianPersen, status, catatan
    IF ADA D9 WHERE id_kegiatan = idKegiatan AND id_penugasan = idPenugasan THEN
      PERBARUI baris tersebut
    ELSE
      SIMPAN baris baru KE D9
    ENDIF
  ENDCASE

  CASE aksi = "sahkan"
    RECEIVE idPenugasan
    penugasan = BACA D4 WHERE id_penugasan = idPenugasan
    lkd       = BACA D3 WHERE id_lkd = penugasan.id_lkd

    IF lkd.simpan_permanen = salah THEN
      TOLAK "Dosen belum menyimpan dokumen secara permanen"
    ENDIF

    daftarKegiatan = BACA D7 WHERE id_lkd = lkd.id_lkd AND diklaim = benar
    FOR SETIAP kegiatan DALAM daftarKegiatan DO
      IF TIDAK ADA D9 WHERE id_kegiatan = kegiatan AND id_penugasan = idPenugasan THEN
        TOLAK "Masih ada kegiatan yang belum dinilai"
      ENDIF
    ENDFOR

    SET disahkan = benar, tanggal_pengesahan = SEKARANG PADA D4
    PANGGIL PSPEC-12 (lkd.id_lkd)
  ENDCASE
END PROCEDURE
```

### **PSPEC-12 — Pembentukan Simpulan BKD**

| Atribut | Keterangan |
| :---- | :---- |
| **Proses DFD** | P9.3 |
| **Masukan** | Pengenal dokumen BKD, hasil penilaian kedua asesor |
| **Keluaran** | Simpulan BKD beserta *hash* penilaian, status dokumen final |
| **Penyimpanan Data** | D3 lkd (tulis), D4 penugasan\_asesor (baca), D7 kegiatan (baca), D9 hasil\_penilaian (baca), D10 simpulan\_bkd (tulis) |
| **FR Terkait** | FR-22, FR-23 |

Logika pemrosesan:

```
PROCEDURE Pembentukan_Simpulan_BKD
  RECEIVE idLkd
  daftarPenugasan = BACA D4 WHERE id_lkd = idLkd
  IF ADA penugasan DENGAN disahkan = salah THEN
    RETURN   -- menunggu asesor lain, simpulan belum dibentuk
  ENDIF

  totalX100 = 0
  rincian   = KOSONG
  FOR SETIAP kegiatan DALAM D7 WHERE id_lkd = idLkd AND diklaim = benar DO
    nilaiAsesor = BACA D9 WHERE id_kegiatan = kegiatan
    nilaiFinalX100 = RATA_RATA(nilaiAsesor.sks_disetujui_x100)
    totalX100 = totalX100 + nilaiFinalX100
    TAMBAHKAN (kegiatan, nilaiFinalX100) KE rincian
  ENDFOR

  memenuhi = (totalX100 / 100 >= ambangBebanMinimum)
  statusFinal = JIKA memenuhi MAKA "M" LAIN "TM"

  hashPenilaian = KECCAK256(JSON(idLkd, totalX100, rincian, daftarPenugasan))

  SIMPAN KE D10 (idLkd, totalX100, statusFinal, hashPenilaian)
  SET status = "final" PADA D3 WHERE id_lkd = idLkd
  PANGGIL PSPEC-13 ("mint", dosen.alamat_wallet, totalX100, hashPenilaian)
END PROCEDURE
```

### **PSPEC-13 — Integrasi Token pada Lapisan Orkestrasi**

| Atribut | Keterangan |
| :---- | :---- |
| **Proses DFD** | P9.4 dan P10 |
| **Masukan** | Alamat *wallet*, jumlah kredit, referensi, alasan koreksi |
| **Keluaran** | *Transaction hash*, catatan riwayat transaksi |
| **Penyimpanan Data** | D10 simpulan\_bkd (tulis), D11 riwayat\_transaksi (tulis) |
| **FR Terkait** | FR-24, FR-25 |

Logika pemrosesan:

```
PROCEDURE Integrasi_Token
  CASE aksi = "mint"
    RECEIVE alamatWallet, jumlahX100, referenceId
    jumlahToken = KONVERSI_KE_SATUAN_TOKEN(jumlahX100)
    TRY
      txHash = PANGGIL_KONTRAK_TOKEN("mint", alamatWallet, jumlahToken, referenceId)
      SIMPAN txHash KE D10
      SIMPAN KE D11 (jenis = "mint", txHash, jumlahX100, alamatWallet,
                     referenceId, status = "success")
    CATCH kegagalan
      SIMPAN KE D11 (jenis = "mint", jumlahX100, alamatWallet, referenceId,
                     status = "failed", alasan = kegagalan.pesan)
      -- simpulan yang telah tersimpan TIDAK dibatalkan
    ENDTRY
  ENDCASE

  CASE aksi = "burn"
    RECEIVE alamatWallet, jumlahX100, alasan
    jumlahToken = KONVERSI_KE_SATUAN_TOKEN(jumlahX100)
    TRY
      txHash = PANGGIL_KONTRAK_TOKEN("burn", alamatWallet, jumlahToken, alasan)
      SIMPAN KE D11 (jenis = "burn", txHash, jumlahX100, alamatWallet,
                     alasan, status = "success")
    CATCH kegagalan
      SIMPAN KE D11 (jenis = "burn", jumlahX100, alamatWallet, alasan,
                     status = "failed")
    ENDTRY
  ENDCASE
END PROCEDURE
```

### **PSPEC-14 — Smart Contract Token SKS**

| Atribut | Keterangan |
| :---- | :---- |
| **Proses DFD** | P9 dan P10 (entitas eksternal *Smart Contract* Token SKS) |
| **Masukan** | Alamat admin dan penerbit awal, alamat tujuan, jumlah token, referenceId, alasan |
| **Keluaran** | Token diterbitkan atau dihapus, *event* tercatat, atau pemindahan ditolak |
| **Penyimpanan Data** | Saldo token dan pemegang peran pada penyimpanan kontrak |
| **FR Terkait** | FR-24, FR-25 |

Logika pemrosesan:

```
PROCEDURE Token_SKS
  CASE fungsi = "constructor"
    RECEIVE admin, penerbitAwal
    IF admin = alamat_nol ATAU penerbitAwal = alamat_nol THEN REVERT "InvalidAddress" ENDIF
    SET namaToken = "BKD SKS Token", simbolToken = "SKS"
    BERIKAN peran_admin KEPADA admin
    BERIKAN peran_penerbit KEPADA penerbitAwal
  ENDCASE

  CASE fungsi = "mint"
    RECEIVE pemanggil, tujuan, jumlah, referenceId
    IF pemanggil TIDAK MEMILIKI peran_penerbit THEN REVERT "Akses ditolak" ENDIF
    IF tujuan = alamat_nol THEN REVERT "InvalidAddress" ENDIF
    IF jumlah = 0 THEN REVERT "Jumlah harus > 0" ENDIF
    TAMBAHKAN jumlah KE saldo(tujuan)
    PANCARKAN EVENT SKSMinted(pemanggil, tujuan, jumlah, referenceId)
  ENDCASE

  CASE fungsi = "burn"
    RECEIVE pemanggil, akun, jumlah, alasan
    IF pemanggil TIDAK MEMILIKI peran_admin THEN REVERT "Akses ditolak" ENDIF
    IF akun = alamat_nol THEN REVERT "InvalidAddress" ENDIF
    IF jumlah = 0 THEN REVERT "Jumlah harus > 0" ENDIF
    KURANGI jumlah DARI saldo(akun)
    PANCARKAN EVENT SKSBurned(pemanggil, akun, jumlah, alasan)
  ENDCASE

  CASE fungsi = "_update"   -- titik kendali seluruh perubahan saldo
    RECEIVE asal, tujuan, nilai
    IF asal = alamat_nol THEN LANJUTKAN perubahan saldo; RETURN ENDIF   -- penerbitan
    IF tujuan = alamat_nol THEN LANJUTKAN perubahan saldo; RETURN ENDIF -- penghapusan
    REVERT "TokenNonTransferable"
  ENDCASE
END PROCEDURE
```

### **PSPEC-15 — Log Blockchain dan Rekapitulasi**

| Atribut | Keterangan |
| :---- | :---- |
| **Proses DFD** | P10 |
| **Masukan** | Permintaan log, permintaan rekapitulasi, rentang blok |
| **Keluaran** | Daftar *event* transaksi, tabel rekapitulasi kredit |
| **Penyimpanan Data** | D1 pengguna (baca), D3 lkd (baca), D10 simpulan\_bkd (baca), D11 riwayat\_transaksi (baca) |
| **FR Terkait** | FR-26, FR-27 |

Logika pemrosesan:

```
PROCEDURE Log_dan_Rekapitulasi
  CASE aksi = "baca log blockchain"
    blokAwal  = blok_penempatan_kontrak
    blokAkhir = BLOK_TERKINI
    daftarEvent = KOSONG
    WHILE blokAwal <= blokAkhir DO
      potonganAkhir = MIN(blokAwal + BATAS_RENTANG_BLOK, blokAkhir)
      potongan = BACA_EVENT(blokAwal, potonganAkhir)
      TAMBAHKAN potongan KE daftarEvent
      blokAwal = potonganAkhir + 1
    ENDWHILE
    FOR SETIAP event DALAM daftarEvent DO
      event.jumlahTampil = TAFSIRKAN_SKALA(event.jumlah)  -- bedakan skala lama dan skala penuh
    ENDFOR
    RETURN daftarEvent
  ENDCASE

  CASE aksi = "rekapitulasi"
    RECEIVE idPeriode
    hasil = KOSONG
    FOR SETIAP dosen DALAM D1 WHERE peran = "dosen" DO
      lkd      = BACA D3 WHERE id_pengguna = dosen AND id_periode = idPeriode
      simpulan = BACA D10 WHERE id_lkd = lkd
      TAMBAHKAN (dosen, simpulan.total, simpulan.status_final, simpulan.tx_hash) KE hasil
    ENDFOR
    RETURN hasil
  ENDCASE
END PROCEDURE
```

### **PSPEC-16 — Penyeleksian dan Pemanggilan Parser Bukti**

| Atribut | Keterangan |
| :---- | :---- |
| **Proses DFD** | P11.1 sampai P11.2 |
| **Masukan** | Dokumen bukti beserta lokasi dan tipe berkasnya, kode aturan kegiatan, pemicu pemeriksaan |
| **Keluaran** | Keluaran parser artefak berupa daftar orang beserta peran dan jenis dokumen, atau hasil pemeriksaan berstatus gagal |
| **Penyimpanan Data** | D5 referensi\_kegiatan (baca), D7 kegiatan (baca), D8 dokumen\_kegiatan (baca) |
| **FR Terkait** | FR-28 |

Logika pemrosesan:

```
PROCEDURE Seleksi_dan_Pemanggilan_Parser_Bukti
  RECEIVE dokumen, kodeRule, pemicu

  IF pemicu = "otomatis" DAN kodeRule TIDAK DALAM ("EDU201", "EDU202", "EDU203") THEN
    RETURN "tanpa pemeriksaan"          -- dokumen disimpan tanpa hasil pemeriksaan
  ENDIF
  IF dokumen.lokasi BUKAN berkas unggahan lokal THEN
    RETURN "tanpa pemeriksaan"          -- tautan luar tidak diunduh sistem
  ENDIF
  IF dokumen BUKAN PDF MENURUT ekstensi MAUPUN tipe MIME THEN
    RETURN "tanpa pemeriksaan"
  ENDIF
  IF kunci_API_parser TIDAK terkonfigurasi THEN
    RETURN "tanpa pemeriksaan"
  ENDIF

  TRY
    berkas   = BACA dokumen DARI penyimpanan_peladen
    keluaran = KIRIM berkas KE titik_akhir_parser_artefak
  CATCH galat
    RETURN (status = "gagal", pesan = galat, diperiksaPada = WAKTU_KINI)
  ENDTRY

  RETURN keluaran                       -- daftar orang, peran, peran asli, jenis dokumen
END PROCEDURE
```

### **PSPEC-17 — Penormalan dan Pencocokan Nama Dokumen Bukti**

| Atribut | Keterangan |
| :---- | :---- |
| **Proses DFD** | P11.3 |
| **Masukan** | Daftar nama yang terbaca parser, nama pemilik akun pengunggah |
| **Keluaran** | Daftar entri dokumen yang bersesuaian dengan pemilik akun |
| **Penyimpanan Data** | Tidak mengakses penyimpanan data |
| **FR Terkait** | FR-28 |

Logika pemrosesan:

```
FUNCTION Kunci_Nama(nama)
  s = BUANG keterangan dalam tanda kurung DARI nama
  IF s MEMUAT koma THEN s = POTONG s PADA koma pertama ENDIF
  REPEAT
    s = BUANG gelar depan DI AWAL s       -- prof, dr, drs, dra, ir, h, hj, st, se, spd
  UNTIL s TIDAK BERUBAH                    -- gelar depan dapat bertumpuk
  token = PECAH s MENJADI token
  WHILE JUMLAH(token) > 1 DAN token TERAKHIR MEMUAT titik DO
    BUANG token TERAKHIR                   -- sisa gelar belakang tanpa koma
  ENDWHILE
  RETURN token DIGABUNG, tanpa tanda baca, spasi tunggal, huruf kecil
END FUNCTION

PROCEDURE Pencocokan_Nama_Bukti
  RECEIVE daftarNamaDokumen, namaAkun
  kunciAkun = Kunci_Nama(namaAkun)
  cocok     = KOSONG

  FOR SETIAP namaDokumen DALAM daftarNamaDokumen DO
    kunciDokumen = Kunci_Nama(namaDokumen)

    IF kunciDokumen = kunciAkun THEN
      TAMBAHKAN namaDokumen KE cocok
    ELSE IF RAPATKAN(kunciDokumen) = RAPATKAN(kunciAkun) THEN
      TAMBAHKAN namaDokumen KE cocok       -- toleransi galat pemenggalan pindaian
    ELSE
      dasarDokumen = BUANG token satu huruf DARI kunciDokumen
      dasarAkun    = BUANG token satu huruf DARI kunciAkun
      IF JUMLAH_TOKEN(sisi terpendek) >= 2
         DAN salah satu dasar MERUPAKAN AWALAN dasar lainnya PADA batas token THEN
        TAMBAHKAN namaDokumen KE cocok     -- marga panjang yang disingkat pada dokumen
      ENDIF
    ENDIF
  ENDFOR

  RETURN cocok
END PROCEDURE
```

### **PSPEC-18 — Pemeriksaan Peran dan Penetapan Status Pemeriksaan**

| Atribut | Keterangan |
| :---- | :---- |
| **Proses DFD** | P11.4 sampai P11.5 |
| **Masukan** | Daftar orang beserta peran dari dokumen, daftar entri yang cocok, kode aturan dan parameter kegiatan |
| **Keluaran** | Hasil pemeriksaan berisi status akhir, nama yang cocok, seluruh nama terdeteksi beserta perannya, peran yang diklaim, dan peran yang tertulis pada dokumen |
| **Penyimpanan Data** | D8 dokumen\_kegiatan (tulis) |
| **FR Terkait** | FR-28, FR-29 |

Logika pemrosesan:

```
PROCEDURE Pemeriksaan_Peran_dan_Status
  RECEIVE orangDokumen, entriCocok, kodeRule, parameter

  IF orangDokumen KOSONG THEN
    SIMPAN KE D8 (status = "tanpa_nama")  -- pemeriksaan tidak menyimpulkan apa pun
    RETURN
  ENDIF
  IF entriCocok KOSONG THEN
    SIMPAN KE D8 (status = "tidak_cocok", namaTerdeteksi, orangTerdeteksi)
    RETURN
  ENDIF

  CASE kodeRule = "EDU203" DAN parameter.peran DALAM ("PembimbingUtama", "PembimbingPendamping")
    ujiPeran = penguji yang membedakan pembimbing utama dari pembimbing pendamping;
               entri yang tertulis sebagai penguji dinyatakan bertentangan
  CASE kodeRule = "EDU301" DAN parameter.peranPenguji DALAM ("Ketua", "Anggota")
    ujiPeran = penguji yang membedakan ketua dari anggota penguji;
               entri yang tertulis sebagai pembimbing dinyatakan bertentangan
  CASE kodeRule DALAM ("EDU201", "EDU202")
    ujiPeran = penguji yang memastikan peran termasuk rumpun pembimbingan
  CASE LAINNYA
    ujiPeran = TIDAK ADA
  ENDCASE

  IF ujiPeran TIDAK ADA THEN
    SIMPAN KE D8 (status = "cocok", namaCocok, namaTerdeteksi, orangTerdeteksi)
    RETURN
  ENDIF

  FOR SETIAP entri DALAM entriCocok DO
    nilai[entri] = ujiPeran(entri)        -- sesuai | bertentangan | tidak dapat dipastikan
  ENDFOR

  IF TIDAK ADA nilai bernilai "sesuai" DAN ADA nilai bernilai "bertentangan" THEN
    SIMPAN KE D8 (status = "peran_tidak_sesuai", peranDiharapkan, peranTerdeteksi)
  ELSE
    SIMPAN KE D8 (status = "cocok", peranDiharapkan,
                  pesan = "peran tidak dapat dipastikan" BILA tidak ada yang bernilai "sesuai")
  ENDIF
END PROCEDURE
```

### **PSPEC-19 — Peninjauan Hasil Pemeriksaan oleh Asesor**

| Atribut | Keterangan |
| :---- | :---- |
| **Proses DFD** | P11 |
| **Masukan** | Perintah pemeriksaan ulang, perintah persetujuan manual, perintah pencabutan persetujuan, identitas asesor |
| **Keluaran** | Hasil pemeriksaan yang diperbarui, jumlah temuan pada halaman penilaian |
| **Penyimpanan Data** | D4 penugasan\_asesor (baca), D7 kegiatan (baca), D8 dokumen\_kegiatan (baca, tulis) |
| **FR Terkait** | FR-29, FR-30 |

Logika pemrosesan:

```
PROCEDURE Peninjauan_Hasil_Pemeriksaan
  RECEIVE idPenugasan, idDokumen, aksi, idAsesor

  penugasan = BACA D4 WHERE id_penugasan = idPenugasan
  IF penugasan.id_asesor <> idAsesor THEN TOLAK "Penugasan tidak ditemukan" ENDIF
  dokumen = BACA D8 WHERE id_dokumen = idDokumen
  IF dokumen TIDAK BERADA PADA dokumen BKD penugasan tersebut THEN
    TOLAK "Dokumen tidak ditemukan pada laporan ini"
  ENDIF

  CASE aksi = "periksa ulang"
    IF dokumen TIDAK memenuhi syarat pemeriksaan THEN
      TOLAK "Dokumen tidak dapat diperiksa"
    ENDIF
    hasil = PANGGIL PSPEC-16, PSPEC-17, PSPEC-18 (pemicu = "atas permintaan")
    TIMPA verifikasi PADA D8 DENGAN hasil
  ENDCASE

  CASE aksi = "setujui"
    IF verifikasi PADA D8 KOSONG THEN TOLAK "Belum ada hasil pemeriksaan" ENDIF
    TAMBAHKAN blok persetujuan (idAsesor, nama, waktu) KE verifikasi
    -- hasil pembacaan parser tidak dihapus
  ENDCASE

  CASE aksi = "cabut persetujuan"
    BUANG blok persetujuan DARI verifikasi
  ENDCASE

  temuan = JUMLAH kegiatan PADA dokumen BKD YANG MEMILIKI dokumen bukti
           DENGAN status DALAM ("tidak_cocok", "peran_tidak_sesuai")
           DAN TANPA blok persetujuan
  RETURN temuan
END PROCEDURE
```

### **PSPEC-20 — Input Kegiatan Berbasis Penugasan oleh Administrator**

| Atribut | Keterangan |
| :---- | :---- |
| **Proses DFD** | P6 |
| **Masukan** | Dosen tujuan, kode aturan, judul dan rincian kegiatan, parameter kegiatan, mode aksi |
| **Keluaran** | Kegiatan berstatus portofolio pada dokumen BKD laporan dosen tujuan |
| **Penyimpanan Data** | D1 pengguna (baca), D2 periode\_bkd (baca), D3 lkd (baca, tulis), D5 referensi\_kegiatan (baca), D7 kegiatan (baca, tulis) |
| **FR Terkait** | FR-31 |

Logika pemrosesan:

```
PROCEDURE Input_Kegiatan_oleh_Administrator
  RECEIVE idDosen, kodeRule, judul, rincian, parameter, mode

  periode = BACA D2 WHERE status = "aktif"
  IF periode TIDAK ADA THEN TOLAK "Belum ada periode BKD aktif" ENDIF
  IF kodeRule TIDAK DALAM daftar butir berbasis penugasan THEN
    TOLAK "Jenis kegiatan ini diisi sendiri oleh dosen"
  ENDIF

  dosen = BACA D1 WHERE id_pengguna = idDosen
  IF dosen.peran <> "dosen" ATAU dosen TIDAK aktif THEN
    TOLAK "Dosen tujuan tidak ditemukan atau sudah nonaktif"
  ENDIF
  referensi = BACA D5 WHERE kode_rule = kodeRule
  sksX100   = PANGGIL PSPEC-09 (kodeRule, parameter)

  lkd = BACA D3 WHERE id_pengguna = idDosen AND id_periode = periode AND jenis = "laporan"
  IF lkd TIDAK ADA THEN BUAT lkd PADA D3 ENDIF
  IF lkd.simpan_permanen THEN
    TOLAK "Dokumen BKD sudah disimpan permanen"
  ENDIF

  CASE mode = "tambah"
    IF ADA kegiatan PADA D7 DENGAN (lkd, referensi, judul) YANG SAMA THEN
      TOLAK "Kegiatan sudah tercatat pada dosen tersebut"
    ENDIF
    SIMPAN KE D7 (judul, rincian, parameter, sksX100, statusPerhitungan,
                  status = "diajukan", sumber_data = "admin", diklaim = salah)
  ENDCASE

  CASE mode = "ubah"
    lama = BACA D7 WHERE id_kegiatan = idKegiatan
    IF lama.sumber_data <> "admin" THEN TOLAK "Bukan kegiatan hasil input administrator" ENDIF
    IF lama.diklaim THEN TOLAK "Kegiatan sudah diklaim dosen" ENDIF
    PERBARUI D7 (judul, rincian, parameter, sksX100, statusPerhitungan)
  ENDCASE

  CASE mode = "hapus"
    IF kegiatan.sumber_data <> "admin" ATAU kegiatan.diklaim THEN
      TOLAK "Hanya kegiatan input administrator yang belum diklaim yang dapat dihapus"
    ENDIF
    HAPUS DARI D7
  ENDCASE
END PROCEDURE
```

## **Appendix B: Matriks Keterlacakan** {#appendix-b-matriks-keterlacakan}

*Appendix* ini menyajikan keterlacakan dua arah antara persyaratan fungsional, proses pada *Data Flow Diagram*, spesifikasi proses, fitur sistem, modul implementasi, dan jenis pengujian yang memverifikasinya. Kolom Modul Implementasi merujuk pada kode implementasi yang digunakan pada Tabel IV.30 Laporan Tugas Akhir.

Tabel B.1. Matriks Keterlacakan Persyaratan Fungsional

| FR | Fitur | Proses | PSPEC | Modul Implementasi | Jenis Pengujian |
| :---: | :---: | :---: | :---: | :---: | ----- |
| FR-01 | AUT | P1 | PSPEC-01 | IM-04 | *Integration*, *System* |
| FR-02 | AUT | P1 | PSPEC-01 | IM-04 | *Integration*, *System* |
| FR-03 | USR | P2 | PSPEC-02 | IM-08 | *Integration* |
| FR-04 | USR | P2 | PSPEC-02 | IM-03, IM-08 | *Integration*, *System* |
| FR-05 | PRD | P3 | PSPEC-03 | IM-08 | *Integration* |
| FR-06 | PRD | P3 | PSPEC-03 | IM-06, IM-08 | *Integration*, *System* |
| FR-07 | ASR | P4 | PSPEC-04 | IM-08 | *Integration*, *System* |
| FR-08 | REF | P5 | PSPEC-09 | IM-08 | *Integration* |
| FR-09 | EKS | P6 | PSPEC-05 | IM-05 | *Unit*, *Integration*, *System* |
| FR-10 | EKS | P6 | PSPEC-06 | IM-05 | *Unit*, *Integration*, *System* |
| FR-11 | EKS | P6 | PSPEC-07 | IM-05 | *Integration*, *System* |
| FR-12 | EKS | P6 | PSPEC-07 | IM-05 | *Integration*, *System* |
| FR-13 | KEG | P7 | PSPEC-08 | IM-06 | *Integration*, *System* |
| FR-14 | KEG | P7 | PSPEC-08 | IM-06 | *Integration*, *System* |
| FR-15 | KEG | P7 | PSPEC-08 | IM-06 | *Integration*, *System* |
| FR-16 | KEG | P7 | PSPEC-08 | IM-06 | *Integration* |
| FR-17 | KEG | P7 | PSPEC-08 | IM-06 | *Integration*, *System* |
| FR-18 | HIT | P8 | PSPEC-09, PSPEC-10 | IM-01, IM-03 | *Unit*, Uji Akurasi, *Integration* |
| FR-19 | HIT | P8 | PSPEC-09 | IM-01 | *Unit*, *Integration* |
| FR-20 | NIL | P9 | PSPEC-11 | IM-07 | *Integration*, *System* |
| FR-21 | NIL | P9 | PSPEC-11 | IM-07 | *Integration*, *System* |
| FR-22 | TOK | P9 | PSPEC-12 | IM-07 | *System* |
| FR-23 | TOK | P9 | PSPEC-12 | IM-03, IM-07 | *System* |
| FR-24 | TOK | P9 | PSPEC-13, PSPEC-14 | IM-02, IM-03 | *Unit*, *Integration*, *System* |
| FR-25 | LAP | P10 | PSPEC-13, PSPEC-14 | IM-02, IM-03 | *Unit*, *Integration*, *System* |
| FR-26 | LAP | P10 | PSPEC-15 | IM-03, IM-09 | *Integration*, *System* |
| FR-27 | LAP | P10 | PSPEC-15 | IM-09 | *Integration*, *System* |
| FR-28 | VER | P11 | PSPEC-16, PSPEC-17, PSPEC-18 | IM-10 | *Integration*, *System* |
| FR-29 | VER | P11 | PSPEC-18 | IM-10 | *Integration*, *System* |
| FR-30 | VER | P11 | PSPEC-19 | IM-10 | *Integration*, *System* |
| FR-31 | EKS | P6 | PSPEC-20 | IM-11 | *Integration*, *System* |
| FR-32 | AUT | P1 | PSPEC-01 | IM-11 | *System* |

Tabel B.2. Matriks Keterlacakan Persyaratan Nonfungsional

| NFR | Atribut Kualitas | Kriteria SRS | Cara Verifikasi |
| :---: | ----- | :---: | ----- |
| NFR-01 | *Functional suitability* — *functional correctness* | SA-FUN-01 | Uji akurasi perhitungan terhadap perhitungan manual |
| NFR-02 | *Reliability* — *maturity* | SA-REL-01 | Pemanggilan berulang dengan parameter identik |
| NFR-03 | *Reliability* — *fault tolerance* | SA-REL-02, PR-03 | Uji fungsional dengan titik akhir RPC dinonaktifkan |
| NFR-04 | *Security* — *confidentiality* | SA-SEC-01, SA-SEC-02 | Inspeksi basis data dan berkas keluaran *build* |
| NFR-05 | *Security* — *authenticity* | SA-SEC-03 | Uji akses lintas peran dan akses tanpa sesi |
| NFR-06 | *Security* — *integrity* | SA-SEC-04, SA-SEC-05, SA-SEC-06 | Penghitungan ulang *hash*, uji peran kontrak, uji pemindahan token |
| NFR-07 | *Maintainability* — *modularity* | SA-MNT-01, SA-MNT-02 | Pemeriksaan pemetaan aturan ke fungsi dan analisis ketergantungan |
| NFR-08 | *Maintainability* — *testability* | SA-MNT-03 | Eksekusi pengujian unit pada jaringan simulasi |
| NFR-09 | *Usability* — *user error protection* | SA-USB-01 | Uji alur aksi krusial |
| NFR-10 | *Usability* — *operability* | SA-USB-02 | Uji alur pengguna dosen dan asesor |
| NFR-11 | *Portability* — *installability* | SA-PRT-01 | Pemasangan ulang pada lingkungan bersih |
| NFR-12 | *Performance efficiency* — *time behaviour* | PR-06 | Pembacaan *event* pada rentang blok melebihi batas penyedia |
| NFR-13 | *Reliability* — *fault tolerance* | SA-REL-04, PR-08 | Unggah dokumen bukti dengan layanan ekstraksi dinonaktifkan |
| NFR-14 | *Functional suitability* — *functional appropriateness* | SA-FUN-03 | Uji alur persetujuan manual asesor beserta pemeriksaan muatan hasil setelahnya |





