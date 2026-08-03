import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import AppShell from "../../../components/AppShell";
import DataTable from "../../../components/DataTable";
import StatusChip from "../../../components/StatusChip";

/** Referensi kegiatan A-N: pemetaan rubrik PO BKD 2021 -> fungsi smart contract. */
export default async function ReferensiPage() {
  const session = await getServerSession(authOptions);
  const referensi = await prisma.referensi_kegiatan.findMany({ orderBy: { kode_rule: "asc" } });

  return (
    <AppShell
      peran="admin"
      nama={session?.user.name ?? "-"}
      deskripsi="Admin, Sistem"
      breadcrumb={["Beranda", "Administrasi", "Referensi Kegiatan"]}
      title="Referensi Kegiatan BKD"
      subtitle="Rubrik kegiatan pendidikan PO BKD 2021 dan pemetaan fungsi smart contract"
    >
      <DataTable
        columns={[
          { label: "Kode", width: "80px" },
          { label: "Kategori", width: "220px" },
          { label: "Nama Kegiatan" },
          { label: "Fungsi Smart Contract", width: "250px" },
          { label: "Parameter", width: "200px" },
          { label: "Perhitungan", width: "120px" },
        ]}
      >
        {referensi.map((r: any) => (
          <tr key={r.id_referensi}>
            <td>{r.kode_rule}</td>
            <td>{r.kategori}</td>
            <td>{r.nama_kegiatan}</td>
            <td className="!font-mono !text-[10px] !text-primary">
              {r.fungsi_contract ? `${r.fungsi_contract}()` : "-"}
            </td>
            <td className="!text-[10px] !text-muted">
              {(r.skema_parameter as any)?.fields?.map((f: any) => f.name).join(", ") ?? "-"}
            </td>
            <td>
              <StatusChip
                label={r.fungsi_contract ? "Otomatis" : "Manual Asesor"}
                variant={r.fungsi_contract ? "success" : "warning"}
              />
            </td>
          </tr>
        ))}
      </DataTable>
      <p className="mt-3 text-[11px] text-crumb">
        Kegiatan bertanda &quot;Manual Asesor&quot; memiliki nilai SKS maksimum pada rubrik dan
        dinilai langsung oleh asesor (tidak diotomatisasi oleh smart contract).
      </p>
    </AppShell>
  );
}
