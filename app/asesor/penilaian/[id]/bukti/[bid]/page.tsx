import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/prisma";
import AppShell from "../../../../../../components/AppShell";
import DataTable from "../../../../../../components/DataTable";
import { IconDoc, IconBack } from "../../../../../../components/Icons";
import PratinjauPdf from "../../../../../../components/PratinjauPdf";
import { adalahPdf, tampilNilai } from "../../../../../../lib/tampilNilai";

const fmt = (d: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);

/** Viewer bukti untuk asesor (mockup "Dashboard Asesor - Bukti ..."): info + Dokumen Pendukung. */
export default async function BuktiAsesorPage({
  params,
}: {
  params: { id: string; bid: string };
}) {
  const session = await getServerSession(authOptions);

  const penugasan = await prisma.penugasan_asesor.findUnique({
    where: { id_penugasan: params.id },
    include: { lkd: { include: { periode_bkd: true, pengguna: true } } },
  });
  if (!penugasan || penugasan.id_asesor !== session!.user.id) notFound();

  const kegiatan = await prisma.kegiatan.findUnique({
    where: { id_kegiatan: params.bid },
    include: {
      referensi_kegiatan: true,
      dokumen_kegiatan: { orderBy: { tanggal_upload: "desc" } },
      unggahan_dokumen: { select: { file_url: true } },
    },
  });
  if (!kegiatan || kegiatan.id_lkd !== penugasan.id_lkd) notFound();

  // Lampiran surat tugas dari admin tetap ditampilkan sebagai rujukan, tetapi
  // diberi penanda — pembeda dari artefak yang diunggah dosen sendiri.
  const suratAdmin = (kegiatan as any).unggahan_dokumen?.file_url ?? null;

  const p: any = kegiatan.parameter ?? {};
  const d: any = kegiatan.detail_kegiatan ?? {};
  const fields: any[] = (kegiatan.referensi_kegiatan.skema_parameter as any)?.fields ?? [];

  const info: [string, string][] = [
    ["Rubrik", "Pelaksanaan Pendidikan"],
    ["Kegiatan", kegiatan.referensi_kegiatan.nama_kegiatan],
    ["Nama Kegiatan", kegiatan.judul],
    ["Dosen", `${penugasan.lkd.pengguna.nama} (${penugasan.lkd.pengguna.nidn ?? "-"})`],
    ["No. SK Kegiatan", d.no_sk ?? "-"],
    ["Tgl. SK Kegiatan", d.tgl_sk ?? "-"],
    ...fields
      .filter((f) => p[f.name] !== undefined)
      .map((f) => [f.label, tampilNilai(p[f.name], f.type)] as [string, string]),
    [
      "SKS BKD (hasil kontrak)",
      kegiatan.sks_dihitung_x100 != null ? (kegiatan.sks_dihitung_x100 / 100).toFixed(2) : "-",
    ],
  ];

  return (
    <AppShell
      peran="asesor"
      nama={session?.user.name ?? "-"}
      deskripsi="Asesor, Teknik Informatika"
      breadcrumb={["Beranda", "Layanan BKD", "Asesor BKD", "Peserta BKD", "Bukti Kegiatan"]}
      title={`Laporan Kinerja - Semester ${penugasan.lkd.periode_bkd.nama_periode}`}
    >
      <div className="overflow-hidden rounded-[10px] border border-line">
        {info.map(([label, value], i) => (
          <div
            key={label + i}
            className={`flex px-4 py-3.5 text-[11.5px] ${i % 2 === 1 ? "bg-zebra" : ""} ${
              i > 0 ? "border-t border-head-bg" : ""
            }`}
          >
            <span className="w-52 shrink-0 font-medium text-[#3a4a5f]">{label}</span>
            <span className="mr-3 text-[#3a4a5f]">:</span>
            <span className="text-muted">{value}</span>
          </div>
        ))}
      </div>

      <h2 className="mt-6 text-[12.5px] font-semibold text-navy">Dokumen Pendukung:</h2>
      <div className="mt-3">
        <DataTable
          columns={[
            { label: "No", width: "50px" },
            { label: "Nama file" },
            { label: "Dokumen", width: "120px" },
            { label: "Waktu Unggah", width: "300px" },
          ]}
        >
          {kegiatan.dokumen_kegiatan.length === 0 ? (
            <tr>
              <td colSpan={4} className="!bg-danger-soft !text-center !font-medium !text-danger">
                Tidak ada bukti dokumen
              </td>
            </tr>
          ) : (
            kegiatan.dokumen_kegiatan.map((dok: any, i: number) => (
              <tr key={dok.id_dokumen}>
                <td>{i + 1}</td>
                <td>
                  {dok.nama_dokumen}
                  {suratAdmin && dok.file_url === suratAdmin && (
                    <span className="ml-1.5 inline-block rounded bg-head-bg px-1.5 py-0.5 text-[9px] font-medium text-muted">
                      surat tugas dari admin
                    </span>
                  )}
                  {dok.nama_file && (
                    <span className="block text-[10px] text-crumb">{dok.nama_file}</span>
                  )}
                </td>
                <td>
                  {!dok.file_url ? (
                    "-"
                  ) : adalahPdf(dok) ? (
                    <PratinjauPdf
                      url={dok.file_url}
                      judul={dok.nama_dokumen}
                      className="inline-block rounded-md bg-primary px-2.5 py-1.5 text-[10.5px] font-medium text-white"
                    >
                      <IconDoc size={12} />
                    </PratinjauPdf>
                  ) : (
                    <a
                      href={dok.file_url}
                      target="_blank"
                      className="inline-block rounded-md bg-primary px-2.5 py-1.5 text-[10.5px] font-medium text-white"
                    >
                      <IconDoc size={12} />
                    </a>
                  )}
                </td>
                <td className="!text-muted">diunggah pada tgl {fmt(dok.tanggal_upload)}</td>
              </tr>
            ))
          )}
        </DataTable>
      </div>

      <div className="mt-5">
        <Link
          href={`/asesor/penilaian/${params.id}`}
          className="inline-block rounded-lg bg-head-bg px-4 py-2.5 text-xs font-medium text-muted"
        >
          <span className="inline-flex items-center gap-1.5"><IconBack size={11}/> Kembali</span>
        </Link>
      </div>
    </AppShell>
  );
}
