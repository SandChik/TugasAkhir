import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import AppShell from "../../../components/AppShell";
import DataTable from "../../../components/DataTable";
import StatusChip, { type ChipVariant } from "../../../components/StatusChip";
import StatTile from "../../../components/StatTile";
import SubmitButton from "../../../components/SubmitButton";
import FormUnggahIsian from "../../../components/FormUnggahIsian";
import {
  IconUpload,
  IconEye,
  IconTrash,
  IconDoc,
  IconCheck,
  IconChevronRight,
} from "../../../components/Icons";
import PratinjauPdf from "../../../components/PratinjauPdf";
import {
  JENIS_UNGGAHAN,
  LABEL_JENIS,
  kesehatanParser,
  parserDikonfigurasi,
} from "../../../lib/parserDokumen";
import { unggahDokumen, hapusUnggahan, terapkanUnggahan } from "./actions";

const fmt = (d: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);

const fmtUkuran = (b?: number | null) =>
  !b ? "-" : b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;

const kolom =
  "mt-1 w-full rounded-md border border-line bg-white px-2.5 py-2 text-[11.5px] text-cell outline-none focus:border-primary";

const CHIP_STATUS: Record<string, { label: string; variant: ChipVariant }> = {
  terparse: { label: "Perlu diperiksa", variant: "warning" },
  diterapkan: { label: "Sudah diterapkan", variant: "success" },
  gagal: { label: "Ekstraksi gagal", variant: "danger" },
};

const LANGKAH = [
  {
    judul: "Unggah & ekstrak",
    isi: "Pilih seluruh PDF di folder SK & ST sekaligus. Tiap berkas dibaca layanan parser.",
  },
  {
    judul: "Periksa & koreksi",
    isi: "Buka pratinjau: cocokkan dosen, perbaiki salah baca, lewati baris yang tak perlu.",
  },
  {
    judul: "Terapkan ke LKD",
    isi: "Kegiatan masuk ke laporan dosen periode aktif dan PDF surat ikut jadi bukti.",
  },
];

/**
 * Nama jenis dokumen untuk ditampilkan. Satu jenis unggahan (`st_bimbingan`)
 * melayani dua surat berbeda, jadi hasil deteksi parser ikut ditampilkan.
 */
function namaJenis(u: any): string {
  const dasar = LABEL_JENIS[u.jenis] ?? u.jenis;
  const b = (u.ringkasan as any)?.jenis_bimbingan;
  if (!b) return dasar;
  return b === "ta" ? "SK Pembimbing Tugas Akhir" : "ST Pembimbing PKL";
}

const URUT_RINGKASAN = [
  ["terekstrak", "baris"],
  ["mahasiswa", "mahasiswa"],
  ["kelompok", "kelompok"],
  ["grup_sidang", "sidang"],
  ["total_mahasiswa", "mahasiswa"],
  ["jumlah_mk", "MK"],
  ["baris_tergabung", "baris SK"],
  ["jumlah_dosen", "dosen"],
  ["jumlah_dosen_jtk", "dosen JTK"],
  ["ditolak", "ditolak"],
] as const;

/** Ringkasan parser -> pasangan angka + label, satu chip per angka. */
function ringkasanBagian(r: any) {
  if (!r || typeof r !== "object") return [];
  return URUT_RINGKASAN.filter(([k]) => typeof r[k] === "number").map(([k, label]) => ({
    kunci: k,
    nilai: r[k] as number,
    label,
  }));
}

/** Kolom "Hasil ekstraksi": satu chip per angka supaya tidak jadi satu baris panjang. */
function selRingkasan(r: any) {
  const bagian = ringkasanBagian(r);
  if (bagian.length === 0) return <span className="text-crumb">-</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {bagian.map((b) => {
        const tolak = b.kunci === "ditolak" && b.nilai > 0;
        return (
          <span
            key={b.kunci}
            className={`inline-flex items-baseline gap-1 rounded border px-1.5 py-0.5 text-[10px] leading-4 ${
              tolak ? "border-danger/40 bg-danger-soft text-danger" : "border-line bg-zebra text-muted"
            }`}
          >
            <b className={`text-[11px] font-semibold ${tolak ? "" : "text-cell"}`}>{b.nilai}</b>
            {b.label}
          </span>
        );
      })}
    </div>
  );
}

/** Fitur admin: unggah SK & ST lalu ekstrak lewat layanan parser dokumen. */
export default async function UnggahPage({
  searchParams,
}: {
  searchParams: { status?: string; jenis?: string; q?: string };
}) {
  const session = await getServerSession(authOptions);

  const status = ["terparse", "diterapkan", "gagal"].includes(searchParams.status ?? "")
    ? searchParams.status!
    : "";
  const jenisFilter = JENIS_UNGGAHAN.some((j) => j.key === searchParams.jenis)
    ? searchParams.jenis!
    : "";
  const cari = (searchParams.q ?? "").trim();

  const where: any = {};
  if (status) where.status = status;
  if (jenisFilter) where.jenis = jenisFilter;
  if (cari)
    where.OR = [
      { nama_file: { contains: cari, mode: "insensitive" } },
      { nomor_surat: { contains: cari, mode: "insensitive" } },
    ];
  const adaFilter = Boolean(status || jenisFilter || cari);

  const [periode, daftar, perStatus, total, sehat] = await Promise.all([
    prisma.periode_bkd.findFirst({ where: { status: "aktif" } }),
    prisma.unggahan_dokumen.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 50,
      include: { admin: { select: { nama: true } } },
    }),
    prisma.unggahan_dokumen.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.unggahan_dokumen.count(),
    kesehatanParser(),
  ]);

  const hitung = (s: string) =>
    perStatus.find((g: any) => g.status === s)?._count?._all ?? 0;

  const terkonfigurasi = parserDikonfigurasi();
  const layananSiap = Boolean(sehat && sehat.auth_dikonfigurasi && terkonfigurasi);

  // Satu tempat untuk semua penghalang: admin tahu persis apa yang menahan
  // tombol unggah, bukan sekadar tombol yang mati tanpa keterangan.
  const penghalang: { judul: string; solusi: React.ReactNode }[] = [];
  if (!sehat)
    penghalang.push({
      judul: `Layanan ekstraksi tidak menjawab di ${process.env.PARSER_API_URL || "http://localhost:8000"}`,
      solusi: (
        <>
          Jalankan <code>uvicorn api:app --port 8000</code> di folder{" "}
          <code>backend-extract</code> (atau <code>docker compose up -d</code>), lalu muat ulang
          halaman ini.
        </>
      ),
    });
  if (sehat && !terkonfigurasi)
    penghalang.push({
      judul: "PARSER_API_KEY belum diisi di .env aplikasi",
      solusi: (
        <>
          Salin nilai <code>API_KEY</code> dari <code>backend-extract/.env</code> ke{" "}
          <code>PARSER_API_KEY</code>, lalu jalankan ulang <code>npm run dev</code>.
        </>
      ),
    });
  if (sehat && terkonfigurasi && !sehat.auth_dikonfigurasi)
    penghalang.push({
      judul: "Layanan ekstraksi berjalan tanpa API key",
      solusi: (
        <>
          Isi <code>API_KEY</code> pada <code>backend-extract/.env</code> lalu jalankan ulang
          layanan parser.
        </>
      ),
    });
  if (!periode)
    penghalang.push({
      judul: "Belum ada periode BKD aktif",
      solusi: <>Aktifkan satu periode di menu Periode BKD sebelum hasil ekstraksi diterapkan.</>,
    });

  const alasanTombol = !layananSiap
    ? "Tombol nonaktif karena layanan ekstraksi belum siap — lihat daftar di atas."
    : undefined;

  const tautan = (ubah: Record<string, string>) => {
    const q = new URLSearchParams();
    const nilai = { status, jenis: jenisFilter, q: cari, ...ubah };
    for (const [k, v] of Object.entries(nilai)) if (v) q.set(k, v);
    const s = q.toString();
    return s ? `/admin/unggah?${s}` : "/admin/unggah";
  };

  return (
    <AppShell
      peran="admin"
      nama={session?.user.name ?? "-"}
      deskripsi="Admin, Sistem"
      breadcrumb={["Beranda", "Administrasi", "Unggah SK & ST"]}
      title="Unggah Dokumen SK & ST"
      subtitle="Ubah surat tugas dan SK menjadi kegiatan BKD per dosen"
      actions={
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted">Layanan parser</span>
          <StatusChip
            label={sehat ? (layananSiap ? "Terhubung" : "Kunci belum lengkap") : "Tidak aktif"}
            variant={sehat ? (layananSiap ? "success" : "warning") : "danger"}
          />
        </div>
      }
    >
      {/* Alur kerja: tiga langkah, sekali lihat */}
      <ol className="grid grid-cols-1 gap-2 md:grid-cols-3">
        {LANGKAH.map((l, i) => (
          <li key={l.judul} className="flex gap-2.5 rounded-[10px] border border-line px-3.5 py-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-semibold text-primary">
              {i + 1}
            </span>
            <div>
              <p className="text-[11.5px] font-medium text-navy">{l.judul}</p>
              <p className="mt-0.5 text-[10.5px] leading-snug text-muted">{l.isi}</p>
            </div>
          </li>
        ))}
      </ol>

      {penghalang.length > 0 && (
        <div className="mt-3 rounded-[10px] border border-danger bg-danger-soft px-4 py-3">
          <p className="text-[11.5px] font-semibold text-danger">
            {penghalang.length === 1
              ? "1 hal perlu dibereskan sebelum mengunggah"
              : `${penghalang.length} hal perlu dibereskan sebelum mengunggah`}
          </p>
          <ul className="mt-2 space-y-1.5">
            {penghalang.map((p, i) => (
              <li key={i} className="text-[11px] leading-snug text-danger">
                <b>{p.judul}.</b> <span className="font-normal">{p.solusi}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {sehat && !sehat.vlm_aktif && (
        <div className="mt-3 rounded-[10px] border border-line bg-info-bg px-4 py-3 text-[11px] leading-snug text-info-tx">
          <b>Parser VLM nonaktif.</b> SK Pembina Ormawa dan Artefak Dokumen Umum belum bisa
          diekstrak.
        </div>
      )}

      {/* ---- Langkah 1: form unggah, terlipat sampai admin membukanya ---- */}
      <details className="group mt-4 overflow-hidden rounded-[10px] border border-line">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-head-bg px-4 py-2.5 [&::-webkit-details-marker]:hidden">
          <span>
            <span className="block text-[12px] font-semibold text-navy">Unggah berkas</span>
            <span className="block text-[10.5px] text-muted">
              Format PDF, maksimal 25 MB per berkas, boleh banyak berkas sekaligus.
            </span>
          </span>
          <IconChevronRight
            size={14}
            className="shrink-0 text-muted transition-transform group-open:rotate-90"
          />
        </summary>

        <form action={unggahDokumen} className="border-t border-line">
          <FormUnggahIsian
            daftarJenis={JENIS_UNGGAHAN.map((j) => ({
              key: j.key,
              label: j.label,
              mesin: j.mesin,
            }))}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
            <p className="text-[11px] text-muted">
              {periode ? (
                <>
                  Periode tujuan: <b className="text-cell">{periode.nama_periode}</b>
                </>
              ) : (
                "Belum ada periode aktif — hasil ekstraksi tidak dapat diterapkan."
              )}
            </p>
            <div className="flex items-center gap-3">
              {alasanTombol && <span className="text-[10.5px] text-danger">{alasanTombol}</span>}
              <SubmitButton
                disabled={!layananSiap}
                icon={<IconUpload size={13} />}
                labelProses="Mengekstrak berkas…"
                title={alasanTombol}
              >
                Unggah &amp; Ekstrak
              </SubmitButton>
            </div>
          </div>
        </form>
      </details>

      {/* ---- Riwayat unggahan ---- */}
      <div className="mt-6 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-semibold text-navy">Riwayat unggahan</h2>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatTile
          label="Semua unggahan"
          nilai={total}
          href={tautan({ status: "" })}
          aktif={!status}
        />
        <StatTile
          label="Perlu diperiksa"
          nilai={hitung("terparse")}
          nada="koreksi"
          href={tautan({ status: "terparse" })}
          aktif={status === "terparse"}
        />
        <StatTile
          label="Sudah diterapkan"
          nilai={hitung("diterapkan")}
          nada="siap"
          href={tautan({ status: "diterapkan" })}
          aktif={status === "diterapkan"}
        />
        <StatTile
          label="Ekstraksi gagal"
          nilai={hitung("gagal")}
          nada="masalah"
          href={tautan({ status: "gagal" })}
          aktif={status === "gagal"}
        />
      </div>

      <form className="mt-3 flex flex-wrap items-end gap-3 rounded-[10px] border border-line px-4 py-3">
        {status && <input type="hidden" name="status" value={status} />}
        <div className="flex flex-col">
          <label className="text-[10.5px] font-medium text-muted">Jenis dokumen</label>
          <select name="jenis" defaultValue={jenisFilter} className={`${kolom} w-52`}>
            <option value="">Semua jenis</option>
            {JENIS_UNGGAHAN.map((j) => (
              <option key={j.key} value={j.key}>
                {j.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-1 flex-col">
          <label className="text-[10.5px] font-medium text-muted">
            Cari nama berkas atau nomor surat
          </label>
          <input
            name="q"
            defaultValue={cari}
            placeholder="mis. pengajaran-2025.pdf atau 408/KO"
            className={kolom}
          />
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-[11.5px] font-medium text-white">
          Terapkan filter
        </button>
        {adaFilter && (
          <Link
            href="/admin/unggah"
            className="rounded-lg border border-line px-3.5 py-2 text-[11.5px] font-medium text-muted"
          >
            Reset
          </Link>
        )}
      </form>

      <p className="mt-3 text-[11px] text-muted">
        Menampilkan <b className="text-cell">{daftar.length}</b> dari {total} unggahan
        {daftar.length === 50 && " (50 terbaru)"}
      </p>

      <div className="mt-2">
        <DataTable
          columns={[
            { label: "Berkas & jenis" },
            { label: "Nomor surat", width: "150px" },
            { label: "Hasil ekstraksi", width: "210px" },
            { label: "Dosen dikenali", width: "130px" },
            { label: "Status", width: "155px" },
            { label: "Aksi", width: "90px" },
          ]}
        >
          {daftar.length === 0 ? (
            <tr>
              <td colSpan={6} className="!py-8 !text-center">
                <p className="text-[11.5px] text-muted">
                  {adaFilter
                    ? "Tidak ada unggahan yang cocok dengan filter."
                    : "Belum ada dokumen diunggah."}
                </p>
                <p className="mt-1 text-[10.5px] text-crumb">
                  {adaFilter ? (
                    <Link href="/admin/unggah" className="text-primary hover:underline">
                      Reset filter
                    </Link>
                  ) : (
                    "Mulai dari formulir di atas — pilih PDF surat tugas, lalu Unggah & Ekstrak."
                  )}
                </p>
              </td>
            </tr>
          ) : (
            daftar.map((u: any) => {
              const chip = CHIP_STATUS[u.status] ?? {
                label: u.status,
                variant: "neutral" as ChipVariant,
              };
              const dari = u.jumlah_dosen_dokumen ?? 0;
              const cocok = u.jumlah_dosen_cocok ?? 0;
              const rasio = dari > 0 ? Math.round((cocok / dari) * 100) : 0;
              return (
                <tr key={u.id_unggahan}>
                  <td>
                    {u.file_url ? (
                      <PratinjauPdf
                        url={u.file_url}
                        judul={u.nama_file}
                        className="inline-flex items-center gap-1.5 text-left font-medium text-primary hover:underline"
                      >
                        <IconDoc size={13} /> {u.nama_file}
                      </PratinjauPdf>
                    ) : (
                      <span className="font-medium">{u.nama_file}</span>
                    )}
                    <p className="mt-1 text-[10.5px] text-muted">
                      {namaJenis(u)} · {fmtUkuran(u.ukuran_byte)} ·{" "}
                      {fmt(u.created_at)} · {u.admin?.nama ?? "-"}
                    </p>
                    {u.status === "gagal" && u.pesan_galat && (
                      <p className="mt-1.5 rounded bg-danger-soft px-2 py-1 text-[10.5px] leading-snug text-danger">
                        {u.pesan_galat}
                      </p>
                    )}
                  </td>
                  <td className="!text-[11px]">{u.nomor_surat ?? "-"}</td>
                  <td>{selRingkasan(u.ringkasan)}</td>
                  <td>
                    {u.status === "gagal" ? (
                      <span className="text-crumb">-</span>
                    ) : (
                      <>
                        <span className="text-[11.5px]">
                          {cocok} dari {dari}
                        </span>
                        <span className="mt-1 block h-1.5 w-full overflow-hidden rounded bg-head-bg">
                          <span
                            className={`block h-full ${rasio === 100 ? "bg-success" : rasio > 0 ? "bg-warning" : "bg-danger"}`}
                            style={{ width: `${rasio}%` }}
                          />
                        </span>
                        <span className="mt-1 block text-[10.5px] text-muted">
                          {dari === 0
                            ? "tidak ada nama dosen"
                            : cocok === dari
                              ? "semua punya akun"
                              : `${dari - cocok} tanpa akun`}
                        </span>
                      </>
                    )}
                  </td>
                  <td>
                    <StatusChip label={chip.label} variant={chip.variant} />
                    {u.status === "diterapkan" && (
                      <p className="mt-1.5 text-[10.5px] text-muted">
                        {u.jumlah_kegiatan} kegiatan dibuat
                        {u.tanggal_terapkan ? ` · ${fmt(u.tanggal_terapkan)}` : ""}
                      </p>
                    )}
                    {u.status === "terparse" && (
                      <p className="mt-1.5 text-[10.5px] text-muted">belum masuk ke LKD dosen</p>
                    )}
                  </td>
                  <td>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {u.status !== "gagal" && (
                        <form action={terapkanUnggahan}>
                          <input type="hidden" name="id_unggahan" value={u.id_unggahan} />
                          <input type="hidden" name="kembali" value={tautan({})} />
                          <SubmitButton
                            disabled={!periode}
                            className="!bg-[#e6f4ec] !p-2 !text-success-tx hover:!bg-[#d8ecdf]"
                            icon={<IconCheck size={13} />}
                            labelProses=""
                            title={
                              !periode
                                ? "Belum ada periode aktif"
                                : u.status === "diterapkan"
                                  ? "Terapkan ulang ke LKD dosen"
                                  : "Terapkan ke LKD dosen"
                            }
                            konfirmasi={
                              u.status === "diterapkan"
                                ? `Terapkan ulang "${u.nama_file}"? Kegiatan yang sudah dibuat diperbarui mengikuti koreksi terbaru; kegiatan yang sudah diklaim dosen tidak diubah.`
                                : `Terapkan "${u.nama_file}" ke LKD dosen periode ${periode?.nama_periode ?? "aktif"}?`
                            }
                            tombolKonfirmasi="Ya, terapkan"
                          >
                            {""}
                          </SubmitButton>
                        </form>
                      )}
                      {u.status !== "gagal" && (
                        <Link
                          href={`/admin/unggah/${u.id_unggahan}`}
                          title={u.status === "diterapkan" ? "Lihat hasil ekstraksi" : "Periksa hasil ekstraksi"}
                          className="inline-flex items-center rounded-md bg-primary-soft p-2 text-primary hover:bg-[#dde9fb]"
                        >
                          <IconEye size={13} />
                        </Link>
                      )}
                      {u.status !== "diterapkan" && (
                        <form action={hapusUnggahan}>
                          <input type="hidden" name="id_unggahan" value={u.id_unggahan} />
                          <SubmitButton
                            variant="danger"
                            className="!p-2"
                            title="Hapus unggahan"
                            icon={<IconTrash size={13} />}
                            labelProses=""
                            konfirmasi={`Hapus unggahan "${u.nama_file}"? Hasil ekstraksi dan koreksinya ikut hilang. Berkas PDF tetap tersimpan di arsip.`}
                          >
                            {""}
                          </SubmitButton>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </DataTable>
      </div>
    </AppShell>
  );
}
