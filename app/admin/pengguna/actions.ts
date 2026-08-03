"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import { withFlash } from "../../../lib/flash";

const DASAR = "/admin/pengguna";

/** FR-03: kelola akun pengguna (tambah, nonaktifkan/aktifkan). */
export async function createPengguna(formData: FormData) {
  const nama = String(formData.get("nama") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const peran = String(formData.get("peran") ?? "dosen");
  const password = String(formData.get("password") ?? "");
  const nidn = String(formData.get("nidn") ?? "").trim() || null;
  const program_studi = String(formData.get("program_studi") ?? "").trim() || null;
  const nira = String(formData.get("nira") ?? "").trim() || null;
  // Kode dosen pada surat tugas JTK — kunci pencocokan hasil ekstraksi SK/ST
  const kode_dosen = String(formData.get("kode_dosen") ?? "").trim().toUpperCase() || null;

  if (!nama || !email || !password || !["dosen", "asesor", "admin"].includes(peran))
    redirect(withFlash(DASAR, { err: "Nama, email, password, dan peran wajib diisi" }));

  const exists = await prisma.pengguna.findUnique({ where: { email } });
  if (exists) redirect(withFlash(DASAR, { err: `Email ${email} sudah dipakai akun lain` }));

  await prisma.pengguna.create({
    data: {
      nama,
      email,
      peran: peran as any,
      password_hash: bcrypt.hashSync(password, 10),
      nidn,
      program_studi,
      nira,
      kode_dosen,
    },
  });
  revalidatePath(DASAR);
  redirect(withFlash(DASAR, { ok: `Akun ${nama} (${peran}) dibuat` }));
}

/** Isi/ubah kode dosen ST agar hasil ekstraksi SK/ST dapat dicocokkan. */
export async function setKodeDosen(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const kode = String(formData.get("kode_dosen") ?? "").trim().toUpperCase() || null;
  if (!id) redirect(withFlash(DASAR, { err: "Pengguna tidak dikenal" }));

  const dipakai = kode
    ? await prisma.pengguna.findFirst({
        where: { kode_dosen: kode, id_pengguna: { not: id } },
        select: { nama: true },
      })
    : null;
  if (dipakai)
    redirect(withFlash(DASAR, { err: `Kode ${kode} sudah dipakai ${dipakai.nama}` }));

  await prisma.pengguna.update({
    where: { id_pengguna: id },
    data: { kode_dosen: kode },
  });
  revalidatePath(DASAR);
  redirect(withFlash(DASAR, { ok: kode ? `Kode dosen disimpan: ${kode}` : "Kode dosen dikosongkan" }));
}

export async function setAktifPengguna(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const aktif = String(formData.get("aktif") ?? "") === "true";
  if (!id) redirect(withFlash(DASAR, { err: "Pengguna tidak dikenal" }));

  const u = await prisma.pengguna.update({ where: { id_pengguna: id }, data: { aktif } });
  revalidatePath(DASAR);
  redirect(withFlash(DASAR, { ok: `${u.nama} ${aktif ? "diaktifkan" : "dinonaktifkan"}` }));
}
