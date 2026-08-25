/**
 * R3: menentukan fase aktif suatu periode.
 * Prioritas: fase_override (manual admin) > perhitungan dari rentang tanggal.
 */
export type Fase = "pengisian" | "penilaian" | "perbaikan" | "selesai";

export const FASE_LABEL: Record<Fase, string> = {
  pengisian: "Masa Pengisian & Upload Bukti",
  penilaian: "Masa Penilaian Asesor",
  perbaikan: "Masa Perbaikan Penilaian",
  selesai: "Selesai Dinilai",
};

function inRange(now: Date, a?: Date | null, b?: Date | null): boolean {
  if (!a || !b) return false;
  return now >= a && now <= b;
}

export function faseAktif(periode: any, now: Date = new Date()): Fase {
  if (periode?.fase_override) return periode.fase_override as Fase;
  if (inRange(now, periode?.pengisian_mulai, periode?.pengisian_selesai)) return "pengisian";
  if (inRange(now, periode?.penilaian_mulai, periode?.penilaian_selesai)) return "penilaian";
  if (inRange(now, periode?.perbaikan_mulai, periode?.perbaikan_selesai)) return "perbaikan";
  // sebelum pengisian dimulai -> anggap pengisian; setelah semua lewat -> selesai
  if (periode?.pengisian_mulai && now < periode.pengisian_mulai) return "pengisian";
  return "selesai";
}

// Gate aksi berdasarkan fase (dipakai server action + UI)
export const bolehDosenInput = (f: Fase) => f === "pengisian";
export const bolehDosenPerbaiki = (f: Fase) => f === "pengisian" || f === "perbaikan";
export const bolehAsesorNilai = (f: Fase) => f === "penilaian" || f === "perbaikan";

/**
 * Kegiatan yang dikembalikan asesor: ada hasil penilaian berstatus revisi atau
 * ditolak. Relasi `hasil_penilaian` harus ikut di-query.
 */
export function perluPerbaikan(kegiatan: any): boolean {
  return (kegiatan?.hasil_penilaian ?? []).some(
    (h: any) => h.status === "revisi" || h.status === "ditolak"
  );
}

/**
 * Gate tunggal untuk unggah, ganti, dan hapus bukti. Dipakai server action dan
 * UI supaya keduanya tidak pernah berbeda; dicek di server juga karena UI yang
 * menyembunyikan tombol bukan pengaman, kiriman form bisa dibuat manual.
 *
 * Terbuka pada masa pengisian selama laporan belum disimpan permanen, lalu
 * terbuka lagi pada masa perbaikan khusus kegiatan yang dikembalikan asesor.
 */
export function bolehUbahBukti(kegiatan: any): boolean {
  const fase = faseAktif(kegiatan?.lkd?.periode_bkd);
  if (!kegiatan?.lkd?.simpan_permanen && bolehDosenInput(fase)) return true;
  return bolehDosenPerbaiki(fase) && perluPerbaikan(kegiatan);
}

/** Rentang tanggal milik fase tersebut; fase selesai memakai rentang periode. */
export function rentangFase(
  periode: any,
  fase: Fase,
): { mulai: Date | null; selesai: Date | null } {
  const kunci: Record<Fase, [string, string]> = {
    pengisian: ["pengisian_mulai", "pengisian_selesai"],
    penilaian: ["penilaian_mulai", "penilaian_selesai"],
    perbaikan: ["perbaikan_mulai", "perbaikan_selesai"],
    selesai: ["tanggal_mulai", "tanggal_selesai"],
  };
  const [a, b] = kunci[fase];
  return { mulai: periode?.[a] ?? null, selesai: periode?.[b] ?? null };
}

/** Field tanggal periode_bkd, urutannya sekaligus urutan tampil di form ubah. */
export const FIELD_TANGGAL = [
  ["tanggal_mulai", "Mulai Periode"],
  ["tanggal_selesai", "Selesai Periode"],
  ["pengisian_mulai", "Pengisian Mulai"],
  ["pengisian_selesai", "Pengisian Selesai"],
  ["penilaian_mulai", "Penilaian Mulai"],
  ["penilaian_selesai", "Penilaian Selesai"],
  ["perbaikan_mulai", "Perbaikan Mulai"],
  ["perbaikan_selesai", "Perbaikan Selesai"],
] as const;

export type KunciTanggal = (typeof FIELD_TANGGAL)[number][0];
