import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import AppShell from "../../../components/AppShell";
import ProfilCard from "../../../components/ProfilCard";

export default async function ProfilAdminPage() {
  const session = await getServerSession(authOptions);
  return (
    <AppShell
      peran="admin"
      nama={session?.user.name ?? "-"}
      deskripsi="Admin, Sistem"
      breadcrumb={["Beranda", "Profil"]}
      title="Profil"
      subtitle="Data akun Anda"
    >
      <ProfilCard idPengguna={session!.user.id} />
    </AppShell>
  );
}
