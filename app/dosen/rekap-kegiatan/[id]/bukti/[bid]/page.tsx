import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/prisma";
import { faseAktif, bolehDosenInput } from "../../../../../../lib/fase";
import AppShell from "../../../../../../components/AppShell";
import BuktiKegiatanDetail from "../../../../../../components/BuktiKegiatanDetail";

/** Upload/lihat bukti kegiatan dari konteks LKD (Layanan BKD). */
export default async function LkdBuktiPage({
  params,
}: {
  params: { id: string; bid: string };
}) {
  const session = await getServerSession(authOptions);

  const kegiatan = await prisma.kegiatan.findUnique({
    where: { id_kegiatan: params.bid },
    include: {
      lkd: { include: { periode_bkd: true } },
      referensi_kegiatan: true,
      unggahan_dokumen: { select: { file_url: true } },
      dokumen_kegiatan: { orderBy: { tanggal_upload: "desc" } },
    },
  });
  if (
    !kegiatan ||
    kegiatan.id_lkd !== params.id ||
    kegiatan.lkd.id_pengguna !== session!.user.id
  )
    notFound();

  const editable =
    !kegiatan.lkd.simpan_permanen && bolehDosenInput(faseAktif(kegiatan.lkd.periode_bkd));
  const back = `/dosen/rekap-kegiatan/${params.id}?tab=pendidikan`;

  return (
    <AppShell
      peran="dosen"
      nama={session?.user.name ?? "-"}
      deskripsi="Dosen, D3 Teknik Informatika"
      breadcrumb={["Beranda", "Layanan BKD", "Rekap kegiatan", "Bukti Kegiatan"]}
      title={`Bukti Kegiatan - ${kegiatan.judul}`}
    >
      <BuktiKegiatanDetail
        kegiatan={kegiatan}
        returnTo={back}
        backHref={back}
        canUpload={editable}
      />
    </AppShell>
  );
}
