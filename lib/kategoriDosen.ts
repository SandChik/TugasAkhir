/**
 * Pemetaan menu sidebar dosen -> kode rule referensi_kegiatan.
 * Satu halaman generik /dosen/[kategori] melayani semua kategori ini.
 */
export type KategoriDosen = {
  label: string;
  subtitle: string;
  kodeRules: string[];
  // R7: true = kegiatan lahir dari penugasan resmi (diinput admin / ekstraksi
  // SK-ST), bukan diisi sendiri oleh dosen.
  sumberPenugasan?: boolean;
};

export const KATEGORI_DOSEN: Record<string, KategoriDosen> = {
  "bimbingan-mahasiswa": {
    label: "Bimbingan Mahasiswa",
    subtitle: "Seminar, KKN/PKL/magang, dan pembimbingan tugas akhir",
    kodeRules: ["EDU201", "EDU202", "EDU203"],
    sumberPenugasan: true,
  },
  "pengujian-mahasiswa": {
    label: "Pengujian Mahasiswa",
    subtitle: "Bertugas sebagai penguji pada ujian akhir/profesi",
    kodeRules: ["EDU301"],
    sumberPenugasan: true,
  },
  "bahan-ajar": {
    label: "Bahan Ajar",
    subtitle: "Pengembangan program kuliah (RPS) dan bahan ajar",
    kodeRules: ["EDU501", "EDU502"],
  },
  "pembinaan-mahasiswa": {
    label: "Pembinaan Mahasiswa",
    subtitle: "Pembinaan kegiatan akademik dan kemahasiswaan",
    kodeRules: ["EDU401", "EDU402"],
    sumberPenugasan: true,
  },
  "tugas-tambahan": {
    label: "Tugas Tambahan",
    subtitle: "Jabatan pimpinan PT dan pendidikan formal",
    kodeRules: ["EDU701", "EDU001"],
  },
};

/**
 * R7: kegiatan yang HARUS diinput admin (menu "Input Kegiatan Dosen"), yaitu
 * kegiatan yang dasarnya penugasan institusi — dosen tidak boleh mengarang
 * sendiri beban perkuliahan, bimbingan, pengujian, dan pembinaannya.
 *
 * Nilai = slug kategori dosen; dipakai untuk memilih kolom detail
 * (`DETAIL_FIELDS`) yang tampil pada tabel menu dosen terkait.
 * Pengajaran tidak ada di `KATEGORI_DOSEN` karena punya halaman sendiri.
 */
export const KATEGORI_INPUT_ADMIN: Record<string, string> = {
  EDU101: "pengajaran",
  EDU201: "bimbingan-mahasiswa",
  EDU202: "bimbingan-mahasiswa",
  EDU203: "bimbingan-mahasiswa",
  EDU301: "pengujian-mahasiswa",
  EDU401: "pembinaan-mahasiswa",
  EDU402: "pembinaan-mahasiswa",
};

/** Label `kegiatan.sumber_data` untuk ditampilkan ke pengguna. */
export const SUMBER_LABEL: Record<string, string> = {
  manual: "Input dosen",
  admin: "Input admin",
  surat_tugas: "Ekstraksi SK/ST",
};
