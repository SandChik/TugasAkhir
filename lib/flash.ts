/**
 * Pesan hasil operasi (R12). Server action menempelkan `?ok=` / `?err=` pada URL
 * tujuan redirect; `FlashBanner` di AppShell mengubahnya jadi toast SweetAlert2
 * lalu membersihkan query-nya.
 *
 * Query lain (filter, tab, halaman) dan anchor dipertahankan supaya pengguna
 * mendarat persis di tempat ia menekan tombol tadi.
 */
export function withFlash(base: string, msg: { ok?: string; err?: string }): string {
  const [tanpaHash, hash] = base.split("#");
  const [jalur, kueri] = tanpaHash.split("?");
  const q = new URLSearchParams(kueri);
  q.delete("ok");
  q.delete("err");
  if (msg.ok) q.set("ok", msg.ok);
  if (msg.err) q.set("err", msg.err);
  const s = q.toString();
  return `${jalur}${s ? `?${s}` : ""}${hash ? `#${hash}` : ""}`;
}
