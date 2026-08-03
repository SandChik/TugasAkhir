import { prisma } from "../lib/prisma";

export default async function ProfilCard({ idPengguna }: { idPengguna: string }) {
  const u = await prisma.pengguna.findUnique({ where: { id_pengguna: idPengguna } });
  if (!u) return null;

  const rows: [string, string][] = [
    ["Nama", u.nama],
    ["Email", u.email ?? "-"],
    ["Peran", u.peran],
    ["NIDN", u.nidn ?? "-"],
    ["Program Studi", u.program_studi ?? "-"],
    ["Jabatan Fungsional", u.jabatan_fungsional ?? "-"],
    ["NIRA", u.nira ?? "-"],
    ["Kelompok Bidang", u.kelompok_bidang ?? "-"],
    ["Wallet Address", u.alamat_wallet ?? "-"],
  ];

  return (
    <div className="overflow-hidden rounded-[10px] border border-line">
      {rows.map(([label, value], i) => (
        <div
          key={label}
          className={`flex px-4 py-3 text-[11.5px] ${i % 2 === 1 ? "bg-zebra" : ""}`}
        >
          <span className="w-48 font-medium text-cell">{label}</span>
          <span className="mr-3 text-muted">:</span>
          <span className={label === "Wallet Address" ? "font-mono text-[10px] text-muted" : "text-muted"}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}
