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
npx hardhat run scripts/deploy.js --network localhost
#    salin alamat KalkulatorBKDPendidikan -> NEXT_PUBLIC_BKD_CONTRACT_ADDRESS
#    salin alamat BKDSKSToken            -> NEXT_PUBLIC_SKS_TOKEN_ADDRESS
#    salin private key akun #0 hardhat   -> ADMIN_PRIVATE_KEY

# 5. Jalankan web
npm run dev
```

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
