import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import AppShell from "../../../components/AppShell";
import DataTable from "../../../components/DataTable";
import StatusChip from "../../../components/StatusChip";

/** UI-ADM-06 / FR-19, FR-20: rekapitulasi kredit SKS seluruh dosen pada periode aktif. */
export default async function RekapitulasiPage() {
  const session = await getServerSession(authOptions);

  const periodeAktif = await prisma.periode_bkd.findFirst({ where: { status: "aktif" } });

  const dosen = periodeAktif
    ? await prisma.pengguna.findMany({
        where: { peran: { in: ["dosen", "asesor"] } },
        orderBy: { nama: "asc" },
        include: {
          lkd: {
            where: { id_periode: periodeAktif.id_periode },
            include: {
              kegiatan: { include: { hasil_penilaian: true } },
              simpulan: true,
            },
          },
        },
      })
    : [];

  const rows = dosen.map((d: any) => {
    const kegiatan = d.lkd.flatMap((l: any) => l.kegiatan);
    const sksDiajukan = kegiatan.reduce((a: number, k: any) => a + (k.sks_dihitung_x100 ?? 0), 0);
    const sksDisahkan = kegiatan.reduce((a: number, k: any) => {
      const disetujui = k.hasil_penilaian.filter((h: any) => h.status === "disetujui");
      if (disetujui.length === 0) return a;
      // Nilai final = rata-rata sks yang disetujui kedua asesor
      const avg =
        disetujui.reduce((s: number, h: any) => s + (h.sks_disetujui_x100 ?? 0), 0) /
        disetujui.length;
      return a + avg;
    }, 0);
    const simpulanFinal = d.lkd.find((l: any) => l.simpulan?.status_final)?.simpulan?.status_final;
    return {
      id: d.id_pengguna,
      nama: d.nama,
      nidn: d.nidn,
      prodi: d.program_studi,
      jumlahKegiatan: kegiatan.length,
      sksDiajukan,
      sksDisahkan,
      simpulanFinal,
    };
  });

  const stat = {
    totalDosen: rows.length,
    totalKegiatan: rows.reduce((a, r) => a + r.jumlahKegiatan, 0),
    totalDiajukan: rows.reduce((a, r) => a + r.sksDiajukan, 0),
    totalDisahkan: rows.reduce((a, r) => a + r.sksDisahkan, 0),
  };

  return (
    <AppShell
      peran="admin"
      nama={session?.user.name ?? "-"}
      deskripsi="Admin, Sistem"
      breadcrumb={["Beranda", "Laporan", "Rekapitulasi"]}
      title="Rekapitulasi BKD"
      subtitle="Ringkasan kredit SKS seluruh dosen pada periode berjalan"
      actions={
        <span className="rounded-lg border border-line px-3 py-2 text-xs text-navy">
          {periodeAktif?.nama_periode ?? "Belum ada periode aktif"}
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          ["Total Dosen", String(stat.totalDosen)],
          ["Jumlah Kegiatan", String(stat.totalKegiatan)],
          ["SKS Diajukan", (stat.totalDiajukan / 100).toFixed(2)],
          ["SKS Disahkan", (stat.totalDisahkan / 100).toFixed(2)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[10px] border border-line p-4">
            <p className="text-[11px] text-muted">{label}</p>
            <p className="mt-1.5 text-[20px] font-semibold text-navy">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <DataTable
          columns={[
            { label: "No", width: "50px" },
            { label: "Nama / NIDN" },
            { label: "Program Studi", width: "170px" },
            { label: "Jumlah Kegiatan", width: "130px" },
            { label: "SKS Diajukan", width: "120px" },
            { label: "SKS Disahkan", width: "120px" },
            { label: "Simpulan Final", width: "150px" },
          ]}
        >
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="!text-center !text-crumb">
                {periodeAktif ? "Belum ada data dosen." : "Aktifkan periode terlebih dahulu."}
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={r.id}>
                <td>{i + 1}</td>
                <td>
                  {r.nama}
                  <span className="block text-[10px] text-crumb">{r.nidn ?? "-"}</span>
                </td>
                <td>{r.prodi ?? "-"}</td>
                <td>{r.jumlahKegiatan}</td>
                <td>{(r.sksDiajukan / 100).toFixed(2)}</td>
                <td>{(r.sksDisahkan / 100).toFixed(2)}</td>
                <td>
                  {r.simpulanFinal ? (
                    <StatusChip
                      label={r.simpulanFinal === "M" ? "Memenuhi" : "Tidak Memenuhi"}
                      variant={r.simpulanFinal === "M" ? "success" : "danger"}
                    />
                  ) : (
                    <StatusChip label="Belum ada simpulan" variant="neutral" />
                  )}
                </td>
              </tr>
            ))
          )}
        </DataTable>
      </div>
    </AppShell>
  );
}
