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

  console.log("Seeding periode_bkd...");
  let aktif = await prisma.periode_bkd.findFirst({ where: { nama_periode: "2025/2026 Genap" } });
  if (!aktif) {
    aktif = await prisma.periode_bkd.create({
      data: {
        nama_periode: "2025/2026 Genap", tahun_ajaran: "2025/2026", semester: "Genap",
        tanggal_mulai: new Date("2026-02-02"), tanggal_selesai: new Date("2026-07-31"), status: "aktif",
      },
    });
  }
  const lama = await prisma.periode_bkd.findFirst({ where: { nama_periode: "2025/2026 Ganjil" } });
  if (!lama) {
    await prisma.periode_bkd.create({
      data: {
        nama_periode: "2025/2026 Ganjil", tahun_ajaran: "2025/2026", semester: "Ganjil",
        tanggal_mulai: new Date("2025-09-01"), tanggal_selesai: new Date("2026-01-31"), status: "nonaktif",
      },
    });
  }

  console.log("Seeding LKD + penugasan asesor untuk Dosen Satu...");
  const dosen1 = byEmail["dosen1@polban.ac.id"];
  for (const jenis of ["rencana", "laporan"]) {
    const existing = await prisma.lkd.findFirst({
      where: { id_pengguna: dosen1.id_pengguna, id_periode: aktif.id_periode, jenis },
    });
    if (existing) continue;
    await prisma.lkd.create({
      data: {
        id_pengguna: dosen1.id_pengguna,
        id_periode: aktif.id_periode,
        jenis,
        penugasan_asesor: {
          create: [
            { id_asesor: byEmail["asesor1@polban.ac.id"].id_pengguna, urutan: 1 },
            { id_asesor: byEmail["asesor2@polban.ac.id"].id_pengguna, urutan: 2 },
          ],
        },
      },
    });
  }

  console.log("Seeding contoh kegiatan pengajaran (dosen1, LKD laporan)...");
  const lkdLaporan = await prisma.lkd.findFirst({
    where: { id_pengguna: dosen1.id_pengguna, id_periode: aktif.id_periode, jenis: "laporan" },
  });
  const refPengajaran = await prisma.referensi_kegiatan.findUnique({ where: { kode_rule: "EDU101" } });
  if (lkdLaporan && refPengajaran) {
    const contohKegiatan = [
      { judul: "Matkul A", kelas: "2CTI3", sks: 3 },
      { judul: "Matkul B", kelas: "1ATI2", sks: 3 },
    ];
    for (const c of contohKegiatan) {
      const exists = await prisma.kegiatan.findFirst({
        where: { id_lkd: lkdLaporan.id_lkd, judul: c.judul },
      });
      if (exists) continue;
      await prisma.kegiatan.create({
        data: {
          id_lkd: lkdLaporan.id_lkd,
          id_referensi: refPengajaran.id_referensi,
          judul: c.judul,
          detail_kegiatan: { kelas: c.kelas, jenis_mata_kuliah: "Wajib" },
          parameter: {
            sksMataKuliah: c.sks,
            jumlahPertemuanRencana: 16,
            jumlahPertemuanRealisasi: 16,
            semesterPenuh: true,
            teamTeaching: false,
            persenPorsiDosen: 100,
          },
          sks_dihitung_x100: c.sks * 100,
          status_perhitungan: "berhasil",
          status: "diajukan",
          status_capaian: "selesai",
        },
      });
    }
  }

  console.log("Seeding contoh kegiatan kategori lain (bimbingan TA & penguji)...");
  if (lkdLaporan) {
    const contohLain = [
      {
        kode: "EDU203",
        judul: "Membimbing Tugas Akhir (pembimbing utama) MAHASISWA 1",
        parameter: { peran: "PembimbingUtama", jenisTugasAkhir: "TugasAkhir", jumlahMahasiswa: 1 },
        sks: 50,
      },
      {
        kode: "EDU301",
        judul: "Ketua penguji sidang Tugas Akhir (4 mahasiswa)",
        parameter: { peranPenguji: "Ketua", jumlahMahasiswa: 4 },
        sks: 200,
      },
    ];
    for (const c of contohLain) {
      const ref = await prisma.referensi_kegiatan.findUnique({ where: { kode_rule: c.kode } });
      if (!ref) continue;
      const exists = await prisma.kegiatan.findFirst({
        where: { id_lkd: lkdLaporan.id_lkd, judul: c.judul },
      });
      if (exists) continue;
      await prisma.kegiatan.create({
        data: {
          id_lkd: lkdLaporan.id_lkd,
          id_referensi: ref.id_referensi,
          judul: c.judul,
          parameter: c.parameter,
          sks_dihitung_x100: c.sks,
          status_perhitungan: "berhasil",
          status: "diajukan",
          status_capaian: "selesai",
        },
      });
    }
  }

  // -------------------------------------------------------------------------
  // Dummy lengkap: dokumen bukti, LKD periode lama yang sudah dinilai penuh,
  // hasil penilaian 2 asesor, simpulan M, dan riwayat transaksi mint (contoh).
  // Idempoten - aman dijalankan berulang.
  // -------------------------------------------------------------------------
  console.log("Seeding dokumen bukti untuk Matkul A...");
  const matkulA = await prisma.kegiatan.findFirst({
    where: { judul: "Matkul A", id_lkd: lkdLaporan?.id_lkd },
  });
  if (matkulA) {
    const adaDok = await prisma.dokumen_kegiatan.findFirst({
      where: { id_kegiatan: matkulA.id_kegiatan },
    });
    if (!adaDok) {
      await prisma.dokumen_kegiatan.createMany({
        data: [
          {
            id_kegiatan: matkulA.id_kegiatan,
            nama_dokumen: "Berita Acara Perkuliahan Matkul A",
            jenis_dokumen: "Berita Acara Perkuliahan",
            jenis_file: "tautan",
            file_url: "https://drive.google.com/contoh-bap-matkul-a",
            keterangan: "Dummy seed",
          },
          {
            id_kegiatan: matkulA.id_kegiatan,
            nama_dokumen: "Daftar Hadir Matkul A",
            jenis_dokumen: "Daftar Hadir",
            jenis_file: "tautan",
            file_url: "https://drive.google.com/contoh-daftar-hadir",
            keterangan: "Dummy seed",
          },
        ],
      });
    }
  }

  console.log("Seeding LKD periode lama (sudah dinilai penuh)...");
  const periodeLama = await prisma.periode_bkd.findFirst({
    where: { nama_periode: "2025/2026 Ganjil" },
  });
  if (periodeLama) {
    let lkdLama = await prisma.lkd.findFirst({
      where: { id_pengguna: dosen1.id_pengguna, id_periode: periodeLama.id_periode, jenis: "laporan" },
      include: { penugasan_asesor: true },
    });
    if (!lkdLama) {
      lkdLama = await prisma.lkd.create({
        data: {
          id_pengguna: dosen1.id_pengguna,
          id_periode: periodeLama.id_periode,
          jenis: "laporan",
          status: "final",
          simpan_permanen: true,
          penugasan_asesor: {
            create: [
              { id_asesor: byEmail["asesor1@polban.ac.id"].id_pengguna, urutan: 1 },
              { id_asesor: byEmail["asesor2@polban.ac.id"].id_pengguna, urutan: 2 },
            ],
          },
        },
        include: { penugasan_asesor: true },
      });

      const refP = await prisma.referensi_kegiatan.findUnique({ where: { kode_rule: "EDU101" } });
      const kegLama = await prisma.kegiatan.create({
        data: {
          id_lkd: lkdLama.id_lkd,
          id_referensi: refP.id_referensi,
          judul: "Matkul Lama X",
          detail_kegiatan: { kelas: "3CTI1" },
          parameter: {
            sksMataKuliah: 3, jumlahPertemuanRencana: 16, jumlahPertemuanRealisasi: 16,
            semesterPenuh: true, teamTeaching: false, persenPorsiDosen: 100,
          },
          sks_dihitung_x100: 300,
          status_perhitungan: "berhasil",
          status: "disetujui",
          status_capaian: "selesai",
        },
      });

      let hasilPertama = null;
      for (const pn of lkdLama.penugasan_asesor) {
        const h = await prisma.hasil_penilaian.create({
          data: {
            id_kegiatan: kegLama.id_kegiatan,
            id_penugasan: pn.id_penugasan,
            sks_disetujui_x100: 300,
            status: "disetujui",
            catatan: "sesuai PO BKD tahun 2021",
          },
        });
        if (!hasilPertama) hasilPertama = h;
      }

      await prisma.simpulan_bkd.create({
        data: {
          id_lkd: lkdLama.id_lkd,
          sks_pendidikan_x100: 1200,
          sks_penelitian_x100: 300,
          sks_pengabdian_x100: 100,
          sks_penunjang_x100: 100,
          status_kewajiban_khusus: "M",
          status_final: "M",
          hash_penilaian: "0x" + "ab12".repeat(16), // dummy - diganti hash asli saat pengesahan
        },
      });

      const adaTx = await prisma.riwayat_transaksi.findFirst({
        where: { alamat_wallet: dosen1.alamat_wallet, jenis_transaksi: "mint" },
      });
      if (!adaTx && hasilPertama) {
        await prisma.riwayat_transaksi.create({
          data: {
            id_hasil: hasilPertama.id_hasil,
            jenis_transaksi: "mint",
            jumlah_token_x100: 300,
            alamat_wallet: dosen1.alamat_wallet,
            reference_id: "0x" + "ab12".repeat(16),
            alasan: "Dummy seed - pengesahan LKD 2025/2026 Ganjil",
            status: "pending", // belum benar-benar on-chain; jalankan mint sungguhan via app
          },
        });
      }
    }
  }

  console.log("Seed selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
