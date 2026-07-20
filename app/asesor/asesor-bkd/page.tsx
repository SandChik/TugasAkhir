import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import AppShell from "../../../components/AppShell";
import DataTable from "../../../components/DataTable";
import StatusChip from "../../../components/StatusChip";

/** Dashboard Asesor - daftar LKD yang ditugaskan ke asesor ini. */
export default async function AsesorBkdPage() {
  const session = await getServerSession(authOptions);

  const penugasan = await prisma.penugasan_asesor.findMany({
    where: { id_asesor: session!.user.id },
    include: {
      lkd: { include: { pengguna: true, periode_bkd: true } },
    },
    orderBy: { created_at: "desc" },
  });

  return (
    <AppShell
      peran="asesor"
      nama={session?.user.name ?? "-"}
      deskripsi="Asesor, Teknik Informatika"
      breadcrumb={["Beranda", "Layanan BKD", "Asesor BKD"]}
      title="Penilaian Asesor BKD"
      subtitle="Daftar LKD dosen yang ditugaskan kepada Anda"
    >
      <DataTable
        columns={[
          { label: "No", width: "50px" },
          { label: "Nama/NIDN" },
          { label: "Periode", width: "150px" },
          { label: "Jenis", width: "100px" },
          { label: "Sebagai", width: "120px" },
          { label: "Status LKD", width: "130px" },
          { label: "Aksi", width: "150px" },
        ]}
      >
        {penugasan.length === 0 ? (
          <tr>
            <td colSpan={7} className="!text-center !text-crumb">
              Belum ada penugasan penilaian.
            </td>
          </tr>
        ) : (
          penugasan.map((p: any, i: number) => (
            <tr key={p.id_penugasan}>
              <td>{i + 1}</td>
              <td>
                {p.lkd.pengguna.nama}
                <span className="block text-[10px] text-crumb">{p.lkd.pengguna.nidn}</span>
              </td>
              <td>{p.lkd.periode_bkd.nama_periode}</td>
              <td className="capitalize">{p.lkd.jenis}</td>
              <td>Asesor ke-{p.urutan}</td>
              <td>
                {p.lkd.simpan_permanen ? (
                  <StatusChip label={p.lkd.status} variant="success" />
                ) : (
                  <StatusChip label="Belum simpan permanen" variant="dangerSoft" />
                )}
              </td>
              <td>
                {p.lkd.simpan_permanen ? (
                  <a
                    href={`/asesor/penilaian/${p.id_penugasan}`}
                    className="inline-block rounded-md bg-primary px-3 py-1.5 text-[10.5px] font-medium text-white"
                  >
                    Lakukan penilaian
                  </a>
                ) : (
                  <span className="inline-block rounded-md bg-danger-soft px-3 py-1.5 text-[10.5px] font-medium text-[#a03a52]">
                    Dosen belum simpan permanen
                  </span>
                )}
              </td>
            </tr>
          ))
        )}
      </DataTable>
    </AppShell>
  );
}
