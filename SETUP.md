# Setup Pengembangan — LedgerDik (BKD Smart Contract)

Fondasi yang sudah tersedia di repo ini:

1. **Skema DB revisi** (`prisma/schema.prisma` + migration `20260719000000_lkd_dua_asesor_flow`)
   — alur LKD rencana/laporan, 2 asesor per LKD, simpulan M/TM, status capaian, wallet custodial.
2. **Seed data master** (`prisma/seed.mjs`) — referensi kegiatan A–N → fungsi kontrak, akun demo, periode, penugasan asesor.
3. **Autentikasi** — NextAuth credentials + bcrypt + middleware pembatas peran (`/dosen`, `/asesor`, `/admin`).
4. **Modul blockchain** (`lib/blockchain.ts`) — signer backend, kontrak typechain, derivasi HD wallet dosen, hash penilaian (referenceId), mint/burn.
5. **Fondasi UI** — Tailwind dengan token warna dari mockup Figma + komponen `AppShell`, `Sidebar`, `Topbar`, `DataTable`, `StatusChip`, `InfoBox`; halaman login + 3 halaman contoh per peran.

## Langkah menjalankan (urut)

```bash
# 1. Dependensi
npm install

# 2. Environment
cp .env.example .env
#    - isi NEXTAUTH_SECRET:  openssl rand -base64 32
#    - isi ADMIN_PRIVATE_KEY setelah langkah 4

# 3. Database (PostgreSQL lokal harus jalan)
npx prisma migrate dev      # menerapkan kedua migration
npx prisma db seed          # atau: npm run db:seed

# 4. Blockchain lokal (terminal terpisah)
npx hardhat node
npm run deploy:local
#    salin alamat KalkulatorBKDPendidikan -> NEXT_PUBLIC_BKD_CONTRACT_ADDRESS
#    salin alamat BKDSKSToken            -> NEXT_PUBLIC_SKS_TOKEN_ADDRESS
#    salin private key akun #0 hardhat   -> ADMIN_PRIVATE_KEY

# 5. Layanan ekstraksi dokumen SK/ST (terminal terpisah, opsional)
cd backend-extract
pip install -r requirements.txt
cp .env.example .env        # isi API_KEY (klien) dan ROUTER_API_KEY (VLM)
uvicorn api:app --port 8000
#    lalu di .env aplikasi: PARSER_API_URL + PARSER_API_KEY (= API_KEY di atas)

# 6. Jalankan web
npm run dev
```

## Seed dosen JTK

Bagian `DOSEN_JTK` pada [`prisma/seed.mjs`](prisma/seed.mjs) — ikut dijalankan
otomatis oleh `npm run db:seed` — mengisi **38 akun dosen JTK**
dari dokumen resmi di `backend-extract` (ST Pengajaran 408/KO/AK.04.01/2025, ST PKL
410/KO/AK.04.07/2025, ST Penguji 285/KO/AK.18.06/2025; sha256 tiap surat dicatat di
header berkasnya) — bukan data dummy. **33 di antaranya membawa kode dosen** (kolom
"Kd Dosen"), sehingga hasil ekstraksi SK/ST langsung cocok ke akunnya.

- Login dev: `<dua kata pertama nama, dipisah titik>@polban.ac.id` (mis.
  `ade.chandra@polban.ac.id`) / `dosen123`. Gelar depan/belakang dibuang saat
  menyintesis email; alamat ini bukan email resmi, sekadar kredensial dev.
- Dijalankan berulang aman: cocok lewat email (atau kode dosen/nama untuk akun
  ber-email format lama, emailnya lalu dimigrasikan), password yang sudah diubah
  tidak direset, wallet custodial hanya diberikan sekali (index lanjut dari yang
  terpakai), dan NIP/kode yang sudah diisi admin tidak ditimpa oleh nilai kosong.
- Seed juga **melepas kode dosen ganda** dari akun lain (akun demo lama sering
  memegang kode milik dosen nyata), karena kode kembar membuat pencocokan ekstraksi
  dianggap ambigu.
- **NIDN, NIP, dan jabatan fungsional dibiarkan kosong** karena tidak ada di dokumen
  — kecuali satu NIP yang terbaca konsisten di kedua lampiran SK Pembina. NIP lain
  dari parser VLM sengaja tidak dipakai (parser melaporkan 14 temuan `nip_beda`).
  `program_studi` diisi unit jurusan, sebab dokumen tidak memerinci prodi per dosen.

Cakupan pencocokan dengan roster ini: **ST Pengajaran 110/110 baris, ST PKL 24/24,
ST Penguji 45/45, SK Pembina 2/2**.

## Unggah SK & ST (menu admin)

Menu **Administrasi → Unggah SK & ST** (`/admin/unggah`) mengubah dokumen penugasan
menjadi kegiatan BKD per dosen:

1. Admin memilih satu atau banyak PDF sekaligus (isi folder SK & ST). Jenis dokumen
   dipilih manual atau dideteksi dari nama berkas.
2. Tiap berkas dikirim ke layanan `backend-extract` (`lib/parserDokumen.ts`) dan JSON
   hasilnya disimpan utuh di tabel `unggahan_dokumen` sebagai bukti audit.
3. Halaman pratinjau menampilkan pemetaan baris dokumen → kegiatan BKD beserta temuan
   validasi parser dan nama dosen yang tidak punya akun. Barisnya diringkas jadi kartu
   angka (siap / perlu perhatian / dikoreksi / dilewati) yang sekaligus berfungsi sebagai
   filter, dilengkapi pencarian dan paginasi 20 baris per halaman — dokumen 110 baris
   tetap terbaca. Filter, halaman, dan posisi baris ikut terbawa setelah menyimpan koreksi.
4. **Koreksi manual** (parser bisa salah baca): tiap baris punya tombol *Ubah* untuk
   memperbaiki nama kegiatan, parameter perhitungan, dan dosen tujuan, atau menandainya
   *lewati* agar tidak diterapkan; nomor/tanggal surat juga bisa dikoreksi sekaligus
   untuk seluruh baris. Koreksi disimpan sebagai **selisih** di kolom
   `unggahan_dokumen.koreksi` — `hasil_parse` tidak pernah diubah, sehingga hasil parser
   asli tetap utuh sebagai bukti audit dan bisa dibandingkan (nilai asli ditampilkan di
   sebelah field yang diubah). Tombol *Kembalikan ke hasil ekstraksi asli* membatalkan
   koreksi satu baris.
5. Tombol **Terapkan** membuat kegiatan pada LKD laporan periode aktif
   (`sumber_data='surat_tugas'`, `diklaim=false`); SKS dihitung lewat kontrak kalkulator
   dari parameter final (termasuk koreksi), dan **PDF surat dilampirkan sebagai dokumen
   bukti** kegiatan (jenis "SK Penugasan"). Dosen menariknya sendiri lewat
   **Layanan BKD → Rekap Kegiatan**.
6. **Terapkan ulang bersifat idempoten per baris** lewat `detail_kegiatan.tanda_baris`:
   baris yang koreksinya berubah akan *diperbarui di tempat* (bukan digandakan), baris
   yang sudah sesuai dilewati, dan kegiatan yang **sudah diklaim dosen tidak diubah**
   (dilaporkan di pesan hasil) agar penilaian asesor tidak tertimpa.

| Dokumen | Endpoint parser | Kegiatan yang dibuat |
|---|---|---|
| Surat Penugasan Pengajaran | `/parse/pengajaran` | EDU101 per (mata kuliah, kelas) |
| ST Pembimbing PKL | `/parse/bimbingan` | EDU202 satu per dosen (per semester) |
| SK Pembimbing Tugas Akhir | `/parse/bimbingan` | EDU203 per peran (Pembimbing 1 = utama) |
| ST Penguji Tugas Akhir | `/parse/pengujian` | EDU301 per peran (Ketua/Anggota) |
| SK Pembina Ormawa (pindai) | `/parse/sk-pembinaan` | EDU401 per organisasi |

Satu pilihan jenis (**ST/SK Pembimbing**) melayani dua surat sekaligus: parser
membaca halaman 1 dan mengenali sendiri apakah dokumennya ST Pembimbing PKL atau
SK Pembimbing Tugas Akhir (D3 maupun Sarjana Terapan), lalu memetakannya ke rubrik
yang sesuai. Lampiran TA dibaca dari garis bingkai tabel, bukan koordinat tetap,
karena lebar kolom kedua program studi berbeda.

**Pencocokan dosen** memakai urutan: `kode_dosen` (kolom "Kd Dosen" pada ST, diisi di
Manajemen Pengguna) → NIP → nama tanpa gelar. Tanpa `kode_dosen` terisi, baris ST
Pengajaran umumnya tidak akan cocok karena dokumen memakai nama bergelar lengkap.

## Deploy ke Base Sepolia (testnet)

Jaringan `baseSepolia` (chainId `84532`) sudah dikonfigurasi di `hardhat.config.js`
dan `scripts/deploy.js` mendukung dijalankan ke jaringan mana pun lewat flag `--network`.

1. **Siapkan wallet deployer**
   - Buat/pakai wallet EVM baru khusus dev (jangan pakai wallet berisi dana asli).
   - Isi ETH testnet dari faucet Base Sepolia, contoh:
     - https://www.alchemy.com/faucets/base-sepolia
     - https://faucet.quicknode.com/base/sepolia
   - Wallet ini akan menjadi `deployer`, sekaligus otomatis mendapat `DEFAULT_ADMIN_ROLE`
     dan `MINTER_ROLE` di `BKDSKSToken` (lihat `scripts/deploy.js`).

2. **Isi `.env`**
   ```bash
   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org   # atau RPC provider sendiri (Alchemy/Infura/dll)
   ADMIN_PRIVATE_KEY=<private key wallet deployer>  # JANGAN commit, jangan share
   BASESCAN_API_KEY=<opsional, untuk verifikasi kontrak>
   ```

3. **Compile & deploy**
   ```bash
   npm run compile:contracts
   npm run deploy:baseSepolia
   ```
   Output berisi alamat kedua kontrak, disimpan juga ke `deployments/baseSepolia.json`.
   Salin alamatnya ke:
   ```bash
   NEXT_PUBLIC_CHAIN_ID=84532
   NEXT_PUBLIC_BKD_CONTRACT_ADDRESS=<alamat KalkulatorBKDPendidikan>
   NEXT_PUBLIC_SKS_TOKEN_ADDRESS=<alamat BKDSKSToken>
   RPC_URL=https://sepolia.base.org
   ```

4. **Verifikasi kontrak di Basescan (opsional)**
   ```bash
   npx hardhat verify --network baseSepolia <alamat KalkulatorBKDPendidikan>
   npx hardhat verify --network baseSepolia <alamat BKDSKSToken> <deployer> <deployer>
   ```
   Perintah lengkap dengan argumen yang benar juga otomatis dicetak di akhir `npm run deploy:baseSepolia`.

5. **Jalankan web terhadap Base Sepolia**
   ```bash
   npm run dev
   ```
   Backend (`lib/blockchain.ts`) memakai `RPC_URL` + `ADMIN_PRIVATE_KEY` yang sama
   untuk kirim transaksi mint/burn ke kontrak yang sudah live di Base Sepolia.

> Catatan: langkah 3 (compile & deploy) butuh koneksi keluar ke `binaries.soliditylang.org`
> (download compiler Solidity) dan ke RPC Base Sepolia. Jalankan dari environment yang
> punya akses internet penuh (mesin lokal/CI), bukan dari sandbox dengan proxy egress terbatas.

## Akun demo (dari seed)

| Peran  | Email               | Password  |
|--------|---------------------|-----------|
| Admin  | admin@polban.ac.id  | admin123  |
| Dosen  | dosen1@polban.ac.id | dosen123  |
| Dosen  | dosen2@polban.ac.id | dosen123  |
| Asesor | asesor1@polban.ac.id| asesor123 |
| Asesor | asesor2@polban.ac.id| asesor123 |

> Password demo hanya untuk pengembangan. Ganti sebelum demo/produksi.

Seed yang sama juga mengisi 38 akun dosen JTK nyata dengan pola
`<nama.depan>@polban.ac.id` / `dosen123` (lihat bagian **Seed dosen JTK**).

## Catatan arsitektur

- **Custodial wallet**: dosen login email/password; address diturunkan dari `WALLET_MNEMONIC`
  (path `m/44'/60'/0'/0/{wallet_index}`). Private key tidak pernah keluar dari server.
- **Jejak on-chain**: saat simpulan final disahkan, `hashPenilaian()` (keccak256 JSON simpulan)
  dikirim sebagai `referenceId` pada `mint()` — tercatat permanen di event `SKSMinted`,
  bisa diverifikasi ulang siapa pun tanpa kontrak tambahan.
- **Migration bersifat destruktif** terhadap relasi lama `kegiatan→pengguna/periode`
  (aman untuk DB dev; jangan jalankan di DB berisi data yang mau dipertahankan).
- Halaman contoh per peran: `/dosen/pengajaran`, `/asesor/asesor-bkd`, `/admin/pengguna` —
  pola untuk halaman-halaman berikutnya (AppShell + DataTable + query Prisma).
