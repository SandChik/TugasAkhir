import InputBerkasPdf from "./InputBerkasPdf";

const label = "text-[11px] font-medium text-cell";
const bantuan = "mt-1.5 text-[10.5px] leading-snug text-muted";
const kolom =
  "mt-1 w-full rounded-md border border-line bg-white px-2.5 py-2 text-[11.5px] text-cell outline-none focus:border-primary";

/**
 * Isian formulir unggah: pemilih berkas PDF. Jenis dokumen selalu dideteksi
 * dari nama berkas di server, jadi tidak ada pilihan jenis di formulir.
 */
export default function FormUnggahIsian() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 py-4">
      <div>
        <label htmlFor="file" className={label}>
          Berkas PDF
        </label>
        <InputBerkasPdf
          className={`${kolom} file:mr-3 file:rounded file:border-0 file:bg-head-bg file:px-2.5 file:py-1 file:text-[10.5px] file:text-cell`}
        />

        <details className="mt-3 rounded-md border border-line bg-zebra px-3 py-2">
          <summary className="cursor-pointer text-[11px] font-medium text-cell">
            Opsi lanjutan — khusus SK Pembina Ormawa
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
      </div>
    </div>
  );
}
