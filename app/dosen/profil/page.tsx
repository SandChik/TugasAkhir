import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import AppShell from "../../../components/AppShell";
import ProfilCard from "../../../components/ProfilCard";

export default async function ProfilDosenPage() {
  const session = await getServerSession(authOptions);
  return (
    <AppShell
      peran="dosen"
      nama={session?.user.name ?? "-"}
      deskripsi="Dosen, D3 Teknik Informatika"
      breadcrumb={["Beranda", "Profil"]}
      title="Profil"
      subtitle="Data akun Anda (dikelola oleh admin)"
    >
      <ProfilCard idPengguna={session!.user.id} />
    </AppShell>
  );
}
