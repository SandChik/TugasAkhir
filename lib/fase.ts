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
