"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { hitungViaKontrak } from "../../../lib/blockchain";
import { faseAktif, bolehDosenInput } from "../../../lib/fase";
import { DETAIL_FIELDS } from "../../../lib/kolomKategori";

/** Kumpulkan field detail (d_*) sesuai DETAIL_FIELDS kategori → objek detail_kegiatan. */
function ambilDetail(slug: string, formData: FormData): Record<string, string | null> {
  const detail: Record<string, string | null> = {
    no_sk: String(formData.get("no_sk") ?? "").trim() || null,
    tgl_sk: String(formData.get("tgl_sk") ?? "").trim() || null,
  };
  for (const f of DETAIL_FIELDS[slug] ?? []) {
    detail[f.name] = String(formData.get(`d_${f.name}`) ?? "").trim() || null;
  }
  return detail;
}

async function periodeAktif() {
  return prisma.periode_bkd.findFirst({ where: { status: "aktif" } });
}

async function pastikanFasePengisian(): Promise<boolean> {
  const p = await periodeAktif();
  if (!p) return false;
  return bolehDosenInput(faseAktif(p));
}

async function lkdLaporan(idPengguna: string) {
  const periode = await periodeAktif();
  if (!periode) return null;
  let lkd = await prisma.lkd.findFirst({
    where: { id_pengguna: idPengguna, id_periode: periode.id_periode, jenis: "laporan" },
  });
  if (!lkd) {
    lkd = await prisma.lkd.create({
      data: { id_pengguna: idPengguna, id_periode: periode.id_periode, jenis: "laporan" },
    });
  }
  return lkd;
}

/** FR-07..FR-11: input kegiatan manual + hitung SKS via smart contract. */
export async function tambahKegiatan(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const slug = String(formData.get("slug") ?? "");

  if (!(await pastikanFasePengisian())) {
    redirect(`/dosen/${slug}?err=${encodeURIComponent("Di luar masa pengisian - tidak dapat menambah kegiatan")}`);
  }

  const kodeRule = String(formData.get("kode_rule") ?? "");
  const judul = String(formData.get("judul") ?? "").trim();
  if (!kodeRule || !judul)
    redirect(`/dosen/${slug}/tambah?err=${encodeURIComponent("Data tidak lengkap")}`);

  const referensi = await prisma.referensi_kegiatan.findUnique({ where: { kode_rule: kodeRule } });
  if (!referensi) redirect(`/dosen/${slug}/tambah?err=${encodeURIComponent("Referensi tidak ditemukan")}`);

  const lkd = await lkdLaporan(session.user.id);
  if (!lkd || lkd.simpan_permanen)
    redirect(`/dosen/${slug}?err=${encodeURIComponent("LKD terkunci")}`);

  const fields: any[] = (referensi!.skema_parameter as any)?.fields ?? [];
  const parameter: Record<string, any> = {};
  const rawValues: Record<string, string> = {};
  for (const f of fields) {
    const raw = String(formData.get(`p_${f.name}`) ?? "");
    rawValues[f.name] = raw;
    parameter[f.name] =
      f.type === "boolean" ? raw === "true" || raw === "on" : f.type === "number" ? Number(raw) : raw;
  }

  let sksX100: number | null = null;
  let statusPerhitungan: "berhasil" | "gagal" | "tidak_diotomatisasi" = "tidak_diotomatisasi";
  if (referensi!.fungsi_contract) {
    try {
      const hasil = await hitungViaKontrak(referensi!.fungsi_contract, fields, rawValues);
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
      id_referensi: referensi!.id_referensi,
      judul,
      detail_kegiatan: ambilDetail(slug, formData),
      parameter,
      sks_dihitung_x100: sksX100,
      status_perhitungan: statusPerhitungan,
      status: "diajukan",
      status_capaian: "berlanjut",
      sumber_data: "manual",
      diklaim: true, // input manual langsung masuk LKD
      tanggal_pengajuan: new Date(),
    } as any,
  });

  const pesan =
    statusPerhitungan === "berhasil"
      ? `Kegiatan ditambahkan. SKS terhitung: ${(sksX100! / 100).toFixed(2)}`
      : statusPerhitungan === "gagal"
        ? "Kegiatan disimpan, tetapi perhitungan kontrak gagal (cek koneksi blockchain)"
        : "Kegiatan disimpan (dinilai manual oleh asesor)";
  redirect(`/dosen/${slug}?ok=${encodeURIComponent(pesan)}`);
}

/** Edit kegiatan manual (fase pengisian): update judul/detail/parameter + hitung ulang SKS. */
export async function ubahKegiatan(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const slug = String(formData.get("slug") ?? "");
  const id = String(formData.get("id_kegiatan") ?? "");

  const kegiatan = await prisma.kegiatan.findUnique({
    where: { id_kegiatan: id },
    include: { lkd: true, referensi_kegiatan: true },
  });
  if (!kegiatan || kegiatan.lkd.id_pengguna !== session.user.id)
    redirect(`/dosen/${slug}?err=${encodeURIComponent("Kegiatan tidak ditemukan")}`);
  if ((kegiatan as any).sumber_data !== "manual")
    redirect(
      `/dosen/${slug}?err=${encodeURIComponent("Data hasil tarikan PDDikti / dokumen SK-ST tidak dapat diedit")}`
    );
  if (kegiatan!.lkd.simpan_permanen || !(await pastikanFasePengisian()))
    redirect(`/dosen/${slug}?err=${encodeURIComponent("Di luar masa pengisian - tidak dapat mengubah kegiatan")}`);

  const judul = String(formData.get("judul") ?? "").trim();
  if (!judul)
    redirect(`/dosen/${slug}/${id}/edit?err=${encodeURIComponent("Nama kegiatan wajib diisi")}`);

  const referensi = kegiatan!.referensi_kegiatan;
  const fields: any[] = (referensi.skema_parameter as any)?.fields ?? [];
  const parameter: Record<string, any> = {};
  const rawValues: Record<string, string> = {};
  for (const f of fields) {
    const raw = String(formData.get(`p_${f.name}`) ?? "");
    rawValues[f.name] = raw;
    parameter[f.name] =
      f.type === "boolean" ? raw === "true" || raw === "on" : f.type === "number" ? Number(raw) : raw;
  }

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

  await prisma.kegiatan.update({
    where: { id_kegiatan: id },
    data: {
      judul,
      detail_kegiatan: ambilDetail(slug, formData),
      parameter,
      sks_dihitung_x100: sksX100,
      status_perhitungan: statusPerhitungan,
    } as any,
  });

  const pesan =
    statusPerhitungan === "berhasil"
      ? `Perubahan disimpan. SKS terhitung ulang: ${(sksX100! / 100).toFixed(2)}`
      : statusPerhitungan === "gagal"
        ? "Perubahan disimpan, tetapi perhitungan kontrak gagal (cek koneksi blockchain)"
        : "Perubahan disimpan (dinilai manual oleh asesor)";
  redirect(`/dosen/${slug}?ok=${encodeURIComponent(pesan)}`);
}

/** Hapus kegiatan manual (fase pengisian). */
export async function hapusKegiatan(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) return;
  const slug = String(formData.get("slug") ?? "");
  const id = String(formData.get("id_kegiatan") ?? "");

  const kegiatan = await prisma.kegiatan.findUnique({
    where: { id_kegiatan: id },
    include: { lkd: true },
  });
  if (!kegiatan || kegiatan.lkd.id_pengguna !== session.user.id)
    redirect(`/dosen/${slug}?err=${encodeURIComponent("Kegiatan tidak ditemukan")}`);
  if ((kegiatan as any).sumber_data !== "manual")
    redirect(
      `/dosen/${slug}?err=${encodeURIComponent("Data hasil tarikan PDDikti / dokumen SK-ST tidak dapat dihapus")}`
    );
  if (kegiatan!.lkd.simpan_permanen || !(await pastikanFasePengisian()))
    redirect(`/dosen/${slug}?err=${encodeURIComponent("Di luar masa pengisian")}`);

  await prisma.kegiatan.delete({ where: { id_kegiatan: id } });
  redirect(`/dosen/${slug}?ok=${encodeURIComponent("Kegiatan dihapus")}`);
}
