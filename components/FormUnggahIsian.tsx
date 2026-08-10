"use client";

import { useState } from "react";
import InputBerkasPdf from "./InputBerkasPdf";

const label = "text-[11px] font-medium text-cell";
const bantuan = "mt-1.5 text-[10.5px] leading-snug text-muted";
const kolom =
  "mt-1 w-full rounded-md border border-line bg-white px-2.5 py-2 text-[11.5px] text-cell outline-none focus:border-primary";

/** Ringkasan spek jenis yang aman dikirim ke klien (tanpa RegExp/endpoint). */
export type JenisRingkas = {
  key: string;
  label: string;
  mesin: "offline" | "vlm";
  petunjukTeks: string;
};

/**
 * Isian formulir unggah: pilihan jenis dokumen + pemilih berkas. Komponen klien
 * agar opsi lanjutan SK Pembina hanya tampil saat jenis itu benar-benar dipilih
 * — untuk jenis lain field-nya memang diabaikan server, jadi tak perlu tampil.
 */
export default function FormUnggahIsian({ daftarJenis }: { daftarJenis: JenisRingkas[] }) {
  const [jenis, setJenis] = useState("auto");
  const vlmMungkin = jenis === "auto" || daftarJenis.some((j) => j.key === jenis && j.mesin === "vlm");

  return (
    <div className="grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-3">
      <div>
        <label htmlFor="jenis" className={label}>
          Jenis dokumen
        </label>
        <select
          id="jenis"
          name="jenis"
          value={jenis}
          onChange={(e) => setJenis(e.target.value)}
          className={kolom}
        >
          <option value="auto">Deteksi otomatis dari nama berkas</option>
          {daftarJenis.map((j) => (
            <option key={j.key} value={j.key}>
              {j.label} — {j.mesin === "vlm" ? "parser VLM" : "parser offline"}
            </option>
          ))}
        </select>
        <p className={bantuan}>Kata kunci nama berkas untuk deteksi otomatis:</p>
        <ul className="mt-1.5 space-y-1">
          {daftarJenis.map((j) => (
            <li key={j.key} className="text-[10.5px] leading-snug text-muted">
              <span className="text-cell">{j.label}</span> ← {j.petunjukTeks}
            </li>
          ))}
        </ul>
      </div>

      <div className="md:col-span-2">
        <label htmlFor="file" className={label}>
          Berkas PDF
        </label>
        <InputBerkasPdf
          className={`${kolom} file:mr-3 file:rounded file:border-0 file:bg-head-bg file:px-2.5 file:py-1 file:text-[10.5px] file:text-cell`}
        />
        {vlmMungkin && (
          <p className={bantuan}>
            Jenis ber-parser VLM (SK Pembina Ormawa, Artefak Dokumen Umum) bisa beberapa menit per
            berkas — biarkan halaman ini terbuka sampai selesai.
          </p>
        )}

        {jenis === "sk_pembinaan" && (
          <details className="mt-3 rounded-md border border-line bg-zebra px-3 py-2">
            <summary className="cursor-pointer text-[11px] font-medium text-cell">
              Opsi lanjutan — khusus SK Pembina Ormawa (parser VLM)
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
              <div>
                <label className="text-[10.5px] font-medium text-muted">Nomor SK</label>
                <input name="nomor_sk" placeholder="45/PL1/HK.02/2026" className={kolom} />
              </div>
              <div>
                <label className="text-[10.5px] font-medium text-muted">Tanggal SK</label>
                <input type="date" name="tanggal_sk" className={kolom} />
              </div>
              <div>
                <label className="text-[10.5px] font-medium text-muted">Halaman lampiran 1</label>
                <input type="number" name="halaman_l1" placeholder="4" min={1} className={kolom} />
              </div>
              <div>
                <label className="text-[10.5px] font-medium text-muted">Halaman lampiran 2</label>
                <input type="number" name="halaman_l2" placeholder="5" min={1} className={kolom} />
              </div>
              <div>
                <label className="text-[10.5px] font-medium text-muted">DPI rasterisasi</label>
                <input type="number" name="dpi" placeholder="200" min={72} className={kolom} />
              </div>
            </div>
            <p className={bantuan}>
              Kosongkan saja bila tidak yakin — masih bisa dikoreksi di halaman pratinjau.
            </p>
          </details>
        )}
      </div>
    </div>
  );
}
