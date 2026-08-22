"use client";

import { Fragment, useMemo, useState } from "react";
import { KELAS_TABEL } from "./DataTable";
import { IconChevronLeft, IconChevronRight, IconSearch, IconSort, IconX } from "./Icons";

export type KolomTabel = {
  label: string;
  width?: string;
  /** Header bisa diklik untuk mengurutkan (butuh `nilai` pada baris). */
  urut?: boolean;
  /** Tampilkan dropdown penyaring berisi nilai unik kolom ini. */
  filter?: boolean;
  /** Label dropdown penyaring bila berbeda dari `label`. */
  labelFilter?: string;
  rata?: "kiri" | "tengah" | "kanan";
};

export type BarisTabel = {
  /** Kunci React sekaligus identitas baris. */
  id: string;
  /** Isi sel, sejajar dengan `kolom`. Template yang membuat td-nya. */
  sel?: React.ReactNode[];
  /** Alternatif `sel`: elemen tr utuh, untuk baris yang punya state sendiri. */
  elemen?: React.ReactNode;
  /** Nilai mentah per kolom (sejajar `kolom`) untuk urut, filter, dan pencarian. */
  nilai?: (string | number | null | undefined)[];
  /** Teks tambahan yang ikut dicari di luar `nilai`. */
  cari?: string;
};

const RATA = { kiri: "", tengah: "!text-center", kanan: "!text-right" } as const;
const PILIHAN_PER_HALAMAN = [5, 10, 25, 50, 100];
/** Di bawah jumlah ini baris pasti muat satu halaman, footer disembunyikan. */
const AMBANG_FOOTER = 10;

const kendaliCls =
  "rounded-md border border-line bg-white px-2.5 py-1.5 text-[11px] text-cell outline-none placeholder:text-crumb focus:border-primary";

function kosongNilai(v: unknown) {
  return v === null || v === undefined || v === "";
}

/** Urutan naik: angka secara numerik, teks pakai locale id, nilai kosong di akhir. */
function banding(a: unknown, b: unknown): number {
  if (kosongNilai(a) && kosongNilai(b)) return 0;
  if (kosongNilai(a)) return 1;
  if (kosongNilai(b)) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "id", { numeric: true, sensitivity: "base" });
}

/** Deret nomor halaman ringkas: 1 … 4 5 6 … 20 */
function nomorHalaman(total: number, kini: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const dipakai = [1, total, kini, kini - 1, kini + 1].filter((n) => n >= 1 && n <= total);
  const urut = [...new Set(dipakai)].sort((a, b) => a - b);
  const keluar: (number | "…")[] = [];
  let sebelum = 0;
  for (const n of urut) {
    if (sebelum && n - sebelum > 1) keluar.push("…");
    keluar.push(n);
    sebelum = n;
  }
  return keluar;
}

/**
 * Template tabel standar aplikasi: pencarian, penyaring per kolom, pengurutan,
 * dan pagination di sisi klien. Baris dikirim sudah berupa elemen React
 * (`sel` atau `elemen`) sehingga halaman tetap server component dan isinya
 * bebas memuat form server action, chip, tombol, apa pun.
 *
 * `nilai` adalah data mentah tiap kolom, dipakai untuk urut, filter, dan
 * pencarian. Kolom tanpa `nilai` tetap tampil, hanya tidak bisa diurutkan.
 */
export default function TabelData({
  kolom,
  baris,
  kosong = "Belum ada data.",
  perHalamanAwal = 25,
  pencarian,
  placeholderCari = "Cari…",
  aksi,
}: {
  kolom: KolomTabel[];
  baris: BarisTabel[];
  /** Teks saat tabel memang tidak punya data sama sekali. */
  kosong?: string;
  perHalamanAwal?: number;
  /** Paksa tampilkan/sembunyikan kotak cari. Default: muncul bila baris lebih dari 8. */
  pencarian?: boolean;
  placeholderCari?: string;
  /** Slot kanan toolbar (mis. tombol tambah atau ekspor). */
  aksi?: React.ReactNode;
}) {
  const [kueri, setKueri] = useState("");
  const [saring, setSaring] = useState<Record<number, string>>({});
  const [urut, setUrut] = useState<{ i: number; arah: "naik" | "turun" } | null>(null);
  const [perHalaman, setPerHalaman] = useState(perHalamanAwal);
  const [halaman, setHalaman] = useState(1);

  const tampilCari = pencarian ?? baris.length > 8;
  const indeksFilter = kolom.map((k, i) => (k.filter ? i : -1)).filter((i) => i >= 0);

  const opsiFilter = useMemo(() => {
    const peta = new Map<number, string[]>();
    for (const i of indeksFilter) {
      const nilai = new Set<string>();
      for (const b of baris) if (!kosongNilai(b.nilai?.[i])) nilai.add(String(b.nilai?.[i]));
      peta.set(i, [...nilai].sort(banding));
    }
    return peta;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baris, kolom]);

  const hasil = useMemo(() => {
    const q = kueri.trim().toLowerCase();
    const cocok = baris.filter((b) => {
      for (const [i, v] of Object.entries(saring)) {
        if (!v) continue;
        if (String(b.nilai?.[Number(i)] ?? "") !== v) return false;
      }
      if (!q) return true;
      const teks = `${b.cari ?? ""} ${(b.nilai ?? []).map((v) => v ?? "").join(" ")}`;
      return teks.toLowerCase().includes(q);
    });
    if (!urut) return cocok;
    const arah = urut.arah === "naik" ? 1 : -1;
    return [...cocok].sort((a, b) => banding(a.nilai?.[urut.i], b.nilai?.[urut.i]) * arah);
  }, [baris, kueri, saring, urut]);

  const totalHalaman = Math.max(1, Math.ceil(hasil.length / perHalaman));
  const hal = Math.min(halaman, totalHalaman);
  const mulai = (hal - 1) * perHalaman;
  const potong = hasil.slice(mulai, mulai + perHalaman);

  const adaSaringan = kueri.trim() !== "" || Object.values(saring).some(Boolean);
  const adaToolbar = tampilCari || indeksFilter.length > 0 || Boolean(aksi);

  const gantiUrut = (i: number) =>
    setUrut((s) =>
      s?.i !== i ? { i, arah: "naik" } : s.arah === "naik" ? { i, arah: "turun" } : null,
    );

  return (
    <div className="flex flex-col gap-2.5">
      {adaToolbar && (
        <div className="flex flex-wrap items-center gap-2">
          {tampilCari && (
            <div className="relative">
              <IconSearch
                size={13}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-crumb"
              />
              <input
                value={kueri}
                onChange={(e) => {
                  setKueri(e.target.value);
                  setHalaman(1);
                }}
                placeholder={placeholderCari}
                aria-label={placeholderCari}
                className={`${kendaliCls} w-56 pl-7 pr-7`}
              />
              {kueri && (
                <button
                  type="button"
                  onClick={() => setKueri("")}
                  aria-label="Hapus pencarian"
                  className="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-crumb hover:text-navy"
                >
                  <IconX size={12} />
                </button>
              )}
            </div>
          )}

          {indeksFilter.map((i) => (
            <select
              key={i}
              value={saring[i] ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setSaring((s) => ({ ...s, [i]: v }));
                setHalaman(1);
              }}
              aria-label={kolom[i].labelFilter ?? kolom[i].label}
              className={`${kendaliCls} max-w-[190px]`}
            >
              <option value="">
                Semua {(kolom[i].labelFilter ?? kolom[i].label).toLowerCase()}
              </option>
              {(opsiFilter.get(i) ?? []).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          ))}

          {adaSaringan && (
            <button
              type="button"
              onClick={() => {
                setKueri("");
                setSaring({});
                setHalaman(1);
              }}
              className="rounded-md px-2 py-1.5 text-[11px] font-medium text-primary hover:bg-primary-soft"
            >
              Bersihkan
            </button>
          )}

          {aksi && <div className="ml-auto flex items-center gap-2">{aksi}</div>}
        </div>
      )}

      <div className={KELAS_TABEL.bingkai}>
        <div className={KELAS_TABEL.gulir}>
          <table className={KELAS_TABEL.tabel}>
            <thead>
              <tr className={KELAS_TABEL.headBaris}>
                {kolom.map((k, i) => {
                  const aktif = urut?.i === i;
                  return (
                    <th
                      key={i}
                      style={k.width ? { width: k.width } : undefined}
                      aria-sort={
                        aktif ? (urut?.arah === "naik" ? "ascending" : "descending") : undefined
                      }
                      className={`${KELAS_TABEL.th} ${k.rata ? RATA[k.rata] : ""}`}
                    >
                      {k.urut ? (
                        <button
                          type="button"
                          onClick={() => gantiUrut(i)}
                          className={`inline-flex items-center gap-1 hover:text-navy ${
                            aktif ? "text-navy" : ""
                          }`}
                        >
                          {k.label}
                          {aktif ? (
                            <IconChevronRight
                              size={11}
                              className={urut?.arah === "naik" ? "-rotate-90" : "rotate-90"}
                            />
                          ) : (
                            <IconSort size={11} className="text-crumb" />
                          )}
                        </button>
                      ) : (
                        k.label
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className={KELAS_TABEL.tbody}>
              {potong.length === 0 ? (
                <tr>
                  <td colSpan={kolom.length} className="!py-6 !text-center !text-crumb">
                    {baris.length === 0 ? kosong : "Tidak ada data yang cocok."}
                  </td>
                </tr>
              ) : (
                potong.map((b) =>
                  b.elemen ? (
                    <Fragment key={b.id}>{b.elemen}</Fragment>
                  ) : (
                    <tr key={b.id}>
                      {(b.sel ?? []).map((isi, i) => {
                        const rata = kolom[i]?.rata;
                        return (
                          <td key={i} className={rata ? RATA[rata] : undefined}>
                            {isi}
                          </td>
                        );
                      })}
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>

        {hasil.length > 0 && (baris.length > AMBANG_FOOTER || totalHalaman > 1) && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-white px-3.5 py-2">
            <span className="text-[11px] text-muted">
              {mulai + 1}–{mulai + potong.length} dari {hasil.length}
              {hasil.length !== baris.length ? ` (disaring dari ${baris.length})` : ""}
            </span>

            <div className="flex items-center gap-2">
              <select
                value={perHalaman}
                onChange={(e) => {
                  setPerHalaman(Number(e.target.value));
                  setHalaman(1);
                }}
                aria-label="Baris per halaman"
                className={`${kendaliCls} !py-1`}
              >
                {PILIHAN_PER_HALAMAN.map((n) => (
                  <option key={n} value={n}>
                    {n} / halaman
                  </option>
                ))}
              </select>

              {totalHalaman > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setHalaman(Math.max(1, hal - 1))}
                    disabled={hal === 1}
                    aria-label="Halaman sebelumnya"
                    className="flex h-6 w-6 items-center justify-center rounded border border-line text-muted enabled:hover:border-primary enabled:hover:text-primary disabled:opacity-40"
                  >
                    <IconChevronLeft size={12} />
                  </button>
                  {nomorHalaman(totalHalaman, hal).map((n, i) =>
                    n === "…" ? (
                      <span key={`sela-${i}`} className="px-1 text-[11px] text-crumb">
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setHalaman(n)}
                        aria-current={n === hal ? "page" : undefined}
                        className={`h-6 min-w-[24px] rounded px-1.5 text-[11px] ${
                          n === hal
                            ? "bg-primary font-medium text-white"
                            : "border border-line text-muted hover:border-primary hover:text-primary"
                        }`}
                      >
                        {n}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    onClick={() => setHalaman(Math.min(totalHalaman, hal + 1))}
                    disabled={hal === totalHalaman}
                    aria-label="Halaman berikutnya"
                    className="flex h-6 w-6 items-center justify-center rounded border border-line text-muted enabled:hover:border-primary enabled:hover:text-primary disabled:opacity-40"
                  >
                    <IconChevronRight size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
