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

const LABEL_IDENTITAS = {
  nidn: "NIDN",
  kode_dosen: "Kode dosen",
  nira: "NIRA",
} as const;

/** Nama pemilik lain yang sudah memakai nilai ini, atau null bila bebas. */
async function pemakaiLain(
  kolom: keyof typeof LABEL_IDENTITAS,
  nilai: string | null,
  id: string,
): Promise<string | null> {
  if (!nilai) return null;
  const lain = await prisma.pengguna.findFirst({
    where: { [kolom]: nilai, id_pengguna: { not: id } },
    select: { nama: true },
  });
  return lain?.nama ?? null;
}

/**
 * Simpan identitas satu baris pengguna: NIDN, program studi, kode dosen ST,
 * dan NIRA. Berlaku untuk semua peran termasuk admin, jadi akun apa pun bisa
 * dilengkapi datanya dari tabel.
 */
export async function simpanIdentitas(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect(withFlash(DASAR, { err: "Pengguna tidak dikenal" }));

  const akun = await prisma.pengguna.findUnique({
    where: { id_pengguna: id },
    select: { nama: true },
  });
  if (!akun) redirect(withFlash(DASAR, { err: "Pengguna tidak ditemukan" }));

  const isi = (nama: string) => String(formData.get(nama) ?? "").trim() || null;

  const data = {
    program_studi: isi("program_studi"),
    nidn: isi("nidn"),
    kode_dosen: isi("kode_dosen")?.toUpperCase() ?? null,
    nira: isi("nira"),
  };

  for (const kolom of ["nidn", "kode_dosen", "nira"] as const) {
    const nilai = data[kolom];
    const pemilik = await pemakaiLain(kolom, nilai, id);
    if (pemilik)
      redirect(
        withFlash(DASAR, { err: `${LABEL_IDENTITAS[kolom]} ${nilai} sudah dipakai ${pemilik}` }),
      );
  }

  await prisma.pengguna.update({ where: { id_pengguna: id }, data });
  revalidatePath(DASAR);
  redirect(withFlash(DASAR, { ok: `Data ${akun.nama} disimpan` }));
}

export async function setAktifPengguna(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const aktif = String(formData.get("aktif") ?? "") === "true";
  if (!id) redirect(withFlash(DASAR, { err: "Pengguna tidak dikenal" }));

  const u = await prisma.pengguna.update({ where: { id_pengguna: id }, data: { aktif } });
  revalidatePath(DASAR);
  redirect(withFlash(DASAR, { ok: `${u.nama} ${aktif ? "diaktifkan" : "dinonaktifkan"}` }));
}
