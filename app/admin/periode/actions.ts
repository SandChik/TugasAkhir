"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../../lib/prisma";

/** FR-05: kelola periode. Constraint #8: hanya satu periode aktif. R3: rentang fase. */
export async function createPeriode(formData: FormData) {
  const tahun = String(formData.get("tahun_ajaran") ?? "").trim();
  const semester = String(formData.get("semester") ?? "").trim();
  const d = (k: string) => {
    const v = String(formData.get(k) ?? "");
    return v ? new Date(v) : null;
  };
  if (!tahun || !semester) return;

  await prisma.periode_bkd.create({
    data: {
      nama_periode: `${tahun} ${semester}`,
      tahun_ajaran: tahun,
      semester,
      tanggal_mulai: d("tanggal_mulai"),
      tanggal_selesai: d("tanggal_selesai"),
      pengisian_mulai: d("pengisian_mulai"),
      pengisian_selesai: d("pengisian_selesai"),
      penilaian_mulai: d("penilaian_mulai"),
      penilaian_selesai: d("penilaian_selesai"),
      perbaikan_mulai: d("perbaikan_mulai"),
      perbaikan_selesai: d("perbaikan_selesai"),
      status: "nonaktif",
    } as any,
  });
  revalidatePath("/admin/periode");
}

export async function aktifkanPeriode(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.$transaction([
    prisma.periode_bkd.updateMany({ where: { status: "aktif" }, data: { status: "nonaktif" } }),
    prisma.periode_bkd.update({ where: { id_periode: id }, data: { status: "aktif" } }),
  ]);
  revalidatePath("/admin/periode");
}

export async function nonaktifkanPeriode(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.periode_bkd.update({ where: { id_periode: id }, data: { status: "nonaktif" } });
  revalidatePath("/admin/periode");
}

/** R3: override fase manual (kosong = ikut tanggal). */
export async function setFaseOverride(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const fase = String(formData.get("fase") ?? "");
  if (!id) return;
  const val = ["pengisian", "penilaian", "perbaikan", "selesai"].includes(fase) ? fase : null;
  await prisma.periode_bkd.update({
    where: { id_periode: id },
    data: { fase_override: val } as any,
  });
  revalidatePath("/admin/periode");
}
