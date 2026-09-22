# CLAUDE.md

Panduan kerja untuk Claude Code di repository ini. Aturan di sini mengikat dan
menimpa kebiasaan default.

## Konteks project

Sistem Penilaian Beban Kinerja Dosen (BKD) bidang pendidikan. Perhitungan SKS
dijalankan smart contract, hasil yang disahkan dua asesor diterbitkan sebagai
token SKS non-transferable.

Stack: Next.js 14 App Router + React Server Components, TypeScript, Tailwind,
NextAuth (credentials), Prisma + PostgreSQL, Hardhat 3 + Solidity + ethers v6,
layanan parser dokumen berbasis Python (`backend-extract/`).

## Aturan bahasa

- Istilah teknis tetap Bahasa Inggris. Jangan diterjemahkan ke Indonesia:
  push, pull, commit, merge, branch, deploy, build, request, response, array,
  string, dependency, endpoint, smart contract, mint, burn, wallet, token,
  parser, migration, seed, server action, hook, state, props, query, schema.
  Berlaku umum, bukan hanya daftar ini.
- Nama domain BKD tetap Indonesia karena sudah jadi identifier: `kegiatan`,
  `periode_bkd`, `pengguna`, `asesor`, `dosen`, `lkd`, `unggahan_dokumen`,
  `hasil_penilaian`, `simpulan_bkd`, `riwayat_transaksi`.
- Jangan pakai em dash di teks, komentar, commit message, atau dokumentasi.
  Pakai titik, koma, atau kurung.
- Komentar kode dan copy UI pakai Bahasa Indonesia dengan istilah teknis
  Inggris tetap utuh, konsisten dengan kode yang sudah ada.

## Aturan UI

UI bukan tempat menginfokan. Ini production, bukan demo atau bahan presentasi.

Jangan pernah generate:

- Blok info, banner penjelas, callout, atau kotak "Info:" / "Perhatian:" /
  "Catatan:" yang mengajari cara pakai aplikasi.
- Helper text yang menjelaskan alur kerja ("klik tombol X lalu Y", "klaim data
  ini lewat menu Z", "yang perlu Anda lakukan...").
- Penjelasan internal sistem ke layar: nama fungsi contract, nama environment
  variable, nama file, struktur JSON, perintah CLI, nama tabel database.
- Teks yang menjelaskan kenapa sebuah field dikunci, kenapa nilai dihitung
  otomatis, atau bagaimana rumusnya bekerja.
- Data dummy, mock, sample, atau placeholder yang dirender ke UI.
- Label "coming soon", "beta", "demo".

Yang boleh ada di UI:

- Label field, placeholder input, breadcrumb, judul, subtitle halaman.
- State: kosong, terkunci, belum ada periode aktif, sudah diterapkan, ditolak.
  Tulis sesingkat mungkin, sebut state-nya saja tanpa instruksi lanjutan.
- Hasil validasi dan pesan error dari aksi yang baru dijalankan (flash message,
  temuan parser, konflik data).
- Konfirmasi untuk aksi destruktif atau irreversible (burn token, pengesahan
  final).
- Angka dan data: total SKS, jumlah kegiatan, status penilaian, fase periode.

Kalau pengguna butuh penjelasan cara kerja, tempatnya dokumentasi di `docs/`,
bukan layar aplikasi.

Komponen `InfoBox` sudah dihapus. Jangan buat ulang komponen sejenis.

## Tabel

Setiap tabel baru pakai `components/TabelData.tsx`. Template ini sudah membawa
pencarian, penyaring per kolom, pengurutan, pagination, dan state kosong yang
seragam. Jangan menulis `<table>` mentah atau menyalin logika pagination
sendiri di halaman.

Halaman tetap server component; kirim `kolom` dan `baris` ke template:

- `kolom`: `{ label, width?, urut?, filter?, labelFilter?, rata? }`.
- `baris`: `{ id, sel, nilai, cari? }`. `sel` adalah isi tiap `<td>` (boleh
  elemen apa pun, termasuk form server action), `nilai` adalah data mentah per
  kolom yang dipakai untuk urut, filter, dan pencarian, `cari` menambah teks
  yang ikut dicari tapi tidak tampil.
- Baris yang butuh state sendiri (input inline per baris) dikirim lewat
  `elemen` berisi `<tr>` utuh. Contoh: `components/BarisPengguna.tsx`.
- Kotak cari muncul otomatis selama tabel ada isinya. Matikan dengan
  `pencarian={false}` bila halaman sudah punya pencarian server-side
  (mis. `app/admin/log-blockchain/page.tsx`).

`components/DataTable.tsx` tetap dipakai untuk tabel yang tidak cocok dengan
template. Tabel custom boleh, tapi gaya visualnya wajib mengambil `KELAS_TABEL`
dari file itu supaya tampilannya tetap satu set. Tabel yang sengaja di luar
template:

- `app/admin/unggah/page.tsx` - penyaringan lewat StatTile + form GET, hasil
  sudah dibatasi 50 unggahan terbaru.
- `app/asesor/penilaian/[id]/bukti/[bid]/page.tsx` dan
  `components/BuktiKegiatanDetail.tsx` - satu dokumen bisa merender dua baris
  (panel verifikasi yang dibentangkan) dan jumlah barisnya sedikit.

## Struktur

- `app/admin`, `app/asesor`, `app/dosen` - halaman per peran. Akses dibatasi
  `middleware.ts` berdasarkan `token.peran`.
- Mutasi data lewat server action di file `actions.ts` per route, bukan API
  route. `app/api` hanya untuk auth dan serving berkas.
- `components/` - komponen shared. Server component kecuali ada `"use client"`.
- `lib/bkdRules.ts` - referensi rubrik BKD 2021.
- `lib/blockchain.ts` - jembatan ke contract kalkulator dan token.
- `lib/fase.ts` - fase periode (`pengisian`, `pemeriksaan`, `penilaian`)
  dan gate aksi. Semua aksi yang bergantung fase harus lewat helper
  di sini, jangan cek tanggal manual.
- `lib/parserDokumen.ts`, `lib/pemetaanPenugasan.ts`, `lib/namaDosen.ts` -
  ekstraksi SK/ST dan pencocokan nama dosen ke akun.
- `contracts/BKD.sol` - `KalkulatorBKDPendidikan`, rule engine SKS. Skala
  `1 SKS = 100` (integer, tanpa floating point).
- `contracts/token.sol` - `BKDSKSToken`, ERC-20 soulbound.
- `prisma/schema.prisma` - schema database. Ubah schema selalu dengan migration
  baru, jangan edit migration yang sudah ada.
- `backend-extract/` - layanan Python parser PDF dan VLM.

## Perintah

```
npm run dev                 # Next.js dev server
npm run build:web           # build Next.js
npm run compile:contracts   # compile Solidity
npm run test:contracts      # Hardhat test
npm run db:migrate          # Prisma migration dev
npm run db:seed             # seed data
npx tsc --noEmit            # typecheck
```

Setelah mengubah TypeScript, jalankan `npx tsc --noEmit`. Setelah mengubah
contract, jalankan `npm run test:contracts`.

## Cache build

Jangan hapus cache `.next` kecuali diminta. Kalau halaman terlihat menyajikan
chunk lama setelah perubahan, sebutkan saja supaya pengguna yang memutuskan
restart dev server atau hapus cache.

Jangan jalankan `prettier` atau `eslint --fix` massal. Repo ini tidak punya
konfigurasi prettier, jadi hasilnya menulis ulang seluruh file dan menutupi
perubahan asli. Format kode manual, ikuti gaya file di sekitarnya.

## Aturan implementasi

- Nilai SKS selalu integer skala x100 (`sks_dihitung_x100`, `sks_disetujui_x100`).
  Konversi ke desimal hanya saat render.
- Perhitungan SKS wajib lewat contract, jangan hitung ulang di TypeScript.
- Parameter yang sudah ditentukan konteks periode ada di
  `PARAMETER_TETAP` (`lib/parameterKegiatan.ts`). Jangan baca dari form input.
- Kegiatan yang bersumber dari penugasan (input admin atau ekstraksi SK/ST)
  read-only untuk dosen. Dosen hanya unggah bukti dan klaim ke laporan.
- Penilaian butuh dua asesor. Nilai berbeda dirata-ratakan, token diterbitkan
  setelah keduanya mengesahkan.
- Jangan commit atau push kecuali diminta.

## Diagram laporan

Diagram BAB IV disimpan sebagai `.drawio` di `docs/diagram/`. Buat diagram
hanya dalam format draw.io. Folder `docs/gambar/` berisi versi Mermaid lama
yang tidak dirawat; jangan tambah ke sana.

Notasi wajib merujuk buku di `docs/`:

- `Software Engineering - Roger S Pressman [5th edition].pdf` untuk notasi
  analisis terstruktur: diagram konteks, DFD, kamus data, spesifikasi proses,
  structure chart, ERD. Ini notasi yang dipakai laporan; BAB II subbab SSAD
  menyatakan laporan tidak memakai UML.
- `Applying_UML_and_Patterns_3rd_Edition.pdf` hanya bila laporan berubah
  memakai notasi UML.

Sitasi buku ditulis pada kalimat narasi yang merujuk gambar, bukan di dalam
gambar. Aturan Pressman yang ditegakkan: setiap panah DFD berlabel; level 0
satu proses tunggal; aliran masuk dan keluar proses induk sama dengan diagram
anaknya (penyeimbangan); DFD tidak menggambarkan urutan seperti flowchart;
structure chart tidak menggambarkan urutan, percabangan, dan pengulangan.

Cara membuat: pakai generator di `docs/diagram/generator/`
(`python buat_semua.py`, atau satu skrip per gambar). `dg.py` menulis XML
draw.io dengan rute garis eksplisit (waypoint) dan label sebagai kotak teks
mandiri, merender PNG ke `generator/pratinjau/`, dan menjalankan pemeriksaan:
kotak tumpang tindih, label tumpang tindih, garis menembus kotak, label
tertimpa garis. Jangan andalkan perutean otomatis draw.io. Jangan menaruh
node di grid lalu membiarkan draw.io menggambar garisnya; hasilnya kusut dan
tidak bisa dirapikan manual.

Urutan kerja tiap diagram: bangun satu, jalankan pemeriksaan sampai BERSIH,
buka PNG-nya dan periksa visual (persilangan garis, label menimpa, ruas garis
terlalu pendek untuk labelnya), perbaiki, baru lanjut ke diagram berikutnya.
DFD besar ditata per klaster: penyimpanan data dan entitas digambar berulang
di dekat proses pemakainya supaya tidak ada garis memotong. Label diletakkan
di sisi luar garisnya sendiri, label tulis di atas label baca.

# Gaya komunikasi

Aturan ini untuk laporan, ringkasan, dan penjelasan yang kamu tulis ke saya.
Bukan untuk komentar di dalam kode.

Target tulisannya: seperti rekan kerja senior yang lagi buru-buru dan menghargai
waktu saya. Bukan konsultan yang lagi presentasi, bukan chatbot yang lagi
menjelaskan.

## Bahasa

Bahasa Indonesia santai. Boleh "saya/kamu" atau "gue/lo", asal konsisten.

Istilah teknis umum tetap ditulis dalam bahasa Inggris. Jangan diterjemahkan:
binary, commit, deploy, build, endpoint, node, config, schema, layer, approval,
reset, rollback, container, migration, drag & drop, query, cache.

Tulis "binary sigv2 sudah memuat approval", bukan "biner memuat persetujuan".
Tulis "commit c9511ce", bukan "patokan c9511ce".
Tulis "node not found", bukan "simpul tidak ditemukan".

Nama identifier ikut persis apa yang ada di kode, database, atau UI. Jangan
diterjemahkan ke arah mana pun. Repo ini banyak memakai penamaan Indonesia,
jadi `peta-maplibre`, `gaya-lapisan.ts`, `sig`, dan `dev-lokal.sh` ditulis apa
adanya. Kalau di database namanya `pole` dan `segment_id`, ya `pole` dan
`segment_id`. Kalau kamu ragu istilah mana yang dipakai, tanya sekali di awal,
jangan menebak.

Pilih kata yang paling umum dipakai orang. "Menunjukkan", bukan "menyiratkan
secara eksplisit". "Sudah jalan", bukan "telah beroperasi secara fungsional".

## Struktur laporan

Format default untuk laporan hasil kerja, termasuk hasil run semalam:

1. Satu kalimat status di baris pertama. Berapa yang selesai, berapa sisanya.
   Contoh: "Deploy 1 selesai, 6 fitur siap dicoba. Deploy 2 masih jalan."
2. Daftar hasil. Maksimal 7 poin, satu poin satu baris. Isinya nama fitur, lalu
   statusnya: bisa dicoba, belum, atau gagal plus alasan singkat.
3. Yang butuh keputusan saya, kalau ada. Maksimal 3, masing-masing satu kalimat
   plus opsi konkretnya.
4. Catatan atau peringatan di paling bawah, maksimal 2 kalimat.

Kalau ada yang gagal atau di-skip, taruh di daftar nomor 2 juga. Jangan
disembunyikan di paragraf bawah.

Panjang maksimal 15 baris. Kalau butuh lebih, tanya dulu.

## Yang tidak usah ditulis

Bukti verifikasi dan metodologi. Jangan tulis bagaimana kamu memastikan hasilnya
benar, misalnya jumlah hasil grep, string lama nol dan string baru satu, atau
pengecekan dua arah. Saya anggap kamu memang memverifikasi. Kalau saya butuh
buktinya, saya akan minta.

Argumen kenapa kerjaanmu layak dipercaya. Laporkan hasilnya, bukan pembelaannya.

Pengulangan. Jangan ulang isi daftar dalam bentuk paragraf di bawahnya.

## Pola kalimat yang bikin susah dibaca

Ini pola khas tulisan AI. Hindari semuanya.

Metafora dan bahasa kiasan. Tulis harfiah.
Jangan "deploy sudah mendarat", tulis "deploy sudah selesai".
Jangan "tombolnya terbit", tulis "tombolnya muncul".
Jangan "akar 404-nya tertutup", tulis "penyebab 404 sudah diperbaiki".

Kalimat aforisme yang kedengaran dalam tapi tidak menambah informasi.
Jangan "angka tunggal tidak membuktikan apa-apa".
Jangan "X bukan sekadar Y, tapi Z".
Jangan "yang sebenarnya penting di sini adalah".

Em dash dan anak kalimat berlapis. Satu ide satu kalimat. Kalau satu kalimat
lewat dari 20 kata, pecah jadi dua. Ganti em dash dengan titik, koma, atau
titik dua.

Rentetan kalimat pendek yang dibikin dramatis. Contoh yang harus dihindari:
"Lalu deploy kedua masuk. Tanpa peringatan. Tanpa rollback. Semua berubah."

Kalimat pasif tanpa pelaku. Sebut siapa atau apa yang melakukan.
Jangan "config sudah di-apply", tulis "saya sudah apply config lewat rsync".

Kalimat samar tanpa isi. Jangan "hasilnya cukup signifikan", sebut angkanya
atau sebut fiturnya.

Basa-basi pembuka. Langsung ke isinya.
Jangan "Berikut adalah ringkasan hasil kerja semalam".
Jangan "Mari kita lihat apa saja yang sudah selesai".

Sisa percakapan chatbot yang nyasar ke laporan: "Semoga membantu", "Tentu!",
"Anda benar sekali", "Kabari kalau ada yang perlu saya jelaskan lagi".

Bold berlebihan, emoji, dan judul yang tiap katanya diawali huruf besar.
Bold hanya untuk satu atau dua hal yang benar-benar perlu saya lihat duluan.

Kalau kamu ragu sebuah kalimat kepanjangan, baca ulang dengan suara di kepala.
Kalau harus ambil napas di tengah, pecah kalimatnya.

## Yang justru saya mau

Netral dan datar itu benar untuk laporan teknis. Jangan ditambahi kepribadian,
humor, atau opini yang tidak saya minta. Yang saya minta adalah kalimatnya
pendek dan kata-katanya biasa, bukan gaya bahasa yang lebih ekspresif.

Kalau ada yang kamu tidak yakin, bilang tidak yakin dan sebut apa yang belum
dicek. Itu lebih berguna daripada kalimat yang terdengar pasti.

Kalau saya bertanya soal teknis, mulai dari gambaran besarnya dulu dalam bahasa
awam. Detail implementasi menyusul kalau saya minta lanjut.

## Contoh

Jangan begini:

> Deploy pertama mendarat dan terverifikasi di server. Biner sigv2 memuat
> persetujuan 19x (sebelumnya 0); panel ada di bundel web. Pengecekan
> pasangannya sengaja saya lakukan dua arah, penanda baru 1, kalimat yang
> dicabut 0. Angka tunggal tidak membuktikan apa-apa: bundel campuran lolos
> kalau cuma yang pertama diperiksa, dan itu pernah terjadi di proyek ini.

Begini:

> Deploy 1 selesai. 6 fitur siap dicoba di `/sigv2`:
>
> - Approval aset: panel sudah muncul
> - Service address: 404 sudah hilang
> - Tombol Reset: teks baru terpasang
> - Node not found: sudah diperbaiki
> - Drag & drop: sudah diperbaiki
> - Relasi linear: saya sudah upload config `POLE` lewat rsync
>
> Deploy 2 masih jalan (commit `c9511ce`): tab Pole jadi tab pertama, blok
> jenjang, tombol SLD, tree feeder. Saya kabari kalau sudah selesai.
>
> Catatan: tombol SLD hanya muncul di pole yang punya `segment_id`. Pole
> tegangan rendah tidak punya, jadi di situ tombolnya memang tidak ada.
> Bilang kalau mau tetap ditampilkan dengan pesan.