/** Berkas bukti yang bisa ditampilkan viewer PDF di halaman. */
export const adalahPdf = (d: { file_url?: string | null; jenis_file?: string | null }) =>
  Boolean(d.file_url) &&
  (/\.pdf($|[?#])/i.test(d.file_url!) || d.jenis_file === "application/pdf");

/**
 * Nilai parameter untuk dibaca dosen/asesor: boolean -> Ya/Tidak, kosong -> "-".
 * Untuk field bertipe `select`, nilai enum kontrak dipisah jadi kata biasa
 * ("PembimbingUtama" -> "Pembimbing Utama").
 */
export function tampilNilai(v: unknown, tipe?: string): string {
  if (typeof v === "boolean") return v ? "Ya" : "Tidak";
  if (v === null || v === undefined || v === "") return "-";
  const s = String(v);
  return tipe === "select" ? s.replace(/([a-z0-9])([A-Z])/g, "$1 $2") : s;
}

/** Cadangan label bila skema kontrak tak punya: "sksMataKuliah" -> "SKS mata kuliah". */
export function labelParameter(nama: string): string {
  const kata = nama.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/_/g, " ").toLowerCase();
  return (kata.charAt(0).toUpperCase() + kata.slice(1)).replace(/\bsks\b/gi, "SKS");
}
