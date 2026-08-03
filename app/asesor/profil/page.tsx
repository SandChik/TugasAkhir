import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import AppShell from "../../../components/AppShell";
import ProfilCard from "../../../components/ProfilCard";

export default async function ProfilAsesorPage() {
  const session = await getServerSession(authOptions);
  return (
    <AppShell
      peran="asesor"
      nama={session?.user.name ?? "-"}
      deskripsi="Asesor, Teknik Informatika"
      breadcrumb={["Beranda", "Profil"]}
      title="Profil"
      subtitle="Data akun Anda (dikelola oleh admin)"
    >
      <ProfilCard idPengguna={session!.user.id} />
    </AppShell>
  );
}
