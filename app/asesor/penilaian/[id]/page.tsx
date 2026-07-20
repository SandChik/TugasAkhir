import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { SEKSI_BKD, CAPAIAN_LABEL } from "../../../../lib/seksiBkd";
import AppShell from "../../../../components/AppShell";
import StatusChip, { STATUS_VARIAN } from "../../../../components/StatusChip";
import InfoBox from "../../../../components/InfoBox";
import { simpanPenilaian } from "./actions";

const inputCls =
  "rounded-md border border-line px-2 py-1.5 text-[11px] outline-none placeholder:text-crumb focus:border-primary";

/** Penilaian LKD per seksi (mockup 229:2): B(diklat), A, B..N + satu Simpan Penilaian. */
export default async function PenilaianPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const penugasan = await prisma.penugasan_asesor.findUnique({
    where: { id_penugasan: params.id },
    include: {
      lkd: {
        include: {
          pengguna: true,
          periode_bkd: true,
          kegiatan: {
            include: {
              referensi_kegiatan: true,
              hasil_penilaian: true,
              _count: { select: { dokumen_kegiatan: true } },
            },
            orderBy: { created_at: "asc" },
          },
        },
      },
    },
  });
  if (!penugasan || penugasan.id_asesor !== session!.user.id) notFound();

  const lkd = penugasan.lkd;
  const bySeksi = (kodeRules: string[]) =>
    lkd.kegiatan.filter((k: any) => kodeRules.includes(k.referensi_kegiatan.kode_rule));
  const nilaiSaya = (k: any) =>
    k.hasil_penilaian.find((h: any) => h.id_penugasan === penugasan.id_penugasan);

  return (
    <AppShell
      peran="asesor"
      nama={session?.user.name ?? "-"}
      deskripsi="Asesor, Teknik Informatika"
      breadcrumb={["Beranda", "Layanan BKD", "Asesor BKD", "Peserta BKD", "Rincian Peserta"]}
      title={`🏛 Penilaian ${lkd.jenis === "rencana" ? "Rencana Kerja" : "Laporan Kinerja Dosen (LKD)"} - Semester ${lkd.periode_bkd.nama_periode}`}
      subtitle={`Dosen: ${lkd.pengguna.nama} (${lkd.pengguna.nidn ?? "-"}) — Anda asesor ke-${penugasan.urutan}`}
    >
      {!lkd.simpan_permanen ? (
        <div className="rounded-lg bg-danger-soft px-4 py-4 text-xs font-medium text-danger">
          Penilaian belum bisa dilakukan — dosen belum melakukan simpan permanen.
        </div>
      ) : (
        <form action={simpanPenilaian}>
          <input type="hidden" name="id_penugasan" value={penugasan.id_penugasan} />

          <InfoBox>
            <b>Info:</b> Nilai SKS hasil smart contract tampil sebagai acuan deterministik. Isi
            SKS keputusan Anda, status, dan komentar (wajib untuk Tolak/Revisi), lalu klik satu
            tombol <b>Simpan Penilaian</b> di bagian bawah.
          </InfoBox>

          <div className="mt-5 space-y-6">
            {SEKSI_BKD.map((s) => {
              const items = bySeksi(s.kodeRules);
              return (
                <section key={s.key} className="rounded-[10px] border border-line p-4">
                  <h2 className="text-[11.5px] font-semibold text-cell">
                    {s.letter}. {s.title}
                  </h2>
                  {items.length === 0 ? (
                    <div className="mt-3 rounded-lg bg-info-bg py-5 text-center text-[11.5px] font-medium text-primary">
                      Belum ada data yang di klaim
                    </div>
                  ) : (
                    <div className="mt-3 overflow-hidden rounded-[10px] border border-line">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="bg-head-bg">
                            {[
                              "No",
                              "Nama Kegiatan",
                              "Bukti",
                              "Capaian",
                              "SKS Kontrak",
                              "Penilaian Asesor (sks)",
                              "Status",
                              "Komentar",
                            ].map((h) => (
                              <th
                                key={h}
                                className="border-l border-line-grid px-3 py-2.5 text-[11px] font-medium text-head-tx first:border-l-0"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="[&>tr]:border-t [&>tr]:border-line [&_td]:border-l [&_td]:border-line-grid [&_td]:px-3 [&_td]:py-2.5 [&_td]:text-[11.5px] [&_td]:text-cell [&_td:first-child]:border-l-0">
                          {items.map((k: any, i: number) => {
                            const h = nilaiSaya(k);
                            return (
                              <tr key={k.id_kegiatan}>
                                <td className="w-10">{i + 1}</td>
                                <td>
                                  {k.judul}
                                  <span className="block text-[10px] text-crumb">
                                    {k.referensi_kegiatan.kode_rule}
                                  </span>
                                </td>
                                <td className="w-28">
                                  <Link
                                    href={`/asesor/penilaian/${penugasan.id_penugasan}/bukti/${k.id_kegiatan}`}
                                    className={`inline-block rounded-md px-2.5 py-1.5 text-[10px] font-medium ${
                                      k._count.dokumen_kegiatan > 0
                                        ? "bg-primary text-white"
                                        : "bg-danger-soft text-danger"
                                    }`}
                                  >
                                    {k._count.dokumen_kegiatan > 0
                                      ? `✔ ${k._count.dokumen_kegiatan} dokumen`
                                      : "✕ Tidak ada"}
                                  </Link>
                                </td>
                                <td className="w-24">
                                  {k.status_capaian ? (
                                    <StatusChip
                                      label={CAPAIAN_LABEL[k.status_capaian]}
                                      variant={STATUS_VARIAN[k.status_capaian] ?? "neutral"}
                                    />
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <td className="w-24">
                                  {k.sks_dihitung_x100 != null
                                    ? (k.sks_dihitung_x100 / 100).toFixed(2)
                                    : "manual"}
                                </td>
                                <td className="w-28">
                                  <input
                                    name={`sks_${k.id_kegiatan}`}
                                    defaultValue={
                                      h?.sks_disetujui_x100 != null
                                        ? (h.sks_disetujui_x100 / 100).toFixed(2)
                                        : k.sks_dihitung_x100 != null
                                          ? (k.sks_dihitung_x100 / 100).toFixed(2)
                                          : ""
                                    }
                                    className={`${inputCls} w-20`}
                                  />
                                </td>
                                <td className="w-28">
                                  <select
                                    name={`status_${k.id_kegiatan}`}
                                    defaultValue={h?.status ?? "disetujui"}
                                    className={`${inputCls} bg-white`}
                                  >
                                    <option value="disetujui">Disetujui</option>
                                    <option value="revisi">Revisi</option>
                                    <option value="ditolak">Ditolak</option>
                                  </select>
                                </td>
                                <td>
                                  <input
                                    name={`catatan_${k.id_kegiatan}`}
                                    defaultValue={h?.catatan ?? ""}
                                    placeholder="Komentar/rekomendasi"
                                    className={`${inputCls} w-full`}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          <button className="mt-6 w-full rounded-lg bg-success-deep py-3 text-xs font-medium text-white">
            💾 Simpan Penilaian
          </button>
        </form>
      )}

      <div className="mt-5">
        <Link
          href="/asesor/asesor-bkd"
          className="inline-block rounded-lg bg-head-bg px-4 py-2.5 text-xs font-medium text-muted"
        >
          ← Kembali
        </Link>
      </div>
    </AppShell>
  );
}
