import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { KATEGORI_DOSEN } from "../../../lib/kategoriDosen";
import { KOLOM_KATEGORI } from "../../../lib/kolomKategori";
import { faseAktif, bolehDosenInput, FASE_LABEL } from "../../../lib/fase";
import AppShell from "../../../components/AppShell";
import TabelData from "../../../components/TabelData";
import { IconDoc, IconEye, IconPencil, IconTrash } from "../../../components/Icons";
import { hapusKegiatan } from "../_shared/kegiatanActions";

/** Menu kategori dosen: kolom mengikuti frame Figma masing-masing + aksi lihat/edit/hapus. */
export default async function KategoriPage({ params }: { params: { kategori: string } }) {
  const kategori = KATEGORI_DOSEN[params.kategori];
  const kolom = KOLOM_KATEGORI[params.kategori];
  if (!kategori || !kolom) notFound();

  const session = await getServerSession(authOptions);
  const [periode, dosen] = await Promise.all([
    prisma.periode_bkd.findFirst({ where: { status: "aktif" } }),
    prisma.pengguna.findUnique({ where: { id_pengguna: session!.user.id } }),
  ]);
  const fase = periode ? faseAktif(periode) : null;
  const bisaInput = fase ? bolehDosenInput(fase) : false;
  const ctx = {
    periode: periode?.nama_periode,
    prodi: dosen?.program_studi ?? "-",
    namaDosen: dosen?.nama,
  };

  const kegiatan = periode
    ? await prisma.kegiatan.findMany({
        where: {
          lkd: { id_pengguna: session!.user.id, id_periode: periode.id_periode },
          referensi_kegiatan: { kode_rule: { in: kategori.kodeRules } },
        },
        include: { referensi_kegiatan: true },
        orderBy: { created_at: "asc" },
      })
    : [];

  return (
    <AppShell
      peran="dosen"
      nama={session?.user.name ?? "-"}
      deskripsi="Dosen, D3 Teknik Informatika"
      breadcrumb={["Beranda", "Pelaksanaan pendidikan", kategori.label]}
      title={kategori.label}
      subtitle={kategori.subtitle}
      actions={
        <>
          <span className="rounded-lg border border-line px-3 py-2 text-xs text-navy">
            {periode && fase ? `${periode.nama_periode} · ${FASE_LABEL[fase]}` : "Belum ada periode aktif"}
          </span>
          {!kategori.sumberPenugasan && bisaInput && (
            <Link
              href={`/dosen/${params.kategori}/tambah`}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white"
            >
              + Tambah kegiatan
            </Link>
          )}
        </>
      }
    >
      <div className="mt-4">
        <TabelData
          placeholderCari="Cari kegiatan…"
          kosong={
            kategori.sumberPenugasan
              ? "Belum ada data penugasan dari admin maupun dokumen SK/ST untuk periode ini."
              : "Belum ada kegiatan."
          }
          kolom={[
            { label: "No.", width: "50px" },
            ...kolom.map((c) => ({ label: c.label, width: c.width, urut: true })),
            { label: "Rubrik BKD", width: "120px" },
            { label: "Aksi", width: "130px" },
          ]}
          baris={kegiatan.map((k: any, i: number) => {
            const manual = k.sumber_data === "manual";
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
                    href={`/dosen/${params.kategori}/${k.id_kegiatan}`}
                    className="rounded-md bg-primary-soft p-2 text-primary"
                    title="Lihat detail"
                  >
                    <IconEye size={13} />
                  </Link>
                  <Link
                    href={`/dosen/${params.kategori}/${k.id_kegiatan}/bukti`}
                    className="rounded-md bg-primary p-2 text-white"
                    title="Bukti kegiatan"
                  >
                    <IconDoc size={13} />
                  </Link>
                  {manual && bisaInput && (
                    <>
                      <Link
                        href={`/dosen/${params.kategori}/${k.id_kegiatan}/edit`}
                        className="rounded-md bg-head-bg p-2 text-muted"
                        title="Edit kegiatan"
                      >
                        <IconPencil size={13} />
                      </Link>
                      <form action={hapusKegiatan}>
                        <input type="hidden" name="slug" value={params.kategori} />
                        <input type="hidden" name="id_kegiatan" value={k.id_kegiatan} />
                        <button
                          className="rounded-md bg-danger-soft p-2 text-danger"
                          title="Hapus kegiatan"
                        >
                          <IconTrash size={13} />
                        </button>
                      </form>
                    </>
                  )}
                </div>,
              ],
            };
          })}
        />
      </div>
    </AppShell>
  );
}
