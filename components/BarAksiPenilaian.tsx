"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import BarAksi from "./BarAksi";
import { konfirmasiAksi } from "./swal";
import { IconSave, IconShield } from "./Icons";

const Spinner = () => (
  <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

/**
 * Isi bar aksi halaman penilaian asesor: simpan penilaian dan pengesahan final.
 *
 * Bar dirender di dalam form penilaian supaya status submit dibaca dari
 * `useFormStatus`, bukan state sendiri. Dua konsekuensi penting: tombol tidak
 * pernah dinonaktifkan sebelum submit berjalan (browser membatalkan submit bila
 * tombolnya sudah disabled saat click diproses), dan spinner berhenti sendiri
 * begitu server action selesai.
 *
 * Pengesahan memakai `formAction` pada tombolnya sendiri, jadi satu form
 * melayani dua server action tanpa form bersarang.
 */
export default function BarAksiPenilaian({
  hrefKembali,
  progres,
  aksiSahkan,
}: {
  hrefKembali: string;
  progres?: string;
  aksiSahkan?: (formData: FormData) => Promise<void>;
}) {
  const { pending } = useFormStatus();
  const [ditekan, setDitekan] = useState<"" | "simpan" | "sahkan">("");
  const tombolSahkan = useRef<HTMLButtonElement>(null);
  const proses = pending ? ditekan : "";

  const sahkan = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Dialog SweetAlert2 asinkron: batalkan submit sekarang, kirim ulang lewat
    // tombol yang sama bila asesor menyetujui (requestSubmit mempertahankan
    // submitter sehingga formAction pengesahan tetap yang dipakai).
    e.preventDefault();
    setDitekan("sahkan");
    konfirmasiAksi({
      judul: "Sahkan penilaian?",
      teks: "Pengesahan bersifat final dan tidak dapat ditarik kembali. Bila kedua asesor sudah mengesahkan, token SKS langsung diterbitkan ke wallet dosen dan tercatat permanen di blockchain.",
      tombol: "Ya, sahkan",
    }).then((hasil) => {
      if (!hasil.isConfirmed) {
        setDitekan("");
        return;
      }
      const tombol = tombolSahkan.current;
      tombol?.form?.requestSubmit(tombol);
    });
  };

  return (
    <BarAksi hrefKembali={hrefKembali} info={progres}>
      <button
        type="submit"
        disabled={pending}
        aria-busy={proses === "simpan"}
        onClick={() => setDitekan("simpan")}
        className="inline-flex items-center gap-2 rounded-lg bg-success-deep px-4 py-2 text-[11.5px] font-medium text-white transition-colors hover:bg-[#33885d] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {proses === "simpan" ? <Spinner /> : <IconSave size={13} />}
        {proses === "simpan" ? "Menyimpan…" : "Simpan Penilaian"}
      </button>
      {aksiSahkan && (
        <button
          ref={tombolSahkan}
          type="submit"
          formAction={aksiSahkan}
          disabled={pending}
          aria-busy={proses === "sahkan"}
          onClick={sahkan}
          className="inline-flex items-center gap-2 rounded-lg bg-navy px-4 py-2 text-[11.5px] font-medium text-white transition-colors hover:bg-[#1b3d72] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {proses === "sahkan" ? <Spinner /> : <IconShield size={13} />}
          {proses === "sahkan" ? "Mengesahkan…" : "Sahkan Penilaian (final)"}
        </button>
      )}
    </BarAksi>
  );
}
