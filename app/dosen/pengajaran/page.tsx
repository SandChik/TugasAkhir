import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { KOLOM_KATEGORI } from "../../../lib/kolomKategori";
import { faseAktif, FASE_LABEL } from "../../../lib/fase";
import AppShell from "../../../components/AppShell";
import TabelData from "../../../components/TabelData";
import { IconEye, IconUpload } from "../../../components/Icons";

/** Menu Pengajaran (frame 29:2): kolom sesuai mockup; sumber penugasan, read-only. */
export default async function PengajaranPage() {
  const session = await getServerSession(authOptions);
  const [periode, dosen] = await Promise.all([
    prisma.periode_bkd.findFirst({ where: { status: "aktif" } }),
    prisma.pengguna.findUnique({ where: { id_pengguna: session!.user.id } }),
  ]);
  const fase = periode ? faseAktif(periode) : "selesai";
  const kolom = KOLOM_KATEGORI["pengajaran"];
  const ctx = {
    periode: periode?.nama_periode,
    prodi: dosen?.program_studi ?? "-",
    namaDosen: dosen?.nama,
  };

  const kegiatan = periode
    ? await prisma.kegiatan.findMany({
        where: {
          lkd: { id_pengguna: session!.user.id, id_periode: periode.id_periode },
          referensi_kegiatan: { kode_rule: "EDU101" },
        },
        include: {
          referensi_kegiatan: true,
          // Lampiran surat dari admin tidak dihitung sebagai artefak dosen,
          // jadi jumlahnya dihitung di sini (bukan lewat _count).
          unggahan_dokumen: { select: { file_url: true } },
          dokumen_kegiatan: { select: { file_url: true } },
        },
        orderBy: { created_at: "asc" },
      })
    : [];

  return (
    <AppShell
      peran="dosen"
      nama={session?.user.name ?? "-"}
      deskripsi="Dosen, D3 Teknik Informatika"
      breadcrumb={["Beranda", "Pelaksanaan pendidikan", "Pengajaran"]}
      title="Pengajaran"
      subtitle="Kegiatan perkuliahan sesuai penugasan Anda pada periode berjalan"
      actions={
        <span className="rounded-lg border border-line px-3 py-2 text-xs text-navy">
          {periode?.nama_periode ?? "Belum ada periode aktif"} · {FASE_LABEL[fase]}
        </span>
      }
    >
      <div className="mt-4">
        <TabelData
          placeholderCari="Cari mata kuliah atau kelas…"
          kosong="Belum ada data pengajaran dari admin maupun Surat Penugasan Pengajaran untuk periode ini."
          kolom={[
            { label: "No.", width: "50px" },
            ...kolom.map((c) => ({ label: c.label, width: c.width, urut: true })),
            { label: "Rubrik BKD", width: "120px" },
            { label: "Aksi", width: "110px" },
          ]}
          baris={kegiatan.map((k: any, i: number) => {
            const surat = k.unggahan_dokumen?.file_url ?? null;
            const jumlahArtefak = k.dokumen_kegiatan.filter(
              (d: any) => !surat || d.file_url !== surat
            ).length;
            const isi = kolom.map((c) => c.get(k, ctx));
            return {
              id: k.id_kegiatan,
              nilai: [i + 1, ...isi, "Rubrik BKD 2021", null],
              sel: [
                i + 1,
                ...isi,
                <span className="text-primary">Rubrik BKD 2021</span>,
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/dosen/pengajaran/${k.id_kegiatan}`}
                    className="inline-block rounded-md bg-primary-soft p-2 text-primary hover:bg-[#dde9fb]"
                    title="Lihat detail"
                  >
                    <IconEye size={13} />
                  </Link>
                  <Link
                    href={`/dosen/pengajaran/${k.id_kegiatan}#unggah-bukti`}
                    className="relative inline-block rounded-md bg-primary-soft p-2 text-primary hover:bg-[#dde9fb]"
                    title={
                      jumlahArtefak > 0
                        ? `Unggah bukti (${jumlahArtefak} artefak terunggah)`
                        : "Unggah bukti — Anda belum mengunggah artefak"
                    }
                  >
                    <IconUpload size={13} />
                    {jumlahArtefak === 0 && (
                      <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-danger" />
                    )}
                  </Link>
                </div>,
              ],
            };
          })}
        />
      </div>
    </AppShell>
  );
}
