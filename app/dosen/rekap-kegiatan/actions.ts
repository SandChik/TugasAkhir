"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { SEKSI_BKD } from "../../../lib/seksiBkd";

async function lkdMilikDosen(idLkd: string, idPengguna: string) {
  const lkd = await prisma.lkd.findUnique({ where: { id_lkd: idLkd } });
  if (!lkd || lkd.id_pengguna !== idPengguna) return null;
  return lkd;
}

/** Buat dokumen LKD (rencana/laporan) untuk periode aktif. */
export async function buatLkd(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const jenis = String(formData.get("jenis") ?? "");
  if (!["rencana", "laporan"].includes(jenis)) return;

  const periode = await prisma.periode_bkd.findFirst({ where: { status: "aktif" } });
  if (!periode) return;

  const exists = await prisma.lkd.findFirst({
    where: { id_pengguna: session.user.id, id_periode: periode.id_periode, jenis: jenis as any },
  });
  if (exists) return;

  await prisma.lkd.create({
    data: { id_pengguna: session.user.id, id_periode: periode.id_periode, jenis: jenis as any },
  });
  revalidatePath("/dosen/rekap-kegiatan");
}

/** Kunci LKD agar bisa dinilai asesor (badge "simpan permanen" di mockup). */
export async function simpanPermanen(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const idLkd = String(formData.get("id_lkd") ?? "");
  const lkd = await lkdMilikDosen(idLkd, session.user.id);
  if (!lkd) return;

  await prisma.lkd.update({
    where: { id_lkd: idLkd },
    data: { simpan_permanen: true, status: "diajukan" },
  });
  revalidatePath(`/dosen/rekap-kegiatan/${idLkd}`);
  revalidatePath("/dosen/rekap-kegiatan");
}

/**
 * "Tarik Kinerja dari Portofolio": menyalin kegiatan dari LKD rencana
 * periode yang sama ke LKD laporan ini (tanpa duplikat, dicocokkan judul+referensi).
 * seksiKey kosong = tarik semua seksi.
 */
export async function tarikData(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const idLkd = String(formData.get("id_lkd") ?? "");
  const seksiKey = String(formData.get("seksi") ?? "");
  const lkd = await lkdMilikDosen(idLkd, session.user.id);
  if (!lkd || lkd.jenis !== "laporan" || lkd.simpan_permanen) return;

  const rencana = await prisma.lkd.findFirst({
    where: { id_pengguna: session.user.id, id_periode: lkd.id_periode, jenis: "rencana" },
    include: { kegiatan: { include: { referensi_kegiatan: true } } },
  });
  if (!rencana) return;

  const kodeFilter = seksiKey
    ? SEKSI_BKD.find((s) => s.key === seksiKey)?.kodeRules ?? []
    : null;

  const existing = await prisma.kegiatan.findMany({ where: { id_lkd: idLkd } });
  const sudahAda = new Set(existing.map((k: any) => `${k.id_referensi}|${k.judul}`));

  for (const k of rencana.kegiatan as any[]) {
    if (kodeFilter && !kodeFilter.includes(k.referensi_kegiatan.kode_rule)) continue;
    if (sudahAda.has(`${k.id_referensi}|${k.judul}`)) continue;
    await prisma.kegiatan.create({
      data: {
        id_lkd: idLkd,
        id_referensi: k.id_referensi,
        judul: k.judul,
        detail_kegiatan: k.detail_kegiatan ?? undefined,
        parameter: k.parameter ?? undefined,
        sks_dihitung_x100: k.sks_dihitung_x100,
        status_perhitungan: k.status_perhitungan,
        status: "diajukan",
        status_capaian: k.status_capaian ?? "berlanjut",
      },
    });
  }
  revalidatePath(`/dosen/rekap-kegiatan/${idLkd}`);
}

/** Ubah status capaian kegiatan (modal "Ubah Status" di mockup). */
export async function ubahCapaian(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const idKegiatan = String(formData.get("id_kegiatan") ?? "");
  const idLkd = String(formData.get("id_lkd") ?? "");
  const capaian = String(formData.get("capaian") ?? "");
  if (!["selesai", "berlanjut", "gagal", "beban_lebih"].includes(capaian)) return;

  const kegiatan = await prisma.kegiatan.findUnique({
    where: { id_kegiatan: idKegiatan },
    include: { lkd: true },
  });
  if (!kegiatan || kegiatan.lkd.id_pengguna !== session.user.id || kegiatan.lkd.simpan_permanen)
    return;

  await prisma.kegiatan.update({
    where: { id_kegiatan: idKegiatan },
    data: { status_capaian: capaian as any },
  });
  revalidatePath(`/dosen/rekap-kegiatan/${idLkd}`);
}
