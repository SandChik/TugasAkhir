"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

const MAKS_BYTE = 25 * 1024 * 1024;

export const fmtUkuran = (b: number) =>
  b >= 1024 * 1024 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;

type Item = { nama: string; ukuran: number; masalah: string | null };

/**
 * Pemilih berkas PDF ganda yang langsung memperlihatkan apa yang terpilih dan
 * memeriksanya di browser (ukuran & tipe) sebelum unggahan panjang dimulai:
 * masalah ketahuan sekarang, bukan setelah menunggu parser (error prevention),
 * dan admin tidak perlu mengingat berkas mana yang tadi ia klik.
 */
export default function InputBerkasPdf({
  id = "file",
  name = "file",
  className = "",
}: {
  id?: string;
  name?: string;
  className?: string;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const { pending } = useFormStatus();
  const tadinyaSibuk = useRef(false);

  // Begitu unggahan selesai, pilihan berkas dikosongkan supaya batch berikutnya
  // tidak mengirim ulang berkas yang sama.
  useEffect(() => {
    if (tadinyaSibuk.current && !pending) {
      if (input.current) input.current.value = "";
      setItems([]);
    }
    tadinyaSibuk.current = pending;
  }, [pending]);

  const total = items.reduce((a, i) => a + i.ukuran, 0);
  const bermasalah = items.filter((i) => i.masalah);
  const siap = items.length - bermasalah.length;

  return (
    <>
      <input
        ref={input}
        id={id}
        type="file"
        name={name}
        accept="application/pdf,.pdf"
        multiple
        required
        onChange={(e) =>
          setItems(
            Array.from(e.target.files ?? []).map((f) => ({
              nama: f.name,
              ukuran: f.size,
              masalah: !/\.pdf$/i.test(f.name)
                ? "bukan PDF"
                : f.size > MAKS_BYTE
                  ? "lebih dari 25 MB"
                  : null,
            }))
          )
        }
        className={className}
      />

      {items.length > 0 && (
        <div className="mt-2 rounded-md border border-line bg-zebra px-3 py-2">
          <p className="text-[11px] font-medium text-cell">
            {siap} berkas siap diunggah · {fmtUkuran(total)}
            {bermasalah.length > 0 && (
              <span className="text-danger"> · {bermasalah.length} perlu diperbaiki</span>
            )}
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {items.map((f, i) => (
              <li
                key={`${f.nama}-${i}`}
                title={f.masalah ? `${f.nama} — ${f.masalah}` : f.nama}
                className={`max-w-[240px] truncate rounded px-2 py-1 text-[10.5px] ${
                  f.masalah ? "bg-danger-soft text-danger" : "bg-white text-muted"
                }`}
              >
                {f.nama} <span className="opacity-70">({fmtUkuran(f.ukuran)})</span>
                {f.masalah ? ` — ${f.masalah}` : ""}
              </li>
            ))}
          </ul>
          {bermasalah.length > 0 && (
            <p className="mt-1.5 text-[10.5px] text-danger">
              Berkas bertanda merah akan ditolak. Pilih ulang tanpa berkas tersebut agar tidak
              menunggu proses yang pasti gagal.
            </p>
          )}
        </div>
      )}
    </>
  );
}
