import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import AppShell from "../../../components/AppShell";
import TabelData from "../../../components/TabelData";
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
      <TabelData
        placeholderCari="Cari kode atau nama kegiatan…"
        kosong="Referensi kegiatan belum diisi."
        kolom={[
          { label: "Kode", width: "80px", urut: true },
          { label: "Kategori", width: "220px", filter: true, urut: true },
          { label: "Nama Kegiatan", urut: true },
          { label: "Fungsi Smart Contract", width: "250px" },
          { label: "Parameter", width: "200px" },
          { label: "Perhitungan", width: "120px", filter: true },
        ]}
        baris={referensi.map((r: any) => {
          const parameter =
            (r.skema_parameter as any)?.fields?.map((f: any) => f.name).join(", ") ?? "-";
          const perhitungan = r.fungsi_contract ? "Otomatis" : "Manual Asesor";
          return {
            id: r.id_referensi,
            nilai: [
              r.kode_rule,
              r.kategori,
              r.nama_kegiatan,
              r.fungsi_contract,
              parameter,
              perhitungan,
            ],
            sel: [
              r.kode_rule,
              r.kategori,
              r.nama_kegiatan,
              <span className="font-mono text-[10px] text-primary">
                {r.fungsi_contract ? `${r.fungsi_contract}()` : "-"}
              </span>,
              <span className="text-[10px] text-muted">{parameter}</span>,
              <StatusChip
                label={perhitungan}
                variant={r.fungsi_contract ? "success" : "warning"}
              />,
            ],
          };
        })}
      />
    </AppShell>
  );
}
