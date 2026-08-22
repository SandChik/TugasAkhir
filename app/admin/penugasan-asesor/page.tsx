import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import AppShell from "../../../components/AppShell";
import TabelData from "../../../components/TabelData";
import StatusChip from "../../../components/StatusChip";
import StatTile from "../../../components/StatTile";
import SubmitButton from "../../../components/SubmitButton";
import { IconSave, IconTrash, IconLock } from "../../../components/Icons";
import { simpanPenugasan, tugaskanMassal, hapusPenugasan } from "./actions";

const DASAR = "/admin/penugasan-asesor";
const selectCls =
  "w-full rounded-md border border-line bg-white px-2 py-1.5 text-[11px] outline-none focus:border-primary";

type Saring = "semua" | "belum" | "lengkap" | "dinilai";

/** FR-13: penetapan dua asesor per LKD dosen pada periode aktif. */
export default async function PenugasanAsesorPage({
  searchParams,
}: {
  searchParams: { f?: string };
}) {
  const session = await getServerSession(authOptions);

  const periode = await prisma.periode_bkd.findFirst({ where: { status: "aktif" } });

  const [daftar, asesor] = await Promise.all([
    periode
      ? prisma.lkd.findMany({
          where: { id_periode: periode.id_periode, jenis: "laporan" },
          include: {
            pengguna: { select: { nama: true, nidn: true, kode_dosen: true } },
            penugasan_asesor: {
              include: {
                asesor: { select: { nama: true } },
                _count: { select: { hasil_penilaian: true } },
              },
              orderBy: { urutan: "asc" },
            },
          },
          orderBy: { pengguna: { nama: "asc" } },
        })
      : Promise.resolve([] as any[]),
    prisma.pengguna.findMany({
      where: { peran: "asesor", aktif: true },
      orderBy: { nama: "asc" },
      select: { id_pengguna: true, nama: true },
    }),
  ]);

  /** Slot ke-`urutan` sebuah LKD beserta status kuncinya. */
  const slot = (lkd: any, urutan: number) => {
    const p = lkd.penugasan_asesor.find((x: any) => x.urutan === urutan) ?? null;
    return {
      p,
      idAsesor: p?.id_asesor ?? "",
      // Sudah menilai / mengesahkan -> tidak boleh diganti, hasilnya akan yatim
      terkunci: Boolean(p && (p.disahkan || p._count.hasil_penilaian > 0)),
    };
  };
  const jumlahTerisi = (lkd: any) => lkd.penugasan_asesor.length;
  const sedangDinilai = (lkd: any) =>
    lkd.penugasan_asesor.some((p: any) => p.disahkan || p._count.hasil_penilaian > 0);

  const total = daftar.length;
  const lengkap = daftar.filter((l: any) => jumlahTerisi(l) === 2).length;
  const belum = total - lengkap;
  const dinilai = daftar.filter(sedangDinilai).length;

  // --- penyaringan (form GET, tanpa JavaScript) ---
  const f: Saring = (["belum", "lengkap", "dinilai"] as const).includes(searchParams.f as any)
    ? (searchParams.f as Saring)
    : "semua";

  const tampil = daftar.filter((l: any) => {
    if (f === "belum" && jumlahTerisi(l) === 2) return false;
    if (f === "lengkap" && jumlahTerisi(l) !== 2) return false;
    if (f === "dinilai" && !sedangDinilai(l)) return false;
    return true;
  });

  const url = (ubah: Record<string, string>) => {
    const p = new URLSearchParams();
    if (f !== "semua") p.set("f", f);
    for (const [k, v] of Object.entries(ubah)) v ? p.set(k, v) : p.delete(k);
    const s = p.toString();
    return s ? `${DASAR}?${s}` : DASAR;
  };
  const kembali = url({});

  return (
    <AppShell
      peran="admin"
      nama={session?.user.name ?? "-"}
      deskripsi="Admin, Sistem"
      breadcrumb={["Beranda", "Administrasi", "Penugasan Asesor"]}
      title="Penugasan Asesor"
      subtitle={
        periode
          ? `Tetapkan dua asesor untuk tiap LKD dosen — periode ${periode.nama_periode}`
          : "Tetapkan dua asesor untuk tiap LKD dosen"
      }
    >
      {!periode ? (
        <div className="rounded-[10px] border border-line bg-head-bg px-4 py-3 text-[11.5px] text-muted">
          Belum ada periode aktif.
        </div>
      ) : asesor.length < 2 ? (
        <div className="rounded-[10px] border border-line bg-head-bg px-4 py-3 text-[11.5px] text-muted">
          Asesor aktif: {asesor.length}. Minimal dua.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile
              label="LKD periode ini"
              nilai={total}
              href={url({ f: "" })}
              aktif={f === "semua"}
            />
            <StatTile
              label="Belum lengkap"
              nilai={belum}
              nada="masalah"
              href={url({ f: "belum" })}
              aktif={f === "belum"}
            />
            <StatTile
              label="Sudah lengkap"
              nilai={lengkap}
              nada="siap"
              href={url({ f: "lengkap" })}
              aktif={f === "lengkap"}
            />
            <StatTile
              label="Penilaian berjalan"
              nilai={dinilai}
              nada="koreksi"
              href={url({ f: "dinilai" })}
              aktif={f === "dinilai"}
            />
          </div>

          {/* Isi massal — 40 LKD terlalu banyak untuk dipilih satu per satu */}
          <form
            action={tugaskanMassal}
            className="mt-4 grid grid-cols-1 items-end gap-3 rounded-[10px] border border-line bg-head-bg/50 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
          >
            <input type="hidden" name="kembali" value={kembali} />
            <div className="md:col-span-3">
              <h2 className="text-[12px] font-semibold text-navy">Isi slot yang masih kosong</h2>
            </div>
            <div>
              <label className="text-[11px] font-medium text-cell">Asesor ke-1</label>
              <select name="asesor_1" required className={`mt-1 ${selectCls}`}>
                {asesor.map((a: any) => (
                  <option key={a.id_pengguna} value={a.id_pengguna}>
                    {a.nama}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-cell">Asesor ke-2</label>
              <select
                name="asesor_2"
                required
                defaultValue={asesor[1]?.id_pengguna}
                className={`mt-1 ${selectCls}`}
              >
                {asesor.map((a: any) => (
                  <option key={a.id_pengguna} value={a.id_pengguna}>
                    {a.nama}
                  </option>
                ))}
              </select>
            </div>
            <SubmitButton
              className="!px-4 !py-2 !text-[11px]"
              labelProses="Menugaskan…"
              judulKonfirmasi={`Isi ${belum} LKD yang belum lengkap?`}
              konfirmasi="Slot asesor yang masih kosong akan diisi pasangan asesor ini. Penugasan yang sudah ada dibiarkan apa adanya."
              tombolKonfirmasi="Ya, tugaskan"
            >
              Tugaskan
            </SubmitButton>
          </form>

          <div className="mt-4">
            <TabelData
              placeholderCari="Cari nama dosen, NIDN, kode dosen…"
              kosong="Belum ada LKD pada periode ini."
              kolom={[
                { label: "No", width: "45px" },
                { label: "Dosen", urut: true },
                { label: "Status LKD", width: "140px", filter: true },
                { label: "Asesor ke-1 & ke-2", width: "430px" },
                { label: "Aksi", width: "70px" },
              ]}
              baris={tampil.map((l: any, i: number) => {
                  const s1 = slot(l, 1);
                  const s2 = slot(l, 2);
                  const dikunci = s1.terkunci || s2.terkunci;

                  /* Slot terkunci dan slot yang masih bisa diganti dibuat
                     setinggi select supaya kedua kolom sejajar. */
                  const kendali = (urutan: number, s: ReturnType<typeof slot>) =>
                    s.terkunci ? (
                      <div className="flex min-w-0 items-center gap-1.5 rounded-md border border-line bg-head-bg px-2 py-1.5">
                        <IconLock size={10} className="shrink-0 text-muted" />
                        <span className="truncate text-[11px] font-medium text-navy">
                          {s.p.asesor.nama}
                        </span>
                        <input type="hidden" name={`asesor_${urutan}`} value={s.idAsesor} />
                      </div>
                    ) : (
                      <select
                        name={`asesor_${urutan}`}
                        defaultValue={s.idAsesor}
                        className={selectCls}
                      >
                        <option value="">— belum ditetapkan —</option>
                        {asesor.map((a: any) => (
                          <option key={a.id_pengguna} value={a.id_pengguna}>
                            {a.nama}
                          </option>
                        ))}
                      </select>
                    );

                  const catatan = (s: ReturnType<typeof slot>) =>
                    s.terkunci ? (
                      <span className="truncate text-[9.5px] text-muted">
                        {s.p.disahkan ? "sudah disahkan" : "sedang menilai"}
                      </span>
                    ) : (
                      <span />
                    );

                  return {
                    id: l.id_lkd,
                    cari: `${l.pengguna.nidn ?? ""} ${l.pengguna.kode_dosen ?? ""} ${
                      s1.p?.asesor.nama ?? ""
                    } ${s2.p?.asesor.nama ?? ""}`,
                    nilai: [
                      i + 1,
                      l.pengguna.nama,
                      l.simpan_permanen ? "Siap dinilai" : "Belum dikunci dosen",
                      null,
                      null,
                    ],
                    sel: [
                      i + 1,
                      <>
                        {l.pengguna.nama}
                        <span className="block text-[10px] text-crumb">
                          {l.pengguna.nidn ?? "tanpa NIDN"}
                          {l.pengguna.kode_dosen ? ` · ${l.pengguna.kode_dosen}` : ""}
                        </span>
                      </>,
                      l.simpan_permanen ? (
                        <StatusChip label="Siap dinilai" variant="success" />
                      ) : (
                        <StatusChip label="Belum dikunci dosen" variant="dangerSoft" />
                      ),
                      /* Kedua select + tombolnya satu form agar status
                         "sedang menyimpan" ikut terbaca tombolnya. */
                      <form
                        action={simpanPenugasan}
                        className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-0.5"
                      >
                        <input type="hidden" name="id_lkd" value={l.id_lkd} />
                        <input type="hidden" name="kembali" value={kembali} />
                        <span className="text-[9.5px] font-medium text-muted">Asesor ke-1</span>
                        <span className="text-[9.5px] font-medium text-muted">Asesor ke-2</span>
                        <span />
                        {kendali(1, s1)}
                        {kendali(2, s2)}
                        <SubmitButton
                          variant="soft"
                          className="!p-2"
                          title="Simpan penugasan"
                          icon={<IconSave size={13} />}
                          labelProses=""
                        >
                          {""}
                        </SubmitButton>
                        {catatan(s1)}
                        {catatan(s2)}
                        <span />
                      </form>,
                      !dikunci && l.penugasan_asesor.length > 0 ? (
                        <form action={hapusPenugasan}>
                          <input type="hidden" name="id_lkd" value={l.id_lkd} />
                          <input type="hidden" name="kembali" value={kembali} />
                          <SubmitButton
                            variant="danger"
                            className="!p-2"
                            title="Lepas penugasan"
                            icon={<IconTrash size={13} />}
                            labelProses=""
                            judulKonfirmasi="Lepas penugasan?"
                            konfirmasi={`Kedua asesor ${l.pengguna.nama} akan dilepas dari LKD ini.`}
                            tombolKonfirmasi="Ya, lepas"
                          >
                            {""}
                          </SubmitButton>
                        </form>
                      ) : null,
                    ],
                  };
                })}
            />
          </div>
        </>
      )}
    </AppShell>
  );
}
