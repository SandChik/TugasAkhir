# Dua Pilihan Parser dalam Sistem

Dokumen kerja untuk bab metodologi. Semua sitasi sudah diverifikasi ke
sumber aslinya pada Juli 2026; tetap cek ulang sebelum masuk daftar pustaka.

---

## Ada dua parser, dipilih otomatis menurut wujud dokumen

Sistem memakai dua parser. Yang menentukan parser mana yang dipakai adalah
wujud fisik dokumen, bukan pilihan pengguna:

1. **Parser rule-based**, untuk PDF lahir-digital yang teks dan garis
   tabelnya tersimpan sebagai objek di dalam berkas.
2. **Parser berbasis model vision (AI)**, untuk dokumen hasil pindai dan
   tulisan tangan yang tiap halamannya hanya berupa citra.

Aturan pemilihannya satu kalimat: kalau teks dan garis tabel tersimpan
sebagai objek di dalam PDF, dipakai parser rule-based; kalau halaman hanya
berupa citra, dipakai parser AI.

Apa pun parser yang dipakai, hasilnya melewati lapisan validasi yang sama.
Ekstraksi hanya pintu masuk. Yang menjaga kebenaran data adalah invarian
dokumen (persamaan SKS, rekonsiliasi antar lampiran, struktur NIP), dan itu
berlaku untuk kedua parser.

---

## Parser 1. Rule-based untuk dokumen lahir-digital

### Dokumen yang ditangani
Surat tugas mengajar. PDF machine-readable, teks dan garis tabelnya
tersimpan sebagai objek di dalam berkas (bukan gambar).

### Cara kerja
Struktur sel dipulihkan dari garis tabel (ruling lines) yang sudah ada di
PDF. Batas kolom diturunkan dari koordinat garis vertikal, isi tiap sel
diambil dari objek teks yang jatuh di dalam sel. Sel tergabung (satu nama
dosen membawahi beberapa baris) terbaca benar karena rekonstruksinya
mengikuti garis, bukan menebak dari jarak antar teks.

### Landasan

**Shigarov, A., Altaev, A., Mikhailov, A., Paramonov, V., Cherkashin, E.
(2018). TabbyPDF: Web-Based System for PDF Table Extraction.** ICIST 2018,
Communications in Computer and Information Science vol. 920, hlm. 257-269.
Springer. DOI 10.1007/978-3-319-99972-2_20.

Ini landasan utama. TabbyPDF adalah sistem ekstraksi tabel dari PDF
untagged berbasis heuristik yang dapat dikonfigurasi, memakai fitur teks
dan garis tabel (jarak horizontal-vertikal, font, ruling lines). Pada
dataset ICDAR 2013 Table Competition, F-score-nya 93,64% untuk pengenalan
struktur dan 83,18% untuk ekstraksi tabel dengan deteksi otomatis. Angka
ini dipakai untuk memposisikan pendekatan, BUKAN untuk diperbandingkan
langsung dengan hasil pada satu dokumen surat tugas.

**Shigarov, A.O., Mikhailov, A.A. (2017). Rule-based spreadsheet data
transformation from arbitrary to relational tables.** Information Systems
71, hlm. 123-136. DOI 10.1016/j.is.2017.08.004.

Menopang lapisan transformasi dari sel mentah ke baris relasional.

### Modifikasi yang dilakukan (ini bagian "replikasi dan modifikasi")
Metode aslinya menurunkan struktur dari fitur dokumen secara umum.
Penerapan di sini dipersempit ke tabel bergaris penuh dengan format tetap,
dan difokuskan pada penanganan sel tergabung pada kolom dosen dan kode mata
kuliah, yang menjadi ciri khas surat tugas JTK. Batas kolom diturunkan dari
garis vertikal yang memang tersedia di dalam PDF.

### Kelebihan dan batas
Deterministik: dijalankan ulang menghasilkan angka identik, penting untuk
data yang jadi rujukan. Dapat diaudit: setiap sel bisa dilacak ke koordinat
asalnya. Tanpa data latih dan tanpa internet. Batas: hanya untuk dokumen
lahir-digital bergaris; gagal total pada hasil pindai dan tulisan tangan.

---

## Parser 2. Model vision (AI) untuk dokumen pindai dan tulisan tangan

### Dokumen yang ditangani
SK pembina ormawa (hasil pindai, tiap halaman berupa citra) dan artefak
dosen bertulisan tangan (ekstraksi nama dosen dan tanggal/semester).

### Cara kerja
Halaman dirasterisasi menjadi citra, dikirim ke model vision melalui API,
dan model mengembalikan data terstruktur dalam satu proses. Berbeda dari
OCR klasik yang membaca karakter lalu menyusun ulang tata letak, model
vision menafsirkan citra dan tata letaknya sekaligus, sehingga lebih tahan
terhadap tulisan tangan dan pindaian berkualitas rendah.

### Landasan

Penting dibedakan: pendekatan yang dipakai di sini adalah model multimodal
SERBA-GUNA (Gemini, Claude, GPT-4o) yang diakses lewat API, BUKAN model
dokumen khusus yang dilatih ulang. Landasannya harus mencerminkan itu.
Donut relevan sebagai asal paradigma, tetapi bukti bahwa LLM serba-guna
bekerja untuk ekstraksi dokumen datang dari kelompok paper yang berbeda.

**Landasan langsung (paling dekat dengan kasus ini):**

**Nunes, G.G.M., Rolla, V., Pereira, D., Alves, V., dkk. (2025).
Benchmarking Table Extraction: Multimodal LLMs vs Traditional OCR.**
Proc. XLLM Workshop, ACL 2025.

Ini kasus yang nyaris identik: model multimodal mengubah citra tabel
menjadi respons JSON terstruktur (header dan baris), lalu dikonversi ke
CSV, dibandingkan dengan OCR tradisional. Persis alur SK pembina yang
dikerjakan di sini. Dipakai sebagai pembenaran teknik utama.

**Anonim/rujukan (2025). Problem Solved? Information Extraction Design Space
for Layout-Rich Documents using LLMs.** arXiv:2502.18179.

Mengevaluasi GPT-4o, GPT-4o-vision, dan Qwen2.5-vision terhadap model
khusus (LayoutLMv3, ERNIE-Layout) untuk ekstraksi informasi dari dokumen
kaya tata letak. Berguna untuk dua hal: menunjukkan model multimodal
serba-guna dapat mengungguli model khusus (F1 sekitar 0,90 vs 0,60), dan
memberi data biaya per panggilan API yang jujur untuk bab keterbatasan.

**Perot, V., Kang, K., Luisier, F., dkk. (2024). LMDX: Language Model-based
Document Information Extraction and Localization.** arXiv:2309.10952.

Memakai Gemini dan PaLM untuk ekstraksi informasi dokumen. Relevan bila
model yang dipakai adalah Gemini, karena mendemonstrasikan pemanggilan
gemini-pro-vision lewat API untuk tugas serupa.

**Model yang benar-benar dipakai.** Sitir laporan teknis / kartu model dari
model yang dipakai di implementasi: kartu sistem GPT-4V (OpenAI, 2023) atau
laporan teknis Gemini (Google DeepMind) atau kartu model Claude
(Anthropic). Ini WAJIB, karena pembaca perlu tahu model persis apa yang
menghasilkan angka di sistem.

**Asal paradigma (lineage, bukan pembenaran langsung):**

**Kim, G., dkk. (2022). OCR-Free Document Understanding Transformer
(Donut).** ECCV 2022, hlm. 498-517. Springer.

Memelopori pemahaman dokumen tanpa OCR terpisah: citra langsung ke keluaran
terstruktur. Disitir sebagai titik awal paradigma OCR-free, yang kemudian
diperluas oleh model multimodal serba-guna. Jangan disitir seolah Donut
adalah model yang dipakai.

**Xu, Y., dkk. (2020). LayoutLM: Pre-training of Text and Layout for
Document Image Understanding.** KDD 2020, hlm. 1192-1200. ACM.

Fondasi bidang document AI. Konteks garis penelitian, bukan metode yang
dipakai.

**Smith, R. (2007). An Overview of the Tesseract OCR Engine.** ICDAR 2007,
vol. 2, hlm. 629-633. IEEE.

OCR baseline. Menjelaskan MENGAPA jalur OCR klasik ditinggalkan: kuat pada
teks cetak terstruktur, lemah pada tulisan tangan, sehingga model
multimodal dipilih agar satu jalur menangani pindaian sekaligus tulisan
tangan.

Catatan kejujuran akademik: sebagian rujukan di atas masih berupa preprint
arXiv atau paper workshop, bukan jurnal/konferensi utama yang sudah
di-review penuh. Bidang ini bergerak sangat cepat. Periksa status
publikasi terbaru tiap rujukan sebelum masuk daftar pustaka, dan
utamakan versi yang sudah terbit resmi bila ada.

### Modifikasi yang dilakukan
Model tidak dilatih ulang. Yang dirancang adalah prompt berskema ketat
(model diminta mengembalikan JSON dengan kolom yang pasti) dan, yang paling
menentukan, pemaksaan keluaran model melewati lapisan validasi domain yang
sama dengan parser rule-based. Model dipakai sebagai mesin baca, bukan
sebagai sumber kebenaran.

### Kelebihan dan batas
Mampu membaca tulisan tangan dan pindaian buruk, yang mustahil bagi dua
jalur lain. Batas yang WAJIB ditulis di laporan:
- **Tidak deterministik.** Keluaran bisa berbeda antar pemanggilan. Untuk
  data rujukan honorarium, ini risiko, dan itulah alasan lapisan validasi
  menjadi mutlak.
- **Salah dengan rapi.** Model dapat menghasilkan NIP 18 digit yang sah
  strukturnya tetapi keliru. Hanya checksum NIP dan rekonsiliasi antar
  lampiran yang bisa menangkapnya.
- **Data keluar dari institusi.** Citra dikirim ke layanan API. Untuk data
  pegawai (nama, NIP, honorarium), ini keputusan tata kelola data yang
  memerlukan izin, bukan keputusan teknis.
- **Bergantung jaringan dan biaya per panggilan.**

Catatan: keluarga metode ini terus berlanjut. Nougat (Blecher dkk., 2023)
membangun di atas Donut untuk menangani dokumen lahir-digital maupun
pindai. Literatur juga mencatat kombinasi tulisan tangan dan teks cetak
sebagai kasus tersulit, sejalan dengan artefak dosen yang ditangani di
sini.

---

## Ringkasan

| aspek | Parser 1 (rule-based) | Parser 2 (AI) |
|---|---|---|
| dokumen | surat tugas mengajar | SK pembina, artefak tulisan tangan |
| wujud | lahir-digital, bergaris | pindai / tulisan tangan |
| pustaka | pdfplumber | API model vision |
| determinisme | ya | tidak |
| dapat diaudit | ya | terbatas |
| butuh internet | tidak | ya |
| data keluar institusi | tidak | ya, perlu izin |
| landasan | Shigarov 2018; Shigarov & Mikhailov 2017 | Nunes dkk. 2025; "Problem Solved?" 2025; LMDX 2024; + kartu model; (Donut 2022 sbagai lineage) |

---

## Benang merah yang menyatukan keduanya

Dua parser bermuara ke satu lapisan validasi berbasis invarian
dokumen. Inilah yang membuat sistem ini satu kerangka, bukan kumpulan
parser terpisah, dan inilah kontribusi yang membedakannya dari sekadar
penggunaan pustaka yang sudah ada. Pilihan mesin ekstraksi adalah keputusan
teknis yang menyesuaikan wujud dokumen; nilai penelitiannya ada pada
lapisan sesudahnya.
