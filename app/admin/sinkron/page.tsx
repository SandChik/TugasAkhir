import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import AppShell from "../../../components/AppShell";
import DataTable from "../../../components/DataTable";
import InfoBox from "../../../components/InfoBox";
import { sinkronPddikti } from "./actions";

/** R7: Sinkronisasi Feeder PDDikti (simulasi). */
export default async function SinkronPage() {
  const session = await getServerSession(authOptions);
  const periode = await prisma.periode_bkd.findFirst({ where: { status: "aktif" } });

  const pddikti = periode
    ? await prisma.kegiatan.findMany({
        where: { sumber_data: "pddikti", lkd: { id_periode: periode.id_periode } } as any,
        include: { lkd: { include: { pengguna: true } }, referensi_kegiatan: true },
        orderBy: { created_at: "desc" },
        take: 50,
      })
    : [];

  return (
    <AppShell
      peran="admin"
      nama={session?.user.name ?? "-"}
      deskripsi="Admin, Sistem"
      breadcrumb={["Beranda", "Administrasi", "Sinkronisasi PDDikti"]}
      title="Sinkronisasi Feeder PDDikti"
      subtitle="Menarik data pengajaran, bimbingan, dan pengujian dari Feeder (simulasi prototipe)"
      actions={
        <form action={sinkronPddikti}>
          <button
            disabled={!periode}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white disabled:opacity-40"
          >
            ↻ Sinkronkan Feeder PDDikti
          </button>
        </form>
      }
    >
      <InfoBox>
        <b>Info:</b> Pada sistem produksi, data ini ditarik dari Feeder PDDikti Kemdikbud. Untuk
        prototipe, tombol di atas mensimulasikan penarikan: data masuk sebagai kegiatan berlabel
        PDDikti pada laporan tiap dosen (periode aktif{periode ? `: ${periode.nama_periode}` : ""}),
        berstatus <b>belum diklaim</b> hingga dosen menariknya di Layanan BKD.
      </InfoBox>

      <div className="mt-4">
        <DataTable
          columns={[
            { label: "No", width: "50px" },
            { label: "Dosen", width: "180px" },
            { label: "Kegiatan" },
            { label: "Kategori", width: "220px" },
            { label: "SKS", width: "80px" },
            { label: "Status Klaim", width: "130px" },
          ]}
        >
          {pddikti.length === 0 ? (
            <tr>
              <td colSpan={6} className="!text-center !text-crumb">
                Belum ada data PDDikti. Klik "Sinkronkan Feeder PDDikti".
              </td>
            </tr>
          ) : (
            pddikti.map((k: any, i: number) => (
              <tr key={k.id_kegiatan}>
                <td>{i + 1}</td>
                <td>{k.lkd.pengguna.nama}</td>
                <td>{k.judul}</td>
                <td className="!text-[10.5px] !text-muted">{k.referensi_kegiatan.kategori}</td>
                <td>{k.sks_dihitung_x100 != null ? (k.sks_dihitung_x100 / 100).toFixed(2) : "-"}</td>
                <td>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                      k.diklaim ? "bg-[#e6f4ec] text-success-tx" : "bg-head-bg text-muted"
                    }`}
                  >
                    {k.diklaim ? "Diklaim" : "Belum diklaim"}
                  </span>
                </td>
              </tr>
            ))
          )}
        </DataTable>
      </div>
    </AppShell>
  );
}
