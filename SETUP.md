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

# 5. Jalankan web
npm run dev
```

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
