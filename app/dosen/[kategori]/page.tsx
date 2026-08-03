import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { KATEGORI_DOSEN } from "../../../lib/kategoriDosen";
import { KOLOM_KATEGORI } from "../../../lib/kolomKategori";
import { faseAktif, bolehDosenInput, FASE_LABEL } from "../../../lib/fase";
import AppShell from "../../../components/AppShell";
import DataTable from "../../../components/DataTable";
import InfoBox from "../../../components/InfoBox";
import { IconEye, IconPencil, IconTrash } from "../../../components/Icons";
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
  const fase = periode ? faseAktif(periode) : "selesai";
  const bisaInput = periode ? bolehDosenInput(fase) : false;
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
            {periode?.nama_periode ?? "Belum ada periode aktif"} · {FASE_LABEL[fase]}
          </span>
          {!kategori.sumberPddikti && bisaInput && (
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
      {kategori.sumberPddikti && (
        <InfoBox>
          <b>Info:</b> Data {kategori.label.toLowerCase()} ditarik otomatis dari Feeder PDDikti dan
          dari hasil ekstraksi dokumen SK/ST yang diunggah admin, sehingga tidak dapat
          ditambah/diedit manual. Klaim data ini ke laporan melalui{" "}
          <b>Layanan BKD → Rekap Kegiatan</b>.
        </InfoBox>
      )}

      <div className="mt-4">
        <DataTable
          columns={[
            { label: "No.", width: "50px" },
            ...kolom.map((c) => ({ label: c.label, width: c.width })),
            { label: "Rubrik BKD", width: "120px" },
            { label: "Aksi", width: "130px" },
          ]}
        >
          {kegiatan.length === 0 ? (
            <tr>
              <td colSpan={kolom.length + 3} className="!text-center !text-crumb">
                {kategori.sumberPddikti
                  ? "Belum ada data dari PDDikti maupun dokumen SK/ST untuk periode ini."
                  : "Belum ada kegiatan. Gunakan tombol Tambah kegiatan."}
              </td>
            </tr>
          ) : (
            kegiatan.map((k: any, i: number) => {
              const manual = k.sumber_data === "manual";
              return (
                <tr key={k.id_kegiatan}>
                  <td>{i + 1}</td>
                  {kolom.map((c) => (
                    <td key={c.label}>{c.get(k, ctx)}</td>
                  ))}
                  <td className="!text-primary">Rubrik BKD 2021</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/dosen/${params.kategori}/${k.id_kegiatan}`}
                        className="rounded-md bg-primary-soft p-2 text-primary"
                        title="Lihat detail"
                      >
                        <IconEye size={13} />
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
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </DataTable>
      </div>
    </AppShell>
  );
}
