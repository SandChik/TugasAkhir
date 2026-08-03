"use client";

import { useRef, useState } from "react";
import PdfCanvas from "./PdfCanvas";

/**
 * Tombol pembuka viewer PDF dalam modal. Memakai <dialog> bawaan browser,
 * jadi tombol Esc, fokus terkunci, dan backdrop sudah tersedia tanpa library.
 * Dokumen baru dimuat saat modal dibuka.
 */
export default function PratinjauPdf({
  url,
  judul,
  className = "",
  children,
}: {
  url: string;
  judul: string;
  className?: string;
  children: React.ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [buka, setBuka] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setBuka(true);
          dialog.current?.showModal();
        }}
        title={`Lihat ${judul}`}
        className={className}
      >
        {children}
      </button>

      <dialog
        ref={dialog}
        onClose={() => setBuka(false)}
        className="w-[min(980px,94vw)] rounded-[10px] p-0 backdrop:bg-black/50"
      >
        <div className="flex items-center justify-between gap-4 border-b border-line bg-head-bg px-4 py-2.5">
          <h2 className="truncate text-[12px] font-semibold text-navy">{judul}</h2>
          <div className="flex shrink-0 items-center gap-3">
            <a href={url} target="_blank" className="text-[10.5px] text-primary hover:underline">
              Unduh
            </a>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label="Tutup"
              className="rounded px-2 py-1 text-[13px] leading-none text-muted hover:bg-line"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="max-h-[80vh] overflow-y-auto bg-zebra p-3">
          {buka && <PdfCanvas url={url} />}
        </div>
      </dialog>
    </>
  );
}
