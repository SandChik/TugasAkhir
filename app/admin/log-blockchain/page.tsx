import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { bacaEventToken } from "../../../lib/blockchain";
import AppShell from "../../../components/AppShell";
import DataTable from "../../../components/DataTable";
import StatusChip, { STATUS_VARIAN } from "../../../components/StatusChip";
import InfoBox from "../../../components/InfoBox";

/** R10: Log Blockchain — event on-chain langsung dari kontrak token. */
export default async function LogBlockchainPage() {
  const session = await getServerSession(authOptions);

  let events: any[] = [];
  let error: string | null = null;
  try {
    events = await bacaEventToken(200);
  } catch (e: any) {
    error = e?.message ?? "Gagal membaca event on-chain";
  }

  const kontrak = process.env.NEXT_PUBLIC_SKS_TOKEN_ADDRESS;

  return (
    <AppShell
      peran="admin"
      nama={session?.user.name ?? "-"}
      deskripsi="Admin, Sistem"
      breadcrumb={["Beranda", "Blockchain", "Log Blockchain"]}
      title="Log Blockchain"
      subtitle="Seluruh aksi yang tercatat permanen di jaringan (dibaca langsung on-chain)"
    >
      <InfoBox>
        <b>Info:</b> Data di bawah dibaca langsung dari event kontrak{" "}
        <span className="font-mono">{kontrak ? `${kontrak.slice(0, 10)}…` : "(belum dikonfigurasi)"}</span>,
        bukan dari basis data. Inilah bukti auditabilitas: siapa pun dapat memverifikasi ulang.
      </InfoBox>

      {error && (
        <div className="mt-4 rounded-lg bg-danger-soft px-4 py-3 text-xs text-danger">
          Tidak dapat membaca on-chain: {error}. Pastikan node RPC berjalan dan alamat kontrak terisi.
        </div>
      )}

      <div className="mt-4">
        <DataTable
          columns={[
            { label: "Block", width: "80px" },
            { label: "Jenis", width: "90px" },
            { label: "Akun (wallet)", width: "180px" },
            { label: "Jumlah SKS", width: "110px" },
            { label: "Reference / Alasan" },
            { label: "Tx Hash", width: "180px" },
          ]}
        >
          {events.length === 0 ? (
            <tr>
              <td colSpan={6} className="!text-center !text-crumb">
                {error ? "—" : "Belum ada transaksi tercatat di blockchain."}
              </td>
            </tr>
          ) : (
            events.map((e: any, i: number) => (
              <tr key={i}>
                <td>#{e.block}</td>
                <td>
                  <StatusChip label={e.jenis === "mint" ? "Mint" : "Burn"} variant={STATUS_VARIAN[e.jenis]} />
                </td>
                <td className="!font-mono !text-[10px] !text-muted">
                  {e.akun ? `${e.akun.slice(0, 8)}…${e.akun.slice(-4)}` : "-"}
                </td>
                <td>{(e.jumlahX100 / 100).toFixed(2)}</td>
                <td className="!text-[10px] !text-muted">{e.referensi || "-"}</td>
                <td className="!font-mono !text-[10px] !text-primary">
                  {e.txHash ? `${e.txHash.slice(0, 10)}…${e.txHash.slice(-8)}` : "-"}
                </td>
              </tr>
            ))
          )}
        </DataTable>
      </div>
    </AppShell>
  );
}
