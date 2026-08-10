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
      className={`inline-block rounded px-2 py-1 text-[10px] font-medium ${VARIANTS[variant]}`}
    >
      {label}
    </span>
  );
}
