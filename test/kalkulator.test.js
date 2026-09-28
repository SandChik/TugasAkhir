/**
 * Modul: KalkulatorBKDPendidikan (contracts/BKD.sol)
 * Jumlah skenario: 36
 * Rincian kategori: Positif 18, Negatif 13, Edge 5
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Kalkulator BKD Pendidikan", function () {
  it("UT-KAL-01 [Positif] hitungPendidikanFormalDoktor: Menempuh pendidikan formal doktor dua semester dihitung 12 SKS per semester.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    // 2 semester x 1200 = 2400 (24,00 SKS)
    assert.equal(await kalkulator.hitungPendidikanFormalDoktor(2), 2400n);
  });

  it("UT-KAL-02 [Positif] hitungPelatihanDasar: Tiga sertifikat pelatihan dasar dihitung 2 SKS per sertifikat.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    // 3 sertifikat x 200 = 600 (6,00 SKS)
    assert.equal(await kalkulator.hitungPelatihanDasar(3), 600n);
  });

  it("UT-KAL-03 [Positif] hitungPengajaran: Pengajaran tanpa team teaching dengan realisasi pertemuan penuh bernilai penuh, dan bendera semesterPenuh false mengembalikan 0 tanpa revert.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    // realisasi penuh: persentase = (16 * 100) / 16 = 100, dasar = (3 * 100 * 16) / 16 = 300
    assert.equal(await kalkulator.hitungPengajaran(3, 16, 16, true, false, 0), 300n);
    // bendera semesterPenuh false menghentikan perhitungan dengan nilai 0, bukan revert
    assert.equal(await kalkulator.hitungPengajaran(3, 16, 16, false, false, 0), 0n);
  });

  it("UT-KAL-04 [Positif] hitungPengajaran: Pengajaran team teaching membagi nilai dasar sesuai porsi dosen.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    // dasar = (2 * 100 * 14) / 14 = 200, porsi 50 persen: (200 * 50) / 100 = 100
    assert.equal(await kalkulator.hitungPengajaran(2, 14, 14, true, true, 50), 100n);
  });

  it("UT-KAL-05 [Positif] hitungPendidikanDokterEvaluasiPeserta, hitungPendidikanDokterKomunikasiSpesialis, hitungPendidikanDokterPelaksanaanPembelajaran, hitungPendidikanDokterKeputusanKlinisAkhir: Keempat butir pendidikan dokter tanpa argumen mengembalikan konstanta SKS masing-masing.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    // keempat butir pendidikan dokter bernilai konstan, tanpa parameter
    assert.equal(await kalkulator.hitungPendidikanDokterEvaluasiPeserta(), 400n);
    assert.equal(await kalkulator.hitungPendidikanDokterKomunikasiSpesialis(), 200n);
    assert.equal(await kalkulator.hitungPendidikanDokterPelaksanaanPembelajaran(), 300n);
    assert.equal(await kalkulator.hitungPendidikanDokterKeputusanKlinisAkhir(), 100n);
  });

  it("UT-KAL-06 [Negatif] hitungPengajaran: SKS mata kuliah nol ditolak sebelum perhitungan berjalan.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    // guard pertama: sksMataKuliah nol ditolak sebelum aritmetika apa pun
    await assert.rejects(kalkulator.hitungPengajaran(0, 16, 16, true, false, 0), /InputTidakValid/);
  });

  it("UT-KAL-07 [Negatif] hitungPengajaran: Jumlah pertemuan rencana nol ditolak sehingga tidak terjadi pembagian dengan nol.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    // rencana nol ditolak lebih dulu sehingga pembagian dengan nol tidak pernah terjadi
    await assert.rejects(kalkulator.hitungPengajaran(3, 0, 0, true, false, 0), /InputTidakValid/);
  });

  it("UT-KAL-08 [Negatif] hitungPengajaran: Realisasi pertemuan melebihi rencana ditolak.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    // realisasi 17 melebihi rencana 16, kontrak menolak masukan
    await assert.rejects(kalkulator.hitungPengajaran(3, 16, 17, true, false, 0), /InputTidakValid/);
  });

  it("UT-KAL-09 [Negatif] hitungPengajaran: Porsi dosen di luar rentang 1..100 pada team teaching ditolak, diuji pada batas bawah dan batas atas.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    // realisasi penuh dan semesterPenuh true supaya eksekusi sampai ke guard persenPorsiDosen
    // porsi 0 berada di bawah rentang yang diizinkan
    await assert.rejects(kalkulator.hitungPengajaran(3, 16, 16, true, true, 0), /InputTidakValid/);
    // porsi 101 berada di atas rentang yang diizinkan
    await assert.rejects(kalkulator.hitungPengajaran(3, 16, 16, true, true, 101), /InputTidakValid/);
  });

  it("UT-KAL-10 [Negatif] hitungPendidikanFormalDoktor, hitungPelatihanDasar: Jumlah nol pada fungsi pendidikan formal ditolak, bukan menghasilkan nilai 0.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    // jumlah nol dianggap masukan tidak valid, bukan hasil perhitungan bernilai 0
    await assert.rejects(kalkulator.hitungPendidikanFormalDoktor(0), /InputTidakValid/);
    await assert.rejects(kalkulator.hitungPelatihanDasar(0), /InputTidakValid/);
  });

  it("UT-KAL-11 [Edge] hitungPengajaran: Realisasi tepat 50 persen tetap dihitung, satu pertemuan di bawahnya bernilai 0.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    // tepat di ambang: persentase = (8 * 100) / 16 = 50, dasar = (3 * 100 * 8) / 16 = 150
    assert.equal(await kalkulator.hitungPengajaran(3, 16, 8, true, false, 0), 150n);
    // satu pertemuan di bawah ambang: (7 * 100) / 16 = 43 (pembulatan ke bawah), nilai jadi 0
    assert.equal(await kalkulator.hitungPengajaran(3, 16, 7, true, false, 0), 0n);
  });

  it("UT-KAL-12 [Edge] hitungPengajaran: Dua pembagian integer berturut-turut membulatkan hasil ke bawah pada team teaching dengan porsi ganjil.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    // persentase = (9 * 100) / 16 = 56, lolos ambang 50
    // dasar = (3 * 100 * 9) / 16 = 2700 / 16 = 168 (dibulatkan ke bawah dari 168,75)
    // hasil = (168 * 33) / 100 = 5544 / 100 = 55 (dibulatkan ke bawah dari 55,44)
    assert.equal(await kalkulator.hitungPengajaran(3, 16, 9, true, true, 33), 55n);
  });

  it("UT-KAL-13 [Positif] hitungBimbinganSeminarMahasiswa: Bimbingan seminar mahasiswa dua semester bernilai 1 SKS per semester.", async function () {
    // 1 SKS per semester, 2 semester = 2 x 100 = 200
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    assert.equal(await kalkulator.hitungBimbinganSeminarMahasiswa(2), 200n);
  });

  it("UT-KAL-14 [Positif] hitungBimbinganKKNPKLMagang: Bimbingan KKN PKL magang tiga semester bernilai 2 SKS per semester.", async function () {
    // 2 SKS per semester, 3 semester = 3 x 200 = 600
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    assert.equal(await kalkulator.hitungBimbinganKKNPKLMagang(3), 600n);
  });

  it("UT-KAL-15 [Positif] hitungPembimbinganTugasAkhir: Pembimbing utama disertasi memakai tarif tertinggi pada matriks pembimbingan.", async function () {
    // PeranPembimbing.PembimbingUtama(0) + JenisTugasAkhir.Disertasi(0) = 133 per mahasiswa
    // 133 x 2 = 266
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    assert.equal(await kalkulator.hitungPembimbinganTugasAkhir(0, 0, 2), 266n);
  });

  it("UT-KAL-16 [Positif] hitungPembimbinganTugasAkhir: Pembimbing pendamping skripsi memakai tarif terendah pada matriks pembimbingan.", async function () {
    // PeranPembimbing.PembimbingPendamping(1) + JenisTugasAkhir.Skripsi(2) = 25 per mahasiswa
    // 25 x 4 = 100
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    assert.equal(await kalkulator.hitungPembimbinganTugasAkhir(1, 2, 4), 100n);
  });

  it("UT-KAL-17 [Positif] hitungPengujiUjianAkhir: Penguji berperan ketua pada ujian akhir tiga mahasiswa.", async function () {
    // PeranPenguji.Ketua(0) bernilai 50 per mahasiswa, 3 x 50 = 150
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    assert.equal(await kalkulator.hitungPengujiUjianAkhir(0, 3), 150n);
  });

  it("UT-KAL-18 [Positif] hitungPembinaKegiatanMahasiswa: Pembinaan kegiatan mahasiswa dua semester bernilai 2 SKS per semester.", async function () {
    // 2 SKS per semester, 2 semester = 2 x 200 = 400
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    assert.equal(await kalkulator.hitungPembinaKegiatanMahasiswa(2), 400n);
  });

  it("UT-KAL-19 [Positif] hitungPengembanganBahanAjar: Ketua tim buku ajar menerima porsi 60 persen dari nilai dasar naskah.", async function () {
    // JenisBahanAjar.BukuAjar(0) bernilai 500 per naskah, total dasar 500 x 1 = 500
    // porsi PeranTimBahanAjar.Ketua(1) = (500 x 60) / 100 = 300
    // cabang Ketua return lebih dulu, jadi jumlahAnggotaTim tidak diperiksa
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    assert.equal(await kalkulator.hitungPengembanganBahanAjar(0, 1, 1, 0), 300n);
  });

  it("UT-KAL-20 [Negatif] hitungPengembanganProgramKuliah: Pengembangan program kuliah dengan jumlah semester nol ditolak.", async function () {
    // guard jumlahSemester == 0 menolak pemanggilan sebelum perkalian tarif
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    await assert.rejects(kalkulator.hitungPengembanganProgramKuliah(0), /InputTidakValid/);
  });

  it("UT-KAL-21 [Negatif] hitungPembimbinganTugasAkhir: Pembimbingan tugas akhir tanpa mahasiswa bimbingan ditolak.", async function () {
    // guard jumlahMahasiswa == 0 dievaluasi sebelum matriks tarif
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    await assert.rejects(kalkulator.hitungPembimbinganTugasAkhir(0, 2, 0), /InputTidakValid/);
  });

  it("UT-KAL-22 [Negatif] hitungPengujiUjianAkhir: Penguji ujian akhir tanpa mahasiswa yang diuji ditolak.", async function () {
    // guard jumlahMahasiswa == 0 berlaku sebelum percabangan peran penguji
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    await assert.rejects(kalkulator.hitungPengujiUjianAkhir(1, 0), /InputTidakValid/);
  });

  it("UT-KAL-23 [Negatif] hitungPengembanganBahanAjar: Anggota tim bahan ajar tanpa jumlah anggota ditolak agar tidak terjadi pembagian nol.", async function () {
    // jumlahNaskah=2 lolos guard pertama, cabang PeranTimBahanAjar.Anggota(2)
    // memeriksa jumlahAnggotaTim sebelum membagi porsi 40 persen
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    await assert.rejects(kalkulator.hitungPengembanganBahanAjar(0, 2, 2, 0), /InputTidakValid/);
  });

  it("UT-KAL-24 [Edge] hitungPengembanganBahanAjar: Porsi anggota tim yang tidak habis dibagi dibulatkan ke bawah oleh pembagian integer.", async function () {
    // JenisBahanAjar.BahanAjarLain(2) bernilai 200 per naskah, total dasar 200 x 1 = 200
    // porsi anggota = (200 x 40) / 100 = 80, lalu 80 / 3 = 26 (pembagian integer, sisa dibuang)
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");
    assert.equal(await kalkulator.hitungPengembanganBahanAjar(2, 1, 2, 3), 26n);
  });

  it("UT-KAL-25 [Positif] hitungOrasiIlmiah: Menghitung SKS orasi ilmiah untuk empat kali orasi.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");

    // Tarif 1 SKS per orasi, jadi 4 x 100 = 400
    assert.equal(await kalkulator.hitungOrasiIlmiah(4), 400n);
  });

  it("UT-KAL-26 [Positif] hitungJabatanPimpinanPerguruanTinggi: Menghitung SKS jabatan tertinggi (Rektor) selama dua semester.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");

    // Rektor bertarif 600 per semester, jadi 600 x 2 = 1200
    assert.equal(await kalkulator.hitungJabatanPimpinanPerguruanTinggi(0, 2), 1200n);
  });

  it("UT-KAL-27 [Positif] hitungJabatanPimpinanPerguruanTinggi: Membedakan tarif tiga tingkat jabatan di bawah Rektor untuk satu semester.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");

    // Tarif per semester: indeks 1 = 500, indeks 2 = 400, indeks 5 = 300
    assert.equal(await kalkulator.hitungJabatanPimpinanPerguruanTinggi(1, 1), 500n);
    assert.equal(await kalkulator.hitungJabatanPimpinanPerguruanTinggi(2, 1), 400n);
    assert.equal(await kalkulator.hitungJabatanPimpinanPerguruanTinggi(5, 1), 300n);
  });

  it("UT-KAL-28 [Positif] hitungMembimbingDosenLebihRendah: Membedakan tarif bimbingan pencangkokan dan reguler untuk tiga orang selama dua semester.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");

    // Pencangkokan bertarif 50 per orang per semester, jadi 3 x 2 x 50 = 300
    assert.equal(await kalkulator.hitungMembimbingDosenLebihRendah(0, 3, 2), 300n);
    // Reguler bertarif 25 per orang per semester, jadi 3 x 2 x 25 = 150
    assert.equal(await kalkulator.hitungMembimbingDosenLebihRendah(1, 3, 2), 150n);
  });

  it("UT-KAL-29 [Positif] hitungDetaseringPencangkokan: Membedakan tarif detasering di institusi QS100 dan institusi nasional untuk dua kegiatan.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");

    // Institusi QS100 bertarif 600 per kegiatan, jadi 2 x 600 = 1200
    assert.equal(await kalkulator.hitungDetaseringPencangkokan(0, 2), 1200n);
    // Institusi nasional bertarif 300 per kegiatan, jadi 2 x 300 = 600
    assert.equal(await kalkulator.hitungDetaseringPencangkokan(1, 2), 600n);
  });

  it("UT-KAL-30 [Positif] hitungPendampinganMahasiswaLuarInstitusi: Membedakan tarif pendampingan menurut jenjang dosen selama dua semester.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");

    // Lektor ke atas bertarif 1200 per semester, jadi 2 x 1200 = 2400
    assert.equal(await kalkulator.hitungPendampinganMahasiswaLuarInstitusi(0, 2), 2400n);
    // Asisten ahli atau dosen lain bertarif 500 per semester, jadi 2 x 500 = 1000
    assert.equal(await kalkulator.hitungPendampinganMahasiswaLuarInstitusi(1, 2), 1000n);
  });

  it("UT-KAL-31 [Negatif] hitungOrasiIlmiah: Menolak jumlah orasi nol karena kegiatan tidak pernah terjadi.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");

    // Guard jumlahOrasi harus > 0 dieksekusi sebelum perkalian tarif
    await assert.rejects(kalkulator.hitungOrasiIlmiah(0), /InputTidakValid/);
  });

  it("UT-KAL-32 [Negatif] hitungJabatanPimpinanPerguruanTinggi: Menolak jumlah semester nol meskipun tingkat jabatan valid.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");

    // Guard jumlahSemester dicek lebih dulu, tarif jabatan tidak sempat dibaca
    await assert.rejects(kalkulator.hitungJabatanPimpinanPerguruanTinggi(0, 0), /InputTidakValid/);
  });

  it("UT-KAL-33 [Negatif] hitungMembimbingDosenLebihRendah: Menolak jumlah orang nol dan jumlah semester nol pada bimbingan dosen.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");

    // Guard jumlahOrang harus > 0
    await assert.rejects(kalkulator.hitungMembimbingDosenLebihRendah(0, 0, 2), /InputTidakValid/);
    // Guard jumlahSemester harus > 0
    await assert.rejects(kalkulator.hitungMembimbingDosenLebihRendah(1, 2, 0), /InputTidakValid/);
  });

  it("UT-KAL-34 [Negatif] hitungDetaseringPencangkokan: Menolak jumlah kegiatan nol pada detasering institusi QS100.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");

    // Guard jumlahKegiatan harus > 0 berlaku untuk semua lokasi
    await assert.rejects(kalkulator.hitungDetaseringPencangkokan(0, 0), /InputTidakValid/);
  });

  it("UT-KAL-35 [Edge] jumlahkanSKS: Merekap daftar kosong tanpa revert dan mengembalikan nol.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");

    // Daftar kosong: loop tidak berjalan sehingga total tetap 0
    assert.equal(await kalkulator.jumlahkanSKS([]), 0n);
  });

  it("UT-KAL-36 [Edge] jumlahkanSKS: Merekap daftar panjang berisi sepuluh nilai SKS x100.", async function () {
    const kalkulator = await ethers.deployContract("KalkulatorBKDPendidikan");

    // Sepuluh nilai dijumlahkan berurutan: total 2899
    const daftar = [100, 250, 50, 1200, 133, 25, 600, 75, 400, 66];
    assert.equal(await kalkulator.jumlahkanSKS(daftar), 2899n);
  });
});
