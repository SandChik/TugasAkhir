/**
 * Spesifikasi kolom tabel per menu Pelaksanaan Pendidikan,
 * mengikuti frame Figma masing-masing (29:2, 79:2, 95:2, 104:2, 110:2,
 * 132:2, 134:2, 136:2, 137:2, 139:2).
 * Nilai diambil dari judul / parameter / detail_kegiatan dengan fallback "-".
 */

export type KolomCtx = { periode?: string; prodi?: string; namaDosen?: string };
export type Kolom = { label: string; width?: string; get: (k: any, ctx: KolomCtx) => string };

const d = (k: any) => (k.detail_kegiatan as any) ?? {};
const p = (k: any) => (k.parameter as any) ?? {};
const dash = (v: any) => (v === undefined || v === null || v === "" ? "-" : String(v));

const kategoriRingkas = (k: any) => {
  const kat: string = k.referensi_kegiatan?.kategori ?? "";
  return dash(kat.replace(/^[A-N]\.\s*/, ""));
};

const jenisBimbingan = (k: any) => {
  const kode = k.referensi_kegiatan?.kode_rule;
  if (kode === "EDU201") return "Seminar";
  if (kode === "EDU202") return "Kerja praktek/PKL";
  if (kode === "EDU203") return dash(p(k).jenisTugasAkhir);
  return "-";
};

export const KOLOM_KATEGORI: Record<string, Kolom[]> = {
  pengajaran: [
    { label: "Mata Kuliah", get: (k) => k.judul },
    { label: "Jenis Mata Kuliah", width: "130px", get: (k) => dash(d(k).jenis_mata_kuliah) },
    { label: "Bidang Keilmuan", width: "130px", get: (k) => dash(d(k).bidang_keilmuan) },
    { label: "Kelas", width: "90px", get: (k) => dash(d(k).kelas) },
    { label: "Jumlah Mahasiswa", width: "130px", get: (k) => dash(d(k).jumlah_mahasiswa) },
    { label: "SKS", width: "80px", get: (k) => (k.sks_dihitung_x100 != null ? (k.sks_dihitung_x100 / 100).toFixed(2) : "-") },
  ],
  "bimbingan-mahasiswa": [
    { label: "Semester", width: "120px", get: (_k, c) => dash(c.periode) },
    { label: "Kategori Kegiatan", width: "180px", get: kategoriRingkas },
    { label: "Judul Bimbingan", get: (k) => k.judul },
    { label: "Bidang Keilmuan", width: "120px", get: (k) => dash(d(k).bidang_keilmuan) },
    { label: "Jenis Bimbingan", width: "130px", get: jenisBimbingan },
    { label: "Program Studi", width: "140px", get: (_k, c) => dash(c.prodi) },
  ],
  "pengujian-mahasiswa": [
    { label: "Judul Pengujian", get: (k) => k.judul },
    { label: "Bidang Keilmuan", width: "130px", get: (k) => dash(d(k).bidang_keilmuan) },
    { label: "Jenis Pengujian", width: "140px", get: (k) => dash(d(k).jenis_pengujian ?? "Tugas akhir") },
    { label: "Program Studi", width: "150px", get: (_k, c) => dash(c.prodi) },
  ],
  "bahan-ajar": [
    { label: "Judul Bahan Ajar", get: (k) => k.judul },
    { label: "ISBN", width: "130px", get: (k) => dash(d(k).isbn) },
    { label: "Tanggal Terbit", width: "130px", get: (k) => dash(d(k).tanggal_terbit) },
    { label: "Penerbit", width: "170px", get: (k) => dash(d(k).penerbit) },
  ],
  "pembinaan-mahasiswa": [
    { label: "Semester", width: "120px", get: (_k, c) => dash(c.periode) },
    { label: "Kategori Kegiatan", width: "200px", get: kategoriRingkas },
    { label: "Judul Bimbingan", get: (k) => k.judul },
    { label: "Jenis Bimbingan", width: "130px", get: (k) => dash(d(k).jenis_bimbingan ?? "Akademik") },
    { label: "Program Studi", width: "140px", get: (_k, c) => dash(c.prodi) },
  ],
  "visiting-scientist": [
    { label: "Perguruan Tinggi Pengundang", get: (k) => dash(d(k).pt_pengundang ?? k.judul) },
    { label: "Lama Kegiatan", width: "150px", get: (k) => dash(d(k).lama_kegiatan ?? (p(k).jumlahSemester ? `${p(k).jumlahSemester} Semester` : null)) },
    { label: "Tanggal Pelaksanaan", width: "180px", get: (k) => dash(d(k).tanggal_pelaksanaan) },
  ],
  detasering: [
    { label: "Perguruan Tinggi Sasaran", get: (k) => dash(d(k).pt_sasaran ?? k.judul) },
    { label: "Kategori Kegiatan", width: "150px", get: (k) => dash(p(k).lokasi?.replace("Institusi", "Institusi ")) },
    { label: "No. SK Penugasan", width: "160px", get: (k) => dash(d(k).no_sk) },
    { label: "Tanggal SK Penugasan", width: "170px", get: (k) => dash(d(k).tgl_sk) },
  ],
  "orasi-ilmiah": [
    { label: "Kategori Kegiatan", width: "150px", get: () => "Orasi Ilmiah" },
    { label: "Judul Makalah", get: (k) => k.judul },
    { label: "Nama Temu Ilmiah", width: "170px", get: (k) => dash(d(k).nama_temu) },
    { label: "Penyelenggara", width: "160px", get: (k) => dash(d(k).penyelenggara) },
    { label: "Tanggal Pelaksanaan", width: "160px", get: (k) => dash(d(k).tanggal_pelaksanaan) },
  ],
  "pembimbing-dosen": [
    { label: "Nama Pembimbing", width: "200px", get: (_k, c) => dash(c.namaDosen) },
    { label: "Nama Bimbingan", get: (k) => k.judul },
    { label: "Tanggal Mulai", width: "150px", get: (k) => dash(d(k).tanggal_mulai ?? d(k).tgl_sk) },
    { label: "Tanggal Selesai", width: "150px", get: (k) => dash(d(k).tanggal_selesai) },
  ],
  "tugas-tambahan": [
    { label: "Tugas Tambahan", get: (k) => k.judul },
    { label: "Unit Kerja", width: "160px", get: (k) => dash(d(k).unit_kerja) },
    { label: "Instansi", width: "160px", get: (k) => dash(d(k).instansi ?? "Institusi A") },
    { label: "Tanggal Mulai", width: "140px", get: (k) => dash(d(k).tanggal_mulai ?? d(k).tgl_sk) },
    { label: "Tanggal Berakhir", width: "140px", get: (k) => dash(d(k).tanggal_berakhir) },
  ],
};

/** Field detail tambahan (opsional) per kategori pada form tambah/edit. */
export type DetailField = { name: string; label: string; type: "text" | "date" };

export const DETAIL_FIELDS: Record<string, DetailField[]> = {
  "bimbingan-mahasiswa": [{ name: "bidang_keilmuan", label: "Bidang Keilmuan", type: "text" }],
  "pengujian-mahasiswa": [
    { name: "bidang_keilmuan", label: "Bidang Keilmuan", type: "text" },
    { name: "jenis_pengujian", label: "Jenis Pengujian", type: "text" },
  ],
  "bahan-ajar": [
    { name: "isbn", label: "ISBN", type: "text" },
    { name: "tanggal_terbit", label: "Tanggal Terbit", type: "date" },
    { name: "penerbit", label: "Penerbit", type: "text" },
  ],
  "pembinaan-mahasiswa": [{ name: "jenis_bimbingan", label: "Jenis Bimbingan", type: "text" }],
  "visiting-scientist": [
    { name: "pt_pengundang", label: "Perguruan Tinggi Pengundang", type: "text" },
    { name: "lama_kegiatan", label: "Lama Kegiatan", type: "text" },
    { name: "tanggal_pelaksanaan", label: "Tanggal Pelaksanaan", type: "date" },
  ],
  detasering: [{ name: "pt_sasaran", label: "Perguruan Tinggi Sasaran", type: "text" }],
  "orasi-ilmiah": [
    { name: "nama_temu", label: "Nama Temu Ilmiah", type: "text" },
    { name: "penyelenggara", label: "Penyelenggara", type: "text" },
    { name: "tanggal_pelaksanaan", label: "Tanggal Pelaksanaan", type: "date" },
  ],
  "pembimbing-dosen": [
    { name: "tanggal_mulai", label: "Tanggal Mulai", type: "date" },
    { name: "tanggal_selesai", label: "Tanggal Selesai", type: "date" },
  ],
  "tugas-tambahan": [
    { name: "unit_kerja", label: "Unit Kerja", type: "text" },
    { name: "instansi", label: "Instansi", type: "text" },
    { name: "tanggal_mulai", label: "Tanggal Mulai", type: "date" },
    { name: "tanggal_berakhir", label: "Tanggal Berakhir", type: "date" },
  ],
};
