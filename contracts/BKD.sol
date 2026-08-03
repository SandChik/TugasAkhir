// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title KalkulatorBKDPendidikan
 * @notice Prototype smart contract untuk perhitungan BKD unsur pendidikan.
 * @dev Seluruh nilai SKS direpresentasikan dalam skala x100.
 *
 * Contoh:
 * 1.00 SKS = 100
 * 0.50 SKS = 50
 * 1.33 SKS = 133
 *
 * Catatan batasan:
 * Fungsi yang memiliki karakter "nilai maksimum" dan masih membutuhkan
 * penilaian kualitatif asesor tidak dimasukkan ke dalam kontrak ini.
 */
contract KalkulatorBKDPendidikan {
    error InputTidakValid(string alasan);

    // =========================================================
    // ENUM
    // =========================================================

    enum JenisTugasAkhir {
        Disertasi,
        Tesis,
        Skripsi,
        TugasAkhir
    }

    enum PeranPembimbing {
        PembimbingUtama,
        PembimbingPendamping
    }

    enum PeranPenguji {
        Ketua,
        Anggota
    }

    enum JenisBahanAjar {
        BukuAjar,
        ModulPedoman,
        BahanAjarLain
    }

    enum PeranTimBahanAjar {
        Individu,
        Ketua,
        Anggota
    }

    enum JabatanPimpinanPT {
        Rektor,
        KepalaLLDIKTI_WakilRektor_DirekturPascasarjana_KetuaSekolah,
        KetuaSenat,
        WakilKetuaSekolahTinggi_WakilDirekturPoliteknik_Akademi_DirekturAkademi,
        WakilDirekturAkademik_SekretarisLembaga_KetuaJurusan_Departemen,
        BagianProgramStudi_KepalaLaboratorium_SekretarisJurusanDepartemen
    }

    enum JenisBimbingDosen {
        Pencangkokan,
        Reguler
    }

    enum LokasiDetasering {
        InstitusiQS100,
        InstitusiNasional
    }

    enum JenjangDosenPendamping {
        LektorKeAtas,
        AsistenAhli_DosenLain
    }

    // =========================================================
    // BAGIAN A - PENDIDIKAN FORMAL
    // =========================================================

    /**
     * @notice Menempuh pendidikan formal doktor.
     * @dev 12 SKS per semester.
     */
    function hitungPendidikanFormalDoktor(
        uint256 jumlahSemester
    ) public pure returns (uint256 sksX100) {
        if (jumlahSemester == 0) {
            revert InputTidakValid("jumlahSemester harus > 0");
        }

        return jumlahSemester * 1200;
    }

    /**
     * @notice Mengikuti pelatihan dasar/prajabatan.
     * @dev 2 SKS per sertifikat.
     */
    function hitungPelatihanDasar(
        uint256 jumlahSertifikat
    ) public pure returns (uint256 sksX100) {
        if (jumlahSertifikat == 0) {
            revert InputTidakValid("jumlahSertifikat harus > 0");
        }

        return jumlahSertifikat * 200;
    }

    // =========================================================
    // BAGIAN B - PELAKSANAAN PENDIDIKAN
    // =========================================================

    /**
     * @notice Pengajaran/perkuliahan/tutorial/praktikum/studio/daring.
     * @dev Valid jika minimal 50% pertemuan terlaksana.
     *      Jika team teaching, nilai dibagi sesuai porsi dosen.
     */
    function hitungPengajaran(
        uint256 sksMataKuliah,
        uint256 jumlahPertemuanRencana,
        uint256 jumlahPertemuanRealisasi,
        bool semesterPenuh,
        bool teamTeaching,
        uint256 persenPorsiDosen
    ) public pure returns (uint256 sksX100) {
        if (sksMataKuliah == 0) {
            revert InputTidakValid("sksMataKuliah harus > 0");
        }

        if (jumlahPertemuanRencana == 0) {
            revert InputTidakValid("jumlahPertemuanRencana harus > 0");
        }

        if (jumlahPertemuanRealisasi > jumlahPertemuanRencana) {
            revert InputTidakValid("jumlahPertemuanRealisasi tidak valid");
        }

        uint256 persentaseRealisasi =
            (jumlahPertemuanRealisasi * 100) / jumlahPertemuanRencana;

        if (persentaseRealisasi < 50) {
            return 0;
        }

        if (!semesterPenuh) {
            return 0;
        }

        uint256 sksDasarX100 =
            (sksMataKuliah * 100 * jumlahPertemuanRealisasi)
            / jumlahPertemuanRencana;

        if (teamTeaching) {
            if (persenPorsiDosen == 0 || persenPorsiDosen > 100) {
                revert InputTidakValid("persenPorsiDosen harus 1..100");
            }

            return (sksDasarX100 * persenPorsiDosen) / 100;
        }

        return sksDasarX100;
    }

    /**
     * @notice Pendidikan dokter: evaluasi peserta didik.
     * @dev 4 SKS.
     */
    function hitungPendidikanDokterEvaluasiPeserta()
        public
        pure
        returns (uint256 sksX100)
    {
        return 400;
    }

    /**
     * @notice Pendidikan dokter: komunikasi spesialis.
     * @dev 2 SKS.
     */
    function hitungPendidikanDokterKomunikasiSpesialis()
        public
        pure
        returns (uint256 sksX100)
    {
        return 200;
    }

    /**
     * @notice Pendidikan dokter: pelaksanaan pembelajaran dengan pembimbing.
     * @dev 3 SKS.
     */
    function hitungPendidikanDokterPelaksanaanPembelajaran()
        public
        pure
        returns (uint256 sksX100)
    {
        return 300;
    }

    /**
     * @notice Pendidikan dokter: pengambilan keputusan klinis akhir.
     * @dev 1 SKS.
     */
    function hitungPendidikanDokterKeputusanKlinisAkhir()
        public
        pure
        returns (uint256 sksX100)
    {
        return 100;
    }

    /**
     * @notice Membimbing seminar mahasiswa.
     * @dev 1 SKS per semester.
     */
    function hitungBimbinganSeminarMahasiswa(
        uint256 jumlahSemester
    ) public pure returns (uint256 sksX100) {
        if (jumlahSemester == 0) {
            revert InputTidakValid("jumlahSemester harus > 0");
        }

        return jumlahSemester * 100;
    }

    /**
     * @notice Membimbing KKN/PKL/PKN/praktik kerja/magang/wirausaha.
     * @dev 2 SKS per semester.
     */
    function hitungBimbinganKKNPKLMagang(
        uint256 jumlahSemester
    ) public pure returns (uint256 sksX100) {
        if (jumlahSemester == 0) {
            revert InputTidakValid("jumlahSemester harus > 0");
        }

        return jumlahSemester * 200;
    }

    /**
     * @notice Membimbing dan ikut membimbing tugas akhir.
     */
    function hitungPembimbinganTugasAkhir(
        PeranPembimbing peran,
        JenisTugasAkhir jenisTugasAkhir,
        uint256 jumlahMahasiswa
    ) public pure returns (uint256 sksX100) {
        if (jumlahMahasiswa == 0) {
            revert InputTidakValid("jumlahMahasiswa harus > 0");
        }

        uint256 nilaiPerMahasiswaX100;

        if (peran == PeranPembimbing.PembimbingUtama) {
            if (jenisTugasAkhir == JenisTugasAkhir.Disertasi) {
                nilaiPerMahasiswaX100 = 133;
            } else if (jenisTugasAkhir == JenisTugasAkhir.Tesis) {
                nilaiPerMahasiswaX100 = 100;
            } else if (jenisTugasAkhir == JenisTugasAkhir.Skripsi) {
                nilaiPerMahasiswaX100 = 50;
            } else if (jenisTugasAkhir == JenisTugasAkhir.TugasAkhir) {
                nilaiPerMahasiswaX100 = 50;
            }
        } else {
            if (jenisTugasAkhir == JenisTugasAkhir.Disertasi) {
                nilaiPerMahasiswaX100 = 100;
            } else if (jenisTugasAkhir == JenisTugasAkhir.Tesis) {
                nilaiPerMahasiswaX100 = 75;
            } else if (jenisTugasAkhir == JenisTugasAkhir.Skripsi) {
                nilaiPerMahasiswaX100 = 25;
            } else if (jenisTugasAkhir == JenisTugasAkhir.TugasAkhir) {
                nilaiPerMahasiswaX100 = 25;
            }
        }

        return nilaiPerMahasiswaX100 * jumlahMahasiswa;
    }

    /**
     * @notice Bertugas sebagai penguji pada ujian akhir/profesi.
     */
    function hitungPengujiUjianAkhir(
        PeranPenguji peranPenguji,
        uint256 jumlahMahasiswa
    ) public pure returns (uint256 sksX100) {
        if (jumlahMahasiswa == 0) {
            revert InputTidakValid("jumlahMahasiswa harus > 0");
        }

        if (peranPenguji == PeranPenguji.Ketua) {
            return jumlahMahasiswa * 50;
        }

        return jumlahMahasiswa * 25;
    }

    /**
     * @notice Membina kegiatan mahasiswa di bidang akademik dan kemahasiswaan.
     * @dev 2 SKS per semester.
     *
     * Catatan:
     * Fungsi membimbing produk saintifik dan prestasi kompetisi tidak dimasukkan
     * karena pada aturan PO BKD nilainya merupakan SKS maksimum.
     */
    function hitungPembinaKegiatanMahasiswa(
        uint256 jumlahSemester
    ) public pure returns (uint256 sksX100) {
        if (jumlahSemester == 0) {
            revert InputTidakValid("jumlahSemester harus > 0");
        }

        return jumlahSemester * 200;
    }

    /**
     * @notice Mengembangkan program kuliah/praktikum/modul.
     * @dev 0,5 SKS per semester.
     */
    function hitungPengembanganProgramKuliah(
        uint256 jumlahSemester
    ) public pure returns (uint256 sksX100) {
        if (jumlahSemester == 0) {
            revert InputTidakValid("jumlahSemester harus > 0");
        }

        return jumlahSemester * 50;
    }

    /**
     * @notice Mengembangkan bahan ajar.
     * @dev Buku ajar = 5 SKS, Modul/Pedoman = 5 SKS,
     *      Bahan ajar lain = 2 SKS.
     *
     * Aturan karya tim:
     * - Individu: 100%
     * - Ketua tim: 60%
     * - Anggota tim: 40% dibagi jumlah anggota
     */
    function hitungPengembanganBahanAjar(
        JenisBahanAjar jenisBahanAjar,
        uint256 jumlahNaskah,
        PeranTimBahanAjar peranTim,
        uint256 jumlahAnggotaTim
    ) public pure returns (uint256 sksX100) {
        if (jumlahNaskah == 0) {
            revert InputTidakValid("jumlahNaskah harus > 0");
        }

        uint256 nilaiDasarX100;

        if (
            jenisBahanAjar == JenisBahanAjar.BukuAjar ||
            jenisBahanAjar == JenisBahanAjar.ModulPedoman
        ) {
            nilaiDasarX100 = 500;
        } else {
            nilaiDasarX100 = 200;
        }

        uint256 totalDasarX100 = nilaiDasarX100 * jumlahNaskah;

        if (peranTim == PeranTimBahanAjar.Individu) {
            return totalDasarX100;
        }

        if (peranTim == PeranTimBahanAjar.Ketua) {
            return (totalDasarX100 * 60) / 100;
        }

        if (peranTim == PeranTimBahanAjar.Anggota) {
            if (jumlahAnggotaTim == 0) {
                revert InputTidakValid("jumlahAnggotaTim harus > 0");
            }

            return ((totalDasarX100 * 40) / 100) / jumlahAnggotaTim;
        }

        revert InputTidakValid("peranTim tidak valid");
    }

    /**
     * @notice Menyampaikan orasi ilmiah.
     * @dev 1 SKS per orasi.
     */
    function hitungOrasiIlmiah(
        uint256 jumlahOrasi
    ) public pure returns (uint256 sksX100) {
        if (jumlahOrasi == 0) {
            revert InputTidakValid("jumlahOrasi harus > 0");
        }

        return jumlahOrasi * 100;
    }

    /**
     * @notice Menduduki jabatan pimpinan perguruan tinggi.
     */
    function hitungJabatanPimpinanPerguruanTinggi(
        JabatanPimpinanPT jabatan,
        uint256 jumlahSemester
    ) public pure returns (uint256 sksX100) {
        if (jumlahSemester == 0) {
            revert InputTidakValid("jumlahSemester harus > 0");
        }

        uint256 nilaiPerSemesterX100;

        if (jabatan == JabatanPimpinanPT.Rektor) {
            nilaiPerSemesterX100 = 600;
        } else if (
            jabatan ==
            JabatanPimpinanPT.KepalaLLDIKTI_WakilRektor_DirekturPascasarjana_KetuaSekolah
        ) {
            nilaiPerSemesterX100 = 500;
        } else if (jabatan == JabatanPimpinanPT.KetuaSenat) {
            nilaiPerSemesterX100 = 400;
        } else if (
            jabatan ==
            JabatanPimpinanPT.WakilKetuaSekolahTinggi_WakilDirekturPoliteknik_Akademi_DirekturAkademi
        ) {
            nilaiPerSemesterX100 = 400;
        } else if (
            jabatan ==
            JabatanPimpinanPT.WakilDirekturAkademik_SekretarisLembaga_KetuaJurusan_Departemen
        ) {
            nilaiPerSemesterX100 = 300;
        } else if (
            jabatan ==
            JabatanPimpinanPT.BagianProgramStudi_KepalaLaboratorium_SekretarisJurusanDepartemen
        ) {
            nilaiPerSemesterX100 = 300;
        }

        return nilaiPerSemesterX100 * jumlahSemester;
    }

    /**
     * @notice Membimbing dosen yang lebih rendah jabatannya.
     * @dev Pencangkokan = 0,5 SKS per orang per semester.
     *      Reguler = 0,25 SKS per orang per semester.
     */
    function hitungMembimbingDosenLebihRendah(
        JenisBimbingDosen jenis,
        uint256 jumlahOrang,
        uint256 jumlahSemester
    ) public pure returns (uint256 sksX100) {
        if (jumlahOrang == 0) {
            revert InputTidakValid("jumlahOrang harus > 0");
        }

        if (jumlahSemester == 0) {
            revert InputTidakValid("jumlahSemester harus > 0");
        }

        if (jenis == JenisBimbingDosen.Pencangkokan) {
            return jumlahOrang * jumlahSemester * 50;
        }

        return jumlahOrang * jumlahSemester * 25;
    }

    /**
     * @notice Melaksanakan detasering/pencangkokan di luar institusi.
     * @dev Institusi QS100 = 6 SKS.
     *      Institusi nasional = 3 SKS.
     */
    function hitungDetaseringPencangkokan(
        LokasiDetasering lokasi,
        uint256 jumlahKegiatan
    ) public pure returns (uint256 sksX100) {
        if (jumlahKegiatan == 0) {
            revert InputTidakValid("jumlahKegiatan harus > 0");
        }

        if (lokasi == LokasiDetasering.InstitusiQS100) {
            return jumlahKegiatan * 600;
        }

        return jumlahKegiatan * 300;
    }

    /**
     * @notice Pendampingan mahasiswa di luar institusi.
     * @dev Lektor ke atas = 12 SKS per semester.
     *      Asisten ahli / dosen lain = 5 SKS per semester.
     */
    function hitungPendampinganMahasiswaLuarInstitusi(
        JenjangDosenPendamping jenjang,
        uint256 jumlahSemester
    ) public pure returns (uint256 sksX100) {
        if (jumlahSemester == 0) {
            revert InputTidakValid("jumlahSemester harus > 0");
        }

        if (jenjang == JenjangDosenPendamping.LektorKeAtas) {
            return jumlahSemester * 1200;
        }

        return jumlahSemester * 500;
    }

    // =========================================================
    // FUNGSI REKAP
    // =========================================================

    /**
     * @notice Menjumlahkan beberapa nilai SKS x100.
     */
    function jumlahkanSKS(
        uint256[] calldata daftarNilaiSKSX100
    ) public pure returns (uint256 totalSKSX100) {
        for (uint256 i = 0; i < daftarNilaiSKSX100.length; i++) {
            totalSKSX100 += daftarNilaiSKSX100[i];
        }
    }
}