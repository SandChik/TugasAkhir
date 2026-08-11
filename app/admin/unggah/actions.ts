"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { hitungViaKontrak } from "../../../lib/blockchain";
import {
  LABEL_JENIS,
  deteksiJenis,
  parseDokumen,
  spekJenis,
  type JenisUnggahan,
} from "../../../lib/parserDokumen";
import {
  gabungKoreksi,
  jumlahDosenDokumen,
  petakanDokumen,
  type KoreksiBaris,
  type PetaKoreksi,
} from "../../../lib/pemetaanPenugasan";
import { buatPencocokDosen } from "../../../lib/namaDosen";
import { fieldFormulir } from "../../../lib/parameterKegiatan";
import { withFlash } from "../../../lib/flash";

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB — SK hasil pindai bisa besar
const DASAR = "/admin/unggah";

/**
 * URL kembali yang dikirim formulir pratinjau. Divalidasi agar hanya menunjuk
 * ke halaman pratinjau unggahan tersebut (mencegah open redirect).
 */
function kembaliAman(raw: unknown, id: string) {
  const dasar = `${DASAR}/${id}`;
  const s = String(raw ?? "");
  return s === dasar || s.startsWith(`${dasar}?`) || s.startsWith(`${dasar}#`) ? s : dasar;
}

async function pastikanAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).peran !== "admin") redirect("/login");
  return session;
}

/** Simpan PDF ke public/uploads/dokumen dan kembalikan URL publiknya. */
async function simpanBerkas(file: File, bytes: Buffer) {
  const aman = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const unik = `${crypto.randomUUID()}-${aman}`;
  const dir = path.join(process.cwd(), "public", "uploads", "dokumen");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, unik), bytes);
  return `/uploads/dokumen/${unik}`;
}

/**
 * FR-07 (jalur admin): unggah dokumen SK/ST, ekstrak lewat layanan parser,
 * simpan JSON hasilnya sebagai bukti audit. Kegiatan dosen BELUM dibuat di
 * tahap ini — admin memeriksa pratinjau lalu menekan "Terapkan".
 *
 * Menerima banyak berkas sekaligus (satu folder SK & ST); jenis tiap berkas
 * bisa dipilih manual atau dideteksi dari nama berkas.
 */
export async function unggahDokumen(formData: FormData) {
  const session = await pastikanAdmin();

  const jenisPilihan = String(formData.get("jenis") ?? "auto");
  const berkas = formData
    .getAll("file")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (berkas.length === 0) redirect(withFlash(DASAR, { err: "Pilih minimal satu berkas PDF" }));

  const [periode, dosenSistem] = await Promise.all([
    prisma.periode_bkd.findFirst({ where: { status: "aktif" } }),
    prisma.pengguna.findMany({
      where: { peran: "dosen", aktif: true },
      select: { id_pengguna: true, nama: true, nip: true, nidn: true, kode_dosen: true },
    }),
  ]);
  const cocokkan = buatPencocokDosen(dosenSistem);

  const opsiSk = {
    nomor_sk: String(formData.get("nomor_sk") ?? "").trim(),
    tanggal_sk: String(formData.get("tanggal_sk") ?? "").trim(),
    halaman_l1: String(formData.get("halaman_l1") ?? "").trim(),
    halaman_l2: String(formData.get("halaman_l2") ?? "").trim(),
    dpi: String(formData.get("dpi") ?? "").trim(),
  };

  let berhasil = 0;
  let gagal = 0;
  const catatan: string[] = [];
  let idTerakhir: string | null = null;

  for (const file of berkas) {
    const jenis: JenisUnggahan | null =
      jenisPilihan === "auto" ? deteksiJenis(file.name) : (jenisPilihan as JenisUnggahan);

    if (!jenis || !spekJenis(jenis)) {
      gagal++;
      catatan.push(`${file.name}: jenis dokumen tidak terdeteksi dari nama berkas`);
      continue;
    }
    const namaPdf =
      file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
    if (!namaPdf) {
      gagal++;
      catatan.push(`${file.name}: bukan berkas PDF`);
      continue;
    }
    if (file.size > MAX_FILE_BYTES) {
      gagal++;
      catatan.push(`${file.name}: melebihi 25 MB`);
      continue;
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const fileUrl = await simpanBerkas(file, bytes);

    try {
      const hasil = await parseDokumen(jenis, file, opsiSk);
      const peta = petakanDokumen(jenis, hasil);

      // Hitung berapa dosen dokumen yang punya akun di sistem (informasi
      // untuk admin; pencocokan sesungguhnya diulang saat "Terapkan").
      const idCocok = new Set<string>();
      for (const p of peta.penugasan) {
        const h = cocokkan({ nama: p.namaDokumen, nip: p.nip, kodeDosen: p.kodeDosen });
        if (h.status === "cocok") idCocok.add(h.dosen.id_pengguna);
      }

      const rec = await prisma.unggahan_dokumen.create({
        data: {
          id_periode: periode?.id_periode ?? null,
          id_admin: (session.user as any).id,
          jenis,
          nama_file: file.name,
          file_url: fileUrl,
          ukuran_byte: file.size,
          sha256: peta.sha256,
          nomor_surat: peta.nomorSurat,
          status: "terparse",
          hasil_parse: hasil,
          ringkasan: peta.ringkasan ?? undefined,
          jumlah_dosen_dokumen: jumlahDosenDokumen(peta.penugasan),
          jumlah_dosen_cocok: idCocok.size,
        } as any,
      });
      idTerakhir = rec.id_unggahan;
      berhasil++;
    } catch (e: any) {
      await prisma.unggahan_dokumen.create({
        data: {
          id_periode: periode?.id_periode ?? null,
          id_admin: (session.user as any).id,
          jenis,
          nama_file: file.name,
          file_url: fileUrl,
          ukuran_byte: file.size,
          status: "gagal",
          pesan_galat: String(e?.message ?? e),
        } as any,
      });
      gagal++;
      catatan.push(`${file.name}: ${String(e?.message ?? e)}`);
    }
  }

  revalidatePath(DASAR);

  // Satu berkas sukses -> langsung ke pratinjau; sisanya kembali ke daftar.
  if (berhasil === 1 && gagal === 0 && idTerakhir) {
    redirect(
      withFlash(`${DASAR}/${idTerakhir}`, {
        ok: "Dokumen berhasil diekstrak. Periksa pratinjau lalu terapkan.",
      })
    );
  }
  if (berhasil > 0) {
    redirect(
      withFlash(DASAR, {
        ok:
          `${berhasil} dokumen berhasil diekstrak` +
          (gagal ? `, ${gagal} gagal (${catatan.join("; ")})` : ""),
      })
    );
  }
  redirect(withFlash(DASAR, { err: `Semua dokumen gagal: ${catatan.join("; ")}` }));
}

/**
 * Lampirkan PDF sumber (SK/ST) sebagai dokumen bukti kegiatan, sekali saja.
 * Tanpa ini dosen melihat "Tidak ada bukti dokumen" padahal surat tugasnya
 * justru dokumen bukti paling sahih untuk kegiatan tersebut.
 * Mengembalikan true bila baru dilampirkan.
 */
async function lampirkanBukti(
  idKegiatan: string,
  rec: { nama_file: string; file_url: string | null; sha256: string | null; jenis: string },
  nomorSurat: string | null
): Promise<boolean> {
  if (!rec.file_url) return false;

  const sudah = await prisma.dokumen_kegiatan.findFirst({
    where: { id_kegiatan: idKegiatan, file_url: rec.file_url },
  });
  if (sudah) return false;

  const label = LABEL_JENIS[rec.jenis] ?? "Dokumen penugasan";
  await prisma.dokumen_kegiatan.create({
    data: {
      id_kegiatan: idKegiatan,
      nama_dokumen: nomorSurat ? `${label} ${nomorSurat}` : label,
      nama_file: rec.nama_file,
      jenis_file: "application/pdf",
      jenis_dokumen: "SK Penugasan",
      file_url: rec.file_url,
      keterangan:
        "Lampiran otomatis dari unggahan admin" +
        (rec.sha256 ? ` (sha256 ${rec.sha256.slice(0, 16)}…)` : ""),
    },
  });
  return true;
}

/** Cache hasil panggilan kalkulator: satu set parameter identik = satu call RPC. */
function pembungkusHitung() {
  const memo = new Map<string, number | null>();
  return async function hitung(
    fungsi: string | null,
    fields: any[],
    parameter: Record<string, unknown>
  ): Promise<{ sksX100: number | null; status: "berhasil" | "gagal" | "tidak_diotomatisasi" }> {
    if (!fungsi) return { sksX100: null, status: "tidak_diotomatisasi" };

    const nilai: Record<string, string> = {};
    for (const f of fields) nilai[f.name] = String(parameter[f.name] ?? "");
    const kunci = `${fungsi}|${JSON.stringify(nilai)}`;

    if (memo.has(kunci)) {
      const c = memo.get(kunci)!;
      return c === null ? { sksX100: null, status: "gagal" } : { sksX100: c, status: "berhasil" };
    }
    try {
      const hasil = await hitungViaKontrak(fungsi, fields, nilai);
      const n = Number(hasil);
      memo.set(kunci, n);
      return { sksX100: n, status: "berhasil" };
    } catch (e) {
      console.error("Perhitungan kontrak gagal:", e);
      memo.set(kunci, null);
      return { sksX100: null, status: "gagal" };
    }
  };
}

/**
 * Terapkan hasil ekstraksi menjadi kegiatan portofolio dosen (diklaim=false),
 * sehingga dosen menariknya sendiri lewat "Tarik data" di Layanan BKD (R5).
 *
 * Koreksi manual admin ikut diterapkan (judul, parameter, dosen tujuan, baris
 * yang dilewati). Idempoten lewat `detail_kegiatan.tanda_baris`: baris yang
 * sudah pernah dibuat akan DIPERBARUI bila koreksinya berubah — bukan
 * diduplikasi — selama kegiatannya belum diklaim dosen. PDF sumber sekalian
 * dilampirkan sebagai dokumen bukti.
 */
export async function terapkanUnggahan(formData: FormData) {
  await pastikanAdmin();
  const id = String(formData.get("id_unggahan") ?? "");
  const jalur = `${DASAR}/${id}`;
  const kembali = kembaliAman(formData.get("kembali"), id);

  const rec = await prisma.unggahan_dokumen.findUnique({ where: { id_unggahan: id } });
  if (!rec) redirect(withFlash(DASAR, { err: "Unggahan tidak ditemukan" }));
  if (rec!.status === "gagal")
    redirect(withFlash(kembali, { err: "Ekstraksi dokumen ini gagal — tidak ada data untuk diterapkan" }));

  const periode = await prisma.periode_bkd.findFirst({ where: { status: "aktif" } });
  if (!periode) redirect(withFlash(kembali, { err: "Belum ada periode aktif" }));

  const peta = petakanDokumen(rec!.jenis as JenisUnggahan, rec!.hasil_parse);
  if (peta.penugasan.length === 0)
    redirect(withFlash(kembali, { err: "Tidak ada penugasan yang dapat dipetakan dari dokumen ini" }));
  const { penugasan: baris, nomorSurat } = gabungKoreksi(peta, rec!.koreksi);

  const [dosenSistem, referensi] = await Promise.all([
    prisma.pengguna.findMany({
      where: { peran: "dosen", aktif: true },
      select: { id_pengguna: true, nama: true, nip: true, nidn: true, kode_dosen: true },
    }),
    prisma.referensi_kegiatan.findMany({
      where: { kode_rule: { in: [...new Set(peta.penugasan.map((p) => p.kodeRule))] } },
    }),
  ]);
  const cocokkan = buatPencocokDosen(dosenSistem);
  const perKode = new Map(referensi.map((r: any) => [r.kode_rule, r]));

  const hitung = pembungkusHitung();
  const lkdCache = new Map<string, string>(); // id_pengguna -> id_lkd

  async function lkdLaporan(idPengguna: string) {
    const ada = lkdCache.get(idPengguna);
    if (ada) return ada;
    let lkd = await prisma.lkd.findFirst({
      where: { id_pengguna: idPengguna, id_periode: periode!.id_periode, jenis: "laporan" },
    });
    if (!lkd) {
      lkd = await prisma.lkd.create({
        data: { id_pengguna: idPengguna, id_periode: periode!.id_periode, jenis: "laporan" },
      });
    }
    lkdCache.set(idPengguna, lkd.id_lkd);
    return lkd.id_lkd;
  }

  let dibuat = 0;
  let diperbarui = 0;
  let dilewati = 0;
  let dilewatiKoreksi = 0;
  let terkunci = 0;
  let takCocok = 0;
  let tanpaReferensi = 0;
  let gagalHitung = 0;
  let buktiDilampirkan = 0;
  const dosenTersentuh = new Set<string>(); // dosen yang dapat kegiatan baru/berubah
  const dosenCocok = new Set<string>(); // seluruh dosen dokumen yang punya akun

  for (const p of baris) {
    if (p.lewati) {
      dilewatiKoreksi++;
      continue;
    }

    // Koreksi admin boleh memaksa dosen tujuan bila pencocokan otomatis salah.
    const dipaksa = p.idPenggunaPaksa
      ? dosenSistem.find((d) => d.id_pengguna === p.idPenggunaPaksa)
      : null;
    const cocok = dipaksa
      ? ({ status: "cocok", dosen: dipaksa } as const)
      : cocokkan({ nama: p.namaDokumen, nip: p.nip, kodeDosen: p.kodeDosen });
    if (cocok.status !== "cocok") {
      takCocok++;
      continue;
    }
    dosenCocok.add(cocok.dosen.id_pengguna);

    const ref: any = perKode.get(p.kodeRule);
    if (!ref) {
      tanpaReferensi++;
      continue;
    }

    const idLkd = await lkdLaporan(cocok.dosen.id_pengguna);
    const fields: any[] = (ref.skema_parameter as any)?.fields ?? [];
    const { sksX100, status } = await hitung(ref.fungsi_contract, fields, p.parameter);
    if (status === "gagal") gagalHitung++;

    const isi = {
      judul: p.judul,
      detail_kegiatan: { ...p.detail, tanda_baris: p.tanda } as any,
      parameter: p.parameter as any,
      sks_dihitung_x100: sksX100,
      status_perhitungan: status,
    };

    // Baris yang sama (tanda_baris) dari unggahan ini: perbarui, jangan gandakan.
    const adaSebelumnya = await prisma.kegiatan.findFirst({
      where: {
        id_unggahan: rec!.id_unggahan,
        id_lkd: idLkd,
        detail_kegiatan: { path: ["tanda_baris"], equals: p.tanda },
      } as any,
    });
    // Unggahan lama (sebelum ada tanda_baris) tetap dikenali lewat judul.
    const seragam =
      adaSebelumnya ??
      (await prisma.kegiatan.findFirst({
        where: { id_lkd: idLkd, id_referensi: ref.id_referensi, judul: p.judulAsli },
      }));

    let idKegiatan: string;
    if (seragam) {
      if ((seragam as any).diklaim) {
        // Sudah masuk laporan dosen (mungkin sedang/sudah dinilai) — jangan diubah.
        terkunci++;
        continue;
      }
      const berubah =
        seragam.judul !== isi.judul ||
        JSON.stringify(seragam.parameter) !== JSON.stringify(isi.parameter) ||
        seragam.sks_dihitung_x100 !== isi.sks_dihitung_x100;
      if (berubah) {
        await prisma.kegiatan.update({
          where: { id_kegiatan: seragam.id_kegiatan },
          data: isi as any,
        });
        diperbarui++;
        dosenTersentuh.add(cocok.dosen.id_pengguna);
      } else {
        dilewati++;
      }
      idKegiatan = seragam.id_kegiatan;
    } else {
      const dibuatBaru = await prisma.kegiatan.create({
        data: {
          id_lkd: idLkd,
          id_referensi: ref.id_referensi,
          ...isi,
          status: "diajukan",
          sumber_data: "surat_tugas",
          diklaim: false,
          id_unggahan: rec!.id_unggahan,
        } as any,
      });
      idKegiatan = dibuatBaru.id_kegiatan;
      dibuat++;
      dosenTersentuh.add(cocok.dosen.id_pengguna);
    }

    if (await lampirkanBukti(idKegiatan, rec!, nomorSurat)) buktiDilampirkan++;
  }

  await prisma.unggahan_dokumen.update({
    where: { id_unggahan: rec!.id_unggahan },
    data: {
      status: "diterapkan",
      jumlah_kegiatan: { increment: dibuat },
      jumlah_dosen_cocok: dosenCocok.size,
      tanggal_terapkan: new Date(),
    } as any,
  });

  revalidatePath(DASAR);
  revalidatePath(jalur);

  const bagian = [`${dibuat} kegiatan dibuat untuk ${dosenTersentuh.size} dosen`];
  if (diperbarui) bagian.push(`${diperbarui} diperbarui sesuai koreksi`);
  if (buktiDilampirkan) bagian.push(`${buktiDilampirkan} bukti PDF dilampirkan`);
  if (dilewati) bagian.push(`${dilewati} sudah sesuai`);
  if (dilewatiKoreksi) bagian.push(`${dilewatiKoreksi} ditandai lewati oleh admin`);
  if (terkunci) bagian.push(`${terkunci} tidak diubah karena sudah diklaim dosen`);
  if (takCocok) bagian.push(`${takCocok} baris tanpa akun dosen yang cocok`);
  if (tanpaReferensi) bagian.push(`${tanpaReferensi} baris tanpa referensi kegiatan`);
  if (gagalHitung) bagian.push(`${gagalHitung} gagal dihitung kontrak`);
  // Sukses bila ada kegiatan baru/berubah ATAU semuanya memang sudah sesuai
  // (terapkan ulang). Baris tanpa akun dosen dilaporkan di pesan & pratinjau,
  // bukan dianggap kegagalan operasi.
  const sukses = dibuat > 0 || diperbarui > 0 || dilewati > 0;
  redirect(withFlash(kembali, sukses ? { ok: bagian.join(", ") } : { err: bagian.join(", ") }));
}

// ---------------------------------------------------------------------------
// Koreksi manual hasil ekstraksi (sebelum / sesudah diterapkan)
// ---------------------------------------------------------------------------

async function ambilUntukKoreksi(id: string) {
  const rec = await prisma.unggahan_dokumen.findUnique({ where: { id_unggahan: id } });
  if (!rec) redirect(withFlash(DASAR, { err: "Unggahan tidak ditemukan" }));
  if (rec!.status === "gagal")
    redirect(withFlash(`${DASAR}/${id}`, { err: "Ekstraksi gagal — tidak ada baris untuk dikoreksi" }));
  return rec!;
}

async function simpanPetaKoreksi(id: string, peta: PetaKoreksi) {
  const bersih = Object.fromEntries(
    Object.entries(peta).filter(([, v]) => v && Object.keys(v).length > 0)
  );
  await prisma.unggahan_dokumen.update({
    where: { id_unggahan: id },
    data: { koreksi: (Object.keys(bersih).length ? bersih : null) as any } as any,
  });
}

/**
 * Simpan koreksi satu baris hasil ekstraksi: judul, parameter perhitungan,
 * dosen tujuan, atau tandai agar tidak diterapkan. Hanya selisih terhadap hasil
 * parser yang disimpan, sehingga `hasil_parse` tetap jadi pembanding.
 */
export async function simpanKoreksiBaris(formData: FormData) {
  await pastikanAdmin();
  const id = String(formData.get("id_unggahan") ?? "");
  const tanda = String(formData.get("tanda") ?? "");
  const kembali = kembaliAman(formData.get("kembali"), id);
  if (!tanda) redirect(withFlash(kembali, { err: "Baris tidak dikenal" }));

  const rec = await ambilUntukKoreksi(id);
  const peta = petakanDokumen(rec.jenis as JenisUnggahan, rec.hasil_parse);
  const asli = peta.penugasan.find((p) => p.tanda === tanda);
  if (!asli) redirect(withFlash(kembali, { err: "Baris tidak ditemukan pada hasil ekstraksi" }));

  const ref = await prisma.referensi_kegiatan.findUnique({
    where: { kode_rule: asli!.kodeRule },
  });
  // Parameter yang dikunci periode (jumlahSemester) tidak dikoreksi lewat form.
  const fields: any[] = fieldFormulir((ref?.skema_parameter as any)?.fields ?? []);

  // Hanya nilai yang BERBEDA dari hasil parser disimpan sebagai koreksi.
  const parameter: Record<string, unknown> = {};
  for (const f of fields) {
    const mentah = formData.get(`p_${f.name}`);
    if (mentah === null && f.type !== "boolean") continue;
    const nilai =
      f.type === "boolean"
        ? mentah === "on" || mentah === "true"
        : f.type === "number"
          ? Number(String(mentah ?? ""))
          : String(mentah ?? "");
    if (f.type === "number" && !Number.isFinite(nilai as number)) continue;
    if (String(nilai) !== String(asli!.parameter[f.name])) parameter[f.name] = nilai;
  }

  const judul = String(formData.get("judul") ?? "").trim();
  const idPengguna = String(formData.get("id_pengguna") ?? "").trim();
  const lewati = formData.get("lewati") === "on";

  const koreksi: KoreksiBaris = {};
  if (judul && judul !== asli!.judul) koreksi.judul = judul;
  if (idPengguna) koreksi.id_pengguna = idPengguna;
  if (Object.keys(parameter).length) koreksi.parameter = parameter;
  if (lewati) koreksi.lewati = true;

  const petaKoreksi: PetaKoreksi = { ...((rec.koreksi as PetaKoreksi) ?? {}) };
  if (Object.keys(koreksi).length) petaKoreksi[tanda] = koreksi;
  else delete petaKoreksi[tanda];

  await simpanPetaKoreksi(id, petaKoreksi);
  revalidatePath(`${DASAR}/${id}`);
  redirect(
    withFlash(kembali, {
      ok: Object.keys(koreksi).length
        ? "Koreksi baris disimpan. Tekan Terapkan agar perubahan masuk ke LKD dosen."
        : "Baris dikembalikan ke hasil ekstraksi asli.",
    })
  );
}

/** Kembalikan satu baris ke hasil parser (hapus koreksinya). */
export async function resetKoreksiBaris(formData: FormData) {
  await pastikanAdmin();
  const id = String(formData.get("id_unggahan") ?? "");
  const tanda = String(formData.get("tanda") ?? "");
  const kembali = kembaliAman(formData.get("kembali"), id);
  const rec = await ambilUntukKoreksi(id);

  const petaKoreksi: PetaKoreksi = { ...((rec.koreksi as PetaKoreksi) ?? {}) };
  delete petaKoreksi[tanda];
  await simpanPetaKoreksi(id, petaKoreksi);

  revalidatePath(`${DASAR}/${id}`);
  redirect(withFlash(kembali, { ok: "Baris dikembalikan ke hasil ekstraksi asli" }));
}

/** Koreksi nomor/tanggal surat — sering salah baca pada dokumen pindai. */
export async function simpanKoreksiSurat(formData: FormData) {
  await pastikanAdmin();
  const id = String(formData.get("id_unggahan") ?? "");
  const kembali = kembaliAman(formData.get("kembali"), id);
  const rec = await ambilUntukKoreksi(id);
  const peta = petakanDokumen(rec.jenis as JenisUnggahan, rec.hasil_parse);

  const nomor = String(formData.get("nomor_surat") ?? "").trim();
  const tanggal = String(formData.get("tanggal_surat") ?? "").trim();

  const surat: { nomor?: string; tanggal?: string } = {};
  if (nomor && nomor !== peta.nomorSurat) surat.nomor = nomor;
  if (tanggal && tanggal !== peta.tanggalSurat) surat.tanggal = tanggal;

  const petaKoreksi: PetaKoreksi = { ...((rec.koreksi as PetaKoreksi) ?? {}) };
  if (Object.keys(surat).length) petaKoreksi._surat = surat;
  else delete petaKoreksi._surat;

  await simpanPetaKoreksi(id, petaKoreksi);
  // nomor surat yang tampil di daftar ikut menyesuaikan
  await prisma.unggahan_dokumen.update({
    where: { id_unggahan: id },
    data: { nomor_surat: surat.nomor ?? peta.nomorSurat },
  });

  revalidatePath(`${DASAR}/${id}`);
  revalidatePath(DASAR);
  redirect(withFlash(kembali, { ok: "Nomor & tanggal surat diperbarui" }));
}

/** Hapus unggahan yang belum diterapkan (berkas fisik dibiarkan sebagai arsip). */
export async function hapusUnggahan(formData: FormData) {
  await pastikanAdmin();
  const id = String(formData.get("id_unggahan") ?? "");

  const rec = await prisma.unggahan_dokumen.findUnique({ where: { id_unggahan: id } });
  if (!rec) redirect(withFlash(DASAR, { err: "Unggahan tidak ditemukan" }));
  if (rec!.status === "diterapkan")
    redirect(
      withFlash(DASAR, {
        err: "Unggahan yang sudah diterapkan tidak dapat dihapus (kegiatan dosen mengacu padanya)",
      })
    );

  await prisma.unggahan_dokumen.delete({ where: { id_unggahan: id } });
  revalidatePath(DASAR);
  redirect(withFlash(DASAR, { ok: "Unggahan dihapus" }));
}
