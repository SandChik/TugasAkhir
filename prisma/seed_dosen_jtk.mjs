/**
 * Seed akun dosen JTK POLBAN (data nyata, bukan dummy).
 * Jalankan: node prisma/seed_dosen_jtk.mjs   (atau: npm run db:seed:jtk)
 *
 * SUMBER DATA — dokumen resmi JTK di folder `backend-extract`, diekstrak dengan
 * parser rule-based (pdfplumber, deterministik & dapat diaudit):
 *
 *   ST Pengajaran  nomor 408/KO/AK.04.01/2025  (15 Agustus 2025)
 *                  sha256 8327c61bfc1788a29f79c50656a83df69611d9664bf8d10e469ccba261be6cf4
 *                  -> nama + KODE DOSEN (kolom "Kd Dosen") 33 dosen
 *   ST PKL         nomor 410/KO/AK.04.07/2025  (19 Agustus 2025)
 *                  sha256 4bfc0f30199f6e1e31ed985ea8055f3874f80d0cb1c1160887b6de8efc7d3eb3
 *                  -> nama 24 dosen pembimbing
 *   ST Penguji TA  nomor 285/KO/AK.18.06/2025  (16 Juni 2025)
 *                  sha256 135828360ab0a09e89f9052fdd686b7d9cf86b530a65f7fcfab7ac50001964e0
 *                  -> nama 27 dosen penguji
 *
 * Gabungan ketiganya: 37 dosen unik (dedup nama tanpa gelar; varian nama
 * tersingkat digabung ke nama terpanjang, mis. "Djoko Cahyo Utomo L." ->
 * "Djoko Cahyo Utomo Lieharyani").
 *
 * SK Pembina Ormawa 45/PL1/HK.02/2026 (parser VLM) hanya menyumbang 2 baris
 * ber-unit JTK. NIP dari dokumen itu TIDAK diseed kecuali satu baris yang
 * terekonsiliasi antar kedua lampiran (status "ok"), karena parser melaporkan
 * 14 temuan `nip_beda` + 5 `nip_tergeser` — keluaran VLM tidak deterministik
 * dan bisa "salah dengan rapi".
 *
 * YANG TIDAK ADA DI DOKUMEN, jadi sengaja dibiarkan kosong (jangan dikarang):
 *   - NIDN dan NIP (selain 1 baris di atas)
 *   - jabatan fungsional
 *   - program studi per dosen; dipakai unit jurusan sesuai dokumen
 *   - email institusi: dokumen tidak memuatnya. Seed memakai alamat sintetis
 *     berdomain `.test` (TLD khusus pengujian, RFC 2606) supaya tidak pernah
 *     tertukar dengan alamat @polban.ac.id yang asli.
 *
 * Isi data di atas lewat menu Manajemen Pengguna bila nanti tersedia.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { HDNodeWallet, Mnemonic } from "ethers";

const prisma = new PrismaClient();

const MNEMONIC =
  process.env.WALLET_MNEMONIC || "test test test test test test test test test test test junk";
const PASSWORD_DEV = "dosen123";
const UNIT = "Teknik Komputer dan Informatika";

function deriveAddress(index) {
  const wallet = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(MNEMONIC), `m/44'/60'/0'/0/${index}`);
  return wallet.address;
}

/**
 * `sumber` hanya keterangan asal data (tidak masuk DB).
 * `perlu_verifikasi` menandai baris yang berasal dari parser VLM.
 */
const DOSEN_JTK = [
  { nama: "Ade Chandra Nugraha, S.Si., M.T.", kode_dosen: "KO001N", email: "ko001n@jtk.test", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Ade Hodijah, S.Kom., M.T.", kode_dosen: "KO060N", email: "ko060n@jtk.test", sumber: "ST Pengajaran + ST Penguji" },
  { nama: "Akhmad Bakhrun, S.Kom., M.T.", kode_dosen: null, email: "akhmad.bakhrun@jtk.test", sumber: "ST PKL + ST Penguji" },
  { nama: "Ani Rahmani, S.Si., M.T.", kode_dosen: "KO002N", email: "ko002n@jtk.test", sumber: "ST Pengajaran" },
  { nama: "Aprianti Nanda Sari, S.T., M.Kom.", kode_dosen: "KO065N", email: "ko065n@jtk.test", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Ardhian Ekawijana, S.T., M.T.", kode_dosen: null, email: "ardhian.ekawijana@jtk.test", sumber: "ST PKL + ST Penguji" },
  { nama: "Asri Maspupah, S.ST., M.T.", kode_dosen: "KO067N", email: "ko067n@jtk.test", sumber: "ST Pengajaran + ST PKL" },
  { nama: "Bambang Wisnuadhi, S.Si., M.T.", kode_dosen: "KO003N", email: "ko003n@jtk.test", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Beri Noviansyah, S.Kom., M.T.", kode_dosen: null, email: "beri.noviansyah@jtk.test", sumber: "ST PKL + ST Penguji" },
  { nama: "Cahaya Juniarti, M.Pd.", kode_dosen: "KO082N", email: "ko082n@jtk.test", sumber: "ST Pengajaran" },
  { nama: "Cholid Fauzi, S.T., M.T.", kode_dosen: null, email: "cholid.fauzi@jtk.test", sumber: "ST PKL" },
  { nama: "Djoko Cahyo Utomo Lieharyani, S.Kom., M.MT.", kode_dosen: "KO070N", email: "ko070n@jtk.test", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Drs. Eddy Bambang Soewono, M.Kom.", kode_dosen: "KO016N", email: "ko016n@jtk.test", sumber: "ST Pengajaran + ST Penguji" },
  { nama: "Fitri Diani, S.Si., S.T., M.T.", kode_dosen: "KO057N", email: "ko057n@jtk.test", sumber: "ST Pengajaran + ST PKL" },
  { nama: "Hashri Hayati, S.T., M.T.", kode_dosen: "KO071N", email: "ko071n@jtk.test", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  // ejaan gelar dibiarkan apa adanya seperti terbaca di SK — belum terverifikasi
  { nama: "Ida Suhartini, MMSI", kode_dosen: null, email: "ida.suhartini@jtk.test", sumber: "SK Pembina Ormawa (parser VLM)", perlu_verifikasi: true },
  { nama: "Irwan Setiawan, S.Si., M.T.", kode_dosen: "KO045N", email: "ko045n@jtk.test", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Dr. Iwan Awaludin, S.T., M.T.", kode_dosen: "KO023N", email: "ko023n@jtk.test", sumber: "ST Pengajaran + ST Penguji" },
  { nama: "Joe Lian Min, B.Eng., M.Eng.", kode_dosen: "KO007N", email: "ko007n@jtk.test", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Jonner Hutahaean, BSET., M.Info.Sys.", kode_dosen: "KO018N", email: "ko018n@jtk.test", sumber: "ST Pengajaran + ST Penguji" },
  { nama: "Muhammad Riza Alifi, S.T., M.T.", kode_dosen: "KO073N", email: "ko073n@jtk.test", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Muhammad Rizqi Sholahuddin, S.Si., M.T.", kode_dosen: "KO074N", email: "ko074n@jtk.test", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Dr. Dra. Nurjannah Syakrani, M.T.", kode_dosen: "KO008N", email: "ko008n@jtk.test", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Dr. Priyanto Hidayatullah, S.T., M.Sc.", kode_dosen: "KO048N", email: "ko048n@jtk.test", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Rahil Jumiyani, S.ST., M.Sc.", kode_dosen: "KO062N", email: "ko062n@jtk.test", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Santi Sundari, S.Si., M.T.", kode_dosen: "KO009N", email: "ko009n@jtk.test", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Setiadi Rachmat, B.Eng., M.Eng.", kode_dosen: "KO021N", email: "ko021n@jtk.test", sumber: "ST Pengajaran" },
  { nama: "Siti Dwi Setiarini, S.Si., M.T.", kode_dosen: "KO075N", email: "ko075n@jtk.test", sumber: "ST Pengajaran + ST Penguji" },
  { nama: "Sofy Fitriani, S.ST., M.Kom.", kode_dosen: "KO077N", email: "ko077n@jtk.test", sumber: "ST Pengajaran + ST Penguji" },
  { nama: "Sri Ratna Wulan, S.Pd., M.T.", kode_dosen: "KO076N", email: "ko076n@jtk.test", sumber: "ST Pengajaran + ST Penguji" },
  { nama: "Suprihanto, BSEE., M.Sc.", kode_dosen: "KO022N", email: "ko022n@jtk.test", sumber: "ST Pengajaran + ST Penguji" },
  { nama: "Tarekh Febriana Putra, S.Pd., M.Pd.", kode_dosen: "KO081N", email: "ko081n@jtk.test", sumber: "ST Pengajaran" },
  { nama: "Dr. Transmissia Semiawan, BSCS., M.IT.", kode_dosen: "KO019N", email: "ko019n@jtk.test", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Trisna Gelar Abdillah, S.T., M.Kom.", kode_dosen: "KO078N", email: "ko078n@jtk.test", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Urip Teguh Setijohatmo, BSCS., M.Kom.", kode_dosen: "KO012N", email: "ko012n@jtk.test", sumber: "ST Pengajaran" },
  { nama: "Wendi Wirasta, S.T., M.T.", kode_dosen: "KO079N", email: "ko079n@jtk.test", sumber: "ST Pengajaran + ST PKL" },
  // NIP satu-satunya yang diseed: terbaca sama di lampiran 1 & 2 SK (status "ok").
  { nama: "Yudi Widhiyasana, S.Si., M.T.", kode_dosen: "KO013N", email: "ko013n@jtk.test", nip: "197407182001121002", sumber: "ST Pengajaran + ST PKL + ST Penguji + SK Pembina (NIP)" },
  { nama: "Zulkifli Arsyad, S.Kom., M.T.", kode_dosen: "KO061N", email: "ko061n@jtk.test", sumber: "ST Pengajaran + ST PKL" },
];

async function main() {
  const hash = bcrypt.hashSync(PASSWORD_DEV, 10);

  // Wallet custodial: lanjutkan index dari yang sudah terpakai di DB.
  const terpakai = await prisma.pengguna.findMany({
    where: { wallet_index: { not: null } },
    select: { wallet_index: true },
  });
  let indexBerikut = terpakai.reduce((m, p) => Math.max(m, p.wallet_index ?? -1), -1) + 1;

  let dibuat = 0;
  let diperbarui = 0;
  const kodeDiseed = new Map(); // kode_dosen -> email pemilik sah

  for (const d of DOSEN_JTK) {
    const lama = await prisma.pengguna.findUnique({ where: { email: d.email } });

    // wallet hanya diberikan sekali; jangan geser index akun yang sudah ada
    const wallet =
      lama?.wallet_index != null
        ? {}
        : { wallet_index: indexBerikut, alamat_wallet: deriveAddress(indexBerikut) };
    if (lama?.wallet_index == null) indexBerikut++;

    const data = {
      nama: d.nama,
      peran: "dosen",
      aktif: true,
      // nilai yang tidak ada di dokumen jangan menimpa isian admin
      kode_dosen: d.kode_dosen ?? lama?.kode_dosen ?? null,
      nip: d.nip ?? lama?.nip ?? null,
      program_studi: UNIT,
      password_hash: lama?.password_hash ?? hash, // jangan reset password yang sudah diubah
      ...wallet,
    };

    await prisma.pengguna.upsert({
      where: { email: d.email },
      update: data,
      create: { email: d.email, ...data },
    });

    if (d.kode_dosen) kodeDiseed.set(d.kode_dosen, d.email);
    lama ? diperbarui++ : dibuat++;
  }

  // Kode dosen harus unik: pencocokan hasil ekstraksi SK/ST menolak kode ganda
  // (dianggap ambigu). Akun demo lama kerap memegang kode milik dosen nyata.
  let kodeDibersihkan = 0;
  for (const [kode, emailSah] of kodeDiseed) {
    const bentrok = await prisma.pengguna.findMany({
      where: { kode_dosen: kode, email: { not: emailSah } },
      select: { id_pengguna: true, nama: true, email: true },
    });
    for (const b of bentrok) {
      await prisma.pengguna.update({
        where: { id_pengguna: b.id_pengguna },
        data: { kode_dosen: null },
      });
      console.log(`  ! kode ${kode} dilepas dari akun lain: ${b.nama} <${b.email}>`);
      kodeDibersihkan++;
    }
  }

  const total = await prisma.pengguna.count({ where: { peran: "dosen" } });
  const berkode = await prisma.pengguna.count({
    where: { peran: "dosen", kode_dosen: { not: null } },
  });
  const perluVerifikasi = DOSEN_JTK.filter((d) => d.perlu_verifikasi).map((d) => d.nama);

  console.log(
    `Seed dosen JTK selesai: ${dibuat} akun baru, ${diperbarui} diperbarui, ` +
      `${kodeDibersihkan} kode dosen bentrok dibersihkan.`
  );
  console.log(`Total akun dosen di DB: ${total} (berkode dosen: ${berkode}).`);
  console.log(`Login dev: <email>@jtk.test / ${PASSWORD_DEV} (ganti sebelum dipakai selain dev).`);
  if (perluVerifikasi.length) {
    console.log(`Perlu verifikasi manual (sumber parser VLM): ${perluVerifikasi.join("; ")}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
