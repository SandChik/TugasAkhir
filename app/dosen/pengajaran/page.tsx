import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { faseAktif, FASE_LABEL } from "../../../lib/fase";
import AppShell from "../../../components/AppShell";
import DataTable from "../../../components/DataTable";
import InfoBox from "../../../components/InfoBox";

/** Menu Pengajaran (R7/R8): sumber PDDikti, read-only, tanpa kolom bukti. */
export default async function PengajaranPage() {
  const session = await getServerSession(authOptions);
  const periode = await prisma.periode_bkd.findFirst({ where: { status: "aktif" } });
  const fase = periode ? faseAktif(periode) : "selesai";

  const kegiatan = periode
    ? await prisma.kegiatan.findMany({
        where: {
          lkd: { id_pengguna: session!.user.id, id_periode: periode.id_periode },
          referensi_kegiatan: { kode_rule: "EDU101" },
        },
        include: { referensi_kegiatan: true },
        orderBy: { created_at: "asc" },
      })
    : [];

  return (
    <AppShell
      peran="dosen"
      nama={session?.user.name ?? "-"}
      deskripsi="Dosen, D3 Teknik Informatika"
      breadcrumb={["Beranda", "Pelaksanaan pendidikan", "Pengajaran"]}
      title="Pengajaran"
      subtitle="Kegiatan perkuliahan pada periode berjalan (tersinkronisasi dari Feeder PDDikti)"
      actions={
        <span className="rounded-lg border border-line px-3 py-2 text-xs text-navy">
          {periode?.nama_periode ?? "Belum ada periode aktif"} · {FASE_LABEL[fase]}
        </span>
      }
    >
      <InfoBox>
        <b>Info:</b> Data pengajaran ditarik otomatis dari Feeder PDDikti dan tidak dapat
        ditambah/diedit manual. Klaim ke laporan melalui <b>Layanan BKD → Rekap Kegiatan</b>.
      </InfoBox>

      <div className="mt-4">
        <DataTable
          columns={[
            { label: "No.", width: "50px" },
            { label: "Mata Kuliah" },
            { label: "Kelas", width: "90px" },
            { label: "SKS", width: "70px" },
            { label: "SKS BKD", width: "100px" },
            { label: "Sumber", width: "100px" },
            { label: "Aksi", width: "110px" },
          ]}
        >
          {kegiatan.length === 0 ? (
            <tr>
              <td colSpan={7} className="!text-center !text-crumb">
                Belum ada data pengajaran dari PDDikti untuk periode ini.
              </td>
            </tr>
          ) : (
            kegiatan.map((k: any, i: number) => (
              <tr key={k.id_kegiatan}>
                <td>{i + 1}</td>
                <td>{k.judul}</td>
                <td>{(k.detail_kegiatan as any)?.kelas ?? "-"}</td>
                <td>{(k.parameter as any)?.sksMataKuliah ?? "-"}</td>
                <td>{k.sks_dihitung_x100 != null ? (k.sks_dihitung_x100 / 100).toFixed(2) : "-"}</td>
                <td>
                  <span className="rounded bg-info-bg px-2 py-0.5 text-[10px] font-medium text-info-tx">
                    PDDikti
                  </span>
                </td>
                <td>
                  <Link
                    href={`/dosen/pengajaran/${k.id_kegiatan}`}
                    className="rounded-md bg-primary-soft px-2.5 py-1.5 text-[10.5px] font-medium text-primary"
                  >
                    👁 Lihat
                  </Link>
                </td>
              </tr>
            ))
          )}
        </DataTable>
      </div>
    </AppShell>
  );
}
