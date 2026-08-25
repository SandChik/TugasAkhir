"use client";

import { useState } from "react";
import { FIELD_TANGGAL, type KunciTanggal } from "../lib/fase";
import StatusChip from "./StatusChip";
import SubmitButton from "./SubmitButton";
import { IconCheck, IconPencil, IconPower, IconX } from "./Icons";
import {
  aktifkanPeriode,
  nonaktifkanPeriode,
  setFaseOverride,
  ubahPeriode,
} from "../app/admin/periode/actions";

export type PeriodeBaris = {
  id: string;
  nama: string;
  tahun_ajaran: string;
  semester: string;
  status: string;
  fase_override: string;
  fase_label: string;
  /** Rentang fase yang sedang berjalan, sudah diformat di server. */
  rentang: string;
  tanggal: Record<KunciTanggal, string>;
};

const inputCls =
  "mt-1 w-full rounded-md border border-line bg-white px-2 py-1.5 text-[11px] text-cell outline-none placeholder:text-crumb focus:border-primary";

/**
 * Baris tabel Manajemen Periode BKD. Panel ubah dibentangkan di bawah baris
 * supaya identitas dan delapan tanggal fase bisa diperbaiki setelah tersimpan,
 * tanpa membuat kolom tabel melebar.
 */
export default function BarisPeriode({ p }: { p: PeriodeBaris }) {
  const [buka, setBuka] = useState(false);
  const aktif = p.status === "aktif";

  return (
    <>
      <tr>
        <td>{p.nama}</td>
        <td>
          <StatusChip label={p.fase_label} variant="primary" />
          {p.fase_override && <span className="ml-1 text-[9px] text-warning">(override)</span>}
        </td>
        <td className="!text-[10px]">{p.rentang}</td>
        <td>
          <StatusChip
            label={aktif ? "Aktif" : "Nonaktif"}
            variant={aktif ? "success" : "neutral"}
          />
        </td>
        <td>
          <div className="flex flex-wrap items-center gap-1.5">
            <form action={aktif ? nonaktifkanPeriode : aktifkanPeriode}>
              <input type="hidden" name="id" value={p.id} />
              {aktif ? (
                <button
                  title="Nonaktifkan periode"
                  className="rounded-md bg-danger-soft p-2 text-danger hover:bg-[#fbe2e4]"
                >
                  <IconPower size={13} />
                </button>
              ) : (
                <button
                  title="Aktifkan periode"
                  className="rounded-md bg-[#e6f4ec] p-2 text-success-tx hover:bg-[#d8ecdf]"
                >
                  <IconPower size={13} />
                </button>
              )}
            </form>

            <form action={setFaseOverride} className="flex items-center gap-1">
              <input type="hidden" name="id" value={p.id} />
              <select
                name="fase"
                defaultValue={p.fase_override}
                aria-label="Fase periode"
                className="rounded border border-line bg-white px-1.5 py-1 text-[10px]"
              >
                <option value="">(auto tanggal)</option>
                <option value="pengisian">Pengisian</option>
                <option value="penilaian">Penilaian</option>
                <option value="perbaikan">Perbaikan</option>
                <option value="selesai">Selesai</option>
              </select>
              <button
                title="Terapkan fase"
                className="rounded-md bg-primary-soft p-2 text-primary hover:bg-[#dde9fb]"
              >
                <IconCheck size={13} />
              </button>
            </form>

            <button
              type="button"
              onClick={() => setBuka((s) => !s)}
              aria-expanded={buka}
              title={buka ? "Tutup panel ubah" : "Ubah periode"}
              className="rounded-md border border-line bg-white p-2 text-cell hover:bg-head-bg"
            >
              {buka ? <IconX size={13} /> : <IconPencil size={13} />}
            </button>
          </div>
        </td>
      </tr>

      {buka && (
        <tr>
          <td colSpan={5} className="!bg-head-bg">
            <form action={ubahPeriode}>
              <input type="hidden" name="id" value={p.id} />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div>
                  <label className="text-[10px] font-medium text-muted">Tahun Ajaran</label>
                  <input
                    name="tahun_ajaran"
                    required
                    defaultValue={p.tahun_ajaran}
                    placeholder="2026/2027"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted">Semester</label>
                  <select name="semester" defaultValue={p.semester} className={inputCls}>
                    <option>Ganjil</option>
                    <option>Genap</option>
                  </select>
                </div>
                {FIELD_TANGGAL.map(([nama, label]) => (
                  <div key={nama}>
                    <label className="text-[10px] font-medium text-muted">{label}</label>
                    <input
                      type="date"
                      name={nama}
                      defaultValue={p.tanggal[nama]}
                      aria-label={label}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBuka(false)}
                  className="rounded-md border border-line bg-white px-3 py-1.5 text-[10.5px] font-medium text-cell hover:bg-white/70"
                >
                  Batal
                </button>
                <SubmitButton className="!px-3 !py-1.5 !text-[10.5px]" labelProses="Menyimpan…">
                  Simpan
                </SubmitButton>
              </div>
            </form>
          </td>
        </tr>
      )}
    </>
  );
}
