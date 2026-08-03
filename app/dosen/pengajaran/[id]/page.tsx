import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { faseAktif, bolehDosenInput, FASE_LABEL } from "../../../../lib/fase";
import AppShell from "../../../../components/AppShell";
import BuktiKegiatanDetail from "../../../../components/BuktiKegiatanDetail";

/** Bukti Ajar: detail kegiatan pengajaran + unggah dokumen bukti (artefak). */
export default async function DetailPengajaranPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const kegiatan = await prisma.kegiatan.findUnique({
    where: { id_kegiatan: params.id },
    include: {
      lkd: { include: { periode_bkd: true } },
      referensi_kegiatan: true,
      unggahan_dokumen: { select: { file_url: true } },
      dokumen_kegiatan: { orderBy: { tanggal_upload: "desc" } },
    },
  });
  if (!kegiatan || kegiatan.lkd.id_pengguna !== session!.user.id) notFound();

  const fase = faseAktif(kegiatan.lkd.periode_bkd);
  const bolehUnggah = !kegiatan.lkd.simpan_permanen && bolehDosenInput(fase);

  return (
    <AppShell
      peran="dosen"
      nama={session?.user.name ?? "-"}
      deskripsi="Dosen, D3 Teknik Informatika"
      breadcrumb={["Beranda", "Pelaksanaan pendidikan", "Pengajaran", "Bukti Ajar"]}
      title={`Laporan Kinerja - Semester ${kegiatan.lkd.periode_bkd.nama_periode}`}
    >
      {!bolehUnggah && (
        <div className="mb-4 rounded-lg bg-head-bg px-4 py-3 text-[11.5px] text-muted">
          Unggah bukti sedang tertutup — {kegiatan.lkd.simpan_permanen
            ? "laporan Anda sudah disimpan permanen."
            : `saat ini ${FASE_LABEL[fase].toLowerCase()}.`}{" "}
          Dokumen yang sudah ada tetap dapat dilihat.
        </div>
      )}
      <BuktiKegiatanDetail
        kegiatan={kegiatan}
        returnTo="/dosen/pengajaran"
        backHref="/dosen/pengajaran"
        canUpload={bolehUnggah}
      />
    </AppShell>
  );
}
