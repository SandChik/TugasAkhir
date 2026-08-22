import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { SEKSI_BKD } from "../../../../lib/seksiBkd";
import { faseAktif, bolehAsesorNilai, FASE_LABEL } from "../../../../lib/fase";
import AppShell from "../../../../components/AppShell";
import StatusChip, { STATUS_VARIAN } from "../../../../components/StatusChip";
import { KELAS_TABEL } from "../../../../components/DataTable";
import PanelSeksi, { SeksiPanel } from "../../../../components/PanelSeksi";
import BarAksi from "../../../../components/BarAksi";
import BarAksiPenilaian from "../../../../components/BarAksiPenilaian";
import { simpanPenilaian, sahkanPenilaian } from "./actions";
import { IconDoc, IconAlert } from "../../../../components/Icons";

const inputCls =
  "rounded-md border border-line px-2 py-1.5 text-[11px] outline-none placeholder:text-crumb focus:border-primary";
const labelKecil = "text-[10.5px] font-medium text-muted";

function Fakta({ label, nilai }: { label: string; nilai: React.ReactNode }) {
  return (
    <div>
      <p className={labelKecil}>{label}</p>
      <div className="mt-0.5 text-[11.5px] text-cell">{nilai ?? "-"}</div>
    </div>
  );
}

function Kartu({ judul, children }: { judul: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[10px] border border-line">
      <div className="border-b border-line bg-head-bg px-4 py-2.5">
        <h2 className="text-[12px] font-semibold text-navy">{judul}</h2>
      </div>
      <div className="px-4 py-3.5">{children}</div>
    </div>
  );
}

export default async function PenilaianPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const penugasan = await prisma.penugasan_asesor.findUnique({
    where: { id_penugasan: params.id },
    include: {
      lkd: {
        include: {
          pengguna: true,
          periode_bkd: true,
          // Status pengesahan asesor lain, token baru terbit setelah keduanya sahkan
          penugasan_asesor: { include: { asesor: { select: { nama: true } } } },
          kegiatan: {
            include: {
              referensi_kegiatan: true,
              hasil_penilaian: true,
              // Jumlah bukti = artefak unggahan dosen; lampiran surat otomatis
              // dari admin dikecualikan agar angkanya jujur soal kelengkapan.
              unggahan_dokumen: { select: { file_url: true } },
              dokumen_kegiatan: {
                select: { file_url: true, verifikasi: true, tanggal_upload: true },
              },
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
  // Hasil verifikasi nama (parser VLM): bukti yang namanya tidak cocok dengan
  // pemilik akun ATAU perannya bertentangan dengan klaim ditandai agar asesor
  // waspada saat menilai.
  const buktiTakSesuai = (k: any) => {
    const surat = k.unggahan_dokumen?.file_url ?? null;
    return k.dokumen_kegiatan.filter(
      (d: any) =>
        (!surat || d.file_url !== surat) &&
        ["tidak_cocok", "peran_tidak_sesuai"].includes((d.verifikasi as any)?.status) &&
        !(d.verifikasi as any)?.acc // sudah di-ACC manual asesor -> bukan temuan lagi
    ).length;
  };
  // Bukti yang diunggah setelah penilaian tersimpan membuat penilaian lama basi.
  // Nilai dan komentar sebelumnya tetap ditampilkan, kegiatannya ditandai.
  const perluNilaiUlang = (k: any) => {
    const h = nilaiSaya(k);
    if (!h) return false;
    return k.dokumen_kegiatan.some((d: any) => d.tanggal_upload > h.tanggal_penilaian);
  };
  const kegiatanBermasalah = claimed.filter((k: any) => buktiTakSesuai(k) > 0);
  const kegiatanNilaiUlang = claimed.filter((k: any) => perluNilaiUlang(k));
  const totalDinilai = claimed.filter((k: any) => nilaiSaya(k)).length;

  const hrefBukti = (k: any) =>
    `/asesor/penilaian/${penugasan.id_penugasan}/bukti/${k.id_kegiatan}`;

  const tabelSeksi = (items: any[]) => (
    <div className={KELAS_TABEL.bingkai}>
      <div className={KELAS_TABEL.gulir}>
        <table className={KELAS_TABEL.tabel}>
          <thead>
            <tr className={KELAS_TABEL.headBaris}>
              {[
                "No",
                "Nama Kegiatan",
                "Bukti",
                "SKS Kontrak",
                "Penilaian (sks)",
                "Status",
                "Komentar",
              ].map((h) => (
                <th key={h} className={KELAS_TABEL.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={KELAS_TABEL.tbody}>
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
                    {perluNilaiUlang(k) && (
                      <span className="mt-1 block">
                        <StatusChip label="Bukti baru setelah dinilai" variant="warningSoft" />
                      </span>
                    )}
                  </td>
                  <td className="w-24">
                    <span className="inline-flex items-center gap-1.5">
                      {/* Tab baru: isian penilaian yang belum disimpan tidak hilang */}
                      <Link
                        href={hrefBukti(k)}
                        target="_blank"
                        rel="noopener"
                        className={`inline-block rounded-md px-2.5 py-1.5 text-[10px] font-medium ${
                          jumlahArtefak(k) > 0 ? "bg-primary text-white" : "bg-danger-soft text-danger"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1">
                          <IconDoc size={10} /> {jumlahArtefak(k)}
                        </span>
                      </Link>
                      {buktiTakSesuai(k) > 0 && (
                        <span
                          title={`Nama/peran dosen tidak sesuai pada ${buktiTakSesuai(k)} dokumen bukti`}
                          className="cursor-help text-danger"
                        >
                          <IconAlert size={13} />
                        </span>
                      )}
                    </span>
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
                      <select
                        name={`status_${k.id_kegiatan}`}
                        defaultValue={h?.status ?? "disetujui"}
                        className={`${inputCls} bg-white`}
                      >
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
                      <input
                        name={`catatan_${k.id_kegiatan}`}
                        defaultValue={h?.catatan ?? ""}
                        placeholder="Komentar/rekomendasi"
                        className={`${inputCls} w-full min-w-[180px]`}
                      />
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
    </div>
  );

  const seksi: SeksiPanel[] = SEKSI_BKD.map((s) => {
    const items = bySeksi(s.kodeRules);
    const kosong = items.length === 0;
    const dinilai = items.filter((k: any) => nilaiSaya(k)).length;
    const temuan = items.filter((k: any) => buktiTakSesuai(k) > 0).length;
    const ulang = items.filter((k: any) => perluNilaiUlang(k)).length;
    return {
      key: s.key,
      letter: s.letter,
      judul: s.title,
      kosong,
      badge: kosong ? "0" : `${dinilai}/${items.length}`,
      badgeNada: kosong ? "redup" : dinilai >= items.length ? "sukses" : "netral",
      penanda:
        temuan > 0 || ulang > 0 ? (
          <>
            {temuan > 0 && (
              <span className="text-danger" title={`${temuan} kegiatan dengan bukti tidak sesuai`}>
                <IconAlert size={11} />
              </span>
            )}
            {ulang > 0 && (
              <span
                className="rounded bg-warning px-1 py-px text-[9px] font-medium text-white"
                title={`${ulang} kegiatan dengan bukti baru setelah dinilai`}
              >
                {ulang}
              </span>
            )}
          </>
        ) : undefined,
      ringkas: kosong ? "0 kegiatan" : `${dinilai}/${items.length} kegiatan dinilai`,
      isi: kosong ? (
        <div className="rounded-lg bg-head-bg py-6 text-center text-[11.5px] text-muted">
          Belum ada kegiatan yang diklaim
        </div>
      ) : (
        tabelSeksi(items)
      ),
    };
  });

  const terkunci = !lkd.simpan_permanen
    ? "Dosen belum melakukan simpan permanen."
    : !bolehAsesorNilai(fase)
      ? `${FASE_LABEL[fase]}, di luar masa penilaian asesor.`
      : null;

  return (
    <AppShell
      peran="asesor"
      nama={session?.user.name ?? "-"}
      deskripsi="Asesor, Teknik Informatika"
      breadcrumb={["Beranda", "Layanan BKD", "Asesor BKD", "Peserta BKD", "Rincian Peserta"]}
      title={`Penilaian Laporan Kinerja Dosen (LKD) - Semester ${lkd.periode_bkd.nama_periode}`}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Kartu judul="Laporan">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Fakta label="Dosen" nilai={lkd.pengguna.nama} />
            <Fakta label="NIDN" nilai={lkd.pengguna.nidn ?? "-"} />
            <Fakta label="Periode" nilai={lkd.periode_bkd.nama_periode} />
            <Fakta label="Fase" nilai={FASE_LABEL[fase]} />
          </div>
        </Kartu>

        <Kartu judul="Status penilaian">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Fakta label="Kegiatan diklaim" nilai={claimed.length} />
            <Fakta label="Sudah Anda nilai" nilai={`${totalDinilai} dari ${claimed.length}`} />
            {kegiatanNilaiUlang.length > 0 && (
              <Fakta label="Perlu dinilai ulang" nilai={kegiatanNilaiUlang.length} />
            )}
          </div>
          <ul className="mt-3 space-y-2 border-t border-line pt-3">
            <li className="flex items-center justify-between gap-3">
              <span className="text-[11.5px] text-cell">Asesor ke-{penugasan.urutan} (Anda)</span>
              <StatusChip
                label={sudahSah ? "Sudah mengesahkan" : "Belum mengesahkan"}
                variant={sudahSah ? "successSoft" : "neutralSoft"}
              />
            </li>
            {asesorLain.length === 0 ? (
              <li className="flex items-center justify-between gap-3">
                <span className="text-[11.5px] text-cell">Asesor lain</span>
                <StatusChip label="Belum ditetapkan" variant="neutralSoft" />
              </li>
            ) : (
              asesorLain.map((x) => (
                <li key={x.id_penugasan} className="flex items-center justify-between gap-3">
                  <span className="text-[11.5px] text-cell">
                    Asesor ke-{x.urutan} ({x.asesor.nama})
                  </span>
                  <StatusChip
                    label={x.disahkan ? "Sudah mengesahkan" : "Belum mengesahkan"}
                    variant={x.disahkan ? "successSoft" : "neutralSoft"}
                  />
                </li>
              ))
            )}
          </ul>
        </Kartu>
      </div>

      {semuaSah && (
        <div className="mt-4 rounded-[10px] border border-success bg-[#e6f4ec] px-4 py-2.5 text-[11.5px] font-medium text-success-tx">
          Kedua asesor sudah mengesahkan. Simpulan final dan token SKS diterbitkan.
        </div>
      )}

      {terkunci ? (
        <>
          <div className="mt-4 rounded-[10px] bg-info-bg px-4 py-4 text-xs font-medium text-info-tx">
            Penilaian terkunci. {terkunci}
          </div>
          <BarAksi hrefKembali="/asesor/asesor-bkd" />
        </>
      ) : (
        <>
          {kegiatanBermasalah.length > 0 && (
            <div className="mt-4 rounded-[10px] border border-danger bg-danger-soft px-4 py-3">
              <p className="text-[11.5px] font-semibold text-danger">
                Verifikasi nama: {kegiatanBermasalah.length} kegiatan dengan bukti tidak sesuai
              </p>
              <ul className="mt-1.5 space-y-1">
                {kegiatanBermasalah.map((k: any) => (
                  <li key={k.id_kegiatan} className="text-[11px] text-danger">
                    &bull;{" "}
                    <Link
                      href={hrefBukti(k)}
                      target="_blank"
                      rel="noopener"
                      className="font-medium underline hover:opacity-80"
                    >
                      {k.judul}
                    </Link>{" "}
                    ({buktiTakSesuai(k)} dokumen)
                  </li>
                ))}
              </ul>
            </div>
          )}

          {bisaNilai ? (
            /* Bar aksi ikut di dalam form penilaian: tombol simpan mengirim form
               ini, tombol sahkan menunjuk server action lain lewat formAction,
               dan keduanya membaca status submit dari useFormStatus. */
            <form action={simpanPenilaian} className="mt-4">
              <input type="hidden" name="id_penugasan" value={penugasan.id_penugasan} />
              <PanelSeksi seksi={seksi} />
              <BarAksiPenilaian
                hrefKembali="/asesor/asesor-bkd"
                progres={`${totalDinilai}/${claimed.length} kegiatan dinilai`}
                aksiSahkan={sahkanPenilaian}
              />
            </form>
          ) : (
            <>
              <div className="mt-4">
                <PanelSeksi seksi={seksi} />
              </div>
              <BarAksi
                hrefKembali="/asesor/asesor-bkd"
                info={`${totalDinilai}/${claimed.length} kegiatan dinilai`}
              />
            </>
          )}
        </>
      )}
    </AppShell>
  );
}
