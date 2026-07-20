import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { SEKSI_BKD, CAPAIAN_LABEL } from "../../../../lib/seksiBkd";
import { faseAktif, bolehDosenInput, FASE_LABEL } from "../../../../lib/fase";
import AppShell from "../../../../components/AppShell";
import StatusChip, { STATUS_VARIAN } from "../../../../components/StatusChip";
import InfoBox from "../../../../components/InfoBox";
import { tarikData, simpanPermanen, ubahCapaian, batalKlaim } from "../actions";

const TABS = [
  { key: "biodata", label: "Biodata", enabled: true },
  { key: "pendidikan", label: "Pelaksanaan Pendidikan", enabled: true },
  { key: "penelitian", label: "Pelaksanaan Penelitian", enabled: false },
  { key: "pengabdian", label: "Pelaksanaan Pengabdian", enabled: false },
  { key: "penunjang", label: "Pelaksanaan Penunjang", enabled: false },
  { key: "simpulan", label: "Simpulan", enabled: true },
];

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
        include: { referensi_kegiatan: true, _count: { select: { dokumen_kegiatan: true } } },
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
      title={`🏛 Laporan Kinerja Dosen - Semester ${lkd.periode_bkd.nama_periode}`}
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
      {/* Tab bar */}
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
        {tab === "pendidikan" && (
          <Pendidikan lkd={lkd} editable={editable} fase={fase} />
        )}
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

function Pendidikan({ lkd, editable, fase }: { lkd: any; editable: boolean; fase: any }) {
  const bySeksi = (kodeRules: string[], claimedOnly: boolean) =>
    lkd.kegiatan.filter(
      (k: any) => kodeRules.includes(k.referensi_kegiatan.kode_rule) && k.diklaim === claimedOnly
    );

  return (
    <>
      <InfoBox>
        <b>Info untuk dosen:</b> {FASE_LABEL[fase]}. Klaim kegiatan dari portofolio ke laporan
        dengan tombol <b>Tarik data</b> per seksi atau <b>Tarik Semua</b>. Total SKS diklaim saat
        ini: <b>{(lkd.kegiatan.filter((k: any) => k.diklaim).reduce((a: number, k: any) => a + (k.sks_dihitung_x100 ?? 0), 0) / 100).toFixed(2)} SKS</b>.
      </InfoBox>

      {editable && (
        <form action={tarikData} className="mt-4">
          <input type="hidden" name="id_lkd" value={lkd.id_lkd} />
          <button className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white">
            ↻ Tarik Semua Kinerja dari Portofolio
          </button>
        </form>
      )}

      <div className="mt-5 space-y-6">
        {SEKSI_BKD.map((s) => {
          const items = bySeksi(s.kodeRules, true);
          const belum = bySeksi(s.kodeRules, false);
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
                    <button className="shrink-0 rounded-md bg-primary-soft px-3 py-1.5 text-[10.5px] font-medium text-primary">
                      ↻ Tarik data ({belum.length})
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
                        {["No", "Nama Kegiatan", "Status", "SKS BKD", "Bukti", "Aksi"].map((h, i) => (
                          <th
                            key={h}
                            className="border-l border-line-grid px-3.5 py-2.5 text-[11.5px] font-medium text-head-tx first:border-l-0"
                            style={{ width: [40, undefined, 140, 90, 120, 200][i] }}
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
                              {k.referensi_kegiatan.kode_rule} · {k.sumber_data}
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
                          <td>{k.sks_dihitung_x100 != null ? (k.sks_dihitung_x100 / 100).toFixed(2) : "-"}</td>
                          <td>
                            <Link
                              href={`/dosen/rekap-kegiatan/${lkd.id_lkd}/bukti/${k.id_kegiatan}`}
                              className={`inline-block rounded-md px-2.5 py-1.5 text-[10px] font-medium ${
                                k._count.dokumen_kegiatan > 0
                                  ? "bg-[#e6f4ec] text-success-tx"
                                  : "bg-danger-soft text-danger"
                              }`}
                            >
                              {k._count.dokumen_kegiatan > 0 ? `✔ ${k._count.dokumen_kegiatan}` : "✕ bukti"}
                            </Link>
                          </td>
                          <td>
                            {editable ? (
                              <div className="flex items-center gap-1.5">
                                <form action={ubahCapaian} className="flex items-center gap-1">
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
                                    ✓
                                  </button>
                                </form>
                                <form action={batalKlaim}>
                                  <input type="hidden" name="id_kegiatan" value={k.id_kegiatan} />
                                  <input type="hidden" name="id_lkd" value={lkd.id_lkd} />
                                  <button
                                    className="rounded bg-danger-soft px-2 py-1 text-[10px] font-medium text-danger"
                                    title="Batalkan klaim"
                                  >
                                    ⊘
                                  </button>
                                </form>
                              </div>
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

      {editable && (
        <form action={simpanPermanen} className="mt-6">
          <input type="hidden" name="id_lkd" value={lkd.id_lkd} />
          <button className="w-full rounded-lg bg-success-deep py-3 text-xs font-medium text-white">
            🔒 Simpan Permanen (kunci untuk penilaian asesor)
          </button>
        </form>
      )}
    </>
  );
}

function Simpulan({ claimed, totalSks, lkd }: { claimed: any[]; totalSks: number; lkd: any }) {
  const sksPendidikan = totalSks / 100;
  // Aturan PO BKD (disederhanakan untuk unsur pendidikan): min 9 sks pend+penelitian, total 12-16.
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
