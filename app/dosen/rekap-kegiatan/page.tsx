import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { faseAktif, FASE_LABEL } from "../../../lib/fase";
import AppShell from "../../../components/AppShell";
import TabelData from "../../../components/TabelData";
import { buatLkd } from "./actions";
import { IconEye, IconPlus } from "../../../components/Icons";

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
      <div className="mt-4">
        <TabelData
          kosong="Belum ada periode BKD."
          kolom={[
            { label: "Semester", width: "150px", urut: true },
            { label: "Fase", width: "180px", filter: true },
            { label: "Simpulan Final", width: "140px", filter: true },
            { label: "Rencana", width: "110px" },
            { label: "Laporan", width: "110px" },
          ]}
          baris={periode.map((p: any) => {
            const rencana = byPeriode(p.id_periode, "rencana");
            const laporan = byPeriode(p.id_periode, "laporan");
            const s = laporan?.simpulan;
            const aktif = p.status === "aktif";
            const simpulan =
              s?.status_final === "M"
                ? "Memenuhi"
                : s?.status_final === "TM"
                  ? "Tidak Memenuhi"
                  : "-";
            return {
              id: p.id_periode,
              nilai: [p.nama_periode, FASE_LABEL[faseAktif(p)], simpulan, null, null],
              sel: [
                p.nama_periode,
                <span className="text-[10.5px] text-muted">{FASE_LABEL[faseAktif(p)]}</span>,
                <span className={s?.status_final ? "text-success-tx" : "text-crumb"}>
                  {simpulan}
                </span>,
                rencana ? (
                  <Link
                    href={`/dosen/rekap-kegiatan/${rencana.id_lkd}?tab=pendidikan`}
                    title="Lihat rencana kerja"
                    className="inline-block rounded-md bg-primary p-2 text-white hover:bg-[#255cc2]"
                  >
                    <IconEye size={13} />
                  </Link>
                ) : (
                  <span className="text-[10.5px] text-crumb">Belum tersedia</span>
                ),
                laporan ? (
                  <Link
                    href={`/dosen/rekap-kegiatan/${laporan.id_lkd}?tab=pendidikan`}
                    title="Lihat laporan kinerja"
                    className="inline-block rounded-md bg-success-deep p-2 text-white hover:opacity-90"
                  >
                    <IconEye size={13} />
                  </Link>
                ) : aktif ? (
                  <form action={buatLkd}>
                    <button
                      title="Buat laporan kinerja"
                      className="rounded-md bg-warning-deep p-2 text-white hover:opacity-90"
                    >
                      <IconPlus size={13} />
                    </button>
                  </form>
                ) : (
                  <span className="text-[10.5px] text-crumb">-</span>
                ),
              ],
            };
          })}
        />
      </div>
    </AppShell>
  );
}
