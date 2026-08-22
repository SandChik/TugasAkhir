import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import AppShell from "../../../components/AppShell";
import TabelData from "../../../components/TabelData";
import StatusChip from "../../../components/StatusChip";
import { IconWallet } from "../../../components/Icons";
import { tetapkanWallet } from "./actions";

/** UI-ADM-03 / FR-04: Konfigurasi wallet custodial dosen. */
export default async function WalletPage() {
  const session = await getServerSession(authOptions);
  const dosen = await prisma.pengguna.findMany({
    where: { peran: "dosen" },
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
        <TabelData
          placeholderCari="Cari nama, NIDN, atau address…"
          kosong="Belum ada akun dosen."
          kolom={[
            { label: "No", width: "50px" },
            { label: "Nama", urut: true },
            { label: "NIDN", width: "120px", urut: true },
            { label: "Index HD", width: "90px", urut: true },
            { label: "Wallet Address", width: "340px" },
            { label: "Status", width: "150px", filter: true },
            { label: "Aksi", width: "70px" },
          ]}
          baris={dosen.map((u: any, i: number) => {
            const status = u.alamat_wallet ? "Terhubung" : "Belum ditetapkan";
            return {
              id: u.id_pengguna,
              nilai: [i + 1, u.nama, u.nidn, u.wallet_index, u.alamat_wallet, status, null],
              sel: [
                i + 1,
                u.nama,
                u.nidn ?? "-",
                u.wallet_index ?? "-",
                <span className="font-mono text-[10px] text-muted">{u.alamat_wallet ?? "-"}</span>,
                <StatusChip label={status} variant={u.alamat_wallet ? "success" : "warning"} />,
                !u.alamat_wallet && (
                  <form action={tetapkanWallet}>
                    <input type="hidden" name="id" value={u.id_pengguna} />
                    <button
                      title="Tetapkan wallet"
                      className="rounded-md bg-primary p-2 text-white hover:bg-[#255cc2]"
                    >
                      <IconWallet size={13} />
                    </button>
                  </form>
                ),
              ],
            };
          })}
        />
      </div>
    </AppShell>
  );
}
