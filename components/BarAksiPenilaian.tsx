"use client";

import Link from "next/link";
import { useState } from "react";
import { konfirmasiAksi } from "./swal";
import { IconBack, IconSave, IconShield } from "./Icons";

const Spinner = () => (
  <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/**
 * Bar aksi yang menempel di bawah viewport: tombol kembali, simpan, dan sahkan
 * selalu terjangkau tanpa menggulir sampai dasar tabel.
 *
 * Tombolnya berada di luar kedua form dan menunjuk pemiliknya lewat atribut
 * `form` (HTML5), karena form penilaian dan form pengesahan tidak boleh
 * bersarang.
 */
export default function BarAksiPenilaian({
  hrefKembali,
  formNilai,
  formSahkan,
  progres,
}: {
  hrefKembali: string;
  formNilai?: string;
  formSahkan?: string;
  progres?: string;
}) {
  const [proses, setProses] = useState<"" | "simpan" | "sahkan">("");
  const sibuk = proses !== "";

  const sahkan = async () => {
    const form = document.getElementById(formSahkan!) as HTMLFormElement | null;
    if (!form) return;
    const hasil = await konfirmasiAksi({
      judul: "Sahkan penilaian?",
      teks: "Pengesahan bersifat final dan tidak dapat ditarik kembali. Bila kedua asesor sudah mengesahkan, token SKS langsung diterbitkan ke wallet dosen dan tercatat permanen di blockchain.",
      tombol: "Ya, sahkan",
    });
    if (!hasil.isConfirmed) return;
    setProses("sahkan");
    form.requestSubmit();
  };

  return (
    <div className="sticky bottom-0 z-20 -mx-6 mt-5 border-t border-line bg-white px-6 py-3 shadow-[0_-2px_10px_rgba(20,49,94,0.07)]">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={hrefKembali}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2 text-[11.5px] font-medium text-muted transition-colors hover:bg-head-bg"
        >
          <IconBack size={11} /> Kembali
        </Link>
        {progres && <span className="text-[11px] text-muted">{progres}</span>}

        <div className="ml-auto flex items-center gap-2">
          {formNilai && (
            <button
              type="submit"
              form={formNilai}
              disabled={sibuk}
              aria-busy={proses === "simpan"}
              onClick={() => setProses("simpan")}
              className="inline-flex items-center gap-2 rounded-lg bg-success-deep px-4 py-2 text-[11.5px] font-medium text-white transition-colors hover:bg-[#33885d] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {proses === "simpan" ? <Spinner /> : <IconSave size={13} />}
              {proses === "simpan" ? "Menyimpan…" : "Simpan Penilaian"}
            </button>
          )}
          {formSahkan && (
            <button
              type="button"
              disabled={sibuk}
              aria-busy={proses === "sahkan"}
              onClick={sahkan}
              className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-[11.5px] font-medium text-white transition-colors hover:bg-[#1b3d72] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {proses === "sahkan" ? <Spinner /> : <IconShield size={13} />}
              {proses === "sahkan" ? "Mengesahkan…" : "Sahkan Penilaian (final)"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
