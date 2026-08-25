import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { KATEGORI_DOSEN } from "../../../../../lib/kategoriDosen";
import { faseAktif, bolehUbahBukti, FASE_LABEL } from "../../../../../lib/fase";
import AppShell from "../../../../../components/AppShell";
import BuktiKegiatanDetail from "../../../../../components/BuktiKegiatanDetail";
import { tampilNilai } from "../../../../../lib/tampilNilai";

/**
 * Susunan kartu info bimbingan mengikuti frame Figma 249:2: Peran tepat di
 * bawah Nama Kegiatan, jumlah mahasiswa bersatuan, SKS bersufiks "SKS".
 */
function infoBimbingan(kegiatan: any): [string, string][] {
  const d: any = kegiatan.detail_kegiatan ?? {};
  const p: any = kegiatan.parameter ?? {};
  const ref = kegiatan.referensi_kegiatan;

  // "D. Membimbing tugas akhir" -> huruf "D." + uraian panjang nama kegiatan
  const huruf = String(ref.kategori ?? "").match(/^[A-N]\./)?.[0];
  const jumlahMahasiswa =
    p.jumlahMahasiswa ??
    d.jumlah_mahasiswa ??
    (Array.isArray(d.mahasiswa) && d.mahasiswa.length > 0 ? d.mahasiswa.length : null);

  return [
    ["Rubrik", "Pelaksanaan Pendidikan"],
    ["Kegiatan", huruf ? `${huruf} ${ref.nama_kegiatan}` : ref.nama_kegiatan],
    ["Nama Kegiatan", kegiatan.judul],
    ...(p.peran ? ([["Peran", tampilNilai(p.peran, "select")]] as [string, string][]) : []),
    ["No. SK Kegiatan", d.no_sk ?? "-"],
    ["Tgl. SK Kegiatan", d.tgl_sk ?? "-"],
    ["Jumlah Mahasiswa", jumlahMahasiswa != null ? `${jumlahMahasiswa} Mahasiswa` : "-"],
    [
      "SKS BKD (hasil kontrak)",
      kegiatan.sks_dihitung_x100 != null
        ? `${(kegiatan.sks_dihitung_x100 / 100).toFixed(2)} SKS`
        : "-",
    ],
  ];
}

/** Bukti Kegiatan (frame Figma 249:2): detail kegiatan + unggah dokumen bukti. */
export default async function BuktiKategoriPage({
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
      hasil_penilaian: { select: { status: true } },
      unggahan_dokumen: { select: { file_url: true } },
      dokumen_kegiatan: { orderBy: { tanggal_upload: "desc" } },
    },
  });
  if (!kegiatan || kegiatan.lkd.id_pengguna !== session!.user.id) notFound();

  const fase = faseAktif(kegiatan.lkd.periode_bkd);
  const bolehUnggah = bolehUbahBukti(kegiatan);
  const jalurDetail = `/dosen/${params.kategori}/${params.id}`;

  return (
    <AppShell
      peran="dosen"
      nama={session?.user.name ?? "-"}
      deskripsi="Dosen, D3 Teknik Informatika"
      breadcrumb={["Beranda", "Pelaksanaan pendidikan", kategori.label, "Bukti Kegiatan"]}
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
        returnTo={`${jalurDetail}/bukti`}
        backHref={jalurDetail}
        canUpload={bolehUnggah}
        infoOverride={
          params.kategori === "bimbingan-mahasiswa" ? infoBimbingan(kegiatan) : undefined
        }
      />
    </AppShell>
  );
}
