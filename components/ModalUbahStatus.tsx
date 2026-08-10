"use client";

import { useRef } from "react";
import { IconPencil } from "./Icons";
import SubmitButton from "./SubmitButton";

/**
 * Modal "Ubah Status Kegiatan" sesuai mockup Figma: dosen menyimpan status
 * capaian per kegiatan secara SEMENTARA (draft) — nilainya boleh diubah lagi
 * kapan pun sampai laporan dikunci lewat Simpan Permanen.
 */
export default function ModalUbahStatus({
  aksi,
  idKegiatan,
  idLkd,
  judul,
  capaian,
  opsi,
}: {
  aksi: (formData: FormData) => void;
  idKegiatan: string;
  idLkd: string;
  judul: string;
  capaian: string;
  /** [value, label] status capaian — dikirim dari server agar tetap satu sumber */
  opsi: [string, string][];
}) {
  const dlg = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        title="Ubah status kegiatan"
        onClick={() => dlg.current?.showModal()}
        className="rounded-md bg-warning-deep p-1.5 text-white hover:opacity-90"
      >
        <IconPencil size={11} />
      </button>

      <dialog
        ref={dlg}
        className="w-[min(600px,92vw)] rounded-[10px] p-0 shadow-xl backdrop:bg-black/50"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h3 className="text-[13.5px] font-semibold text-navy">Ubah Status Kegiatan</h3>
          <button
            type="button"
            aria-label="Tutup"
            onClick={() => dlg.current?.close()}
            className="text-[15px] leading-none text-muted hover:text-navy"
          >
            ✕
          </button>
        </div>

        <form action={aksi} className="px-6 py-5">
          <input type="hidden" name="id_kegiatan" value={idKegiatan} />
          <input type="hidden" name="id_lkd" value={idLkd} />

          <div className="grid grid-cols-[110px_1fr] items-start gap-x-4 gap-y-4 text-[11.5px]">
            <span className="pt-0.5 font-medium text-cell">
              Judul
              <br />
              Kegiatan
            </span>
            <span className="pt-0.5 text-muted">{judul}</span>

            <label htmlFor={`status-${idKegiatan}`} className="pt-2 font-medium text-cell">
              Status
            </label>
            <select
              id={`status-${idKegiatan}`}
              name="capaian"
              defaultValue={capaian}
              required
              className="rounded-md border border-line bg-white px-3 py-2 text-[11.5px] outline-none focus:border-primary"
            >
              <option value="" disabled hidden>
                Pilih status
              </option>
              {opsi.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-7 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => dlg.current?.close()}
              className="rounded-lg bg-head-bg px-5 py-2 text-[11.5px] font-medium text-muted hover:text-navy"
            >
              Tutup
            </button>
            <SubmitButton
              className="!bg-success-deep !px-5 !py-2 !text-[11.5px]"
              labelProses="Menyimpan…"
            >
              Simpan
            </SubmitButton>
          </div>
        </form>
      </dialog>
    </>
  );
}
