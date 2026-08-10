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
  // NIRA hanya milik asesor; kode dosen berlaku untuk dosen & asesor (asesor juga dosen)
  const nira = peran === "asesor" ? String(formData.get("nira") ?? "").trim() || null : null;
  const kode_dosen =
    peran === "admin" ? null : String(formData.get("kode_dosen") ?? "").trim().toUpperCase() || null;

  if (!nama || !email || !password || !["dosen", "asesor", "admin"].includes(peran))
    redirect(withFlash(DASAR, { err: "Nama, email, password, dan peran wajib diisi" }));
  if (password.length < 8)
    redirect(withFlash(DASAR, { err: "Password awal minimal 8 karakter" }));
  if ((peran === "dosen" || peran === "asesor") && !nidn)
    redirect(withFlash(DASAR, { err: "NIDN wajib diisi untuk akun dosen/asesor" }));

  const exists = await prisma.pengguna.findUnique({ where: { email } });
  if (exists) redirect(withFlash(DASAR, { err: `Email ${email} sudah dipakai akun lain` }));

  if (kode_dosen) {
    const dipakai = await prisma.pengguna.findFirst({
      where: { kode_dosen },
      select: { nama: true },
    });
    if (dipakai)
      redirect(withFlash(DASAR, { err: `Kode dosen ${kode_dosen} sudah dipakai ${dipakai.nama}` }));
  }
  if (nira) {
    const dipakai = await prisma.pengguna.findFirst({ where: { nira }, select: { nama: true } });
    if (dipakai)
      redirect(withFlash(DASAR, { err: `NIRA ${nira} sudah dipakai ${dipakai.nama}` }));
  }

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

/** Isi/ubah NIRA (Nomor Induk Registrasi Asesor) — hanya relevan untuk akun asesor. */
export async function setNira(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const nira = String(formData.get("nira") ?? "").trim() || null;
  if (!id) redirect(withFlash(DASAR, { err: "Pengguna tidak dikenal" }));

  const dipakai = nira
    ? await prisma.pengguna.findFirst({
        where: { nira, id_pengguna: { not: id } },
        select: { nama: true },
      })
    : null;
  if (dipakai)
    redirect(withFlash(DASAR, { err: `NIRA ${nira} sudah dipakai ${dipakai.nama}` }));

  await prisma.pengguna.update({
    where: { id_pengguna: id },
    data: { nira },
  });
  revalidatePath(DASAR);
  redirect(withFlash(DASAR, { ok: nira ? `NIRA disimpan: ${nira}` : "NIRA dikosongkan" }));
}

export async function setAktifPengguna(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const aktif = String(formData.get("aktif") ?? "") === "true";
  if (!id) redirect(withFlash(DASAR, { err: "Pengguna tidak dikenal" }));

  const u = await prisma.pengguna.update({ where: { id_pengguna: id }, data: { aktif } });
  revalidatePath(DASAR);
  redirect(withFlash(DASAR, { ok: `${u.nama} ${aktif ? "diaktifkan" : "dinonaktifkan"}` }));
}
