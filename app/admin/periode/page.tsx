import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { faseAktif, FASE_LABEL } from "../../../lib/fase";
import AppShell from "../../../components/AppShell";
import DataTable from "../../../components/DataTable";
import StatusChip from "../../../components/StatusChip";
import { createPeriode, aktifkanPeriode, nonaktifkanPeriode, setFaseOverride } from "./actions";

const fmt = (d: Date | null) =>
  d ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(d) : "-";

const dInput = "mt-1 w-full rounded-md border border-line px-2.5 py-2 text-[11px] outline-none focus:border-primary";

/** UI-ADM-04 / FR-05 + R3: Manajemen Periode + fase. */
export default async function PeriodePage() {
  const session = await getServerSession(authOptions);
  const periode = await prisma.periode_bkd.findMany({ orderBy: { created_at: "desc" } });

  return (
    <AppShell
      peran="admin"
      nama={session?.user.name ?? "-"}
      deskripsi="Admin, Sistem"
      breadcrumb={["Beranda", "Administrasi", "Periode BKD"]}
      title="Manajemen Periode BKD"
      subtitle="Kelola periode semester dan fase (pengisian, penilaian, perbaikan)"
    >
      {/* Form tambah periode + fase */}
      <form action={createPeriode} className="rounded-[10px] border border-line p-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div>
            <label className="text-[11px] font-medium text-cell">Tahun Ajaran</label>
            <input name="tahun_ajaran" required placeholder="2026/2027" className={dInput} />
          </div>
          <div>
            <label className="text-[11px] font-medium text-cell">Semester</label>
            <select name="semester" className={`${dInput} bg-white`}>
              <option>Ganjil</option>
              <option>Genap</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-cell">Mulai Periode</label>
            <input type="date" name="tanggal_mulai" className={dInput} />
          </div>
          <div>
            <label className="text-[11px] font-medium text-cell">Selesai Periode</label>
            <input type="date" name="tanggal_selesai" className={dInput} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-6">
          {[
            ["pengisian_mulai", "Pengisian Mulai"],
            ["pengisian_selesai", "Pengisian Selesai"],
            ["penilaian_mulai", "Penilaian Mulai"],
            ["penilaian_selesai", "Penilaian Selesai"],
            ["perbaikan_mulai", "Perbaikan Mulai"],
            ["perbaikan_selesai", "Perbaikan Selesai"],
          ].map(([name, label]) => (
            <div key={name}>
              <label className="text-[10px] font-medium text-muted">{label}</label>
              <input type="date" name={name} className={dInput} />
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-end">
          <button className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white">
            + Tambah Periode
          </button>
        </div>
      </form>

      <div className="mt-4">
        <DataTable
          columns={[
            { label: "Nama Periode", width: "170px" },
            { label: "Fase Aktif", width: "230px" },
            { label: "Rentang Penilaian", width: "200px" },
            { label: "Status", width: "100px" },
            { label: "Aksi", width: "260px" },
          ]}
        >
          {periode.map((p: any) => {
            const fase = faseAktif(p);
            return (
              <tr key={p.id_periode}>
                <td>{p.nama_periode}</td>
                <td>
                  <StatusChip label={FASE_LABEL[fase]} variant="primary" />
                  {p.fase_override && (
                    <span className="ml-1 text-[9px] text-warning">(override)</span>
                  )}
                </td>
                <td className="!text-[10px]">
                  {fmt(p.penilaian_mulai)} — {fmt(p.penilaian_selesai)}
                </td>
                <td>
                  <StatusChip
                    label={p.status === "aktif" ? "Aktif" : "Nonaktif"}
                    variant={p.status === "aktif" ? "success" : "neutral"}
                  />
                </td>
                <td>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {p.status === "aktif" ? (
                      <form action={nonaktifkanPeriode}>
                        <input type="hidden" name="id" value={p.id_periode} />
                        <button className="rounded-md bg-danger-soft px-2.5 py-1.5 text-[10px] font-medium text-danger">
                          Nonaktifkan
                        </button>
                      </form>
                    ) : (
                      <form action={aktifkanPeriode}>
                        <input type="hidden" name="id" value={p.id_periode} />
                        <button className="rounded-md bg-[#e6f4ec] px-2.5 py-1.5 text-[10px] font-medium text-success-tx">
                          Aktifkan
                        </button>
                      </form>
                    )}
                    <form action={setFaseOverride} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={p.id_periode} />
                      <select
                        name="fase"
                        defaultValue={p.fase_override ?? ""}
                        className="rounded border border-line bg-white px-1.5 py-1 text-[10px]"
                      >
                        <option value="">(auto tanggal)</option>
                        <option value="pengisian">Pengisian</option>
                        <option value="penilaian">Penilaian</option>
                        <option value="perbaikan">Perbaikan</option>
                        <option value="selesai">Selesai</option>
                      </select>
                      <button className="rounded bg-primary-soft px-2 py-1 text-[10px] font-medium text-primary">
                        Set
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>
    </AppShell>
  );
}
