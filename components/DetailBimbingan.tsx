import { jenisBimbingan } from "../lib/kolomKategori";
import { IconUsers } from "./Icons";
import RincianBimbingan from "./RincianBimbingan";

/**
 * Detail Bimbingan Mahasiswa sesuai frame Figma 83:2:
 * kartu rincian label-nilai (edit inline via tombol pensil) + tabel
 * "Dosen Pembimbing" + tabel "Mahasiswa yang dibimbing" berbilah judul navy.
 */

const teks = (v: unknown): string | null => {
  const s = v == null ? "" : String(v).trim();
  return s ? s : null;
};

function KartuTabel({ judul, children }: { judul: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[10px] border border-line">
      <div className="flex items-center gap-2 bg-navy px-4 py-3">
        <IconUsers size={14} className="text-white" />
        <h2 className="text-[12px] font-semibold text-white">{judul}</h2>
      </div>
      <table className="w-full border-collapse text-left">{children}</table>
    </section>
  );
}

const th = "border-l border-line-grid bg-head-bg px-3.5 py-2.5 text-[11px] font-medium text-head-tx first:border-l-0";
const td = "border-l border-line-grid px-3.5 py-2.5 text-[11.5px] text-cell first:border-l-0";

export default function DetailBimbingan({
  kegiatan,
  namaDosen,
  prodi,
  slug,
  editable,
}: {
  kegiatan: any;
  namaDosen: string;
  prodi: string;
  slug: string;
  editable: boolean;
}) {
  const d: any = kegiatan.detail_kegiatan ?? {};
  const p: any = kegiatan.parameter ?? {};
  const mahasiswa: any[] = Array.isArray(d.mahasiswa) ? d.mahasiswa : [];

  // Lokasi tidak selalu ada di dokumen sumber; instansi PKL jadi gantinya.
  const lokasi =
    teks(d.lokasi) ??
    teks([...new Set(mahasiswa.map((m) => m.instansi).filter(Boolean))].join(", "));
  // Isian dosen menang; bila belum ada, komunal diduga dari info kelompok.
  const komunal =
    typeof d.komunal === "boolean" ? d.komunal : mahasiswa.some((m) => m.kelompok);
  const urutanPromotor =
    p.peran === "PembimbingPendamping" || d.peran_pembimbing === "Pembimbing Pendamping" ? 2 : 1;

  return (
    <div className="space-y-5">
      <RincianBimbingan
        idKegiatan={kegiatan.id_kegiatan}
        slug={slug}
        editable={editable}
        nilai={{
          judul: kegiatan.judul ?? "",
          lokasi,
          noSk: teks(d.no_sk),
          tglSk: teks(d.tgl_sk),
          keterangan: teks(d.keterangan),
          komunal,
          jenisBimbingan: jenisBimbingan(kegiatan),
          programStudi: teks(d.program_studi) ?? teks(prodi),
          semester: teks(kegiatan.lkd?.periode_bkd?.nama_periode) ?? "-",
        }}
      />

      <KartuTabel judul="Dosen Pembimbing">
        <thead>
          <tr>
            <th className={`${th} w-12 text-center`}>No.</th>
            <th className={`${th} text-center`}>Nama Dosen</th>
            <th className={`${th} text-center`}>Kategori Kegiatan</th>
            <th className={`${th} w-36 text-center`}>Urutan Promotor</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-line">
            <td className={`${td} text-center`}>1</td>
            <td className={`${td} text-center`}>{namaDosen}</td>
            <td className={`${td} text-center`}>{kegiatan.referensi_kegiatan?.nama_kegiatan ?? "-"}</td>
            <td className={`${td} text-center`}>{urutanPromotor}</td>
          </tr>
        </tbody>
      </KartuTabel>

      <KartuTabel judul="Mahasiswa yang dibimbing">
        <thead>
          <tr>
            <th className={`${th} w-12`}>No.</th>
            <th className={th}>Nama Mahasiswa</th>
            <th className={`${th} w-40`}>Peran</th>
          </tr>
        </thead>
        <tbody>
          {mahasiswa.length === 0 ? (
            <tr className="border-t border-line">
              <td colSpan={3} className={`${td} text-center text-crumb`}>
                ( Tidak ada data mahasiswa pada dokumen sumber )
              </td>
            </tr>
          ) : (
            mahasiswa.map((m, i) => (
              <tr key={`${m.nim ?? m.nama}-${i}`} className="border-t border-line">
                <td className={td}>{i + 1}</td>
                <td className={td}>
                  {teks(m.nama) ?? <span className="text-crumb">( Tidak ada data )</span>}
                  {m.nim && <span className="block text-[10px] text-crumb">NIPD: {m.nim}</span>}
                </td>
                <td className={td}>{m.kelompok ? `Kelompok ${m.kelompok}` : "Individu/Mandiri"}</td>
              </tr>
            ))
          )}
        </tbody>
      </KartuTabel>
    </div>
  );
}
