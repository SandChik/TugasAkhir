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
