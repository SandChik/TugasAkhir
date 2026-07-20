"use client";

import { signOut } from "next-auth/react";

export default function Topbar({ institusi = "Institusi A" }: { institusi?: string }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-line bg-white px-6">
      <span className="text-[13px] font-semibold text-navy">{institusi}</span>
      <div className="flex items-center gap-6 text-[11px] text-muted">
        <button type="button" className="hover:text-navy">
          Pengaturan
        </button>
        <button
          type="button"
          className="hover:text-navy"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Keluar
        </button>
      </div>
    </header>
  );
}
