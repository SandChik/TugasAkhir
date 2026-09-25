/**
 * Modul: KalkulatorBKDPendidikan (contracts/BKD.sol)
 * Skenario mengikuti Tabel IV.78 laporan, satu it() per ID.
 * Jumlah skenario: 36
 * Rincian kategori: Positif 18, Negatif 13, Edge 5
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";

// jaringan simulasi bertipe rantai OP Stack, sama dengan Base Sepolia
const { ethers } = await network.create("hardhatOp");

const kalkulatorBaru = () => ethers.deployContract("KalkulatorBKDPendidikan");

// enum kontrak
const UTAMA = 0, PENDAMPING = 1;
const DISERTASI = 0, TESIS = 1, SKRIPSI = 2, TUGAS_AKHIR = 3;
const KETUA = 0, ANGGOTA = 1;
const REKTOR = 0, KETUA_JURUSAN = 4;

describe("Kalkulator BKD Pendidikan", function () {
  it("UT-KAL-001 [Positif] hitungPendidikanFormalDoktor: pendidikan formal doktor satu semester", async function () {
    const k = await kalkulatorBaru();
    assert.equal(await k.hitungPendidikanFormalDoktor(1), 1200n);
  });

  it("UT-KAL-002 [Negatif] hitungPendidikanFormalDoktor: nol semester ditolak", async function () {
    const k = await kalkulatorBaru();
    await assert.rejects(k.hitungPendidikanFormalDoktor(0), /InputTidakValid/);
  });

  it("UT-KAL-003 [Positif] hitungPengajaran: realisasi penuh tanpa pengampuan bersama", async function () {
    const k = await kalkulatorBaru();
    assert.equal(await k.hitungPengajaran(3, 16, 16, true, false, 0), 300n);
  });

  it("UT-KAL-004 [Positif] hitungPengajaran: realisasi sebagian 12 dari 16", async function () {
    const k = await kalkulatorBaru();
    // (3 * 100 * 12) / 16 = 225
    assert.equal(await k.hitungPengajaran(3, 16, 12, true, false, 0), 225n);
  });

  it("UT-KAL-005 [Positif] hitungPengajaran: pengampuan bersama porsi 50 persen", async function () {
    const k = await kalkulatorBaru();
    assert.equal(await k.hitungPengajaran(3, 16, 16, true, true, 50), 150n);
  });

  it("UT-KAL-006 [Edge] hitungPengajaran: realisasi tepat pada ambang 50 persen", async function () {
    const k = await kalkulatorBaru();
    // (8 * 100) / 16 = 50, lolos ambang. (2 * 100 * 8) / 16 = 100
    assert.equal(await k.hitungPengajaran(2, 16, 8, true, false, 0), 100n);
  });

  it("UT-KAL-007 [Edge] hitungPengajaran: realisasi tepat di bawah ambang", async function () {
    const k = await kalkulatorBaru();
    // (7 * 100) / 16 = 43, di bawah ambang
    assert.equal(await k.hitungPengajaran(2, 16, 7, true, false, 0), 0n);
  });

  it("UT-KAL-008 [Edge] hitungPengajaran: pembulatan ke bawah pada pengampuan bersama porsi 33 persen", async function () {
    const k = await kalkulatorBaru();
    // (300 * 33) / 100 = 99
    assert.equal(await k.hitungPengajaran(3, 16, 16, true, true, 33), 99n);
  });

  it("UT-KAL-009 [Negatif] hitungPengajaran: semesterPenuh false mengembalikan 0 tanpa revert", async function () {
    const k = await kalkulatorBaru();
    assert.equal(await k.hitungPengajaran(3, 16, 16, false, false, 0), 0n);
  });

  it("UT-KAL-010 [Negatif] hitungPengajaran: realisasi 17 melebihi rencana 16 ditolak", async function () {
    const k = await kalkulatorBaru();
    await assert.rejects(k.hitungPengajaran(3, 16, 17, true, false, 0), /InputTidakValid/);
  });

  it("UT-KAL-011 [Negatif] hitungPengajaran: sksMataKuliah nol ditolak", async function () {
    const k = await kalkulatorBaru();
    await assert.rejects(k.hitungPengajaran(0, 16, 16, true, false, 0), /InputTidakValid/);
  });

  it("UT-KAL-012 [Negatif] hitungPengajaran: jumlahPertemuanRencana nol ditolak", async function () {
    const k = await kalkulatorBaru();
    await assert.rejects(k.hitungPengajaran(3, 0, 0, true, false, 0), /InputTidakValid/);
  });

  it("UT-KAL-013 [Negatif] hitungPengajaran: pengampuan bersama porsi 0 ditolak", async function () {
    const k = await kalkulatorBaru();
    await assert.rejects(k.hitungPengajaran(3, 16, 16, true, true, 0), /InputTidakValid/);
  });

  it("UT-KAL-014 [Negatif] hitungPengajaran: pengampuan bersama porsi 101 ditolak", async function () {
    const k = await kalkulatorBaru();
    await assert.rejects(k.hitungPengajaran(3, 16, 16, true, true, 101), /InputTidakValid/);
  });

  it("UT-KAL-015 [Positif] hitungBimbinganSeminarMahasiswa: satu semester", async function () {
    const k = await kalkulatorBaru();
    assert.equal(await k.hitungBimbinganSeminarMahasiswa(1), 100n);
  });

  it("UT-KAL-016 [Negatif] hitungBimbinganSeminarMahasiswa: nol semester ditolak", async function () {
    const k = await kalkulatorBaru();
    await assert.rejects(k.hitungBimbinganSeminarMahasiswa(0), /InputTidakValid/);
  });

  it("UT-KAL-017 [Positif] hitungBimbinganKKNPKLMagang: satu semester", async function () {
    const k = await kalkulatorBaru();
    assert.equal(await k.hitungBimbinganKKNPKLMagang(1), 200n);
  });

  it("UT-KAL-018 [Negatif] hitungBimbinganKKNPKLMagang: nol semester ditolak", async function () {
    const k = await kalkulatorBaru();
    await assert.rejects(k.hitungBimbinganKKNPKLMagang(0), /InputTidakValid/);
  });

  it("UT-KAL-019 [Positif] hitungPembimbinganTugasAkhir: pembimbing utama disertasi dua mahasiswa", async function () {
    const k = await kalkulatorBaru();
    assert.equal(await k.hitungPembimbinganTugasAkhir(UTAMA, DISERTASI, 2), 266n);
  });

  it("UT-KAL-020 [Positif] hitungPembimbinganTugasAkhir: pembimbing pendamping disertasi satu mahasiswa", async function () {
    const k = await kalkulatorBaru();
    assert.equal(await k.hitungPembimbinganTugasAkhir(PENDAMPING, DISERTASI, 1), 100n);
  });

  it("UT-KAL-021 [Positif] hitungPembimbinganTugasAkhir: pembimbing utama tesis satu mahasiswa", async function () {
    const k = await kalkulatorBaru();
    assert.equal(await k.hitungPembimbinganTugasAkhir(UTAMA, TESIS, 1), 100n);
  });

  it("UT-KAL-022 [Positif] hitungPembimbinganTugasAkhir: pembimbing pendamping tesis dua mahasiswa", async function () {
    const k = await kalkulatorBaru();
    assert.equal(await k.hitungPembimbinganTugasAkhir(PENDAMPING, TESIS, 2), 150n);
  });

  it("UT-KAL-023 [Positif] hitungPembimbinganTugasAkhir: pembimbing utama skripsi empat mahasiswa", async function () {
    const k = await kalkulatorBaru();
    assert.equal(await k.hitungPembimbinganTugasAkhir(UTAMA, SKRIPSI, 4), 200n);
  });

  it("UT-KAL-024 [Positif] hitungPembimbinganTugasAkhir: pembimbing pendamping laporan akhir studi empat mahasiswa", async function () {
    const k = await kalkulatorBaru();
    assert.equal(await k.hitungPembimbinganTugasAkhir(PENDAMPING, TUGAS_AKHIR, 4), 100n);
  });

  it("UT-KAL-025 [Negatif] hitungPembimbinganTugasAkhir: nol mahasiswa ditolak", async function () {
    const k = await kalkulatorBaru();
    await assert.rejects(k.hitungPembimbinganTugasAkhir(UTAMA, SKRIPSI, 0), /InputTidakValid/);
  });

  it("UT-KAL-026 [Positif] hitungPengujiUjianAkhir: ketua penguji empat mahasiswa", async function () {
    const k = await kalkulatorBaru();
    assert.equal(await k.hitungPengujiUjianAkhir(KETUA, 4), 200n);
  });

  it("UT-KAL-027 [Positif] hitungPengujiUjianAkhir: anggota penguji empat mahasiswa", async function () {
    const k = await kalkulatorBaru();
    assert.equal(await k.hitungPengujiUjianAkhir(ANGGOTA, 4), 100n);
  });

  it("UT-KAL-028 [Negatif] hitungPengujiUjianAkhir: nol mahasiswa ditolak", async function () {
    const k = await kalkulatorBaru();
    await assert.rejects(k.hitungPengujiUjianAkhir(ANGGOTA, 0), /InputTidakValid/);
  });

  it("UT-KAL-029 [Positif] hitungPembinaKegiatanMahasiswa: satu semester", async function () {
    const k = await kalkulatorBaru();
    assert.equal(await k.hitungPembinaKegiatanMahasiswa(1), 200n);
  });

  it("UT-KAL-030 [Negatif] hitungPembinaKegiatanMahasiswa: nol semester ditolak", async function () {
    const k = await kalkulatorBaru();
    await assert.rejects(k.hitungPembinaKegiatanMahasiswa(0), /InputTidakValid/);
  });

  it("UT-KAL-031 [Positif] hitungJabatanPimpinanPerguruanTinggi: rektor satu semester", async function () {
    const k = await kalkulatorBaru();
    assert.equal(await k.hitungJabatanPimpinanPerguruanTinggi(REKTOR, 1), 600n);
  });

  it("UT-KAL-032 [Positif] hitungJabatanPimpinanPerguruanTinggi: ketua jurusan satu semester", async function () {
    const k = await kalkulatorBaru();
    assert.equal(await k.hitungJabatanPimpinanPerguruanTinggi(KETUA_JURUSAN, 1), 300n);
  });

  it("UT-KAL-033 [Negatif] hitungJabatanPimpinanPerguruanTinggi: nol semester ditolak", async function () {
    const k = await kalkulatorBaru();
    await assert.rejects(k.hitungJabatanPimpinanPerguruanTinggi(REKTOR, 0), /InputTidakValid/);
  });

  it("UT-KAL-034 [Positif] jumlahkanSKS: rekapitulasi 300, 150, 200", async function () {
    const k = await kalkulatorBaru();
    assert.equal(await k.jumlahkanSKS([300, 150, 200]), 650n);
  });

  it("UT-KAL-035 [Edge] jumlahkanSKS: daftar kosong", async function () {
    const k = await kalkulatorBaru();
    assert.equal(await k.jumlahkanSKS([]), 0n);
  });

  it("UT-KAL-036 [Edge] hitungPengajaran: tiga pemanggilan dengan parameter identik mengembalikan nilai identik", async function () {
    const k = await kalkulatorBaru();
    // bobot 3, realisasi penuh, pengampuan bersama porsi 30: (300 * 30) / 100 = 90
    const hasil = [];
    for (let i = 0; i < 3; i++) {
      hasil.push(await k.hitungPengajaran(3, 16, 16, true, true, 30));
    }
    assert.deepEqual(hasil, [90n, 90n, 90n]);
  });
});
