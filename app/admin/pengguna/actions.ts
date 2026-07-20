"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";

/** FR-03: kelola akun pengguna (tambah, nonaktifkan/aktifkan). */
export async function createPengguna(formData: FormData) {
  const nama = String(formData.get("nama") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const peran = String(formData.get("peran") ?? "dosen");
  const password = String(formData.get("password") ?? "");
  const nidn = String(formData.get("nidn") ?? "").trim() || null;
  const program_studi = String(formData.get("program_studi") ?? "").trim() || null;
  const nira = String(formData.get("nira") ?? "").trim() || null;

  if (!nama || !email || !password || !["dosen", "asesor", "admin"].includes(peran)) return;

  const exists = await prisma.pengguna.findUnique({ where: { email } });
  if (exists) return;

  await prisma.pengguna.create({
    data: {
      nama,
      email,
      peran: peran as any,
      password_hash: bcrypt.hashSync(password, 10),
      nidn,
      program_studi,
      nira,
    },
  });
  revalidatePath("/admin/pengguna");
}

export async function setAktifPengguna(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const aktif = String(formData.get("aktif") ?? "") === "true";
  if (!id) return;
  await prisma.pengguna.update({ where: { id_pengguna: id }, data: { aktif } });
  revalidatePath("/admin/pengguna");
}
