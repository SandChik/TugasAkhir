import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { faseAktif, FASE_LABEL } from "../../../lib/fase";
import AppShell from "../../../components/AppShell";
import DataTable from "../../../components/DataTable";
import InfoBox from "../../../components/InfoBox";
import { buatLkd } from "./actions";
import { IconCheck, IconPencil } from "../../../components/Icons";

/** Layanan BKD - Rekap Kegiatan (mockup 142:2): status laporan per semester. */
export default async function RekapKegiatanPage() {
  const session = await getServerSession(authOptions);

  const periode = await prisma.periode_bkd.findMany({ orderBy: { tanggal_mulai: "desc" } });
  const lkds = await prisma.lkd.findMany({
    where: { id_pengguna: session!.user.id },
    include: { simpulan: true },
  });
  const byPeriode = (idPeriode: string, jenis: string) =>
    lkds.find((l: any) => l.id_periode === idPeriode && l.jenis === jenis);

  return (
    <AppShell
      peran="dosen"
      nama={session?.user.name ?? "-"}
      deskripsi="Dosen, D3 Teknik Informatika"
      breadcrumb={["Beranda", "Layanan BKD", "Rekap kegiatan"]}
      title="Layanan BKD"
      subtitle="Rekap kegiatan dan status penilaian BKD per semester"
    >
      <InfoBox>
        <b>Info:</b> Kegiatan diisi pada <b>Laporan Kinerja</b>. Rencana kerja terisi otomatis
        setelah laporan pada semester tersebut divalidasi asesor.
      </InfoBox>

      <div className="mt-4">
        <DataTable
          columns={[
            { label: "Semester", width: "150px" },
            { label: "Fase", width: "180px" },
            { label: "Simpulan Final", width: "140px" },
            { label: "Rencana", width: "200px" },
            { label: "Laporan", width: "230px" },
          ]}
        >
          {periode.map((p: any) => {
            const rencana = byPeriode(p.id_periode, "rencana");
            const laporan = byPeriode(p.id_periode, "laporan");
            const s = laporan?.simpulan;
            const aktif = p.status === "aktif";
            return (
              <tr key={p.id_periode}>
                <td>{p.nama_periode}</td>
                <td className="!text-[10.5px] !text-muted">{FASE_LABEL[faseAktif(p)]}</td>
                <td className={s?.status_final ? "!text-success-tx" : "!text-crumb"}>
                  {s?.status_final === "M" ? "Memenuhi" : s?.status_final === "TM" ? "Tidak Memenuhi" : "-"}
                </td>
                <td>
                  {rencana ? (
                    <Link
                      href={`/dosen/rekap-kegiatan/${rencana.id_lkd}?tab=pendidikan`}
                      className="inline-block rounded-md bg-primary px-3 py-1.5 text-[10.5px] font-medium text-white"
                    >
                      <span className="inline-flex items-center gap-1.5"><IconCheck size={11}/> Lihat Rencana Kerja</span>
                    </Link>
                  ) : (
                    <span className="text-[10.5px] text-crumb">Belum tersedia</span>
                  )}
                </td>
                <td>
                  {laporan ? (
                    <Link
                      href={`/dosen/rekap-kegiatan/${laporan.id_lkd}?tab=pendidikan`}
                      className="inline-block rounded-md bg-success-deep px-3 py-1.5 text-[10.5px] font-medium text-white"
                    >
                      <span className="inline-flex items-center gap-1.5"><IconPencil size={11}/> Lihat Laporan Kinerja</span>
                    </Link>
                  ) : aktif ? (
                    <form action={buatLkd}>
                      <button className="rounded-md bg-warning-deep px-3 py-1.5 text-[10.5px] font-medium text-white">
                        <span className="inline-flex items-center gap-1.5"><IconPencil size={11}/> Isi Laporan Kinerja</span>
                      </button>
                    </form>
                  ) : (
                    <span className="text-[10.5px] text-crumb">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>
    </AppShell>
  );
}
