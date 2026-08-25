import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import AppShell from "../../../components/AppShell";
import TabelData from "../../../components/TabelData";
import BarisPengguna from "../../../components/BarisPengguna";
import FormTambahPengguna from "../../../components/FormTambahPengguna";

/** UI-ADM-02 / FR-03: Manajemen Pengguna. */
export default async function PenggunaPage() {
  const session = await getServerSession(authOptions);
  const pengguna = await prisma.pengguna.findMany({ orderBy: { created_at: "asc" } });

  return (
    <AppShell
      peran="admin"
      nama={session?.user.name ?? "-"}
      deskripsi="Admin, Sistem"
      breadcrumb={["Beranda", "Administrasi", "Manajemen Pengguna"]}
      title="Manajemen Pengguna"
      subtitle="Kelola akun dosen, asesor, dan admin sistem"
    >
      {/* Form tambah pengguna — client component: field mengikuti peran terpilih */}
      <FormTambahPengguna />

      <div className="mt-3">
        <TabelData
          perHalamanAwal={5}
          placeholderCari="Cari nama, email, NIDN, kode dosen…"
          kosong="Belum ada akun terdaftar."
          kolom={[
            { label: "No", width: "50px" },
            { label: "Nama", urut: true },
            { label: "Email", urut: true },
            { label: "Peran", width: "95px", filter: true },
            { label: "NIDN", width: "125px", urut: true },
            { label: "Kode Dosen (ST)", width: "125px", urut: true },
            { label: "NIRA", width: "145px" },
            { label: "Program Studi", width: "160px", filter: true },
            { label: "Wallet", width: "110px" },
            { label: "Status", width: "95px", filter: true },
            { label: "Aksi", width: "90px" },
          ]}
          baris={pengguna.map((u: any, i: number) => ({
            id: u.id_pengguna,
            nilai: [
              i + 1,
              u.nama,
              u.email,
              u.peran.charAt(0).toUpperCase() + u.peran.slice(1),
              u.nidn,
              u.kode_dosen,
              u.nira,
              u.program_studi,
              u.alamat_wallet,
              u.aktif ? "Aktif" : "Nonaktif",
              null,
            ],
            elemen: (
              <BarisPengguna
                nomor={i + 1}
                bisaUbahStatus={u.id_pengguna !== session?.user.id}
                u={{
                  id_pengguna: u.id_pengguna,
                  nama: u.nama,
                  email: u.email,
                  peran: u.peran,
                  nidn: u.nidn,
                  kode_dosen: u.kode_dosen,
                  nira: u.nira,
                  program_studi: u.program_studi,
                  alamat_wallet: u.alamat_wallet,
                  aktif: u.aktif,
                }}
              />
            ),
          }))}
        />
      </div>
    </AppShell>
  );
}
