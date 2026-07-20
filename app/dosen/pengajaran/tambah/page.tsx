import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import AppShell from "../../../../components/AppShell";
import TambahKegiatanForm from "../../../../components/TambahKegiatanForm";

export default async function TambahPengajaranPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const session = await getServerSession(authOptions);

  return (
    <AppShell
      peran="dosen"
      nama={session?.user.name ?? "-"}
      deskripsi="Dosen, D3 Teknik Informatika"
      breadcrumb={["Beranda", "Pelaksanaan pendidikan", "Pengajaran", "Tambah Kegiatan"]}
      title="Tambah Kegiatan — Pengajaran"
      subtitle="Isi parameter kegiatan; SKS dihitung otomatis oleh smart contract"
    >
      <TambahKegiatanForm slug="pengajaran" kodeRules={["EDU101"]} selectedKode={searchParams.ref} />
    </AppShell>
  );
}
