import Link from "next/link";
import DataTable from "./DataTable";
import PratinjauPdf from "./PratinjauPdf";
import SubmitButton from "./SubmitButton";
import { adalahPdf, tampilNilai } from "../lib/tampilNilai";
import { uploadBukti, hapusBukti } from "../app/dosen/_shared/buktiActions";
import { IconUpload, IconBack } from "./Icons";

const inputCls =
  "w-full rounded-lg border border-line px-3.5 py-2.5 text-xs outline-none placeholder:text-crumb focus:border-primary";

const fmt = (d: Date) =>
  new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(d);

/**
 * Detail kegiatan + daftar bukti + form upload.
 * @param returnTo path untuk balik + revalidate + flash (mis. halaman LKD)
 * @param canUpload jika false, form upload disembunyikan (di luar masa pengisian / terkunci)
 */
export default function BuktiKegiatanDetail({
  kegiatan,
  returnTo,
  backHref,
  canUpload = true,
}: {
  kegiatan: any;
  returnTo: string;
  backHref: string;
  canUpload?: boolean;
}) {
  const p: any = kegiatan.parameter ?? {};
  const d: any = kegiatan.detail_kegiatan ?? {};
  // PDF surat tugas/SK yang dilampirkan otomatis saat admin menerapkan unggahan
  // bukan artefak dosen — dikenali dari berkas sumber unggahannya (aturan yang
  // sama dipakai saat melampirkan), lalu tidak ikut didaftar di sini.
  const suratSumber: string | null = kegiatan.unggahan_dokumen?.file_url ?? null;
  const dokumen = kegiatan.dokumen_kegiatan.filter(
    (dok: any) => !suratSumber || dok.file_url !== suratSumber
  );
  const fields: any[] = (kegiatan.referensi_kegiatan.skema_parameter as any)?.fields ?? [];

  const info: [string, string][] = [
    ["Rubrik", "Pelaksanaan Pendidikan"],
    ["Kegiatan", kegiatan.referensi_kegiatan.nama_kegiatan],
    ["Nama Kegiatan", kegiatan.judul],
    ["No. SK Kegiatan", d.no_sk ?? "-"],
    ["Tgl. SK Kegiatan", d.tgl_sk ?? "-"],
    ...(d.kelas ? ([["Kelas", d.kelas]] as [string, string][]) : []),
    ...fields
      .filter((f) => p[f.name] !== undefined)
      .map((f) => [f.label, tampilNilai(p[f.name], f.type)] as [string, string]),
    [
      "SKS BKD (hasil kontrak)",
      kegiatan.sks_dihitung_x100 != null ? (kegiatan.sks_dihitung_x100 / 100).toFixed(2) : "-",
    ],
  ];

  return (
    <>
      <div className="overflow-hidden rounded-[10px] border border-line">
        {info.map(([label, value], i) => (
          <div
            key={label + i}
            className={`flex px-4 py-3.5 text-[11.5px] ${i % 2 === 1 ? "bg-zebra" : ""} ${
              i > 0 ? "border-t border-head-bg" : ""
            }`}
          >
            <span className="w-52 shrink-0 font-medium text-[#3a4a5f]">{label}</span>
            <span className="mr-3 text-[#3a4a5f]">:</span>
            <span className="text-muted">{value}</span>
          </div>
        ))}
      </div>

      <h2 className="mt-5 text-[13px] font-semibold text-navy">Artefak yang Anda unggah</h2>

      {dokumen.length === 0 ? (
        <div className="mt-2 rounded-lg bg-danger-soft px-4 py-4 text-xs font-medium text-danger">
          Belum ada artefak yang Anda unggah
        </div>
      ) : (
        <div className="mt-2">
          <DataTable
            columns={[
              { label: "No", width: "45px" },
              { label: "Nama Dokumen" },
              { label: "Jenis", width: "180px" },
              { label: "Keterangan", width: "200px" },
              { label: "Tanggal Upload", width: "130px" },
              { label: "Aksi", width: "150px" },
            ]}
          >
            {dokumen.map((dok: any, i: number) => (
              <tr key={dok.id_dokumen}>
                <td>{i + 1}</td>
                <td>
                  {dok.nama_dokumen}
                  {dok.nama_file && <span className="block text-[10px] text-crumb">{dok.nama_file}</span>}
                </td>
                <td>{dok.jenis_dokumen}</td>
                <td>{dok.keterangan ?? "-"}</td>
                <td>{fmt(dok.tanggal_upload)}</td>
                <td>
                  <div className="flex gap-2">
                    {dok.file_url &&
                      (adalahPdf(dok) ? (
                        <PratinjauPdf
                          url={dok.file_url}
                          judul={dok.nama_dokumen}
                          className="rounded-md bg-primary-soft px-3 py-1.5 text-[10.5px] font-medium text-primary"
                        >
                          Lihat
                        </PratinjauPdf>
                      ) : (
                        <a
                          href={dok.file_url}
                          target="_blank"
                          className="rounded-md bg-primary-soft px-3 py-1.5 text-[10.5px] font-medium text-primary"
                        >
                          Lihat
                        </a>
                      ))}
                    {canUpload && (
                      <form action={hapusBukti}>
                        <input type="hidden" name="id_dokumen" value={dok.id_dokumen} />
                        <input type="hidden" name="return_to" value={returnTo} />
                        <SubmitButton
                          variant="danger"
                          className="!px-3 !py-1.5 !text-[10.5px]"
                          labelProses="Menghapus…"
                          judulKonfirmasi="Hapus dokumen bukti?"
                          konfirmasi={`"${dok.nama_dokumen}" akan dihapus dari kegiatan ini.`}
                        >
                          Hapus
                        </SubmitButton>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        </div>
      )}

      {canUpload && (
        <form
          id="unggah-bukti"
          action={uploadBukti}
          className="mt-6 scroll-mt-6 rounded-[10px] border border-line p-6"
        >
          <h2 className="text-[13px] font-semibold text-navy">Upload Dokumen Bukti</h2>
          <input type="hidden" name="id_kegiatan" value={kegiatan.id_kegiatan} />
          <input type="hidden" name="return_to" value={returnTo} />

          <div className="mt-5 grid grid-cols-[180px_1fr] items-start gap-y-4">
            <label className="pt-2.5 text-[11.5px] font-medium text-cell">
              Nama Dokumen <span className="text-danger">*</span>
            </label>
            <input name="nama_dokumen" required placeholder={`cth: Bukti ${kegiatan.judul}`} className={inputCls} />

            <label className="pt-2.5 text-[11.5px] font-medium text-cell">Keterangan</label>
            <textarea name="keterangan" rows={3} placeholder="Keterangan tambahan (opsional)" className={inputCls} />

            <label className="pt-2.5 text-[11.5px] font-medium text-cell">
              Jenis Dokumen <span className="text-danger">*</span>
            </label>
            <select name="jenis_dokumen" required className={`${inputCls} max-w-md bg-white`}>
              <option value="">- Pilih -</option>
              <option>Berita Acara Perkuliahan</option>
              <option>Daftar Hadir</option>
              <option>RPS</option>
              <option>SK Penugasan</option>
              <option>Sertifikat</option>
              <option>Bukti Lainnya</option>
            </select>

            <label className="pt-2.5 text-[11.5px] font-medium text-cell">
              File / Tautan <span className="text-danger">*</span>
            </label>
            <div className="space-y-3">
              <input
                type="file"
                name="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="block max-w-md text-xs text-muted file:mr-3 file:rounded-md file:border-0 file:bg-primary-soft file:px-3 file:py-2 file:text-[10.5px] file:font-medium file:text-primary"
              />
              <p className="text-[10.5px] text-crumb">
                atau tempel tautan dokumen (Google Drive, dsb.) — maksimal file 10 MB
              </p>
              <input name="tautan" placeholder="https://…" className={inputCls} />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <SubmitButton
              className="!px-5 !py-2.5 !text-xs"
              icon={<IconUpload size={13} />}
              labelProses="Mengunggah…"
            >
              Upload Dokumen
            </SubmitButton>
          </div>
        </form>
      )}

      <div className="mt-5">
        <Link href={backHref} className="inline-block rounded-lg bg-head-bg px-4 py-2.5 text-xs font-medium text-muted">
          <span className="inline-flex items-center gap-1.5"><IconBack size={11}/> Kembali</span>
        </Link>
      </div>
    </>
  );
}
