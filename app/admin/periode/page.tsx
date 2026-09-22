import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import {
  faseAktif,
  rentangFase,
  FASE_LABEL,
  FIELD_TANGGAL,
  type KunciTanggal,
} from "../../../lib/fase";
import AppShell from "../../../components/AppShell";
import TabelData from "../../../components/TabelData";
import BarisPeriode from "../../../components/BarisPeriode";
import { createPeriode } from "./actions";

const fmt = (d: Date | null) =>
  d ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(d) : "-";

/** Nilai untuk input type=date: tanggal disimpan sebagai date murni (UTC). */
const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

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
      subtitle="Kelola periode semester dan fase (pengisian, pemeriksaan, penilaian)"
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
            ["pemeriksaan_mulai", "Pemeriksaan Mulai"],
            ["pemeriksaan_selesai", "Pemeriksaan Selesai"],
            ["penilaian_mulai", "Penilaian Mulai"],
            ["penilaian_selesai", "Penilaian Selesai"],
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
        <TabelData
          kosong="Belum ada periode BKD."
          kolom={[
            { label: "Nama Periode", width: "170px", urut: true },
            { label: "Fase Aktif", width: "230px", filter: true },
            { label: "Rentang Fase", width: "200px" },
            { label: "Status", width: "100px", filter: true },
            { label: "Aksi", width: "220px" },
          ]}
          baris={periode.map((p: any) => {
            const fase = faseAktif(p);
            const { mulai, selesai } = rentangFase(p, fase);
            const status = p.status === "aktif" ? "Aktif" : "Nonaktif";
            const tanggal = Object.fromEntries(
              FIELD_TANGGAL.map(([k]) => [k, iso(p[k])]),
            ) as Record<KunciTanggal, string>;
            return {
              id: p.id_periode,
              nilai: [p.nama_periode, FASE_LABEL[fase], null, status, null],
              elemen: (
                <BarisPeriode
                  p={{
                    id: p.id_periode,
                    nama: p.nama_periode,
                    tahun_ajaran: p.tahun_ajaran ?? "",
                    semester: p.semester ?? "Ganjil",
                    status: p.status,
                    fase_override: p.fase_override ?? "",
                    fase_label: FASE_LABEL[fase],
                    rentang: mulai || selesai ? `${fmt(mulai)} s/d ${fmt(selesai)}` : "-",
                    tanggal,
                  }}
                />
              ),
            };
          })}
        />
      </div>
    </AppShell>
  );
}
