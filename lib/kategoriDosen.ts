/**
 * Pemetaan menu sidebar dosen -> kode rule referensi_kegiatan.
 * Satu halaman generik /dosen/[kategori] melayani semua kategori ini.
 */
export type KategoriDosen = {
  label: string;
  subtitle: string;
  kodeRules: string[];
};

export const KATEGORI_DOSEN: Record<string, KategoriDosen> = {
  "bimbingan-mahasiswa": {
    label: "Bimbingan Mahasiswa",
    subtitle: "Seminar, KKN/PKL/magang, dan pembimbingan tugas akhir",
    kodeRules: ["EDU201", "EDU202", "EDU203"],
  },
  "pengujian-mahasiswa": {
    label: "Pengujian Mahasiswa",
    subtitle: "Bertugas sebagai penguji pada ujian akhir/profesi",
    kodeRules: ["EDU301"],
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
  },
  "visiting-scientist": {
    label: "Visiting Scientist",
    subtitle: "Pendampingan mahasiswa di luar institusi sesuai kebijakan Kementerian",
    kodeRules: ["EDU901"],
  },
  detasering: {
    label: "Detasering",
    subtitle: "Detasering dan pencangkokan di luar institusi",
    kodeRules: ["EDU802"],
  },
  "orasi-ilmiah": {
    label: "Orasi Ilmiah",
    subtitle: "Menyampaikan orasi ilmiah",
    kodeRules: ["EDU601"],
  },
  "pembimbing-dosen": {
    label: "Pembimbing Dosen",
    subtitle: "Membimbing dosen yang lebih rendah jabatannya",
    kodeRules: ["EDU801"],
  },
  "tugas-tambahan": {
    label: "Tugas Tambahan",
    subtitle: "Jabatan pimpinan PT, pendidikan formal, dan pengembangan diri",
    kodeRules: ["EDU701", "EDU001", "EDU902"],
  },
};
