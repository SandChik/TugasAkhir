"use client";

import Link from "next/link";
import { useState } from "react";
import { DETAIL_FIELDS } from "../lib/kolomKategori";
import { KATEGORI_INPUT_ADMIN } from "../lib/kategoriDosen";
import { fieldFormulir } from "../lib/parameterKegiatan";
import { simpanKegiatanDosen } from "../app/admin/kegiatan/actions";
import SubmitButton from "./SubmitButton";
import { IconCalc, IconSave, IconBack } from "./Icons";

export type FieldSkema = {
  name: string;
  label: string;
  type: string;
  options?: string[];
  required?: boolean;
};

export type RefKegiatan = {
  kode_rule: string;
  kategori: string;
  nama_kegiatan: string;
  fungsi_contract: string | null;
  fields: FieldSkema[];
};

export type DosenPilihan = {
  id: string;
  nama: string;
  program_studi: string | null;
  /** LKD periode aktif sudah dikunci dosen — kegiatan baru tak bisa diklaim lagi. */
  terkunci: boolean;
};

export type KegiatanAwal = {
  id: string;
  id_pengguna: string;
  kode_rule: string;
  judul: string;
  detail: Record<string, any>;
  parameter: Record<string, any>;
};

const inputCls =
  "mt-1 w-full rounded-md border border-line bg-white px-2.5 py-2 text-[11.5px] text-cell outline-none placeholder:text-crumb focus:border-primary";
const labelCls = "text-[11px] font-medium text-cell";

/**
 * Formulir admin untuk mencatat kegiatan berbasis penugasan atas nama dosen
 * (perkuliahan, bimbingan, pengujian, pembinaan). Client component supaya field
 * parameter & detail langsung berganti mengikuti jenis kegiatan yang dipilih,
 * tanpa memuat ulang halaman.
 */
export default function FormKegiatanAdmin({
  dosen,
  referensi,
  awal,
  kembali,
  periodeNama,
}: {
  dosen: DosenPilihan[];
  referensi: RefKegiatan[];
  awal?: KegiatanAwal | null;
  kembali: string;
  periodeNama?: string | null;
}) {
  const editMode = Boolean(awal);
  const [kode, setKode] = useState(awal?.kode_rule ?? referensi[0]?.kode_rule ?? "");
  const [idDosen, setIdDosen] = useState(awal?.id_pengguna ?? "");

  const ref = referensi.find((r) => r.kode_rule === kode) ?? null;
  const paramFields = fieldFormulir(ref?.fields ?? []);
  const detailFields = DETAIL_FIELDS[KATEGORI_INPUT_ADMIN[kode] ?? ""] ?? [];
  const dPilih = dosen.find((d) => d.id === idDosen) ?? null;
  const dNilai: Record<string, any> = awal?.detail ?? {};
  const pNilai: Record<string, any> = awal?.parameter ?? {};

  const halangan = !periodeNama
    ? "Belum ada periode BKD aktif — aktifkan satu periode di menu Periode BKD."
    : dosen.length === 0
      ? "Belum ada akun dosen aktif."
      : dPilih?.terkunci
        ? `${dPilih.nama} sudah menyimpan permanen LKD periode ini — kegiatan baru tidak dapat lagi diklaim.`
        : null;

  return (
    <form action={simpanKegiatanDosen} className="rounded-[10px] border border-line">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-line bg-head-bg px-4 py-2.5">
        <div>
          <h2 className="text-[12px] font-semibold text-navy">
            {editMode ? "Ubah kegiatan dosen" : "Catat kegiatan untuk dosen"}
          </h2>
        </div>
        {editMode && (
          <Link
            href={kembali}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-[11px] font-medium text-muted"
          >
            <IconBack size={11} /> Batal ubah
          </Link>
        )}
      </div>

      <input type="hidden" name="kembali" value={kembali} />
      {editMode && <input type="hidden" name="id_kegiatan" value={awal!.id} />}
      {editMode && <input type="hidden" name="kode_rule" value={kode} />}

      <div className="grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-2">
        <div>
          <label htmlFor="id_pengguna" className={labelCls}>
            Dosen pelaksana <span className="text-danger">*</span>
          </label>
          <select
            id="id_pengguna"
            name="id_pengguna"
            required
            value={idDosen}
            onChange={(e) => setIdDosen(e.target.value)}
            className={inputCls}
          >
            <option value="">— pilih dosen —</option>
            {dosen.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nama}
                {d.program_studi ? ` · ${d.program_studi}` : ""}
                {d.terkunci ? " (LKD terkunci)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="kode_rule" className={labelCls}>
            Jenis kegiatan (Rubrik BKD 2021) <span className="text-danger">*</span>
          </label>
          <select
            id="kode_rule"
            name={editMode ? undefined : "kode_rule"}
            required={!editMode}
            disabled={editMode}
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            className={`${inputCls} disabled:bg-head-bg disabled:text-muted`}
          >
            {referensi.map((r) => (
              <option key={r.kode_rule} value={r.kode_rule}>
                {r.kategori} — {r.kode_rule}
              </option>
            ))}
          </select>
        </div>
      </div>

      {ref && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-3">
              <label htmlFor="judul" className={labelCls}>
                Nama kegiatan <span className="text-danger">*</span>
              </label>
              <input
                id="judul"
                name="judul"
                required
                defaultValue={awal?.judul}
                placeholder="cth: Basis Data / 2CTI3 — atau — Bimbingan TA a.n. Andi Pratama"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="no_sk" className={labelCls}>
                No. SK / ST penugasan
              </label>
              <input
                id="no_sk"
                name="no_sk"
                defaultValue={dNilai.no_sk ?? undefined}
                placeholder="Opsional"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="tgl_sk" className={labelCls}>
                Tgl. SK / ST
              </label>
              <input
                id="tgl_sk"
                name="tgl_sk"
                type="date"
                defaultValue={dNilai.tgl_sk ?? undefined}
                className={inputCls}
              />
            </div>
          </div>

          {paramFields.length > 0 && (
            <>
              <p className="mt-5 border-t border-line pt-3 text-[11.5px] font-semibold text-navy">
                Parameter perhitungan
              </p>
              <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3">
                {paramFields.map((f) => (
                  <IsianParameter key={`${kode}-${f.name}`} f={f} nilai={pNilai[f.name]} />
                ))}
              </div>
            </>
          )}

          {detailFields.length > 0 && (
            <>
              <p className="mt-5 border-t border-line pt-3 text-[11.5px] font-semibold text-navy">
                Detail kegiatan
              </p>
              <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3">
                {detailFields.map((f) => (
                  <div key={`${kode}-${f.name}`}>
                    <label htmlFor={`d_${f.name}`} className={labelCls}>
                      {f.label}
                    </label>
                    <input
                      id={`d_${f.name}`}
                      name={`d_${f.name}`}
                      type={f.type === "date" ? "date" : f.type === "number" ? "number" : "text"}
                      min={f.type === "number" ? 0 : undefined}
                      defaultValue={dNilai[f.name] ?? undefined}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line px-4 py-3">
        {halangan && <p className="mr-auto text-[11px] leading-snug text-danger">{halangan}</p>}
        <SubmitButton
          disabled={Boolean(halangan)}
          icon={editMode ? <IconSave size={13} /> : <IconCalc size={13} />}
          labelProses="Menghitung SKS…"
          title={halangan ?? undefined}
        >
          {editMode ? "Hitung Ulang SKS & Simpan" : "Simpan Kegiatan"}
        </SubmitButton>
      </div>
    </form>
  );
}

function IsianParameter({ f, nilai }: { f: FieldSkema; nilai?: any }) {
  const id = `p_${f.name}`;
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {f.label} {f.required && <span className="text-danger">*</span>}
      </label>
      {f.type === "number" ? (
        <input
          id={id}
          name={id}
          type="number"
          min={0}
          required={f.required}
          defaultValue={nilai ?? undefined}
          className={inputCls}
        />
      ) : f.type === "boolean" ? (
        <select
          id={id}
          name={id}
          defaultValue={nilai === undefined ? "true" : String(nilai)}
          className={inputCls}
        >
          <option value="true">Ya</option>
          <option value="false">Tidak</option>
        </select>
      ) : f.type === "select" ? (
        <select
          id={id}
          name={id}
          required={f.required}
          defaultValue={nilai ?? undefined}
          className={inputCls}
        >
          {(f.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o.replace(/_/g, " / ")}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={id}
          required={f.required}
          defaultValue={nilai ?? undefined}
          className={inputCls}
        />
      )}
    </div>
  );
}
