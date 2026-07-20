import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import AppShell from "../../../components/AppShell";
import DataTable from "../../../components/DataTable";

/** Dashboard Dosen - Pengajaran (UID-02): daftar kegiatan pengajaran pada periode berjalan. */
export default async function PengajaranPage() {
  const session = await getServerSession(authOptions);

  const periodeAktif = await prisma.periode_bkd.findFirst({ where: { status: "aktif" } });

  const kegiatan = periodeAktif
    ? await prisma.kegiatan.findMany({
        where: {
          lkd: { id_pengguna: session!.user.id, id_periode: periodeAktif.id_periode },
          referensi_kegiatan: { kode_rule: "EDU101" },
        },
        include: {
          referensi_kegiatan: true,
          _count: { select: { dokumen_kegiatan: true } },
        },
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
      subtitle="Kegiatan perkuliahan yang Anda input pada periode berjalan"
      actions={
        <>
          <span className="rounded-lg border border-line px-3 py-2 text-xs text-navy">
            {periodeAktif?.nama_periode ?? "Belum ada periode aktif"}
          </span>
          <Link
            href="/dosen/pengajaran/tambah"
            className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white"
          >
            + Tambah kegiatan
          </Link>
        </>
      }
    >
      <DataTable
        columns={[
          { label: "No.", width: "50px" },
          { label: "Mata Kuliah" },
          { label: "Kelas", width: "90px" },
          { label: "SKS", width: "70px" },
          { label: "SKS BKD", width: "100px" },
          { label: "Status", width: "100px" },
          { label: "Bukti Ajar", width: "160px" },
          { label: "Rubrik BKD", width: "120px" },
        ]}
      >
        {kegiatan.length === 0 ? (
          <tr>
            <td colSpan={8} className="!text-center !text-crumb">
              Belum ada kegiatan pengajaran pada periode ini.
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
              <td className="capitalize">{k.status}</td>
              <td>
                {k._count.dokumen_kegiatan === 0 ? (
                  <Link
                    href={`/dosen/pengajaran/${k.id_kegiatan}`}
                    className="inline-block rounded-md bg-danger-soft px-3 py-1.5 text-[10.5px] font-medium text-danger hover:opacity-80"
                    title="Klik untuk mengunggah bukti ajar"
                  >
                    ✕ Belum ada bukti
                  </Link>
                ) : (
                  <Link
                    href={`/dosen/pengajaran/${k.id_kegiatan}`}
                    className="inline-block rounded-md bg-[#e6f4ec] px-3 py-1.5 text-[10.5px] font-medium text-success-tx hover:opacity-80"
                  >
                    ✓ {k._count.dokumen_kegiatan} dokumen
                  </Link>
                )}
              </td>
              <td className="!text-primary">Rubrik BKD 2021</td>
            </tr>
          ))
        )}
      </DataTable>
    </AppShell>
  );
}
