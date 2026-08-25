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
 *   SK Pembimbing TA D3   nomor B/110/PL1.KO/PT.00.06/2024
 *                  sha256 daf872ddd546d8a239039096821f2144ec5e8cc8b674e097f669e7ca821a5712
 *                  -> 26 dosen pembimbing TA prodi D3 Teknik Informatika
 *   SK Pembimbing TA D4   nomor B/111/PL1.KO/PT.00.06/2024
 *                  sha256 d30cfa7bd119856eeb0282e5305db9946d3cf98f1c6d24a5662ff469c0d198bf
 *                  -> 32 dosen pembimbing TA prodi Sarjana Terapan (D4) Teknik Informatika
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
 *   - email institusi: dokumen tidak memuatnya. Email disintesis dari DUA KATA
 *     PERTAMA nama (gelar dibuang), mis. "Ade Chandra Nugraha, S.Si., M.T."
 *     -> ade.chandra@polban.ac.id. Bukan alamat resmi — sekadar format kredensial
 *     dev yang mudah diingat.
 *
 * PROGRAM STUDI diturunkan dari kedua SK Pembimbing TA. Dokumen tidak menyatakan
 * homebase prodi seorang dosen, jadi ini pendekatan, bukan data resmi:
 *   - hanya muncul di SK D3    -> D3 Teknik Informatika
 *   - hanya muncul di SK D4    -> D4 Teknik Informatika
 *   - muncul di keduanya       -> prodi dengan jumlah bimbingan terbanyak
 *                                 (jumlah sama jatuh ke D3)
 *   - tidak muncul di keduanya -> ditetapkan sepihak, ditandai `prodi_asumsi`
 *     (Ani Rahmani, Cahaya Juniarti, Priyanto Hidayatullah, Tarekh Febriana Putra)
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
const NAMA_PRODI = {
  D3: "D3 Teknik Informatika",
  D4: "D4 Teknik Informatika",
};
const DOMAIN_EMAIL = "polban.ac.id";

/**
 * Email dev dari dua kata pertama nama; gelar depan (Dr., Drs., Dra., dst.)
 * dan gelar belakang (setelah koma) dibuang.
 * "Ade Chandra Nugraha, S.Si., M.T." -> "ade.chandra@polban.ac.id"
 * "Suprihanto, BSEE., M.Sc."         -> "suprihanto@polban.ac.id"
 */
function emailDariNama(nama) {
  const kata = nama
    .split(",")[0]
    .trim()
    .split(/\s+/)
    .filter((k) => !/^[A-Za-z]+\.$/.test(k)); // buang gelar depan berformat singkatan
  return `${kata.slice(0, 2).join(".").toLowerCase()}@${DOMAIN_EMAIL}`;
}

function deriveAddress(index) {
  const wallet = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(MNEMONIC), `m/44'/60'/0'/0/${index}`);
  return wallet.address;
}

/**
 * `sumber` hanya keterangan asal data (tidak masuk DB).
 * `perlu_verifikasi` menandai baris yang berasal dari parser VLM.
 */
const DOSEN_JTK = [
  { nama: "Ade Chandra Nugraha, S.Si., M.T.", prodi: "D3", kode_dosen: "KO001N", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Ade Hodijah, S.Kom., M.T.", prodi: "D3", kode_dosen: "KO060N", sumber: "ST Pengajaran + ST Penguji" },
  { nama: "Akhmad Bakhrun, S.Kom., M.T.", prodi: "D3", kode_dosen: null, sumber: "ST PKL + ST Penguji" },
  { nama: "Ani Rahmani, S.Si., M.T.", prodi: "D3", prodi_asumsi: true, kode_dosen: "KO002N", sumber: "ST Pengajaran" },
  { nama: "Aprianti Nanda Sari, S.T., M.Kom.", prodi: "D4", kode_dosen: "KO065N", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Ardhian Ekawijana, S.T., M.T.", prodi: "D4", kode_dosen: null, sumber: "ST PKL + ST Penguji" },
  { nama: "Asri Maspupah, S.ST., M.T.", prodi: "D4", kode_dosen: "KO067N", sumber: "ST Pengajaran + ST PKL" },
  { nama: "Bambang Wisnuadhi, S.Si., M.T.", prodi: "D3", kode_dosen: "KO003N", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Beri Noviansyah, S.Kom., M.T.", prodi: "D3", kode_dosen: null, sumber: "ST PKL + ST Penguji" },
  { nama: "Cahaya Juniarti, M.Pd.", prodi: "D4", prodi_asumsi: true, kode_dosen: "KO082N", sumber: "ST Pengajaran" },
  { nama: "Cholid Fauzi, S.T., M.T.", prodi: "D4", kode_dosen: null, sumber: "ST PKL" },
  { nama: "Djoko Cahyo Utomo Lieharyani, S.Kom., M.MT.", prodi: "D4", kode_dosen: "KO070N", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Drs. Eddy Bambang Soewono, M.Kom.", prodi: "D3", kode_dosen: "KO016N", sumber: "ST Pengajaran + ST Penguji" },
  { nama: "Fitri Diani, S.Si., S.T., M.T.", prodi: "D4", kode_dosen: "KO057N", sumber: "ST Pengajaran + ST PKL" },
  { nama: "Hashri Hayati, S.T., M.T.", prodi: "D3", kode_dosen: "KO071N", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  // ejaan gelar dibiarkan apa adanya seperti terbaca di SK — belum terverifikasi
  { nama: "Ida Suhartini, MMSI", prodi: "D4", kode_dosen: null, sumber: "SK Pembina Ormawa (parser VLM)", perlu_verifikasi: true },
  { nama: "Irwan Setiawan, S.Si., M.T.", prodi: "D3", kode_dosen: "KO045N", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Dr. Iwan Awaludin, S.T., M.T.", prodi: "D4", kode_dosen: "KO023N", sumber: "ST Pengajaran + ST Penguji" },
  { nama: "Joe Lian Min, B.Eng., M.Eng.", prodi: "D3", kode_dosen: "KO007N", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Jonner Hutahaean, BSET., M.Info.Sys.", prodi: "D4", kode_dosen: "KO018N", sumber: "ST Pengajaran + ST Penguji" },
  { nama: "Muhammad Riza Alifi, S.T., M.T.", prodi: "D4", kode_dosen: "KO073N", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Muhammad Rizqi Sholahuddin, S.Si., M.T.", prodi: "D4", kode_dosen: "KO074N", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Dr. Dra. Nurjannah Syakrani, M.T.", prodi: "D4", kode_dosen: "KO008N", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Dr. Priyanto Hidayatullah, S.T., M.Sc.", prodi: "D3", prodi_asumsi: true, kode_dosen: "KO048N", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Rahil Jumiyani, S.ST., M.Sc.", prodi: "D3", kode_dosen: "KO062N", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Santi Sundari, S.Si., M.T.", prodi: "D3", kode_dosen: "KO009N", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Setiadi Rachmat, B.Eng., M.Eng.", prodi: "D4", kode_dosen: "KO021N", sumber: "ST Pengajaran" },
  { nama: "Siti Dwi Setiarini, S.Si., M.T.", prodi: "D4", kode_dosen: "KO075N", sumber: "ST Pengajaran + ST Penguji" },
  { nama: "Sofy Fitriani, S.ST., M.Kom.", prodi: "D3", kode_dosen: "KO077N", sumber: "ST Pengajaran + ST Penguji" },
  { nama: "Sri Ratna Wulan, S.Pd., M.T.", prodi: "D4", kode_dosen: "KO076N", sumber: "ST Pengajaran + ST Penguji" },
  { nama: "Suprihanto, BSEE., M.Sc.", prodi: "D4", kode_dosen: "KO022N", sumber: "ST Pengajaran + ST Penguji" },
  { nama: "Tarekh Febriana Putra, S.Pd., M.Pd.", prodi: "D4", prodi_asumsi: true, kode_dosen: "KO081N", sumber: "ST Pengajaran" },
  { nama: "Dr. Transmissia Semiawan, BSCS., M.IT.", prodi: "D4", kode_dosen: "KO019N", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Trisna Gelar Abdillah, S.T., M.Kom.", prodi: "D3", kode_dosen: "KO078N", sumber: "ST Pengajaran + ST PKL + ST Penguji" },
  { nama: "Urip Teguh Setijohatmo, BSCS., M.Kom.", prodi: "D3", kode_dosen: "KO012N", sumber: "ST Pengajaran" },
  { nama: "Wendi Wirasta, S.T., M.T.", prodi: "D3", kode_dosen: "KO079N", sumber: "ST Pengajaran + ST PKL" },
  // NIP satu-satunya yang diseed: terbaca sama di lampiran 1 & 2 SK (status "ok").
  { nama: "Yudi Widhiyasana, S.Si., M.T.", prodi: "D4", kode_dosen: "KO013N", nip: "197407182001121002", sumber: "ST Pengajaran + ST PKL + ST Penguji + SK Pembina (NIP)" },
  { nama: "Zulkifli Arsyad, S.Kom., M.T.", prodi: "D3", kode_dosen: "KO061N", sumber: "ST Pengajaran + ST PKL" },
];

async function main() {
  const semuaEmail = DOSEN_JTK.map((d) => emailDariNama(d.nama));
  const ganda = semuaEmail.filter((e, i) => semuaEmail.indexOf(e) !== i);
  if (ganda.length)
    throw new Error(`Email hasil sintesis ganda, perbaiki dulu: ${[...new Set(ganda)].join(", ")}`);

  const prodiSalah = DOSEN_JTK.filter((d) => !NAMA_PRODI[d.prodi]).map((d) => d.nama);
  if (prodiSalah.length)
    throw new Error(`Prodi tidak dikenal (harus D3 atau D4): ${prodiSalah.join("; ")}`);

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
    const email = emailDariNama(d.nama);

    // Akun lama mungkin masih memakai email format lama (kode dosen @jtk.test):
    // cocokkan juga lewat kode dosen atau nama, lalu migrasikan emailnya.
    const lama =
      (await prisma.pengguna.findUnique({ where: { email } })) ??
      (d.kode_dosen
        ? await prisma.pengguna.findFirst({ where: { kode_dosen: d.kode_dosen } })
        : null) ??
      (await prisma.pengguna.findFirst({ where: { nama: d.nama } }));

    // wallet hanya diberikan sekali; jangan geser index akun yang sudah ada
    const wallet =
      lama?.wallet_index != null
        ? {}
        : { wallet_index: indexBerikut, alamat_wallet: deriveAddress(indexBerikut) };
    if (lama?.wallet_index == null) indexBerikut++;

    const data = {
      email,
      nama: d.nama,
      peran: "dosen",
      aktif: true,
      // nilai yang tidak ada di dokumen jangan menimpa isian admin
      kode_dosen: d.kode_dosen ?? lama?.kode_dosen ?? null,
      nip: d.nip ?? lama?.nip ?? null,
      program_studi: NAMA_PRODI[d.prodi],
      password_hash: lama?.password_hash ?? hash, // jangan reset password yang sudah diubah
      ...wallet,
    };

    if (lama) {
      if (lama.email !== email) console.log(`  email dimigrasikan: ${lama.email} -> ${email}`);
      await prisma.pengguna.update({ where: { id_pengguna: lama.id_pengguna }, data });
    } else {
      await prisma.pengguna.create({ data });
    }

    if (d.kode_dosen) kodeDiseed.set(d.kode_dosen, email);
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
  const prodiAsumsi = DOSEN_JTK.filter((d) => d.prodi_asumsi).map((d) => d.nama);
  const jumlahD3 = DOSEN_JTK.filter((d) => d.prodi === "D3").length;
  const jumlahD4 = DOSEN_JTK.length - jumlahD3;

  console.log(
    `Seed dosen JTK selesai: ${dibuat} akun baru, ${diperbarui} diperbarui, ` +
      `${kodeDibersihkan} kode dosen bentrok dibersihkan.`
  );
  console.log(`Total akun dosen di DB: ${total} (berkode dosen: ${berkode}).`);
  console.log(`Program studi: ${jumlahD3} ${NAMA_PRODI.D3}, ${jumlahD4} ${NAMA_PRODI.D4}.`);
  console.log(
    `Login dev: <nama.depan>@${DOMAIN_EMAIL} (mis. ${emailDariNama(DOSEN_JTK[0].nama)}) / ${PASSWORD_DEV} (ganti sebelum dipakai selain dev).`
  );
  if (perluVerifikasi.length) {
    console.log(`Perlu verifikasi manual (sumber parser VLM): ${perluVerifikasi.join("; ")}`);
  }
  if (prodiAsumsi.length) {
    console.log(`Prodi ditetapkan sepihak (tidak ada di SK bimbingan TA): ${prodiAsumsi.join("; ")}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
