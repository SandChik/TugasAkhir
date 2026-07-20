import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import AppShell from "../../../components/AppShell";
import DataTable from "../../../components/DataTable";
import StatusChip, { STATUS_VARIAN } from "../../../components/StatusChip";
import InfoBox from "../../../components/InfoBox";
import { burnToken } from "./actions";

const fmt = (d: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);

/** UI-ADM-05 / FR-18: riwayat mint/burn + koreksi burn. */
export default async function TokenPage() {
  const session = await getServerSession(authOptions);

  const [riwayat, dosenBerwallet] = await Promise.all([
    prisma.riwayat_transaksi.findMany({
      orderBy: { created_at: "desc" },
      take: 50,
    }),
    prisma.pengguna.findMany({
      where: { peran: "dosen", alamat_wallet: { not: null } },
      orderBy: { nama: "asc" },
    }),
  ]);

  const totalMint = riwayat
    .filter((r: any) => r.jenis_transaksi === "mint" && r.status === "success")
    .reduce((a: number, r: any) => a + (r.jumlah_token_x100 ?? 0), 0);
  const totalBurn = riwayat
    .filter((r: any) => r.jenis_transaksi === "burn" && r.status === "success")
    .reduce((a: number, r: any) => a + (r.jumlah_token_x100 ?? 0), 0);

  const kontrak = process.env.NEXT_PUBLIC_SKS_TOKEN_ADDRESS;

  return (
    <AppShell
      peran="admin"
      nama={session?.user.name ?? "-"}
      deskripsi="Admin, Sistem"
      breadcrumb={["Beranda", "Blockchain", "Operasi Token"]}
      title="Operasi Token SKS"
      subtitle="Riwayat penerbitan (mint) dan pembakaran (burn) token SKS non-transferable"
    >
      {!kontrak && (
        <div className="mb-4">
          <InfoBox>
            <b>Perhatian:</b> alamat kontrak token belum dikonfigurasi
            (NEXT_PUBLIC_SKS_TOKEN_ADDRESS). Jalankan hardhat node + deploy, lalu isi .env.
            Operasi burn akan tercatat gagal sampai konfigurasi lengkap.
          </InfoBox>
        </div>
      )}

      {/* Kartu ringkas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          ["Kontrak Token (BKDSKSToken)", kontrak ? `${kontrak.slice(0, 6)}…${kontrak.slice(-4)}` : "-", "Non-transferable ERC-20"],
          ["Total Token Diterbitkan", `${(totalMint / 100).toFixed(2)} SKS`, "transaksi mint sukses"],
          ["Total Token Dibakar", `${(totalBurn / 100).toFixed(2)} SKS`, "transaksi burn (koreksi)"],
        ].map(([label, value, sub]) => (
          <div key={label as string} className="rounded-[10px] border border-line p-4">
            <p className="text-[11px] text-muted">{label}</p>
            <p className="mt-1 text-[17px] font-semibold text-navy">{value}</p>
            <p className="mt-1 text-[10px] text-crumb">{sub}</p>
          </div>
        ))}
      </div>

      {/* Form burn */}
      <form
        action={burnToken}
        className="mt-4 grid grid-cols-2 gap-3 rounded-[10px] border border-danger/30 bg-danger-soft/40 p-4 md:grid-cols-4"
      >
        <div>
          <label className="text-[11px] font-medium text-cell">Dosen</label>
          <select
            name="id_dosen"
            required
            className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-xs outline-none focus:border-primary"
          >
            {dosenBerwallet.map((d: any) => (
              <option key={d.id_pengguna} value={d.id_pengguna}>
                {d.nama} — {d.alamat_wallet.slice(0, 8)}…
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-medium text-cell">Jumlah SKS</label>
          <input
            name="jumlah_sks"
            type="number"
            step="0.01"
            min="0.01"
            required
            placeholder="cth: 1.00"
            className="mt-1 w-full rounded-md border border-line px-3 py-2 text-xs outline-none placeholder:text-crumb focus:border-primary"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-cell">Alasan Koreksi</label>
          <input
            name="alasan"
            required
            placeholder="cth: kelebihan penerbitan"
            className="mt-1 w-full rounded-md border border-line px-3 py-2 text-xs outline-none placeholder:text-crumb focus:border-primary"
          />
        </div>
        <div className="flex items-end">
          <button className="w-full rounded-lg bg-danger px-4 py-2 text-xs font-medium text-white">
            Burn Token (Koreksi)
          </button>
        </div>
      </form>

      <div className="mt-4">
        <DataTable
          columns={[
            { label: "No", width: "45px" },
            { label: "Waktu", width: "150px" },
            { label: "Jenis", width: "80px" },
            { label: "Wallet Dosen", width: "150px" },
            { label: "Jumlah SKS", width: "100px" },
            { label: "Reference / Alasan" },
            { label: "Tx Hash", width: "150px" },
            { label: "Status", width: "95px" },
          ]}
        >
          {riwayat.length === 0 ? (
            <tr>
              <td colSpan={8} className="!text-center !text-crumb">
                Belum ada transaksi token.
              </td>
            </tr>
          ) : (
            riwayat.map((r: any, i: number) => (
              <tr key={r.id_transaksi}>
                <td>{i + 1}</td>
                <td>{fmt(r.created_at)}</td>
                <td>
                  <StatusChip
                    label={r.jenis_transaksi === "mint" ? "Mint" : "Burn"}
                    variant={STATUS_VARIAN[r.jenis_transaksi]}
                  />
                </td>
                <td className="!font-mono !text-[10px] !text-muted">
                  {r.alamat_wallet ? `${r.alamat_wallet.slice(0, 6)}…${r.alamat_wallet.slice(-4)}` : "-"}
                </td>
                <td>{r.jumlah_token_x100 != null ? (r.jumlah_token_x100 / 100).toFixed(2) : "-"}</td>
                <td className="!text-[10px] !text-muted">{r.reference_id ?? r.alasan ?? "-"}</td>
                <td className="!font-mono !text-[10px] !text-primary">
                  {r.tx_hash ? `${r.tx_hash.slice(0, 8)}…${r.tx_hash.slice(-6)}` : "-"}
                </td>
                <td>
                  <StatusChip
                    label={r.status}
                    variant={STATUS_VARIAN[r.status] ?? "neutral"}
                  />
                </td>
              </tr>
            ))
          )}
        </DataTable>
      </div>
    </AppShell>
  );
}
