"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * R12: notifikasi sukses/gagal. Server action redirect ke `?ok=Pesan` atau `?err=Pesan`;
 * banner ini menampilkannya lalu membersihkan query agar tidak muncul lagi saat refresh.
 */
export default function FlashBanner() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ok = params.get("ok");
  const err = params.get("err");
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(true);
    if (!ok && !err) return;
    const t = setTimeout(() => {
      setShow(false);
      router.replace(pathname);
    }, 4000);
    return () => clearTimeout(t);
  }, [ok, err, pathname, router]);

  if ((!ok && !err) || !show) return null;

  return (
    <div
      className={`mb-4 flex items-center justify-between rounded-lg px-4 py-3 text-xs font-medium ${
        ok ? "bg-[#e6f4ec] text-success-tx" : "bg-danger-soft text-danger"
      }`}
    >
      <span>
        {ok ? "✓ " : "✕ "}
        {ok ?? err}
      </span>
      <button
        onClick={() => {
          setShow(false);
          router.replace(pathname);
        }}
        className="ml-4 opacity-60 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}
