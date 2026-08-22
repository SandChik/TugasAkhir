"use client";

import { useState } from "react";
import { IconAlert, IconChevronLeft, IconChevronRight } from "./Icons";

export type SeksiPenilaian = {
  key: string;
  letter: string;
  judul: string;
  jumlah: number;
  dinilai: number;
  temuan: number;
  isi: React.ReactNode;
};

const navCls =
  "inline-flex max-w-[46%] items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[11px] font-medium text-cell transition-colors hover:border-primary hover:text-primary";

/**
 * Penilaian dipecah per seksi LKD: hanya satu seksi yang tampil sehingga asesor
 * mengisi satu tabel pendek, bukan sebelas tabel sekaligus.
 *
 * Seksi non-aktif tetap dirender (disembunyikan lewat `display:none`, bukan
 * di-unmount) supaya seluruh input tetap ikut terkirim sekali submit form.
 */
export default function PenilaianPerSeksi({ seksi }: { seksi: SeksiPenilaian[] }) {
  const pertamaTerisi = seksi.findIndex((s) => s.jumlah > 0);
  const [aktif, setAktif] = useState(pertamaTerisi < 0 ? 0 : pertamaTerisi);
  const kini = seksi[aktif];
  const sebelum = aktif > 0 ? seksi[aktif - 1] : null;
  const sesudah = aktif < seksi.length - 1 ? seksi[aktif + 1] : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[248px_minmax(0,1fr)]">
      <nav aria-label="Seksi penilaian" className="self-start lg:sticky lg:top-4">
        <ul className="overflow-hidden rounded-[10px] border border-line">
          {seksi.map((s, i) => {
            const dipilih = i === aktif;
            const kosong = s.jumlah === 0;
            return (
              <li key={s.key} className="border-t border-line first:border-t-0">
                <button
                  type="button"
                  onClick={() => setAktif(i)}
                  aria-current={dipilih ? "true" : undefined}
                  className={`flex w-full items-start gap-2 px-2.5 py-2 text-left transition-colors ${
                    dipilih ? "bg-primary-soft" : "bg-white hover:bg-head-bg"
                  }`}
                >
                  <span
                    className={`flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded text-[9.5px] font-semibold ${
                      dipilih
                        ? "bg-primary text-white"
                        : kosong
                          ? "bg-head-bg text-crumb"
                          : "bg-head-bg text-head-tx"
                    }`}
                  >
                    {s.letter}
                  </span>
                  <span
                    className={`line-clamp-2 flex-1 text-[10.5px] leading-tight ${
                      dipilih ? "font-medium text-primary" : kosong ? "text-crumb" : "text-cell"
                    }`}
                  >
                    {s.judul}
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    {s.temuan > 0 && (
                      <span className="text-danger" title={`${s.temuan} kegiatan dengan bukti tidak sesuai`}>
                        <IconAlert size={11} />
                      </span>
                    )}
                    <span
                      className={`rounded px-1 py-px text-[9.5px] font-medium ${
                        kosong
                          ? "text-crumb"
                          : s.dinilai >= s.jumlah
                            ? "bg-[#e6f4ec] text-success-tx"
                            : "bg-head-bg text-head-tx"
                      }`}
                    >
                      {kosong ? "0" : `${s.dinilai}/${s.jumlah}`}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="min-w-0">
        <div className="rounded-[10px] border border-line">
          <div className="flex items-start justify-between gap-4 border-b border-line bg-head-bg px-4 py-2.5">
            <h2 className="text-[12px] font-semibold leading-snug text-navy">
              {kini.letter}. {kini.judul}
            </h2>
            <span className="shrink-0 text-[11px] text-muted">
              {kini.jumlah === 0
                ? "0 kegiatan"
                : `${kini.dinilai}/${kini.jumlah} kegiatan dinilai`}
            </span>
          </div>
          <div className="p-4">
            {seksi.map((s, i) => (
              <div key={s.key} className={i === aktif ? "" : "hidden"}>
                {s.isi}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          {sebelum ? (
            <button type="button" onClick={() => setAktif(aktif - 1)} className={navCls}>
              <IconChevronLeft size={11} />
              <span className="truncate">
                {sebelum.letter}. {sebelum.judul}
              </span>
            </button>
          ) : (
            <span />
          )}
          {sesudah ? (
            <button type="button" onClick={() => setAktif(aktif + 1)} className={`${navCls} ml-auto`}>
              <span className="truncate">
                {sesudah.letter}. {sesudah.judul}
              </span>
              <IconChevronRight size={11} />
            </button>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}
