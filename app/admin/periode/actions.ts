"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { withFlash } from "../../../lib/flash";
import { FASE_LABEL } from "../../../lib/fase";

const DASAR = "/admin/periode";

const KUNCI_TANGGAL = [
  "tanggal_mulai",
  "tanggal_selesai",
  "pengisian_mulai",
  "pengisian_selesai",
  "pemeriksaan_mulai",
  "pemeriksaan_selesai",
  "penilaian_mulai",
  "penilaian_selesai",
] as const;

type Tanggal = Record<(typeof KUNCI_TANGGAL)[number], Date | null>;

function bacaTanggal(formData: FormData): Tanggal {
  const hasil = {} as Tanggal;
  for (const k of KUNCI_TANGGAL) {
    const v = String(formData.get(k) ?? "").trim();
    hasil[k] = v ? new Date(v) : null;
  }
  return hasil;
}

/** Pasangan mulai-selesai yang terbalik ditolak sebelum tersimpan. */
function cekRentang(t: Tanggal): string | null {
  const pasangan: [keyof Tanggal, keyof Tanggal, string][] = [
    ["tanggal_mulai", "tanggal_selesai", "periode"],
    ["pengisian_mulai", "pengisian_selesai", "pengisian"],
    ["pemeriksaan_mulai", "pemeriksaan_selesai", "pemeriksaan"],
    ["penilaian_mulai", "penilaian_selesai", "penilaian"],
  ];
  for (const [a, b, label] of pasangan) {
    const mulai = t[a];
    const selesai = t[b];
    if (mulai && selesai && mulai > selesai)
      return `Tanggal ${label} selesai lebih awal dari tanggal mulai`;
  }
  return null;
}

/** FR-05: kelola periode. Constraint #8: hanya satu periode aktif. R3: rentang fase. */
export async function createPeriode(formData: FormData) {
  const tahun = String(formData.get("tahun_ajaran") ?? "").trim();
  const semester = String(formData.get("semester") ?? "").trim();
  if (!tahun || !semester)
    redirect(withFlash(DASAR, { err: "Tahun ajaran dan semester wajib diisi" }));

  const tanggal = bacaTanggal(formData);
  const salah = cekRentang(tanggal);
  if (salah) redirect(withFlash(DASAR, { err: salah }));

  const nama = `${tahun} ${semester}`;
  const kembar = await prisma.periode_bkd.findFirst({ where: { nama_periode: nama } });
  if (kembar) redirect(withFlash(DASAR, { err: `Periode ${nama} sudah ada` }));

  await prisma.periode_bkd.create({
    data: {
      nama_periode: nama,
      tahun_ajaran: tahun,
      semester,
      ...tanggal,
      status: "nonaktif",
    } as any,
  });
  revalidatePath(DASAR);
  redirect(withFlash(DASAR, { ok: `Periode ${nama} dibuat (masih nonaktif)` }));
}

/** Perbaikan salah input periode yang sudah tersimpan (identitas + rentang fase). */
export async function ubahPeriode(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect(withFlash(DASAR, { err: "Periode tidak dikenal" }));

  const tahun = String(formData.get("tahun_ajaran") ?? "").trim();
  const semester = String(formData.get("semester") ?? "").trim();
  if (!tahun || !semester)
    redirect(withFlash(DASAR, { err: "Tahun ajaran dan semester wajib diisi" }));

  const tanggal = bacaTanggal(formData);
  const salah = cekRentang(tanggal);
  if (salah) redirect(withFlash(DASAR, { err: salah }));

  const nama = `${tahun} ${semester}`;
  const kembar = await prisma.periode_bkd.findFirst({
    where: { nama_periode: nama, NOT: { id_periode: id } },
  });
  if (kembar) redirect(withFlash(DASAR, { err: `Periode ${nama} sudah ada` }));

  await prisma.periode_bkd.update({
    where: { id_periode: id },
    data: { nama_periode: nama, tahun_ajaran: tahun, semester, ...tanggal } as any,
  });
  revalidatePath(DASAR);
  redirect(withFlash(DASAR, { ok: `Periode ${nama} diperbarui` }));
}

export async function aktifkanPeriode(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect(withFlash(DASAR, { err: "Periode tidak dikenal" }));

  const [, p] = await prisma.$transaction([
    prisma.periode_bkd.updateMany({ where: { status: "aktif" }, data: { status: "nonaktif" } }),
    prisma.periode_bkd.update({ where: { id_periode: id }, data: { status: "aktif" } }),
  ]);
  revalidatePath(DASAR);
  redirect(
    withFlash(DASAR, { ok: `Periode ${p.nama_periode} diaktifkan — periode lain dinonaktifkan` })
  );
}

export async function nonaktifkanPeriode(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect(withFlash(DASAR, { err: "Periode tidak dikenal" }));
  const p = await prisma.periode_bkd.update({
    where: { id_periode: id },
    data: { status: "nonaktif" },
  });
  revalidatePath(DASAR);
  redirect(withFlash(DASAR, { ok: `Periode ${p.nama_periode} dinonaktifkan` }));
}

/** R3: override fase manual (kosong = ikut tanggal). */
export async function setFaseOverride(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const fase = String(formData.get("fase") ?? "");
  if (!id) redirect(withFlash(DASAR, { err: "Periode tidak dikenal" }));
  const val = ["pengisian", "pemeriksaan", "penilaian"].includes(fase) ? fase : null;
  const p = await prisma.periode_bkd.update({
    where: { id_periode: id },
    data: { fase_override: val } as any,
  });
  revalidatePath(DASAR);
  redirect(
    withFlash(DASAR, {
      ok: val
        ? `Fase ${p.nama_periode} dikunci ke ${FASE_LABEL[val as keyof typeof FASE_LABEL] ?? val}`
        : `Fase ${p.nama_periode} kembali mengikuti tanggal`,
    })
  );
}
