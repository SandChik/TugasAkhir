/**
 * Tabel generik bergaya mockup: border line, header eef1f5,
 * garis kolom d0d7e3, zebra fafbfc.
 */
export default function DataTable({
  columns,
  children,
}: {
  columns: { label: string; width?: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-line">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-head-bg">
            {columns.map((c, i) => (
              <th
                key={i}
                style={c.width ? { width: c.width } : undefined}
                className="border-l border-line-grid px-3.5 py-2.5 text-[11.5px] font-medium text-head-tx first:border-l-0"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr:nth-child(even)]:bg-zebra [&>tr]:border-t [&>tr]:border-line [&_td]:border-l [&_td]:border-line-grid [&_td]:px-3.5 [&_td]:py-2.5 [&_td]:text-[11.5px] [&_td]:text-cell [&_td:first-child]:border-l-0">
          {children}
        </tbody>
      </table>
    </div>
  );
}
