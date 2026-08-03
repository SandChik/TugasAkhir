"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { faseAktif, bolehAsesorNilai } from "../../../../lib/fase";
import { hashPenilaian, mintSks } from "../../../../lib/blockchain";

function flash(id: string, msg: { ok?: string; err?: string }) {
  const q = new URLSearchParams();
  if (msg.ok) q.set("ok", msg.ok);
  if (msg.err) q.set("err", msg.err);
  return `/asesor/penilaian/${id}?${q.toString()}`;
}

async function penugasanMilikAsesor(idPenugasan: string, idAsesor: string) {
  const pn = await prisma.penugasan_asesor.findUnique({
    where: { id_penugasan: idPenugasan },
    include: { lkd: { include: { kegiatan: true, periode_bkd: true } } },
  });
  if (!pn || pn.id_asesor !== idAsesor) return null;
  return pn;
}

/** FR-14..16: simpan penilaian seluruh kegiatan untuk penugasan ini. */
export async function simpanPenilaian(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const idPenugasan = String(formData.get("id_penugasan") ?? "");
  const pn = await penugasanMilikAsesor(idPenugasan, session.user.id);
  if (!pn) redirect(flash(idPenugasan, { err: "Penugasan tidak ditemukan" }));
  if (!pn!.lkd.simpan_permanen) redirect(flash(idPenugasan, { err: "Dosen belum simpan permanen" }));
  if (!bolehAsesorNilai(faseAktif(pn!.lkd.periode_bkd)))
    redirect(flash(idPenugasan, { err: "Di luar masa penilaian" }));
  if ((pn as any).disahkan) redirect(flash(idPenugasan, { err: "Penilaian sudah disahkan, tidak dapat diubah" }));

  const kegiatanDiklaim = pn!.lkd.kegiatan.filter((k: any) => k.diklaim);
  for (const k of kegiatanDiklaim) {
    const sksRaw = String(formData.get(`sks_${k.id_kegiatan}`) ?? "").replace(",", ".");
    const status = String(formData.get(`status_${k.id_kegiatan}`) ?? "");
    const catatan = String(formData.get(`catatan_${k.id_kegiatan}`) ?? "").trim() || null;
    if (!["disetujui", "ditolak", "revisi"].includes(status)) continue;
    if (status !== "disetujui" && !catatan) continue; // PSPEC-011: tolak/revisi wajib catatan

    const sks = parseFloat(sksRaw);
    const sksX100 = Number.isFinite(sks) ? Math.round(sks * 100) : null;

    await prisma.hasil_penilaian.upsert({
      where: { id_kegiatan_id_penugasan: { id_kegiatan: k.id_kegiatan, id_penugasan: idPenugasan } },
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

  await prisma.lkd.update({ where: { id_lkd: pn!.id_lkd }, data: { status: "dinilai" } });
  redirect(flash(idPenugasan, { ok: "Penilaian tersimpan. Klik Sahkan jika sudah final." }));
}

/**
 * R11: sahkan penilaian. Saat KEDUA asesor sahkan -> hitung simpulan (rata-rata R1),
 * hash, mint token ke wallet dosen (referenceId = hash), catat riwayat_transaksi.
 */
export async function sahkanPenilaian(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const idPenugasan = String(formData.get("id_penugasan") ?? "");
  const pn = await penugasanMilikAsesor(idPenugasan, session.user.id);
  if (!pn) redirect(flash(idPenugasan, { err: "Penugasan tidak ditemukan" }));
  if (!pn!.lkd.simpan_permanen) redirect(flash(idPenugasan, { err: "Dosen belum simpan permanen" }));

  // pastikan semua kegiatan diklaim sudah dinilai oleh asesor ini
  const kegiatanDiklaim = pn!.lkd.kegiatan.filter((k: any) => k.diklaim);
  const nilaiSaya = await prisma.hasil_penilaian.findMany({
    where: { id_penugasan: idPenugasan },
  });
  if (nilaiSaya.length < kegiatanDiklaim.length)
    redirect(flash(idPenugasan, { err: "Nilai seluruh kegiatan sebelum mengesahkan" }));

  await prisma.penugasan_asesor.update({
    where: { id_penugasan: idPenugasan },
    data: { disahkan: true, tanggal_pengesahan: new Date() } as any,
  });

  // cek apakah kedua asesor sudah sahkan
  const semua = await prisma.penugasan_asesor.findMany({ where: { id_lkd: pn!.id_lkd } });
  const semuaSah = semua.length >= 2 && semua.every((x: any) => x.disahkan);

  if (!semuaSah) {
    redirect(flash(idPenugasan, { ok: "Penilaian Anda disahkan. Menunggu asesor lain." }));
  }

  // --- R1: simpulan rata-rata + R11: mint ---
  const hasil = await prisma.hasil_penilaian.findMany({
    where: { penugasan_asesor: { id_lkd: pn!.id_lkd } },
  });
  // rata-rata sks disetujui per kegiatan
  const perKegiatan: Record<string, number[]> = {};
  for (const h of hasil as any[]) {
    if (h.status !== "disetujui" || h.sks_disetujui_x100 == null) continue;
    (perKegiatan[h.id_kegiatan] = perKegiatan[h.id_kegiatan] || []).push(h.sks_disetujui_x100);
  }
  let totalX100 = 0;
  const rincian: Record<string, number> = {};
  for (const [idKeg, arr] of Object.entries(perKegiatan)) {
    const avg = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    rincian[idKeg] = avg;
    totalX100 += avg;
  }

  const memenuhi = totalX100 / 100 >= 9;
  const payload = {
    id_lkd: pn!.id_lkd,
    total_sks_x100: totalX100,
    rincian,
    disahkan_oleh: semua.map((x: any) => x.id_asesor).sort(),
  };
  const hash = hashPenilaian(payload);

  await prisma.simpulan_bkd.upsert({
    where: { id_lkd: pn!.id_lkd },
    update: {
      sks_pendidikan_x100: totalX100,
      status_kewajiban_khusus: memenuhi ? "M" : "TM",
      status_final: memenuhi ? "M" : "TM",
      hash_penilaian: hash,
    },
    create: {
      id_lkd: pn!.id_lkd,
      sks_pendidikan_x100: totalX100,
      status_kewajiban_khusus: memenuhi ? "M" : "TM",
      status_final: memenuhi ? "M" : "TM",
      hash_penilaian: hash,
    },
  });

  await prisma.lkd.update({ where: { id_lkd: pn!.id_lkd }, data: { status: "final" } });

  // mint token SKS ke wallet dosen (referenceId = hash)
  const dosen = await prisma.pengguna.findUnique({ where: { id_pengguna: pn!.lkd.id_pengguna } });
  let mintMsg = "Simpulan final tersimpan.";
  if (dosen?.alamat_wallet && totalX100 > 0) {
    let txHash: string | null = null;
    let status: "success" | "failed" = "failed";
    let contractAddress: string | null = null;
    try {
      const res = await mintSks(dosen.alamat_wallet, BigInt(totalX100), hash);
      txHash = res.txHash;
      status = "success";
      contractAddress = process.env.NEXT_PUBLIC_SKS_TOKEN_ADDRESS ?? null;
    } catch (e) {
      console.error("mint gagal:", e);
    }
    await prisma.riwayat_transaksi.create({
      data: {
        jenis_transaksi: "mint",
        contract_address: contractAddress,
        tx_hash: txHash,
        jumlah_token_x100: totalX100,
        alamat_wallet: dosen.alamat_wallet,
        reference_id: hash,
        alasan: `Pengesahan LKD ${pn!.lkd.periode_bkd.nama_periode}`,
        status,
      } as any,
    });
    mintMsg =
      status === "success"
        ? `Kedua asesor mengesahkan. Token ${(totalX100 / 100).toFixed(2)} SKS diterbitkan.`
        : "Simpulan disahkan, tetapi mint token gagal (cek koneksi blockchain).";
  }

  revalidatePath("/admin/token");
  redirect(flash(idPenugasan, { ok: mintMsg }));
}
