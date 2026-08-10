"use client";

import { useState, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  /** Kelas untuk pembungkus (mis. margin) — jangan taruh margin di className input. */
  wrapperClassName?: string;
};

/**
 * Input password tertutup dengan tombol intip (ikon mata).
 * Semua props lain diteruskan ke <input>, bisa dipakai controlled maupun uncontrolled.
 */
export default function PasswordInput({ wrapperClassName, className, ...props }: Props) {
  const [terlihat, setTerlihat] = useState(false);
  return (
    <div className={`relative ${wrapperClassName ?? ""}`}>
      <input {...props} type={terlihat ? "text" : "password"} className={`${className ?? ""} pr-9`} />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setTerlihat((v) => !v)}
        aria-label={terlihat ? "Sembunyikan password" : "Tampilkan password"}
        title={terlihat ? "Sembunyikan password" : "Tampilkan password"}
        className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-crumb hover:text-navy"
      >
        {terlihat ? (
          /* Mata dicoret: password sedang terlihat */
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          /* Mata terbuka: klik untuk mengintip */
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
