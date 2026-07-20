# BKD Smart Contract Base Project

Base project dari dokumen TA: **Pengembangan Sistem Penilaian Beban Kinerja Dosen Bidang Pendidikan Berbasis Smart Contract untuk Otomatisasi Perhitungan Kredit Kegiatan**.

## Stack
- Solidity `^0.8.x` + Hardhat 3
- OpenZeppelin Contracts 5
- Ethers.js 6
- Next.js 14 + Node.js
- PostgreSQL 16 via Prisma schema
- MetaMask/RPC-ready

## Modul
- `contracts/BKD.sol` — contract `KalkulatorBKDPendidikan` sebagai rule engine perhitungan SKS pendidikan. Output memakai skala `1 SKS = 100`.
- `contracts/token.sol` — contract `BKDSKSToken`, ERC-20 non-transferable/soulbound untuk kredit SKS yang disahkan.
- `prisma/schema.prisma` — DB model minimal sistem usulan: `pengguna`, `periode_bkd`, `referensi_kegiatan`, `kegiatan`, `dokumen_kegiatan`, `hasil_penilaian`, dan `riwayat_transaksi`.
- `app/` — UI dashboard awal dan API `/api/rules`.
- `lib/bkdRules.ts` — referensi aturan dari Tabel IV.8.

## Quick Start
```bash
cp .env.example .env
npm install
npm run compile:contracts
npm run test:contracts
npm run build:web
npm run dev
```

## Koneksi Database Server

Database PostgreSQL project TA berjalan di server dan tidak dibuka langsung ke internet. Gunakan **SSH tunnel** dari aplikasi DB admin seperti pgAdmin, DBeaver, TablePlus, atau DataGrip.

### Detail Server
- Server/IP SSH: `145.223.23.37`
- SSH port: `22`
- SSH user: `dbconnect`
- Database: `bkd_tugas_akhir`
- DB host: `127.0.0.1`
- DB port: `5432`
- DB user: `dbconnect`
- Akses DB user: read-only

Password tidak disimpan di repository. Minta password ke administrator server.

### pgAdmin
1. Klik kanan **Servers** lalu pilih **Register > Server**.
2. Tab **General**:
   - Name: `BKD Tugas Akhir`
3. Tab **Connection**:
   - Host name/address: `127.0.0.1`
   - Port: `5432`
   - Maintenance database: `bkd_tugas_akhir`
   - Username: `dbconnect`
   - Password: password `dbconnect`
4. Tab **SSH Tunnel**:
   - Use SSH tunneling: aktif
   - Tunnel host: `145.223.23.37`
   - Tunnel port: `22`
   - Username: `dbconnect`
   - Authentication: `Password`
   - Password: password `dbconnect`
5. Klik **Save** / **Test Connection**.

### DBeaver
1. Pilih **New Database Connection > PostgreSQL**.
2. Tab **Main**:
   - Host: `127.0.0.1`
   - Port: `5432`
   - Database: `bkd_tugas_akhir`
   - Username: `dbconnect`
   - Password: password `dbconnect`
3. Tab **SSH**:
   - Use SSH Tunnel: aktif
   - Host/IP: `145.223.23.37`
   - Port: `22`
   - User Name: `dbconnect`
   - Authentication Method: `Password`
   - Password: password `dbconnect`
4. Klik **Test Connection** lalu **Finish**.

### CLI alternatif
```bash
ssh -L 5432:127.0.0.1:5432 dbconnect@145.223.23.37
```

Lalu di terminal lain:
```bash
psql -h 127.0.0.1 -p 5432 -U dbconnect -d bkd_tugas_akhir
```

> Catatan: jangan isi DB host dengan `145.223.23.37` di tab Connection. DB host harus `127.0.0.1`; koneksi publik diarahkan lewat SSH tunnel.

## Catatan Implementasi
- Fitur awal mengikuti dokumen: manajemen peran, input kegiatan, referensi kegiatan, perhitungan otomatis, penyimpanan operasional, review asesor, mint token SKS, dan rekap.
- Beberapa rule dari tabel TA sudah dibuat sebagai fungsi smart contract. Penambahan detail UI form per rule dapat dilanjutkan dari `lib/bkdRules.ts`.
- Token SKS dibuat non-transferable agar kredit melekat pada wallet dosen.
