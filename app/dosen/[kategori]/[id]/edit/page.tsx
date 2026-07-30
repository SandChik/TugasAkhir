import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { KATEGORI_DOSEN } from "../../../../../lib/kategoriDosen";
import AppShell from "../../../../../components/AppShell";
import TambahKegiatanForm from "../../../../../components/TambahKegiatanForm";

/** Edit kegiatan manual: form yang sama dengan tambah, terisi nilai lama. */
export default async function EditKegiatanPage({
  params,
}: {
  params: { kategori: string; id: string };
}) {
  const kategori = KATEGORI_DOSEN[params.kategori];
  if (!kategori) notFound();

  const session = await getServerSession(authOptions);

  const kegiatan = await prisma.kegiatan.findUnique({
    where: { id_kegiatan: params.id },
    include: { lkd: true, referensi_kegiatan: true },
  });
  if (!kegiatan || kegiatan.lkd.id_pengguna !== session!.user.id) notFound();
  // Data PDDikti tidak dapat diedit manual
  if ((kegiatan as any).sumber_data !== "manual") redirect(`/dosen/${params.kategori}`);

  return (
    <AppShell
      peran="dosen"
      nama={session?.user.name ?? "-"}
      deskripsi="Dosen, D3 Teknik Informatika"
      breadcrumb={["Beranda", "Pelaksanaan pendidikan", kategori.label, "Edit Kegiatan"]}
      title={`Edit Kegiatan — ${kategori.label}`}
      subtitle="Ubah data kegiatan; SKS dihitung ulang otomatis oleh smart contract"
    >
      <TambahKegiatanForm
        slug={params.kategori}
        kodeRules={kategori.kodeRules}
        kegiatan={kegiatan}
      />
    </AppShell>
  );
}
