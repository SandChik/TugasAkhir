import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import AppShell from "../../../components/AppShell";
import DataTable from "../../../components/DataTable";
import StatusChip from "../../../components/StatusChip";
import { setAktifPengguna, setKodeDosen, setNira } from "./actions";
import SubmitButton from "../../../components/SubmitButton";
import FormTambahPengguna from "../../../components/FormTambahPengguna";

const PERAN_VARIAN = { admin: "navy", dosen: "primary", asesor: "successDeep" } as const;

/** UI-ADM-02 / FR-03: Manajemen Pengguna. */
export default async function PenggunaPage() {
  const session = await getServerSession(authOptions);
  const pengguna = await prisma.pengguna.findMany({ orderBy: { created_at: "asc" } });

  // Kode dosen menentukan apakah baris ST Pengajaran dapat dicocokkan otomatis.
  // Asesor juga dosen, sehingga ikut dihitung dan boleh punya kode dosen.
  const pengajar = pengguna.filter((u: any) => u.peran === "dosen" || u.peran === "asesor");
  const berkode = pengajar.filter((u: any) => u.kode_dosen).length;

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
        <DataTable
          columns={[
            { label: "No", width: "50px" },
            { label: "Nama" },
            { label: "Email" },
            { label: "Peran", width: "95px" },
            { label: "NIDN", width: "110px" },
            { label: "Kode Dosen (ST)", width: "150px" },
            { label: "NIRA", width: "130px" },
            { label: "Program Studi", width: "150px" },
            { label: "Wallet", width: "130px" },
            { label: "Status", width: "95px" },
            { label: "Aksi", width: "120px" },
          ]}
        >
          {pengguna.map((u: any, i: number) => (
            <tr key={u.id_pengguna}>
              <td>{i + 1}</td>
              <td>{u.nama}</td>
              <td>{u.email}</td>
              <td>
                <StatusChip
                  label={u.peran.charAt(0).toUpperCase() + u.peran.slice(1)}
                  variant={PERAN_VARIAN[u.peran as keyof typeof PERAN_VARIAN]}
                />
              </td>
              <td>{u.nidn ?? "-"}</td>
              <td>
                {/* Asesor juga dosen — kode dosen berlaku untuk keduanya */}
                {u.peran === "admin" ? (
                  <span className="text-crumb">-</span>
                ) : (
                  <>
                    {u.kode_dosen ? (
                      <span className="rounded bg-head-bg px-2 py-1 font-mono text-[10.5px] text-navy">
                        {u.kode_dosen}
                      </span>
                    ) : (
                      <span className="text-[10.5px] text-crumb">belum diisi</span>
                    )}
                    <details className="mt-1">
                      <summary className="cursor-pointer text-[9.5px] text-primary">Ubah</summary>
                      <form action={setKodeDosen} className="mt-1 flex items-center gap-1">
                        <input type="hidden" name="id" value={u.id_pengguna} />
                        <input
                          name="kode_dosen"
                          defaultValue={u.kode_dosen ?? ""}
                          placeholder="KO019N"
                          className="w-20 rounded border border-line px-1.5 py-1 text-[10px] uppercase"
                        />
                        <button className="rounded bg-primary-soft px-2 py-1 text-[10px] font-medium text-primary">
                          Simpan
                        </button>
                      </form>
                    </details>
                  </>
                )}
              </td>
              <td>
                {/* NIRA hanya dimiliki asesor */}
                {u.peran !== "asesor" ? (
                  <span className="text-crumb">-</span>
                ) : (
                  <>
                    {u.nira ? (
                      <span className="rounded bg-head-bg px-2 py-1 font-mono text-[10.5px] text-navy">
                        {u.nira}
                      </span>
                    ) : (
                      <span className="text-[10.5px] text-crumb">belum diisi</span>
                    )}
                    <details className="mt-1">
                      <summary className="cursor-pointer text-[9.5px] text-primary">Ubah</summary>
                      <form action={setNira} className="mt-1 flex items-center gap-1">
                        <input type="hidden" name="id" value={u.id_pengguna} />
                        <input
                          name="nira"
                          defaultValue={u.nira ?? ""}
                          placeholder="NIRA"
                          className="w-24 rounded border border-line px-1.5 py-1 text-[10px]"
                        />
                        <button className="rounded bg-primary-soft px-2 py-1 text-[10px] font-medium text-primary">
                          Simpan
                        </button>
                      </form>
                    </details>
                  </>
                )}
              </td>
              <td>{u.program_studi ?? "-"}</td>
              <td className="!text-[10px] !text-muted">
                {u.alamat_wallet
                  ? `${u.alamat_wallet.slice(0, 6)}…${u.alamat_wallet.slice(-4)}`
                  : "-"}
              </td>
              <td>
                <StatusChip
                  label={u.aktif ? "Aktif" : "Nonaktif"}
                  variant={u.aktif ? "success" : "danger"}
                />
              </td>
              <td>
                {u.id_pengguna !== session?.user.id && (
                  <form action={setAktifPengguna}>
                    <input type="hidden" name="id" value={u.id_pengguna} />
                    <input type="hidden" name="aktif" value={String(!u.aktif)} />
                    {u.aktif ? (
                      <SubmitButton
                        variant="danger"
                        className="!px-3 !py-1.5 !text-[10.5px]"
                        labelProses="Memproses…"
                        judulKonfirmasi="Nonaktifkan akun?"
                        konfirmasi={`${u.nama} tidak akan bisa masuk ke sistem sampai diaktifkan kembali.`}
                        tombolKonfirmasi="Ya, nonaktifkan"
                      >
                        Nonaktifkan
                      </SubmitButton>
                    ) : (
                      <SubmitButton
                        className="!bg-[#e6f4ec] !px-3 !py-1.5 !text-[10.5px] !text-success-tx"
                        labelProses="Memproses…"
                      >
                        Aktifkan
                      </SubmitButton>
                    )}
                  </form>
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    </AppShell>
  );
}
