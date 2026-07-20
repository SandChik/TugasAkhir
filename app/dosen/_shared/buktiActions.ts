"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

const JENIS_DOKUMEN = [
  "Berita Acara Perkuliahan",
  "Daftar Hadir",
  "RPS",
  "SK Penugasan",
  "Sertifikat",
  "Bukti Lainnya",
];

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

async function pastikanMilikDosen(idKegiatan: string, idPengguna: string) {
  const kegiatan = await prisma.kegiatan.findUnique({
    where: { id_kegiatan: idKegiatan },
    include: { lkd: true },
  });
  if (!kegiatan || kegiatan.lkd.id_pengguna !== idPengguna) return null;
  return kegiatan;
}

function withFlash(base: string, msg: { ok?: string; err?: string }) {
  const q = new URLSearchParams();
  if (msg.ok) q.set("ok", msg.ok);
  if (msg.err) q.set("err", msg.err);
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}

/** FR-09: unggah dokumen bukti (file fisik ATAU tautan). returnTo = halaman balik + flash. */
export async function uploadBukti(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;

  const idKegiatan = String(formData.get("id_kegiatan") ?? "");
  const returnTo = String(formData.get("return_to") ?? "/dosen/rekap-kegiatan");
  const nama = String(formData.get("nama_dokumen") ?? "").trim();
  const keterangan = String(formData.get("keterangan") ?? "").trim() || null;
  const jenis = String(formData.get("jenis_dokumen") ?? "");
  const tautan = String(formData.get("tautan") ?? "").trim();
  const file = formData.get("file") as File | null;

  if (!idKegiatan || !nama || !JENIS_DOKUMEN.includes(jenis))
    redirect(withFlash(returnTo, { err: "Lengkapi nama dan jenis dokumen" }));

  const kegiatan = await pastikanMilikDosen(idKegiatan, session.user.id);
  if (!kegiatan) redirect(withFlash(returnTo, { err: "Kegiatan tidak ditemukan" }));

  let fileUrl: string | null = null;
  let namaFile: string | null = null;
  let jenisFile: string | null = null;

  if (file && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) redirect(withFlash(returnTo, { err: "Ukuran file melebihi 10 MB" }));
    const bytes = Buffer.from(await file.arrayBuffer());
    const aman = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const unik = `${crypto.randomUUID()}-${aman}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, unik), bytes);
    fileUrl = `/uploads/${unik}`;
    namaFile = file.name;
    jenisFile = file.type || null;
  } else if (tautan) {
    if (!/^https?:\/\//i.test(tautan)) redirect(withFlash(returnTo, { err: "Tautan harus diawali http(s)://" }));
    fileUrl = tautan;
    jenisFile = "tautan";
  } else {
    redirect(withFlash(returnTo, { err: "Pilih file atau isi tautan dokumen" }));
  }

  await prisma.dokumen_kegiatan.create({
    data: {
      id_kegiatan: idKegiatan,
      nama_dokumen: nama,
      nama_file: namaFile,
      jenis_file: jenisFile,
      jenis_dokumen: jenis,
      file_url: fileUrl,
      keterangan,
    },
  });

  revalidatePath(returnTo);
  redirect(withFlash(returnTo, { ok: "Dokumen bukti berhasil diunggah" }));
}

export async function hapusBukti(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;

  const idDokumen = String(formData.get("id_dokumen") ?? "");
  const returnTo = String(formData.get("return_to") ?? "/dosen/rekap-kegiatan");
  if (!idDokumen) return;

  const dok = await prisma.dokumen_kegiatan.findUnique({
    where: { id_dokumen: idDokumen },
    include: { kegiatan: { include: { lkd: true } } },
  });
  if (!dok || dok.kegiatan.lkd.id_pengguna !== session.user.id)
    redirect(withFlash(returnTo, { err: "Dokumen tidak ditemukan" }));

  await prisma.dokumen_kegiatan.delete({ where: { id_dokumen: idDokumen } });
  revalidatePath(returnTo);
  redirect(withFlash(returnTo, { ok: "Dokumen bukti dihapus" }));
}
