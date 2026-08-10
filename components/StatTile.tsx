import Link from "next/link";

/**
 * Kartu angka ringkas. Bila diberi `href`, kartu berfungsi sebagai filter —
 * angka yang dibaca admin dan cara menyaringnya jadi satu objek yang sama
 * (recognition rather than recall), dan kartu aktif ditandai jelas.
 */
export type NadaTile = "netral" | "siap" | "masalah" | "koreksi" | "redup";

const NADA: Record<NadaTile, { angka: string; ring: string; aktif: string }> = {
  netral: { angka: "text-navy", ring: "hover:border-primary", aktif: "border-primary bg-primary-soft" },
  siap: { angka: "text-success-tx", ring: "hover:border-success", aktif: "border-success bg-[#eaf6f0]" },
  masalah: { angka: "text-danger", ring: "hover:border-danger", aktif: "border-danger bg-danger-soft" },
  koreksi: { angka: "text-warning-deep", ring: "hover:border-warning", aktif: "border-warning bg-[#fdf6ea]" },
  redup: { angka: "text-muted", ring: "hover:border-crumb", aktif: "border-crumb bg-head-bg" },
};

export default function StatTile({
  label,
  nilai,
  catatan,
  nada = "netral",
  href,
  aktif = false,
}: {
  label: string;
  nilai: React.ReactNode;
  catatan?: string;
  nada?: NadaTile;
  href?: string;
  aktif?: boolean;
}) {
  const n = NADA[nada];
  const isi = (
    <>
      <p className="text-[11px] font-medium text-muted">{label}</p>
      <p className={`mt-1 text-[19px] font-semibold leading-none ${n.angka}`}>{nilai}</p>
      {catatan && (
        <p className="mt-1.5 text-[10.5px] leading-tight text-muted">{catatan}</p>
      )}
    </>
  );

  const dasar = "block rounded-[10px] border px-3.5 py-3 transition-colors";
  if (!href) return <div className={`${dasar} border-line bg-white`}>{isi}</div>;

  return (
    <Link
      href={href}
      aria-current={aktif ? "true" : undefined}
      className={`${dasar} ${aktif ? n.aktif : `border-line bg-white ${n.ring}`}`}
    >
      {isi}
    </Link>
  );
}
