import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import AppShell from "../../../components/AppShell";
import DataTable from "../../../components/DataTable";
import StatusChip from "../../../components/StatusChip";
import { createPengguna, setAktifPengguna, setKodeDosen } from "./actions";
import SubmitButton from "../../../components/SubmitButton";

const PERAN_VARIAN = { admin: "navy", dosen: "primary", asesor: "successDeep" } as const;

const inputCls =
  "mt-1 w-full rounded-md border border-line px-3 py-2 text-xs outline-none placeholder:text-crumb focus:border-primary";

/** UI-ADM-02 / FR-03: Manajemen Pengguna. */
export default async function PenggunaPage() {
  const session = await getServerSession(authOptions);
  const pengguna = await prisma.pengguna.findMany({ orderBy: { created_at: "asc" } });

  // Kode dosen menentukan apakah baris ST Pengajaran dapat dicocokkan otomatis
  const dosen = pengguna.filter((u: any) => u.peran === "dosen");
  const berkode = dosen.filter((u: any) => u.kode_dosen).length;

  return (
    <AppShell
      peran="admin"
      nama={session?.user.name ?? "-"}
      deskripsi="Admin, Sistem"
      breadcrumb={["Beranda", "Administrasi", "Manajemen Pengguna"]}
      title="Manajemen Pengguna"
      subtitle="Kelola akun dosen, asesor, dan admin sistem"
    >
      {/* Form tambah pengguna */}
      <form
        action={createPengguna}
        className="grid grid-cols-2 gap-3 rounded-[10px] border border-line p-4 md:grid-cols-4 lg:grid-cols-8"
      >
        <div>
          <label className="text-[11px] font-medium text-cell">Nama</label>
          <input name="nama" required placeholder="Nama lengkap" className={inputCls} />
        </div>
        <div>
          <label className="text-[11px] font-medium text-cell">Email</label>
          <input name="email" type="email" required placeholder="nama@polban.ac.id" className={inputCls} />
        </div>
        <div>
          <label className="text-[11px] font-medium text-cell">Peran</label>
          <select name="peran" className={`${inputCls} bg-white`}>
            <option value="dosen">Dosen</option>
            <option value="asesor">Asesor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-medium text-cell">Password Awal</label>
          <input name="password" required placeholder="Min. 8 karakter" className={inputCls} />
        </div>
        <div>
          <label className="text-[11px] font-medium text-cell">NIDN (dosen)</label>
          <input name="nidn" placeholder="Opsional" className={inputCls} />
        </div>
        <div>
          <label className="text-[11px] font-medium text-cell">Program Studi</label>
          <input name="program_studi" placeholder="Opsional" className={inputCls} />
        </div>
        <div>
          <label className="text-[11px] font-medium text-cell">Kode Dosen (ST)</label>
          <input name="kode_dosen" placeholder="mis. KO019N" className={inputCls} />
        </div>
        <div className="flex items-end">
          <button className="w-full rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white">
            + Tambah
          </button>
        </div>
      </form>

      <p className="mt-3 text-[11px] text-muted">
        <b>{berkode}</b> dari {dosen.length} akun dosen sudah memiliki <b>kode dosen</b> (kolom
        &ldquo;Kd Dosen&rdquo; pada surat tugas). Baris ST Pengajaran milik dosen tanpa kode tidak
        dapat dicocokkan otomatis saat unggah SK &amp; ST.
      </p>

      <div className="mt-2">
        <DataTable
          columns={[
            { label: "No", width: "50px" },
            { label: "Nama" },
            { label: "Email" },
            { label: "Peran", width: "95px" },
            { label: "NIDN", width: "110px" },
            { label: "Kode Dosen (ST)", width: "150px" },
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
                {u.peran !== "dosen" ? (
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
