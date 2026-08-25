"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { SEKSI_BKD, SEKSI_WAJIB } from "../../../lib/seksiBkd";
import { faseAktif, bolehDosenInput } from "../../../lib/fase";
import { withFlash } from "../../../lib/flash";

async function lkdMilikDosen(idLkd: string, idPengguna: string) {
  const lkd = await prisma.lkd.findUnique({
    where: { id_lkd: idLkd },
    include: { periode_bkd: true },
  });
  if (!lkd || lkd.id_pengguna !== idPengguna) return null;
  return lkd;
}

function url(idLkd: string, tab: string, msg: { ok?: string; err?: string }) {
  return withFlash(`/dosen/rekap-kegiatan/${idLkd}?tab=${tab}`, msg);
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
  redirect(url(lkd.id_lkd, "pendidikan", { ok: "Dokumen LKD periode aktif siap diisi" }));
}

/**
 * Simpan sementara (draft): perubahan per kegiatan memang sudah tersimpan
 * otomatis, tombol ini menegaskan seluruh laporan tersimpan TANPA menguncinya —
 * kebalikan dari simpanPermanen. Status LKD dikembalikan/ditegaskan ke draft.
 */
export async function simpanSementara(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const idLkd = String(formData.get("id_lkd") ?? "");
  const lkd = await lkdMilikDosen(idLkd, session.user.id);
  if (!lkd) redirect(withFlash("/dosen/rekap-kegiatan", { err: "LKD tidak ditemukan" }));
  if (lkd!.simpan_permanen)
    redirect(url(idLkd, "pendidikan", { err: "Laporan sudah dikunci permanen" }));
  if (!bolehDosenInput(faseAktif(lkd!.periode_bkd)))
    redirect(url(idLkd, "pendidikan", { err: "Di luar masa pengisian" }));

  const jumlah = await prisma.kegiatan.count({ where: { id_lkd: idLkd, diklaim: true } as any });
  await prisma.lkd.update({ where: { id_lkd: idLkd }, data: { status: "draft" } });
  redirect(
    url(idLkd, "pendidikan", {
      ok: `Laporan disimpan sementara (${jumlah} kegiatan). Masih bisa diubah — kunci dengan Simpan Permanen bila sudah final.`,
    })
  );
}

/**
 * Kunci LKD agar dinilai asesor. Butuh minimal 1 kegiatan diklaim, dan tiap
 * seksi wajib (`SEKSI_WAJIB`) harus punya minimal 1 kegiatan diklaim.
 */
export async function simpanPermanen(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const idLkd = String(formData.get("id_lkd") ?? "");
  const lkd = await lkdMilikDosen(idLkd, session.user.id);
  if (!lkd) redirect(withFlash("/dosen/rekap-kegiatan", { err: "LKD tidak ditemukan" }));
  if (!bolehDosenInput(faseAktif(lkd!.periode_bkd)))
    redirect(url(idLkd, "pendidikan", { err: "Di luar masa pengisian" }));

  const jumlah = await prisma.kegiatan.count({ where: { id_lkd: idLkd, diklaim: true } as any });
  if (jumlah === 0) redirect(url(idLkd, "pendidikan", { err: "Klaim minimal satu kegiatan dahulu" }));

  const kurang: string[] = [];
  for (const seksi of SEKSI_WAJIB) {
    const terisi = await prisma.kegiatan.count({
      where: {
        id_lkd: idLkd,
        diklaim: true,
        referensi_kegiatan: { kode_rule: { in: seksi.kodeRules } },
      } as any,
    });
    if (terisi === 0) kurang.push(seksi.letter);
  }
  if (kurang.length > 0)
    redirect(url(idLkd, "pendidikan", { err: `Seksi wajib belum terisi: ${kurang.join(", ")}` }));

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
  if (!lkd || lkd.simpan_permanen)
    redirect(url(idLkd, "pendidikan", { err: "LKD sudah disimpan permanen — klaim tidak dapat dibatalkan" }));
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
  if (!["selesai", "gagal", "beban_lebih"].includes(capaian))
    redirect(url(idLkd, "pendidikan", { err: "Status capaian tidak dikenal" }));

  const kegiatan = await prisma.kegiatan.findUnique({
    where: { id_kegiatan: idKegiatan },
    include: { lkd: true },
  });
  if (!kegiatan || kegiatan.lkd.id_pengguna !== session.user.id)
    redirect(url(idLkd, "pendidikan", { err: "Kegiatan tidak ditemukan" }));
  if (kegiatan!.lkd.simpan_permanen)
    redirect(url(idLkd, "pendidikan", { err: "LKD sudah disimpan permanen — status tidak dapat diubah" }));

  await prisma.kegiatan.update({
    where: { id_kegiatan: idKegiatan },
    data: { status_capaian: capaian as any },
  });
  redirect(
    url(idLkd, "pendidikan", {
      ok: "Status kegiatan disimpan sementara — masih bisa diubah sampai laporan dikunci",
    })
  );
}
