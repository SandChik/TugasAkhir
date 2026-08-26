# Literatur untuk Empat Celah Teori Bab II — LedgerDik

Empat celah teori pada Bab II dapat ditutup dengan sumber yang berkas PDF-nya sudah
diperiksa langsung: jumlah halaman dan judul tercetak pada halaman pertama dicocokkan
dengan klaim metadata, bukan disimpulkan dari judul. Dua berkas yang sebelumnya tidak
dapat diunduh kini telah dilampirkan dan terverifikasi, yaitu Ohlhaver, Weyl dan Buterin
(2022) untuk landasan soulbound dan Bilenko dkk. (2003) untuk pencocokan nama. Szabo
(1997) dikeluarkan dari rekomendasi karena tidak memiliki berkas PDF, dan asal-usul istilah
*smart contract* dirujuk melalui sitasi sekunder.

Satu pola tetap perlu diperhatikan. Untuk celah EVM, sumber kanonik yang paling tepat
justru bukan makalah peer-reviewed: Yellow Paper adalah spesifikasi hidup yang direvisi
terus-menerus, sehingga wajib didampingi sumber peer-reviewed yang memformalkan
semantik yang sama. Hal serupa berlaku pada celah token non-transferable, karena
Ohlhaver dkk. (2022) berstatus praprint SSRN meski berkasnya sudah terverifikasi.

## Tabel ringkas pilihan utama

| Celah | Sumber pilihan utama | Tahun | Venue | Status peer-review |
|---|---|---|---|---|
| 1. Smart contract & determinisme | Zheng, Z. dkk. 'An overview on smart contracts: Challenges, advances and platforms' | 2020 | *Future Generation Computer Systems*, 105 | Peer-reviewed (jurnal Q1, Elsevier) |
| 2. EVM: model eksekusi, gas, mesin keadaan | Wood, G. *Ethereum: A Secure Decentralised Generalised Transaction Ledger* (Yellow Paper) | 2025 | Spesifikasi resmi, Shanghai version efc5f9a | **Bukan** peer-reviewed (spesifikasi teknis) |
| 3. ERC-20 & token non-transferable | Di Angelo, M. dan Salzer, G. 'Identification of token contracts on Ethereum: standard compliance and beyond' | 2023 | *International Journal of Data Science and Analytics*, 16(3) | Peer-reviewed (Springer, open access) |
| 4. Pencocokan nama orang | Christen, P. 'A Comparison of Personal Name Matching: Techniques and Practical Issues' | 2006 | ICDMW'06, IEEE | Peer-reviewed (prosiding lokakarya IEEE) |

Untuk celah 2 tidak ada sumber peer-reviewed yang dapat menggantikan Yellow Paper sebagai
rujukan normatif EVM. Pendampingnya, Grishchenko dkk. (2018), adalah makalah peer-reviewed
yang memformalkan semantik yang sama.

## Celah 1 — Smart contract dan determinisme

### Pilihan utama: Zheng dkk. (2020)

**a. Daftar Pustaka (Harvard, Cite Them Right)**
Zheng, Z., Xie, S., Dai, H.-N., Chen, W., Chen, X., Weng, J. and Imran, M. (2020) 'An overview on smart contracts: Challenges, advances and platforms', *Future Generation Computer Systems*, 105, pp. 475–491. doi: 10.1016/j.future.2019.12.019.

**b. DOI / tautan unduh**
DOI: [10.1016/j.future.2019.12.019](https://doi.org/10.1016/j.future.2019.12.019). Versi penulis yang dapat diunduh bebas: [arXiv:1912.10370v1](https://arxiv.org/pdf/1912.10370v1) (diunggah 22 Desember 2019; kolom `journal_ref` arXiv mencantumkan *Future Generation Computer Systems*, 2019).

**c. Data verifikasi berkas** — PDF arXiv: **19 halaman**. Judul tercetak pada halaman pertama: "An Overview on Smart Contracts: Challenges, Advances and Platforms", dengan baris penulis "Zibin Zheng, Shaoan Xie, Hong-Ning Dai, Weili Chen, Xiangping Chen, Jian Weng, Muhammad Imran". Perhatikan penomoran halaman: rujukan halaman di bawah ini mengacu pada PDF arXiv, bukan penomoran jurnal (475–491).

**d. Klaim inti yang dapat disitasi**
Pada bagian pendahuluan (hlm. 1) dinyatakan bahwa smart contract memungkinkan ketentuan suatu perjanjian dijalankan secara otomatis tanpa campur tangan pihak ketiga yang dipercaya. Dalam daftar keunggulan smart contract (hlm. 2, butir "Reducing risks") dijelaskan bahwa karena sifat *immutable* blockchain, smart contract tidak dapat diubah sewenang-wenang setelah diterbitkan, dan seluruh transaksi yang tersimpan terduplikasi di seluruh sistem terdistribusi sehingga dapat dilacak serta diaudit. Bagian II ("Overview of Blockchain and Smart Contract", hlm. 3) menegaskan bahwa smart contract dibangun di atas teknologi blockchain yang menjamin eksekusi kontrak berjalan benar, dan algoritma konsensus terdistribusi memastikan transaksi terlaksana tanpa intervensi pihak ketiga. Pada hlm. 4 disebutkan secara eksplisit bahwa kontrak yang tersimpan di blockchain tidak dapat dimodifikasi, dan setiap perubahan menuntut penerbitan kontrak baru.

**e. Penempatan di Bab II**
Subbab *Smart Contract*, sebagai definisi dan sumber sifat dasar. Menopang kalimat seperti: "Smart contract memungkinkan ketentuan perjanjian dieksekusi secara otomatis tanpa perantara pihak ketiga yang dipercaya, dan karena sifat *immutable* blockchain, aturan yang telah diterbitkan tidak dapat diubah sewenang-wenang (Zheng dkk., 2020)." Klaim terakhir inilah yang melandasi argumen LedgerDik bahwa Rubrik BKD yang ditanam on-chain tidak dapat diubah diam-diam oleh administrator.

### Asal-usul istilah: sitasi sekunder melalui Zheng dkk.

Szabo (1997) tidak lagi direkomendasikan sebagai entri Daftar Pustaka karena artikelnya
hanya tersedia sebagai galley HTML di *First Monday*, tanpa berkas PDF dan tanpa
penomoran halaman. Namun asal-usul istilah tetap dapat dinyatakan di Bab II melalui
sitasi sekunder, karena Zheng dkk. (2020) sendiri menuliskannya pada hlm. 1: smart
contract pertama kali diusulkan pada era 1990-an oleh Nick Szabo, dan dalam smart
contract klausul kontrak yang ditulis sebagai program komputer akan dieksekusi secara
otomatis ketika kondisi yang telah ditetapkan terpenuhi.

Bentuk sitasi sekunder yang sesuai Cite Them Right: "Smart contract pertama kali
diusulkan oleh Szabo pada era 1990-an (Szabo, 1997, dikutip dalam Zheng dkk., 2020,
hlm. 1)." Dengan cara ini hanya Zheng dkk. (2020) yang masuk Daftar Pustaka, sesuai
konvensi Harvard untuk sumber yang tidak Anda akses sendiri, dan laporan tidak perlu
mencantumkan sumber tanpa berkas yang dapat diverifikasi.

### Alternatif determinisme: Androulaki dkk. (2018)

**a.** Androulaki, E. et al. (2018) 'Hyperledger Fabric: a distributed operating system for permissioned blockchains', in *Proceedings of the Thirteenth EuroSys Conference*. New York: ACM, pp. 1–15. doi: 10.1145/3190508.3190538.

**b.** DOI: [10.1145/3190508.3190538](https://doi.org/10.1145/3190508.3190538). Versi penulis: [arXiv:1801.10228v2](https://arxiv.org/pdf/1801.10228) (revisi 17 April 2018).

**c. Data verifikasi berkas** — PDF arXiv: **15 halaman**. Judul tercetak pada halaman pertama: "Hyperledger Fabric: A Distributed Operating System for Permissioned Blockchains".

**d. Klaim inti yang dapat disitasi**
Makalah ini menyebut arsitektur *order-execute* dan menyatakan (hlm. 2) bahwa arsitektur tersebut menuntut semua *peer* mengeksekusi setiap transaksi dan menuntut **semua transaksi bersifat deterministik**; arsitektur ini disebut ditemukan pada hampir semua sistem blockchain yang ada, termasuk Ethereum. Pada hlm. 3–4 dijelaskan mengapa kode non-deterministik menjadi masalah mendasar bagi arsitektur ini, dan bahwa bahasa seperti Solidity memang dirancang terbatas pada eksekusi deterministik. Inilah sumber peer-reviewed paling eksplisit yang ditemukan untuk klaim "mengapa eksekusi smart contract harus deterministik", sebab Zheng dkk. sendiri tidak menyatakannya dengan tegas.

**e. Penempatan di Bab II**
Subbab *Smart Contract*, khusus pada paragraf tentang determinisme. Menopang: "Arsitektur *order-execute* yang dipakai hampir semua platform blockchain, termasuk Ethereum, mensyaratkan setiap *peer* mengeksekusi seluruh transaksi dan menuntut semua transaksi bersifat deterministik, karena hasil eksekusi yang berbeda antar-*peer* akan merusak konsensus (Androulaki dkk., 2018)." Perhatikan bahwa makalah ini secara pokok memperkenalkan Hyperledger Fabric, bukan Ethereum. Sitasilah untuk klaim determinismenya, jangan sebagai rujukan platform LedgerDik.

## Celah 2 — Ethereum Virtual Machine

### Pilihan utama: Wood (Yellow Paper)

**a. Daftar Pustaka (Harvard)**
Wood, G. (2025) *Ethereum: a secure decentralised generalised transaction ledger*. Shanghai version efc5f9a, 4 February 2025. Available at: https://ethereum.github.io/yellowpaper/paper.pdf (Accessed: 25 August 2026).

**b. Tautan unduh** — <https://ethereum.github.io/yellowpaper/paper.pdf> (dokumen tanpa DOI).

**c. Data verifikasi berkas** — **42 halaman**. Baris judul tercetak pada halaman pertama, apa adanya: "ETHEREUM: A SECURE DECENTRALISED GENERALISED TRANSACTION LEDGER / SHANGHAI VERSION efc5f9a – 2025-02-04 / DR. GAVIN WOOD / FOUNDER, ETHEREUM & PARITY". **Nomor revisi wajib dicantumkan**: berkas yang diunduh adalah *Shanghai version* dengan hash revisi `efc5f9a` bertanggal 2025-02-04. Yellow Paper adalah dokumen hidup, sehingga jumlah halaman dan nomor revisi akan berbeda pada unduhan lain. Cantumkan revisi yang benar-benar Anda pakai.

**d. Klaim inti yang dapat disitasi**
Bagian 2 (hlm. 2) memodelkan Ethereum sebagai mesin keadaan berbasis transaksi: transisi keadaan yang sah dirumuskan sebagai σ(t+1) ≡ Υ(σt, T), dengan Υ sebagai fungsi transisi keadaan Ethereum. Bagian 9 "Execution Model" (hlm. 14) menyatakan bahwa EVM adalah mesin **quasi-Turing-complete**, dengan kualifikasi "quasi" berasal dari kenyataan bahwa komputasi dibatasi secara intrinsik oleh parameter *gas* yang menentukan total komputasi yang boleh dilakukan. Subbagian 9.1 "Basics" pada halaman yang sama menerangkan EVM sebagai arsitektur berbasis tumpukan (*stack*) dengan ukuran kata 256 bit, tumpukan maksimum 1024, memori volatil, dan *storage* non-volatil yang menjadi bagian dari keadaan sistem. Bagian 5 "Gas and Payment" (hlm. 8) menjelaskan bahwa seluruh komputasi terprogram di Ethereum dikenai biaya justru untuk menghindari penyalahgunaan jaringan dan mengelak persoalan yang timbul dari sifat Turing-complete. Sebagai catatan pelengkap yang berguna, hlm. 17 (bagian 13.2) menyatakan bahwa menyediakan bilangan acak di dalam sistem deterministik pada dasarnya mustahil, yakni penegasan tak langsung bahwa EVM memang dipandang sebagai sistem deterministik.

**e. Penempatan di Bab II**
Subbab *Ethereum Virtual Machine*. Menopang: "EVM merupakan mesin keadaan berbasis transaksi yang transisinya dirumuskan sebagai σ(t+1) ≡ Υ(σt, T), bersifat *quasi-Turing-complete* karena komputasinya dibatasi oleh parameter gas (Wood, 2025)." Nyatakan secara terbuka di laporan bahwa Yellow Paper adalah spesifikasi teknis resmi dan **bukan** publikasi peer-reviewed.

### Pendamping: Grishchenko dkk. (2018)

**a.** Grishchenko, I., Maffei, M. and Schneidewind, C. (2018) 'A semantic framework for the security analysis of Ethereum smart contracts', in Bauer, L. and Küsters, R. (eds.) *Principles of Security and Trust (POST 2018)*. Lecture Notes in Computer Science. Cham: Springer, pp. 243–269. doi: 10.1007/978-3-319-89722-6_10.

**b.** DOI: [10.1007/978-3-319-89722-6_10](https://doi.org/10.1007/978-3-319-89722-6_10) — open access lisensi CC BY 4.0, PDF resmi: <https://link.springer.com/content/pdf/10.1007%2F978-3-319-89722-6_10.pdf>. Versi praprint yang lebih panjang: [arXiv:1802.08660v2](https://arxiv.org/pdf/1802.08660v2) (revisi 23 April 2018).

**c. Data verifikasi berkas** — PDF Springer: **27 halaman**; judul tercetak pada halaman pertama "A Semantic Framework for the Security Analysis of Ethereum Smart Contracts", penulis Ilya Grishchenko, Matteo Maffei dan Clara Schneidewind (TU Wien). Versi arXiv v2 lebih panjang, **51 halaman**, dan judulnya tercetak dengan huruf kecil pada "smart contracts": "A Semantic Framework for the Security Analysis of Ethereum smart contracts". Gunakan versi Springer bila mengutip nomor halaman prosiding.

**d. Klaim inti yang dapat disitasi**
Makalah ini menyajikan semantik *small-step* pertama yang lengkap untuk bytecode EVM, diformalkan dalam pembuktian teorema F* (abstrak, hlm. 1; kontribusi dirinci hlm. 3). Pada hlm. 4 dinyatakan bahwa eksekusi yang sesungguhnya Turing-complete dibatasi oleh sumber daya gas yang ditetapkan di awal, yang secara efektif membatasi jumlah langkah eksekusi. Bagian semantiknya (hlm. 8) menerangkan bahwa keadaan eksekusi ditentukan oleh keadaan global σ sistem beserta *execution environment* ι yang memuat parameter transaksi saat itu, termasuk masukan dan kode yang dieksekusi; hlm. 9 menjelaskan bahwa instruksi yang dijalankan dipilih melalui *program counter* pada kode di lingkungan eksekusi tersebut. Adanya semantik operasional formal inilah yang menjadi dasar teoretis pernyataan bahwa perilaku EVM tertentu dan dapat diprediksi.

**e. Penempatan di Bab II**
Subbab *Ethereum Virtual Machine*, pada paragraf yang menjelaskan model eksekusi dan basis formalnya. Menopang: "Model eksekusi EVM telah diformalkan sebagai semantik *small-step* yang lengkap atas bytecode, sehingga perilaku setiap instruksi terdefinisi secara presisi; eksekusi yang secara prinsip Turing-complete dibatasi oleh gas yang ditetapkan di awal transaksi (Grishchenko, Maffei dan Schneidewind, 2018)." Sumber ini menyediakan legitimasi peer-reviewed yang tidak dimiliki Yellow Paper.

### Karakteristik Layer-2: Gangwal dkk. (2023)

**a.** Gangwal, A., Gangavalli, H.R. and Thirupathi, A. (2023) 'A survey of Layer-two blockchain protocols', *Journal of Network and Computer Applications*, 209, 103539. doi: 10.1016/j.jnca.2022.103539.

**b.** DOI: [10.1016/j.jnca.2022.103539](https://doi.org/10.1016/j.jnca.2022.103539). Versi penulis: [arXiv:2204.08032v3](https://arxiv.org/pdf/2204.08032v3) (revisi 26 Juli 2022).

**c. Data verifikasi berkas** — PDF arXiv v3: **21 halaman**. Judul tercetak pada halaman pertama: "A Survey of Layer-Two Blockchain Protocols" (perhatikan kapitalisasi "Layer-Two" pada praprint berbeda dari "Layer-two" pada judul jurnal terbitan).

**d. Klaim inti yang dapat disitasi**
*Ringkasan ini bersumber dari abstrak dan halaman pembuka saja; badan makalah belum ditelaah menyeluruh.* Abstrak (hlm. 1) menyatakan bahwa sistem berbasis blockchain masih terkendala laju transaksi yang rendah dan latensi pemrosesan yang tinggi sehingga menghambat skalabilitas, dan bahwa satu kelas solusi utuh — protokol Layer-2 — hadir untuk mengatasinya. Untuk klaim spesifik tentang OP Stack atau Base, sumber ini tidak memadai. Keduanya perlu dirujuk ke dokumentasi resmi masing-masing.

**e. Penempatan di Bab II**
Subbab *Jaringan Layer-2* atau paragraf yang menerangkan alasan pemilihan Base Sepolia. Menopang: "Protokol Layer-2 dikembangkan untuk mengatasi keterbatasan laju transaksi dan latensi pada blockchain Layer-1 (Gangwal, Gangavalli dan Thirupathi, 2023)." Bila laporan hendak mengklaim sifat teknis Base atau OP Stack secara khusus, rujuk dokumentasi resminya dan nyatakan statusnya sebagai dokumentasi, bukan sumber peer-reviewed.

## Celah 3 — ERC-20 dan token non-transferable

### Pilihan utama: Di Angelo dan Salzer (2023)

**a. Daftar Pustaka (Harvard)**
Di Angelo, M. and Salzer, G. (2023) 'Identification of token contracts on Ethereum: standard compliance and beyond', *International Journal of Data Science and Analytics*, 16(3), pp. 333–352. doi: 10.1007/s41060-021-00281-1.

**b.** DOI: [10.1007/s41060-021-00281-1](https://doi.org/10.1007/s41060-021-00281-1) — open access CC BY 4.0, PDF: <https://link.springer.com/content/pdf/10.1007/s41060-021-00281-1.pdf>.

**c. Data verifikasi berkas** — **20 halaman**. Judul tercetak pada halaman pertama: "Identification of token contracts on Ethereum: standard compliance and beyond", dengan tajuk "REGULAR PAPER" dan baris volume tercetak "International Journal of Data Science and Analytics (2023) 16:333–352". Halaman pertama juga mencantumkan "Received: 3 November 2020 / Accepted: 19 August 2021 / Published online: 3 September 2021" serta "© The Author(s) 2021, corrected publication 2022" — inilah sebabnya tahun sitasi (2023, tahun terbitan volume) berbeda dari tahun *online first*.

**d. Klaim inti yang dapat disitasi**
Pada bagian 4.1 "Accepted token standards" (hlm. 3) dinyatakan bahwa ERC-20 Token Standard adalah standar token yang paling luas dipakai dan paling umum, menyediakan fungsi dasar untuk memindahkan token serta mekanisme persetujuan agar token dapat dibelanjakan oleh pihak ketiga on-chain, dan bahwa standar tersebut mencantumkan **enam fungsi wajib, tiga fungsi opsional, dan dua *event*** yang harus diimplementasikan oleh API yang patuh. Bagian pendahuluan (hlm. 2) menerangkan bahwa kontrak token memelihara buku besar pencatat kepemilikan token, dan mayoritas kontrak mengimplementasikan token *fungible* yang saling tak terbedakan sehingga cukup menyimpan jumlah token per pemegang. Halaman yang sama juga membedakan ERC-721 sebagai standar token non-fungible.

**e. Penempatan di Bab II**
Subbab *Standar Token ERC-20*. Menopang: "ERC-20 merupakan standar token yang paling luas dipakai di Ethereum dan mendefinisikan enam fungsi wajib, tiga fungsi opsional, serta dua *event* yang harus diimplementasikan kontrak yang patuh (Di Angelo dan Salzer, 2023)." Sumber ini dipilih sebagai utama karena ia satu-satunya rujukan peer-reviewed yang ditemukan yang mendeskripsikan isi normatif ERC-20 secara terukur, bukan sekadar menyebut namanya.

### Spesifikasi resmi: EIP-20

**a.** Vogelsteller, F. and Buterin, V. (2015) *ERC-20: Token Standard*. Ethereum Improvement Proposals, no. 20. Available at: https://eips.ethereum.org/EIPS/eip-20 (Accessed: 25 August 2026).

**b.** <https://eips.ethereum.org/EIPS/eip-20> — dokumen web, tanpa DOI dan tanpa PDF resmi.

**c. Data verifikasi berkas** — tidak ada berkas PDF; jumlah halaman tidak berlaku. Judul tercetak pada halaman: "ERC-20: Token Standard", dengan metadata "Final", "Standards Track: ERC", penulis "Fabian Vogelsteller, Vitalik Buterin", dan "Created 2015-11-19". Perhatikan penamaannya: halaman resmi kini memakai judul "ERC-20", bukan "EIP-20", walaupun nomor proposalnya tetap EIP-20.

**d. Klaim inti yang dapat disitasi**
Bagian Abstract menyatakan standar ini memungkinkan implementasi API baku untuk token di dalam smart contract, menyediakan fungsionalitas dasar untuk memindahkan token serta menyetujui token agar dapat dibelanjakan pihak ketiga on-chain. Bagian Motivation menyebutkan bahwa antarmuka baku memungkinkan token apa pun di Ethereum digunakan kembali oleh aplikasi lain, dari dompet hingga bursa terdesentralisasi. Bagian Specification memuat metode `totalSupply`, `balanceOf`, `transfer`, `transferFrom`, `approve`, `allowance` beserta *event* `Transfer` dan `Approval`. Statusnya **Final**, namun EIP bukan publikasi peer-reviewed sehingga sebaiknya didampingi Di Angelo dan Salzer (2023).

**e. Penempatan di Bab II**
Subbab *Standar Token ERC-20*, sebagai rujukan normatif antarmuka. Menopang: "Antarmuka ERC-20 mencakup fungsi `totalSupply`, `balanceOf`, `transfer`, `transferFrom`, `approve`, dan `allowance` beserta *event* `Transfer` dan `Approval` (Vogelsteller dan Buterin, 2015)." Inilah rujukan yang tepat ketika laporan menjelaskan fungsi mana yang di-*override* LedgerDik untuk memblokir pemindahan token.

### Landasan konseptual: Ohlhaver, Weyl dan Buterin (2022)

**a. Daftar Pustaka (Harvard)**
Ohlhaver, P., Weyl, E.G. and Buterin, V. (2022) *Decentralized society: finding Web3's soul*. SSRN Working Paper. doi: 10.2139/ssrn.4105763.

**b. DOI / tautan unduh**
DOI: [10.2139/ssrn.4105763](https://doi.org/10.2139/ssrn.4105763). Berkas tersedia melalui SSRN: <https://ssrn.com/abstract=4105763>.

**c. Data verifikasi berkas** — **37 halaman**. Judul tercetak pada halaman pertama: "Decentralized Society: Finding Web3's Soul", diikuti baris penulis dan tanggal "May 2022". Setiap halaman memuat penanda "Electronic copy available at: https://ssrn.com/abstract=4105763". Dua catatan teknis yang penting. Pertama, **urutan penulis pada berkas berbeda dari rekaman Crossref**: halaman pertama PDF mencetak "Puja Ohlhaver, E. Glen Weyl, Vitalik Buterin", sedangkan Crossref mendaftar Weyl lebih dahulu. Ikuti urutan pada berkas, sebab itulah urutan yang dicetak penulisnya sendiri; karena itu entri di atas dimulai dengan Ohlhaver, bukan Weyl. Kedua, **penomoran tercetak bergeser satu halaman dari penomoran PDF**: halaman PDF ke-2 bertanda "1", sehingga halaman tercetak terakhir adalah "36" pada halaman PDF ke-37. Nomor halaman di bawah ini mengacu pada penomoran PDF.

**d. Klaim inti yang dapat disitasi**
Abstrak (hlm. 1) menyatakan bahwa Web3 saat ini berpusat pada aset yang dapat dipindahtangankan dan terfinansialisasi, padahal banyak kegiatan ekonomi inti dibangun atas hubungan yang persisten dan **tidak dapat dipindahtangankan**; para penulis lalu menunjukkan bagaimana *soulbound token* (SBT) yang mewakili komitmen, kredensial, dan afiliasi para "Souls" dapat menyandikan jejaring kepercayaan ekonomi riil untuk menetapkan provenans dan reputasi. Bagian §3 "SOULS" (hlm. 3) merumuskan primitif utamanya: akun atau dompet yang memegang token yang terlihat publik dan **tidak dapat dipindahtangankan, meskipun mungkin dapat dicabut oleh penerbitnya**; akun tersebut disebut "Souls" dan tokennya disebut "Soulbound Tokens" (SBT). Halaman yang sama menyebut contoh yang langsung relevan bagi LedgerDik: sebuah Soul dapat menyimpan SBT yang mewakili kredensial pendidikan atau riwayat pekerjaan, dan kekuatan sesungguhnya mekanisme ini muncul ketika SBT yang dipegang satu Soul **diterbitkan atau diatestasi oleh Soul lain** yang menjadi mitra hubungan tersebut, misalnya individu, perusahaan, atau institusi. Pada hlm. 3–4 diberikan contoh eksplisit bahwa sebuah universitas dapat menjadi Soul yang menerbitkan SBT kepada para lulusannya. Bagian §4.3 "Not Losing Your Soul" (hlm. 6) menambahkan konsekuensi desain yang jujur untuk dikutip: ketidakdapatan-pindahan SBT kunci, seperti kredensial pendidikan yang diterbitkan sekali, memunculkan persoalan pemulihan akses bila dompet hilang.

**e. Penempatan di Bab II**
Subbab *Token Non-Transferable (Soulbound)*, sebagai landasan konseptual dan asal istilah. Menopang: "Konsep *soulbound token* diperkenalkan sebagai token yang tidak dapat dipindahtangankan dan terikat pada dompet pemiliknya, yang mewakili komitmen, kredensial, dan afiliasi pemegangnya (Ohlhaver, Weyl dan Buterin, 2022)." Contoh universitas yang menerbitkan SBT kepada lulusannya pada hlm. 3–4 adalah analogi paling dekat dengan LedgerDik, di mana institusi menerbitkan kredit SKS ke wallet kustodian dosen dan kredit tersebut tidak dapat dipindahtangankan. Bagian §4.3 juga layak dikutip pada subbab pembahasan keterbatasan, karena persoalan pemulihan akses dompet berlaku pula bagi LedgerDik. Nyatakan secara terbuka bahwa dokumen ini berstatus **praprint SSRN, bukan publikasi peer-reviewed**, dan sandingkan dengan Pericàs-Gornals dkk. (2024) untuk klaim yang memerlukan bobot peer-review.

### Pendamping: Pericàs-Gornals dkk. (2024)

**a.** Pericàs-Gornals, R., Mut-Puigserver, M., Payeras-Capellá, M.M., Cabot-Nadal, M.Á. and Ramis-Bibiloni, J. (2024) 'Digital credentials management system using rejectable soulbound tokens', *Annals of Telecommunications*, 79(11–12), pp. 843–855. doi: 10.1007/s12243-024-01032-6.

**b.** DOI: [10.1007/s12243-024-01032-6](https://doi.org/10.1007/s12243-024-01032-6) — open access CC BY 4.0, PDF: <https://link.springer.com/content/pdf/10.1007/s12243-024-01032-6.pdf>.

**c. Data verifikasi berkas** — **13 halaman**. Judul tercetak pada halaman pertama: "Digital credentials management system using rejectable soulbound tokens", dengan tajuk "RESEARCH", tanggal "Received: 11 January 2024 / Accepted: 25 March 2024", dan "© The Author(s) 2024".

**d. Klaim inti yang dapat disitasi**
Abstrak (hlm. 1) menyatakan bahwa persyaratan krusial bagi kredensial adalah **ketidakdapatan-pindahan (non-transferability)** kredensial tersebut, disertai penerimaan eksplisit dari pengguna yang akan memilikinya. Bagian pendahuluan (hlm. 2) menerangkan bahwa untuk memenuhi persyaratan pertama itu, Buterin dkk. memperkenalkan varian NFT bernama *soulbound token* (SBT) yang tujuan utamanya menjamin ketidakdapatan-pindahan aset, dan SBT dirancang khusus agar terikat pada dompet pengguna, yang oleh para penulisnya disebut "Souls". Halaman yang sama juga memuat catatan penting bagi LedgerDik: SBT saat ini belum memiliki fitur yang memungkinkan pengguna menerima atau menolak token, dan **belum ada implementasi standar** dari usulan Buterin dkk. Bagian kesimpulan (hlm. 11) menegaskan bahwa standar token yang ada saat ini tidak memenuhi properti yang dikehendaki untuk kredensial, khususnya non-transferability sekaligus *rejectability*.

**e. Penempatan di Bab II**
Subbab *Token Non-Transferable (Soulbound)*. Menopang: "Kredensial digital menuntut sifat tidak-dapat-dipindahtangankan, dan *soulbound token* diperkenalkan justru untuk menjamin sifat tersebut dengan mengikat token pada dompet pemiliknya (Pericàs-Gornals dkk., 2024)." Sumber ini menjadi rujukan peer-reviewed utama untuk klaim soulbound, karena open access dan konteks penerapannya (kredensial digital) paling dekat dengan kredit SKS LedgerDik. Pasangkan dengan Ohlhaver dkk. (2022) yang menjadi landasan konseptualnya.

### Catatan tentang EIP soulbound

**EIP-4973 dan EIP-5484** keduanya ada dan halamannya diperiksa langsung. EIP-4973 "ERC-4973: Account-bound Tokens" berstatus **Review** (bukan Final), dibuat 2022-04-01 oleh Tim Daubenschütz, mensyaratkan EIP-165 dan EIP-712; deskripsinya menyebut antarmuka untuk NFT non-transferable yang terikat pada akun Ethereum. EIP-5484 "ERC-5484: Consensual Soulbound Tokens" berstatus **Final**, dibuat 2022-08-17 oleh Buzz Cai, mensyaratkan EIP-165 dan EIP-721, dengan deskripsi antarmuka untuk NFT dengan kepemilikan *immutable* dan otorisasi *burn* yang ditetapkan di awal. Karena EIP-4973 masih berstatus Review, jangan mengutipnya sebagai standar mapan. EIP-5484 lebih aman bila memang diperlukan rujukan standar. Perlu digarisbawahi bahwa ketiga EIP ini berbasis ERC-721, sementara LedgerDik memakai ERC-20. Jelaskan pilihan desain ini di laporan agar tidak tampak sebagai ketidaksesuaian. Perlu dicatat pula bahwa Ohlhaver dkk. (2022) sendiri tidak menetapkan standar implementasi; Pericàs-Gornals dkk. (2024) mencatat pada hlm. 2 bahwa belum ada implementasi standar dari usulan tersebut.

## Celah 4 — Pencocokan nama orang

### Pilihan utama: Christen (2006)

**a. Daftar Pustaka (Harvard)**
Christen, P. (2006) 'A comparison of personal name matching: techniques and practical issues', in *Sixth IEEE International Conference on Data Mining – Workshops (ICDMW'06)*. Los Alamitos, CA: IEEE, pp. 290–294. doi: 10.1109/ICDMW.2006.2.

**b.** DOI: [10.1109/ICDMW.2006.2](https://doi.org/10.1109/ICDMW.2006.2) (berbayar). Versi laporan teknis yang terbuka dan lebih lengkap, dari repositori resmi penulis di ANU: <https://users.cecs.anu.edu.au/~christen/publications/tr-cs-06-02.pdf>.

**c. Data verifikasi berkas** — PDF laporan teknis ANU: **14 halaman**. Judul tercetak pada halaman pertama: "TR-CS-06-02 / A Comparison of Personal Name Matching: Techniques and Practical Issues / Peter Christen / September 2006", diterbitkan dalam "Joint Computer Science Technical Report Series", Department of Computer Science, The Australian National University. Perhatikan: versi ICDMW'06 yang peer-reviewed hanya 5 halaman (hlm. 290–294) sedangkan laporan teknis ini 14 halaman dan memuat bagian rekomendasi yang lebih rinci. Bila mengutip nomor halaman, sebutkan versi mana yang Anda pakai. Halaman di bawah ini mengacu pada laporan teknis.

**d. Klaim inti yang dapat disitasi**
Abstrak (hlm. 3 pada PDF, halaman pertama isi) menyatakan bahwa variasi dan galat pada nama membuat pencocokan string secara persis menjadi bermasalah, sehingga diperlukan teknik pencocokan aproksimatif; ia juga menyatakan bahwa hasil eksperimen pada empat himpunan data nama berukuran besar menunjukkan **tidak ada satu teknik terbaik yang jelas**. Halaman 4 memuat taksonomi variasi nama yang relevan bagi LedgerDik: variasi ejaan (misalnya 'Meier' dan 'Meyer'), variasi fonetik, **nama majemuk yang dapat diberikan utuh dengan pemisah berbeda, sebagian saja, atau komponennya tertukar (*swapped*)**, nama alternatif seperti nama panggilan, serta penulisan inisial saja. Bagian 5 "Recommendations" (hlm. 13) memberi panduan operasional. Teknik Jaro dan Winkler bekerja baik untuk nama yang telah diurai ke dalam medan terpisah, sedangkan *longest common sub-string* cocok untuk nama yang belum diurai dan mungkin memiliki kata tertukar. Pengodean fonetik yang diikuti pembandingan persis atas kode fonetik **sebaiknya tidak digunakan**, dan pemilihan ambang batas merupakan persoalan utama karena perubahan kecil pada ambang memengaruhi kualitas pencocokan.

**e. Penempatan di Bab II**
Subbab *Pencocokan Nama (Approximate String Matching)*. Menopang: "Variasi pada nama orang, mulai dari perbedaan ejaan, variasi fonetik, nama majemuk yang komponennya tertukar atau ditulis sebagian, nama panggilan, hingga penulisan inisial, membuat pencocokan persis tidak memadai, sehingga diperlukan teknik pencocokan aproksimatif (Christen, 2006)." Sumber ini juga menjadi dasar pilihan desain: "Christen (2006) merekomendasikan Jaro dan Winkler untuk nama yang telah diurai ke medan terpisah, serta *longest common sub-string* untuk nama utuh yang komponennya mungkin tertukar." Rekomendasi butir 5 itulah pembenaran langsung bagi penanganan urutan nama pada LedgerDik.

### Pendamping: Cohen, Ravikumar dan Fienberg (2003)

**a.** Cohen, W.W., Ravikumar, P. and Fienberg, S.E. (2003) 'A comparison of string distance metrics for name-matching tasks', in *Proceedings of the IJCAI-2003 Workshop on Information Integration on the Web (IIWeb-03)*. Acapulco, Mexico, pp. 73–78.

**b.** PDF dari halaman resmi penulis di Carnegie Mellon University: <https://www.cs.cmu.edu/afs/cs/Web/People/wcohen/postscript/ijcai-ws-2003.pdf>. Makalah lokakarya ini tidak memiliki DOI.

**c. Data verifikasi berkas** — **6 halaman**. Judul tercetak pada halaman pertama: "A Comparison of String Distance Metrics for Name-Matching Tasks", penulis "William W. Cohen, Pradeep Ravikumar, Stephen E. Fienberg", ketiganya Carnegie Mellon University. **Catatan penting:** PDF ini tidak memuat nomor halaman prosiding pada halamannya, dan tidak memuat nama lokakarya di halaman pertama; jejak tahun yang tercetak hanyalah pernyataan hak cipta "Copyright © 2003, American Association for Artificial Intelligence". Rentang halaman 73–78 yang lazim dikutip **tidak dapat diverifikasi dari berkas ini**. Sebaiknya sitasi tanpa nomor halaman prosiding, atau nyatakan bahwa nomor halaman mengikuti sumber sekunder.

**d. Klaim inti yang dapat disitasi**
Abstrak (hlm. 1) menyatakan bahwa para penulis membandingkan secara eksperimental metrik jarak string pada tugas pencocokan nama entitas, dan bahwa metode berkinerja terbaik secara keseluruhan adalah skema hibrida yang menggabungkan pembobotan TFIDF dari temu-kembali informasi dengan skema jarak string Jaro-Winkler dari komunitas *record linkage* probabilistik. Pada hlm. 2 dijelaskan bahwa metrik Jaro tidak berbasis model jarak sunting, dan dalam literatur *record linkage* hasil baik diperoleh dari varian metrik ini. Hlm. 3 memuat definisi SoftTFIDF, dengan Jaro-Winkler dipakai sebagai jarak sekunder; hlm. 4 menyatakan SoftTFIDF secara umum merupakan yang terbaik di antara metode hibrida yang ditinjau. Bagian penutup hlm. 1 memberi kualifikasi yang jujur untuk dikutip: penggunaan jarak string paling berguna untuk persoalan pencocokan dengan pengetahuan awal yang sedikit atau data yang tidak terstruktur baik.

**e. Penempatan di Bab II**
Subbab *Pencocokan Nama*, pada paragraf pembandingan metrik. Menopang: "Perbandingan eksperimental atas berbagai metrik jarak string untuk pencocokan nama entitas menunjukkan bahwa metode terbaik adalah skema hibrida yang menggabungkan pembobotan TFIDF dengan jarak Jaro-Winkler (Cohen, Ravikumar dan Fienberg, 2003)." Sumber ini menjadi rujukan yang tepat bila LedgerDik memilih Jaro-Winkler. Perlu dinyatakan bahwa venue-nya adalah lokakarya IJCAI, sehingga bobot peer-review-nya lebih ringan dibanding makalah jurnal.

### Pendamping: Moreau, Yvon dan Cappé (2008)

**a.** Moreau, E., Yvon, F. and Cappé, O. (2008) 'Robust similarity measures for named entities matching', in *Proceedings of the 22nd International Conference on Computational Linguistics (Coling 2008)*. Manchester: Coling 2008 Organizing Committee, pp. 593–600.

**b.** PDF open access dari ACL Anthology: <https://aclanthology.org/C08-1075.pdf>. Identifier ACL: C08-1075.

**c. Data verifikasi berkas** — **8 halaman**. Baris tercetak pada bagian atas halaman pertama: "Proceedings of the 22nd International Conference on Computational Linguistics (Coling 2008), pages 593–600, Manchester, August 2008", dengan judul "Robust Similarity Measures for Named Entities Matching" dan penulis Erwan Moreau (Institut Télécom ParisTech & LTCI CNRS), François Yvon, dan Olivier Cappé. **Perhatikan koreksi metadata**: rekaman OpenAlex mencantumkan makalah ini pada halaman 593–600 tahun 2008 tetapi dengan DOI 10.3115/1599081.1599156 yang bertaut ke prosiding ACL-08: HLT — berkas PDF pada tautan itu justru memuat makalah lain ("Forest Reranking", Huang). Gunakan tautan ACL Anthology C08-1075 di atas, yang sudah diperiksa memuat makalah yang benar.

**d. Klaim inti yang dapat disitasi**
Bagian pendahuluan (hlm. 1, yakni hlm. 593 prosiding) mendaftar penyebab perbedaan tekstual antar-entitas persis seperti yang dihadapi LedgerDik: galat tipografis, **nama yang ditulis dengan cara berbeda (dengan atau tanpa nama depan maupun gelar)**, singkatan, ketidaktepatan pada nama organisasi, dan transliterasi. Contoh yang diberikan adalah "Mr. Rumyantsev" yang harus cocok dengan "Alexander Rumyanstev" tetapi tidak dengan "Mr. Ryabev". Abstrak menyatakan bahwa pencocokan entitas bernama tanpa pengetahuan awal menuntut ukuran kemiripan yang baik, bahwa Soft-TFIDF adalah ukuran berbutir halus yang bekerja baik untuk tugas ini, dan bahwa penulis mengusulkan model generik yang memungkinkan pencampuran beberapa ukuran. Pada hlm. 7 dilaporkan bahwa kinerja dapat menurun tajam bila ukuran dan/atau ambang batas tidak dipilih dengan hati-hati, misalnya Jaro dengan ambang sangat rendah berkinerja lebih buruk daripada kosinus *bag-of-words*.

**e. Penempatan di Bab II**
Subbab *Pencocokan Nama*, khusus pada paragraf tentang gelar akademik dan singkatan. Menopang: "Perbedaan penulisan nama dapat berasal dari galat tipografis, penulisan dengan atau tanpa nama depan maupun gelar, singkatan, dan transliterasi, sehingga ukuran kemiripan yang dipakai harus tahan terhadap ragam variasi tersebut (Moreau, Yvon dan Cappé, 2008)." Ini satu-satunya sumber di antara ketiganya yang menyebut **gelar** secara eksplisit sebagai sumber variasi, persis kebutuhan LedgerDik yang menghadapi "Dr.", "S.T.", "M.T." pada dokumen SK.

### Pendamping: Bilenko dkk. (2003)

**a. Daftar Pustaka (Harvard)**
Bilenko, M., Mooney, R., Cohen, W., Ravikumar, P. and Fienberg, S. (2003) 'Adaptive name matching in information integration', *IEEE Intelligent Systems*, 18(5), pp. 16–23. doi: 10.1109/MIS.2003.1234765.

**b. DOI / tautan unduh**
DOI: [10.1109/MIS.2003.1234765](https://doi.org/10.1109/MIS.2003.1234765). Artikel ini berbayar di IEEE Xplore dan tidak memiliki lokasi open access yang tercatat; berkas yang diverifikasi berasal dari salinan yang Anda lampirkan.

**c. Data verifikasi berkas** — **8 halaman**. Judul tercetak pada halaman pertama: "Adaptive Name Matching in Information Integration", di bawah tajuk rubrik "Information Integration", dengan baris penulis "Mikhail Bilenko and Raymond Mooney, University of Texas at Austin / William Cohen, Pradeep Ravikumar, and Stephen Fienberg, Carnegie Mellon University". Baris kepala halaman pertama mencetak "16 1094-7167/03/$17.00 © 2003 IEEE IEEE INTELLIGENT SYSTEMS". Penomoran halaman jurnal tercetak pada tiap halaman dan **terkonfirmasi berjalan dari 16 hingga 23**; kepala halaman berselang mencetak "SEPTEMBER/OCTOBER 2003 computer.org/intelligent" sehingga terbitannya adalah edisi September/Oktober 2003. Dengan demikian rentang halaman 16–23 pada entri di atas dapat dipertanggungjawabkan dari berkas, bukan dari sumber sekunder.

**d. Klaim inti yang dapat disitasi**
Paragraf pembuka (hlm. 16) menyatakan bahwa untuk menggabungkan informasi dari sumber yang heterogen, seseorang harus mengidentifikasi rekaman data yang merujuk pada entitas yang sama, padahal rekaman yang mendeskripsikan objek yang sama dapat berbeda secara sintaktis; contoh yang diberikan adalah orang yang sama disebut "William Jefferson Clinton" dan "bill clinton". Halaman yang sama merinci sumber variasi tersebut: perbedaan format penyimpanan data, galat tipografis dan galat pengenalan karakter optis (OCR), serta **singkatan**. Halaman itu juga mencatat bahwa persoalan ini diteliti di bawah berbagai nama, termasuk *record linkage*, *duplicate detection*, dan *name matching*. Pada hlm. 20 dilaporkan hasil perbandingan: di antara metode serupa jarak sunting, Monge-Elkan berkinerja terbaik secara rata-rata, sementara **SoftTF-IDF berkinerja terbaik secara keseluruhan**. Halaman 21 menambahkan pengamatan yang relevan bagi LedgerDik, yakni bahwa singkatan tertentu lazim pada domain tertentu sehingga pembandingan kemiripan yang presisi perlu memperhitungkannya, dan hlm. 22 melaporkan bahwa jarak sunting yang dapat dilatih mengungguli varian statisnya.

**e. Penempatan di Bab II**
Subbab *Pencocokan Nama*, pada paragraf tentang singkatan dan variasi representasi. Menopang: "Perbedaan sintaktis pada rekaman yang merujuk orang yang sama dapat berasal dari perbedaan format penyimpanan, galat tipografis dan OCR, serta penggunaan singkatan (Bilenko dkk., 2003)." Klaim tentang galat OCR sangat berguna bagi LedgerDik, karena berkas SK dan Surat Tugas yang diproses mencakup dokumen hasil pindai. Sumber ini juga menjadi rujukan yang lebih kuat daripada Cohen dkk. (2003) bila Anda hendak menyebut peringkat metrik, sebab ia terbit di jurnal IEEE dengan nomor halaman yang terverifikasi, sementara Cohen dkk. hanya makalah lokakarya. Perhatikan bahwa keduanya berbagi tiga penulis (Cohen, Ravikumar, Fienberg) dan melaporkan temuan yang sejalan, jadi sitasi keduanya sekaligus tidak menambah bukti independen; pilih Bilenko dkk. (2003) bila hanya perlu satu.

### Catatan tentang Navarro (2001)

Navarro (2001) terverifikasi dan berkualitas tinggi, tetapi **bukan** tentang nama orang, sehingga tidak memenuhi syarat yang Anda tetapkan untuk celah 4. Entrinya: Navarro, G. (2001) 'A guided tour to approximate string matching', *ACM Computing Surveys*, 33(1), pp. 31–88. doi: [10.1145/375360.375365](https://doi.org/10.1145/375360.375365); PDF dari halaman resmi penulis: <https://users.dcc.uchile.cl/~gnavarro/ps/acmcs01.1.pdf>, **68 halaman**, judul tercetak "A Guided Tour to Approximate String Matching". Survei ini berfokus pada pencarian *online* dan terutama pada jarak sunting (abstrak, hlm. 1), dan pada hlm. 7 mendefinisikan jarak Levenshtein sebagai yang mengizinkan penyisipan, penghapusan, dan penggantian. Aplikasi yang disebutnya adalah temu-kembali informasi dan biologi komputasional, bukan pencocokan nama orang. Pakailah bila Bab II perlu mendefinisikan jarak sunting secara formal, dan tempatkan di paragraf pembuka subbab pencocokan nama sebagai landasan konsep umum, bukan sebagai rujukan untuk pencocokan nama orang.

## Sumber yang tidak berhasil diverifikasi

Setelah kedua berkas lampiran diperiksa, **tidak ada lagi sumber yang direkomendasikan
namun berkasnya belum terverifikasi**. Yang tersisa hanyalah satu sumber yang sengaja
dikeluarkan dan dua kandidat yang tidak diangkat.

**Szabo (1997) dikeluarkan dari Daftar Pustaka.** Artikelnya terkonfirmasi lewat Crossref
(*First Monday*, vol. 2, no. 9, 1 September 1997) dan teks penuhnya terbaca, tetapi
*First Monday* hanya menyediakan galley HTML, tanpa berkas PDF dan tanpa penomoran
halaman. Sesuai keputusan Anda, sumber ini tidak dipakai; asal-usul istilah dirujuk lewat
sitasi sekunder melalui Zheng dkk. (2020, hlm. 1) seperti diuraikan pada celah 1.

**Winkler (1990)** tentang Jaro-Winkler tercatat di OpenAlex sebagai laporan Biro Sensus
AS tanpa DOI dan tanpa lokasi open access, sehingga berkasnya tidak dapat diverifikasi.
Klaim mengenai Jaro-Winkler lebih baik disitasi melalui Christen (2006), Cohen dkk. (2003),
atau Bilenko dkk. (2003), yang ketiganya membahas dan mengevaluasi metrik tersebut.

**Buterin (2014) Ethereum White Paper** berhasil diunduh dan diverifikasi (36 halaman;
judul tercetak pada bagian bawah halaman pertama, "Ethereum: A Next-Generation Smart
Contract and Decentralized Application Platform. By Vitalik Buterin (2014)", dengan halaman
ketiga berisi hanya penanda "Page 3 ethereum.org"), tetapi tidak direkomendasikan karena
Yellow Paper dan Grishchenko dkk. (2018) lebih presisi untuk klaim EVM dan gas, sementara
Zheng dkk. (2020) lebih kuat untuk konsep smart contract.

Sebagai tambahan opsional untuk subbab *Karya Ilmiah Sejenis*, **Turkanović dkk. (2018)**
terverifikasi: Turkanović, M., Hölbl, M., Košič, K., Heričko, M. and Kamišalić, A. (2018)
'EduCTX: a blockchain-based higher education credit platform', *IEEE Access*, 6, pp. 5112–5127,
doi: [10.1109/ACCESS.2018.2789929](https://doi.org/10.1109/ACCESS.2018.2789929). Praprint
penulis tersedia di [arXiv:1710.09918v1](https://arxiv.org/pdf/1710.09918) (26 Oktober 2017),
**20 halaman**, dengan judul tercetak pada halaman pertama "EduCTX: A blockchain-based
higher education credit platform" dan penanda "Submitted for peer-review on Oct 20 2017".
Versi jurnal IEEE Access-nya sendiri sudah peer-reviewed dan open access. Karena kemiripan
domainnya dengan LedgerDik sangat tinggi (kredit pendidikan tinggi berbasis blockchain),
sumber ini layak diprioritaskan pada subbab tersebut.
