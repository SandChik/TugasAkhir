"use client";

import { useState } from "react";
import StatusChip from "./StatusChip";
import SubmitButton from "./SubmitButton";
import PratinjauPdf from "./PratinjauPdf";
import { IconChevronRight, IconDoc } from "./Icons";
import { periksaBukti, accVerifikasiBukti } from "../app/asesor/penilaian/[id]/actions";

/** Label enum peran parser -> sebutan baku aplikasi. */
const PERAN_LABEL: Record<string, string> = {
  pembimbing_1: "Pembimbing Utama",
  pembimbing_2: "Pembimbing Pendamping",
  pembimbing: "Pembimbing",
  penguji: "Penguji",
  koordinator: "Koordinator",
  ketua_program_studi: "Ketua Program Studi",
  ketua_jurusan: "Ketua Jurusan",
  direktur: "Direktur",
  pembina: "Pembina",
  pengaju: "Pengaju (mahasiswa)",
  mengetahui: "Mengetahui",
  lainnya: "Lainnya",
};

/**
 * Sebutan baku: Pembimbing I/1 = Pembimbing Utama, Pembimbing II/2 =
 * Pembimbing Pendamping. Tulisan asli dokumen tetap ditampilkan sebagai
 * keterangan bila berbeda dari sebutan bakunya.
 */
function labelPeran(o: { peran: string | null; peran_asli: string | null }): string {
  const asli = (o.peran_asli ?? "").trim();
  const baku =
    /^pembimbing\s*(i|1)$/i.test(asli)
      ? "Pembimbing Utama"
      : /^pembimbing\s*(ii|2)$/i.test(asli)
        ? "Pembimbing Pendamping"
        : o.peran
          ? PERAN_LABEL[o.peran] ?? o.peran
          : asli || "-";
  return asli && baku.toLowerCase() !== asli.toLowerCase() ? `${baku} ("${asli}")` : baku;
}

function ChipVerifikasi({ v }: { v: any }) {
  if (!v) return <span className="text-crumb">belum diperiksa</span>;
  if (v.acc) return <StatusChip label="Di-ACC asesor" variant="success" />;
  if (v.status === "cocok") return <StatusChip label="Nama sesuai" variant="success" />;
  if (v.status === "peran_tidak_sesuai")
    return <StatusChip label="Peran tidak sesuai" variant="danger" />;
  if (v.status === "tidak_cocok") return <StatusChip label="Nama tidak sesuai" variant="danger" />;
  if (v.status === "tanpa_nama") return <StatusChip label="Nama tidak terbaca" variant="warning" />;
  return <StatusChip label="Pemeriksaan gagal" variant="neutral" />;
}

/**
 * Baris tabel Dokumen Pendukung asesor + baris detail verifikasi nama yang
 * bisa dibentangkan (expand) dari kolom Verifikasi Nama. Panel detail memuat
 * nama-nama yang terbaca parser VLM beserta PERAN masing-masing di dokumen.
 */
export default function BarisDokumenBukti({
  no,
  namaDokumen,
  namaFile,
  suratAdmin,
  fileUrl,
  pdf,
  waktuUnggah,
  waktuPeriksa,
  verifikasi,
  bisaPeriksa,
  namaAkun,
  idPenugasan,
  idKegiatan,
  idDokumen,
}: {
  no: number;
  namaDokumen: string;
  namaFile: string | null;
  suratAdmin: boolean;
  fileUrl: string | null;
  pdf: boolean;
  waktuUnggah: string;
  waktuPeriksa: string | null;
  verifikasi: any;
  bisaPeriksa: boolean;
  namaAkun: string;
  idPenugasan: string;
  idKegiatan: string;
  idDokumen: string;
}) {
  const [buka, setBuka] = useState(false);
  const v = verifikasi;
  const adaDetail = Boolean(v) || bisaPeriksa;

  // Data lama (sebelum peran disimpan) tetap tampil: nama tanpa kolom peran terisi.
  const orang: { nama: string; peran: string | null; peran_asli: string | null }[] =
    v?.orang_terdeteksi ??
    (v?.nama_terdeteksi ?? []).map((n: string) => ({ nama: n, peran: null, peran_asli: null }));

  return (
    <>
      <tr>
        <td>{no}</td>
        <td>
          {namaDokumen}
          {suratAdmin && (
            <span className="ml-1.5 inline-block rounded bg-head-bg px-1.5 py-0.5 text-[9px] font-medium text-muted">
              surat tugas dari admin
            </span>
          )}
          {namaFile && <span className="block text-[10px] text-crumb">{namaFile}</span>}
        </td>
        <td>
          {!fileUrl ? (
            "-"
          ) : pdf ? (
            <PratinjauPdf
              url={fileUrl}
              judul={namaDokumen}
              className="inline-block rounded-md bg-primary px-2.5 py-1.5 text-[10.5px] font-medium text-white"
            >
              <IconDoc size={12} />
            </PratinjauPdf>
          ) : (
            <a
              href={fileUrl}
              target="_blank"
              className="inline-block rounded-md bg-primary px-2.5 py-1.5 text-[10.5px] font-medium text-white"
            >
              <IconDoc size={12} />
            </a>
          )}
        </td>
        <td>
          <div className="flex items-center gap-2">
            <ChipVerifikasi v={v} />
            {adaDetail && !suratAdmin && (
              <button
                type="button"
                onClick={() => setBuka(!buka)}
                aria-expanded={buka}
                title={buka ? "Tutup detail verifikasi" : "Detail verifikasi"}
                className="inline-flex items-center rounded-md border border-line bg-white p-1.5 text-muted hover:text-navy"
              >
                <IconChevronRight
                  size={12}
                  className={`transition-transform ${buka ? "-rotate-90" : "rotate-90"}`}
                />
              </button>
            )}
          </div>
        </td>
        <td className="!text-muted">diunggah pada tgl {waktuUnggah}</td>
      </tr>

      {buka && (
        <tr>
          <td colSpan={5} className="!bg-zebra !px-5 !py-4">
            <p className="text-[11.5px] font-semibold text-navy">Verifikasi Nama Dosen</p>
            <p className="mt-0.5 text-[10.5px] text-muted">
              Pemilik laporan: <b className="text-cell">{namaAkun}</b>
              {v?.peran_diharapkan && (
                <> · peran diklaim: <b className="text-cell">{v.peran_diharapkan}</b></>
              )}
              {v?.jenis_dokumen && <> · {v.jenis_dokumen}</>}
              {waktuPeriksa && <> · diperiksa {waktuPeriksa}</>}
            </p>
            {v?.status === "peran_tidak_sesuai" && (
              <p className="mt-1.5 rounded-md bg-danger-soft px-3 py-2 text-[10.5px] font-medium leading-snug text-danger">
                Kegiatan ini diklaim sebagai <b>{v.peran_diharapkan}</b>, tetapi pada dokumen{" "}
                <b>{v.nama_cocok}</b> tertulis sebagai &ldquo;{v.peran_terdeteksi}&rdquo; — periksa
                kesesuaian klaim sebelum menilai.
              </p>
            )}
            {v?.acc && (
              <p className="mt-1.5 rounded-md bg-[#e6f4ec] px-3 py-2 text-[10.5px] leading-snug text-success-tx">
                <b>Di-ACC</b> oleh {v.acc.oleh} pada{" "}
                {new Date(v.acc.pada).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                — penanda ketidaksesuaian diabaikan.
              </p>
            )}

            {!v ? (
              <p className="mt-3 text-[11px] text-muted">Belum diperiksa.</p>
            ) : v.status === "gagal" ? (
              <p className="mt-3 text-[11px] text-danger">
                Pemeriksaan gagal: {v.pesan ?? "kesalahan tak dikenal"}
              </p>
            ) : orang.length === 0 ? (
              <p className="mt-3 text-[11px] text-muted">
                Parser tidak menemukan nama orang pada dokumen.
              </p>
            ) : (
              <div className="mt-3 overflow-hidden rounded-lg border border-line bg-white">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-head-bg">
                      {["No", "Nama pada dokumen", "Peran di dokumen", "Kecocokan"].map((h) => (
                        <th
                          key={h}
                          className="border-l border-line-grid px-3 py-2 text-[10.5px] font-medium text-head-tx first:border-l-0"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orang.map((o, i) => (
                      <tr key={`${o.nama}-${i}`} className="border-t border-line">
                        <td className="w-10 border-l border-line-grid px-3 py-2 text-[11px] text-cell first:border-l-0">
                          {i + 1}
                        </td>
                        <td className="border-l border-line-grid px-3 py-2 text-[11px] text-cell">
                          {o.nama}
                        </td>
                        <td className="w-56 border-l border-line-grid px-3 py-2 text-[11px] text-cell">
                          {labelPeran(o)}
                        </td>
                        <td className="w-44 border-l border-line-grid px-3 py-2 text-[11px]">
                          {o.nama !== v.nama_cocok ? (
                            <span className="text-crumb">-</span>
                          ) : v.status === "peran_tidak_sesuai" ? (
                            <StatusChip label="Nama cocok, peran beda" variant="danger" />
                          ) : (
                            <StatusChip label="Cocok dengan akun" variant="success" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {bisaPeriksa && (
                <form action={periksaBukti}>
                  <input type="hidden" name="id_penugasan" value={idPenugasan} />
                  <input type="hidden" name="id_kegiatan" value={idKegiatan} />
                  <input type="hidden" name="id_dokumen" value={idDokumen} />
                  <SubmitButton
                    className="!bg-head-bg !px-3 !py-1.5 !text-[10.5px] !text-cell"
                    labelProses="Memeriksa…"
                  >
                    {v ? "Periksa ulang" : "Periksa sekarang"}
                  </SubmitButton>
                </form>
              )}
              {v && !v.acc && v.status !== "cocok" && (
                <form action={accVerifikasiBukti}>
                  <input type="hidden" name="id_penugasan" value={idPenugasan} />
                  <input type="hidden" name="id_kegiatan" value={idKegiatan} />
                  <input type="hidden" name="id_dokumen" value={idDokumen} />
                  <SubmitButton
                    className="!bg-success-deep !px-3 !py-1.5 !text-[10.5px]"
                    labelProses="Menyimpan…"
                    judulKonfirmasi="Accept pemeriksaan dokumen ini?"
                    konfirmasi="Penanda ketidaksesuaian akan diabaikan. Hasil parser tetap tersimpan dan ACC bisa dibatalkan lagi."
                    tombolKonfirmasi="Ya, ACC"
                  >
                    Accept Pemeriksaan
                  </SubmitButton>
                </form>
              )}
              {v?.acc && (
                <form action={accVerifikasiBukti}>
                  <input type="hidden" name="id_penugasan" value={idPenugasan} />
                  <input type="hidden" name="id_kegiatan" value={idKegiatan} />
                  <input type="hidden" name="id_dokumen" value={idDokumen} />
                  <input type="hidden" name="batal" value="1" />
                  <SubmitButton
                    variant="danger"
                    className="!px-3 !py-1.5 !text-[10.5px]"
                    labelProses="Menyimpan…"
                  >
                    Batalkan ACC
                  </SubmitButton>
                </form>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
