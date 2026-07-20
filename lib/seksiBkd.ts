/**
 * Struktur seksi LKD Pelaksanaan Pendidikan sesuai mockup/SISTER:
 * B (diklat prajabatan, dari rubrik Pendidikan Formal) di paling atas,
 * lalu A, B(seminar), C..N dari rubrik Pelaksanaan Pendidikan.
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
    key: "B0",
    letter: "B",
    title: "Mengikuti diklat prajabatan golongan III",
    kodeRules: ["EDU902"],
    sumberTarik: "Kualifikasi > Diklat",
  },
  {
    key: "A",
    letter: "A",
    title:
      "Melaksanakan perkuliahan (tutorial, tatap muka, dan/atau daring) dan membimbing, menguji serta menyelenggarakan pendidikan di laboratorium sesuai penugasan",
    kodeRules: ["EDU101"],
    sumberTarik: "Pelaks. pendidikan > Pengajaran",
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
    title: "Menyampaikan orasi ilmiah",
    kodeRules: ["EDU601"],
    sumberTarik: "Pelaks. pendidikan > Orasi Ilmiah",
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
    title: "Membimbing dosen yang lebih rendah jabatannya",
    kodeRules: ["EDU801"],
    sumberTarik: "Pelaks. pendidikan > Pembimbing Dosen",
  },
  {
    key: "L",
    letter: "L",
    title: "Melaksanakan kegiatan Detasering dan Pencangkokan di luar institusi",
    kodeRules: ["EDU802"],
    sumberTarik: "Pelaks. pendidikan > Detasering",
  },
  {
    key: "M",
    letter: "M",
    title:
      "Melaksanakan kegiatan pendampingan mahasiswa di luar institusi sesuai kebijakan Kementerian",
    kodeRules: ["EDU901"],
    sumberTarik: "Pelaks. pendidikan > Visiting Scientist",
  },
  {
    key: "N",
    letter: "N",
    title:
      "Melakukan kegiatan pengembangan diri untuk meningkatkan kompetensi/memperoleh sertifikasi profesi",
    kodeRules: ["EDU001"],
    sumberTarik: "Kualifikasi > Pendidikan Formal",
  },
];

export const CAPAIAN_LABEL: Record<string, string> = {
  selesai: "Selesai",
  berlanjut: "Berlanjut",
  gagal: "Gagal",
  beban_lebih: "Beban lebih",
};
