-- ============================================================================
-- SEED SQL untuk DBeaver (tanpa terminal/Prisma). Selaras dengan seed.mjs terbaru.
-- Jalankan SETELAH ketiga migration:
--   1) 20260622075304_init
--   2) 20260719000000_lkd_dua_asesor_flow
--   3) 20260720000000_fase_klaim_pengesahan
-- Idempoten (ON CONFLICT DO NOTHING). Password: admin123/dosen123/asesor123 (bcrypt).
-- Isi: HANYA data master + portofolio PDDikti belum diklaim (tanpa dummy penilaian/mint).
-- ============================================================================

-- PENGGUNA
INSERT INTO "pengguna" ("id_pengguna","nama","email","password_hash","peran","aktif","alamat_wallet","wallet_index","nidn","program_studi","jabatan_fungsional","nira","kelompok_bidang") VALUES
('10000000-0000-0000-0000-000000000001','Administrator Sistem','admin@polban.ac.id','$2b$10$D2vIqydMgrAUaXxLKDzUi.Ud2YoaFkBDWsdF4TIfrlcEdZ4v26SNe','admin',true,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
('10000000-0000-0000-0000-000000000002','Dosen Satu','dosen1@polban.ac.id','$2b$10$2i9wSi0jAu/37j3JzNrF6eBh0/zD8qvic2TEYIlyaW2f.VH/FGeQO','dosen',true,'0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',0,'0000000001','D3 Teknik Informatika','Lektor',NULL,NULL),
('10000000-0000-0000-0000-000000000003','Dosen Dua','dosen2@polban.ac.id','$2b$10$2i9wSi0jAu/37j3JzNrF6eBh0/zD8qvic2TEYIlyaW2f.VH/FGeQO','dosen',true,'0x70997970C51812dc3A010C7d01b50e0d17dc79C8',1,'0000000002','D3 Teknik Informatika','Asisten Ahli',NULL,NULL),
('10000000-0000-0000-0000-000000000004','Asesor Satu','asesor1@polban.ac.id','$2b$10$mwow8JsSnbw46Jv8KDaSe.tJcwyhU2.hT.Qw3KAlTnq/8ijHHKQKi','asesor',true,NULL,NULL,NULL,NULL,NULL,'000000000000000001','Teknik Informatika'),
('10000000-0000-0000-0000-000000000005','Asesor Dua','asesor2@polban.ac.id','$2b$10$mwow8JsSnbw46Jv8KDaSe.tJcwyhU2.hT.Qw3KAlTnq/8ijHHKQKi','asesor',true,NULL,NULL,NULL,NULL,NULL,'000000000000000002','Teknik Informatika')
ON CONFLICT ("id_pengguna") DO NOTHING;

-- PERIODE + FASE (aktif override 'pengisian')
INSERT INTO "periode_bkd" ("id_periode","nama_periode","tahun_ajaran","semester","tanggal_mulai","tanggal_selesai","pengisian_mulai","pengisian_selesai","penilaian_mulai","penilaian_selesai","perbaikan_mulai","perbaikan_selesai","fase_override","status") VALUES
('20000000-0000-0000-0000-000000000001','2025/2026 Genap','2025/2026','Genap','2026-02-02','2026-07-31','2026-06-01','2026-07-31','2026-08-01','2026-08-20','2026-08-21','2026-08-31','pengisian','aktif'),
('20000000-0000-0000-0000-000000000002','2025/2026 Ganjil','2025/2026','Ganjil','2025-09-01','2026-01-31',NULL,NULL,NULL,NULL,NULL,NULL,'selesai','nonaktif')
ON CONFLICT ("id_periode") DO NOTHING;

-- REFERENSI KEGIATAN A-N
INSERT INTO "referensi_kegiatan" ("id_referensi","kode_rule","kategori","nama_kegiatan","fungsi_contract","skema_parameter","keterangan") VALUES
('30000000-0000-0000-0000-000000000001','EDU001','Pendidikan Formal','Menempuh pendidikan formal doktor','hitungPendidikanFormalDoktor','{"fields":[{"name":"jumlahSemester","label":"Jumlah Semester","type":"number","required":true}]}',NULL),
('30000000-0000-0000-0000-000000000002','EDU101','A. Melaksanakan perkuliahan/tutorial/praktikum','Melaksanakan perkuliahan (tutorial, tatap muka/daring) dan membimbing, menguji, serta menyelenggarakan pendidikan di laboratorium/studio/bengkel','hitungPengajaran','{"fields":[{"name":"sksMataKuliah","label":"SKS Mata Kuliah","type":"number","required":true},{"name":"jumlahPertemuanRencana","label":"Jumlah Pertemuan Rencana","type":"number","required":true},{"name":"jumlahPertemuanRealisasi","label":"Jumlah Pertemuan Realisasi","type":"number","required":true},{"name":"semesterPenuh","label":"Satu Semester Penuh","type":"boolean","required":true},{"name":"teamTeaching","label":"Team Teaching","type":"boolean","required":true},{"name":"persenPorsiDosen","label":"Persentase Porsi Dosen (%)","type":"number","required":true}]}',NULL),
('30000000-0000-0000-0000-000000000003','EDU201','B. Membimbing seminar mahasiswa','Membimbing seminar mahasiswa','hitungBimbinganSeminarMahasiswa','{"fields":[{"name":"jumlahSemester","label":"Jumlah Semester","type":"number","required":true}]}',NULL),
('30000000-0000-0000-0000-000000000004','EDU202','C. Membimbing KKN/PKN/PKL','Membimbing Kuliah Kerja Nyata, Praktek Kerja Nyata, Praktek Kerja Lapangan, termasuk membimbing pelatihan militer, wirausaha, magang','hitungBimbinganKKNPKLMagang','{"fields":[{"name":"jumlahSemester","label":"Jumlah Semester","type":"number","required":true}]}',NULL),
('30000000-0000-0000-0000-000000000005','EDU203','D. Membimbing tugas akhir','Membimbing dan ikut membimbing dalam menghasilkan disertasi, tesis, skripsi dan laporan akhir studi','hitungPembimbinganTugasAkhir','{"fields":[{"name":"peran","label":"Peran Pembimbing","type":"select","options":["PembimbingUtama","PembimbingPendamping"],"required":true},{"name":"jenisTugasAkhir","label":"Jenis Tugas Akhir","type":"select","options":["Disertasi","Tesis","Skripsi","TugasAkhir"],"required":true},{"name":"jumlahMahasiswa","label":"Jumlah Mahasiswa","type":"number","required":true}]}',NULL),
('30000000-0000-0000-0000-000000000006','EDU301','E. Penguji ujian akhir','Bertugas sebagai penguji pada ujian akhir/profesi','hitungPengujiUjianAkhir','{"fields":[{"name":"peranPenguji","label":"Peran Penguji","type":"select","options":["Ketua","Anggota"],"required":true},{"name":"jumlahMahasiswa","label":"Jumlah Mahasiswa","type":"number","required":true}]}',NULL),
('30000000-0000-0000-0000-000000000007','EDU401','F. Membina kegiatan mahasiswa','Membina kegiatan mahasiswa di bidang akademik dan kemahasiswaan (PA, BEM, Maperwa, dan lain-lain)','hitungPembinaKegiatanMahasiswa','{"fields":[{"name":"jumlahSemester","label":"Jumlah Semester","type":"number","required":true}]}',NULL),
('30000000-0000-0000-0000-000000000008','EDU402','F. Membina kegiatan mahasiswa','Membimbing mahasiswa menghasilkan produk saintifik / mengikuti kompetisi di bidang akademik dan kemahasiswaan',NULL,'{"fields":[{"name":"deskripsi","label":"Deskripsi Kegiatan","type":"text","required":true}]}','Nilai SKS maksimum pada PO BKD 2021 - dinilai langsung oleh asesor.'),
('30000000-0000-0000-0000-000000000009','EDU501','G. Pengembangan program kuliah','Melakukan kegiatan pengembangan program kuliah tatap muka/daring (RPS, perangkat pembelajaran)','hitungPengembanganProgramKuliah','{"fields":[{"name":"jumlahSemester","label":"Jumlah Semester","type":"number","required":true}]}',NULL),
('30000000-0000-0000-0000-000000000010','EDU502','H. Mengembangkan bahan kuliah','Mengembangkan bahan ajar (buku ajar, modul/pedoman, bahan ajar lain)','hitungPengembanganBahanAjar','{"fields":[{"name":"jenisBahanAjar","label":"Jenis Bahan Ajar","type":"select","options":["BukuAjar","ModulPedoman","BahanAjarLain"],"required":true},{"name":"jumlahNaskah","label":"Jumlah Naskah","type":"number","required":true},{"name":"peranTim","label":"Peran dalam Tim","type":"select","options":["Individu","Ketua","Anggota"],"required":true},{"name":"jumlahAnggotaTim","label":"Jumlah Anggota Tim","type":"number","required":true}]}',NULL),
('30000000-0000-0000-0000-000000000011','EDU601','I. Menyampaikan orasi ilmiah','Menyampaikan orasi ilmiah','hitungOrasiIlmiah','{"fields":[{"name":"jumlahOrasi","label":"Jumlah Orasi","type":"number","required":true}]}',NULL),
('30000000-0000-0000-0000-000000000012','EDU701','J. Jabatan pimpinan perguruan tinggi','Menduduki jabatan pimpinan perguruan tinggi','hitungJabatanPimpinanPerguruanTinggi','{"fields":[{"name":"jabatan","label":"Jabatan","type":"select","options":["Rektor","KepalaLLDIKTI_WakilRektor_DirekturPascasarjana_KetuaSekolah","KetuaSenat","WakilKetuaSekolahTinggi_WakilDirekturPoliteknik_Akademi_DirekturAkademi","WakilDirekturAkademik_SekretarisLembaga_KetuaJurusan_Departemen","BagianProgramStudi_KepalaLaboratorium_SekretarisJurusanDepartemen"],"required":true},{"name":"jumlahSemester","label":"Jumlah Semester","type":"number","required":true}]}',NULL),
('30000000-0000-0000-0000-000000000013','EDU801','K. Membimbing dosen lebih rendah jabatan','Membimbing dosen yang lebih rendah jabatannya','hitungMembimbingDosenLebihRendah','{"fields":[{"name":"jenis","label":"Jenis Bimbingan","type":"select","options":["Pencangkokan","Reguler"],"required":true},{"name":"jumlahOrang","label":"Jumlah Dosen Dibimbing","type":"number","required":true},{"name":"jumlahSemester","label":"Jumlah Semester","type":"number","required":true}]}',NULL),
('30000000-0000-0000-0000-000000000014','EDU802','L. Detasering dan pencangkokan','Melaksanakan kegiatan detasering dan pencangkokan di luar institusi','hitungDetaseringPencangkokan','{"fields":[{"name":"lokasi","label":"Lokasi Institusi","type":"select","options":["InstitusiQS100","InstitusiNasional"],"required":true},{"name":"jumlahKegiatan","label":"Jumlah Kegiatan","type":"number","required":true}]}',NULL),
('30000000-0000-0000-0000-000000000015','EDU901','M. Pendampingan mahasiswa luar institusi','Melaksanakan kegiatan pendampingan mahasiswa di luar institusi sesuai kebijakan Kementerian','hitungPendampinganMahasiswaLuarInstitusi','{"fields":[{"name":"jenjang","label":"Jenjang Dosen","type":"select","options":["LektorKeAtas","AsistenAhli_DosenLain"],"required":true},{"name":"jumlahSemester","label":"Jumlah Semester","type":"number","required":true}]}',NULL),
('30000000-0000-0000-0000-000000000016','EDU902','N. Pengembangan diri/sertifikasi','Melakukan kegiatan pengembangan diri untuk meningkatkan kompetensi / memperoleh sertifikasi profesi (pelatihan dasar/prajabatan)','hitungPelatihanDasar','{"fields":[{"name":"jumlahSertifikat","label":"Jumlah Sertifikat","type":"number","required":true}]}',NULL)
ON CONFLICT ("kode_rule") DO NOTHING;

-- LKD laporan dosen1 (periode aktif) + penugasan 2 asesor
INSERT INTO "lkd" ("id_lkd","id_pengguna","id_periode","jenis","status","simpan_permanen") VALUES
('40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','laporan','draft',false)
ON CONFLICT ("id_lkd") DO NOTHING;

INSERT INTO "penugasan_asesor" ("id_penugasan","id_lkd","id_asesor","urutan","disahkan") VALUES
('50000000-0000-0000-0000-000000000003','40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000004',1,false),
('50000000-0000-0000-0000-000000000004','40000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000005',2,false)
ON CONFLICT ("id_penugasan") DO NOTHING;

-- Portofolio PDDikti (belum diklaim) - bukan dummy teks, data feeder menunggu klaim
INSERT INTO "kegiatan" ("id_kegiatan","id_lkd","id_referensi","judul","detail_kegiatan","parameter","sks_dihitung_x100","status_perhitungan","status","status_capaian","sumber_data","diklaim") VALUES
('60000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002','Basis Data / 2CTI3','{"kelas":"2CTI3","jenis_mata_kuliah":"Wajib","bidang_keilmuan":"Rekayasa Perangkat Lunak","jumlah_mahasiswa":28}','{"sksMataKuliah":3,"jumlahPertemuanRencana":16,"jumlahPertemuanRealisasi":16,"semesterPenuh":true,"teamTeaching":false,"persenPorsiDosen":100}',300,'berhasil','diajukan',NULL,'pddikti',false),
('60000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002','Pemrograman Web / 1ATI2','{"kelas":"1ATI2","jenis_mata_kuliah":"Wajib","bidang_keilmuan":"Rekayasa Perangkat Lunak","jumlah_mahasiswa":30}','{"sksMataKuliah":3,"jumlahPertemuanRencana":16,"jumlahPertemuanRealisasi":16,"semesterPenuh":true,"teamTeaching":false,"persenPorsiDosen":100}',300,'berhasil','diajukan',NULL,'pddikti',false),
('60000000-0000-0000-0000-000000000003','40000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000005','Bimbingan TA - Andi Pratama','{"bidang_keilmuan":"Sistem Informasi"}','{"peran":"PembimbingUtama","jenisTugasAkhir":"TugasAkhir","jumlahMahasiswa":1}',50,'berhasil','diajukan',NULL,'pddikti',false),
('60000000-0000-0000-0000-000000000004','40000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000006','Penguji Sidang TA (4 mahasiswa)','{"bidang_keilmuan":"Sistem Informasi","jenis_pengujian":"Sidang Tugas Akhir"}','{"peranPenguji":"Ketua","jumlahMahasiswa":4}',200,'berhasil','diajukan',NULL,'pddikti',false)
ON CONFLICT ("id_kegiatan") DO NOTHING;
