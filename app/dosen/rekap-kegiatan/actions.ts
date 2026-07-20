"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { SEKSI_BKD } from "../../../lib/seksiBkd";
import { faseAktif, bolehDosenInput } from "../../../lib/fase";

async function lkdMilikDosen(idLkd: string, idPengguna: string) {
  const lkd = await prisma.lkd.findUnique({
    where: { id_lkd: idLkd },
    include: { periode_bkd: true },
  });
  if (!lkd || lkd.id_pengguna !== idPengguna) return null;
  return lkd;
}

function url(idLkd: string, tab: string, msg: { ok?: string; err?: string }) {
  const q = new URLSearchParams({ tab });
  if (msg.ok) q.set("ok", msg.ok);
  if (msg.err) q.set("err", msg.err);
  return `/dosen/rekap-kegiatan/${idLkd}?${q.toString()}`;
}

/** Buat dokumen LKD laporan untuk periode aktif. */
export async function buatLkd(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const periode = await prisma.periode_bkd.findFirst({ where: { status: "aktif" } });
  if (!periode) redirect(`/dosen/rekap-kegiatan?err=${encodeURIComponent("Belum ada periode aktif")}`);

  let lkd = await prisma.lkd.findFirst({
    where: { id_pengguna: session.user.id, id_periode: periode!.id_periode, jenis: "laporan" },
  });
  if (!lkd) {
    lkd = await prisma.lkd.create({
      data: { id_pengguna: session.user.id, id_periode: periode!.id_periode, jenis: "laporan" },
    });
  }
  redirect(`/dosen/rekap-kegiatan/${lkd.id_lkd}?tab=pendidikan`);
}

/** Kunci LKD agar dinilai asesor (butuh minimal 1 kegiatan diklaim). */
export async function simpanPermanen(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const idLkd = String(formData.get("id_lkd") ?? "");
  const lkd = await lkdMilikDosen(idLkd, session.user.id);
  if (!lkd) return;
  if (!bolehDosenInput(faseAktif(lkd.periode_bkd)))
    redirect(url(idLkd, "pendidikan", { err: "Di luar masa pengisian" }));

  const jumlah = await prisma.kegiatan.count({ where: { id_lkd: idLkd, diklaim: true } as any });
  if (jumlah === 0) redirect(url(idLkd, "pendidikan", { err: "Klaim minimal satu kegiatan dahulu" }));

  await prisma.lkd.update({
    where: { id_lkd: idLkd },
    data: { simpan_permanen: true, status: "diajukan" },
  });
  redirect(url(idLkd, "pendidikan", { ok: "LKD disimpan permanen. Menunggu penilaian asesor." }));
}

/**
 * R5: "Tarik data" = klaim kegiatan portofolio (diklaim=false) ke laporan.
 * seksi kosong = klaim semua seksi.
 */
export async function tarikData(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const idLkd = String(formData.get("id_lkd") ?? "");
  const seksiKey = String(formData.get("seksi") ?? "");
  const lkd = await lkdMilikDosen(idLkd, session.user.id);
  if (!lkd || lkd.simpan_permanen) redirect(url(idLkd, "pendidikan", { err: "LKD terkunci" }));
  if (!bolehDosenInput(faseAktif(lkd.periode_bkd)))
    redirect(url(idLkd, "pendidikan", { err: "Di luar masa pengisian" }));

  const kodeFilter = seksiKey ? SEKSI_BKD.find((s) => s.key === seksiKey)?.kodeRules ?? [] : null;

  const where: any = { id_lkd: idLkd, diklaim: false };
  if (kodeFilter) where.referensi_kegiatan = { kode_rule: { in: kodeFilter } };

  const res = await prisma.kegiatan.updateMany({ where, data: { diklaim: true } as any });
  redirect(
    url(idLkd, "pendidikan", {
      ok: res.count > 0 ? `${res.count} kegiatan diklaim ke laporan` : "Tidak ada kegiatan baru untuk diklaim",
    })
  );
}

/** Batalkan klaim satu kegiatan (kembalikan ke portofolio). */
export async function batalKlaim(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const idLkd = String(formData.get("id_lkd") ?? "");
  const idKegiatan = String(formData.get("id_kegiatan") ?? "");
  const lkd = await lkdMilikDosen(idLkd, session.user.id);
  if (!lkd || lkd.simpan_permanen) return;
  await prisma.kegiatan.updateMany({
    where: { id_kegiatan: idKegiatan, id_lkd: idLkd },
    data: { diklaim: false } as any,
  });
  redirect(url(idLkd, "pendidikan", { ok: "Klaim dibatalkan" }));
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
  if (!kegiatan || kegiatan.lkd.id_pengguna !== session.user.id || kegiatan.lkd.simpan_permanen) return;

  await prisma.kegiatan.update({
    where: { id_kegiatan: idKegiatan },
    data: { status_capaian: capaian as any },
  });
  redirect(url(idLkd, "pendidikan", { ok: "Status capaian diperbarui" }));
}
