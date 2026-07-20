export type ActivityRule = {
  id: string;
  category: string;
  name: string;
  parameters: string[];
  formula: string;
};

export const educationRules: ActivityRule[] = [
  { id: "EDU001", category: "Pendidikan Formal", name: "Menempuh pendidikan formal doktor", parameters: ["jumlahSemester"], formula: "12 x jumlahSemester" },
  { id: "EDU002", category: "Pendidikan Formal", name: "Mengikuti pelatihan dasar/prajabatan", parameters: ["jumlahSertifikat"], formula: "2 x jumlahSertifikat" },
  { id: "EDU101", category: "Pengajaran", name: "Melaksanakan perkuliahan/tutorial/praktikum/studio/daring", parameters: ["sksMataKuliah", "jumlahPertemuanRencana", "jumlahPertemuanRealisasi", "semesterPenuh", "teamTeaching", "persenPorsiDosen"], formula: "Jika realisasi < 50% maka 0; jika valid proporsional; team teaching sesuai porsi" },
  { id: "EDU201", category: "Bimbingan", name: "Membimbing seminar mahasiswa", parameters: ["jumlahSemester"], formula: "1 x jumlahSemester" },
  { id: "EDU202", category: "Bimbingan", name: "Membimbing KKN/PKL/magang/praktik kerja", parameters: ["jumlahSemester"], formula: "2 x jumlahSemester" },
  { id: "EDU203-210", category: "Bimbingan TA", name: "Pembimbing utama/pendamping disertasi/tesis/skripsi/laporan akhir", parameters: ["role", "jumlahMahasiswa"], formula: "rate role x jumlahMahasiswa" },
  { id: "EDU301-302", category: "Penguji", name: "Ketua/anggota penguji ujian akhir/profesi", parameters: ["role", "jumlahMahasiswa"], formula: "0.5 atau 0.25 x jumlahMahasiswa" },
  { id: "EDU502", category: "Bahan Ajar", name: "Menulis buku ajar", parameters: ["jumlahNaskah", "role", "jumlahAnggota"], formula: "Ketua 5 x naskah x 60%; anggota 5 x naskah x 40% / anggota" },
  { id: "EDU901-902", category: "Pendampingan MBKM", name: "Pendampingan mahasiswa di luar institusi", parameters: ["lectorOrAbove", "jumlahSemester"], formula: "12 atau 5 x jumlahSemester" }
];
