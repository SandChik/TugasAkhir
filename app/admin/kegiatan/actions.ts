"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { hitungViaKontrak } from "../../../lib/blockchain";
import { DETAIL_FIELDS } from "../../../lib/kolomKategori";
import { KATEGORI_INPUT_ADMIN } from "../../../lib/kategoriDosen";
import { bacaParameterForm } from "../../../lib/parameterKegiatan";
import { withFlash } from "../../../lib/flash";

const DASAR = "/admin/kegiatan";

async function pastikanAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).peran !== "admin") redirect("/login");
  return session!;
}

/**
 * URL kembali yang dikirim formulir. Divalidasi agar hanya menunjuk ke halaman
 * ini (mencegah open redirect), dan `edit` dibuang supaya setelah menyimpan
 * admin kembali ke formulir kosong — dengan filter daftar tetap utuh.
 */
function kembaliAman(raw: unknown) {
  const s = String(raw ?? "");
  const aman = s === DASAR || s.startsWith(`${DASAR}?`) ? s : DASAR;
  const [jalur, kueri] = aman.split("?");
  const q = new URLSearchParams(kueri);
  q.delete("edit");
  q.delete("ok");
  q.delete("err");
  const sisa = q.toString();
  return sisa ? `${jalur}?${sisa}` : jalur;
}

/** LKD laporan dosen pada periode aktif; dibuat bila belum ada. */
async function lkdLaporan(idPengguna: string, idPeriode: string) {
  const ada = await prisma.lkd.findFirst({
    where: { id_pengguna: idPengguna, id_periode: idPeriode, jenis: "laporan" },
  });
  if (ada) return ada;
  return prisma.lkd.create({
    data: { id_pengguna: idPengguna, id_periode: idPeriode, jenis: "laporan" },
  });
}

/** Kumpulkan field detail (d_*) sesuai kolom tabel menu dosen terkait. */
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

/**
 * FR-07 (jalur admin): input kegiatan berbasis penugasan untuk seorang dosen —
 * perkuliahan, bimbingan, pengujian, dan pembinaan mahasiswa. Kegiatan masuk
 * sebagai portofolio (`diklaim=false`) sehingga dosen menariknya sendiri lewat
 * "Tarik data" di Layanan BKD (R5); nilai SKS dihitung smart contract.
 *
 * Satu aksi melayani tambah dan ubah: `id_kegiatan` kosong = tambah.
 */
export async function simpanKegiatanDosen(formData: FormData) {
  await pastikanAdmin();
  const kembali = kembaliAman(formData.get("kembali"));
  const id = String(formData.get("id_kegiatan") ?? "").trim();

  const periode = await prisma.periode_bkd.findFirst({ where: { status: "aktif" } });
  if (!periode) redirect(withFlash(kembali, { err: "Belum ada periode BKD aktif" }));

  const idDosen = String(formData.get("id_pengguna") ?? "").trim();
  const kodeRule = String(formData.get("kode_rule") ?? "").trim();
  const judul = String(formData.get("judul") ?? "").trim();
  if (!idDosen || !judul)
    redirect(withFlash(kembali, { err: "Dosen dan nama kegiatan wajib diisi" }));

  const slug = KATEGORI_INPUT_ADMIN[kodeRule];
  if (!slug)
    redirect(
      withFlash(kembali, {
        err: "Jenis kegiatan ini diisi sendiri oleh dosen, bukan lewat input admin",
      })
    );

  const [dosen, referensi] = await Promise.all([
    prisma.pengguna.findUnique({ where: { id_pengguna: idDosen } }),
    prisma.referensi_kegiatan.findUnique({ where: { kode_rule: kodeRule } }),
  ]);
  if (!dosen || dosen.peran !== "dosen" || !dosen.aktif)
    redirect(withFlash(kembali, { err: "Dosen tujuan tidak ditemukan atau sudah nonaktif" }));
  if (!referensi) redirect(withFlash(kembali, { err: "Referensi kegiatan tidak ditemukan" }));

  const fields: any[] = (referensi!.skema_parameter as any)?.fields ?? [];
  const { parameter, rawValues } = bacaParameterForm(fields, formData);

  let sksX100: number | null = null;
  let statusPerhitungan: "berhasil" | "gagal" | "tidak_diotomatisasi" = "tidak_diotomatisasi";
  if (referensi!.fungsi_contract) {
    try {
      sksX100 = Number(await hitungViaKontrak(referensi!.fungsi_contract, fields, rawValues));
      statusPerhitungan = "berhasil";
    } catch (e) {
      console.error("Perhitungan kontrak gagal:", e);
      statusPerhitungan = "gagal";
    }
  }

  const lkd = await lkdLaporan(dosen!.id_pengguna, periode!.id_periode);
  if (lkd.simpan_permanen)
    redirect(
      withFlash(kembali, {
        err: `LKD ${dosen!.nama} sudah disimpan permanen — kegiatan baru tidak dapat lagi diklaim dosen`,
      })
    );

  const isi = {
    id_lkd: lkd.id_lkd,
    id_referensi: referensi!.id_referensi,
    judul,
    detail_kegiatan: ambilDetail(slug, formData) as any,
    parameter: parameter as any,
    sks_dihitung_x100: sksX100,
    status_perhitungan: statusPerhitungan,
  };

  if (id) {
    const lama = await prisma.kegiatan.findUnique({ where: { id_kegiatan: id } });
    if (!lama || (lama as any).sumber_data !== "admin")
      redirect(withFlash(kembali, { err: "Kegiatan tidak ditemukan atau bukan hasil input admin" }));
    if ((lama as any).diklaim)
      redirect(
        withFlash(kembali, {
          err: "Kegiatan sudah diklaim dosen ke laporan — minta dosen membatalkan klaim sebelum diubah",
        })
      );
    await prisma.kegiatan.update({ where: { id_kegiatan: id }, data: isi as any });
  } else {
    // Cegah tersimpan dua kali (submit ganda / input berulang) pada dosen yang sama.
    const kembar = await prisma.kegiatan.findFirst({
      where: { id_lkd: lkd.id_lkd, id_referensi: referensi!.id_referensi, judul },
    });
    if (kembar)
      redirect(
        withFlash(kembali, {
          err: `"${judul}" sudah tercatat untuk ${dosen!.nama} pada jenis kegiatan yang sama`,
        })
      );
    await prisma.kegiatan.create({
      data: {
        ...isi,
        status: "diajukan",
        // status_capaian sengaja dibiarkan kosong: capaian dinilai dosen sendiri
        // lewat "Ubah Status" pada Rekap Kegiatan setelah kegiatan diklaim.
        sumber_data: "admin",
        diklaim: false,
      } as any,
    });
  }

  revalidatePath(DASAR);

  const nilai =
    statusPerhitungan === "berhasil"
      ? `SKS terhitung: ${(sksX100! / 100).toFixed(2)}`
      : statusPerhitungan === "gagal"
        ? "perhitungan kontrak gagal (cek koneksi blockchain)"
        : "dinilai langsung oleh asesor (tidak diotomatisasi)";
  redirect(
    withFlash(kembali, {
      ok: id
        ? `Kegiatan ${dosen!.nama} diperbarui — ${nilai}`
        : `Kegiatan ditambahkan ke portofolio ${dosen!.nama} — ${nilai}. Menunggu diklaim dosen.`,
    })
  );
}

/** Hapus kegiatan input admin yang belum diklaim dosen. */
export async function hapusKegiatanDosen(formData: FormData) {
  await pastikanAdmin();
  const kembali = kembaliAman(formData.get("kembali"));
  const id = String(formData.get("id_kegiatan") ?? "").trim();

  const kegiatan = await prisma.kegiatan.findUnique({ where: { id_kegiatan: id } });
  if (!kegiatan) redirect(withFlash(kembali, { err: "Kegiatan tidak ditemukan" }));
  if ((kegiatan as any).sumber_data !== "admin")
    redirect(
      withFlash(kembali, {
        err: "Hanya kegiatan hasil input admin yang dapat dihapus di halaman ini",
      })
    );
  if ((kegiatan as any).diklaim)
    redirect(
      withFlash(kembali, {
        err: "Kegiatan sudah diklaim dosen ke laporan — minta dosen membatalkan klaim sebelum dihapus",
      })
    );

  await prisma.kegiatan.delete({ where: { id_kegiatan: id } });
  revalidatePath(DASAR);
  redirect(withFlash(kembali, { ok: `Kegiatan "${kegiatan!.judul}" dihapus` }));
}
