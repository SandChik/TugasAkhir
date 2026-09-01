import Link from "next/link";
import { prisma } from "../lib/prisma";
import { tambahKegiatan, ubahKegiatan } from "../app/dosen/_shared/kegiatanActions";
import { DETAIL_FIELDS } from "../lib/kolomKategori";
import { fieldFormulir } from "../lib/parameterKegiatan";
import { labelOpsi } from "../lib/tampilNilai";
import { IconCalc, IconBack, IconSave } from "./Icons";

const inputCls =
  "w-full rounded-lg border border-line px-3.5 py-2.5 text-xs outline-none placeholder:text-crumb focus:border-primary";

/**
 * Form tambah/edit kegiatan: field digenerate dari skema_parameter referensi,
 * field detail (kolom tabel Figma) dari DETAIL_FIELDS, nilai SKS dihitung
 * otomatis oleh smart contract saat disimpan.
 */
export default async function TambahKegiatanForm({
  slug,
  kodeRules,
  selectedKode,
  kegiatan,
}: {
  slug: string;
  kodeRules: string[];
  selectedKode?: string;
  /** Bila diisi → mode edit: chips referensi disembunyikan, nilai lama jadi default. */
  kegiatan?: any;
}) {
  const referensi = await prisma.referensi_kegiatan.findMany({
    where: { kode_rule: { in: kodeRules } },
    orderBy: { kode_rule: "asc" },
  });

  const editMode = Boolean(kegiatan);
  const selected = editMode
    ? referensi.find((r: any) => r.id_referensi === kegiatan.id_referensi) ?? null
    : referensi.find((r: any) => r.kode_rule === selectedKode) ?? referensi[0] ?? null;

  const fields: any[] = selected ? ((selected.skema_parameter as any)?.fields ?? []) : [];
  // Parameter yang nilainya ditentukan periode (jumlahSemester) tidak ditanyakan.
  const fieldsIsian = fieldFormulir(fields);
  const detailFields = DETAIL_FIELDS[slug] ?? [];
  const dNilai: any = editMode ? (kegiatan.detail_kegiatan ?? {}) : {};
  const pNilai: any = editMode ? (kegiatan.parameter ?? {}) : {};

  return (
    <div className="max-w-3xl">
      {/* pilih jenis kegiatan (hanya mode tambah) */}
      {!editMode && (
        <>
          <p className="text-[11.5px] font-medium text-cell">Jenis Kegiatan (Rubrik BKD 2021)</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {referensi.map((r: any) => (
              <Link
                key={r.kode_rule}
                href={`/dosen/${slug}/tambah?ref=${r.kode_rule}`}
                className={`rounded-lg border px-3 py-2 text-[11px] ${
                  selected?.kode_rule === r.kode_rule
                    ? "border-primary bg-primary-soft font-medium text-primary"
                    : "border-line text-muted hover:border-primary"
                }`}
              >
                {r.kode_rule} — {r.nama_kegiatan.slice(0, 48)}
                {r.nama_kegiatan.length > 48 ? "…" : ""}
              </Link>
            ))}
          </div>
        </>
      )}

      {editMode && selected && (
        <p className="text-[11.5px] text-muted">
          Jenis kegiatan: <b className="text-cell">{selected.kode_rule} — {selected.nama_kegiatan}</b>
        </p>
      )}

      {selected && (
        <form
          action={editMode ? ubahKegiatan : tambahKegiatan}
          className="mt-5 rounded-[10px] border border-line p-6"
        >
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="kode_rule" value={selected.kode_rule} />
          {editMode && <input type="hidden" name="id_kegiatan" value={kegiatan.id_kegiatan} />}

          <div className="grid grid-cols-[190px_1fr] items-start gap-y-4">
            <label className="pt-2.5 text-[11.5px] font-medium text-cell">
              Nama Kegiatan <span className="text-danger">*</span>
            </label>
            <input
              name="judul"
              required
              defaultValue={editMode ? kegiatan.judul : undefined}
              placeholder="cth: Modul Praktikum Basis Data"
              className={inputCls}
            />

            <label className="pt-2.5 text-[11.5px] font-medium text-cell">No. SK</label>
            <input
              name="no_sk"
              defaultValue={dNilai.no_sk ?? undefined}
              placeholder="Opsional"
              className={`${inputCls} max-w-xs`}
            />

            <label className="pt-2.5 text-[11.5px] font-medium text-cell">Tgl. SK</label>
            <input
              name="tgl_sk"
              type="date"
              defaultValue={dNilai.tgl_sk ?? undefined}
              className={`${inputCls} max-w-xs`}
            />

            {fieldsIsian.map((f: any) => (
              <FieldInput key={f.name} f={f} nilai={pNilai[f.name]} />
            ))}
          </div>

          {detailFields.length > 0 && (
            <>
              <p className="mt-6 border-t border-line pt-4 text-[11.5px] font-semibold text-navy">
                Detail Kegiatan
              </p>
              <div className="mt-3 grid grid-cols-[190px_1fr] items-start gap-y-4">
                {detailFields.map((f) => (
                  <DetailInput key={f.name} f={f} nilai={dNilai[f.name]} />
                ))}
              </div>
            </>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Link
              href={`/dosen/${slug}`}
              className="rounded-lg bg-head-bg px-4 py-2.5 text-xs font-medium text-muted"
            >
              <span className="inline-flex items-center gap-1.5"><IconBack size={11}/> Batal</span>
            </Link>
            <button className="rounded-lg bg-primary px-5 py-2.5 text-xs font-medium text-white">
              {editMode ? (
                <span className="inline-flex items-center gap-2"><IconSave size={13}/> Hitung Ulang SKS &amp; Simpan Perubahan</span>
              ) : (
                <span className="inline-flex items-center gap-2"><IconCalc size={13}/> Hitung SKS via Smart Contract &amp; Simpan</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function FieldInput({ f, nilai }: { f: any; nilai?: any }) {
  return (
    <>
      <label className="pt-2.5 text-[11.5px] font-medium text-cell">
        {f.label} {f.required && <span className="text-danger">*</span>}
      </label>
      {f.type === "number" ? (
        <input
          name={`p_${f.name}`}
          type="number"
          min={0}
          required={f.required}
          defaultValue={nilai ?? undefined}
          className={`${inputCls} max-w-xs`}
        />
      ) : f.type === "boolean" ? (
        <select
          name={`p_${f.name}`}
          className={`${inputCls} max-w-xs bg-white`}
          defaultValue={nilai === undefined ? "true" : String(nilai)}
        >
          <option value="true">Ya</option>
          <option value="false">Tidak</option>
        </select>
      ) : f.type === "select" ? (
        <select
          name={`p_${f.name}`}
          required={f.required}
          defaultValue={nilai ?? undefined}
          className={`${inputCls} max-w-sm bg-white`}
        >
          {(f.options ?? []).map((o: string) => (
            <option key={o} value={o}>
              {labelOpsi(o)}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={`p_${f.name}`}
          required={f.required}
          defaultValue={nilai ?? undefined}
          className={inputCls}
        />
      )}
    </>
  );
}

function DetailInput({ f, nilai }: { f: { name: string; label: string; type: string }; nilai?: any }) {
  const sempit = f.type === "date" || f.type === "number";
  return (
    <>
      <label className="pt-2.5 text-[11.5px] font-medium text-cell">{f.label}</label>
      <input
        name={`d_${f.name}`}
        type={f.type === "date" ? "date" : f.type === "number" ? "number" : "text"}
        min={f.type === "number" ? 0 : undefined}
        defaultValue={nilai ?? undefined}
        className={`${inputCls} ${sempit ? "max-w-xs" : "max-w-sm"}`}
      />
    </>
  );
}
