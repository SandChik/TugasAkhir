import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import AppShell from "../../../components/AppShell";
import DataTable from "../../../components/DataTable";
import StatusChip from "../../../components/StatusChip";
import StatTile from "../../../components/StatTile";
import InfoBox from "../../../components/InfoBox";
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
  searchParams: { f?: string; q?: string };
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
  const q = (searchParams.q ?? "").trim();
  const cari = q.toLowerCase();

  const tampil = daftar.filter((l: any) => {
    if (f === "belum" && jumlahTerisi(l) === 2) return false;
    if (f === "lengkap" && jumlahTerisi(l) !== 2) return false;
    if (f === "dinilai" && !sedangDinilai(l)) return false;
    if (!cari) return true;
    return [l.pengguna.nama, l.pengguna.nidn, l.pengguna.kode_dosen]
      .filter(Boolean)
      .some((v: string) => String(v).toLowerCase().includes(cari));
  });

  const url = (ubah: Record<string, string>) => {
    const p = new URLSearchParams();
    if (f !== "semua") p.set("f", f);
    if (q) p.set("q", q);
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
        <InfoBox>
          Belum ada periode aktif. Aktifkan satu periode di <b>Periode BKD</b> sebelum menetapkan
          asesor.
        </InfoBox>
      ) : asesor.length < 2 ? (
        <InfoBox>
          Butuh minimal dua akun <b>asesor</b> yang aktif. Saat ini baru ada {asesor.length}
          {" — "}tambahkan di <b>Manajemen Pengguna</b>.
        </InfoBox>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile
              label="LKD periode ini"
              nilai={total}
              catatan="dokumen laporan dosen"
              href={url({ f: "" })}
              aktif={f === "semua"}
            />
            <StatTile
              label="Belum lengkap"
              nilai={belum}
              catatan="asesor kurang dari dua"
              nada="masalah"
              href={url({ f: "belum" })}
              aktif={f === "belum"}
            />
            <StatTile
              label="Sudah lengkap"
              nilai={lengkap}
              catatan="dua asesor ditetapkan"
              nada="siap"
              href={url({ f: "lengkap" })}
              aktif={f === "lengkap"}
            />
            <StatTile
              label="Penilaian berjalan"
              nilai={dinilai}
              catatan="tidak dapat diganti lagi"
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
              <p className="mt-0.5 text-[10.5px] text-muted">
                Hanya mengisi slot kosong — penugasan yang sudah ada tidak akan tertimpa.
              </p>
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

          {/* Pencarian */}
          <form className="mt-3 flex flex-wrap items-end gap-2">
            {f !== "semua" && <input type="hidden" name="f" value={f} />}
            <div className="flex flex-1 flex-col">
              <label className="text-[10px] font-medium text-muted">
                Cari dosen (nama, NIDN, kode dosen)
              </label>
              <input
                name="q"
                defaultValue={q}
                placeholder="mis. Transmissia / KO019N"
                className="mt-1 rounded-md border border-line px-2.5 py-1.5 text-[11px] outline-none focus:border-primary"
              />
            </div>
            <button className="rounded-md bg-primary px-4 py-2 text-[11px] font-medium text-white">
              Cari
            </button>
            {(q || f !== "semua") && (
              <a
                href={DASAR}
                className="rounded-md bg-head-bg px-3 py-2 text-[11px] font-medium text-muted"
              >
                Reset
              </a>
            )}
          </form>

          <p className="mt-3 text-[11px] text-muted">
            Menampilkan <b>{tampil.length}</b> dari {total} LKD
          </p>

          <div className="mt-2">
            <DataTable
              columns={[
                { label: "No", width: "45px" },
                { label: "Dosen" },
                { label: "Status LKD", width: "140px" },
                { label: "Asesor ke-1 & ke-2", width: "430px" },
                { label: "Aksi", width: "110px" },
              ]}
            >
              {tampil.length === 0 ? (
                <tr>
                  <td colSpan={5} className="!text-center !text-crumb">
                    {total === 0
                      ? "Belum ada LKD pada periode ini."
                      : "Tidak ada LKD yang cocok dengan filter."}
                  </td>
                </tr>
              ) : (
                tampil.map((l: any, i: number) => {
                  const s1 = slot(l, 1);
                  const s2 = slot(l, 2);
                  const dikunci = s1.terkunci || s2.terkunci;

                  const sel = (urutan: number, s: ReturnType<typeof slot>) => (
                    <div className="min-w-0 flex-1">
                      <label className="text-[9.5px] font-medium text-muted">
                        Asesor ke-{urutan}
                      </label>
                      {s.terkunci ? (
                        <>
                          <p className="truncate text-[11px] font-medium text-navy">
                            {s.p.asesor.nama}
                          </p>
                          <p className="flex items-center gap-1 text-[9.5px] text-muted">
                            <IconLock size={9} />
                            {s.p.disahkan ? "sudah disahkan" : "sedang menilai"}
                          </p>
                          <input type="hidden" name={`asesor_${urutan}`} value={s.idAsesor} />
                        </>
                      ) : (
                        <select
                          name={`asesor_${urutan}`}
                          defaultValue={s.idAsesor}
                          className={`mt-0.5 ${selectCls}`}
                        >
                          <option value="">— belum ditetapkan —</option>
                          {asesor.map((a: any) => (
                            <option key={a.id_pengguna} value={a.id_pengguna}>
                              {a.nama}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  );

                  return (
                    <tr key={l.id_lkd}>
                      <td>{i + 1}</td>
                      <td>
                        {l.pengguna.nama}
                        <span className="block text-[10px] text-crumb">
                          {l.pengguna.nidn ?? "tanpa NIDN"}
                          {l.pengguna.kode_dosen ? ` · ${l.pengguna.kode_dosen}` : ""}
                        </span>
                      </td>
                      <td>
                        {l.simpan_permanen ? (
                          <StatusChip label="Siap dinilai" variant="success" />
                        ) : (
                          <StatusChip label="Belum dikunci dosen" variant="dangerSoft" />
                        )}
                      </td>
                      <td>
                        {/* Kedua <select> + tombolnya satu form agar status
                            "sedang menyimpan" ikut terbaca tombolnya. */}
                        <form action={simpanPenugasan} className="flex items-end gap-2">
                          <input type="hidden" name="id_lkd" value={l.id_lkd} />
                          <input type="hidden" name="kembali" value={kembali} />
                          {sel(1, s1)}
                          {sel(2, s2)}
                          <SubmitButton
                            variant="soft"
                            className="!px-2.5 !py-1.5 !text-[10.5px]"
                            icon={<IconSave size={11} />}
                            labelProses="Menyimpan…"
                          >
                            Simpan
                          </SubmitButton>
                        </form>
                      </td>
                      <td>
                        {!dikunci && l.penugasan_asesor.length > 0 && (
                          <form action={hapusPenugasan}>
                            <input type="hidden" name="id_lkd" value={l.id_lkd} />
                            <input type="hidden" name="kembali" value={kembali} />
                            <SubmitButton
                              variant="danger"
                              className="!px-2.5 !py-1.5 !text-[10.5px]"
                              icon={<IconTrash size={11} />}
                              labelProses="Melepas…"
                              judulKonfirmasi="Lepas penugasan?"
                              konfirmasi={`Kedua asesor ${l.pengguna.nama} akan dilepas dari LKD ini.`}
                              tombolKonfirmasi="Ya, lepas"
                            >
                              Lepas
                            </SubmitButton>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </DataTable>
          </div>
        </>
      )}
    </AppShell>
  );
}
