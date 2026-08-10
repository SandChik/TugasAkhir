import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { KATEGORI_DOSEN } from "../../../../lib/kategoriDosen";
import { faseAktif, bolehDosenInput } from "../../../../lib/fase";
import AppShell from "../../../../components/AppShell";
import BuktiKegiatanDetail from "../../../../components/BuktiKegiatanDetail";
import DetailBimbingan from "../../../../components/DetailBimbingan";
import { IconBack } from "../../../../components/Icons";

/** Lihat detail kegiatan kategori (read-only; upload bukti via Layanan BKD). */
export default async function DetailKategoriPage({
  params,
}: {
  params: { kategori: string; id: string };
}) {
  const kategori = KATEGORI_DOSEN[params.kategori];
  if (!kategori) notFound();

  const session = await getServerSession(authOptions);
  const [kegiatan, dosen] = await Promise.all([
    prisma.kegiatan.findUnique({
      where: { id_kegiatan: params.id },
      include: {
        lkd: { include: { periode_bkd: true } },
        referensi_kegiatan: true,
        unggahan_dokumen: { select: { file_url: true } },
        dokumen_kegiatan: { orderBy: { tanggal_upload: "desc" } },
      },
    }),
    prisma.pengguna.findUnique({ where: { id_pengguna: session!.user.id } }),
  ]);
  if (!kegiatan || kegiatan.lkd.id_pengguna !== session!.user.id) notFound();

  // Bimbingan mahasiswa punya tampilan detail sendiri (frame Figma 83:2).
  if (params.kategori === "bimbingan-mahasiswa") {
    return (
      <AppShell
        peran="dosen"
        nama={session?.user.name ?? "-"}
        deskripsi="Dosen, D3 Teknik Informatika"
        breadcrumb={["Beranda", "Pelaksanaan pendidikan", "Bimbingan mahasiswa"]}
        title="Detail Bimbingan Mahasiswa"
        actions={
          <Link
            href={`/dosen/${params.kategori}`}
            className="rounded-lg border border-line bg-white px-4 py-2 text-xs font-medium text-navy"
          >
            <span className="inline-flex items-center gap-1.5">
              <IconBack size={11} /> Kembali
            </span>
          </Link>
        }
      >
        <DetailBimbingan
          kegiatan={kegiatan}
          namaDosen={dosen?.nama ?? session?.user.name ?? "-"}
          prodi={dosen?.program_studi ?? "-"}
          slug={params.kategori}
          editable={
            !kegiatan.lkd.simpan_permanen && bolehDosenInput(faseAktif(kegiatan.lkd.periode_bkd))
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      peran="dosen"
      nama={session?.user.name ?? "-"}
      deskripsi="Dosen, D3 Teknik Informatika"
      breadcrumb={["Beranda", "Pelaksanaan pendidikan", kategori.label, "Detail"]}
      title={`Detail Kegiatan - Semester ${kegiatan.lkd.periode_bkd.nama_periode}`}
    >
      <BuktiKegiatanDetail
        kegiatan={kegiatan}
        returnTo={`/dosen/${params.kategori}`}
        backHref={`/dosen/${params.kategori}`}
        canUpload={false}
      />
    </AppShell>
  );
}
