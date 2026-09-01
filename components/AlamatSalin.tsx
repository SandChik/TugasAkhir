"use client";

import { useRef, useState } from "react";

/**
 * Nilai on-chain (alamat wallet, tx hash, hash dokumen) tampil terpotong,
 * sekali klik menyalin nilai utuhnya ke clipboard.
 */
export default function AlamatSalin({
  nilai,
  awal = 10,
  akhir = 6,
  className = "",
}: {
  nilai: string;
  awal?: number;
  akhir?: number;
  className?: string;
}) {
  const [tersalin, setTersalin] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const teks =
    nilai.length > awal + akhir + 1 ? `${nilai.slice(0, awal)}…${nilai.slice(-akhir)}` : nilai;

  async function salin() {
    try {
      await navigator.clipboard.writeText(nilai);
    } catch {
      // clipboard API butuh secure context; fallback textarea tersembunyi
      const ta = document.createElement("textarea");
      ta.value = nilai;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setTersalin(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setTersalin(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={salin}
      title={tersalin ? "Tersalin" : `${nilai} (klik untuk salin)`}
      className={`inline-block cursor-pointer border-0 bg-transparent p-0 text-left font-mono ${className}`}
    >
      {tersalin ? "Tersalin" : teks}
    </button>
  );
}
