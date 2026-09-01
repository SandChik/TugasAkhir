/** Berkas bukti yang bisa ditampilkan viewer PDF di halaman. */
export const adalahPdf = (d: { file_url?: string | null; jenis_file?: string | null }) =>
  Boolean(d.file_url) &&
  (/\.pdf($|[?#])/i.test(d.file_url!) || d.jenis_file === "application/pdf");

/**
 * Label opsi `select` yang tidak terbaca benar oleh pemisahan otomatis.
 * Kunci map = nama enum kontrak persis seperti di seed referensi.
 */
const LABEL_OPSI: Record<string, string> = {
  ModulPedoman: "Modul/Pedoman",
  BahanAjarLain: "Bahan ajar lain",
  LektorKeAtas: "Lektor ke atas",
  AsistenAhli_DosenLain: "Asisten Ahli/Dosen lain",
  InstitusiQS100: "Institusi dalam QS 100",
  KepalaLLDIKTI_WakilRektor_DirekturPascasarjana_KetuaSekolah:
    "Kepala LLDIKTI/Wakil Rektor/Direktur Pascasarjana/Ketua Sekolah",
  WakilKetuaSekolahTinggi_WakilDirekturPoliteknik_Akademi_DirekturAkademi:
    "Wakil Ketua Sekolah Tinggi/Wakil Direktur Politeknik/Akademi/Direktur Akademi",
  WakilDirekturAkademik_SekretarisLembaga_KetuaJurusan_Departemen:
    "Wakil Direktur Akademik/Sekretaris Lembaga/Ketua Jurusan/Departemen",
  BagianProgramStudi_KepalaLaboratorium_SekretarisJurusanDepartemen:
    "Bagian Program Studi/Kepala Laboratorium/Sekretaris Jurusan Departemen",
};

/**
 * Nama enum kontrak menjadi label yang dibaca pengguna:
 * "BukuAjar" -> "Buku Ajar", "AsistenAhli_DosenLain" -> "Asisten Ahli/Dosen lain".
 * Nilai yang dikirim form tetap nama enum (urutan opsi = indeks argumen kontrak),
 * jadi konversi ini murni tampilan.
 */
export function labelOpsi(nilai: string): string {
  return (
    LABEL_OPSI[nilai] ??
    nilai
      .split("_")
      .map((bagian) => bagian.replace(/([a-z0-9])([A-Z])/g, "$1 $2"))
      .join("/")
  );
}

/**
 * Nilai parameter untuk dibaca dosen/asesor: boolean -> Ya/Tidak, kosong -> "-".
 * Untuk field bertipe `select`, nilai enum kontrak dipisah jadi kata biasa
 * ("PembimbingUtama" -> "Pembimbing Utama").
 */
export function tampilNilai(v: unknown, tipe?: string): string {
  if (typeof v === "boolean") return v ? "Ya" : "Tidak";
  if (v === null || v === undefined || v === "") return "-";
  const s = String(v);
  return tipe === "select" ? labelOpsi(s) : s;
}

/** Cadangan label bila skema kontrak tak punya: "sksMataKuliah" -> "SKS mata kuliah". */
export function labelParameter(nama: string): string {
  const kata = nama.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/_/g, " ").toLowerCase();
  return (kata.charAt(0).toUpperCase() + kata.slice(1)).replace(/\bsks\b/gi, "SKS");
}
