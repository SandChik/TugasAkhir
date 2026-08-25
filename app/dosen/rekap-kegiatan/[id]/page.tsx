import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { SEKSI_BKD, SEKSI_WAJIB, CAPAIAN_LABEL } from "../../../../lib/seksiBkd";
import { SUMBER_LABEL } from "../../../../lib/kategoriDosen";
import { faseAktif, bolehDosenInput, FASE_LABEL } from "../../../../lib/fase";
import AppShell from "../../../../components/AppShell";
import StatusChip, { STATUS_VARIAN } from "../../../../components/StatusChip";
import { KELAS_TABEL } from "../../../../components/DataTable";
import PanelSeksi, { SeksiPanel } from "../../../../components/PanelSeksi";
import BarAksi from "../../../../components/BarAksi";
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
  { key: "biodata", label: "Biodata" },
  { key: "pendidikan", label: "Pelaksanaan Pendidikan" },
  { key: "simpulan", label: "Simpulan" },
];

export default async function LkdDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tab?: string };
}) {
  const session = await getServerSession(authOptions);
  const tab = TABS.find((t) => t.key === searchParams.tab)?.key ?? "pendidikan";

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

  // Simpan permanen ditahan selama seksi wajib belum punya kegiatan diklaim
  const kodeDiklaim = new Set(claimed.map((k: any) => k.referensi_kegiatan.kode_rule));
  const wajibKosong = SEKSI_WAJIB.filter((s) => !s.kodeRules.some((k) => kodeDiklaim.has(k)));

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
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={tabHref(t.key)}
            className={`rounded-t-md px-3.5 py-2.5 text-[11.5px] ${
              tab === t.key ? "bg-primary font-medium text-white" : "text-muted hover:text-navy"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-5">
        {tab === "biodata" && <Biodata u={lkd.pengguna} periode={lkd.periode_bkd} />}
        {tab === "pendidikan" && <Pendidikan lkd={lkd} editable={editable} fase={fase} />}
        {tab === "simpulan" && <Simpulan claimed={claimed} totalSks={totalSks} lkd={lkd} />}
      </div>

      <BarAksi
        hrefKembali="/dosen/rekap-kegiatan"
        info={
          <>
            {claimed.length} kegiatan diklaim · {(totalSks / 100).toFixed(2)} sks
            {editable && wajibKosong.length > 0 && (
              <span className="ml-3 font-medium text-danger">
                Seksi wajib belum terisi: {wajibKosong.map((s) => s.letter).join(", ")}
              </span>
            )}
          </>
        }
      >
        {editable && (
          <>
            <form action={simpanSementara}>
              <input type="hidden" name="id_lkd" value={lkd.id_lkd} />
              <SubmitButton
                variant="outline"
                icon={<IconSave size={13} />}
                labelProses="Menyimpan…"
              >
                Simpan Sementara
              </SubmitButton>
            </form>
            <form action={simpanPermanen}>
              <input type="hidden" name="id_lkd" value={lkd.id_lkd} />
              <SubmitButton
                disabled={wajibKosong.length > 0}
                className="!bg-success-deep !text-white hover:!bg-[#33885d]"
                icon={<IconLock size={13} />}
                labelProses="Mengunci laporan…"
                judulKonfirmasi="Kunci laporan untuk dinilai?"
                konfirmasi="Setelah disimpan permanen, Anda tidak dapat menambah, mengubah, atau menghapus kegiatan dan bukti pada periode ini."
                tombolKonfirmasi="Ya, kunci sekarang"
              >
                Simpan Permanen (final)
              </SubmitButton>
            </form>
          </>
        )}
      </BarAksi>
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
  const bySeksi = (kodeRules: string[], diklaim: boolean) =>
    lkd.kegiatan.filter(
      (k: any) => kodeRules.includes(k.referensi_kegiatan.kode_rule) && k.diklaim === diklaim
    );
  const diklaim = lkd.kegiatan.filter((k: any) => k.diklaim);
  const totalClaimed = diklaim.reduce((a: number, k: any) => a + (k.sks_dihitung_x100 ?? 0), 0);
  const belumSemua = lkd.kegiatan.length - diklaim.length;

  /* ===== Seksi A: kolom sesuai mockup + baris Total sks ===== */
  const tabelA = (items: any[], sks: number) => (
    <div className={KELAS_TABEL.bingkai}>
      <div className={KELAS_TABEL.gulir}>
        <table className={KELAS_TABEL.tabel}>
          <thead>
            <tr className={KELAS_TABEL.headBaris}>
              {[
                "No",
                "Kegiatan",
                "Rencana Pertemuan",
                "sks MK terhitung",
                "sks BKD",
                "Status",
                "Status Penilaian",
                "Aksi",
              ].map((h, i) => (
                <th
                  key={h}
                  className={KELAS_TABEL.th}
                  style={{ width: [40, undefined, 130, 120, 90, 110, 130, 90][i] }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={KELAS_TABEL.tbody}>
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
                  <td>
                    {k.sks_dihitung_x100 != null ? (k.sks_dihitung_x100 / 100).toFixed(2) : "-"}
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
                    {sp ? (
                      <StatusChip label={sp.label} variant={sp.variant} />
                    ) : (
                      <span className="text-crumb">-</span>
                    )}
                    <Rekomendasi k={k} />
                  </td>
                  <td>
                    <AksiCell lkd={lkd} k={k} editable={editable} />
                  </td>
                </tr>
              );
            })}
            <tr className="!bg-head-bg">
              <td></td>
              <td className="!font-semibold">Total sks</td>
              <td></td>
              <td></td>
              <td className="!font-semibold">{(sks / 100).toFixed(2)}</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  /* ===== Seksi B-K: kolom sesuai mockup ===== */
  const tabelSeksi = (items: any[]) => (
    <div className={KELAS_TABEL.bingkai}>
      <div className={KELAS_TABEL.gulir}>
        <table className={KELAS_TABEL.tabel}>
          <thead>
            <tr className={KELAS_TABEL.headBaris}>
              {[
                "No",
                "Nama Kegiatan",
                "Bukti Penugasan",
                "Status",
                "Jumlah Kegiatan",
                "Beban Tugas",
                "Status Penilaian",
                "Aksi",
              ].map((h, i) => (
                <th
                  key={h}
                  className={KELAS_TABEL.th}
                  style={{ width: [40, undefined, 130, 110, 110, 95, 130, 90][i] }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={KELAS_TABEL.tbody}>
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
                  <td>
                    {k.sks_dihitung_x100 != null ? (k.sks_dihitung_x100 / 100).toFixed(2) : "-"}
                  </td>
                  <td>
                    {sp ? (
                      <StatusChip label={sp.label} variant={sp.variant} />
                    ) : (
                      <span className="text-crumb">-</span>
                    )}
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
    </div>
  );

  const seksi: SeksiPanel[] = SEKSI_BKD.map((s) => {
    const items = bySeksi(s.kodeRules, true);
    const belum = bySeksi(s.kodeRules, false);
    const kosong = items.length === 0;
    const sks = items.reduce((a: number, k: any) => a + (k.sks_dihitung_x100 ?? 0), 0);
    return {
      key: s.key,
      letter: s.letter,
      judul: s.title,
      kosong,
      badge: String(items.length),
      badgeNada: kosong ? "redup" : "netral",
      penanda: (
        <>
          {s.wajib && (
            <span
              title="Seksi wajib"
              className={`text-[11px] font-semibold leading-none ${
                kosong ? "text-danger" : "text-muted"
              }`}
            >
              *
            </span>
          )}
          {/* Kegiatan periode ini yang belum masuk laporan, siap ditarik */}
          {belum.length > 0 && (
            <span
              title={`${belum.length} kegiatan belum diklaim`}
              className="rounded bg-primary-soft px-1 py-px text-[9.5px] font-medium text-primary"
            >
              +{belum.length}
            </span>
          )}
        </>
      ),
      ringkas: (
        <span className="inline-flex items-center gap-2">
          {s.wajib && (
            <StatusChip label="Wajib" variant={kosong ? "dangerSoft" : "neutralSoft"} />
          )}
          {kosong ? "0 kegiatan" : `${items.length} kegiatan · ${(sks / 100).toFixed(2)} sks`}
        </span>
      ),
      aksi:
        editable && belum.length > 0 ? (
          <form action={tarikData}>
            <input type="hidden" name="id_lkd" value={lkd.id_lkd} />
            <input type="hidden" name="seksi" value={s.key} />
            <button className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary-soft px-3 py-1.5 text-[10.5px] font-medium text-primary transition-colors hover:bg-[#dde9fb]">
              <IconRefresh size={11} /> Tarik data ({belum.length})
            </button>
          </form>
        ) : undefined,
      isi: kosong ? (
        <div className="rounded-lg bg-head-bg py-6 text-center text-[11.5px] text-muted">
          Belum ada kegiatan yang diklaim
        </div>
      ) : s.key === "A" ? (
        tabelA(items, sks)
      ) : (
        tabelSeksi(items)
      ),
    };
  });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-line px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px]">
          <span className="text-muted">{FASE_LABEL[fase]}</span>
          <span className="text-cell">
            Kegiatan diklaim: <b className="text-navy">{diklaim.length}</b>
          </span>
          <span className="text-cell">
            Total SKS diklaim: <b className="text-navy">{(totalClaimed / 100).toFixed(2)}</b>
          </span>
        </div>
        {editable && belumSemua > 0 && (
          <form action={tarikData}>
            <input type="hidden" name="id_lkd" value={lkd.id_lkd} />
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-[11.5px] font-medium text-white transition-colors hover:bg-[#255cc2]">
              <IconRefresh size={12} /> Tarik Semua Kinerja dari Portofolio ({belumSemua})
            </button>
          </form>
        )}
      </div>

      <div className="mt-4">
        <PanelSeksi seksi={seksi} />
      </div>
    </>
  );
}

function Simpulan({ claimed, totalSks, lkd }: { claimed: any[]; totalSks: number; lkd: any }) {
  const sksPendidikan = totalSks / 100;
  const memenuhiMin = sksPendidikan >= 9;
  const dalamRentang = sksPendidikan >= 12 && sksPendidikan <= 16;
  const status = memenuhiMin ? "M" : "TM";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          ["SKS Pendidikan (diklaim)", sksPendidikan.toFixed(2)],
          ["Jumlah Kegiatan", String(claimed.length)],
          ["Minimal Terpenuhi (≥9)", memenuhiMin ? "Ya" : "Belum"],
          [
            "Dalam Rentang (12–16)",
            dalamRentang ? "Ya" : sksPendidikan > 16 ? "Lebih" : "Kurang",
          ],
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
