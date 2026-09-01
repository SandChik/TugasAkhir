"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { DETAIL_FIELDS } from "../lib/kolomKategori";
import { KATEGORI_INPUT_ADMIN } from "../lib/kategoriDosen";
import { fieldFormulir } from "../lib/parameterKegiatan";
import { labelOpsi } from "../lib/tampilNilai";
import { simpanKegiatanDosen } from "../app/admin/kegiatan/actions";
import SubmitButton from "./SubmitButton";
import { IconCalc, IconPencil, IconPlus, IconSave } from "./Icons";

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
  /** LKD periode aktif sudah dikunci dosen, kegiatan baru tak bisa diklaim lagi. */
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

type Konteks = {
  dosen: DosenPilihan[];
  referensi: RefKegiatan[];
  kembali: string;
  periodeNama: string | null;
  /** `null` membuka modal tambah, isi `KegiatanAwal` membuka modal ubah. */
  buka: (awal: KegiatanAwal | null) => void;
};

const Ctx = createContext<Konteks | null>(null);

function pakaiKonteks() {
  const c = useContext(Ctx);
  if (!c) throw new Error("Tombol kegiatan harus dirender di dalam PenyediaKegiatanAdmin");
  return c;
}

const inputCls =
  "mt-1 w-full rounded-md border border-line bg-white px-2.5 py-2 text-[11.5px] text-cell outline-none placeholder:text-crumb focus:border-primary";
const labelCls = "text-[11px] font-medium text-cell";
const gridCls = "grid grid-cols-1 gap-3.5 sm:grid-cols-2";

/**
 * Satu modal dipakai bergantian untuk tambah dan ubah kegiatan admin. Daftar
 * dosen dan referensi rubrik dikirim sekali di sini, bukan per baris tabel,
 * dan isi formulir baru dipasang saat modal dibuka sehingga tabel berisi
 * ratusan baris tetap ringan.
 */
export default function PenyediaKegiatanAdmin({
  dosen,
  referensi,
  kembali,
  periodeNama,
  penanda,
  children,
}: {
  dosen: DosenPilihan[];
  referensi: RefKegiatan[];
  kembali: string;
  periodeNama: string | null;
  /** Pesan hasil aksi pada URL; berubah setelah simpan sehingga modal ditutup. */
  penanda: string;
  children: React.ReactNode;
}) {
  const [sasaran, setSasaran] = useState<{ awal: KegiatanAwal | null } | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (sasaran) dlg.current?.showModal();
  }, [sasaran]);

  useEffect(() => {
    setSasaran(null);
  }, [penanda]);

  return (
    <Ctx.Provider
      value={{ dosen, referensi, kembali, periodeNama, buka: (awal) => setSasaran({ awal }) }}
    >
      {children}

      {sasaran && (
        <dialog
          ref={dlg}
          onClose={() => setSasaran(null)}
          className="w-[min(840px,94vw)] rounded-[10px] p-0 shadow-xl backdrop:bg-black/50"
        >
          <IsiFormKegiatan awal={sasaran.awal} tutup={() => dlg.current?.close()} />
        </dialog>
      )}
    </Ctx.Provider>
  );
}

/** Tombol pembuka modal tambah, dipasang di toolbar tabel. */
export function TombolTambahKegiatan() {
  const { buka, dosen, periodeNama } = pakaiKonteks();
  const mati = !periodeNama || dosen.length === 0;

  return (
    <button
      type="button"
      disabled={mati}
      onClick={() => buka(null)}
      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-[11.5px] font-medium text-white transition-colors hover:bg-[#255cc2] disabled:cursor-not-allowed disabled:opacity-45"
    >
      <IconPlus size={12} /> Tambah Kegiatan
    </button>
  );
}

/** Tombol pembuka modal ubah pada satu baris tabel. */
export function TombolUbahKegiatan({ awal }: { awal: KegiatanAwal }) {
  const { buka } = pakaiKonteks();

  return (
    <button
      type="button"
      title="Ubah kegiatan"
      onClick={() => buka(awal)}
      className="rounded-md bg-primary-soft p-2 text-primary hover:bg-[#dde9fb]"
    >
      <IconPencil size={13} />
    </button>
  );
}

/**
 * Isi modal: field parameter dan detail mengikuti jenis kegiatan yang dipilih.
 * Komponen ini di-mount ulang tiap modal dibuka, jadi state pilihan dan seluruh
 * defaultValue selalu berangkat dari kegiatan yang sedang dibuka.
 */
function IsiFormKegiatan({ awal, tutup }: { awal: KegiatanAwal | null; tutup: () => void }) {
  const { dosen, referensi, kembali, periodeNama } = pakaiKonteks();
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
    ? "Belum ada periode BKD aktif."
    : dosen.length === 0
      ? "Belum ada akun dosen aktif."
      : dPilih?.terkunci
        ? `LKD ${dPilih.nama} sudah disimpan permanen.`
        : null;

  return (
    <form action={simpanKegiatanDosen} className="flex max-h-[86vh] flex-col">
      <div className="flex items-center justify-between border-b border-line bg-head-bg px-5 py-3">
        <h3 className="text-[13px] font-semibold text-navy">
          {editMode ? "Ubah Kegiatan Dosen" : "Catat Kegiatan Dosen"}
        </h3>
        <button
          type="button"
          aria-label="Tutup"
          onClick={tutup}
          className="text-[15px] leading-none text-muted hover:text-navy"
        >
          ✕
        </button>
      </div>

      <input type="hidden" name="kembali" value={kembali} />
      {editMode && <input type="hidden" name="id_kegiatan" value={awal!.id} />}
      {editMode && <input type="hidden" name="kode_rule" value={kode} />}

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className={gridCls}>
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
              <option value="">Pilih dosen</option>
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
              Jenis kegiatan <span className="text-danger">*</span>
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
                  {r.kategori} · {r.kode_rule}
                </option>
              ))}
            </select>
          </div>
        </div>

        {ref && (
          <>
            <div className="mt-3.5">
              <label htmlFor="judul" className={labelCls}>
                Nama kegiatan <span className="text-danger">*</span>
              </label>
              <input
                id="judul"
                name="judul"
                required
                defaultValue={awal?.judul}
                placeholder="cth: Basis Data / 2CTI3"
                className={inputCls}
              />
            </div>

            <div className={`mt-3.5 ${gridCls}`}>
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
                <div className={`mt-2.5 ${gridCls}`}>
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
                <div className={`mt-2.5 ${gridCls}`}>
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
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-3">
        {halangan && <p className="mr-auto text-[11px] leading-snug text-danger">{halangan}</p>}
        <button
          type="button"
          onClick={tutup}
          className="rounded-lg border border-line bg-white px-3.5 py-2 text-[11.5px] font-medium text-muted hover:text-navy"
        >
          Batal
        </button>
        <SubmitButton
          disabled={Boolean(halangan)}
          icon={editMode ? <IconSave size={13} /> : <IconCalc size={13} />}
          labelProses="Menghitung SKS…"
          title={halangan ?? undefined}
        >
          {editMode ? "Simpan Perubahan" : "Simpan Kegiatan"}
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
              {labelOpsi(o)}
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
