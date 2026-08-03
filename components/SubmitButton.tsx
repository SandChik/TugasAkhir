"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { konfirmasiAksi } from "./swal";

/**
 * Tombol submit server action dengan dua jaminan usability:
 *
 * - **Visibility of system status** — selama aksi berjalan tombol berubah jadi
 *   label "sedang berjalan" + spinner dan tidak bisa ditekan dua kali. Penting
 *   karena ekstraksi VLM dan "Terapkan" bisa memakan puluhan detik–menit.
 * - **Error prevention** — aksi yang sulit dibatalkan (hapus, terapkan ulang)
 *   bisa meminta konfirmasi lewat prop `konfirmasi`.
 */
export default function SubmitButton({
  children,
  labelProses,
  konfirmasi,
  judulKonfirmasi,
  tombolKonfirmasi,
  disabled,
  icon,
  variant = "primary",
  className = "",
  title,
}: {
  children: React.ReactNode;
  labelProses?: string;
  konfirmasi?: string;
  judulKonfirmasi?: string;
  tombolKonfirmasi?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  variant?: "primary" | "soft" | "danger" | "outline";
  className?: string;
  title?: string;
}) {
  const { pending } = useFormStatus();
  const tombol = useRef<HTMLButtonElement>(null);
  const disetujui = useRef(false);

  const gaya: Record<string, string> = {
    primary: "bg-primary text-white hover:bg-[#255cc2]",
    soft: "bg-primary-soft text-primary hover:bg-[#dde9fb]",
    danger: "bg-danger-soft text-danger hover:bg-[#fbe2e4]",
    outline: "border border-line bg-white text-cell hover:bg-head-bg",
  };

  return (
    <button
      ref={tombol}
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      title={title}
      onClick={(e) => {
        if (!konfirmasi || disetujui.current) return;
        // Dialog SweetAlert2 asinkron: batalkan submit sekarang, lalu kirim
        // ulang lewat tombol yang sama bila admin menyetujui (requestSubmit
        // mempertahankan submitter sehingga server action tetap terpanggil).
        e.preventDefault();
        const form = tombol.current?.form;
        konfirmasiAksi({
          judul: judulKonfirmasi,
          teks: konfirmasi,
          bahaya: variant === "danger",
          tombol: tombolKonfirmasi ?? (variant === "danger" ? "Ya, hapus" : "Ya, lanjutkan"),
        }).then((hasil) => {
          if (!hasil.isConfirmed || !form) return;
          disetujui.current = true;
          form.requestSubmit(tombol.current ?? undefined);
        });
      }}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-[11.5px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${gaya[variant]} ${className}`}
    >
      {pending ? (
        <svg
          className="animate-spin"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : (
        icon
      )}
      {pending ? (labelProses ?? "Memproses…") : children}
    </button>
  );
}
