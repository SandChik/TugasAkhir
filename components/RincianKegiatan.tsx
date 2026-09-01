"use client";

import { useState } from "react";
import { IconPencil } from "./Icons";
import SubmitButton from "./SubmitButton";
import { simpanRincianKegiatan } from "../app/dosen/_shared/kegiatanActions";

/** Satu baris kartu: `input` kosong berarti baris baca-saja (nilai turunan). */
export type BarisRincian = {
  label: string;
  baca: React.ReactNode;
  input?: React.ReactNode;
};

/**
 * Kartu rincian kegiatan dengan edit inline: tombol pensil mengubah kolom nilai
 * menjadi input di tempat, lalu disimpan lewat simpanRincianKegiatan. Berlaku
 * juga untuk kegiatan hasil ekstraksi dokumen — dosen meralat langsung.
 *
 * Susunan barisnya ditentukan halaman pemanggil supaya satu kartu ini melayani
 * detail bimbingan maupun pengujian.
 */
export default function RincianKegiatan({
  idKegiatan,
  slug,
  editable,
  baris,
}: {
  idKegiatan: string;
  slug: string;
  editable: boolean;
  baris: BarisRincian[];
}) {
  const [edit, setEdit] = useState(false);

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

      {baris.map((b, i) => (
        <div
          key={b.label}
          className={`flex items-center px-4 py-3 text-[11.5px] ${i % 2 === 1 ? "bg-zebra" : ""} ${
            i > 0 ? "border-t border-head-bg" : ""
          }`}
        >
          <span className="w-64 shrink-0 font-medium text-[#3a4a5f]">{b.label}</span>
          <span className="flex-1 text-muted">{edit && b.input ? b.input : b.baca}</span>
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
    <form action={simpanRincianKegiatan}>
      <input type="hidden" name="id_kegiatan" value={idKegiatan} />
      <input type="hidden" name="slug" value={slug} />
      {kartu}
    </form>
  );
}
