/**
 * Seed data master Sistem Penilaian BKD.
 * Jalankan: npx prisma db seed  (atau: node prisma/seed.mjs)
 *
 * Berisi:
 *  - referensi_kegiatan: rubrik seksi A-N PO BKD 2021 -> fungsi KalkulatorBKDPendidikan
 *  - akun admin, 2 dosen, 2 asesor (password default, WAJIB diganti di produksi)
 *  - periode aktif + periode lama
 *  - LKD rencana+laporan dosen 1 beserta penugasan 2 asesor
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
    fungsi_contract: "hitungPengembanganProgramKuliah",
    skema_parameter: { fields: [num("jumlahSemester", "Jumlah Semester")] },
  },
  {
    kode_rule: "EDU502",
    kategori: "H. Mengembangkan bahan kuliah",
    nama_kegiatan: "Mengembangkan bahan ajar (buku ajar, modul/pedoman, bahan ajar lain)",
    fungsi_contract: "hitungPengembanganBahanAjar",
    skema_parameter: {
      fields: [
        sel("jenisBahanAjar", "Jenis Bahan Ajar", ["BukuAjar", "ModulPedoman", "BahanAjarLain"]),
        num("jumlahNaskah", "Jumlah Naskah"),
        sel("peranTim", "Peran dalam Tim", ["Individu", "Ketua", "Anggota"]),
        num("jumlahAnggotaTim", "Jumlah Anggota Tim"),
      ],
    },
  },
  {
    kode_rule: "EDU601",
    kategori: "I. Menyampaikan orasi ilmiah",
    nama_kegiatan: "Menyampaikan orasi ilmiah",
    fungsi_contract: "hitungOrasiIlmiah",
    skema_parameter: { fields: [num("jumlahOrasi", "Jumlah Orasi")] },
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
  {
    kode_rule: "EDU801",
    kategori: "K. Membimbing dosen lebih rendah jabatan",
    nama_kegiatan: "Membimbing dosen yang lebih rendah jabatannya",
    fungsi_contract: "hitungMembimbingDosenLebihRendah",
    skema_parameter: {
      fields: [
        sel("jenis", "Jenis Bimbingan", ["Pencangkokan", "Reguler"]),
        num("jumlahOrang", "Jumlah Dosen Dibimbing"),
        num("jumlahSemester", "Jumlah Semester"),
      ],
    },
  },
  {
    kode_rule: "EDU802",
    kategori: "L. Detasering dan pencangkokan",
    nama_kegiatan: "Melaksanakan kegiatan detasering dan pencangkokan di luar institusi",
    fungsi_contract: "hitungDetaseringPencangkokan",
    skema_parameter: {
      fields: [sel("lokasi", "Lokasi Institusi", ["InstitusiQS100", "InstitusiNasional"]), num("jumlahKegiatan", "Jumlah Kegiatan")],
    },
  },
  {
    kode_rule: "EDU901",
    kategori: "M. Pendampingan mahasiswa luar institusi",
    nama_kegiatan: "Melaksanakan kegiatan pendampingan mahasiswa di luar institusi sesuai kebijakan Kementerian",
    fungsi_contract: "hitungPendampinganMahasiswaLuarInstitusi",
    skema_parameter: {
      fields: [sel("jenjang", "Jenjang Dosen", ["LektorKeAtas", "AsistenAhli_DosenLain"]), num("jumlahSemester", "Jumlah Semester")],
    },
  },
  {
    kode_rule: "EDU902",
    kategori: "N. Pengembangan diri/sertifikasi",
    nama_kegiatan: "Melakukan kegiatan pengembangan diri untuk meningkatkan kompetensi / memperoleh sertifikasi profesi (pelatihan dasar/prajabatan)",
    fungsi_contract: "hitungPelatihanDasar",
    skema_parameter: { fields: [num("jumlahSertifikat", "Jumlah Sertifikat")] },
  },
];

async function main() {
  console.log("Seeding referensi_kegiatan...");
  for (const ref of REFERENSI) {
    await prisma.referensi_kegiatan.upsert({
      where: { kode_rule: ref.kode_rule },
      update: ref,
      create: ref,
    });
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
        penilaian_mulai: new Date("2026-08-01"), penilaian_selesai: new Date("2026-08-20"),
        perbaikan_mulai: new Date("2026-08-21"), perbaikan_selesai: new Date("2026-08-31"),
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
        fase_override: "selesai",
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

  console.log("Seed selesai (master + portofolio penugasan belum diklaim).");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

