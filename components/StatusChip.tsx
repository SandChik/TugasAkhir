const VARIANTS = {
  success: "bg-success text-white",
  successDeep: "bg-success-deep text-white",
  danger: "bg-danger text-white",
  dangerSoft: "bg-danger-soft text-[#a03a52]",
  warning: "bg-warning text-white",
  info: "bg-info text-white",
  navy: "bg-navy text-white",
  primary: "bg-primary text-white",
  neutral: "bg-crumb text-white",
  /* Varian lembut untuk state yang belum berjalan: latar redup + garis tepi,
     supaya chip berwarna solid tetap jadi fokus mata. */
  neutralSoft: "bg-head-bg text-muted ring-1 ring-inset ring-line",
  infoSoft: "bg-info-bg text-info-tx ring-1 ring-inset ring-info/30",
  warningSoft: "bg-[#fdf3e0] text-[#96682a] ring-1 ring-inset ring-warning/35",
  successSoft: "bg-[#e6f4ec] text-success-tx ring-1 ring-inset ring-success/35",
} as const;

export type ChipVariant = keyof typeof VARIANTS;

/** Pemetaan status domain -> varian warna (konsisten dengan mockup) */
export const STATUS_VARIAN: Record<string, ChipVariant> = {
  selesai: "success",
  gagal: "danger",
  beban_lebih: "navy",
  aktif: "success",
  nonaktif: "neutral",
  disetujui: "success",
  ditolak: "danger",
  revisi: "warning",
  M: "success",
  TM: "danger",
  mint: "success",
  burn: "danger",
  success: "success",
  pending: "warning",
  failed: "danger",
  // status_lkd: tiap tahap warnanya beda supaya kolom status terbaca sekilas
  draft: "neutralSoft",
  diajukan: "infoSoft",
  dinilai: "warning",
  final: "successDeep",
};

export default function StatusChip({
  label,
  variant = "neutral",
}: {
  label: string;
  variant?: ChipVariant;
}) {
  return (
    <span
      className={`inline-block rounded px-2 py-1 text-[10px] font-medium leading-snug ${VARIANTS[variant]}`}
    >
      {label}
    </span>
  );
}
