import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { KATEGORI_DOSEN } from "../../../../lib/kategoriDosen";
import AppShell from "../../../../components/AppShell";
import BuktiKegiatanDetail from "../../../../components/BuktiKegiatanDetail";

/** Detail kegiatan + bukti untuk kategori B-N (route generik). */
export default async function KategoriDetailPage({
  params,
}: {
  params: { kategori: string; id: string };
}) {
  const kategori = KATEGORI_DOSEN[params.kategori];
  if (!kategori) notFound();

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
      breadcrumb={["Beranda", "Pelaksanaan pendidikan", kategori.label, "Bukti Kegiatan"]}
      title={`Laporan Kinerja - Semester ${kegiatan.lkd.periode_bkd.nama_periode}`}
    >
      <BuktiKegiatanDetail
        kegiatan={kegiatan}
        slug={params.kategori}
        backHref={`/dosen/${params.kategori}`}
      />
    </AppShell>
  );
}
