"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../../lib/prisma";

/** FR-05: kelola periode. Constraint #8 SRS: hanya satu periode aktif. */
export async function createPeriode(formData: FormData) {
  const tahun = String(formData.get("tahun_ajaran") ?? "").trim();
  const semester = String(formData.get("semester") ?? "").trim();
  const mulai = String(formData.get("tanggal_mulai") ?? "");
  const selesai = String(formData.get("tanggal_selesai") ?? "");
  if (!tahun || !semester) return;

  await prisma.periode_bkd.create({
    data: {
      nama_periode: `${tahun} ${semester}`,
      tahun_ajaran: tahun,
      semester,
      tanggal_mulai: mulai ? new Date(mulai) : null,
      tanggal_selesai: selesai ? new Date(selesai) : null,
      status: "nonaktif",
    },
  });
  revalidatePath("/admin/periode");
}

export async function aktifkanPeriode(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  // Satu periode aktif: nonaktifkan semua, lalu aktifkan yang dipilih (atomik)
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
