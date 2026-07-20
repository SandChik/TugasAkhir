"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

/**
 * FR-14..FR-16: simpan penilaian asesor untuk seluruh kegiatan pada satu LKD.
 * Satu tombol "Simpan Penilaian" (sesuai mockup) -> upsert hasil_penilaian
 * per kegiatan untuk penugasan asesor ini.
 */
export async function simpanPenilaian(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;

  const idPenugasan = String(formData.get("id_penugasan") ?? "");
  const penugasan = await prisma.penugasan_asesor.findUnique({
    where: { id_penugasan: idPenugasan },
    include: { lkd: { include: { kegiatan: true } } },
  });
  if (!penugasan || penugasan.id_asesor !== session.user.id) return;
  if (!penugasan.lkd.simpan_permanen) return; // dosen belum simpan permanen

  for (const k of penugasan.lkd.kegiatan as any[]) {
    const sksRaw = String(formData.get(`sks_${k.id_kegiatan}`) ?? "").replace(",", ".");
    const status = String(formData.get(`status_${k.id_kegiatan}`) ?? "");
    const catatan = String(formData.get(`catatan_${k.id_kegiatan}`) ?? "").trim() || null;
    if (!["disetujui", "ditolak", "revisi"].includes(status)) continue;
    if (status !== "disetujui" && !catatan) continue; // tolak/revisi wajib catatan (PSPEC-011)

    const sks = parseFloat(sksRaw);
    const sksX100 = Number.isFinite(sks) ? Math.round(sks * 100) : null;

    await prisma.hasil_penilaian.upsert({
      where: {
        id_kegiatan_id_penugasan: { id_kegiatan: k.id_kegiatan, id_penugasan: idPenugasan },
      },
      update: { sks_disetujui_x100: sksX100, status: status as any, catatan },
      create: {
        id_kegiatan: k.id_kegiatan,
        id_penugasan: idPenugasan,
        sks_disetujui_x100: sksX100,
        status: status as any,
        catatan,
      },
    });
  }

  await prisma.lkd.update({ where: { id_lkd: penugasan.id_lkd }, data: { status: "dinilai" } });
  revalidatePath(`/asesor/penilaian/${idPenugasan}`);
  revalidatePath("/asesor/asesor-bkd");
}
