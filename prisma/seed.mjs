/**
 * Seed data Sistem Penilaian BKD — SATU-SATUNYA berkas seed.
 * Jalankan: npx prisma db seed  (atau: npm run db:seed)
 *
 * Berisi:
 *  - referensi_kegiatan: rubrik PO BKD 2021 -> fungsi KalkulatorBKDPendidikan
 *    (rule tanpa data institusi ikut dibersihkan dari DB)
 *  - akun admin, 2 dosen, 2 asesor demo (password default, WAJIB diganti di produksi)
 *  - periode aktif + periode lama
 *  - LKD laporan dosen 1 beserta penugasan 2 asesor + portofolio penugasan
 *  - akun dosen JTK POLBAN (data nyata dari SK/ST, lihat bagian DOSEN_JTK)
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { HDNodeWallet, Mnemonic } from "ethers";

const prisma = new PrismaClient();

const MNEMONIC = process.env.WALLET_MNEMONIC || "test test test test test test test test test test test junk";

function deriveAddress(index) {
  const wallet = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(MNEMONIC), `m/44'/60'/0'/0/${index}`);
  return wallet.address;
}

// ---------------------------------------------------------------------------
// Referensi kegiatan: seksi A-N -> fungsi smart contract
// fungsi_contract = null berarti tidak_diotomatisasi (nilai SKS maksimum, dinilai asesor)
// ---------------------------------------------------------------------------
const num = (name, label) => ({ name, label, type: "number", required: true });
const bool = (name, label) => ({ name, label, type: "boolean", required: true });
const sel = (name, label, options) => ({ name, label, type: "select", options, required: true });

const REFERENSI = [
  {
    kode_rule: "EDU001",
    kategori: "Pendidikan Formal",
    nama_kegiatan: "Menempuh pendidikan formal doktor",
    fungsi_contract: "hitungPendidikanFormalDoktor",
    skema_parameter: { fields: [num("jumlahSemester", "Jumlah Semester")] },
  },
  {
    kode_rule: "EDU101",
    kategori: "A. Melaksanakan perkuliahan/tutorial/praktikum",
    nama_kegiatan: "Melaksanakan perkuliahan (tutorial, tatap muka/daring) dan membimbing, menguji, serta menyelenggarakan pendidikan di laboratorium/studio/bengkel",
    fungsi_contract: "hitungPengajaran",
    skema_parameter: {
      fields: [
        num("sksMataKuliah", "SKS Mata Kuliah"),
        num("jumlahPertemuanRencana", "Jumlah Pertemuan Rencana"),
        num("jumlahPertemuanRealisasi", "Jumlah Pertemuan Realisasi"),
        bool("semesterPenuh", "Satu Semester Penuh"),
        bool("teamTeaching", "Team Teaching"),
        num("persenPorsiDosen", "Persentase Porsi Dosen (%)"),
      ],
    },
  },
  {
    kode_rule: "EDU201",
    kategori: "B. Membimbing seminar mahasiswa",
    nama_kegiatan: "Membimbing seminar mahasiswa",
    fungsi_contract: "hitungBimbinganSeminarMahasiswa",
    skema_parameter: { fields: [num("jumlahSemester", "Jumlah Semester")] },
  },
  {
    kode_rule: "EDU202",
    kategori: "C. Membimbing KKN/PKN/PKL",
    nama_kegiatan: "Membimbing Kuliah Kerja Nyata, Praktek Kerja Nyata, Praktek Kerja Lapangan, termasuk membimbing pelatihan militer, wirausaha, magang",
    fungsi_contract: "hitungBimbinganKKNPKLMagang",
    skema_parameter: { fields: [num("jumlahSemester", "Jumlah Semester")] },
  },
  {
    kode_rule: "EDU203",
    kategori: "D. Membimbing tugas akhir",
    nama_kegiatan: "Membimbing dan ikut membimbing dalam menghasilkan disertasi, tesis, skripsi dan laporan akhir studi",
    fungsi_contract: "hitungPembimbinganTugasAkhir",
    skema_parameter: {
      fields: [
        sel("peran", "Peran Pembimbing", ["PembimbingUtama", "PembimbingPendamping"]),
        sel("jenisTugasAkhir", "Jenis Tugas Akhir", ["Disertasi", "Tesis", "Skripsi", "TugasAkhir"]),
        num("jumlahMahasiswa", "Jumlah Mahasiswa"),
      ],
    },
  },
  {
    kode_rule: "EDU301",
    kategori: "E. Penguji ujian akhir",
    nama_kegiatan: "Bertugas sebagai penguji pada ujian akhir/profesi",
    fungsi_contract: "hitungPengujiUjianAkhir",
    skema_parameter: {
      fields: [sel("peranPenguji", "Peran Penguji", ["Ketua", "Anggota"]), num("jumlahMahasiswa", "Jumlah Mahasiswa")],
    },
  },
  {
    kode_rule: "EDU401",
    kategori: "F. Membina kegiatan mahasiswa",
    nama_kegiatan: "Membina kegiatan mahasiswa di bidang akademik dan kemahasiswaan (PA, BEM, Maperwa, dan lain-lain)",
    fungsi_contract: "hitungPembinaKegiatanMahasiswa",
    skema_parameter: { fields: [num("jumlahSemester", "Jumlah Semester")] },
  },
  {
    kode_rule: "EDU402",
    kategori: "F. Membina kegiatan mahasiswa",
    nama_kegiatan: "Membimbing mahasiswa menghasilkan produk saintifik / mengikuti kompetisi di bidang akademik dan kemahasiswaan",
    fungsi_contract: null,
    skema_parameter: { fields: [{ name: "deskripsi", label: "Deskripsi Kegiatan", type: "text", required: true }] },
    keterangan: "Nilai SKS maksimum pada PO BKD 2021 - dinilai langsung oleh asesor (tidak diotomatisasi).",
  },
  {
    kode_rule: "EDU501",
    kategori: "G. Pengembangan program kuliah",
    nama_kegiatan: "Melakukan kegiatan pengembangan program kuliah tatap muka/daring (RPS, perangkat pembelajaran)",
    fungsi_contract: null,
    skema_parameter: { fields: [num("jumlahSemester", "Jumlah Semester")] },
    keterangan: "Dinilai langsung oleh asesor (tidak diotomatisasi).",
  },
  {
    kode_rule: "EDU502",
    kategori: "H. Mengembangkan bahan kuliah",
    nama_kegiatan: "Mengembangkan bahan ajar (buku ajar, modul/pedoman, bahan ajar lain)",
    fungsi_contract: null,
    skema_parameter: {
      fields: [
        sel("jenisBahanAjar", "Jenis Bahan Ajar", ["BukuAjar", "ModulPedoman", "BahanAjarLain"]),
        num("jumlahNaskah", "Jumlah Naskah"),
        sel("peranTim", "Peran dalam Tim", ["Individu", "Ketua", "Anggota"]),
        num("jumlahAnggotaTim", "Jumlah Anggota Tim"),
      ],
    },
    keterangan: "Dinilai langsung oleh asesor (tidak diotomatisasi).",
  },
  {
    kode_rule: "EDU701",
    kategori: "J. Jabatan pimpinan perguruan tinggi",
    nama_kegiatan: "Menduduki jabatan pimpinan perguruan tinggi",
    fungsi_contract: "hitungJabatanPimpinanPerguruanTinggi",
    skema_parameter: {
      fields: [
        sel("jabatan", "Jabatan", [
          "Rektor",
          "KepalaLLDIKTI_WakilRektor_DirekturPascasarjana_KetuaSekolah",
          "KetuaSenat",
          "WakilKetuaSekolahTinggi_WakilDirekturPoliteknik_Akademi_DirekturAkademi",
          "WakilDirekturAkademik_SekretarisLembaga_KetuaJurusan_Departemen",
          "BagianProgramStudi_KepalaLaboratorium_SekretarisJurusanDepartemen",
        ]),
        num("jumlahSemester", "Jumlah Semester"),
      ],
    },
  },
];

/**
 * Rule yang batal diterapkan karena tidak ada datanya di institusi:
 * orasi ilmiah, pembimbing dosen, detasering, pendampingan luar institusi,
 * dan diklat prajabatan. Dihapus dari DB saat seed bila belum dipakai kegiatan.
 */
const RULE_DIHAPUS = ["EDU601", "EDU801", "EDU802", "EDU901", "EDU902"];

// ---------------------------------------------------------------------------
// Akun dosen JTK POLBAN (data nyata, bukan dummy).
//
// SUMBER DATA — dokumen resmi JTK di folder `backend-extract`, diekstrak dengan
// parser rule-based (pdfplumber, deterministik & dapat diaudit):
//   ST Pengajaran  408/KO/AK.04.01/2025 (15 Agu 2025)
//                  sha256 8327c61bfc1788a29f79c50656a83df69611d9664bf8d10e469ccba261be6cf4
//                  -> nama + KODE DOSEN (kolom "Kd Dosen") 33 dosen
//   ST PKL         410/KO/AK.04.07/2025 (19 Agu 2025)
//                  sha256 4bfc0f30199f6e1e31ed985ea8055f3874f80d0cb1c1160887b6de8efc7d3eb3
//                  -> nama 24 dosen pembimbing
//   ST Penguji TA  285/KO/AK.18.06/2025 (16 Jun 2025)
//                  sha256 135828360ab0a09e89f9052fdd686b7d9cf86b530a65f7fcfab7ac50001964e0
//                  -> nama 27 dosen penguji
//   SK Pembimbing TA D3  B/110/PL1.KO/PT.00.06/2024
//                  sha256 daf872ddd546d8a239039096821f2144ec5e8cc8b674e097f669e7ca821a5712
//   SK Pembimbing TA D4  B/111/PL1.KO/PT.00.06/2024
//                  sha256 d30cfa7bd119856eeb0282e5305db9946d3cf98f1c6d24a5662ff469c0d198bf
//
// Gabungan: 37 dosen unik (dedup nama tanpa gelar; varian nama tersingkat
// digabung ke nama terpanjang). SK Pembina Ormawa 45/PL1/HK.02/2026 (parser
// VLM) hanya menyumbang baris ber-tanda `perlu_verifikasi` — NIP dari dokumen
// itu TIDAK diseed kecuali satu baris yang terekonsiliasi antar lampiran.
//
// YANG TIDAK ADA DI DOKUMEN sengaja dibiarkan kosong (jangan dikarang):
// NIDN, NIP (selain 1 baris), jabatan fungsional. Email disintesis dari dua
// kata pertama nama (gelar dibuang), mis. "Ade Chandra Nugraha, S.Si., M.T."
// -> ade.chandra@polban.ac.id — bukan alamat resmi, sekadar kredensial dev.
// PROGRAM STUDI diturunkan dari kedua SK Pembimbing TA (pendekatan, bukan data
// resmi); baris tanpa SK ditandai `prodi_asumsi`.
// ---------------------------------------------------------------------------
const PASSWORD_DEV = "dosen123";
const NAMA_PRODI = {
  D3: "D3 Teknik Informatika",
  D4: "D4 Teknik Informatika",
};
const DOMAIN_EMAIL = "polban.ac.id";

/**
 * Email dev dari dua kata pertama nama; gelar depan (Dr., Drs., Dra., dst.)
 * dan gelar belakang (setelah koma) dibuang.
 */
function emailDariNama(nama) {
  const kata = nama
    .split(",")[0]
    .trim()
    .split(/\s+/)
    .filter((k) => !/^[A-Za-z]+\.$/.test(k)); // buang gelar depan berformat singkatan
  return `${kata.slice(0, 2).join(".").toLowerCase()}@${DOMAIN_EMAIL}`;
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

async function seedDosenJtk() {
  const semuaEmail = DOSEN_JTK.map((d) => emailDariNama(d.nama));
  const ganda = semuaEmail.filter((e, i) => semuaEmail.indexOf(e) !== i);
  if (ganda.length)
    throw new Error(`Email hasil sintesis ganda, perbaiki dulu: ${[...new Set(ganda)].join(", ")}`);

  const prodiSalah = DOSEN_JTK.filter((d) => !NAMA_PRODI[d.prodi]).map((d) => d.nama);
  if (prodiSalah.length)
    throw new Error(`Prodi tidak dikenal (harus D3 atau D4): ${prodiSalah.join("; ")}`);

  const hashDev = bcrypt.hashSync(PASSWORD_DEV, 10);

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

    // Akun lama mungkin masih memakai email format lama: cocokkan juga lewat
    // kode dosen atau nama, lalu migrasikan emailnya.
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
      password_hash: lama?.password_hash ?? hashDev, // jangan reset password yang sudah diubah
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

async function main() {
  console.log("Seeding referensi_kegiatan...");
  for (const ref of REFERENSI) {
    await prisma.referensi_kegiatan.upsert({
      where: { kode_rule: ref.kode_rule },
      update: ref,
      create: ref,
    });
  }

  // Bersihkan rule yang batal diterapkan — hanya bila belum dipakai kegiatan.
  const usang = await prisma.referensi_kegiatan.findMany({
    where: { kode_rule: { in: RULE_DIHAPUS } },
    include: { _count: { select: { kegiatan: true } } },
  });
  for (const r of usang) {
    if (r._count.kegiatan > 0) {
      console.warn(`Lewati hapus ${r.kode_rule}: masih dipakai ${r._count.kegiatan} kegiatan`);
      continue;
    }
    await prisma.referensi_kegiatan.delete({ where: { id_referensi: r.id_referensi } });
    console.log(`Referensi ${r.kode_rule} dihapus`);
  }

  console.log("Seeding pengguna...");
  const hash = (pw) => bcrypt.hashSync(pw, 10);
  const users = [
    { email: "admin@polban.ac.id", nama: "Administrator Sistem", peran: "admin", password_hash: hash("admin123") },
    {
      email: "dosen1@polban.ac.id", nama: "Dosen Satu", peran: "dosen", password_hash: hash("dosen123"),
      nidn: "0000000001", program_studi: "D3 Teknik Informatika", jabatan_fungsional: "Lektor",
      wallet_index: 0, alamat_wallet: deriveAddress(0),
    },
    {
      email: "dosen2@polban.ac.id", nama: "Dosen Dua", peran: "dosen", password_hash: hash("dosen123"),
      nidn: "0000000002", program_studi: "D3 Teknik Informatika", jabatan_fungsional: "Asisten Ahli",
      wallet_index: 1, alamat_wallet: deriveAddress(1),
    },
    {
      email: "asesor1@polban.ac.id", nama: "Asesor Satu", peran: "asesor", password_hash: hash("asesor123"),
      nira: "000000000000000001", kelompok_bidang: "Teknik Informatika",
    },
    {
      email: "asesor2@polban.ac.id", nama: "Asesor Dua", peran: "asesor", password_hash: hash("asesor123"),
      nira: "000000000000000002", kelompok_bidang: "Teknik Informatika",
    },
  ];
  const byEmail = {};
  for (const u of users) {
    byEmail[u.email] = await prisma.pengguna.upsert({ where: { email: u.email }, update: u, create: u });
  }

  console.log("Seeding periode_bkd + fase (aktif, fase pengisian)...");
  const dosen1 = byEmail["dosen1@polban.ac.id"];
  let aktif = await prisma.periode_bkd.findFirst({ where: { nama_periode: "2025/2026 Genap" } });
  if (!aktif) {
    aktif = await prisma.periode_bkd.create({
      data: {
        nama_periode: "2025/2026 Genap", tahun_ajaran: "2025/2026", semester: "Genap",
        tanggal_mulai: new Date("2026-02-02"), tanggal_selesai: new Date("2026-07-31"), status: "aktif",
        // Rentang fase (R3). Override manual ke 'pengisian' agar demo langsung bisa input.
        pengisian_mulai: new Date("2026-06-01"), pengisian_selesai: new Date("2026-07-31"),
        pemeriksaan_mulai: new Date("2026-08-01"), pemeriksaan_selesai: new Date("2026-08-15"),
        penilaian_mulai: new Date("2026-08-16"), penilaian_selesai: new Date("2026-08-31"),
        fase_override: "pengisian",
      },
    });
  }
  const lama = await prisma.periode_bkd.findFirst({ where: { nama_periode: "2025/2026 Ganjil" } });
  if (!lama) {
    await prisma.periode_bkd.create({
      data: {
        nama_periode: "2025/2026 Ganjil", tahun_ajaran: "2025/2026", semester: "Ganjil",
        tanggal_mulai: new Date("2025-09-01"), tanggal_selesai: new Date("2026-01-31"), status: "nonaktif",
        fase_override: "penilaian",
      },
    });
  }

  console.log("Seeding LKD laporan + penugasan 2 asesor (Dosen Satu, periode aktif)...");
  let lkdLaporan = await prisma.lkd.findFirst({
    where: { id_pengguna: dosen1.id_pengguna, id_periode: aktif.id_periode, jenis: "laporan" },
  });
  if (!lkdLaporan) {
    lkdLaporan = await prisma.lkd.create({
      data: {
        id_pengguna: dosen1.id_pengguna,
        id_periode: aktif.id_periode,
        jenis: "laporan",
        penugasan_asesor: {
          create: [
            { id_asesor: byEmail["asesor1@polban.ac.id"].id_pengguna, urutan: 1 },
            { id_asesor: byEmail["asesor2@polban.ac.id"].id_pengguna, urutan: 2 },
          ],
        },
      },
    });
  }

  // R7: portofolio kegiatan penugasan yang dicatat admin - BELUM diklaim ke LKD.
  // Contoh isi menu "Input Kegiatan Dosen": menunggu ditarik dosen ke laporan.
  console.log("Seeding portofolio kegiatan penugasan (belum diklaim) untuk Dosen Satu...");
  const refP = await prisma.referensi_kegiatan.findUnique({ where: { kode_rule: "EDU101" } });
  const refBimb = await prisma.referensi_kegiatan.findUnique({ where: { kode_rule: "EDU203" } });
  const refUji = await prisma.referensi_kegiatan.findUnique({ where: { kode_rule: "EDU301" } });
  const portofolio = [
    { ref: refP, judul: "Basis Data / 2CTI3",
      detail: { kelas: "2CTI3", jenis_mata_kuliah: "Wajib", bidang_keilmuan: "Rekayasa Perangkat Lunak", jumlah_mahasiswa: 28 },
      parameter: { sksMataKuliah: 3, jumlahPertemuanRencana: 16, jumlahPertemuanRealisasi: 16, semesterPenuh: true, teamTeaching: false, persenPorsiDosen: 100 }, sks: 300 },
    { ref: refP, judul: "Pemrograman Web / 1ATI2",
      detail: { kelas: "1ATI2", jenis_mata_kuliah: "Wajib", bidang_keilmuan: "Rekayasa Perangkat Lunak", jumlah_mahasiswa: 30 },
      parameter: { sksMataKuliah: 3, jumlahPertemuanRencana: 16, jumlahPertemuanRealisasi: 16, semesterPenuh: true, teamTeaching: false, persenPorsiDosen: 100 }, sks: 300 },
    { ref: refBimb, judul: "Bimbingan TA - Andi Pratama",
      detail: { bidang_keilmuan: "Sistem Informasi" },
      parameter: { peran: "PembimbingUtama", jenisTugasAkhir: "TugasAkhir", jumlahMahasiswa: 1 }, sks: 50 },
    { ref: refUji, judul: "Penguji Sidang TA (4 mahasiswa)",
      detail: { bidang_keilmuan: "Sistem Informasi", jenis_pengujian: "Sidang Tugas Akhir" },
      parameter: { peranPenguji: "Ketua", jumlahMahasiswa: 4 }, sks: 200 },
  ];
  for (const it of portofolio) {
    if (!it.ref) continue;
    const exists = await prisma.kegiatan.findFirst({ where: { id_lkd: lkdLaporan.id_lkd, judul: it.judul } });
    if (exists) continue;
    await prisma.kegiatan.create({
      data: {
        id_lkd: lkdLaporan.id_lkd,
        id_referensi: it.ref.id_referensi,
        judul: it.judul,
        detail_kegiatan: it.detail,
        parameter: it.parameter,
        sks_dihitung_x100: it.sks,
        status_perhitungan: "berhasil",
        status: "diajukan",
        sumber_data: "admin",
        diklaim: false,
      },
    });
  }

  console.log("Seeding akun dosen JTK (data nyata dari SK/ST)...");
  await seedDosenJtk();

  console.log("Seed selesai (master + portofolio penugasan + akun dosen JTK).");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

