import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { KATEGORI_DOSEN } from "../../../lib/kategoriDosen";
import { faseAktif, bolehDosenInput, FASE_LABEL } from "../../../lib/fase";
import AppShell from "../../../components/AppShell";
import DataTable from "../../../components/DataTable";
import InfoBox from "../../../components/InfoBox";
import { hapusKegiatan } from "../_shared/kegiatanActions";

/** Menu kategori dosen (R7/R8/R9): tanpa kolom bukti; PDDikti read-only; aksi lihat/edit/hapus. */
export default async function KategoriPage({ params }: { params: { kategori: string } }) {
  const kategori = KATEGORI_DOSEN[params.kategori];
  if (!kategori) notFound();

  const session = await getServerSession(authOptions);
  const periode = await prisma.periode_bkd.findFirst({ where: { status: "aktif" } });
  const fase = periode ? faseAktif(periode) : "selesai";
  const bisaInput = periode ? bolehDosenInput(fase) : false;

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
          tidak dapat ditambah/diedit manual. Klaim data ini ke laporan melalui{" "}
          <b>Layanan BKD → Rekap Kegiatan</b>.
        </InfoBox>
      )}

      <div className="mt-4">
        <DataTable
          columns={[
            { label: "No.", width: "50px" },
            { label: "Nama Kegiatan" },
            { label: "Jenis Kegiatan", width: "240px" },
            { label: "SKS BKD", width: "90px" },
            { label: "Sumber", width: "100px" },
            { label: "Aksi", width: "150px" },
          ]}
        >
          {kegiatan.length === 0 ? (
            <tr>
              <td colSpan={6} className="!text-center !text-crumb">
                {kategori.sumberPddikti
                  ? "Belum ada data dari PDDikti untuk periode ini."
                  : "Belum ada kegiatan. Gunakan tombol Tambah kegiatan."}
              </td>
            </tr>
          ) : (
            kegiatan.map((k: any, i: number) => (
              <tr key={k.id_kegiatan}>
                <td>{i + 1}</td>
                <td>{k.judul}</td>
                <td className="!text-[10.5px] !text-muted">{k.referensi_kegiatan.nama_kegiatan}</td>
                <td>{k.sks_dihitung_x100 != null ? (k.sks_dihitung_x100 / 100).toFixed(2) : "-"}</td>
                <td>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                      k.sumber_data === "pddikti"
                        ? "bg-info-bg text-info-tx"
                        : "bg-head-bg text-muted"
                    }`}
                  >
                    {k.sumber_data === "pddikti" ? "PDDikti" : "Manual"}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dosen/${params.kategori}/${k.id_kegiatan}`}
                      className="rounded-md bg-primary-soft px-2.5 py-1.5 text-[10.5px] font-medium text-primary"
                      title="Lihat detail"
                    >
                      👁 Lihat
                    </Link>
                    {k.sumber_data === "manual" && bisaInput && (
                      <form action={hapusKegiatan}>
                        <input type="hidden" name="slug" value={params.kategori} />
                        <input type="hidden" name="id_kegiatan" value={k.id_kegiatan} />
                        <button
                          className="rounded-md bg-danger-soft px-2.5 py-1.5 text-[10.5px] font-medium text-danger"
                          title="Hapus"
                        >
                          🗑
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </DataTable>
      </div>
    </AppShell>
  );
}
