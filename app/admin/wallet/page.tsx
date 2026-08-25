import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import AppShell from "../../../components/AppShell";
import DataTable from "../../../components/DataTable";
import StatusChip from "../../../components/StatusChip";
import { tetapkanWallet } from "./actions";

/** UI-ADM-03 / FR-04: Konfigurasi wallet custodial dosen. */
export default async function WalletPage() {
  const session = await getServerSession(authOptions);
  const dosen = await prisma.pengguna.findMany({
    where: { peran: { in: ["dosen", "asesor"] } },
    orderBy: { created_at: "asc" },
  });

  return (
    <AppShell
      peran="admin"
      nama={session?.user.name ?? "-"}
      deskripsi="Admin, Sistem"
      breadcrumb={["Beranda", "Administrasi", "Konfigurasi Wallet"]}
      title="Konfigurasi Wallet Dosen"
      subtitle="Penetapan wallet address untuk setiap akun dosen (dikelola sistem)"
    >
      <div>
        <DataTable
          columns={[
            { label: "No", width: "50px" },
            { label: "Nama" },
            { label: "NIDN", width: "120px" },
            { label: "Index HD", width: "90px" },
            { label: "Wallet Address", width: "340px" },
            { label: "Status", width: "150px" },
            { label: "Aksi", width: "160px" },
          ]}
        >
          {dosen.length === 0 ? (
            <tr>
              <td colSpan={7} className="!text-center !text-crumb">
                Belum ada akun dosen.
              </td>
            </tr>
          ) : (
            dosen.map((u: any, i: number) => (
              <tr key={u.id_pengguna}>
                <td>{i + 1}</td>
                <td>{u.nama}</td>
                <td>{u.nidn ?? "-"}</td>
                <td>{u.wallet_index ?? "-"}</td>
                <td className="!font-mono !text-[10px] !text-muted">{u.alamat_wallet ?? "-"}</td>
                <td>
                  <StatusChip
                    label={u.alamat_wallet ? "Terhubung" : "Belum ditetapkan"}
                    variant={u.alamat_wallet ? "success" : "warning"}
                  />
                </td>
                <td>
                  {!u.alamat_wallet && (
                    <form action={tetapkanWallet}>
                      <input type="hidden" name="id" value={u.id_pengguna} />
                      <button className="rounded-md bg-primary px-3 py-1.5 text-[10.5px] font-medium text-white">
                        Tetapkan Wallet
                      </button>
                    </form>
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
