import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { KOLOM_KATEGORI } from "../../../lib/kolomKategori";
import { faseAktif, FASE_LABEL } from "../../../lib/fase";
import AppShell from "../../../components/AppShell";
import DataTable from "../../../components/DataTable";
import InfoBox from "../../../components/InfoBox";
import { IconEye } from "../../../components/Icons";

/** Menu Pengajaran (frame 29:2): kolom sesuai mockup; sumber PDDikti, read-only. */
export default async function PengajaranPage() {
  const session = await getServerSession(authOptions);
  const [periode, dosen] = await Promise.all([
    prisma.periode_bkd.findFirst({ where: { status: "aktif" } }),
    prisma.pengguna.findUnique({ where: { id_pengguna: session!.user.id } }),
  ]);
  const fase = periode ? faseAktif(periode) : "selesai";
  const kolom = KOLOM_KATEGORI["pengajaran"];
  const ctx = {
    periode: periode?.nama_periode,
    prodi: dosen?.program_studi ?? "-",
    namaDosen: dosen?.nama,
  };

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
      subtitle="Kegiatan perkuliahan yang Anda input pada periode berjalan"
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
            ...kolom.map((c) => ({ label: c.label, width: c.width })),
            { label: "Rubrik BKD", width: "120px" },
            { label: "Aksi", width: "100px" },
          ]}
        >
          {kegiatan.length === 0 ? (
            <tr>
              <td colSpan={kolom.length + 3} className="!text-center !text-crumb">
                Belum ada data pengajaran dari PDDikti untuk periode ini.
              </td>
            </tr>
          ) : (
            kegiatan.map((k: any, i: number) => (
              <tr key={k.id_kegiatan}>
                <td>{i + 1}</td>
                {kolom.map((c) => (
                  <td key={c.label}>{c.get(k, ctx)}</td>
                ))}
                <td className="!text-primary">Rubrik BKD 2021</td>
                <td>
                  <Link
                    href={`/dosen/pengajaran/${k.id_kegiatan}`}
                    className="inline-block rounded-md bg-primary-soft p-2 text-primary"
                    title="Lihat detail"
                  >
                    <IconEye size={13} />
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
