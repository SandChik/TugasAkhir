import KartuTabel, { KELAS_RINCI, tampil, teks } from "./KartuTabel";
import RincianKegiatan, { type BarisRincian } from "./RincianKegiatan";

/**
 * Detail Pengujian Mahasiswa, sebangun dengan detail bimbingan: kartu rincian
 * label-nilai yang bisa diedit inline + tabel "Dosen Penguji" + tabel
 * "Mahasiswa yang diuji" dari hasil ekstraksi ST Penguji.
 */

const { th, td, input: inputCls } = KELAS_RINCI;

export default function DetailPengujian({
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

  // Kota sidang pada dokumen sumber dipakai bila dosen belum mengisi lokasi.
  const lokasi =
    teks(d.lokasi) ?? teks([...new Set(mahasiswa.map((m) => m.kota).filter(Boolean))].join(", "));
  const peranPenguji = teks(p.peranPenguji) ?? teks(d.peran_penguji);

  const judul = kegiatan.judul ?? "";
  const jenisPengujian = teks(d.jenis_pengujian);
  const bidangKeilmuan = teks(d.bidang_keilmuan);
  const noSk = teks(d.no_sk);
  const tglSk = teks(d.tgl_sk);
  const keterangan = teks(d.keterangan);
  const programStudi = teks(d.program_studi) ?? teks(prodi);
  const semester = teks(kegiatan.lkd?.periode_bkd?.nama_periode) ?? "-";

  const baris: BarisRincian[] = [
    {
      label: "Judul Aktivitas Pengujian",
      baca: tampil(judul),
      input: <input name="judul" required defaultValue={judul} className={inputCls} />,
    },
    {
      label: "Jenis Pengujian",
      baca: tampil(jenisPengujian),
      input: <input name="jenis_pengujian" defaultValue={jenisPengujian ?? ""} className={inputCls} />,
    },
    {
      label: "Bidang Keilmuan",
      baca: tampil(bidangKeilmuan),
      input: <input name="bidang_keilmuan" defaultValue={bidangKeilmuan ?? ""} className={inputCls} />,
    },
    {
      label: "Lokasi Kegiatan",
      baca: tampil(lokasi),
      input: <input name="lokasi" defaultValue={lokasi ?? ""} className={inputCls} />,
    },
    {
      label: "Nomor SK Penugasan",
      baca: tampil(noSk),
      input: <input name="no_sk" defaultValue={noSk ?? ""} className={inputCls} />,
    },
    {
      label: "Tanggal SK Penugasan",
      baca: tampil(tglSk),
      input: (
        <input
          name="tgl_sk"
          placeholder="YYYY-MM-DD"
          defaultValue={tglSk ?? ""}
          className={inputCls}
        />
      ),
    },
    {
      label: "Keterangan Aktivitas",
      baca: tampil(keterangan),
      input: (
        <textarea name="keterangan" rows={2} defaultValue={keterangan ?? ""} className={inputCls} />
      ),
    },
    {
      label: "Program Studi Mahasiswa",
      baca: tampil(programStudi),
      input: <input name="program_studi" defaultValue={programStudi ?? ""} className={inputCls} />,
    },
    { label: "Peran Penguji", baca: tampil(peranPenguji) },
    { label: "Semester", baca: tampil(semester) },
  ];

  return (
    <div className="space-y-5">
      <RincianKegiatan
        idKegiatan={kegiatan.id_kegiatan}
        slug={slug}
        editable={editable}
        baris={baris}
      />

      <KartuTabel judul="Dosen Penguji">
        <thead>
          <tr>
            <th className={`${th} w-12 text-center`}>No.</th>
            <th className={`${th} text-center`}>Nama Dosen</th>
            <th className={`${th} text-center`}>Kategori Kegiatan</th>
            <th className={`${th} w-36 text-center`}>Peran Penguji</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-line">
            <td className={`${td} text-center`}>1</td>
            <td className={`${td} text-center`}>{namaDosen}</td>
            <td className={`${td} text-center`}>
              {kegiatan.referensi_kegiatan?.nama_kegiatan ?? "-"}
            </td>
            <td className={`${td} text-center`}>{peranPenguji ?? "-"}</td>
          </tr>
        </tbody>
      </KartuTabel>

      <KartuTabel judul="Mahasiswa yang diuji">
        <thead>
          <tr>
            <th className={`${th} w-12`}>No.</th>
            <th className={`${th} w-72`}>Nama Mahasiswa</th>
            <th className={th}>Judul Tugas Akhir</th>
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
                <td className={td}>
                  {teks(m.judul) ?? <span className="text-crumb">( Tidak ada data )</span>}
                  {m.kota && <span className="block text-[10px] text-crumb">{m.kota}</span>}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </KartuTabel>
    </div>
  );
}
