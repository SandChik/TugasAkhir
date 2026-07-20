"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { hitungViaKontrak } from "../../../lib/blockchain";

/**
 * FR-07..FR-11: input kegiatan + perhitungan SKS via Rule Engine Contract.
 * Kegiatan disimpan pada LKD (rencana/laporan) periode aktif milik dosen.
 */
export async function tambahKegiatan(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;

  const slug = String(formData.get("slug") ?? "");
  const kodeRule = String(formData.get("kode_rule") ?? "");
  const judul = String(formData.get("judul") ?? "").trim();
  const jenisLkd = String(formData.get("jenis_lkd") ?? "laporan");
  if (!kodeRule || !judul || !["rencana", "laporan"].includes(jenisLkd)) return;

  const referensi = await prisma.referensi_kegiatan.findUnique({ where: { kode_rule: kodeRule } });
  if (!referensi) return;

  const periode = await prisma.periode_bkd.findFirst({ where: { status: "aktif" } });
  if (!periode) return;

  // LKD tujuan (buat otomatis bila belum ada)
  let lkd = await prisma.lkd.findFirst({
    where: { id_pengguna: session.user.id, id_periode: periode.id_periode, jenis: jenisLkd as any },
  });
  if (!lkd) {
    lkd = await prisma.lkd.create({
      data: { id_pengguna: session.user.id, id_periode: periode.id_periode, jenis: jenisLkd as any },
    });
  }
  if (lkd.simpan_permanen) return; // terkunci

  // kumpulkan parameter sesuai skema
  const fields: any[] = (referensi.skema_parameter as any)?.fields ?? [];
  const parameter: Record<string, any> = {};
  const rawValues: Record<string, string> = {};
  for (const f of fields) {
    const raw = String(formData.get(`p_${f.name}`) ?? "");
    rawValues[f.name] = raw;
    parameter[f.name] =
      f.type === "boolean" ? raw === "true" || raw === "on" : f.type === "number" ? Number(raw) : raw;
  }

  // hitung via smart contract (deterministik); rule "nilai maksimum" dinilai asesor
  let sksX100: number | null = null;
  let statusPerhitungan: "berhasil" | "gagal" | "tidak_diotomatisasi" = "tidak_diotomatisasi";
  if (referensi.fungsi_contract) {
    try {
      const hasil = await hitungViaKontrak(referensi.fungsi_contract, fields, rawValues);
      sksX100 = Number(hasil);
      statusPerhitungan = "berhasil";
    } catch (e) {
      console.error("Perhitungan kontrak gagal:", e);
      statusPerhitungan = "gagal";
    }
  }

  await prisma.kegiatan.create({
    data: {
      id_lkd: lkd.id_lkd,
      id_referensi: referensi.id_referensi,
      judul,
      detail_kegiatan: {
        no_sk: String(formData.get("no_sk") ?? "").trim() || null,
        tgl_sk: String(formData.get("tgl_sk") ?? "").trim() || null,
      },
      parameter,
      sks_dihitung_x100: sksX100,
      status_perhitungan: statusPerhitungan,
      status: "diajukan",
      status_capaian: "berlanjut",
      tanggal_pengajuan: new Date(),
    },
  });

  revalidatePath(`/dosen/${slug}`);
  redirect(`/dosen/${slug}`);
}
