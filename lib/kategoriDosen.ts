/**
 * Pemetaan menu sidebar dosen -> kode rule referensi_kegiatan.
 * Satu halaman generik /dosen/[kategori] melayani semua kategori ini.
 */
export type KategoriDosen = {
  label: string;
  subtitle: string;
  kodeRules: string[];
  // R7: true = data ditarik dari Feeder PDDikti (tidak bisa tambah manual)
  sumberPddikti?: boolean;
};

export const KATEGORI_DOSEN: Record<string, KategoriDosen> = {
  "bimbingan-mahasiswa": {
    label: "Bimbingan Mahasiswa",
    subtitle: "Seminar, KKN/PKL/magang, dan pembimbingan tugas akhir",
    kodeRules: ["EDU201", "EDU202", "EDU203"],
    sumberPddikti: true,
  },
  "pengujian-mahasiswa": {
    label: "Pengujian Mahasiswa",
    subtitle: "Bertugas sebagai penguji pada ujian akhir/profesi",
    kodeRules: ["EDU301"],
    sumberPddikti: true,
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
    sumberPddikti: true,
  },
  "tugas-tambahan": {
    label: "Tugas Tambahan",
    subtitle: "Jabatan pimpinan PT, pendidikan formal, dan pengembangan diri",
    kodeRules: ["EDU701", "EDU001", "EDU902"],
  },
};
