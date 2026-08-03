"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { notifGagal, notifSukses } from "./swal";

/**
 * R12: notifikasi hasil aksi. Server action redirect ke `?ok=Pesan` atau
 * `?err=Pesan`; di sini pesannya ditampilkan sebagai toast SweetAlert2 lalu
 * query-nya dibersihkan agar tidak muncul lagi saat refresh.
 *
 * Toast sukses hilang sendiri; toast galat menetap sampai ditutup — pesan
 * kesalahan yang lenyap sebelum sempat dibaca membuat masalahnya tak bisa
 * dipulihkan. Pembersihan query hanya membuang `ok`/`err`; filter, halaman,
 * dan baris yang sedang disorot dipertahankan dan gulir tidak dilompatkan.
 */
export default function FlashBanner() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ok = params.get("ok");
  const err = params.get("err");
  const terakhir = useRef<string | null>(null);

  useEffect(() => {
    const pesan = ok ?? err;
    if (!pesan) return;
    // Render ulang (mis. setelah router.replace) tidak boleh memunculkan
    // toast yang sama dua kali.
    const kunci = `${ok ? "ok" : "err"}:${pesan}`;
    if (terakhir.current === kunci) return;
    terakhir.current = kunci;

    if (ok) notifSukses(ok);
    else notifGagal(err!);

    const q = new URLSearchParams(params.toString());
    q.delete("ok");
    q.delete("err");
    const s = q.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  }, [ok, err, params, pathname, router]);

  return null;
}
