import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";

const { ethers } = await network.create();

// Enum Solidity (urutan wajib sama dengan skema_parameter pada seed).
const PERAN_UTAMA = 0;
const PERAN_PENDAMPING = 1;
const DISERTASI = 0;
const TESIS = 1;
const SKRIPSI = 2;
const TUGAS_AKHIR = 3;
const PENGUJI_KETUA = 0;
const PENGUJI_ANGGOTA = 1;
const JABATAN_REKTOR = 0;
const JABATAN_KETUA_JURUSAN = 4;

describe("Kalkulator BKD Pendidikan", function () {
  let kalkulator;

  before(async function () {
    kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
  });

  // --- hitungPendidikanFormalDoktor -------------------------------------
  it("UT-KAL-001 (Positif) pendidikan formal doktor satu semester bernilai 12 SKS", async function () {
    assert.equal(await kalkulator.hitungPendidikanFormalDoktor.staticCall(1), 1200n);
  });

  it("UT-KAL-002 (Negatif) pendidikan formal doktor nol semester ditolak", async function () {
    await assert.rejects(
      kalkulator.hitungPendidikanFormalDoktor.staticCall(0),
      /InputTidakValid/
    );
  });

  // --- hitungPengajaran --------------------------------------------------
  it("UT-KAL-003 (Positif) pengajaran realisasi penuh bernilai penuh", async function () {
    assert.equal(await kalkulator.hitungPengajaran.staticCall(3, 16, 16, true, false, 100), 300n);
  });

  it("UT-KAL-004 (Positif) pengajaran realisasi sebagian bernilai proporsional", async function () {
    assert.equal(await kalkulator.hitungPengajaran.staticCall(3, 16, 12, true, false, 100), 225n);
  });

  it("UT-KAL-005 (Positif) pengajaran team teaching dibagi menurut porsi dosen", async function () {
    assert.equal(await kalkulator.hitungPengajaran.staticCall(3, 16, 16, true, true, 50), 150n);
  });

  it("UT-KAL-006 (Edge) pengajaran realisasi tepat pada ambang 50 persen tetap dinilai", async function () {
    assert.equal(await kalkulator.hitungPengajaran.staticCall(2, 16, 8, true, false, 100), 100n);
  });

  it("UT-KAL-007 (Edge) pengajaran realisasi tepat di bawah ambang bernilai nol", async function () {
    assert.equal(await kalkulator.hitungPengajaran.staticCall(2, 16, 7, true, false, 100), 0n);
  });

  it("UT-KAL-008 (Edge) pengajaran team teaching membulatkan ke bawah", async function () {
    assert.equal(await kalkulator.hitungPengajaran.staticCall(3, 16, 16, true, true, 33), 99n);
  });

  it("UT-KAL-009 (Negatif) pengajaran tidak satu semester penuh bernilai nol", async function () {
    assert.equal(await kalkulator.hitungPengajaran.staticCall(3, 16, 16, false, false, 100), 0n);
  });

  it("UT-KAL-010 (Negatif) pengajaran realisasi melebihi rencana ditolak", async function () {
    await assert.rejects(
      kalkulator.hitungPengajaran.staticCall(3, 16, 17, true, false, 100),
      /InputTidakValid/
    );
  });

  it("UT-KAL-011 (Negatif) pengajaran bobot mata kuliah nol ditolak", async function () {
    await assert.rejects(
      kalkulator.hitungPengajaran.staticCall(0, 16, 16, true, false, 100),
      /InputTidakValid/
    );
  });

  it("UT-KAL-012 (Negatif) pengajaran rencana pertemuan nol ditolak", async function () {
    await assert.rejects(
      kalkulator.hitungPengajaran.staticCall(3, 0, 0, true, false, 100),
      /InputTidakValid/
    );
  });

  it("UT-KAL-013 (Negatif) pengajaran team teaching porsi nol ditolak", async function () {
    await assert.rejects(
      kalkulator.hitungPengajaran.staticCall(3, 16, 16, true, true, 0),
      /InputTidakValid/
    );
  });

  it("UT-KAL-014 (Negatif) pengajaran team teaching porsi melebihi seratus ditolak", async function () {
    await assert.rejects(
      kalkulator.hitungPengajaran.staticCall(3, 16, 16, true, true, 101),
      /InputTidakValid/
    );
  });

  // --- hitungBimbinganSeminarMahasiswa -----------------------------------
  it("UT-KAL-015 (Positif) bimbingan seminar satu semester bernilai 1 SKS", async function () {
    assert.equal(await kalkulator.hitungBimbinganSeminarMahasiswa.staticCall(1), 100n);
  });

  it("UT-KAL-016 (Negatif) bimbingan seminar nol semester ditolak", async function () {
    await assert.rejects(
      kalkulator.hitungBimbinganSeminarMahasiswa.staticCall(0),
      /InputTidakValid/
    );
  });

  // --- hitungBimbinganKKNPKLMagang ---------------------------------------
  it("UT-KAL-017 (Positif) bimbingan KKN, PKL, atau magang satu semester bernilai 2 SKS", async function () {
    assert.equal(await kalkulator.hitungBimbinganKKNPKLMagang.staticCall(1), 200n);
  });

  it("UT-KAL-018 (Negatif) bimbingan KKN, PKL, atau magang nol semester ditolak", async function () {
    await assert.rejects(
      kalkulator.hitungBimbinganKKNPKLMagang.staticCall(0),
      /InputTidakValid/
    );
  });

  // --- hitungPembimbinganTugasAkhir --------------------------------------
  it("UT-KAL-019 (Positif) pembimbing utama disertasi dua mahasiswa", async function () {
    assert.equal(
      await kalkulator.hitungPembimbinganTugasAkhir.staticCall(PERAN_UTAMA, DISERTASI, 2),
      266n
    );
  });

  it("UT-KAL-020 (Positif) pembimbing pendamping disertasi satu mahasiswa", async function () {
    assert.equal(
      await kalkulator.hitungPembimbinganTugasAkhir.staticCall(PERAN_PENDAMPING, DISERTASI, 1),
      100n
    );
  });

  it("UT-KAL-021 (Positif) pembimbing utama tesis satu mahasiswa", async function () {
    assert.equal(
      await kalkulator.hitungPembimbinganTugasAkhir.staticCall(PERAN_UTAMA, TESIS, 1),
      100n
    );
  });

  it("UT-KAL-022 (Positif) pembimbing pendamping tesis dua mahasiswa", async function () {
    assert.equal(
      await kalkulator.hitungPembimbinganTugasAkhir.staticCall(PERAN_PENDAMPING, TESIS, 2),
      150n
    );
  });

  it("UT-KAL-023 (Positif) pembimbing utama skripsi empat mahasiswa", async function () {
    assert.equal(
      await kalkulator.hitungPembimbinganTugasAkhir.staticCall(PERAN_UTAMA, SKRIPSI, 4),
      200n
    );
  });

  it("UT-KAL-024 (Positif) pembimbing pendamping laporan akhir studi empat mahasiswa", async function () {
    assert.equal(
      await kalkulator.hitungPembimbinganTugasAkhir.staticCall(PERAN_PENDAMPING, TUGAS_AKHIR, 4),
      100n
    );
  });

  it("UT-KAL-025 (Negatif) pembimbingan tugas akhir nol mahasiswa ditolak", async function () {
    await assert.rejects(
      kalkulator.hitungPembimbinganTugasAkhir.staticCall(PERAN_UTAMA, SKRIPSI, 0),
      /InputTidakValid/
    );
  });

  // --- hitungPengujiUjianAkhir -------------------------------------------
  it("UT-KAL-026 (Positif) ketua penguji empat mahasiswa", async function () {
    assert.equal(await kalkulator.hitungPengujiUjianAkhir.staticCall(PENGUJI_KETUA, 4), 200n);
  });

  it("UT-KAL-027 (Positif) anggota penguji empat mahasiswa", async function () {
    assert.equal(await kalkulator.hitungPengujiUjianAkhir.staticCall(PENGUJI_ANGGOTA, 4), 100n);
  });

  it("UT-KAL-028 (Negatif) penguji ujian akhir nol mahasiswa ditolak", async function () {
    await assert.rejects(
      kalkulator.hitungPengujiUjianAkhir.staticCall(PENGUJI_KETUA, 0),
      /InputTidakValid/
    );
  });

  // --- hitungPembinaKegiatanMahasiswa ------------------------------------
  it("UT-KAL-029 (Positif) pembina kegiatan mahasiswa satu semester bernilai 2 SKS", async function () {
    assert.equal(await kalkulator.hitungPembinaKegiatanMahasiswa.staticCall(1), 200n);
  });

  it("UT-KAL-030 (Negatif) pembina kegiatan mahasiswa nol semester ditolak", async function () {
    await assert.rejects(
      kalkulator.hitungPembinaKegiatanMahasiswa.staticCall(0),
      /InputTidakValid/
    );
  });

  // --- hitungJabatanPimpinanPerguruanTinggi ------------------------------
  it("UT-KAL-031 (Positif) jabatan rektor satu semester bernilai 6 SKS", async function () {
    assert.equal(
      await kalkulator.hitungJabatanPimpinanPerguruanTinggi.staticCall(JABATAN_REKTOR, 1),
      600n
    );
  });

  it("UT-KAL-032 (Positif) jabatan ketua jurusan satu semester bernilai 3 SKS", async function () {
    assert.equal(
      await kalkulator.hitungJabatanPimpinanPerguruanTinggi.staticCall(JABATAN_KETUA_JURUSAN, 1),
      300n
    );
  });

  it("UT-KAL-033 (Negatif) jabatan pimpinan nol semester ditolak", async function () {
    await assert.rejects(
      kalkulator.hitungJabatanPimpinanPerguruanTinggi.staticCall(JABATAN_REKTOR, 0),
      /InputTidakValid/
    );
  });

  // --- jumlahkanSKS -------------------------------------------------------
  it("UT-KAL-034 (Positif) rekapitulasi menjumlahkan seluruh nilai kredit", async function () {
    assert.equal(await kalkulator.jumlahkanSKS.staticCall([300, 150, 200]), 650n);
  });

  it("UT-KAL-035 (Edge) rekapitulasi daftar kosong bernilai nol", async function () {
    assert.equal(await kalkulator.jumlahkanSKS.staticCall([]), 0n);
  });

  // --- determinisme -------------------------------------------------------
  it("UT-KAL-036 (Edge) pemanggilan berulang dengan parameter identik menghasilkan nilai identik", async function () {
    const a = await kalkulator.hitungPengajaran.staticCall(3, 16, 12, true, true, 40);
    const b = await kalkulator.hitungPengajaran.staticCall(3, 16, 12, true, true, 40);
    const c = await kalkulator.hitungPengajaran.staticCall(3, 16, 12, true, true, 40);
    assert.equal(a, b);
    assert.equal(b, c);
    assert.equal(a, 90n);
  });
});
