import Link from "next/link";
import { IconBack } from "./Icons";

/**
 * Bar aksi yang menempel di bawah viewport: tombol kembali dan tombol simpan
 * tetap terjangkau tanpa menggulir sampai dasar tabel.
 */
export default function BarAksi({
  hrefKembali,
  info,
  children,
}: {
  hrefKembali: string;
  info?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="sticky bottom-0 z-20 -mx-6 mt-5 border-t border-line bg-white px-6 py-3 shadow-[0_-2px_10px_rgba(20,49,94,0.07)]">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={hrefKembali}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2 text-[11.5px] font-medium text-muted transition-colors hover:bg-head-bg"
        >
          <IconBack size={11} /> Kembali
        </Link>
        {info && <span className="text-[11px] text-muted">{info}</span>}
        <div className="ml-auto flex items-center gap-2">{children}</div>
      </div>
    </div>
  );
}
