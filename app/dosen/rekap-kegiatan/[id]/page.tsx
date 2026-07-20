import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { SEKSI_BKD, CAPAIAN_LABEL } from "../../../../lib/seksiBkd";
import AppShell from "../../../../components/AppShell";
import StatusChip, { STATUS_VARIAN } from "../../../../components/StatusChip";
import InfoBox from "../../../../components/InfoBox";
import { tarikData, simpanPermanen, ubahCapaian } from "../actions";

const TABS = [
  "Biodata",
  "Pelaksanaan Pendidikan",
  "Pelaksanaan Penelitian",
  "Pelaksanaan Pengabdian",
  "Pelaksanaan Penunjang",
  "Simpulan",
];

/** Halaman Rencana/Laporan BKD Pel Pendidikan (mockup 164:2 / 173:2). */
export default async function LkdDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const lkd = await prisma.lkd.findUnique({
    where: { id_lkd: params.id },
    include: {
      periode_bkd: true,
      kegiatan: { include: { referensi_kegiatan: true }, orderBy: { created_at: "asc" } },
    },
  });
  if (!lkd || lkd.id_pengguna !== session!.user.id) notFound();

  const judul = lkd.jenis === "rencana" ? "Rencana Beban Kerja Dosen" : "Laporan Kinerja Dosen";
  const totalSks = lkd.kegiatan.reduce((a: number, k: any) => a + (k.sks_dihitung_x100 ?? 0), 0);
  const editable = !lkd.simpan_permanen;

  const bySeksi = (kodeRules: string[]) =>
    lkd.kegiatan.filter((k: any) => kodeRules.includes(k.referensi_kegiatan.kode_rule));

  return (
    <AppShell
      peran="dosen"
      nama={session?.user.name ?? "-"}
      deskripsi="Dosen, D3 Teknik Informatika"
      breadcrumb={["Beranda", "Layanan BKD", "Rekap kegiatan", "Detail"]}
      title={`🏛 ${judul} - Semester ${lkd.periode_bkd.nama_periode}`}
      actions={
        lkd.jenis === "laporan" ? (
          editable ? (
            <form action={tarikData}>
              <input type="hidden" name="id_lkd" value={lkd.id_lkd} />
              <button className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white">
                ↻ Tarik Semua Kinerja dari Portofolio
              </button>
            </form>
          ) : (
            <StatusChip label="Tersimpan permanen" variant="success" />
          )
        ) : undefined
      }
    >
      <InfoBox>
        <b>Info untuk dosen:</b> Total SKS terhitung saat ini:{" "}
        <b>{(totalSks / 100).toFixed(2)} SKS</b>.{" "}
        {lkd.jenis === "laporan"
          ? editable
            ? "Setelah seluruh kegiatan lengkap, klik Simpan Permanen agar asesor dapat menilai."
            : "Dokumen terkunci dan menunggu/selesai dinilai asesor."
          : "Rencana kerja diisi pada awal semester."}
      </InfoBox>

      {/* Tab (visual) */}
      <div className="mt-4 flex gap-2 border-b border-line pb-0">
        {TABS.map((t) => (
          <span
            key={t}
            className={`rounded-t-md px-3.5 py-2.5 text-[11.5px] ${
              t === "Pelaksanaan Pendidikan"
                ? "bg-primary font-medium text-white"
                : "text-crumb"
            }`}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Seksi B0, A, B..N */}
      <div className="mt-5 space-y-6">
        {SEKSI_BKD.map((s) => {
          const items = bySeksi(s.kodeRules);
          return (
            <section key={s.key} className="rounded-[10px] border border-line p-4">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-[11.5px] font-semibold text-cell">
                  {s.letter}. {s.title}
                </h2>
                {lkd.jenis === "laporan" && editable && (
                  <form action={tarikData}>
                    <input type="hidden" name="id_lkd" value={lkd.id_lkd} />
                    <input type="hidden" name="seksi" value={s.key} />
                    <button className="shrink-0 rounded-md bg-primary-soft px-3 py-1.5 text-[10.5px] font-medium text-primary">
                      ↻ Tarik data
                    </button>
                  </form>
                )}
              </div>
              {s.sumberTarik && (
                <p className="mt-2 inline-block rounded bg-info-bg px-2.5 py-1.5 text-[10.5px] text-info-tx">
                  Data diambil dari menu: <b>{s.sumberTarik}</b>
                </p>
              )}

              {items.length === 0 ? (
                <div className="mt-3 rounded-lg bg-info-bg py-5 text-center text-[11.5px] font-medium text-primary">
                  Belum ada data yang di klaim
                </div>
              ) : (
                <div className="mt-3 overflow-hidden rounded-[10px] border border-line">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-head-bg">
                        {["No", "Nama Kegiatan", "Status", "SKS BKD", "Aksi"].map((h, i) => (
                          <th
                            key={h}
                            className="border-l border-line-grid px-3.5 py-2.5 text-[11.5px] font-medium text-head-tx first:border-l-0"
                            style={{ width: [40, undefined, 150, 90, 190][i] }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="[&>tr]:border-t [&>tr]:border-line [&_td]:border-l [&_td]:border-line-grid [&_td]:px-3.5 [&_td]:py-2.5 [&_td]:text-[11.5px] [&_td]:text-cell [&_td:first-child]:border-l-0">
                      {items.map((k: any, i: number) => (
                        <tr key={k.id_kegiatan}>
                          <td>{i + 1}</td>
                          <td>
                            {k.judul}
                            <span className="block text-[10px] text-crumb">
                              {k.referensi_kegiatan.kode_rule} ·{" "}
                              {k.sks_dihitung_x100 != null
                                ? `${(k.sks_dihitung_x100 / 100).toFixed(2)} sks`
                                : "belum dihitung"}
                            </span>
                          </td>
                          <td>
                            {k.status_capaian ? (
                              <StatusChip
                                label={CAPAIAN_LABEL[k.status_capaian]}
                                variant={STATUS_VARIAN[k.status_capaian] ?? "neutral"}
                              />
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>
                            {k.sks_dihitung_x100 != null
                              ? (k.sks_dihitung_x100 / 100).toFixed(2)
                              : "-"}
                          </td>
                          <td>
                            {editable ? (
                              <form action={ubahCapaian} className="flex items-center gap-1.5">
                                <input type="hidden" name="id_kegiatan" value={k.id_kegiatan} />
                                <input type="hidden" name="id_lkd" value={lkd.id_lkd} />
                                <select
                                  name="capaian"
                                  defaultValue={k.status_capaian ?? "berlanjut"}
                                  className="rounded border border-line bg-white px-1.5 py-1 text-[10px]"
                                >
                                  {Object.entries(CAPAIAN_LABEL).map(([v, l]) => (
                                    <option key={v} value={v}>
                                      {l}
                                    </option>
                                  ))}
                                </select>
                                <button className="rounded bg-primary-soft px-2 py-1 text-[10px] font-medium text-primary">
                                  Ubah
                                </button>
                              </form>
                            ) : (
                              <span className="text-crumb">terkunci</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Simpan permanen */}
      {lkd.jenis === "laporan" && editable && (
        <form action={simpanPermanen} className="mt-6">
          <input type="hidden" name="id_lkd" value={lkd.id_lkd} />
          <button className="w-full rounded-lg bg-success-deep py-3 text-xs font-medium text-white">
            🔒 Simpan Permanen (kunci untuk penilaian asesor)
          </button>
        </form>
      )}
    </AppShell>
  );
}
