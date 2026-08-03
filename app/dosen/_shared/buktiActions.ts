"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { bolehDosenInput, faseAktif } from "../../../lib/fase";
import { withFlash } from "../../../lib/flash";

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
    include: { lkd: { include: { periode_bkd: true } } },
  });
  if (!kegiatan || kegiatan.lkd.id_pengguna !== idPengguna) return null;
  return kegiatan;
}

/**
 * Bukti hanya boleh berubah selama masa pengisian dan sebelum laporan disimpan
 * permanen — sama seperti gate di UI. Dicek di sini juga karena UI yang
 * menyembunyikan tombol bukan pengaman: kiriman form bisa dibuat manual.
 */
function bolehUbahBukti(kegiatan: any): boolean {
  return (
    !kegiatan.lkd.simpan_permanen &&
    bolehDosenInput(faseAktif(kegiatan.lkd.periode_bkd))
  );
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
  if (!bolehUbahBukti(kegiatan))
    redirect(withFlash(returnTo, {
      err: "Unggah bukti sudah ditutup untuk periode ini",
    }));

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
  if (!idDokumen) redirect(withFlash(returnTo, { err: "Dokumen tidak dikenal" }));

  const dok = await prisma.dokumen_kegiatan.findUnique({
    where: { id_dokumen: idDokumen },
    include: {
      kegiatan: {
        include: {
          lkd: { include: { periode_bkd: true } },
          unggahan_dokumen: { select: { file_url: true } },
        },
      },
    },
  });
  if (!dok || dok.kegiatan.lkd.id_pengguna !== session.user.id)
    redirect(withFlash(returnTo, { err: "Dokumen tidak ditemukan" }));
  // Surat tugas/SK lampiran admin bukan milik dosen — tidak boleh ikut terhapus.
  if (dok!.file_url && dok!.file_url === dok!.kegiatan.unggahan_dokumen?.file_url)
    redirect(withFlash(returnTo, {
      err: "Surat tugas/SK dari admin tidak dapat dihapus dari sini",
    }));
  if (!bolehUbahBukti(dok!.kegiatan))
    redirect(withFlash(returnTo, {
      err: "Bukti tidak dapat dihapus setelah masa pengisian berakhir",
    }));

  await prisma.dokumen_kegiatan.delete({ where: { id_dokumen: idDokumen } });
  revalidatePath(returnTo);
  redirect(withFlash(returnTo, { ok: "Dokumen bukti dihapus" }));
}
