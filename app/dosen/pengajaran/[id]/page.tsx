import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import AppShell from "../../../../components/AppShell";
import BuktiKegiatanDetail from "../../../../components/BuktiKegiatanDetail";

/** Lihat detail kegiatan pengajaran (read-only; upload bukti via Layanan BKD). */
export default async function DetailPengajaranPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const kegiatan = await prisma.kegiatan.findUnique({
    where: { id_kegiatan: params.id },
    include: {
      lkd: { include: { periode_bkd: true } },
      referensi_kegiatan: true,
      dokumen_kegiatan: { orderBy: { tanggal_upload: "desc" } },
    },
  });
  if (!kegiatan || kegiatan.lkd.id_pengguna !== session!.user.id) notFound();

  return (
    <AppShell
      peran="dosen"
      nama={session?.user.name ?? "-"}
      deskripsi="Dosen, D3 Teknik Informatika"
      breadcrumb={["Beranda", "Pelaksanaan pendidikan", "Pengajaran", "Detail"]}
      title={`Detail Kegiatan - Semester ${kegiatan.lkd.periode_bkd.nama_periode}`}
    >
      <BuktiKegiatanDetail
        kegiatan={kegiatan}
        returnTo="/dosen/pengajaran"
        backHref="/dosen/pengajaran"
        canUpload={false}
      />
    </AppShell>
  );
}
