"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { bolehUbahBukti } from "../../../lib/fase";
import { withFlash } from "../../../lib/flash";
import { bisaDiverifikasi, verifikasiNamaBukti } from "../../../lib/verifikasiBukti";

/** Rubrik bimbingan: bukti (lembar pengesahan, dsb.) diverifikasi otomatis. */
const RULE_VERIFIKASI = ["EDU201", "EDU202", "EDU203"];

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
    include: {
      lkd: { include: { periode_bkd: true, pengguna: { select: { nama: true } } } },
      referensi_kegiatan: { select: { kode_rule: true } },
      hasil_penilaian: { select: { status: true } },
    },
  });
  if (!kegiatan || kegiatan.lkd.id_pengguna !== idPengguna) return null;
  return kegiatan;
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

  // Anti-kecurangan bukti bimbingan: lembar pengesahan diekstrak parser VLM
  // universal, nama di dokumen dibandingkan dengan nama akun pengunggah.
  // Best-effort — kegagalan parser tidak menggagalkan unggahan.
  let verifikasi: any = null;
  if (
    RULE_VERIFIKASI.includes((kegiatan as any).referensi_kegiatan?.kode_rule) &&
    bisaDiverifikasi({ file_url: fileUrl, jenis_file: jenisFile })
  ) {
    verifikasi = await verifikasiNamaBukti(
      fileUrl!,
      namaFile,
      (kegiatan as any).lkd.pengguna?.nama ?? "",
      {
        kodeRule: (kegiatan as any).referensi_kegiatan?.kode_rule,
        parameter: kegiatan!.parameter,
      }
    );
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
      verifikasi,
    } as any,
  });

  const pesanVerifikasi =
    verifikasi?.status === "cocok"
      ? " Nama Anda terverifikasi pada dokumen."
      : verifikasi?.status === "peran_tidak_sesuai"
        ? ` Perhatian: kegiatan diklaim ${verifikasi.peran_diharapkan}, di dokumen tertulis "${verifikasi.peran_terdeteksi}".`
        : verifikasi?.status === "tidak_cocok"
          ? " Perhatian: nama Anda tidak ditemukan pada dokumen."
          : verifikasi?.status === "tanpa_nama"
            ? " Parser tidak menemukan nama pada dokumen."
            : "";
  revalidatePath(returnTo);
  redirect(withFlash(returnTo, { ok: `Dokumen bukti berhasil diunggah.${pesanVerifikasi}` }));
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
          hasil_penilaian: { select: { status: true } },
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
      err: "Bukti kegiatan ini sedang terkunci",
    }));

  await prisma.dokumen_kegiatan.delete({ where: { id_dokumen: idDokumen } });
  revalidatePath(returnTo);
  redirect(withFlash(returnTo, { ok: "Dokumen bukti dihapus" }));
}
