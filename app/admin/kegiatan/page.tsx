import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import AppShell from "../../../components/AppShell";
import DataTable from "../../../components/DataTable";
import StatTile from "../../../components/StatTile";
import StatusChip from "../../../components/StatusChip";
import SubmitButton from "../../../components/SubmitButton";
import FormKegiatanAdmin, { type KegiatanAwal } from "../../../components/FormKegiatanAdmin";
import { KATEGORI_INPUT_ADMIN } from "../../../lib/kategoriDosen";
import { faseAktif, FASE_LABEL } from "../../../lib/fase";
import { IconPencil, IconTrash } from "../../../components/Icons";
import { hapusKegiatanDosen } from "./actions";

const KODE_ADMIN = Object.keys(KATEGORI_INPUT_ADMIN);

/**
 * FR-07 (jalur admin): input kegiatan berbasis penugasan atas nama dosen.
 * Melengkapi menu "Unggah SK & ST" — dipakai untuk penugasan yang tidak
 * terangkum di surat (mis. susulan, ralat) atau ketika dokumennya belum terbit.
 */
export default async function InputKegiatanPage({
  searchParams,
}: {
  searchParams: { dosen?: string; ref?: string; klaim?: string; edit?: string; ok?: string };
}) {
  const session = await getServerSession(authOptions);

  const filterDosen = (searchParams.dosen ?? "").trim();
  const filterRef = KODE_ADMIN.includes(searchParams.ref ?? "") ? searchParams.ref! : "";
  const filterKlaim = ["belum", "sudah"].includes(searchParams.klaim ?? "")
    ? searchParams.klaim!
    : "";

  const tautan = (ubah: Record<string, string>) => {
    const q = new URLSearchParams();
    const nilai: Record<string, string> = {
      dosen: filterDosen,
      ref: filterRef,
      klaim: filterKlaim,
      ...ubah,
    };
    for (const [k, v] of Object.entries(nilai)) if (v) q.set(k, v);
    const s = q.toString();
    return s ? `/admin/kegiatan?${s}` : "/admin/kegiatan";
  };
  const kembali = tautan({});

  // id kegiatan kolom UUID: query sembarangan tidak boleh sampai ke Prisma.
  const idEdit = /^[0-9a-f-]{36}$/i.test(searchParams.edit ?? "") ? searchParams.edit! : "";

  const [periode, dosenAktif, referensi] = await Promise.all([
    prisma.periode_bkd.findFirst({ where: { status: "aktif" } }),
    prisma.pengguna.findMany({
      where: { peran: "dosen", aktif: true },
      select: { id_pengguna: true, nama: true, program_studi: true },
      orderBy: { nama: "asc" },
    }),
    prisma.referensi_kegiatan.findMany({
      where: { kode_rule: { in: KODE_ADMIN } },
      orderBy: { kode_rule: "asc" },
    }),
  ]);

  const fase = periode ? faseAktif(periode) : "selesai";
  const dasar: any = periode
    ? { sumber_data: "admin", lkd: { id_periode: periode.id_periode } }
    : null;

  const terkunciSet = new Set<string>();
  if (periode) {
    const lkdPeriode = await prisma.lkd.findMany({
      where: { id_periode: periode.id_periode, jenis: "laporan", simpan_permanen: true },
      select: { id_pengguna: true },
    });
    for (const l of lkdPeriode) terkunciSet.add(l.id_pengguna);
  }

  const where: any = dasar ? { ...dasar, lkd: { ...dasar.lkd } } : null;
  if (where && filterDosen) where.lkd.id_pengguna = filterDosen;
  if (where && filterRef) where.referensi_kegiatan = { kode_rule: filterRef };
  if (where && filterKlaim) where.diklaim = filterKlaim === "sudah";

  const [daftar, total, belum, edit] = await Promise.all([
    where
      ? prisma.kegiatan.findMany({
          where,
          include: { lkd: { include: { pengguna: true } }, referensi_kegiatan: true },
          orderBy: { created_at: "desc" },
          take: 100,
        })
      : Promise.resolve([] as any[]),
    dasar ? prisma.kegiatan.count({ where: dasar }) : Promise.resolve(0),
    dasar ? prisma.kegiatan.count({ where: { ...dasar, diklaim: false } }) : Promise.resolve(0),
    idEdit
      ? prisma.kegiatan.findUnique({
          where: { id_kegiatan: idEdit },
          include: { lkd: true, referensi_kegiatan: true },
        })
      : Promise.resolve(null),
  ]);

  // Mode ubah hanya untuk kegiatan input admin periode aktif yang belum diklaim,
  // dan yang jenisnya memang dikelola di halaman ini.
  const bolehUbah =
    edit &&
    (edit as any).sumber_data === "admin" &&
    !(edit as any).diklaim &&
    edit.lkd.id_periode === periode?.id_periode &&
    KODE_ADMIN.includes(edit.referensi_kegiatan.kode_rule)
      ? edit
      : null;
  const awal: KegiatanAwal | null = bolehUbah
    ? {
        id: bolehUbah.id_kegiatan,
        id_pengguna: bolehUbah.lkd.id_pengguna,
        kode_rule: bolehUbah.referensi_kegiatan.kode_rule,
        judul: bolehUbah.judul,
        detail: (bolehUbah.detail_kegiatan as any) ?? {},
        parameter: (bolehUbah.parameter as any) ?? {},
      }
    : null;

  return (
    <AppShell
      peran="admin"
      nama={session?.user.name ?? "-"}
      deskripsi="Admin, Sistem"
      breadcrumb={["Beranda", "Administrasi", "Input Kegiatan Dosen"]}
      title="Input Kegiatan Dosen"
      subtitle="Mencatat kegiatan berbasis penugasan — perkuliahan, bimbingan, pengujian, dan pembinaan mahasiswa"
      actions={
        <span className="rounded-lg border border-line px-3 py-2 text-xs text-navy">
          {periode?.nama_periode ?? "Belum ada periode aktif"} · {FASE_LABEL[fase]}
        </span>
      }
    >
      {!periode && (
        <div className="rounded-[10px] border border-danger bg-danger-soft px-4 py-3 text-[11px] leading-snug text-danger">
          <b>Belum ada periode BKD aktif.</b> Aktifkan satu periode di menu{" "}
          <Link href="/admin/periode" className="underline">
            Periode BKD
          </Link>{" "}
          sebelum mencatat kegiatan dosen.
        </div>
      )}

      <div id="form" className={`scroll-mt-4${periode ? "" : " mt-3"}`}>
        {/*
          `key` memaksa formulir di-mount ulang saat sasaran ubah berganti atau
          setelah aksi tersimpan. Tanpa ini, pindah ke mode ubah lewat navigasi
          client (klik ikon pensil) hanya memperbarui props: state pilihan dosen
          & jenis dan seluruh defaultValue tetap memakai nilai mount pertama,
          sehingga isian formulir tidak mencerminkan kegiatan yang dibuka.
        */}
        <FormKegiatanAdmin
          key={`${awal?.id ?? "tambah"}|${searchParams.ok ? "tersimpan" : ""}`}
          dosen={dosenAktif.map((d: any) => ({
            id: d.id_pengguna,
            nama: d.nama,
            program_studi: d.program_studi,
            terkunci: terkunciSet.has(d.id_pengguna),
          }))}
          referensi={referensi.map((r: any) => ({
            kode_rule: r.kode_rule,
            kategori: r.kategori,
            nama_kegiatan: r.nama_kegiatan,
            fungsi_contract: r.fungsi_contract,
            fields: (r.skema_parameter as any)?.fields ?? [],
          }))}
          awal={awal}
          kembali={kembali}
          periodeNama={periode?.nama_periode ?? null}
        />
      </div>

      {idEdit && !awal && (
        <p className="mt-2 text-[11px] text-danger">
          Kegiatan yang hendak diubah sudah diklaim dosen atau bukan hasil input admin — formulir di
          atas kembali ke mode tambah.
        </p>
      )}

      <h2 className="mt-6 text-[13px] font-semibold text-navy">
        Kegiatan yang dicatat admin{periode ? ` · ${periode.nama_periode}` : ""}
      </h2>

      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
        <StatTile
          label="Semua kegiatan"
          nilai={total}
          href={tautan({ klaim: "" })}
          aktif={!filterKlaim}
        />
        <StatTile
          label="Belum diklaim"
          nilai={belum}
          nada="koreksi"
          href={tautan({ klaim: "belum" })}
          aktif={filterKlaim === "belum"}
        />
        <StatTile
          label="Sudah diklaim"
          nilai={total - belum}
          nada="siap"
          href={tautan({ klaim: "sudah" })}
          aktif={filterKlaim === "sudah"}
        />
      </div>

      <form className="mt-3 flex flex-wrap items-end gap-3 rounded-[10px] border border-line px-4 py-3">
        {filterKlaim && <input type="hidden" name="klaim" value={filterKlaim} />}
        <div className="flex flex-col">
          <label className="text-[10.5px] font-medium text-muted">Dosen</label>
          <select
            name="dosen"
            defaultValue={filterDosen}
            className="mt-1 w-56 rounded-md border border-line bg-white px-2.5 py-2 text-[11.5px] text-cell outline-none focus:border-primary"
          >
            <option value="">Semua dosen</option>
            {dosenAktif.map((d: any) => (
              <option key={d.id_pengguna} value={d.id_pengguna}>
                {d.nama}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-[10.5px] font-medium text-muted">Jenis kegiatan</label>
          <select
            name="ref"
            defaultValue={filterRef}
            className="mt-1 w-72 rounded-md border border-line bg-white px-2.5 py-2 text-[11.5px] text-cell outline-none focus:border-primary"
          >
            <option value="">Semua jenis</option>
            {referensi.map((r: any) => (
              <option key={r.kode_rule} value={r.kode_rule}>
                {r.kategori} — {r.kode_rule}
              </option>
            ))}
          </select>
        </div>
        <button className="rounded-lg bg-primary px-4 py-2 text-[11.5px] font-medium text-white">
          Terapkan filter
        </button>
        {(filterDosen || filterRef || filterKlaim) && (
          <Link
            href="/admin/kegiatan"
            className="rounded-lg border border-line px-3.5 py-2 text-[11.5px] font-medium text-muted"
          >
            Reset
          </Link>
        )}
      </form>

      <div className="mt-3">
        <DataTable
          columns={[
            { label: "No", width: "50px" },
            { label: "Dosen", width: "180px" },
            { label: "Kegiatan" },
            { label: "Jenis", width: "210px" },
            { label: "SKS", width: "80px" },
            { label: "Status klaim", width: "130px" },
            { label: "Aksi", width: "120px" },
          ]}
        >
          {daftar.length === 0 ? (
            <tr>
              <td colSpan={7} className="!text-center !text-crumb">
                {periode
                  ? filterDosen || filterRef || filterKlaim
                    ? "Tidak ada kegiatan yang cocok dengan filter."
                    : "Belum ada kegiatan yang dicatat admin pada periode ini."
                  : "Belum ada periode aktif."}
              </td>
            </tr>
          ) : (
            daftar.map((k: any, i: number) => {
              const d: any = k.detail_kegiatan ?? {};
              return (
                <tr key={k.id_kegiatan}>
                  <td>{i + 1}</td>
                  <td>{k.lkd.pengguna.nama}</td>
                  <td>
                    {k.judul}
                    <span className="mt-0.5 block text-[10px] text-crumb">
                      {k.referensi_kegiatan.kode_rule} · SK {d.no_sk || "-"} · Tgl {d.tgl_sk || "-"}
                    </span>
                  </td>
                  <td className="!text-[10.5px] !text-muted">{k.referensi_kegiatan.kategori}</td>
                  <td>
                    {k.sks_dihitung_x100 != null
                      ? (k.sks_dihitung_x100 / 100).toFixed(2)
                      : k.status_perhitungan === "gagal"
                        ? "gagal"
                        : "manual"}
                  </td>
                  <td>
                    <StatusChip
                      label={k.diklaim ? "Diklaim" : "Belum diklaim"}
                      variant={k.diklaim ? "success" : "neutral"}
                    />
                  </td>
                  <td>
                    {k.diklaim ? (
                      <span className="text-[10.5px] text-crumb">terkunci di laporan</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`${tautan({ edit: k.id_kegiatan })}#form`}
                          className="rounded-md bg-primary-soft p-2 text-primary hover:bg-[#dde9fb]"
                          title="Ubah kegiatan"
                        >
                          <IconPencil size={13} />
                        </Link>
                        <form action={hapusKegiatanDosen}>
                          <input type="hidden" name="kembali" value={kembali} />
                          <input type="hidden" name="id_kegiatan" value={k.id_kegiatan} />
                          <SubmitButton
                            variant="danger"
                            className="!px-2 !py-2"
                            icon={<IconTrash size={13} />}
                            labelProses=""
                            konfirmasi={`Hapus kegiatan "${k.judul}" milik ${k.lkd.pengguna.nama}? Bukti dokumen yang menempel pada kegiatan ini ikut terhapus.`}
                          >
                            {""}
                          </SubmitButton>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </DataTable>
      </div>

      {daftar.length === 100 && (
        <p className="mt-2 text-[10.5px] text-crumb">Menampilkan 100 kegiatan terbaru.</p>
      )}
    </AppShell>
  );
}
