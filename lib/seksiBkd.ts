/**
 * Struktur seksi LKD Pelaksanaan Pendidikan — mengikuti 6 menu dosen
 * (orasi ilmiah, pembimbing dosen, detasering, visiting scientist dihapus).
 * Diklat prajabatan di paling atas, lalu huruf berurutan A..K tanpa loncat.
 */
export type SeksiBkd = {
  key: string;
  letter: string;
  title: string;
  kodeRules: string[];
  sumberTarik?: string; // label "Data diambil dari menu" (informatif)
};

export const SEKSI_BKD: SeksiBkd[] = [
  {
    key: "A",
    letter: "A",
    title: "Mengikuti diklat prajabatan golongan III",
    kodeRules: ["EDU902"],
    sumberTarik: "Kualifikasi > Diklat",
  },
  {
    key: "B",
    letter: "B",
    title:
      "Melaksanakan perkuliahan (tutorial, tatap muka, dan/atau daring) dan membimbing, menguji serta menyelenggarakan pendidikan di laboratorium sesuai penugasan",
    kodeRules: ["EDU101"],
    sumberTarik: "Pelaks. pendidikan > Pengajaran",
  },
  {
    key: "C",
    letter: "C",
    title: "Membimbing seminar mahasiswa",
    kodeRules: ["EDU201"],
    sumberTarik: "Pelaks. pendidikan > Bimbingan Mahasiswa",
  },
  {
    key: "D",
    letter: "D",
    title: "Membimbing Kuliah Kerja Nyata, Praktek Kerja Nyata, Praktek Kerja Lapangan",
    kodeRules: ["EDU202"],
    sumberTarik: "Pelaks. pendidikan > Bimbingan Mahasiswa",
  },
  {
    key: "E",
    letter: "E",
    title:
      "Membimbing dan ikut membimbing dalam menghasilkan disertasi, tesis, skripsi dan laporan akhir studi",
    kodeRules: ["EDU203"],
    sumberTarik: "Pelaks. pendidikan > Bimbingan Mahasiswa",
  },
  {
    key: "F",
    letter: "F",
    title: "Bertugas sebagai penguji pada ujian akhir/profesi",
    kodeRules: ["EDU301"],
    sumberTarik: "Pelaks. pendidikan > Pengujian Mahasiswa",
  },
  {
    key: "G",
    letter: "G",
    title: "Membina kegiatan mahasiswa di bidang akademik dan kemahasiswaan",
    kodeRules: ["EDU401", "EDU402"],
    sumberTarik: "Pelaks. pendidikan > Pembinaan Mahasiswa",
  },
  {
    key: "H",
    letter: "H",
    title:
      "Melakukan kegiatan pengembangan program kuliah tatap muka/daring (RPS, perangkat pembelajaran)",
    kodeRules: ["EDU501"],
    sumberTarik: "Pelaks. pendidikan > Bahan Ajar",
  },
  {
    key: "I",
    letter: "I",
    title: "Mengembangkan bahan kuliah",
    kodeRules: ["EDU502"],
    sumberTarik: "Pelaks. pendidikan > Bahan Ajar",
  },
  {
    key: "J",
    letter: "J",
    title: "Menduduki jabatan pimpinan perguruan tinggi",
    kodeRules: ["EDU701"],
    sumberTarik: "Pelaks. pendidikan > Tugas Tambahan",
  },
  {
    key: "K",
    letter: "K",
    title:
      "Melakukan kegiatan pengembangan diri untuk meningkatkan kompetensi/memperoleh sertifikasi profesi",
    kodeRules: ["EDU001"],
    sumberTarik: "Kualifikasi > Pendidikan Formal",
  },
];

export const CAPAIAN_LABEL: Record<string, string> = {
  selesai: "Selesai",
  gagal: "Gagal",
  beban_lebih: "Beban lebih",
};
