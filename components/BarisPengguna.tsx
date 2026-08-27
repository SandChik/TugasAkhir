"use client";

import { useState } from "react";
import StatusChip from "./StatusChip";
import SubmitButton from "./SubmitButton";
import AlamatSalin from "./AlamatSalin";
import { IconPower, IconSave } from "./Icons";
import { simpanIdentitas, setAktifPengguna } from "../app/admin/pengguna/actions";

const PERAN_VARIAN = { admin: "navy", dosen: "primary", asesor: "successDeep" } as const;

const inputCls =
  "w-full rounded-md border border-line bg-white px-2 py-1.5 text-[11px] text-cell outline-none placeholder:text-crumb focus:border-primary";

export type PenggunaBaris = {
  id_pengguna: string;
  nama: string;
  email: string | null;
  peran: string;
  nidn: string | null;
  kode_dosen: string | null;
  nira: string | null;
  program_studi: string | null;
  alamat_wallet: string | null;
  aktif: boolean;
};

type Kolom = "nidn" | "kode_dosen" | "nira" | "program_studi";

/**
 * Baris tabel Manajemen Pengguna. Kolom identitas (NIDN, kode dosen ST, NIRA,
 * program studi) langsung berupa input untuk semua peran, termasuk admin;
 * tombol Simpan aktif begitu ada nilai yang berubah.
 */
export default function BarisPengguna({
  u,
  nomor,
  bisaUbahStatus,
}: {
  u: PenggunaBaris;
  nomor: number;
  bisaUbahStatus: boolean;
}) {
  const awal: Record<Kolom, string> = {
    nidn: u.nidn ?? "",
    kode_dosen: u.kode_dosen ?? "",
    nira: u.nira ?? "",
    program_studi: u.program_studi ?? "",
  };
  const [nilai, setNilai] = useState(awal);

  const idForm = `identitas-${u.id_pengguna}`;
  const berubah = (Object.keys(awal) as Kolom[]).some(
    (k) => nilai[k].trim() !== awal[k].trim(),
  );

  const ubah = (k: Kolom, v: string) => setNilai((s) => ({ ...s, [k]: v }));

  // Enter di dalam input mengirim baris ini, bukan form tambah pengguna.
  const enterSimpan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (!berubah) return;
    (document.getElementById(idForm) as HTMLFormElement | null)?.requestSubmit();
  };

  const kolomInput = (k: Kolom, placeholder: string, uppercase = false) => (
    <input
      value={nilai[k]}
      onChange={(e) => ubah(k, uppercase ? e.target.value.toUpperCase() : e.target.value)}
      onKeyDown={enterSimpan}
      placeholder={placeholder}
      aria-label={placeholder}
      className={`${inputCls} ${uppercase ? "font-mono uppercase" : ""}`}
    />
  );

  return (
    <tr>
      <td>{nomor}</td>
      <td>{u.nama}</td>
      <td>{u.email ?? "-"}</td>
      <td>
        <StatusChip
          label={u.peran.charAt(0).toUpperCase() + u.peran.slice(1)}
          variant={PERAN_VARIAN[u.peran as keyof typeof PERAN_VARIAN]}
        />
      </td>
      <td>{kolomInput("nidn", "NIDN")}</td>
      <td>{kolomInput("kode_dosen", "KO019N", true)}</td>
      <td>{kolomInput("nira", "NIRA")}</td>
      <td>{kolomInput("program_studi", "Program studi")}</td>
      <td className="!text-[10px] !text-muted">
        {u.alamat_wallet ? (
          <AlamatSalin nilai={u.alamat_wallet} awal={6} akhir={4} className="text-[10px] text-muted" />
        ) : (
          "-"
        )}
      </td>
      <td>
        <StatusChip label={u.aktif ? "Aktif" : "Nonaktif"} variant={u.aktif ? "success" : "danger"} />
      </td>
      <td>
        <div className="flex items-center gap-1.5">
          <form id={idForm} action={simpanIdentitas}>
            <input type="hidden" name="id" value={u.id_pengguna} />
            <input type="hidden" name="program_studi" value={nilai.program_studi} />
            <input type="hidden" name="nidn" value={nilai.nidn} />
            <input type="hidden" name="kode_dosen" value={nilai.kode_dosen} />
            <input type="hidden" name="nira" value={nilai.nira} />
            <SubmitButton
              variant="soft"
              disabled={!berubah}
              className="!p-2"
              title="Simpan identitas"
              icon={<IconSave size={13} />}
              labelProses=""
            >
              {""}
            </SubmitButton>
          </form>
          {bisaUbahStatus && (
            <form action={setAktifPengguna}>
              <input type="hidden" name="id" value={u.id_pengguna} />
              <input type="hidden" name="aktif" value={String(!u.aktif)} />
              {u.aktif ? (
                <SubmitButton
                  variant="danger"
                  className="!p-2"
                  title="Nonaktifkan akun"
                  icon={<IconPower size={13} />}
                  labelProses=""
                  judulKonfirmasi="Nonaktifkan akun?"
                  konfirmasi={`${u.nama} tidak akan bisa masuk ke sistem sampai diaktifkan kembali.`}
                  tombolKonfirmasi="Ya, nonaktifkan"
                >
                  {""}
                </SubmitButton>
              ) : (
                <SubmitButton
                  className="!bg-[#e6f4ec] !p-2 !text-success-tx"
                  title="Aktifkan akun"
                  icon={<IconPower size={13} />}
                  labelProses=""
                >
                  {""}
                </SubmitButton>
              )}
            </form>
          )}
        </div>
      </td>
    </tr>
  );
}
