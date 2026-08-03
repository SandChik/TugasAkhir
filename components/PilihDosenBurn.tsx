"use client";

import { useState } from "react";

export type OpsiDosenBurn = {
  id: string;
  nama: string;
  wallet: string;
  /** Saldo on-chain dalam SKS; null bila tidak terbaca (RPC mati) */
  sks: number | null;
};

const inputCls =
  "mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-xs outline-none placeholder:text-crumb focus:border-primary";

/**
 * Pemilih dosen untuk operasi burn: saldo wallet ditampilkan terpisah dari nama
 * dan ikut membatasi input jumlah (atribut `max` -> validasi bawaan browser),
 * supaya admin tidak mengirim transaksi yang pasti ditolak jaringan.
 */
export default function PilihDosenBurn({ dosen }: { dosen: OpsiDosenBurn[] }) {
  const [id, setId] = useState(dosen[0]?.id ?? "");
  const [jumlah, setJumlah] = useState("");

  const dipilih = dosen.find((d) => d.id === id) ?? null;
  const saldo = dipilih?.sks ?? null;
  const kosong = saldo === 0;

  return (
    <>
      <div>
        <label className="text-[11px] font-medium text-cell">Dosen</label>
        <select
          name="id_dosen"
          required
          value={id}
          onChange={(e) => setId(e.target.value)}
          className={inputCls}
        >
          {dosen.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nama}
            </option>
          ))}
        </select>
        <p className="mt-1 truncate font-mono text-[10px] text-crumb" title={dipilih?.wallet}>
          {dipilih ? `${dipilih.wallet.slice(0, 10)}…${dipilih.wallet.slice(-6)}` : "-"}
        </p>
      </div>

      <div>
        <label className="text-[11px] font-medium text-cell">Jumlah SKS</label>
        <input
          name="jumlah_sks"
          type="number"
          step="0.01"
          min="0.01"
          max={saldo ?? undefined}
          required
          value={jumlah}
          onChange={(e) => setJumlah(e.target.value)}
          placeholder="cth: 1.00"
          className={inputCls}
        />
        <p className="mt-1 flex items-center gap-1.5 text-[10px]">
          <span className={kosong ? "text-danger" : "text-muted"}>
            Saldo wallet:{" "}
            <b>{saldo === null ? "belum terbaca" : `${saldo.toFixed(2)} SKS`}</b>
          </span>
          {saldo !== null && saldo > 0 && (
            <button
              type="button"
              onClick={() => setJumlah(String(saldo))}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              pakai semua
            </button>
          )}
        </p>
        {kosong && (
          <p className="text-[10px] text-danger">Tidak ada token yang bisa diburn di sini.</p>
        )}
      </div>
    </>
  );
}
