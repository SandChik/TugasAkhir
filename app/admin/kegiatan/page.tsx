import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import AppShell from "../../../components/AppShell";
import TabelData from "../../../components/TabelData";
import StatTile from "../../../components/StatTile";
import StatusChip from "../../../components/StatusChip";
import SubmitButton from "../../../components/SubmitButton";
import PenyediaKegiatanAdmin, {
  TombolTambahKegiatan,
  TombolUbahKegiatan,
  type KegiatanAwal,
} from "../../../components/ModalKegiatanAdmin";
import { KATEGORI_INPUT_ADMIN } from "../../../lib/kategoriDosen";
import { faseAktif, FASE_LABEL } from "../../../lib/fase";
import { IconTrash } from "../../../components/Icons";
import { hapusKegiatanDosen } from "./actions";

const KODE_ADMIN = Object.keys(KATEGORI_INPUT_ADMIN);

/**
 * FR-07 (jalur admin): input kegiatan berbasis penugasan atas nama dosen.
 * Melengkapi menu "Unggah SK & ST", dipakai untuk penugasan yang tidak
 * terangkum di surat (mis. susulan, ralat) atau ketika dokumennya belum terbit.
 *
 * Tambah dan ubah kegiatan dijalankan lewat modal; halaman ini hanya memuat
 * ringkasan angka dan tabel kegiatan.
 */
export default async function InputKegiatanPage({
  searchParams,
}: {
  searchParams: { klaim?: string; ok?: string; err?: string };
}) {
  const session = await getServerSession(authOptions);

  const filterKlaim = ["belum", "sudah"].includes(searchParams.klaim ?? "")
    ? searchParams.klaim!
    : "";
  const kembali = filterKlaim ? `/admin/kegiatan?klaim=${filterKlaim}` : "/admin/kegiatan";
  const tautan = (klaim: string) => (klaim ? `/admin/kegiatan?klaim=${klaim}` : "/admin/kegiatan");

  const [periode, dosenAktif, referensi] = await Promise.all([
    prisma.periode_bkd.findFirst({ where: { status: "aktif" } }),
    prisma.pengguna.findMany({
      where: { peran: { in: ["dosen", "asesor"] }, aktif: true },
      select: { id_pengguna: true, nama: true, program_studi: true },
      orderBy: { nama: "asc" },
    }),
    prisma.referensi_kegiatan.findMany({
      where: { kode_rule: { in: KODE_ADMIN } },
      orderBy: { kode_rule: "asc" },
    }),
  ]);

  const fase = periode ? faseAktif(periode) : null;
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

  const where: any = dasar
    ? { ...dasar, ...(filterKlaim ? { diklaim: filterKlaim === "sudah" } : {}) }
    : null;

  const [daftar, total, belum] = await Promise.all([
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
  ]);

  /** Nilai awal formulir modal ubah untuk satu baris. */
  const awalDari = (k: any): KegiatanAwal => ({
    id: k.id_kegiatan,
    id_pengguna: k.lkd.id_pengguna,
    kode_rule: k.referensi_kegiatan.kode_rule,
    judul: k.judul,
    detail: (k.detail_kegiatan as any) ?? {},
    parameter: (k.parameter as any) ?? {},
  });

  return (
    <AppShell
      peran="admin"
      nama={session?.user.name ?? "-"}
      deskripsi="Admin, Sistem"
      breadcrumb={["Beranda", "Administrasi", "Input Kegiatan Dosen"]}
      title="Input Kegiatan Dosen"
      subtitle="Kegiatan berbasis penugasan: perkuliahan, bimbingan, pengujian, dan pembinaan mahasiswa"
      actions={
        <span className="rounded-lg border border-line px-3 py-2 text-xs text-navy">
          {periode && fase ? `${periode.nama_periode} · ${FASE_LABEL[fase]}` : "Belum ada periode aktif"}
        </span>
      }
    >
      <PenyediaKegiatanAdmin
        kembali={kembali}
        periodeNama={periode?.nama_periode ?? null}
        penanda={searchParams.ok ?? searchParams.err ?? ""}
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
      >
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <StatTile
            label="Semua kegiatan"
            nilai={total}
            href={tautan("")}
            aktif={!filterKlaim}
          />
          <StatTile
            label="Belum diklaim"
            nilai={belum}
            nada="koreksi"
            href={tautan("belum")}
            aktif={filterKlaim === "belum"}
          />
          <StatTile
            label="Sudah diklaim"
            nilai={total - belum}
            nada="siap"
            href={tautan("sudah")}
            aktif={filterKlaim === "sudah"}
          />
        </div>

        <div className="mt-3">
          <TabelData
            pencarian
            placeholderCari="Cari dosen, judul, atau nomor SK…"
            aksi={<TombolTambahKegiatan />}
            kosong={
              periode
                ? "Belum ada kegiatan yang dicatat admin pada periode ini."
                : "Belum ada periode aktif."
            }
            kolom={[
              { label: "No", width: "50px" },
              { label: "Dosen", width: "180px", urut: true, filter: true },
              { label: "Kegiatan", urut: true },
              { label: "Jenis", width: "210px", urut: true, filter: true },
              { label: "SKS", width: "80px", urut: true, rata: "kanan" },
              { label: "Status klaim", width: "130px" },
              { label: "Aksi", width: "100px" },
            ]}
            baris={daftar.map((k: any, i: number) => {
              const d: any = k.detail_kegiatan ?? {};
              return {
                id: k.id_kegiatan,
                cari: `${k.referensi_kegiatan.kode_rule} ${d.no_sk ?? ""} ${d.tgl_sk ?? ""}`,
                nilai: [
                  i + 1,
                  k.lkd.pengguna.nama,
                  k.judul,
                  k.referensi_kegiatan.kategori,
                  k.sks_dihitung_x100 != null ? k.sks_dihitung_x100 / 100 : null,
                  k.diklaim ? "Diklaim" : "Belum diklaim",
                  null,
                ],
                sel: [
                  i + 1,
                  k.lkd.pengguna.nama,
                  <>
                    {k.judul}
                    <span className="mt-0.5 block text-[10px] text-crumb">
                      {k.referensi_kegiatan.kode_rule} · SK {d.no_sk || "-"} · Tgl {d.tgl_sk || "-"}
                    </span>
                  </>,
                  <span className="text-[10.5px] text-muted">{k.referensi_kegiatan.kategori}</span>,
                  k.sks_dihitung_x100 != null
                    ? (k.sks_dihitung_x100 / 100).toFixed(2)
                    : k.status_perhitungan === "gagal"
                      ? "gagal"
                      : "manual",
                  <StatusChip
                    label={k.diklaim ? "Diklaim" : "Belum diklaim"}
                    variant={k.diklaim ? "success" : "neutral"}
                  />,
                  k.diklaim ? (
                    <span className="text-[10.5px] text-crumb">terkunci di laporan</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <TombolUbahKegiatan awal={awalDari(k)} />
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
                  ),
                ],
              };
            })}
          />
        </div>
      </PenyediaKegiatanAdmin>

      {daftar.length === 100 && (
        <p className="mt-2 text-[10.5px] text-crumb">Menampilkan 100 kegiatan terbaru.</p>
      )}
    </AppShell>
  );
}
