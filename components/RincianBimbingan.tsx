"use client";

import { useState } from "react";
import { IconPencil } from "./Icons";
import SubmitButton from "./SubmitButton";
import { simpanDetailBimbingan } from "../app/dosen/_shared/kegiatanActions";

const inputCls =
  "w-full max-w-xl rounded-md border border-line bg-white px-2.5 py-1.5 text-[11.5px] text-cell outline-none focus:border-primary";

export type NilaiRincian = {
  judul: string;
  lokasi: string | null;
  noSk: string | null;
  tglSk: string | null;
  keterangan: string | null;
  komunal: boolean;
  jenisBimbingan: string;
  programStudi: string | null;
  semester: string;
};

const takAda = <span className="text-crumb">( Tidak ada data )</span>;
const tampil = (v: string | null) => (v && v.trim() ? v : takAda);

/**
 * Kartu rincian bimbingan dengan edit inline: tombol pensil mengubah kolom
 * nilai menjadi input di tempat, lalu disimpan lewat simpanDetailBimbingan.
 * Berlaku juga untuk kegiatan hasil ekstraksi dokumen — dosen meralat langsung.
 */
export default function RincianBimbingan({
  idKegiatan,
  slug,
  editable,
  nilai,
}: {
  idKegiatan: string;
  slug: string;
  editable: boolean;
  nilai: NilaiRincian;
}) {
  const [edit, setEdit] = useState(false);

  // [label, tampilan baca, input saat mode edit (null = baca-saja)]
  const baris: [string, React.ReactNode, React.ReactNode | null][] = [
    [
      "Judul Aktivitas Pembimbingan",
      tampil(nilai.judul),
      <input key="judul" name="judul" required defaultValue={nilai.judul} className={inputCls} />,
    ],
    [
      "Lokasi Kegiatan",
      tampil(nilai.lokasi),
      <input key="lokasi" name="lokasi" defaultValue={nilai.lokasi ?? ""} className={inputCls} />,
    ],
    [
      "Nomor SK Penugasan",
      tampil(nilai.noSk),
      <input key="no_sk" name="no_sk" defaultValue={nilai.noSk ?? ""} className={inputCls} />,
    ],
    [
      "Tanggal SK Penugasan",
      tampil(nilai.tglSk),
      <input
        key="tgl_sk"
        name="tgl_sk"
        placeholder="YYYY-MM-DD"
        defaultValue={nilai.tglSk ?? ""}
        className={inputCls}
      />,
    ],
    [
      "Keterangan Aktivitas",
      tampil(nilai.keterangan),
      <textarea
        key="keterangan"
        name="keterangan"
        rows={2}
        defaultValue={nilai.keterangan ?? ""}
        className={inputCls}
      />,
    ],
    [
      "Apakah Komunal ?",
      nilai.komunal ? "Ya" : "Tidak",
      <select
        key="komunal"
        name="komunal"
        defaultValue={nilai.komunal ? "ya" : "tidak"}
        className={`${inputCls} max-w-[160px]`}
      >
        <option value="tidak">Tidak</option>
        <option value="ya">Ya</option>
      </select>,
    ],
    ["Jenis Bimbingan", tampil(nilai.jenisBimbingan), null],
    [
      "Program Studi Mahasiswa",
      tampil(nilai.programStudi),
      <input
        key="program_studi"
        name="program_studi"
        defaultValue={nilai.programStudi ?? ""}
        className={inputCls}
      />,
    ],
    ["Semester", tampil(nilai.semester), null],
  ];

  const kartu = (
    <div className="relative overflow-hidden rounded-[10px] border border-line">
      {editable && !edit && (
        <button
          type="button"
          onClick={() => setEdit(true)}
          title="Ubah rincian"
          className="absolute right-3 top-3 rounded-md bg-warning-deep p-1.5 text-white hover:opacity-90"
        >
          <IconPencil size={11} />
        </button>
      )}

      {baris.map(([label, baca, input], i) => (
        <div
          key={label}
          className={`flex items-center px-4 py-3 text-[11.5px] ${i % 2 === 1 ? "bg-zebra" : ""} ${
            i > 0 ? "border-t border-head-bg" : ""
          }`}
        >
          <span className="w-64 shrink-0 font-medium text-[#3a4a5f]">{label}</span>
          <span className="flex-1 text-muted">{edit && input ? input : baca}</span>
        </div>
      ))}

      {edit && (
        <div className="flex justify-end gap-2 border-t border-line bg-head-bg px-4 py-3">
          <button
            type="button"
            onClick={() => setEdit(false)}
            className="rounded-lg border border-line bg-white px-4 py-2 text-[11.5px] font-medium text-muted"
          >
            Batal
          </button>
          <SubmitButton className="!px-4 !py-2 !text-[11.5px]" labelProses="Menyimpan…">
            Simpan
          </SubmitButton>
        </div>
      )}
    </div>
  );

  if (!edit) return kartu;
  return (
    <form action={simpanDetailBimbingan}>
      <input type="hidden" name="id_kegiatan" value={idKegiatan} />
      <input type="hidden" name="slug" value={slug} />
      {kartu}
    </form>
  );
}
