import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import AppShell from "../../../../components/AppShell";
import StatusChip from "../../../../components/StatusChip";
import StatTile from "../../../../components/StatTile";
import SubmitButton from "../../../../components/SubmitButton";
import { IconBack, IconCheck, IconDoc, IconPencil, IconSave, IconX } from "../../../../components/Icons";
import PratinjauPdf from "../../../../components/PratinjauPdf";
import { labelParameter, tampilNilai } from "../../../../lib/tampilNilai";
import { LABEL_JENIS, spekJenis, type JenisUnggahan } from "../../../../lib/parserDokumen";
import { gabungKoreksi, petakanDokumen } from "../../../../lib/pemetaanPenugasan";
import { buatPencocokDosen } from "../../../../lib/namaDosen";
import { fieldFormulir } from "../../../../lib/parameterKegiatan";
import {
  terapkanUnggahan,
  simpanKoreksiBaris,
  resetKoreksiBaris,
  simpanKoreksiSurat,
} from "../actions";

const PER_HALAMAN = 20;

const fmt = (d: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);

const kolom =
  "mt-1 w-full rounded-md border border-line bg-white px-2.5 py-1.5 text-[11.5px] text-cell outline-none focus:border-primary";
const labelKecil = "text-[10.5px] font-medium text-muted";

function Fakta({ label, nilai }: { label: string; nilai: React.ReactNode }) {
  return (
    <div>
      <p className={labelKecil}>{label}</p>
      {/* div, bukan p: nilainya bisa berisi tombol + <dialog> viewer PDF, dan
          <p> tidak boleh membungkus elemen blok (parser browser memutusnya →
          hydration mismatch). */}
      <div className="mt-0.5 text-[11.5px] text-cell">{nilai ?? "-"}</div>
    </div>
  );
}

/** Pratinjau hasil ekstraksi satu dokumen + tombol terapkan ke LKD dosen. */
export default async function PratinjauUnggahanPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { f?: string; q?: string; hal?: string; edit?: string; sorot?: string };
}) {
  const session = await getServerSession(authOptions);

  const rec = await prisma.unggahan_dokumen.findUnique({
    where: { id_unggahan: params.id },
    include: { admin: { select: { nama: true } }, periode_bkd: true },
  });
  if (!rec) notFound();

  const jenis = rec.jenis as JenisUnggahan;
  const spek = spekJenis(jenis);
  const peta = petakanDokumen(jenis, rec.hasil_parse);

  const [dosenSistem, periodeAktif, referensi] = await Promise.all([
    prisma.pengguna.findMany({
      where: { peran: { in: ["dosen", "asesor"] }, aktif: true },
      orderBy: { nama: "asc" },
      select: { id_pengguna: true, nama: true, nip: true, nidn: true, kode_dosen: true },
    }),
    prisma.periode_bkd.findFirst({ where: { status: "aktif" } }),
    prisma.referensi_kegiatan.findMany({
      where: { kode_rule: { in: [...new Set(peta.penugasan.map((p) => p.kodeRule))] } },
      select: { kode_rule: true, kategori: true, skema_parameter: true },
    }),
  ]);
  const cocokkan = buatPencocokDosen(dosenSistem);
  const refPerKode = new Map(referensi.map((r: any) => [r.kode_rule, r]));

  // Koreksi manual admin ditumpangkan di atas hasil parser
  const { penugasan, nomorSurat, tanggalSurat } = gabungKoreksi(peta, rec.koreksi);

  const semua = penugasan.map((p, i) => {
    const dipaksa = p.idPenggunaPaksa
      ? dosenSistem.find((d) => d.id_pengguna === p.idPenggunaPaksa)
      : null;
    const cocok = dipaksa
      ? ({ status: "cocok", dosen: dipaksa } as const)
      : cocokkan({ nama: p.namaDokumen, nip: p.nip, kodeDosen: p.kodeDosen });
    const golongan = p.lewati
      ? "dilewati"
      : cocok.status !== "cocok"
        ? "masalah"
        : p.dikoreksi
          ? "dikoreksi"
          : "siap";
    return { i, p, cocok, golongan };
  });

  const jumlah = {
    siap: semua.filter((b) => b.golongan === "siap" || b.golongan === "dikoreksi").length,
    masalah: semua.filter((b) => b.golongan === "masalah").length,
    dikoreksi: semua.filter((b) => b.golongan === "dikoreksi").length,
    dilewati: semua.filter((b) => b.golongan === "dilewati").length,
  };
  const namaTakCocok = [
    ...new Set(semua.filter((b) => b.golongan === "masalah").map((b) => b.p.namaDokumen)),
  ];

  // --- filter tampilan (GET, tanpa JavaScript) ---
  const filter = ["siap", "masalah", "dikoreksi", "dilewati"].includes(searchParams.f ?? "")
    ? searchParams.f!
    : "";
  const cari = (searchParams.q ?? "").trim();
  const cariKecil = cari.toLowerCase();

  const tersaring = semua.filter((b) => {
    if (filter === "siap" && !(b.golongan === "siap" || b.golongan === "dikoreksi")) return false;
    if (filter && filter !== "siap" && b.golongan !== filter) return false;
    if (!cariKecil) return true;
    const cocokNama = b.cocok.status === "cocok" ? b.cocok.dosen.nama : "";
    return [b.p.judul, b.p.namaDokumen, b.p.kodeDosen, b.p.nip, b.p.ringkas, cocokNama]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(cariKecil));
  });

  const totalHal = Math.max(1, Math.ceil(tersaring.length / PER_HALAMAN));
  const hal = Math.min(Math.max(1, Number(searchParams.hal) || 1), totalHal);
  const tampil = tersaring.slice((hal - 1) * PER_HALAMAN, hal * PER_HALAMAN);

  const barisDiubah = Number.isFinite(Number(searchParams.edit)) ? Number(searchParams.edit) : -1;
  const barisSorot = Number.isFinite(Number(searchParams.sorot)) ? Number(searchParams.sorot) : -1;

  const url = (ubah: Record<string, string | undefined> = {}) => {
    const gabung: Record<string, string | undefined> = {
      f: filter || undefined,
      q: cari || undefined,
      hal: hal > 1 ? String(hal) : undefined,
      ...ubah,
    };
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(gabung)) if (v) q.set(k, v);
    const s = q.toString();
    return `/admin/unggah/${rec.id_unggahan}${s ? `?${s}` : ""}`;
  };
  /** URL kembali setelah menyimpan koreksi: panel tertutup, baris disorot. */
  const kembaliKe = (i: number) => `${url({ edit: undefined, sorot: String(i) })}#baris-${i}`;

  const sudahDiterapkan = rec.status === "diterapkan";
  const bisaTerapkan = Boolean(periodeAktif) && jumlah.siap > 0;
  const alasanTakBisa = !periodeAktif
    ? "Belum ada periode BKD aktif."
    : jumlah.siap === 0
      ? "Tidak ada baris yang siap diterapkan."
      : undefined;

  return (
    <AppShell
      peran="admin"
      nama={session?.user.name ?? "-"}
      deskripsi="Admin, Sistem"
      breadcrumb={["Beranda", "Administrasi", "Unggah SK & ST", "Pratinjau"]}
      title={`Pratinjau: ${LABEL_JENIS[jenis] ?? jenis}`}
      subtitle={rec.nama_file}
      actions={
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            <Link
              href="/admin/unggah"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-[11.5px] font-medium text-cell hover:bg-head-bg"
            >
              <IconBack size={13} /> Kembali
            </Link>
            <form action={terapkanUnggahan}>
              <input type="hidden" name="id_unggahan" value={rec.id_unggahan} />
              <input type="hidden" name="kembali" value={url()} />
              <SubmitButton
                disabled={!bisaTerapkan}
                icon={<IconCheck size={13} />}
                labelProses="Menerapkan ke LKD…"
                title={alasanTakBisa}
                konfirmasi={
                  sudahDiterapkan
                    ? `Terapkan ulang ${jumlah.siap} baris? Kegiatan yang sudah dibuat akan diperbarui mengikuti koreksi terbaru; kegiatan yang sudah diklaim dosen tidak diubah.`
                    : `Terapkan ${jumlah.siap} baris ke LKD dosen periode ${periodeAktif?.nama_periode ?? "aktif"}?`
                }
              >
                {sudahDiterapkan
                  ? `Terapkan Ulang (${jumlah.siap})`
                  : `Terapkan ${jumlah.siap} Baris ke LKD`}
              </SubmitButton>
            </form>
          </div>
          {alasanTakBisa && <p className="text-[10.5px] text-danger">{alasanTakBisa}</p>}
        </div>
      }
    >
      <div
        className={`rounded-[10px] border px-4 py-3 text-[11.5px] leading-snug ${
          sudahDiterapkan
            ? "border-success bg-[#eaf6f0] text-success-tx"
            : "border-line bg-info-bg text-info-tx"
        }`}
      >
        {sudahDiterapkan ? (
          <>
            <b>Sudah diterapkan</b>
            {rec.tanggal_terapkan ? ` pada ${fmt(rec.tanggal_terapkan)}` : ""} — {rec.jumlah_kegiatan}{" "}
            kegiatan dibuat. <b>Terapkan Ulang</b> memperbarui kegiatan yang sudah ada (tidak
            menggandakan), kecuali yang sudah diklaim dosen.
          </>
        ) : (
          <>
            <b>Belum diterapkan — LKD dosen belum berubah.</b> Periksa kolom <b>Akun tujuan</b> dan{" "}
            <b>Parameter</b>; salah baca bisa diperbaiki lewat tombol <b>Ubah</b> pada barisnya.
          </>
        )}
      </div>

      {/* ---- Identitas dokumen + koreksi kepala surat ---- */}
      <div className="mt-4 rounded-[10px] border border-line">
        <div className="border-b border-line bg-head-bg px-4 py-2.5">
          <h2 className="text-[12px] font-semibold text-navy">Identitas dokumen</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 px-4 py-4 md:grid-cols-4">
          <Fakta
            label="Berkas"
            nilai={
              rec.file_url ? (
                <PratinjauPdf
                  url={rec.file_url}
                  judul={rec.nama_file}
                  className="inline-flex items-center gap-1.5 text-primary hover:underline"
                >
                  <IconDoc size={12} /> {rec.nama_file}
                </PratinjauPdf>
              ) : (
                rec.nama_file
              )
            }
          />
          <Fakta
            label="Jenis dokumen"
            nilai={
              // st_bimbingan melayani dua surat; tampilkan hasil deteksi parser.
              (rec.ringkasan as any)?.jenis_bimbingan === "ta"
                ? "SK Pembimbing Tugas Akhir"
                : (rec.ringkasan as any)?.jenis_bimbingan === "pkl"
                  ? "Surat Tugas Pembimbing Praktik Kerja Lapangan"
                  : (spek?.dokumen ?? jenis)
            }
          />
          <Fakta label="Diunggah" nilai={`${fmt(rec.created_at)} oleh ${rec.admin?.nama ?? "-"}`} />
          <Fakta
            label="Periode tujuan"
            nilai={rec.periode_bkd?.nama_periode ?? periodeAktif?.nama_periode ?? "-"}
          />
          <Fakta
            label="Mesin ekstraksi"
            nilai={spek?.mesin === "vlm" ? "Model vision (VLM)" : "Rule-based (pdfplumber)"}
          />
          <Fakta label="Kode rubrik" nilai={[...new Set(penugasan.map((p) => p.kodeRule))].join(", ") || "-"} />
          <div className="md:col-span-2">
            <Fakta
              label="SHA-256 berkas"
              nilai={<span className="break-all font-mono text-[10px]">{rec.sha256 ?? "-"}</span>}
            />
          </div>
        </div>

        {/* Metadata surat rawan salah baca (regex kepala surat / dokumen pindai) */}
        <form action={simpanKoreksiSurat} className="border-t border-line px-4 py-3">
          <input type="hidden" name="id_unggahan" value={rec.id_unggahan} />
          <input type="hidden" name="kembali" value={url()} />
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className={labelKecil}>Nomor surat</label>
              <input
                name="nomor_surat"
                defaultValue={nomorSurat ?? ""}
                placeholder="408/KO/AK.04.01/2025"
                className={`${kolom} w-56`}
              />
            </div>
            <div>
              <label className={labelKecil}>Tanggal surat</label>
              <input
                name="tanggal_surat"
                defaultValue={tanggalSurat ?? ""}
                placeholder="2025-08-15"
                className={`${kolom} w-40`}
              />
            </div>
            <SubmitButton variant="soft" icon={<IconSave size={12} />} labelProses="Menyimpan…">
              Simpan nomor &amp; tanggal
            </SubmitButton>
            <p className="max-w-md text-[10.5px] leading-snug text-muted">
              Dipakai sebagai No./Tgl. SK pada setiap kegiatan yang dibuat.
            </p>
          </div>
        </form>
      </div>

      {/* ---- Peringatan yang perlu tindakan ---- */}
      {peta.temuan.length > 0 && (
        <details className="mt-3 rounded-[10px] border border-danger bg-danger-soft px-4 py-3">
          <summary className="cursor-pointer text-[11.5px] font-semibold text-danger">
            {peta.temuan.length} temuan validasi dokumen — periksa PDF sumber sebelum menerapkan
          </summary>
          <ul className="mt-2 list-inside list-disc space-y-1 text-[11px] leading-snug text-danger">
            {peta.temuan.slice(0, 25).map((t: any, i: number) => (
              <li key={i}>
                <b>{t.jenis}</b>
                {t.kode_mk ? ` (${t.kode_mk}${t.kelas ? ` ${t.kelas}` : ""})` : ""}:{" "}
                {t.pesan ?? t.catatan ?? JSON.stringify(t)}
              </li>
            ))}
            {peta.temuan.length > 25 && <li>… {peta.temuan.length - 25} temuan lainnya</li>}
          </ul>
        </details>
      )}

      {peta.jumlahDitolak > 0 && (
        <div className="mt-3 rounded-[10px] border border-line bg-info-bg px-4 py-3 text-[11px] leading-snug text-info-tx">
          <b>{peta.jumlahDitolak} baris dokumen ditolak parser</b> dan tidak ikut dipetakan.
        </div>
      )}

      {namaTakCocok.length > 0 && (
        <div className="mt-3 rounded-[10px] border border-line bg-info-bg px-4 py-3 text-[11px] leading-snug text-info-tx">
          <b>{namaTakCocok.length} nama dosen di dokumen belum punya akun yang cocok.</b> Barisnya
          dilewati saat menerapkan. Dua cara memperbaiki: tetapkan akun tujuan lewat tombol{" "}
          <b>Ubah</b> pada barisnya, atau lengkapi <b>kode dosen</b> akun terkait di{" "}
          <Link href="/admin/pengguna" className="font-medium text-primary hover:underline">
            Manajemen Pengguna
          </Link>{" "}
          lalu muat ulang halaman ini.
          <p className="mt-1.5 text-[10.5px]">{namaTakCocok.slice(0, 12).join(" · ")}
            {namaTakCocok.length > 12 ? ` · … ${namaTakCocok.length - 12} lainnya` : ""}</p>
        </div>
      )}

      {/* ---- Ringkasan pemetaan + filter ---- */}
      <div className="mt-5">
        <h2 className="text-[13px] font-semibold text-navy">
          Pemetaan penugasan → kegiatan BKD
        </h2>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-5">
        <StatTile
          label="Semua baris"
          nilai={penugasan.length}
          href={url({ f: undefined, hal: undefined, edit: undefined, sorot: undefined })}
          aktif={!filter}
        />
        <StatTile
          label="Siap diterapkan"
          nilai={jumlah.siap}
          nada="siap"
          href={url({ f: "siap", hal: undefined, edit: undefined, sorot: undefined })}
          aktif={filter === "siap"}
        />
        <StatTile
          label="Perlu perhatian"
          nilai={jumlah.masalah}
          nada="masalah"
          href={url({ f: "masalah", hal: undefined, edit: undefined, sorot: undefined })}
          aktif={filter === "masalah"}
        />
        <StatTile
          label="Dikoreksi admin"
          nilai={jumlah.dikoreksi}
          nada="koreksi"
          href={url({ f: "dikoreksi", hal: undefined, edit: undefined, sorot: undefined })}
          aktif={filter === "dikoreksi"}
        />
        <StatTile
          label="Ditandai lewati"
          nilai={jumlah.dilewati}
          nada="redup"
          href={url({ f: "dilewati", hal: undefined, edit: undefined, sorot: undefined })}
          aktif={filter === "dilewati"}
        />
      </div>

      <form className="mt-3 flex flex-wrap items-end gap-3 rounded-[10px] border border-line px-4 py-3">
        {filter && <input type="hidden" name="f" value={filter} />}
        <div className="flex flex-1 flex-col">
          <label className={labelKecil}>
            Cari nama dosen, mata kuliah, atau nama kegiatan
          </label>
          <input
            name="q"
            defaultValue={cari}
            placeholder="mis. Transmissia / Basis Data / KO019N"
            className={kolom}
          />
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-[11.5px] font-medium text-white">
          Cari
        </button>
        {(filter || cari) && (
          <Link
            href={`/admin/unggah/${rec.id_unggahan}`}
            className="rounded-lg border border-line px-3.5 py-2 text-[11.5px] font-medium text-muted"
          >
            Reset
          </Link>
        )}
      </form>

      <p className="mt-3 text-[11px] text-muted">
        Menampilkan <b className="text-cell">{tampil.length}</b> dari {tersaring.length} baris
        {tersaring.length !== penugasan.length && ` (total ${penugasan.length})`}
        {totalHal > 1 && ` · halaman ${hal} dari ${totalHal}`}
      </p>

      {/* ---- Daftar baris ---- */}
      <div className="mt-2 space-y-2">
        {tampil.length === 0 && (
          <div className="rounded-[10px] border border-line px-4 py-8 text-center">
            <p className="text-[11.5px] text-muted">
              {penugasan.length === 0
                ? "Tidak ada penugasan yang dapat dipetakan dari dokumen ini."
                : "Tidak ada baris yang cocok dengan filter."}
            </p>
            {penugasan.length > 0 && (
              <Link
                href={`/admin/unggah/${rec.id_unggahan}`}
                className="mt-1 inline-block text-[10.5px] text-primary hover:underline"
              >
                Tampilkan semua baris
              </Link>
            )}
          </div>
        )}

        {tampil.map(({ i, p, cocok, golongan }) => {
          const ref: any = refPerKode.get(p.kodeRule);
          const fields: any[] = ref?.skema_parameter?.fields ?? [];
          const skema = new Map<string, any>(fields.map((f) => [f.name, f]));
          // jumlahSemester dikunci periode (parser sudah mengisi 1) — tak dikoreksi.
          const fieldsIsian = fieldFormulir(fields);
          const sedangDiubah = barisDiubah === i;
          const disorot = barisSorot === i;

          const bingkai =
            golongan === "dilewati"
              ? "border-line bg-zebra"
              : golongan === "masalah"
                ? "border-danger"
                : golongan === "dikoreksi"
                  ? "border-warning bg-[#fffaf2]"
                  : "border-line";

          return (
            <div
              key={p.tanda}
              id={`baris-${i}`}
              className={`scroll-mt-6 rounded-[10px] border ${bingkai} ${
                disorot ? "ring-2 ring-primary ring-offset-1" : ""
              } ${golongan === "dilewati" ? "opacity-70" : ""}`}
            >
              <div className="grid grid-cols-12 gap-x-4 gap-y-3 px-4 py-3">
                {/* Kegiatan */}
                <div className="col-span-12 md:col-span-5">
                  <p className="text-[11.5px] font-medium text-cell">
                    <span className="mr-1.5 font-normal text-crumb">{i + 1}.</span>
                    {p.judul}
                  </p>
                  <p className="mt-1 text-[10.5px] text-muted">
                    {p.kodeRule} · {ref?.kategori ?? "-"}
                  </p>
                  {p.dikoreksi && p.judulAsli !== p.judul && (
                    <p className="mt-1 text-[10.5px] text-warning-deep">
                      Nama asli parser: &ldquo;{p.judulAsli}&rdquo;
                    </p>
                  )}
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {p.dikoreksi && <StatusChip label="Dikoreksi admin" variant="warning" />}
                    {p.lewati && <StatusChip label="Tidak diterapkan" variant="neutral" />}
                  </div>
                </div>

                {/* Dosen */}
                <div className="col-span-6 md:col-span-3">
                  <p className={labelKecil}>Dosen di dokumen</p>
                  <p className="mt-0.5 text-[11px] text-cell">{p.namaDokumen || "-"}</p>
                  {(p.kodeDosen || p.nip) && (
                    <p className="text-[10.5px] text-muted">
                      {p.kodeDosen ? `Kd ${p.kodeDosen}` : ""}
                      {p.kodeDosen && p.nip ? " · " : ""}
                      {p.nip ? `NIP ${p.nip}` : ""}
                    </p>
                  )}

                  <p className={`${labelKecil} mt-2`}>Akun tujuan</p>
                  {cocok.status === "cocok" ? (
                    <p className="mt-0.5 text-[11px] text-cell">
                      {cocok.dosen.nama}
                      {p.idPenggunaPaksa && (
                        <span className="block text-[10.5px] text-warning-deep">
                          ditetapkan admin
                        </span>
                      )}
                    </p>
                  ) : (
                    <div className="mt-0.5">
                      <StatusChip
                        label={cocok.status === "ambigu" ? "Nama ambigu" : "Tidak ada akun"}
                        variant={cocok.status === "ambigu" ? "warning" : "dangerSoft"}
                      />
                      <p className="mt-1 text-[10.5px] leading-snug text-danger">
                        Baris ini dilewati saat Terapkan. Pilih akunnya lewat <b>Ubah</b>.
                      </p>
                    </div>
                  )}
                </div>

                {/* Parameter */}
                <div className="col-span-6 md:col-span-3">
                  <p className={labelKecil}>Parameter perhitungan</p>
                  <p className="mt-0.5 text-[11px] text-cell">{p.ringkas}</p>
                  <ul className="mt-1 space-y-0.5">
                    {Object.entries(p.parameter).map(([k, v]) => (
                      <li key={k} className="text-[10.5px] leading-snug text-muted">
                        {skema.get(k)?.label ?? labelParameter(k)}:{" "}
                        <span className="text-cell">{tampilNilai(v, skema.get(k)?.type)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Aksi */}
                <div className="col-span-12 flex items-start justify-end md:col-span-1">
                  <Link
                    href={
                      sedangDiubah
                        ? `${url({ edit: undefined })}#baris-${i}`
                        : `${url({ edit: String(i), sorot: undefined })}#baris-${i}`
                    }
                    title={sedangDiubah ? "Tutup panel koreksi" : "Ubah baris"}
                    className={`inline-flex items-center rounded-md p-2 ${
                      sedangDiubah
                        ? "border border-line text-muted hover:bg-head-bg"
                        : "bg-primary-soft text-primary hover:bg-[#dde9fb]"
                    }`}
                  >
                    {sedangDiubah ? <IconX size={13} /> : <IconPencil size={13} />}
                  </Link>
                </div>
              </div>

              {/* Panel koreksi — dibuka lewat URL agar hanya satu terbuka & bisa di-back */}
              {sedangDiubah && (
                <div className="border-t border-line bg-head-bg px-4 py-4">
                  <form action={simpanKoreksiBaris}>
                    <input type="hidden" name="id_unggahan" value={rec.id_unggahan} />
                    <input type="hidden" name="tanda" value={p.tanda} />
                    <input type="hidden" name="kembali" value={kembaliKe(i)} />

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <label className={labelKecil}>Nama kegiatan</label>
                        <input name="judul" defaultValue={p.judul} className={kolom} />
                        {p.judulAsli !== p.judul && (
                          <p className="mt-1 text-[10px] text-muted">Asli: {p.judulAsli}</p>
                        )}
                      </div>
                      <div>
                        <label className={labelKecil}>Akun dosen tujuan</label>
                        <select
                          name="id_pengguna"
                          defaultValue={p.idPenggunaPaksa ?? ""}
                          className={kolom}
                        >
                          <option value="">
                            {cocok.status === "cocok" && !p.idPenggunaPaksa
                              ? `Otomatis — ${cocok.dosen.nama}`
                              : "Otomatis — belum ada yang cocok"}
                          </option>
                          {dosenSistem.map((d) => (
                            <option key={d.id_pengguna} value={d.id_pengguna}>
                              {d.nama}
                              {d.kode_dosen ? ` (${d.kode_dosen})` : ""}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-[10px] text-muted">
                          Kosongkan untuk memakai hasil pencocokan otomatis.
                        </p>
                      </div>
                    </div>

                    {fieldsIsian.length > 0 && (
                      <div className="mt-3">
                        <p className={labelKecil}>
                          Parameter perhitungan — SKS dihitung ulang saat Terapkan
                        </p>
                        <div className="mt-1.5 grid grid-cols-2 gap-3 md:grid-cols-3">
                          {fieldsIsian.map((f) => {
                            const nilai = p.parameter[f.name];
                            const asli = p.parameterAsli[f.name];
                            const berubah = String(nilai) !== String(asli);
                            return (
                              <div key={f.name}>
                                <label className="text-[10.5px] font-medium text-muted">
                                  {f.label}
                                  {berubah && (
                                    <span className="ml-1 text-warning-deep">
                                      (asli {tampilNilai(asli, f.type)})
                                    </span>
                                  )}
                                </label>
                                {f.type === "boolean" ? (
                                  <label className="mt-1 flex items-center gap-1.5 text-[11.5px] text-cell">
                                    <input
                                      type="checkbox"
                                      name={`p_${f.name}`}
                                      defaultChecked={Boolean(nilai)}
                                    />
                                    ya
                                  </label>
                                ) : f.type === "select" ? (
                                  <select
                                    name={`p_${f.name}`}
                                    defaultValue={String(nilai ?? "")}
                                    className={kolom}
                                  >
                                    {(f.options ?? []).map((o: string) => (
                                      <option key={o} value={o}>
                                        {o}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="number"
                                    step="any"
                                    name={`p_${f.name}`}
                                    defaultValue={String(nilai ?? "")}
                                    className={kolom}
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line pt-3">
                      <label className="flex items-center gap-1.5 text-[11px] text-cell">
                        <input type="checkbox" name="lewati" defaultChecked={p.lewati} />
                        Lewati baris ini — jangan buat kegiatan darinya
                      </label>
                      <SubmitButton icon={<IconSave size={12} />} labelProses="Menyimpan…">
                        Simpan koreksi
                      </SubmitButton>
                      <Link
                        href={`${url({ edit: undefined })}#baris-${i}`}
                        className="rounded-lg border border-line bg-white px-3.5 py-2 text-[11.5px] font-medium text-muted hover:bg-head-bg"
                      >
                        Batal
                      </Link>
                    </div>
                  </form>

                  {(p.dikoreksi || p.lewati) && (
                    <form action={resetKoreksiBaris} className="mt-3 border-t border-line pt-3">
                      <input type="hidden" name="id_unggahan" value={rec.id_unggahan} />
                      <input type="hidden" name="tanda" value={p.tanda} />
                      <input type="hidden" name="kembali" value={kembaliKe(i)} />
                      <SubmitButton
                        variant="danger"
                        labelProses="Mengembalikan…"
                        konfirmasi="Buang semua koreksi pada baris ini dan kembali ke hasil ekstraksi asli?"
                      >
                        Kembalikan ke hasil ekstraksi asli
                      </SubmitButton>
                    </form>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Paginasi */}
      {totalHal > 1 && (
        <nav className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
          <Link
            href={url({ hal: hal > 2 ? String(hal - 1) : undefined, edit: undefined })}
            aria-disabled={hal === 1}
            className={`rounded-md border border-line px-3 py-1.5 text-[11px] font-medium ${
              hal === 1 ? "pointer-events-none text-crumb" : "text-cell hover:bg-head-bg"
            }`}
          >
            Sebelumnya
          </Link>
          {Array.from({ length: totalHal }, (_, k) => k + 1)
            .filter((n) => n === 1 || n === totalHal || Math.abs(n - hal) <= 2)
            .map((n, idx, arr) => (
              <span key={n} className="flex items-center gap-1.5">
                {idx > 0 && arr[idx - 1] !== n - 1 && <span className="text-[11px] text-crumb">…</span>}
                <Link
                  href={url({ hal: n > 1 ? String(n) : undefined, edit: undefined })}
                  aria-current={n === hal ? "page" : undefined}
                  className={`rounded-md px-3 py-1.5 text-[11px] font-medium ${
                    n === hal
                      ? "bg-primary text-white"
                      : "border border-line text-cell hover:bg-head-bg"
                  }`}
                >
                  {n}
                </Link>
              </span>
            ))}
          <Link
            href={url({ hal: hal < totalHal ? String(hal + 1) : String(totalHal), edit: undefined })}
            aria-disabled={hal === totalHal}
            className={`rounded-md border border-line px-3 py-1.5 text-[11px] font-medium ${
              hal === totalHal ? "pointer-events-none text-crumb" : "text-cell hover:bg-head-bg"
            }`}
          >
            Berikutnya
          </Link>
        </nav>
      )}

      {/* Aksi penutup — agar tak perlu menggulir kembali ke atas */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-line bg-zebra px-4 py-3">
        <p className="text-[11px] leading-snug text-muted">
          {jumlah.siap} baris siap diterapkan
          {jumlah.masalah > 0 && ` · ${jumlah.masalah} perlu perhatian`}
          {jumlah.dilewati > 0 && ` · ${jumlah.dilewati} dilewati`}
          {periodeAktif ? ` · tujuan: ${periodeAktif.nama_periode}` : " · belum ada periode aktif"}
        </p>
        <form action={terapkanUnggahan}>
          <input type="hidden" name="id_unggahan" value={rec.id_unggahan} />
          <input type="hidden" name="kembali" value={url()} />
          <SubmitButton
            disabled={!bisaTerapkan}
            icon={<IconCheck size={13} />}
            labelProses="Menerapkan ke LKD…"
            title={alasanTakBisa}
            konfirmasi={
              sudahDiterapkan
                ? `Terapkan ulang ${jumlah.siap} baris? Kegiatan yang sudah dibuat akan diperbarui mengikuti koreksi terbaru; kegiatan yang sudah diklaim dosen tidak diubah.`
                : `Terapkan ${jumlah.siap} baris ke LKD dosen periode ${periodeAktif?.nama_periode ?? "aktif"}?`
            }
          >
            {sudahDiterapkan ? "Terapkan Ulang" : "Terapkan ke LKD Dosen"}
          </SubmitButton>
        </form>
      </div>
    </AppShell>
  );
}
