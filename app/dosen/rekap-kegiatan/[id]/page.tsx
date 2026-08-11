import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { SEKSI_BKD, CAPAIAN_LABEL } from "../../../../lib/seksiBkd";
import { SUMBER_LABEL } from "../../../../lib/kategoriDosen";
import { faseAktif, bolehDosenInput, FASE_LABEL } from "../../../../lib/fase";
import AppShell from "../../../../components/AppShell";
import StatusChip, { STATUS_VARIAN } from "../../../../components/StatusChip";
import InfoBox from "../../../../components/InfoBox";
import {
  IconRefresh,
  IconLock,
  IconTrash,
  IconDoc,
  IconSave,
} from "../../../../components/Icons";
import {
  tarikData,
  simpanPermanen,
  simpanSementara,
  ubahCapaian,
  batalKlaim,
} from "../actions";
import SubmitButton from "../../../../components/SubmitButton";
import ModalUbahStatus from "../../../../components/ModalUbahStatus";

const TABS = [
  { key: "biodata", label: "Biodata", enabled: true },
  { key: "pendidikan", label: "Pelaksanaan Pendidikan", enabled: true },
  { key: "penelitian", label: "Pelaksanaan Penelitian", enabled: false },
  { key: "pengabdian", label: "Pelaksanaan Pengabdian", enabled: false },
  { key: "penunjang", label: "Pelaksanaan Penunjang", enabled: false },
  { key: "simpulan", label: "Simpulan", enabled: true },
];

const thCls =
  "border-l border-line-grid px-3.5 py-2.5 text-[11.5px] font-medium text-head-tx first:border-l-0";
const tbodyCls =
  "[&>tr]:border-t [&>tr]:border-line [&_td]:border-l [&_td]:border-line-grid [&_td]:px-3.5 [&_td]:py-2.5 [&_td]:text-[11.5px] [&_td]:text-cell [&_td:first-child]:border-l-0";

export default async function LkdDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab?: string };
}) {
  const session = await getServerSession(authOptions);
  const tab = TABS.find((t) => t.key === searchParams.tab && t.enabled)?.key ?? "pendidikan";

  const lkd = await prisma.lkd.findUnique({
    where: { id_lkd: params.id },
    include: {
      periode_bkd: true,
      pengguna: true,
      kegiatan: {
        include: {
          referensi_kegiatan: true,
          hasil_penilaian: true,
          // Lampiran surat dari admin bukan artefak dosen — jumlah bukti
          // dihitung manual dengan mengecualikannya (konsisten dgn dashboard).
          unggahan_dokumen: { select: { file_url: true } },
          dokumen_kegiatan: { select: { file_url: true } },
        },
        orderBy: { created_at: "asc" },
      },
    },
  });
  if (!lkd || lkd.id_pengguna !== session!.user.id) notFound();

  const fase = faseAktif(lkd.periode_bkd);
  const editable = !lkd.simpan_permanen && bolehDosenInput(fase);
  const claimed = lkd.kegiatan.filter((k: any) => k.diklaim);
  const totalSks = claimed.reduce((a: number, k: any) => a + (k.sks_dihitung_x100 ?? 0), 0);

  const tabHref = (k: string) => `/dosen/rekap-kegiatan/${lkd.id_lkd}?tab=${k}`;

  return (
    <AppShell
      peran="dosen"
      nama={session?.user.name ?? "-"}
      deskripsi="Dosen, D3 Teknik Informatika"
      breadcrumb={["Beranda", "Layanan BKD", "Rekap kegiatan", "Laporan Kinerja"]}
      title={`Laporan Kinerja Dosen - Semester ${lkd.periode_bkd.nama_periode}`}
      actions={
        lkd.simpan_permanen ? (
          <StatusChip label="Tersimpan permanen" variant="success" />
        ) : (
          <span className="rounded-lg border border-line px-3 py-2 text-xs text-navy">
            {FASE_LABEL[fase]}
          </span>
        )
      }
    >
      <div className="flex gap-2 border-b border-line">
        {TABS.map((t) =>
          t.enabled ? (
            <Link
              key={t.key}
              href={tabHref(t.key)}
              className={`rounded-t-md px-3.5 py-2.5 text-[11.5px] ${
                tab === t.key ? "bg-primary font-medium text-white" : "text-muted hover:text-navy"
              }`}
            >
              {t.label}
            </Link>
          ) : (
            <span
              key={t.key}
              className="cursor-not-allowed rounded-t-md px-3.5 py-2.5 text-[11.5px] text-crumb/50"
              title="Di luar lingkup sistem (hanya unsur pendidikan)"
            >
              {t.label}
            </span>
          )
        )}
      </div>

      <div className="mt-5">
        {tab === "biodata" && <Biodata u={lkd.pengguna} periode={lkd.periode_bkd} />}
        {tab === "pendidikan" && <Pendidikan lkd={lkd} editable={editable} fase={fase} />}
        {tab === "simpulan" && <Simpulan claimed={claimed} totalSks={totalSks} lkd={lkd} />}
      </div>
    </AppShell>
  );
}

function Biodata({ u, periode }: { u: any; periode: any }) {
  const rows: [string, string][] = [
    ["Nama", u.nama],
    ["Email", u.email ?? "-"],
    ["NIDN", u.nidn ?? "-"],
    ["Program Studi", u.program_studi ?? "-"],
    ["Jabatan Fungsional", u.jabatan_fungsional ?? "-"],
    ["Wallet Address", u.alamat_wallet ?? "-"],
    ["Periode", periode.nama_periode],
  ];
  return (
    <div className="overflow-hidden rounded-[10px] border border-line">
      {rows.map(([label, value], i) => (
        <div key={label} className={`flex px-4 py-3 text-[11.5px] ${i % 2 ? "bg-zebra" : ""}`}>
          <span className="w-52 font-medium text-cell">{label}</span>
          <span className="mr-3 text-muted">:</span>
          <span className={label === "Wallet Address" ? "font-mono text-[10px] text-muted" : "text-muted"}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Nilai "Jumlah Kegiatan" ala mockup: diambil dari parameter jumlah bila ada. */
function jumlahKegiatan(k: any): number {
  const p: any = k.parameter ?? {};
  return (
    p.jumlahMahasiswa ?? p.jumlahSemester ?? p.jumlahOrasi ?? p.jumlahSertifikat ??
    p.jumlahKegiatan ?? p.jumlahNaskah ?? p.jumlahOrang ?? 1
  );
}

/** Status penilaian gabungan dari kedua asesor (kolom "Status Penilaian" mockup). */
function statusPenilaian(k: any): { label: string; variant: any } | null {
  const hs: any[] = k.hasil_penilaian ?? [];
  if (hs.length === 0) return null;
  if (hs.some((h) => h.status === "ditolak")) return { label: "Ditolak", variant: "danger" };
  if (hs.some((h) => h.status === "revisi")) return { label: "Revisi", variant: "warning" };
  return { label: hs.length >= 2 ? "Disetujui" : "Dinilai sebagian", variant: "success" };
}

/** Rekomendasi/catatan asesor di bawah chip status (kolom "Rekomendasi" mockup). */
function Rekomendasi({ k }: { k: any }) {
  const catatan = [
    ...new Set((k.hasil_penilaian ?? []).map((h: any) => h.catatan).filter(Boolean)),
  ] as string[];
  if (catatan.length === 0) return null;
  return (
    <>
      {catatan.map((c) => (
        <span key={c} className="mt-1 block text-[10px] leading-snug text-muted">
          &ldquo;{c}&rdquo;
        </span>
      ))}
    </>
  );
}

/** Jumlah artefak milik dosen sendiri — lampiran surat admin dikecualikan. */
function jumlahArtefak(k: any): number {
  const surat = k.unggahan_dokumen?.file_url ?? null;
  return k.dokumen_kegiatan.filter((d: any) => !surat || d.file_url !== surat).length;
}

function BuktiBadge({ lkdId, k }: { lkdId: string; k: any }) {
  const jumlah = jumlahArtefak(k);
  return (
    <Link
      href={`/dosen/rekap-kegiatan/${lkdId}/bukti/${k.id_kegiatan}`}
      className={`mt-1 inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9.5px] font-medium ${
        jumlah > 0 ? "bg-[#e6f4ec] text-success-tx" : "bg-danger-soft text-danger"
      }`}
    >
      <IconDoc size={10} />
      {jumlah > 0 ? `${jumlah} bukti pendukung` : "Belum ada bukti pendukung"}
    </Link>
  );
}

/** Aksi per baris ala mockup: pensil oranye (modal ubah status) + hapus merah. */
function AksiCell({ lkd, k, editable }: { lkd: any; k: any; editable: boolean }) {
  if (!editable) return <span className="text-crumb">terkunci</span>;
  return (
    <div className="flex items-center gap-1.5">
      <ModalUbahStatus
        aksi={ubahCapaian}
        idKegiatan={k.id_kegiatan}
        idLkd={lkd.id_lkd}
        judul={k.judul}
        capaian={k.status_capaian ?? ""}
        opsi={Object.entries(CAPAIAN_LABEL)}
      />
      <form action={batalKlaim}>
        <input type="hidden" name="id_kegiatan" value={k.id_kegiatan} />
        <input type="hidden" name="id_lkd" value={lkd.id_lkd} />
        <SubmitButton
          variant="danger"
          className="!rounded-md !border !border-danger/40 !bg-danger-soft !p-1.5 !text-danger"
          title="Batalkan klaim"
          judulKonfirmasi="Batalkan klaim kegiatan?"
          konfirmasi={`"${k.judul}" akan dikeluarkan dari laporan dan kembali ke daftar kegiatan yang belum diklaim.`}
          tombolKonfirmasi="Ya, batalkan klaim"
        >
          <IconTrash size={11} />
        </SubmitButton>
      </form>
    </div>
  );
}

function Pendidikan({ lkd, editable, fase }: { lkd: any; editable: boolean; fase: any }) {
  const bySeksi = (kodeRules: string[], claimedOnly: boolean) =>
    lkd.kegiatan.filter(
      (k: any) => kodeRules.includes(k.referensi_kegiatan.kode_rule) && k.diklaim === claimedOnly
    );
  const totalClaimed = lkd.kegiatan
    .filter((k: any) => k.diklaim)
    .reduce((a: number, k: any) => a + (k.sks_dihitung_x100 ?? 0), 0);

  return (
    <>
      <InfoBox>
        <b>Info untuk dosen:</b> {FASE_LABEL[fase]}. Klaim kegiatan dari portofolio ke laporan
        dengan tombol <b>Tarik data</b> per seksi atau <b>Tarik Semua</b>. Total SKS diklaim:{" "}
        <b>{(totalClaimed / 100).toFixed(2)} SKS</b>.
      </InfoBox>

      {editable && (
        <form action={tarikData} className="mt-4">
          <input type="hidden" name="id_lkd" value={lkd.id_lkd} />
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white">
            <IconRefresh size={12} /> Tarik Semua Kinerja dari Portofolio
          </button>
        </form>
      )}

      <div className="mt-5 space-y-6">
        {SEKSI_BKD.map((s) => {
          const items = bySeksi(s.kodeRules, true);
          const belum = bySeksi(s.kodeRules, false);
          const isA = s.key === "A";
          const totalA = items.reduce((a: number, k: any) => a + (k.sks_dihitung_x100 ?? 0), 0);
          return (
            <section key={s.key} className="rounded-[10px] border border-line p-4">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-[11.5px] font-semibold text-cell">
                  {s.letter}. {s.title}
                </h2>
                {editable && belum.length > 0 && (
                  <form action={tarikData}>
                    <input type="hidden" name="id_lkd" value={lkd.id_lkd} />
                    <input type="hidden" name="seksi" value={s.key} />
                    <button className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary-soft px-3 py-1.5 text-[10.5px] font-medium text-primary">
                      <IconRefresh size={11} /> Tarik data ({belum.length})
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
              ) : isA ? (
                /* ===== Seksi A: kolom sesuai mockup + baris Total sks ===== */
                <div className="mt-3 overflow-hidden rounded-[10px] border border-line">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-head-bg">
                        {["No", "Kegiatan", "Rencana Pertemuan", "sks MK terhitung", "sks BKD", "Status", "Status Penilaian", "Aksi"].map(
                          (h, i) => (
                            <th key={h} className={thCls} style={{ width: [40, undefined, 130, 120, 90, 110, 130, 90][i] }}>
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className={tbodyCls}>
                      {items.map((k: any, i: number) => {
                        const p: any = k.parameter ?? {};
                        const sp = statusPenilaian(k);
                        return (
                          <tr key={k.id_kegiatan}>
                            <td>{i + 1}</td>
                            <td>
                              {k.judul}
                              {p.teamTeaching && (
                                <span className="block text-[10px] text-crumb">(Team Teaching)</span>
                              )}
                              <BuktiBadge lkdId={lkd.id_lkd} k={k} />
                            </td>
                            <td>{p.jumlahPertemuanRencana ? `${p.jumlahPertemuanRencana} Pertemuan` : "-"}</td>
                            <td>{p.sksMataKuliah != null ? `${p.sksMataKuliah} sks` : "-"}</td>
                            <td>{k.sks_dihitung_x100 != null ? (k.sks_dihitung_x100 / 100).toFixed(2) : "-"}</td>
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
                              {sp ? <StatusChip label={sp.label} variant={sp.variant} /> : <span className="text-crumb">-</span>}
                              <Rekomendasi k={k} />
                            </td>
                            <td>
                              <AksiCell lkd={lkd} k={k} editable={editable} />
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-info-bg/60">
                        <td></td>
                        <td className="!font-semibold">Total sks</td>
                        <td></td>
                        <td></td>
                        <td className="!font-semibold">{(totalA / 100).toFixed(2)}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                /* ===== Seksi B-N: kolom sesuai mockup ===== */
                <div className="mt-3 overflow-hidden rounded-[10px] border border-line">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-head-bg">
                        {["No", "Nama Kegiatan", "Bukti Penugasan", "Status", "Jumlah Kegiatan", "Beban Tugas", "Status Penilaian", "Aksi"].map((h, i) => (
                          <th key={h} className={thCls} style={{ width: [40, undefined, 130, 110, 110, 95, 130, 90][i] }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={tbodyCls}>
                      {items.map((k: any, i: number) => {
                        const sp = statusPenilaian(k);
                        const d: any = k.detail_kegiatan ?? {};
                        return (
                          <tr key={k.id_kegiatan}>
                            <td>{i + 1}</td>
                            <td>
                              {k.judul}
                              <span className="block text-[10px] text-crumb">
                                {k.referensi_kegiatan.kode_rule} ·{" "}
                                {SUMBER_LABEL[k.sumber_data] ?? k.sumber_data}
                              </span>
                              <BuktiBadge lkdId={lkd.id_lkd} k={k} />
                            </td>
                            <td className="!text-[10.5px] !text-muted">
                              SK : {d.no_sk || "-"}
                              <span className="block">Tgl.SK : {d.tgl_sk || "-"}</span>
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
                            <td>{jumlahKegiatan(k)}</td>
                            <td>{k.sks_dihitung_x100 != null ? (k.sks_dihitung_x100 / 100).toFixed(2) : "-"}</td>
                            <td>
                              {sp ? <StatusChip label={sp.label} variant={sp.variant} /> : <span className="text-crumb">-</span>}
                              <Rekomendasi k={k} />
                            </td>
                            <td>
                              <AksiCell lkd={lkd} k={k} editable={editable} />
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

      {editable && (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <form action={simpanSementara}>
            <input type="hidden" name="id_lkd" value={lkd.id_lkd} />
            <SubmitButton
              className="w-full !border !border-primary !bg-white !py-3 !text-xs !text-primary hover:!bg-primary-soft"
              icon={<IconSave size={13} />}
              labelProses="Menyimpan…"
            >
              Simpan Sementara (masih bisa diubah)
            </SubmitButton>
          </form>
          <form action={simpanPermanen}>
            <input type="hidden" name="id_lkd" value={lkd.id_lkd} />
            <SubmitButton
              className="w-full !bg-success-deep !py-3 !text-xs"
              icon={<IconLock size={13} />}
              labelProses="Mengunci laporan…"
              judulKonfirmasi="Kunci laporan untuk dinilai?"
              konfirmasi="Setelah disimpan permanen, Anda tidak dapat menambah, mengubah, atau menghapus kegiatan dan bukti pada periode ini."
              tombolKonfirmasi="Ya, kunci sekarang"
            >
              Simpan Permanen (kunci untuk penilaian asesor)
            </SubmitButton>
          </form>
        </div>
      )}
    </>
  );
}

function Simpulan({ claimed, totalSks, lkd }: { claimed: any[]; totalSks: number; lkd: any }) {
  const sksPendidikan = totalSks / 100;
  const memenuhiMin = sksPendidikan >= 9;
  const memenuhiMax = sksPendidikan <= 16;
  const status = memenuhiMin ? "M" : "TM";

  return (
    <div className="space-y-4">
      <InfoBox>
        <b>Info:</b> Simpulan dihitung dari kegiatan yang telah diklaim. Nilai final ditetapkan
        setelah kedua asesor mengesahkan (nilai berbeda dirata-ratakan).
      </InfoBox>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          ["SKS Pendidikan (diklaim)", sksPendidikan.toFixed(2)],
          ["Jumlah Kegiatan", String(claimed.length)],
          ["Minimal Terpenuhi (≥9)", memenuhiMin ? "Ya" : "Belum"],
          ["Dalam Rentang (12–16)", memenuhiMax ? "Ya" : "Lebih"],
        ].map(([l, v]) => (
          <div key={l} className="rounded-[10px] border border-line p-4">
            <p className="text-[11px] text-muted">{l}</p>
            <p className="mt-1.5 text-[18px] font-semibold text-navy">{v}</p>
          </div>
        ))}
      </div>
      <div className="rounded-[10px] border border-line p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] font-medium text-cell">Simpulan Sementara (Pendidikan)</span>
          <StatusChip
            label={status === "M" ? "Memenuhi" : "Belum Memenuhi"}
            variant={status === "M" ? "success" : "warning"}
          />
        </div>
        {lkd.simpan_permanen && (
          <p className="mt-3 text-[11px] text-muted">
            LKD sudah disimpan permanen. Status final dan penerbitan token SKS mengikuti hasil
            pengesahan kedua asesor.
          </p>
        )}
      </div>
    </div>
  );
}
