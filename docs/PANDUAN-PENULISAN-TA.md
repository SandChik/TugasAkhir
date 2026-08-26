* [ ] 

# Panduan Penulisan Laporan Tugas Akhir — Proyek LEDGERDIK

Dokumen ini adalah acuan tunggal penulisan Laporan Tugas Akhir *"Pengembangan Sistem Penilaian Beban Kerja Dosen Bidang Pendidikan Berbasis Smart Contract untuk Otomatisasi Perhitungan Kredit Kegiatan"*.

Panduan disusun dari dua sumber:

1. **Formulir Pengecekan Tata Tulis Penulisan Laporan Rev. 020226** — Jurusan Teknik Komputer dan Informatika, Politeknik Negeri Bandung. Ini aturan **wajib** yang akan dicek oleh Pemeriksa 1 (peer reviewer) dan Pemeriksa 2 (dosen).
2. **Contoh Laporan TA yang telah lulus** (`docs/contoh-TA/Bab 1–6`) — sumber pola struktur, alur argumen, dan konvensi penyajian yang terbukti diterima.

> **Cara pakai:** Bagian A dipakai saat *formatting* di Word. Bagian B–D dipakai saat *menulis*. Bagian E dipakai saat *review akhir* sebelum diserahkan ke pemeriksa.

---

## Daftar Isi

- [A. Aturan Formal (Wajib — Bahan Pengecekan Pemeriksa)](#a-aturan-formal-wajib--bahan-pengecekan-pemeriksa)
  - [A.1 Layout Halaman](#a1-layout-halaman)
  - [A.2 Font dan Format Judul](#a2-font-dan-format-judul)
  - [A.3 Spasi dan Jarak](#a3-spasi-dan-jarak)
  - [A.4 Penomoran](#a4-penomoran)
  - [A.5 Tabel, Gambar, Rumus, dan Kode Program](#a5-tabel-gambar-rumus-dan-kode-program)
  - [A.6 Halaman Sampul dan Pengesahan](#a6-halaman-sampul-dan-pengesahan)
  - [A.7 Abstrak dan Halaman Daftar](#a7-abstrak-dan-halaman-daftar)
  - [A.8 Kaidah Bahasa](#a8-kaidah-bahasa)
  - [A.9 Daftar Pustaka dan Sitasi (Harvard Style)](#a9-daftar-pustaka-dan-sitasi-harvard-style)
- [B. Struktur Laporan Enam Bab](#b-struktur-laporan-enam-bab)
- [C. Pola Penulisan yang Wajib Diikuti](#c-pola-penulisan-yang-wajib-diikuti)
- [D. Kerangka Rinci per Bab + Penerapan LEDGERDIK](#d-kerangka-rinci-per-bab--penerapan-ledgerdik)
- [E. Checklist Review Akhir](#e-checklist-review-akhir)

---

# A. Aturan Formal (Wajib — Bahan Pengecekan Pemeriksa)

## A.1 Layout Halaman


| Aspek             | Ketentuan                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| Ukuran kertas     | **A4**                                                                                                        |
| Orientasi         | **Portrait** secara umum. *Landscape* hanya untuk konten dengan *view* presentasi (mis. tabel/diagram lebar). |
| Margin*portrait*  | Atas**4 cm**, Kiri **4 cm**, Kanan **3 cm**, Bawah **3 cm**                                                   |
| Margin*landscape* | Atas**4 cm**, Kiri **3 cm**, Kanan **4 cm**, Bawah **3 cm**                                                   |

> Sisi penjilidan selalu mendapat margin 4 cm. Cek ulang orientasi margin pada gambar di formulir sebelum finalisasi.

## A.2 Font dan Format Judul

Font dasar seluruh laporan: **Times New Roman (TNR)**.


| Elemen                                                                                                                                                                 | Font            | Ukuran    | Gaya     | Perataan  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------- | ----------- | ---------- | ----------- |
| Judul Bab (`BAB I PENDAHULUAN`)                                                                                                                                        | TNR             | 14 pt     | **Bold** | Center    |
| Judul Subbab (`I.1 Latar Belakang`)                                                                                                                                    | TNR             | 12 pt     | **Bold** | Left      |
| Judul Abstrak, Kata Pengantar, Daftar Isi, Daftar Singkatan, Daftar Istilah, Daftar Simbol, Daftar Tabel, Daftar Gambar, Daftar Rumus, Daftar Pustaka, Daftar Lampiran | TNR             | 14 pt     | **Bold** | Center    |
| Isi laporan                                                                                                                                                            | TNR             | 12 pt     | Normal   | Justified |
| Isi abstrak                                                                                                                                                            | TNR             | **11 pt** | Normal   | Justified |
| Judul tabel & judul gambar                                                                                                                                             | TNR             | 12 pt     | Normal   | Center    |
| Isi tabel                                                                                                                                                              | TNR             | **10 pt** | Normal   | —        |
| Kode program (*source code*)                                                                                                                                           | **Courier New** | **9 pt**  | Normal   | Left      |

## A.3 Spasi dan Jarak


| Aspek                                      | Ketentuan                                                |
| -------------------------------------------- | ---------------------------------------------------------- |
| Spasi isi laporan                          | **1,5** — tanpa spasi *before* dan *after*              |
| Spasi isi abstrak                          | **1** — tanpa spasi *before-after*                      |
| Spasi isi tabel                            | **1** — tanpa spasi *before-after*                      |
| Spasi judul tabel/gambar >1 baris          | **1**, simetris di tengah                                |
| Judul bab → judul subbab pertama          | **24 pt** (dua kali *enter* 12 pt), tanpa *before/after* |
| Judul subbab → baris pertama konten       | **6 pt**                                                 |
| Baris terakhir subbab → judul subbab baru | **12 pt**                                                |
| Spasi*before/after* pada Paragraph setting | **0** (semua)                                            |

**Tipe paragraf.** Pilih **satu** gaya dan konsisten sepanjang laporan:

- *Gaya lurus* — perpindahan paragraf ditandai spasi kosong; **atau**
- *Gaya menjorok* — perpindahan paragraf ditandai indentasi 5–7 karakter.

> **Dilarang keras mencampur keduanya** (menjorok *sekaligus* diberi spasi pemisah).
> **Keputusan untuk LEDGERDIK:** gunakan **gaya menjorok**, mengikuti contoh TA acuan.

## A.4 Penomoran

### Judul


| Elemen         | Format                    | Contoh               |
| ---------------- | --------------------------- | ---------------------- |
| Bab            | Angka**Romawi kapital**   | `BAB I`, `BAB IV`    |
| Subbab         | Romawi bab**.** Arab urut | `I.1`, `I.2`, `IV.3` |
| Sub-subbab     | Lanjut satu jenjang       | `I.1.1`, `IV.3.2`    |
| Sub-sub-subbab | Lanjut lagi               | `IV.2.3.1`           |

### Halaman


| Bagian                                                                 | Nomor                    | Posisi                                                               |
| ------------------------------------------------------------------------ | -------------------------- | ---------------------------------------------------------------------- |
| Abstrak                                                                | mulai`i` (Romawi kecil)  | tengah bawah                                                         |
| Daftar Isi, Singkatan, Istilah, Simbol, Tabel, Gambar, Rumus, Lampiran | mulai`ii` (Romawi kecil) | tengah bawah                                                         |
| Konten utama (BAB I s.d. Daftar Pustaka)                               | mulai`1` (Arab)          | **halaman awal bab: tengah bawah**; **halaman lanjutan: kanan atas** |

Format nomor halaman: TNR 12 pt.

### Daftar rincian dalam konten

Jenjang penomoran rincian:

```
1. Text preprocessing, yang terdiri dari :
   a. Case folding
      a.1. Lower case
      a.2. Upper case
   b. Stopwords
   c. Stemming
```

- Batas kiri rincian **sejajar** dengan batas kiri kalimat sebelumnya.
- Spasi *after* dan *before* pada rincian di-set **0**.

## A.5 Tabel, Gambar, Rumus, dan Kode Program

### Tabel

- Nomor + judul diletakkan **DI ATAS** badan tabel.
- Format nomor: `Tabel I.1`, `Tabel I.2`, `Tabel IV.15` — mengikuti bab, urut kontinu sepanjang bab.
- Judul tabel: TNR 12 pt, **Center**. Judul >1 baris ditulis simetris tengah, spasi 1.
- Isi tabel: TNR 10 pt, spasi 1, tanpa *before/after*.

```
Tabel IV.5. Ringkasan Persyaratan Fungsional per Modul
+---------------------+------------------------------------+
| Modul Fitur         | Ringkasan Persyaratan Fungsional   |
+---------------------+------------------------------------+
```

### Gambar

- Nomor + judul diletakkan **DI BAWAH** gambar.
- Format nomor: `Gambar I.1`, `Gambar IV.23` — mengikuti bab, urut kontinu.
- Judul gambar: TNR 12 pt, **Center**. Judul >1 baris simetris tengah, spasi 1.
- Gambar hasil kutipan **wajib mencantumkan sumber** di akhir judul.

```
              [ gambar ]
Gambar II.1. Model Waterfall (Sommerville, 2011)
```

### Aturan mutlak: semua ilustrasi harus dirujuk

- **Setiap** tabel, gambar, diagram, dan rumus **wajib dirujuk** di kalimat narasi.
- Rujukan ditulis **sebelum** ilustrasi muncul: *"…sebagaimana dirangkum pada Tabel IV.2"*, *"…ditunjukkan pada Gambar IV.6"*.
- **Dilarang** meletakkan ilustrasi langsung setelah judul subbab tanpa kalimat pengantar.
- Setelah ilustrasi, berikan kalimat pembahasan — jangan biarkan tabel/gambar "yatim".

### Rumus

- Diberi nomor dalam **tanda kurung** di sisi kanan: `(III.2)`.
- Angka pertama Romawi (nomor bab), angka kedua Arab (urut rumus dalam bab).
- Rumus diletakkan **simetris (centered)**.
- Semua rumus dicatat di **Daftar Rumus**.

```
                    Y = α + β1.X1 + β2.X2 + β3.X3 + e            (III.2)
```

### Kode program

- Font **Courier New 9 pt**.
- Di contoh TA acuan, potongan kode disajikan **di dalam tabel satu kolom** dan diberi judul tabel, contoh: `Tabel IV.29. Potongan Kode Implementasi SyncGlobalBlocklistUseCase`. Pola ini membuat kode ikut terdaftar di Daftar Tabel dan otomatis punya rujukan.
- Hanya tampilkan **logika inti**; *boilerplate* tidak perlu ditampilkan (nyatakan hal ini di pengantar subbab Implementasi).

## A.6 Halaman Sampul dan Pengesahan

### Susunan Halaman Sampul (urut atas ke bawah)

1. Judul laporan dalam **Bahasa Indonesia**
2. Judul laporan dalam **Bahasa Inggris**
3. Nama dokumen: `LAPORAN TUGAS AKHIR`
4. Tujuan laporan
5. Nama penyusun, diawali kata `Oleh :` — Nama + NIM
6. Simbol/logo Polban
7. Nama jenjang pendidikan + Program Studi
8. Nama jurusan
9. Nama institusi pendidikan
10. Tahun pembuatan laporan

### Ketentuan tiap unsur


| Unsur                  | Ketentuan                                                                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Judul Bahasa Indonesia | **12–20 kata**, TNR **14 pt**, Bold, Center, **HURUF KAPITAL SELURUHNYA**                                                                          |
| Judul Bahasa Inggris   | **12–20 kata**, TNR **12 pt**, Bold, Center, ***Italic***, format **Title Case**                                                                   |
| Tujuan laporan         | TNR 12 pt, Center                                                                                                                                   |
| Nama mahasiswa         | Lengkap,**tanpa gelar**, tidak disingkat; NIM di bawah nama. Jika lebih dari satu mahasiswa, NIM di sebelah **kanan** nama. TNR 12 pt, Bold, Center |
| Logo Polban            | Logo bertuliskan POLBAN di bawahnya — sumber: https://s.id/Logo_Polban                                                                             |
| Nama institusi         | `POLITEKNIK NEGERI BANDUNG`, tahun di bawahnya. TNR **14 pt**, Bold, Center                                                                         |

### Teks Tujuan Laporan

Pilih **satu** sesuai jenjang:

- **TA Diploma 3:**

  > Laporan ini disusun untuk memenuhi salah satu syarat menyelesaikan pendidikan Program Diploma Tiga Program Studi Teknik Informatika di Jurusan Teknik Komputer dan Informatika
  >
- **TA Sarjana Terapan:**

  > Laporan ini disusun untuk memenuhi salah satu syarat menyelesaikan pendidikan Program Sarjana Terapan Program Studi Teknik Informatika di Jurusan Teknik Komputer dan Informatika
  >

### Penulisan Nama Program Studi

- **D3 Teknik Informatika** → `Program Diploma 3 Program Studi Teknik Informatika`
  (format jenjang boleh `D-3` / `D-III` / `Diploma 3` — **pilih satu dan konsisten**)
- **Sarjana Terapan Teknik Informatika** → `Program Sarjana Terapan Program Studi Teknik Informatika`
  (penamaan lama "D4 Teknik Informatika" **sudah tidak dipakai**)

### Halaman Pengesahan


| Unsur                             | Ketentuan                                                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Judul                             | 12–20 kata; TNR 14 pt, Bold, Center; Indonesia**HURUF KAPITAL**; Inggris **Title Case + italic**            |
| Mahasiswa                         | Nama lengkap + NIM                                                                                           |
| Pembimbing Jurusan                | Nama lengkap**beserta gelar**, NIP, dan tanda tangan                                                         |
| Ketua Jurusan & Koordinator Prodi | Nama lengkap + gelar + NIP + tanda tangan.**Tanda tangan Koordinator Prodi di KANAN, Ketua Jurusan di KIRI** |

## A.7 Abstrak dan Halaman Daftar

### Abstrak


| Aspek               | Ketentuan                                                                             |
| --------------------- | --------------------------------------------------------------------------------------- |
| Panjang             | **Maksimal 300 kata**                                                                 |
| Font                | TNR 11 pt, Justified                                                                  |
| Spasi               | 1, tanpa*before-after*                                                                |
| Kata kunci          | Di**bawah** konten abstrak. Tulisan `Kata Kunci` di-**bold**, diikuti titik dua (`:`) |
| Kata kunci >1 baris | Baris kedua sejajar dengan kata kunci pertama di baris pertama                        |

```
Kata Kunci : blockchain, smart contract, beban kinerja dosen, otomatisasi,
             verifikasi dokumen, ERC-20, Base Sepolia
```

Abstrak dibuat dalam **dua versi**: Bahasa Indonesia (`ABSTRAK`) dan Bahasa Inggris (`ABSTRACT`).

### Halaman Daftar


| Daftar                       | Isi                                                                     |
| ------------------------------ | ------------------------------------------------------------------------- |
| Daftar Isi                   | Seluruh judul bab dan subbab + nomor halaman                            |
| Daftar Tabel                 | Nomor urut tabel, judul tabel, nomor halaman —**urut nomor tabel**     |
| Daftar Gambar                | Nomor urut gambar, judul gambar, nomor halaman —**urut nomor gambar**  |
| Daftar Rumus                 | Seluruh rumus yang digunakan                                            |
| Daftar Lampiran              | Nomor lampiran, judul lampiran, nomor halaman —**urut nomor lampiran** |
| Daftar Istilah               | **Urut abjad**, TNR 12 pt                                               |
| Daftar Singkatan dan Lambang | **Urut abjad**, TNR 12 pt                                               |

Contoh format resmi:

- Daftar Singkatan — https://s.id/Contoh_DaftarSingkatan
- Daftar Singkatan dan Lambang — https://s.id/Contoh_DaftarSingkatandanLambang
- Daftar Tabel — https://s.id/Contoh_DaftarTabel
- Daftar Gambar — https://s.id/Contoh_DaftarGambar
- Daftar Lampiran — https://s.id/Contoh_DaftarLampiran
- Daftar Rumus — https://s.id/Contoh_DaftarRumus
- Teknik Ilustrasi — https://s.id/Teknik_Ilustrasi
- Kata Pengantar TA — https://docs.google.com/document/d/1bVxA2FHZPCwPDLRHws5jI9bHeqacNi3X/edit

## A.8 Kaidah Bahasa

### Aturan mutlak

1. **Kalimat pasif.** Seluruh konten utama (BAB I s.d. Daftar Pustaka) ditulis dalam kalimat pasif.
2. **Dilarang menggunakan kata penyebut diri**: `penulis`, `saya`, `peneliti`, `kami`, dan sejenisnya.


| ❌ Salah                                          | ✅ Benar                                             |
| --------------------------------------------------- | ------------------------------------------------------ |
| Penulis melakukan pengujian terhadap 20 skenario. | Pengujian dilakukan terhadap 20 skenario.            |
| Kami merancang arsitektur sistem menggunakan…    | Arsitektur sistem dirancang menggunakan…            |
| Saya menggunakan Solidity untuk…                 | Solidity digunakan untuk…                           |
| Peneliti menyimpulkan bahwa…                     | Berdasarkan hasil tersebut dapat disimpulkan bahwa… |

> **Catatan.** Bila perlu menyebut pelaku, gunakan `tim pengembang` — contoh TA acuan memakai frasa ini (mis. *"data master dikurasi oleh tim pengembang"*).

### Struktur kalimat

- Minimal mengandung **S + P + O**, idealnya **S-P-O-[K]**.
- Kalimat majemuk/bertingkat: **maksimal 15 kata** per kalimat.
- Hindari kalimat beranak-pinak dengan banyak anak kalimat.
- Singkat tetapi jelas.

### Redundansi

Hindari pengulangan makna:


| ❌ Salah                                                         | ✅ Benar                                             |
| ------------------------------------------------------------------ | ------------------------------------------------------ |
| Pohon buah tersebut**hanya** dapat memiliki satu jenis **saja**. | Pohon buah tersebut hanya dapat memiliki satu jenis. |
| **Agar supaya** sistem dapat berjalan…                          | Agar sistem dapat berjalan…                         |
| **Adalah merupakan** sebuah kontrak…                            | Merupakan sebuah kontrak…                           |
| Data**daripada** pengguna                                        | Data pengguna                                        |

### Kata baku dan konjungsi

- Gunakan kata baku sesuai **KBBI/EYD**.
- Pilih kata hubung yang tepat — https://dosenbahasa.com/macam-macam-kata-penghubung

### Huruf miring (italic)

Istilah asing yang belum diserap ditulis **miring**, konsisten sepanjang laporan:

- ✅ *smart contract*, *blockchain*, *gas fee*, *hash*, *token*, *deployment*, *use case*, *black box testing*, *requirement*
- Istilah yang sudah diserap ditulis biasa: aplikasi, sistem, data, verifikasi, validasi, transaksi

Akronim ditulis **panjang dulu, lalu disingkat sekali** di kemunculan pertama, seterusnya pakai singkatan:

> …*Entity Relationship Diagram* (ERD) digunakan untuk… Selanjutnya ERD tersebut…

### Rujukan kaidah EYD resmi


| Topik                                                                       | Tautan                                                                              |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Huruf kapital                                                               | https://ejaan.kemendikdasmen.go.id/eyd/penggunaan-huruf/huruf-kapital/              |
| Huruf miring                                                                | https://ejaan.kemendikdasmen.go.id/eyd/penggunaan-huruf/huruf-miring/               |
| Huruf tebal                                                                 | https://ejaan.kemendikdasmen.go.id/eyd/penggunaan-huruf/huruf-tebal/                |
| Kata berimbuhan                                                             | https://ejaan.kemendikdasmen.go.id/eyd/penulisan-kata/kata-turunan/                 |
| Gabungan kata                                                               | https://ejaan.kemendikdasmen.go.id/eyd/penulisan-kata/kata-turunan/#3-gabungan-kata |
| Kata depan                                                                  | https://ejaan.kemendikdasmen.go.id/eyd/penulisan-kata/kata-depan/                   |
| Partikel                                                                    | https://ejaan.kemendikdasmen.go.id/eyd/penulisan-kata/partikel/                     |
| Singkatan & akronim                                                         | https://ejaan.kemendikdasmen.go.id/eyd/penulisan-kata/singkatan-dan-akronim/        |
| Angka & bilangan                                                            | https://ejaan.kemendikdasmen.go.id/eyd/penulisan-kata/angka-dan-bilangan/           |
| Kata ganti                                                                  | https://ejaan.kemendikdasmen.go.id/eyd/penulisan-kata/kata-ganti/                   |
| Tanda baca (titik, koma, titik koma, titik dua, hubung, pisah, tanya, seru) | https://ejaan.kemendikdasmen.go.id/eyd/penggunaan-tanda-baca/tanda-titik/           |
| Tanda baca (elipsis, petik, petik tunggal, kurung, kurung siku)             | https://ejaan.kemendikdasmen.go.id/eyd/penggunaan-tanda-baca/tanda-elipsis/         |

## A.9 Daftar Pustaka dan Sitasi (Harvard Style)

### Aturan

1. **Wajib Harvard Style** — merujuk dengan mencantumkan **nama penulis dan tahun**.
2. **Setiap pustaka di Daftar Pustaka harus benar-benar dirujuk** di dalam tulisan. Sebaliknya, setiap rujukan di tulisan harus ada di Daftar Pustaka.
3. **Disarankan menggunakan reference manager** (Mendeley / Zotero / EndNote) agar konsisten.
4. Contoh format resmi: https://s.id/Contoh_DaftarPustaka
5. Daftar Pustaka diurutkan **abjad nama belakang penulis**, tanpa penomoran.

### Bentuk sitasi dalam teks


| Situasi                     | Bentuk                                                  |
| ----------------------------- | --------------------------------------------------------- |
| Penulis jadi subjek kalimat | `Sommerville (2011) menjelaskan bahwa…`                |
| Sitasi di akhir kalimat     | `…dijelaskan pada model tersebut (Sommerville, 2011).` |
| Dua penulis                 | `Hofmann dan Kotabe (2012)`                             |
| Tiga penulis                | `Rumbaugh, Jacobson dan Booch (2004)`                   |
| Lebih dari tiga penulis     | `Rodríguez dkk. (2016)`                                |
| Beberapa sumber sekaligus   | `(Sommerville, 2011; Pressman, 2001)`                   |
| Kutipan dalam kutipan       | `(Jacobson, 1992, cited Larman, 2004)`                  |
| Sitasi dengan halaman       | `(Eberth dan Sedlmeier, 2012, p. 185)`                  |
| Lembaga sebagai penulis     | `(Republik Indonesia, 2022)`                            |

### Template entri Daftar Pustaka

**Buku**

```
Sommerville, I. (2011) Software Engineering. 9th edn. Boston: Pearson.
```

**Artikel jurnal**

```
Rodríguez, C. et al. (2016) 'REST APIs: A large-scale analysis of compliance with
principles and best practices', Lecture Notes in Computer Science, 9671, pp. 21-39.
Available at: https://doi.org/10.1007/978-3-319-38791-8_2.
```

**Prosiding konferensi**

```
Zhao, G. et al. (2020) 'A Blockchain-Based System for Student E-Portfolio Assessment
Using Smart Contract', in Proceedings of the 4th International Conference on Computer
Science and Artificial Intelligence (CSAI 2020). Zhuhai, China: ACM.
Available at: https://doi.org/10.1145/3445815.3445821.
```

**Dokumentasi / situs web**

```
Base (2026) Base Documentation. Available at: https://docs.base.org
(Accessed: 12 Agustus 2026).
```

**Standar**

```
IEEE (1998) IEEE Std 830-1998: IEEE Recommended Practice for Software Requirements
Specifications. New York: Institute of Electrical and Electronics Engineers.
```

**Peraturan perundang-undangan**

```
Republik Indonesia (2021) Keputusan Direktur Jenderal Pendidikan Tinggi Nomor
12/E/KPT/2021 tentang Pedoman Operasional Beban Kerja Dosen. Jakarta: Kementerian
Pendidikan, Kebudayaan, Riset, dan Teknologi.
```

### ⚠️ Temuan pada draf LEDGERDIK yang harus diperbaiki

Daftar Pustaka pada `docs/415_Laporan TA_[D].docx.md` saat ini bermasalah dan **wajib dirapikan**:

- Gaya tercampur antara Harvard (`Kirli, D. et al. (2022) '…'`) dan APA (`Pressman, R. S. (2001). …`) — harus **seluruhnya Harvard**.
- Terdapat entri `(no date)` — tahun terbit harus dilengkapi.
- Terdapat *placeholder* `[Diakses [TANGGAL AKSES]]` yang belum diisi.
- Terdapat catatan kerja yang bocor ke dokumen: `--- konfigkan (untuk bab III.4)` — **harus dihapus**.
- Urutan belum sepenuhnya abjad.
- Perlu diverifikasi bahwa setiap entri benar-benar dirujuk di badan laporan.

---

# B. Struktur Laporan Enam Bab

Laporan disusun dalam enam bab yang membentuk **satu rantai argumen**, bukan enam dokumen terpisah.


| Bab | Judul                              | Peran                                                                                   |
| ----- | ------------------------------------ | ----------------------------------------------------------------------------------------- |
| I   | Pendahuluan                        | Menetapkan**masalah** dan **tujuan** yang akan ditagih kembali di Bab V dan VI          |
| II  | Tinjauan Pustaka                   | Menyediakan**justifikasi teoretis** bagi setiap keputusan teknis di Bab III–IV         |
| III | Metodologi Pengembangan Sistem     | **Rencana** kerja — tiap tahap Waterfall diberi tujuan, kegiatan, dan luaran           |
| IV  | Pembahasan dan Implementasi Solusi | **Eksekusi** rencana Bab III — urutan subbab **persis mengikuti** III.5                |
| V   | Analisis Dampak Hasil Pengembangan | **Menjawab tujuan Bab I** dengan bukti empiris                                          |
| VI  | Penutup                            | Kesimpulan per tujuan, saran sebagai tindak lanjut kelemahan V.4, rencana keberlanjutan |

### Proporsi isi (acuan dari contoh TA yang lulus)


| Bab                                | Porsi kasar  |
| ------------------------------------ | -------------- |
| I Pendahuluan                      | ~6%          |
| II Tinjauan Pustaka                | ~10%         |
| III Metodologi                     | ~8%          |
| **IV Pembahasan dan Implementasi** | **~65–70%** |
| V Analisis Dampak                  | ~13%         |
| VI Penutup                         | ~6%          |

> Bab IV adalah inti laporan. Bila Bab IV lebih tipis dari Bab II, ada yang salah.

### Struktur dokumen lengkap (urut fisik)

```
Halaman Sampul
Halaman Pengesahan
Surat Pernyataan (bila disyaratkan)
ABSTRAK                        [halaman i]
ABSTRACT
KATA PENGANTAR
DAFTAR ISI                     [halaman ii dst]
DAFTAR GAMBAR
DAFTAR TABEL
DAFTAR RUMUS
DAFTAR ISTILAH
DAFTAR SINGKATAN DAN LAMBANG
DAFTAR LAMPIRAN
BAB I   PENDAHULUAN            [halaman 1 dst]
BAB II  TINJAUAN PUSTAKA
BAB III METODOLOGI PENGEMBANGAN SISTEM
BAB IV  PEMBAHASAN DAN IMPLEMENTASI SOLUSI
BAB V   ANALISIS DAMPAK HASIL PENGEMBANGAN SISTEM
BAB VI  PENUTUP
DAFTAR PUSTAKA
LAMPIRAN
  Lampiran 1  Dokumen SRS
  Lampiran 2  Surat Keterangan Digunakan oleh Mitra
  Lampiran 3  ... (kuesioner UAT, hasil pengujian, dsb.)
```

---

# C. Pola Penulisan yang Wajib Diikuti

Pola berikut diambil langsung dari contoh TA yang lulus. Mengikutinya membuat laporan terbaca sebagai satu kesatuan, bukan tempelan.

## C.1 Kalimat pengantar bab (wajib menurut formulir)

Setiap bab **wajib** dibuka satu paragraf tanpa nomor yang menerangkan lingkup bahasan bab tersebut.

> **Contoh (Bab III):**
> Pada bab ini dijelaskan metodologi pengembangan sistem LEDGERDIK sebagai landasan pelaksanaan proses pengembangan. Uraian dalam bab ini meliputi waktu dan tempat pelaksanaan, jenis pengembangan, data dan objek pengembangan, perangkat pendukung, serta prosedur pengembangan yang digunakan. Pembahasan juga mencakup tahapan pengembangan secara berurutan, mulai dari analisis dan penetapan spesifikasi persyaratan perangkat lunak, perancangan, implementasi, pengujian, hingga *operation* dan *maintenance*, disertai luaran dan indikator capaian tiap tahap.

Aturan turunannya: **setiap subbab besar juga dibuka paragraf pengantar** sebelum masuk ke sub-subbab. Tidak boleh ada judul subbab yang langsung diikuti judul sub-subbab.

## C.2 Pola penutup subbab teori (Bab II)

Setiap subbab Dasar Teori **wajib ditutup** dengan kalimat yang menautkan teori ke sistem yang dikembangkan. Inilah yang membedakan Tinjauan Pustaka dari rangkuman buku teks.

> **Pola:** *"Oleh karena itu, [teori] menjadi landasan penting dalam pengembangan [sistem] karena [alasan konkret]."*

> **Contoh:**
> …Oleh karena itu, ERD menjadi dasar perancangan basis data sistem LEDGERDIK karena struktur data penilaian BKD melibatkan banyak entitas yang saling berelasi, mulai dari pengguna, periode BKD, kegiatan, hingga hasil penilaian dan riwayat transaksi *on-chain*.

## C.3 Pola penyajian ilustrasi

Urutan wajib: **rujukan → ilustrasi → pembahasan**.

```
[Kalimat yang merujuk]  Struktur data blocklist yang menjadi acuan
                        pengembangan disajikan pada Tabel III.1.

[Judul tabel]           Tabel III.1. Struktur Data Blocklist
[Badan tabel]           | Nama Kolom | Contoh Data | Deskripsi |
                        ...

[Kalimat pembahasan]    Berdasarkan Tabel III.1, kolom typeBlocklist
                        digunakan untuk membedakan …
```

Untuk gambar:

```
[Kalimat yang merujuk]  Gambaran arsitektur sistem secara keseluruhan
                        disajikan pada Gambar IV.3.
[Gambar]                [ diagram ]
[Judul gambar]          Gambar IV.3. Arsitektur Sistem LEDGERDIK
[Kalimat pembahasan]    Seperti terlihat pada Gambar IV.3, …
```

## C.4 Rujukan silang antarbab

Rujukan silang dipakai rapat untuk mengikat laporan. Selalu sebut **nomor subbab**, bukan sekadar "di atas" atau "sebelumnya".


| Arah        | Contoh                                                           |
| ------------- | ------------------------------------------------------------------ |
| Ke belakang | `sebagaimana ditetapkan pada subbab I.6.2`                       |
| Ke belakang | `Berdasarkan hasil identifikasi kebutuhan pada subbab IV.1.3.1`  |
| Ke depan    | `diuraikan lebih lanjut pada Bab III, khususnya subbab III.5`    |
| Ke depan    | `hasil pelaksanaan tahap ini diuraikan pada Bab V`               |
| Ke lampiran | `didokumentasikan secara lengkap pada dokumen SRS di Lampiran 1` |

## C.5 Keterlacakan (*traceability*) — tulang punggung laporan

Satu kebutuhan harus dapat ditelusuri lurus dari awal hingga akhir laporan:

```
Tujuan (I.3.1)
 └─> Rumusan Masalah (I.2)
      └─> Analisis Kebutuhan (IV.1.3)
           - Environment / Items Produced / Functions / Modes of Operation
           └─> Penetapan Requirement (IV.1.5)
                - FR-xxx-nn  (persyaratan fungsional, per modul)
                - NFR / SA-xxx (nonfungsional, mengacu ISO/IEC 25010)
                └─> Perancangan (IV.2)
                     - tiap rancangan layar/proses diberi label "Memenuhi FR-…"
                     └─> Implementasi (IV.3)
                          - tiap modul ditutup tabel "Realisasi Requirement"
                            | Kode Requirement | Requirement | Status Implementasi |
                          └─> Pengujian (IV.4)
                               - tiap skenario punya kolom "FR Terkait"
                               └─> Analisis Dampak (V.1)
                                    - Tabel pemetaan Tujuan → Fitur → Dampak → Sasaran
                                    └─> Kesimpulan (VI.1) dijawab per tujuan
                                         Saran (VI.2) = tindak lanjut kelemahan (V.4)
```

**Konvensi kode requirement** (pakai konsisten sejak Bab IV):


| Jenis                     | Format                          | Contoh untuk LEDGERDIK                |
| --------------------------- | --------------------------------- | --------------------------------------- |
| Persyaratan fungsional    | `FR-<MODUL>-<nn>`               | `FR-KEG-01`, `FR-NIL-03`, `FR-TOK-02` |
| Persyaratan nonfungsional | `SA-<ASPEK>-<nn>`               | `SA-SEC-01`, `SA-PRF-02`              |
| *Use case* / proses       | `UC-<MODUL>-<nn>` atau `P-<nn>` | `UC-NIL-01`                           |
| Skenario uji              | `TS-<MODUL>-<nnn>`              | `TS-KALK-001`                         |
| Skenario*system testing*  | `ST-SYS-<nn>`                   | `ST-SYS-01`                           |
| Batasan perancangan       | `DC-<nn>`                       | `DC-02`                               |

## C.6 Kejujuran akademik — pola yang menaikkan nilai

Contoh TA acuan berulang kali menyatakan keterbatasannya secara terbuka. Ini **memperkuat**, bukan memperlemah, laporan.

**Pola wajib: nyatakan keterbatasan → jelaskan penyebabnya → tunjuk ke saran Bab VI.**

> **Contoh:**
> Perlu ditegaskan bahwa status lulus pada seluruh skenario pengujian tidak berarti kode bebas dari *bug*. Jumlah dan variasi skenario masih terbatas dan belum menjangkau seluruh kemungkinan masukan maupun jalur logika. **Persentase sempurna ini membuktikan keberhasilan verifikasi, bukan jaminan bahwa sistem bebas dari bug.** Keterbatasan kedalaman pengujian ini menjadi dasar rekomendasi perluasan cakupan uji pada saran BAB VI.

Bedakan tegas dua hal ini di Bab V.4:

- **Kelemahan** — kekurangan nyata pada hasil pengembangan yang idealnya diperbaiki.
- **Keterbatasan** — batas cakupan pengukuran/lingkup yang dinyatakan apa adanya, bukan penanda kegagalan produk.

## C.7 Standar yang dirujuk (memberi bobot akademik)


| Aspek                        | Standar                                     | Dipakai di                                                        |
| ------------------------------ | --------------------------------------------- | ------------------------------------------------------------------- |
| Model proses                 | Waterfall (Sommerville, 2011)               | II.1, III.5, IV                                                   |
| Spesifikasi kebutuhan        | IEEE Std 830-1998                           | III.5.1, IV.1.5, Lampiran 1                                       |
| Dokumentasi pengujian        | IEEE Std 829                                | IV.4.1 (buat**tabel pemetaan** elemen IEEE 829 → bagian laporan) |
| Kualitas produk              | ISO/IEC 25010 —*Product Quality*           | IV.4.6                                                            |
| Kualitas penggunaan          | ISO/IEC 25010 —*Quality in Use*            | V.2.7                                                             |
| Pemodelan proses terstruktur | DeMarco / Yourdon (DFD), Pressman (2001)    | II.1, IV.2.2                                                      |
| Pemodelan data               | *Entity-Relationship*, notasi *Crow's Foot* | II.1, IV.2.4                                                      |

> **Catatan LEDGERDIK.** Laporan ini memakai pendekatan **SASD** (DFD, Kamus Data, Spesifikasi Proses, *Structure Chart*) — bukan OOSE/UML seperti contoh TA acuan. Pilihan ini **sah dan tepat** karena objek pengembangannya *smart contract* dan aplikasi web yang bersifat prosedural. Yang penting: **konsisten** — jangan mencampur notasi UML ke dalam bab yang sudah memakai notasi terstruktur, kecuali diberi penjelasan alasannya (contoh TA acuan melakukan ini saat mencampur UML dan Crow's Foot, dan alasannya dijelaskan eksplisit).

---

# D. Kerangka Rinci per Bab + Penerapan LEDGERDIK

## BAB I — PENDAHULUAN

```
[paragraf pengantar bab]
I.1  Latar Belakang
I.2  Rumusan Masalah
I.3  Tujuan dan Manfaat Pengembangan Sistem
     I.3.1  Tujuan Pengembangan
     I.3.2  Manfaat Pengembangan
I.4  Pemangku Kepentingan dan Manfaat Hasil Pengembangan Sistem
I.5  Dukungan Data
I.6  Ruang Lingkup dan Batasan
     I.6.1  Ruang Lingkup
     I.6.2  Batasan
I.7  Sistematika Penulisan
```

**I.1 Latar Belakang** — pola alur 6 langkah:

1. Konteks umum (transformasi digital / tata kelola perguruan tinggi)
2. Masalah faktual **dengan data dan sitasi** (beban administratif BKD, risiko manipulasi bukti, verifikasi manual)
3. Solusi yang sudah ada dan **celah kelemahannya**
4. Solusi yang diusulkan (LEDGERDIK) + apa pembedanya
5. Landasan teoretis/teknologis yang dipakai (*blockchain*, *smart contract*, VLM untuk ekstraksi dokumen)
6. Justifikasi pilihan platform/regulasi (Base Sepolia, PO BKD 2021)

**I.2 Rumusan Masalah** — ditulis sebagai **butir bernomor**, tiap butir berpola: *kondisi masalah + dampaknya + sitasi* → ditutup *"Oleh karena itu, diperlukan …"*. Jumlah butir sebaiknya **sama dengan jumlah tujuan** di I.3.1.

**I.3.1 Tujuan** — tiap butir diawali kata kerja hasil: *"Menghasilkan sistem yang …"*, dan menyebut fitur konkret + manfaat terukur.

**I.3.2 Manfaat** — ⚠️ **belum ada di draf LEDGERDIK, wajib ditambahkan.** Tiap butir menyebut **siapa penerimanya** dan **apa yang diperolehnya**.

**I.4 Pemangku Kepentingan** — daftar bernomor; tiap pihak diberi satu paragraf peran + manfaat. Untuk LEDGERDIK: Dosen, Asesor, Admin/Operator BKD, Pimpinan Jurusan/Institusi.

**I.5 Dukungan Data** — sumber data beserta **jumlah, tautan, dan tanggal pengambilan**. Untuk LEDGERDIK: PO BKD 2021 (Kepdirjendikti), data referensi kegiatan, sampel dokumen bukti.

**I.7 Sistematika Penulisan** — bentuk **tabel dua kolom**: `BAB I | Pendahuluan` lalu baris berikutnya berisi deskripsi isi bab.

## BAB II — TINJAUAN PUSTAKA

```
[paragraf pengantar bab]
II.1  Dasar Teori
      II.1.1  ... (satu subbab per teori/teknologi inti)
      ...
II.2  Karya Ilmiah Sejenis
```

Aturan:

- **Urutan II.1 dan II.2 boleh ditukar.** Bila ide/pendekatan utama datang dari karya ilmiah tertentu, letakkan Karya Ilmiah Sejenis lebih dahulu.
- Hanya masukkan teori yang **benar-benar dipakai** di Bab III–IV. Teori yang tidak berujung ke keputusan teknis dibuang.
- Setiap subbab ditutup pola C.2.
- **II.2 wajib berisi:** tabel karya sejenis (`No | Tahun & Penerbit | Penulis | Judul | Hasil`) → paragraf pembelajaran per karya → paragraf ***gap analysis*** → paragraf posisi kebaruan sistem yang dikembangkan.

**Untuk LEDGERDIK**, daftar teori yang sudah ada di draf sudah tepat: *Blockchain*, *Smart Contract*, EVM, BKD, PostgreSQL, ERC-20 & OpenZeppelin, Hash Kriptografi, Ekstraksi Dokumen & VLM, Verifikasi Keaslian Dokumen, Waterfall, SASD (DFD, Kamus Data, Spesifikasi Proses, *Structure Chart*), ERD.

## BAB III — METODOLOGI PENGEMBANGAN SISTEM

```
[paragraf pengantar bab]
III.1  Penjelasan Pengembangan Sistem
       III.1.1  Waktu Pengembangan
       III.1.2  Tempat Pelaksanaan
       III.1.3  Jenis Pengembangan
III.2  Data Pengembangan Sistem
III.3  Objek Pengembangan Sistem
III.4  Perangkat Pendukung
       III.4.1 ... (satu subbab per perangkat)
III.5  Tahapan Pelaksanaan Pengembangan Sistem
       III.5.1  Analisis dan Penetapan Spesifikasi Persyaratan Perangkat Lunak
       III.5.2  Perancangan
       III.5.3  Implementasi
       III.5.4  Pengujian
       III.5.5  Operation dan Maintenance
```

Aturan:

- **III.2 Data** — sajikan **struktur data** dalam tabel `Nama Kolom | Contoh Data | Deskripsi`, dan nilai kelayakan data dengan kriteria eksplisit (relevansi, *time suitability*, validitas, kecukupan, akurasi).
- **III.4 Perangkat Pendukung** — tiap perangkat ditulis **dua paragraf**:
  1. Definisi + karakteristik teknis, **wajib bersitasi** (dokumentasi resmi atau buku).
  2. Peran spesifik perangkat itu **di dalam sistem yang dikembangkan**.

  > Jangan menulis definisi generik tanpa paragraf kedua — inilah kesalahan paling umum di bab ini.
  >
- **III.5** — tiap tahap ditulis dengan struktur seragam: **Tujuan tahap → Kegiatan → Luaran**. Bila ada penyimpangan dari model Waterfall baku (mis. *unit testing* dipisah dari implementasi), **nyatakan dan jelaskan alasannya**.
- Urutan subbab III.5 **harus persis sama** dengan urutan subbab IV.1–IV.5.

## BAB IV — PEMBAHASAN DAN IMPLEMENTASI SOLUSI

```
[paragraf pengantar bab]
IV.1  Analisis
      IV.1.1  Analisis Sistem Berjalan
      IV.1.2  Kesimpulan Analisis dan Usulan Pemecahan Masalah
      IV.1.3  Analisis Sistem yang Akan Dikembangkan
              IV.1.3.1  Identifikasi Kebutuhan Sistem
                        (Environment / Items Produced / Functions / Modes of Operation)
              IV.1.3.2  Analisis Pemilihan Metode/Teknologi
              IV.1.3.3  Alur Proses Sistem yang Diusulkan
      IV.1.4  Analisis Aturan Penilaian BKD Pendidikan yang Diimplementasikan
      IV.1.5  Penetapan Requirement Sistem yang Dikembangkan
IV.2  Perancangan
      IV.2.1  Perancangan Arsitektur Sistem
      IV.2.2  Perancangan Proses (Diagram Konteks, DFD Level 1, DFD Level 2,
                                  Kamus Data, Spesifikasi Proses)
      IV.2.3  Perancangan Modul (Structure Chart, Spesifikasi Modul)
      IV.2.4  Perancangan Basis Data
      IV.2.5  Perancangan Antarmuka Pengguna
IV.3  Implementasi
      IV.3.1  Lingkungan Pengembangan
      IV.3.2  Matriks Implementasi
      IV.3.3 ... (satu subbab per modul)
IV.4  Pengujian
      IV.4.1  Test Plan
      IV.4.2  Unit Testing
      IV.4.3  Integration Testing
      IV.4.4  System Testing
      IV.4.5  Uji Akurasi Perhitungan Kredit
      IV.4.6  Pengujian Aspek Nonfungsional
      IV.4.7  Kesimpulan Hasil Pengujian
IV.5  Operation dan Maintenance
      IV.5.1  Operasi Sistem
      IV.5.2  Pemeliharaan Sistem
```

### Struktur seragam tiap subbab modul implementasi (IV.3.x)

Wajib memakai urutan yang sama untuk semua modul:

1. Paragraf pembuka — apa fungsi modul + FR mana yang direalisasikan
2. Potongan kode inti (dalam tabel berjudul, Courier New 9 pt) + penjelasan logikanya
3. **Hasil implementasi** — tangkapan layar / hasil eksekusi
4. **Keterkaitan *Requirement*** — tabel penutup

```
Tabel IV.xx. Realisasi Requirement Modul <Nama Modul>
| Kode Requirement | Requirement | UC | Status Implementasi |
| FR-KEG-01        | Sistem harus … | UC-KEG-01 | Terimplementasi |
```

Nyatakan di pengantar IV.3 bahwa penyajian difokuskan pada logika inti dan *boilerplate* tidak ditampilkan.

### Struktur *Test Plan* (IV.4.1) — 12 bagian

1. Tahapan Pengujian (siklus: perencanaan → penyusunan skenario → pelaksanaan → pencatatan & analisis → perbaikan & uji ulang)
2. Jenis Pengujian (tabel: jenis, pendekatan, tujuan)
3. Klasifikasi Skenario Pengujian (**Positif / Negatif / *Edge***) + tabel distribusi per modul
4. *Test Items*
5. *Features to be Tested* — tabel pemetaan tiap FR → cara verifikasi → pendekatan → jenis pengujian
6. *Features Not to be Tested* — **beserta alasan pengecualian**
7. Lingkungan Pengujian — spesifikasi perangkat, *tools*, versi, jaringan (Hardhat local / Base Sepolia)
8. Format Skenario Pengujian — definisi tiap kolom tabel skenario
9. Batasan Pengujian
10. Kriteria Kelulusan Item Uji — **per jenis pengujian**, ditetapkan **sebelum** eksekusi
11. Kriteria Penghentian dan Persyaratan Pelanjutan
12. Produk Pengujian — pemetaan *test deliverables* IEEE 829 → bagian laporan, termasuk yang **tidak tersedia beserta alasannya**

Tambahkan pula **tabel pemetaan elemen IEEE Std 829 → bagian laporan** di awal IV.4.1.

### Format tabel skenario pengujian (baku, 7 kolom)

```
Tabel IV.xx. Skenario Unit Testing Modul <Nama>
| ID Skenario | FR Terkait | Deskripsi | Kondisi Awal | Langkah Pengujian | Hasil yang Diharapkan | Status |
| TS-KALK-001 | FR-KAL-01  | (Positif) … | … | … | … | Lulus |
```

Urutkan skenario: **Positif → Negatif → *Edge***. Awali kolom Deskripsi dengan kategori dalam kurung.

## BAB V — ANALISIS DAMPAK HASIL PENGEMBANGAN SISTEM

> ⚠️ **Belum ada sama sekali di draf LEDGERDIK.**

```
[paragraf pengantar bab]
V.1  Dampak Positif (Outcome) yang Diharapkan bagi Pengguna dan Mitra
     V.1.1  Pemetaan Tujuan Pengembangan terhadap Dampak yang Diharapkan
     V.1.2  Rincian Dampak per Pemangku Kepentingan
     V.1.3  Ringkasan Pernyataan Pengguna dari Uji Coba
     V.1.4  Kesesuaian Hasil dengan Tujuan Pengembangan
     V.1.5  Kesadaran Pengguna terhadap Sistem
V.2  Keberterimaan Pengguna Berdasarkan Hasil Uji Adopsi (User Acceptance Test)
     V.2.1  Profil Responden
     V.2.2  Instrumen dan Skala Pengukuran
     V.2.3  Hasil Keberterimaan per Kategori Penilaian
     V.2.4  Hasil Keberterimaan per Pernyataan
     V.2.5  Umpan Balik Kualitatif dari Pengguna
     V.2.6  Kesimpulan Keberterimaan Pengguna
     V.2.7  Keterkaitan Hasil UAT dengan Persyaratan Nonfungsional
V.3  Rekognisi Mitra atas Kebermanfaatan Produk
V.4  Kelemahan dan Keterbatasan Hasil Pengembangan sebagai Dasar Saran
     V.4.1  Kelemahan pada Realisasi Dampak yang Dirasakan Pengguna
     V.4.2  Keterbatasan pada Cakupan dan Metode Pengukuran Dampak
     V.4.3  Keterbatasan pada Jangkauan Dampak bagi Pemangku Kepentingan
```

**Instrumen UAT yang perlu disiapkan** (mengikuti contoh TA acuan):

- Kuesioner **skala Likert 4 tingkat** (1 = sangat tidak setuju … 4 = sangat setuju). Empat tingkat dipilih untuk menghindari jawaban netral — **nyatakan alasan ini di laporan** dan beri sitasi.
- Bagi pernyataan ke tiga bagian: **Usability**, **Usefulness**, **User Experience per Fitur** — agar bisa dipetakan ke *Quality in Use* ISO/IEC 25010.
- Sertakan beberapa pernyataan ***unfavorable*** (bernada negatif) yang nilainya dibalik (*reverse scored*) saat agregasi.
- Rentang interpretasi rerata skor:


| Rentang Rerata | Interpretasi                  | Indeks (%)   |
| ---------------- | ------------------------------- | -------------- |
| 1,00 – 1,75   | Kurang                        | 25,0 – 43,7 |
| 1,76 – 2,50   | Cukup                         | 44,0 – 62,5 |
| 2,51 – 3,25   | Baik (Diterima)               | 62,8 – 81,2 |
| 3,26 – 4,00   | Sangat Baik (Sangat Diterima) | 81,5 – 100  |

**V.3 Rekognisi Mitra** — perlu **Surat Keterangan Digunakan oleh Mitra** bertanda tangan, dilampirkan di Lampiran. Untuk LEDGERDIK, mitra yang relevan: unit/koordinator BKD Jurusan Teknik Komputer dan Informatika Polban.

## BAB VI — PENUTUP

> ⚠️ **Belum ada sama sekali di draf LEDGERDIK.**

```
[paragraf pengantar bab]
VI.1  Kesimpulan
VI.2  Saran
VI.3  Rencana Keberlanjutan dan Komersialisasi Produk
      VI.3.1  Rencana Keberlanjutan (Sustainability Plan)
      VI.3.2  Rencana Komersialisasi (Commercialization Plan)
```

Aturan:

- **VI.1 Kesimpulan** — butir bernomor. Butir 1–4 menjawab **tujuan I.3.1 satu per satu** dengan angka hasil pengujian. Sertakan pula butir tentang **tingkat ketuntasan pengembangan** (jumlah FR terimplementasi, status *deployment*, TKT) dan butir tentang **pembatasan hasil** secara eksplisit. **Dilarang** memunculkan hal baru yang tidak dibahas di Bab I–V.
- **VI.2 Saran** — butir bernomor, **setiap butir adalah tindak lanjut langsung dari kelemahan/keterbatasan di V.4 atau IV.4**. Ditulis dengan kata kerja imperatif: *"Tambahkan …"*, *"Perkuat …"*, *"Lakukan …"*. Jangan menulis saran generik yang tidak berakar pada temuan.
- **VI.3** — Keberlanjutan: pemeliharaan teknis, pengelolaan infrastruktur (*node*/RPC, *gas*, basis data), pengembangan fitur lanjutan, transparansi pembaruan, kolaborasi dengan pihak berwenang. Komersialisasi: potensi produk & layanan, model bisnis, target pengguna & pasar, strategi distribusi, keunggulan kompetitif, perlindungan kekayaan intelektual.

---

# E. Checklist Review Akhir

Jalankan sebelum menyerahkan laporan ke Pemeriksa 1 dan Pemeriksa 2.

## E.1 Layout dan Format

- [ ]  Kertas A4; margin *portrait* 4/4/3/3 cm; *landscape* sesuai ketentuan
- [ ]  Seluruh font TNR (kecuali *source code* Courier New 9 pt)
- [ ]  Judul bab TNR 14 pt Bold Center; judul subbab TNR 12 pt Bold Left
- [ ]  Judul Abstrak/Kata Pengantar/Daftar-daftar TNR 14 pt Bold Center
- [ ]  Spasi konten 1,5 tanpa *before/after*; abstrak spasi 1; isi tabel spasi 1
- [ ]  Jarak judul bab → subbab pertama 24 pt
- [ ]  Jarak judul subbab → konten 6 pt
- [ ]  Jarak akhir subbab → judul subbab baru 12 pt
- [ ]  Tipe paragraf **konsisten satu gaya** (menjorok), **tidak dicampur** dengan spasi pemisah
- [ ]  Isi tabel TNR 10 pt

## E.2 Penomoran

- [ ]  Bab: Romawi kapital (`BAB I`)
- [ ]  Subbab: `I.1`, `I.1.1` — **bukan** `1.1`, `1.1.1`
- [ ]  Nomor tabel dan gambar mengikuti bab (`Tabel IV.1`, `Gambar IV.1`), urut kontinu, tidak ada nomor lompat/ganda
- [ ]  Rumus bernomor dalam kurung `(III.1)`, *centered*
- [ ]  Halaman abstrak mulai `i`, halaman daftar mulai `ii`, tengah bawah
- [ ]  Konten utama mulai `1`; awal bab tengah bawah, lanjutan kanan atas
- [ ]  Penomoran rincian mengikuti jenjang `1.` → `a.` → `a.1.`, batas kiri sejajar

## E.3 Ilustrasi

- [ ]  **Setiap** tabel dirujuk di narasi, dengan kalimat rujukan **sebelum** tabel muncul
- [ ]  **Setiap** gambar dirujuk di narasi, dengan kalimat rujukan **sebelum** gambar muncul
- [ ]  **Setiap** rumus dirujuk di narasi
- [ ]  Judul tabel **di atas** tabel; judul gambar **di bawah** gambar
- [ ]  Tidak ada ilustrasi yang langsung mengikuti judul subbab tanpa kalimat pengantar
- [ ]  Setiap ilustrasi diikuti kalimat pembahasan
- [ ]  Gambar kutipan mencantumkan sumber pada judulnya
- [ ]  Isi Daftar Tabel, Daftar Gambar, dan Daftar Rumus cocok dengan isi laporan

## E.4 Bahasa

- [ ]  Seluruh konten Bab I–Daftar Pustaka memakai **kalimat pasif**
- [ ]  **Tidak ada** kata `penulis`, `saya`, `peneliti`, `kami` (cari dengan Ctrl+F)
- [ ]  Kalimat majemuk maksimal 15 kata
- [ ]  Setiap kalimat punya S-P-O-[K] yang jelas
- [ ]  Tidak ada redundansi (`hanya … saja`, `agar supaya`, `adalah merupakan`)
- [ ]  Kata baku sesuai KBBI/EYD
- [ ]  Istilah asing dicetak **miring**, konsisten sepanjang laporan
- [ ]  Akronim dijelaskan panjangnya pada kemunculan pertama

## E.5 Struktur dan Isi

- [ ]  Setiap bab dibuka **kalimat pengantar bab**
- [ ]  Setiap subbab besar dibuka paragraf pengantar sebelum sub-subbab
- [ ]  Urutan subbab IV.1–IV.5 **sama persis** dengan urutan tahapan III.5
- [ ]  Setiap subbab Dasar Teori (II.1) ditutup dengan tautan ke sistem yang dikembangkan
- [ ]  II.2 memuat tabel karya sejenis + ***gap analysis*** + posisi kebaruan
- [ ]  Rujukan silang antarbab menyebut **nomor subbab**, bukan "di atas"/"sebelumnya"
- [ ]  Setiap FR dapat ditelusuri: analisis → perancangan → implementasi → pengujian → dampak
- [ ]  Setiap modul implementasi ditutup tabel **Realisasi *Requirement***
- [ ]  Setiap skenario pengujian punya kolom **FR Terkait**
- [ ]  Keterbatasan dinyatakan **terbuka** dan ditautkan ke saran Bab VI
- [ ]  Kesimpulan VI.1 menjawab tujuan I.3.1 satu per satu, tanpa hal baru
- [ ]  Setiap saran VI.2 berakar pada temuan V.4 atau IV.4

## E.6 Daftar Pustaka dan Lampiran

- [ ]  Seluruh sitasi memakai **Harvard Style** secara konsisten
- [ ]  Setiap entri Daftar Pustaka benar-benar dirujuk di badan laporan
- [ ]  Setiap rujukan di badan laporan ada di Daftar Pustaka
- [ ]  Daftar Pustaka **urut abjad**, tanpa penomoran
- [ ]  **Tidak ada** entri `(no date)` / tahun kosong
- [ ]  **Tidak ada** *placeholder* yang belum diisi (`[TANGGAL AKSES]`, dsb.)
- [ ]  **Tidak ada** catatan kerja yang bocor ke dokumen
- [ ]  Lampiran lengkap dan dirujuk dari badan laporan (SRS, Surat Keterangan Mitra, instrumen UAT, hasil pengujian)
- [ ]  Daftar Lampiran cocok dengan lampiran yang ada

## E.7 Halaman Awal

- [ ]  Judul Indonesia 12–20 kata, HURUF KAPITAL, TNR 14 pt Bold Center
- [ ]  Judul Inggris 12–20 kata, Title Case + *italic*, TNR 12 pt Bold Center
- [ ]  Susunan sampul lengkap 10 unsur, urut
- [ ]  Teks tujuan laporan sesuai jenjang (Diploma 3 / Sarjana Terapan)
- [ ]  Penamaan prodi sesuai ketentuan terbaru, konsisten
- [ ]  Nama mahasiswa lengkap tanpa gelar + NIM
- [ ]  Logo Polban sesuai sumber resmi
- [ ]  Halaman pengesahan lengkap: pembimbing, Ketua Jurusan (kiri), Koordinator Prodi (kanan)
- [ ]  Abstrak ≤300 kata, TNR 11 pt, spasi 1, Kata Kunci bold + `:`
- [ ]  Abstrak tersedia dalam Bahasa Indonesia dan Bahasa Inggris

---

## Catatan Khusus Proyek LEDGERDIK

**Judul.** *"Pengembangan Sistem Penilaian Beban Kerja Dosen Bidang Pendidikan Berbasis Smart Contract untuk Otomatisasi Perhitungan Kredit Kegiatan"* — 16 kata, memenuhi rentang 12–20 kata. Judul Bahasa Inggris masih perlu disusun (12–20 kata, Title Case, *italic*).

**Yang perlu dikonfirmasi sebelum finalisasi halaman sampul:**

- Jenjang program (Diploma 3 atau Sarjana Terapan) → menentukan teks tujuan laporan dan penamaan prodi.

**Pekerjaan yang tersisa pada draf `docs/415_Laporan TA_[D].docx.md`:**


| Prioritas | Pekerjaan                                                                                         |
| ----------- | --------------------------------------------------------------------------------------------------- |
| 1         | Menambahkan subbab**I.3.2 Manfaat Pengembangan** (saat ini hanya ada Tujuan)                      |
| 2         | Menulis**BAB V** — Analisis Dampak (butuh data UAT dan Surat Keterangan Mitra)                   |
| 3         | Menulis**BAB VI** — Penutup                                                                      |
| 4         | Merapikan**Daftar Pustaka** ke Harvard Style, hapus `(no date)`, *placeholder*, dan catatan kerja |
| 5         | Menambahkan pernyataan keterbatasan eksplisit pada IV.4.7 Kesimpulan Hasil Pengujian              |
| 6         | Audit menyeluruh terhadap checklist Bagian E                                                      |

---

*Dokumen ini disusun sebagai acuan internal penulisan Laporan Tugas Akhir. Bila terdapat perbedaan antara panduan ini dan Formulir Pengecekan Tata Tulis Penulisan Laporan JTK Polban edisi terbaru, formulir resmi yang berlaku.*
