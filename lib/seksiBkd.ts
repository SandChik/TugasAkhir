/**
 * Struktur seksi LKD Pelaksanaan Pendidikan — mengikuti 6 menu dosen.
 * Rule tanpa data institusi tidak diterapkan: orasi ilmiah (EDU601),
 * pembimbing dosen (EDU801), detasering (EDU802), pendampingan luar
 * institusi (EDU901), dan diklat prajabatan (EDU902).
 * Huruf seksi berurutan A..J tanpa loncat.
 */
export type SeksiBkd = {
  key: string;
  letter: string;
  title: string;
  kodeRules: string[];
  sumberTarik?: string; // label "Data diambil dari menu" (informatif)
  wajib?: boolean; // harus terisi sebelum laporan dikunci permanen
};

export const SEKSI_BKD: SeksiBkd[] = [
  {
    key: "A",
    letter: "A",
    title:
      "Melaksanakan perkuliahan (tutorial, tatap muka, dan/atau daring) dan membimbing, menguji serta menyelenggarakan pendidikan di laboratorium sesuai penugasan",
    kodeRules: ["EDU101"],
    sumberTarik: "Pelaks. pendidikan > Pengajaran",
    wajib: true,
  },
  {
    key: "B",
    letter: "B",
    title: "Membimbing seminar mahasiswa",
    kodeRules: ["EDU201"],
    sumberTarik: "Pelaks. pendidikan > Bimbingan Mahasiswa",
  },
  {
    key: "C",
    letter: "C",
    title: "Membimbing Kuliah Kerja Nyata, Praktek Kerja Nyata, Praktek Kerja Lapangan",
    kodeRules: ["EDU202"],
    sumberTarik: "Pelaks. pendidikan > Bimbingan Mahasiswa",
  },
  {
    key: "D",
    letter: "D",
    title:
      "Membimbing dan ikut membimbing dalam menghasilkan disertasi, tesis, skripsi dan laporan akhir studi",
    kodeRules: ["EDU203"],
    sumberTarik: "Pelaks. pendidikan > Bimbingan Mahasiswa",
  },
  {
    key: "E",
    letter: "E",
    title: "Bertugas sebagai penguji pada ujian akhir/profesi",
    kodeRules: ["EDU301"],
    sumberTarik: "Pelaks. pendidikan > Pengujian Mahasiswa",
  },
  {
    key: "F",
    letter: "F",
    title: "Membina kegiatan mahasiswa di bidang akademik dan kemahasiswaan",
    kodeRules: ["EDU401", "EDU402"],
    sumberTarik: "Pelaks. pendidikan > Pembinaan Mahasiswa",
  },
  {
    key: "G",
    letter: "G",
    title:
      "Melakukan kegiatan pengembangan program kuliah tatap muka/daring (RPS, perangkat pembelajaran)",
    kodeRules: ["EDU501"],
    sumberTarik: "Pelaks. pendidikan > Bahan Ajar",
  },
  {
    key: "H",
    letter: "H",
    title: "Mengembangkan bahan kuliah",
    kodeRules: ["EDU502"],
    sumberTarik: "Pelaks. pendidikan > Bahan Ajar",
  },
  {
    key: "I",
    letter: "I",
    title: "Menduduki jabatan pimpinan perguruan tinggi",
    kodeRules: ["EDU701"],
    sumberTarik: "Pelaks. pendidikan > Tugas Tambahan",
  },
  {
    key: "J",
    letter: "J",
    title:
      "Melakukan kegiatan pengembangan diri untuk meningkatkan kompetensi/memperoleh sertifikasi profesi",
    kodeRules: ["EDU001"],
    sumberTarik: "Kualifikasi > Pendidikan Formal",
  },
];

/** Seksi yang minimal berisi satu kegiatan diklaim sebelum simpan permanen. */
export const SEKSI_WAJIB = SEKSI_BKD.filter((s) => s.wajib);

export const CAPAIAN_LABEL: Record<string, string> = {
  selesai: "Selesai",
  gagal: "Gagal",
  beban_lebih: "Beban lebih",
};
