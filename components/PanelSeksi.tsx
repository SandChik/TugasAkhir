"use client";

import { useState } from "react";
import { IconChevronLeft, IconChevronRight } from "./Icons";

export type SeksiPanel = {
  key: string;
  letter: string;
  judul: string;
  /** Seksi tanpa isi: huruf dan judul diredupkan di daftar seksi. */
  kosong?: boolean;
  /** Angka ringkas di kanan daftar seksi, mis. "2" atau "1/3". */
  badge?: string;
  badgeNada?: "netral" | "sukses" | "redup";
  /** Penanda tambahan di kiri badge (ikon peringatan, chip jumlah baru). */
  penanda?: React.ReactNode;
  /** Teks di kanan judul panel. */
  ringkas?: React.ReactNode;
  /** Tombol di kanan judul panel. */
  aksi?: React.ReactNode;
  isi: React.ReactNode;
};

const navCls =
  "inline-flex max-w-[46%] items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-[11px] font-medium text-cell transition-colors hover:border-primary hover:text-primary";

const badgeCls: Record<string, string> = {
  netral: "bg-head-bg text-head-tx",
  sukses: "bg-[#e6f4ec] text-success-tx",
  redup: "text-crumb",
};

/**
 * Daftar seksi LKD di kiri, isi satu seksi di kanan. Dipakai halaman penilaian
 * asesor dan rekap kegiatan dosen supaya sebelas seksi tidak menumpuk jadi satu
 * halaman panjang.
 *
 * Seksi non-aktif tetap dirender (disembunyikan lewat `display:none`, bukan
 * di-unmount) supaya input di dalamnya tetap ikut terkirim sekali submit form.
 */
export default function PanelSeksi({ seksi }: { seksi: SeksiPanel[] }) {
  const pertamaTerisi = seksi.findIndex((s) => !s.kosong);
  const [aktif, setAktif] = useState(pertamaTerisi < 0 ? 0 : pertamaTerisi);
  const kini = seksi[aktif];
  const sebelum = aktif > 0 ? seksi[aktif - 1] : null;
  const sesudah = aktif < seksi.length - 1 ? seksi[aktif + 1] : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[248px_minmax(0,1fr)]">
      <nav aria-label="Daftar seksi" className="self-start lg:sticky lg:top-4">
        <ul className="overflow-hidden rounded-[10px] border border-line">
          {seksi.map((s, i) => {
            const dipilih = i === aktif;
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
                        : s.kosong
                          ? "bg-head-bg text-crumb"
                          : "bg-head-bg text-head-tx"
                    }`}
                  >
                    {s.letter}
                  </span>
                  <span
                    className={`line-clamp-2 flex-1 text-[10.5px] leading-tight ${
                      dipilih ? "font-medium text-primary" : s.kosong ? "text-crumb" : "text-cell"
                    }`}
                  >
                    {s.judul}
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    {s.penanda}
                    {s.badge && (
                      <span
                        className={`rounded px-1 py-px text-[9.5px] font-medium ${
                          badgeCls[s.badgeNada ?? "netral"]
                        }`}
                      >
                        {s.badge}
                      </span>
                    )}
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
            <div className="flex shrink-0 items-center gap-3">
              {kini.ringkas && <span className="text-[11px] text-muted">{kini.ringkas}</span>}
              {kini.aksi}
            </div>
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
