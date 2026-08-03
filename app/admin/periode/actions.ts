"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { withFlash } from "../../../lib/flash";
import { FASE_LABEL } from "../../../lib/fase";

const DASAR = "/admin/periode";

/** FR-05: kelola periode. Constraint #8: hanya satu periode aktif. R3: rentang fase. */
export async function createPeriode(formData: FormData) {
  const tahun = String(formData.get("tahun_ajaran") ?? "").trim();
  const semester = String(formData.get("semester") ?? "").trim();
  const d = (k: string) => {
    const v = String(formData.get(k) ?? "");
    return v ? new Date(v) : null;
  };
  if (!tahun || !semester)
    redirect(withFlash(DASAR, { err: "Tahun ajaran dan semester wajib diisi" }));

  const nama = `${tahun} ${semester}`;
  const kembar = await prisma.periode_bkd.findFirst({ where: { nama_periode: nama } });
  if (kembar) redirect(withFlash(DASAR, { err: `Periode ${nama} sudah ada` }));

  await prisma.periode_bkd.create({
    data: {
      nama_periode: nama,
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
  revalidatePath(DASAR);
  redirect(withFlash(DASAR, { ok: `Periode ${nama} dibuat (masih nonaktif)` }));
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
  const val = ["pengisian", "penilaian", "perbaikan", "selesai"].includes(fase) ? fase : null;
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
