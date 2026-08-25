import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import AppShell from "../../../components/AppShell";
import TabelData from "../../../components/TabelData";
import StatusChip, { STATUS_VARIAN } from "../../../components/StatusChip";
import { IconClipboardCheck, IconLock } from "../../../components/Icons";

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
      <TabelData
        placeholderCari="Cari nama atau NIDN dosen…"
        kosong="Belum ada penugasan penilaian."
        kolom={[
          { label: "No", width: "50px" },
          { label: "Nama/NIDN", urut: true },
          { label: "Periode", width: "150px", filter: true },
          { label: "Jenis", width: "100px", filter: true },
          { label: "Sebagai", width: "120px", filter: true },
          { label: "Status LKD", width: "155px", filter: true },
          { label: "Aksi", width: "70px" },
        ]}
        baris={penugasan.map((p: any, i: number) => {
          const statusLkd = p.lkd.simpan_permanen ? p.lkd.status : "Belum simpan permanen";
          return {
            id: p.id_penugasan,
            cari: p.lkd.pengguna.nidn ?? "",
            nilai: [
              i + 1,
              p.lkd.pengguna.nama,
              p.lkd.periode_bkd.nama_periode,
              p.lkd.jenis,
              `Asesor ke-${p.urutan}`,
              statusLkd,
              null,
            ],
            sel: [
              i + 1,
              <>
                {p.lkd.pengguna.nama}
                <span className="block text-[10px] text-crumb">{p.lkd.pengguna.nidn}</span>
              </>,
              p.lkd.periode_bkd.nama_periode,
              <span className="capitalize">{p.lkd.jenis}</span>,
              `Asesor ke-${p.urutan}`,
              p.lkd.simpan_permanen ? (
                <StatusChip
                  label={p.lkd.status}
                  variant={STATUS_VARIAN[p.lkd.status] ?? "neutral"}
                />
              ) : (
                <StatusChip label="Belum simpan permanen" variant="neutralSoft" />
              ),
              p.lkd.simpan_permanen ? (
                <a
                  href={`/asesor/penilaian/${p.id_penugasan}`}
                  title="Lakukan penilaian"
                  className="inline-block rounded-md bg-primary p-2 text-white hover:bg-[#255cc2]"
                >
                  <IconClipboardCheck size={13} />
                </a>
              ) : (
                <span
                  title="Belum bisa dinilai"
                  className="inline-block rounded-md border border-line bg-head-bg p-2 text-crumb"
                >
                  <IconLock size={13} />
                </span>
              ),
            ],
          };
        })}
      />
    </AppShell>
  );
}
