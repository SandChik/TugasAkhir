"use client";

import { useState } from "react";
import { createPengguna } from "../app/admin/pengguna/actions";
import PasswordInput from "./PasswordInput";

const inputCls =
  "mt-1 w-full rounded-md border border-line px-3 py-2 text-xs outline-none placeholder:text-crumb focus:border-primary";

/**
 * Form tambah pengguna (client) — field menyesuaikan peran yang dipilih:
 * - NIDN & Kode Dosen untuk dosen/asesor (asesor juga dosen), NIDN wajib.
 * - NIRA hanya muncul untuk asesor.
 */
export default function FormTambahPengguna() {
  const [peran, setPeran] = useState("dosen");
  const pengajar = peran === "dosen" || peran === "asesor";

  return (
    <form
      action={createPengguna}
      className="grid grid-cols-2 gap-3 rounded-[10px] border border-line p-4 md:grid-cols-3 lg:grid-cols-9"
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
        <select
          name="peran"
          value={peran}
          onChange={(e) => setPeran(e.target.value)}
          className={`${inputCls} bg-white`}
        >
          <option value="dosen">Dosen</option>
          <option value="asesor">Asesor</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div>
        <label className="text-[11px] font-medium text-cell">Password Awal</label>
        <PasswordInput
          name="password"
          required
          minLength={8}
          placeholder="Min. 8 karakter"
          wrapperClassName="mt-1"
          className={inputCls.replace("mt-1 ", "")}
        />
      </div>
      {pengajar && (
        <div>
          <label className="text-[11px] font-medium text-cell">NIDN</label>
          <input name="nidn" required placeholder="Wajib diisi" className={inputCls} />
        </div>
      )}
      <div>
        <label className="text-[11px] font-medium text-cell">Program Studi</label>
        <input name="program_studi" placeholder="Opsional" className={inputCls} />
      </div>
      {pengajar && (
        <div>
          <label className="text-[11px] font-medium text-cell">Kode Dosen (ST)</label>
          <input name="kode_dosen" placeholder="mis. KO019N" className={inputCls} />
        </div>
      )}
      {peran === "asesor" && (
        <div>
          <label className="text-[11px] font-medium text-cell">NIRA</label>
          <input name="nira" placeholder="No. registrasi asesor" className={inputCls} />
        </div>
      )}
      <div className="flex items-end">
        <button className="w-full rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white">
          + Tambah
        </button>
      </div>
    </form>
  );
}
