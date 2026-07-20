import Link from "next/link";
import { prisma } from "../lib/prisma";
import { tambahKegiatan } from "../app/dosen/_shared/kegiatanActions";

const inputCls =
  "w-full rounded-lg border border-line px-3.5 py-2.5 text-xs outline-none placeholder:text-crumb focus:border-primary";

/**
 * Form tambah kegiatan: field digenerate dari skema_parameter referensi,
 * nilai SKS dihitung otomatis oleh smart contract saat disimpan.
 */
export default async function TambahKegiatanForm({
  slug,
  kodeRules,
  selectedKode,
}: {
  slug: string;
  kodeRules: string[];
  selectedKode?: string;
}) {
  const referensi = await prisma.referensi_kegiatan.findMany({
    where: { kode_rule: { in: kodeRules } },
    orderBy: { kode_rule: "asc" },
  });

  const selected =
    referensi.find((r: any) => r.kode_rule === selectedKode) ?? referensi[0] ?? null;
  const fields: any[] = selected ? ((selected.skema_parameter as any)?.fields ?? []) : [];

  return (
    <div className="max-w-3xl">
      {/* pilih jenis kegiatan */}
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

      {selected && (
        <form action={tambahKegiatan} className="mt-5 rounded-[10px] border border-line p-6">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="kode_rule" value={selected.kode_rule} />

          <p className="rounded bg-info-bg px-3 py-2 text-[10.5px] text-info-tx">
            {selected.fungsi_contract ? (
              <>
                Nilai SKS dihitung otomatis &amp; deterministik oleh smart contract{" "}
                <b>{selected.fungsi_contract}()</b>.
              </>
            ) : (
              <>Kegiatan ini bernilai SKS maksimum pada rubrik — dinilai langsung oleh asesor.</>
            )}
          </p>

          <div className="mt-4 grid grid-cols-[190px_1fr] items-start gap-y-4">
            <label className="pt-2.5 text-[11.5px] font-medium text-cell">
              Nama Kegiatan <span className="text-danger">*</span>
            </label>
            <input name="judul" required placeholder="cth: Matkul A / Kelas 2CTI3" className={inputCls} />

            <label className="pt-2.5 text-[11.5px] font-medium text-cell">Simpan ke</label>
            <select name="jenis_lkd" className={`${inputCls} max-w-xs bg-white`} defaultValue="laporan">
              <option value="laporan">Laporan Kinerja (LKD)</option>
              <option value="rencana">Rencana Kerja (RBKD)</option>
            </select>

            <label className="pt-2.5 text-[11.5px] font-medium text-cell">No. SK</label>
            <input name="no_sk" placeholder="Opsional" className={`${inputCls} max-w-xs`} />

            <label className="pt-2.5 text-[11.5px] font-medium text-cell">Tgl. SK</label>
            <input name="tgl_sk" type="date" className={`${inputCls} max-w-xs`} />

            {fields.map((f: any) => (
              <FieldInput key={f.name} f={f} />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Link
              href={`/dosen/${slug}`}
              className="rounded-lg bg-head-bg px-4 py-2.5 text-xs font-medium text-muted"
            >
              ← Batal
            </Link>
            <button className="rounded-lg bg-primary px-5 py-2.5 text-xs font-medium text-white">
              ⚙ Hitung SKS via Smart Contract &amp; Simpan
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function FieldInput({ f }: { f: any }) {
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
          className={`${inputCls} max-w-xs`}
        />
      ) : f.type === "boolean" ? (
        <select name={`p_${f.name}`} className={`${inputCls} max-w-xs bg-white`} defaultValue="true">
          <option value="true">Ya</option>
          <option value="false">Tidak</option>
        </select>
      ) : f.type === "select" ? (
        <select name={`p_${f.name}`} required={f.required} className={`${inputCls} max-w-sm bg-white`}>
          {(f.options ?? []).map((o: string) => (
            <option key={o} value={o}>
              {o.replace(/_/g, " / ")}
            </option>
          ))}
        </select>
      ) : (
        <input name={`p_${f.name}`} required={f.required} className={inputCls} />
      )}
    </>
  );
}
