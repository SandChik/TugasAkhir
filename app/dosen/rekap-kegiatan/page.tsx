import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import AppShell from "../../../components/AppShell";
import DataTable from "../../../components/DataTable";
import InfoBox from "../../../components/InfoBox";
import { buatLkd } from "./actions";

/** Layanan BKD - Rekap Kegiatan (mockup 142:2): status rencana/laporan per semester. */
export default async function RekapKegiatanPage() {
  const session = await getServerSession(authOptions);

  const periode = await prisma.periode_bkd.findMany({ orderBy: { tanggal_mulai: "desc" } });
  const lkds = await prisma.lkd.findMany({
    where: { id_pengguna: session!.user.id },
    include: { simpulan: true },
  });

  const byPeriode = (idPeriode: string, jenis: string) =>
    lkds.find((l: any) => l.id_periode === idPeriode && l.jenis === jenis);

  const simpulanLabel = (s: any, field: string) =>
    s?.[field] === "M" ? "Memenuhi" : s?.[field] === "TM" ? "Tidak Memenuhi" : "-";

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
        <b>Info:</b> Pengisian rencana akan otomatis terisi, jika laporan kinerja pada semester
        tersebut sudah divalidasi.
      </InfoBox>

      <div className="mt-4">
        <DataTable
          columns={[
            { label: "Semester", width: "140px" },
            { label: "Simpulan Kinerja", width: "130px" },
            { label: "Simpulan Kewajiban Khusus", width: "160px" },
            { label: "Simpulan Final", width: "130px" },
            { label: "Rencana", width: "220px" },
            { label: "Laporan", width: "230px" },
          ]}
        >
          {periode.map((p: any) => {
            const rencana = byPeriode(p.id_periode, "rencana");
            const laporan = byPeriode(p.id_periode, "laporan");
            const s = laporan?.simpulan;
            const aktif = p.status === "aktif";
            return (
              <tr key={p.id_periode} className={aktif && !laporan ? "!bg-[#fdeff0]/40" : ""}>
                <td>{p.nama_periode}</td>
                <td className={s?.status_final ? "!text-success-tx" : "!text-crumb"}>
                  {simpulanLabel(s, "status_final")}
                </td>
                <td className={s?.status_kewajiban_khusus ? "!text-success-tx" : "!text-crumb"}>
                  {simpulanLabel(s, "status_kewajiban_khusus")}
                </td>
                <td className={s?.status_final ? "!text-success-tx" : "!text-crumb"}>
                  {simpulanLabel(s, "status_final")}
                </td>
                <td>
                  {rencana ? (
                    <Link
                      href={`/dosen/rekap-kegiatan/${rencana.id_lkd}`}
                      className="inline-block rounded-md bg-primary px-3 py-1.5 text-[10.5px] font-medium text-white"
                    >
                      ✓ Lihat Rencana Kerja
                    </Link>
                  ) : aktif ? (
                    <form action={buatLkd}>
                      <input type="hidden" name="jenis" value="rencana" />
                      <button className="rounded-md bg-primary-soft px-3 py-1.5 text-[10.5px] font-medium text-primary">
                        + Isi Rencana Kerja
                      </button>
                    </form>
                  ) : (
                    <span className="text-crumb">-</span>
                  )}
                </td>
                <td>
                  {laporan ? (
                    <Link
                      href={`/dosen/rekap-kegiatan/${laporan.id_lkd}`}
                      className="inline-block rounded-md bg-success-deep px-3 py-1.5 text-[10.5px] font-medium text-white"
                    >
                      ✎ Lihat Laporan Kinerja
                    </Link>
                  ) : aktif ? (
                    <form action={buatLkd}>
                      <input type="hidden" name="jenis" value="laporan" />
                      <button className="rounded-md bg-warning-deep px-3 py-1.5 text-[10.5px] font-medium text-white">
                        ✎ Lengkapi Laporan Kinerja
                      </button>
                    </form>
                  ) : (
                    <span className="text-crumb">-</span>
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
