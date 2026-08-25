/**
 * Kelas tampilan tabel (token mockup Figma). Dipakai bersama oleh `DataTable`
 * dan `TabelData` supaya semua tabel tetap satu gaya.
 */
export const KELAS_TABEL = {
  bingkai: "overflow-hidden rounded-[10px] border border-line",
  gulir: "overflow-x-auto",
  tabel: "w-full border-collapse text-left",
  headBaris: "bg-head-bg",
  th: "border-l border-line-grid px-3.5 py-2.5 text-[11.5px] font-medium text-head-tx first:border-l-0",
  tbody:
    "[&>tr:nth-child(even)]:bg-zebra [&>tr:hover]:bg-[#f4f7fd] [&>tr]:border-t [&>tr]:border-line [&_td]:border-l [&_td]:border-line-grid [&_td]:px-3.5 [&_td]:py-2.5 [&_td]:text-[11.5px] [&_td]:text-cell [&_td:first-child]:border-l-0",
} as const;

/**
 * Tabel statis: hanya kerangka header + baris apa adanya. Pakai ini untuk
 * tabel yang tidak butuh pencarian/urut/pagination (baris bersarang, tabel
 * ringkas beberapa baris). Selebihnya pakai `TabelData`.
 */
export default function DataTable({
  columns,
  children,
}: {
  columns: { label: string; width?: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className={KELAS_TABEL.bingkai}>
      <div className={KELAS_TABEL.gulir}>
        <table className={KELAS_TABEL.tabel}>
          <thead>
            <tr className={KELAS_TABEL.headBaris}>
              {columns.map((c, i) => (
                <th key={i} style={c.width ? { width: c.width } : undefined} className={KELAS_TABEL.th}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={KELAS_TABEL.tbody}>{children}</tbody>
        </table>
      </div>
    </div>
  );
}
