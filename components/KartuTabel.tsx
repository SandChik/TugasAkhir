import { IconUsers } from "./Icons";

/**
 * Bagian bersama halaman detail kegiatan mahasiswa (bimbingan & pengujian):
 * kelas kartu rincian, tabel berbilah judul navy, dan penampil nilai kosong.
 */

export const KELAS_RINCI = {
  th: "border-l border-line-grid bg-head-bg px-3.5 py-2.5 text-[11px] font-medium text-head-tx first:border-l-0",
  td: "border-l border-line-grid px-3.5 py-2.5 text-[11.5px] text-cell first:border-l-0",
  input:
    "w-full max-w-xl rounded-md border border-line bg-white px-2.5 py-1.5 text-[11.5px] text-cell outline-none focus:border-primary",
};

export const teks = (v: unknown): string | null => {
  const s = v == null ? "" : String(v).trim();
  return s ? s : null;
};

export const takAda = <span className="text-crumb">( Tidak ada data )</span>;

export const tampil = (v: string | null) => (v && v.trim() ? v : takAda);

export default function KartuTabel({
  judul,
  children,
}: {
  judul: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[10px] border border-line">
      <div className="flex items-center gap-2 bg-navy px-4 py-3">
        <IconUsers size={14} className="text-white" />
        <h2 className="text-[12px] font-semibold text-white">{judul}</h2>
      </div>
      <table className="w-full border-collapse text-left">{children}</table>
    </section>
  );
}
