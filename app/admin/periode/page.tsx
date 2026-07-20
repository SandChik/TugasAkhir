import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import AppShell from "../../../components/AppShell";
import DataTable from "../../../components/DataTable";
import StatusChip from "../../../components/StatusChip";
import InfoBox from "../../../components/InfoBox";
import { createPeriode, aktifkanPeriode, nonaktifkanPeriode } from "./actions";

const fmt = (d: Date | null) =>
  d ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(d) : "-";

/** UI-ADM-04 / FR-05: Manajemen Periode BKD. */
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
      subtitle="Kelola periode semester penilaian BKD"
    >
      <InfoBox>
        <b>Info:</b> Hanya satu periode dapat berstatus aktif pada satu waktu. Mengaktifkan
        periode baru otomatis menonaktifkan periode sebelumnya.
      </InfoBox>

      {/* Form tambah periode */}
      <form
        action={createPeriode}
        className="mt-4 grid grid-cols-2 gap-3 rounded-[10px] border border-line p-4 md:grid-cols-5"
      >
        <div>
          <label className="text-[11px] font-medium text-cell">Tahun Ajaran</label>
          <input
            name="tahun_ajaran"
            required
            placeholder="2026/2027"
            className="mt-1 w-full rounded-md border border-line px-3 py-2 text-xs outline-none placeholder:text-crumb focus:border-primary"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-cell">Semester</label>
          <select
            name="semester"
            required
            className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-xs outline-none focus:border-primary"
          >
            <option value="Ganjil">Ganjil</option>
            <option value="Genap">Genap</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-medium text-cell">Tanggal Mulai</label>
          <input
            type="date"
            name="tanggal_mulai"
            className="mt-1 w-full rounded-md border border-line px-3 py-2 text-xs outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-cell">Tanggal Selesai</label>
          <input
            type="date"
            name="tanggal_selesai"
            className="mt-1 w-full rounded-md border border-line px-3 py-2 text-xs outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-end">
          <button className="w-full rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white">
            + Tambah Periode
          </button>
        </div>
      </form>

      <div className="mt-4">
        <DataTable
          columns={[
            { label: "No", width: "50px" },
            { label: "Nama Periode" },
            { label: "Tahun Ajaran", width: "130px" },
            { label: "Semester", width: "100px" },
            { label: "Tanggal Mulai", width: "130px" },
            { label: "Tanggal Selesai", width: "130px" },
            { label: "Status", width: "110px" },
            { label: "Aksi", width: "140px" },
          ]}
        >
          {periode.map((p: any, i: number) => (
            <tr key={p.id_periode}>
              <td>{i + 1}</td>
              <td>{p.nama_periode}</td>
              <td>{p.tahun_ajaran}</td>
              <td>{p.semester}</td>
              <td>{fmt(p.tanggal_mulai)}</td>
              <td>{fmt(p.tanggal_selesai)}</td>
              <td>
                <StatusChip
                  label={p.status === "aktif" ? "Aktif" : "Nonaktif"}
                  variant={p.status === "aktif" ? "success" : "neutral"}
                />
              </td>
              <td>
                {p.status === "aktif" ? (
                  <form action={nonaktifkanPeriode}>
                    <input type="hidden" name="id" value={p.id_periode} />
                    <button className="rounded-md bg-danger-soft px-3 py-1.5 text-[10.5px] font-medium text-danger">
                      Nonaktifkan
                    </button>
                  </form>
                ) : (
                  <form action={aktifkanPeriode}>
                    <input type="hidden" name="id" value={p.id_periode} />
                    <button className="rounded-md bg-[#e6f4ec] px-3 py-1.5 text-[10.5px] font-medium text-success-tx">
                      Aktifkan
                    </button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    </AppShell>
  );
}
