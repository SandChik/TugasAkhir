import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { SEKSI_BKD, CAPAIAN_LABEL } from "../../../../lib/seksiBkd";
import { faseAktif, bolehAsesorNilai, FASE_LABEL } from "../../../../lib/fase";
import AppShell from "../../../../components/AppShell";
import StatusChip, { STATUS_VARIAN } from "../../../../components/StatusChip";
import InfoBox from "../../../../components/InfoBox";
import { simpanPenilaian, sahkanPenilaian } from "./actions";
import { IconSave, IconShield, IconDoc, IconBack } from "../../../../components/Icons";
import SubmitButton from "../../../../components/SubmitButton";

const inputCls =
  "rounded-md border border-line px-2 py-1.5 text-[11px] outline-none placeholder:text-crumb focus:border-primary";

export default async function PenilaianPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const penugasan = await prisma.penugasan_asesor.findUnique({
    where: { id_penugasan: params.id },
    include: {
      lkd: {
        include: {
          pengguna: true,
          periode_bkd: true,
          // Status pengesahan asesor lain — token baru terbit setelah keduanya sahkan
          penugasan_asesor: { include: { asesor: { select: { nama: true } } } },
          kegiatan: {
            include: {
              referensi_kegiatan: true,
              hasil_penilaian: true,
              // Jumlah bukti = artefak unggahan dosen; lampiran surat otomatis
              // dari admin dikecualikan agar angkanya jujur soal kelengkapan.
              unggahan_dokumen: { select: { file_url: true } },
              dokumen_kegiatan: { select: { file_url: true } },
            },
            orderBy: { created_at: "asc" },
          },
        },
      },
    },
  });
  if (!penugasan || penugasan.id_asesor !== session!.user.id) notFound();

  const lkd = penugasan.lkd;
  const fase = faseAktif(lkd.periode_bkd);
  const sudahSah = (penugasan as any).disahkan;
  const bisaNilai = lkd.simpan_permanen && bolehAsesorNilai(fase) && !sudahSah;
  const asesorLain: any[] = (lkd as any).penugasan_asesor.filter(
    (x: any) => x.id_penugasan !== penugasan.id_penugasan
  );
  const semuaSah = sudahSah && asesorLain.length > 0 && asesorLain.every((x) => x.disahkan);

  const claimed = lkd.kegiatan.filter((k: any) => k.diklaim);
  const bySeksi = (kodeRules: string[]) =>
    claimed.filter((k: any) => kodeRules.includes(k.referensi_kegiatan.kode_rule));
  const nilaiSaya = (k: any) =>
    k.hasil_penilaian.find((h: any) => h.id_penugasan === penugasan.id_penugasan);
  const jumlahArtefak = (k: any) => {
    const surat = k.unggahan_dokumen?.file_url ?? null;
    return k.dokumen_kegiatan.filter((d: any) => !surat || d.file_url !== surat).length;
  };

  return (
    <AppShell
      peran="asesor"
      nama={session?.user.name ?? "-"}
      deskripsi="Asesor, Teknik Informatika"
      breadcrumb={["Beranda", "Layanan BKD", "Asesor BKD", "Peserta BKD", "Rincian Peserta"]}
      title={`Penilaian Laporan Kinerja Dosen (LKD) - Semester ${lkd.periode_bkd.nama_periode}`}
      subtitle={`Dosen: ${lkd.pengguna.nama} (${lkd.pengguna.nidn ?? "-"}) — Anda asesor ke-${penugasan.urutan}`}
      actions={
        <div className="flex flex-col items-end gap-1.5">
          {sudahSah ? (
            <StatusChip label="Sudah Anda sahkan" variant="success" />
          ) : (
            <span className="rounded-lg border border-line px-3 py-2 text-xs text-navy">
              {FASE_LABEL[fase]}
            </span>
          )}
          {asesorLain.length === 0 ? (
            <span className="text-[10.5px] text-crumb">Asesor lain belum ditetapkan admin</span>
          ) : (
            asesorLain.map((x) => (
              <span
                key={x.id_penugasan}
                className={`text-[10.5px] ${x.disahkan ? "text-success-tx" : "text-muted"}`}
              >
                Asesor ke-{x.urutan} ({x.asesor.nama}):{" "}
                <b>{x.disahkan ? "sudah mengesahkan" : "belum mengesahkan"}</b>
              </span>
            ))
          )}
          {semuaSah && (
            <span className="text-[10.5px] font-medium text-success-tx">
              Kedua asesor sudah sahkan — simpulan final &amp; token SKS diterbitkan
            </span>
          )}
        </div>
      }
    >
      {!lkd.simpan_permanen ? (
        <div className="rounded-lg bg-danger-soft px-4 py-4 text-xs font-medium text-danger">
          Penilaian belum bisa dilakukan — dosen belum melakukan simpan permanen.
        </div>
      ) : !bolehAsesorNilai(fase) ? (
        <div className="rounded-lg bg-info-bg px-4 py-4 text-xs font-medium text-info-tx">
          Saat ini {FASE_LABEL[fase]} — di luar masa penilaian asesor.
        </div>
      ) : (
        <form action={simpanPenilaian}>
          <input type="hidden" name="id_penugasan" value={penugasan.id_penugasan} />

          {bisaNilai ? (
            <InfoBox>
              <b>Info:</b> SKS hasil smart contract adalah acuan deterministik. Isi SKS keputusan,
              status, dan komentar (wajib untuk Tolak/Revisi). Jika nilai Anda berbeda dengan asesor
              lain, nilai final = rata-rata. Klik <b>Simpan Penilaian</b>, lalu <b>Sahkan</b> bila final.
            </InfoBox>
          ) : (
            <InfoBox>
              <b>Penilaian Anda sudah disahkan</b> dan tidak dapat diubah lagi. Rincian di bawah
              hanya untuk dibaca.
            </InfoBox>
          )}

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
                            {["No", "Nama Kegiatan", "Bukti", "Capaian", "SKS Kontrak", "Penilaian (sks)", "Status", "Komentar"].map((h) => (
                              <th key={h} className="border-l border-line-grid px-3 py-2.5 text-[11px] font-medium text-head-tx first:border-l-0">
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
                                  <span className="block text-[10px] text-crumb">{k.referensi_kegiatan.kode_rule}</span>
                                </td>
                                <td className="w-24">
                                  <Link
                                    href={`/asesor/penilaian/${penugasan.id_penugasan}/bukti/${k.id_kegiatan}`}
                                    className={`inline-block rounded-md px-2.5 py-1.5 text-[10px] font-medium ${
                                      jumlahArtefak(k) > 0 ? "bg-primary text-white" : "bg-danger-soft text-danger"
                                    }`}
                                  >
                                    <span className="inline-flex items-center gap-1"><IconDoc size={10}/> {jumlahArtefak(k)}</span>
                                  </Link>
                                </td>
                                <td className="w-24">
                                  {k.status_capaian ? (
                                    <StatusChip label={CAPAIAN_LABEL[k.status_capaian]} variant={STATUS_VARIAN[k.status_capaian] ?? "neutral"} />
                                  ) : "-"}
                                </td>
                                <td className="w-24">
                                  {k.sks_dihitung_x100 != null ? (k.sks_dihitung_x100 / 100).toFixed(2) : "manual"}
                                </td>
                                <td className="w-28">
                                  {bisaNilai ? (
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
                                  ) : h?.sks_disetujui_x100 != null ? (
                                    (h.sks_disetujui_x100 / 100).toFixed(2)
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <td className="w-28">
                                  {bisaNilai ? (
                                    <select name={`status_${k.id_kegiatan}`} defaultValue={h?.status ?? "disetujui"} className={`${inputCls} bg-white`}>
                                      <option value="disetujui">Disetujui</option>
                                      <option value="revisi">Revisi</option>
                                      <option value="ditolak">Ditolak</option>
                                    </select>
                                  ) : h?.status ? (
                                    <StatusChip
                                      label={h.status.charAt(0).toUpperCase() + h.status.slice(1)}
                                      variant={STATUS_VARIAN[h.status] ?? "neutral"}
                                    />
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <td>
                                  {bisaNilai ? (
                                    <input name={`catatan_${k.id_kegiatan}`} defaultValue={h?.catatan ?? ""} placeholder="Komentar/rekomendasi" className={`${inputCls} w-full`} />
                                  ) : (
                                    h?.catatan || <span className="text-crumb">-</span>
                                  )}
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

          {bisaNilai && (
            <button className="mt-6 w-full rounded-lg bg-success-deep py-3 text-xs font-medium text-white">
              <span className="inline-flex items-center justify-center gap-2"><IconSave size={13}/> Simpan Penilaian</span>
            </button>
          )}
        </form>
      )}

      {/* Pengesahan (R11) */}
      {lkd.simpan_permanen && !sudahSah && bolehAsesorNilai(fase) && (
        <form action={sahkanPenilaian} className="mt-4">
          <input type="hidden" name="id_penugasan" value={penugasan.id_penugasan} />
          <SubmitButton
            className="w-full !bg-navy !py-3 !text-xs"
            icon={<IconShield size={13} />}
            labelProses="Mengesahkan…"
            judulKonfirmasi="Sahkan penilaian?"
            konfirmasi="Pengesahan bersifat final dan tidak dapat ditarik kembali. Bila kedua asesor sudah mengesahkan, token SKS langsung diterbitkan ke wallet dosen dan tercatat permanen di blockchain."
            tombolKonfirmasi="Ya, sahkan"
          >
            Sahkan Penilaian (final)
          </SubmitButton>
        </form>
      )}

      <div className="mt-5">
        <Link href="/asesor/asesor-bkd" className="inline-block rounded-lg bg-head-bg px-4 py-2.5 text-xs font-medium text-muted">
          <span className="inline-flex items-center gap-1.5"><IconBack size={11}/> Kembali</span>
        </Link>
      </div>
    </AppShell>
  );
}
