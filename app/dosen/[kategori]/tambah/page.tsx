import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { KATEGORI_DOSEN } from "../../../../lib/kategoriDosen";
import AppShell from "../../../../components/AppShell";
import TambahKegiatanForm from "../../../../components/TambahKegiatanForm";

export default async function TambahKegiatanKategoriPage({
  params,
  searchParams,
}: {
  params: { kategori: string };
  searchParams: { ref?: string };
}) {
  const kategori = KATEGORI_DOSEN[params.kategori];
  if (!kategori) notFound();
  const session = await getServerSession(authOptions);

  return (
    <AppShell
      peran="dosen"
      nama={session?.user.name ?? "-"}
      deskripsi="Dosen, D3 Teknik Informatika"
      breadcrumb={["Beranda", "Pelaksanaan pendidikan", kategori.label, "Tambah Kegiatan"]}
      title={`Tambah Kegiatan — ${kategori.label}`}
      subtitle="Isi parameter kegiatan; SKS dihitung otomatis oleh smart contract"
    >
      <TambahKegiatanForm
        slug={params.kategori}
        kodeRules={kategori.kodeRules}
        selectedKode={searchParams.ref}
      />
    </AppShell>
  );
}
