"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { withFlash } from "../../../lib/flash";

const DASAR = "/admin/penugasan-asesor";

/** URL kembali dari formulir — divalidasi agar tidak jadi open redirect. */
function kembaliAman(raw: unknown) {
  const s = String(raw ?? "");
  return s === DASAR || s.startsWith(`${DASAR}?`) ? s : DASAR;
}

async function pastikanAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).peran !== "admin") redirect("/login");
}

/**
 * Akun yang boleh ditugaskan: peran asesor, aktif, dan bukan pemilik LKD itu
 * sendiri. Dicek di server karena isi <select> dari browser bisa dipalsukan.
 */
async function pastikanAsesorSah(ids: string[], idPemilikLkd: string, kembali: string) {
  if (ids.length === 0) return;
  const akun = await prisma.pengguna.findMany({
    where: { id_pengguna: { in: ids } },
    select: { id_pengguna: true, peran: true, aktif: true },
  });
  const perId = new Map(akun.map((a: any) => [a.id_pengguna, a]));
  for (const id of ids) {
    const a: any = perId.get(id);
    if (!a || a.peran !== "asesor" || !a.aktif)
      redirect(withFlash(kembali, { err: "Hanya akun asesor yang aktif dapat ditugaskan" }));
    if (id === idPemilikLkd)
      redirect(withFlash(kembali, { err: "Dosen tidak boleh menilai LKD miliknya sendiri" }));
  }
}

/**
 * Tetapkan asesor ke-1 dan ke-2 untuk satu LKD.
 *
 * Slot yang asesornya sudah mulai menilai (punya hasil penilaian) atau sudah
 * mengesahkan tidak boleh diganti — hasil penilaiannya akan kehilangan induk.
 * Penghapusan dan pembuatan dijalankan dalam satu transaksi agar menukar
 * asesor ke-1 <-> ke-2 tidak melanggar keunikan (id_lkd, id_asesor).
 */
export async function simpanPenugasan(formData: FormData) {
  await pastikanAdmin();
  const idLkd = String(formData.get("id_lkd") ?? "");
  const kembali = kembaliAman(formData.get("kembali"));
  const pilihan = [1, 2].map((u) => String(formData.get(`asesor_${u}`) ?? "").trim());

  const lkd = await prisma.lkd.findUnique({
    where: { id_lkd: idLkd },
    include: {
      pengguna: { select: { nama: true } },
      penugasan_asesor: { include: { _count: { select: { hasil_penilaian: true } } } },
    },
  });
  if (!lkd) redirect(withFlash(kembali, { err: "LKD tidak ditemukan" }));

  if (pilihan[0] && pilihan[0] === pilihan[1])
    redirect(withFlash(kembali, { err: "Asesor ke-1 dan ke-2 harus orang yang berbeda" }));

  await pastikanAsesorSah(pilihan.filter(Boolean), lkd!.id_pengguna, kembali);

  const perUrutan = new Map(lkd!.penugasan_asesor.map((p: any) => [p.urutan, p]));
  const hapus: string[] = [];
  const buat: { urutan: number; id_asesor: string }[] = [];
  const berubah: string[] = [];

  for (const urutan of [1, 2]) {
    const ada: any = perUrutan.get(urutan);
    const target = pilihan[urutan - 1];
    if ((ada?.id_asesor ?? "") === target) continue;
    if (ada && (ada.disahkan || ada._count.hasil_penilaian > 0))
      redirect(
        withFlash(kembali, {
          err: `Asesor ke-${urutan} sudah menilai LKD ini — penugasannya tidak dapat diganti`,
        })
      );
    if (ada) hapus.push(ada.id_penugasan);
    if (target) buat.push({ urutan, id_asesor: target });
    berubah.push(`ke-${urutan}`);
  }

  if (berubah.length === 0) redirect(withFlash(kembali, { ok: "Tidak ada perubahan penugasan" }));

  await prisma.$transaction([
    ...(hapus.length
      ? [prisma.penugasan_asesor.deleteMany({ where: { id_penugasan: { in: hapus } } })]
      : []),
    ...buat.map((b) => prisma.penugasan_asesor.create({ data: { id_lkd: idLkd, ...b } })),
  ]);

  revalidatePath(DASAR);
  revalidatePath("/asesor/asesor-bkd");
  redirect(
    withFlash(kembali, {
      ok: `Asesor ${berubah.join(" & ")} untuk ${lkd!.pengguna.nama} disimpan`,
    })
  );
}

/**
 * Isi sekaligus semua slot asesor yang masih kosong pada periode aktif.
 * Hanya MENGISI yang kosong — penugasan yang sudah ada tidak pernah ditimpa,
 * jadi aman ditekan berulang kali.
 */
export async function tugaskanMassal(formData: FormData) {
  await pastikanAdmin();
  const kembali = kembaliAman(formData.get("kembali"));
  const pilihan = [1, 2].map((u) => String(formData.get(`asesor_${u}`) ?? "").trim());

  if (!pilihan[0] || !pilihan[1])
    redirect(withFlash(kembali, { err: "Pilih asesor ke-1 dan ke-2 terlebih dahulu" }));
  if (pilihan[0] === pilihan[1])
    redirect(withFlash(kembali, { err: "Asesor ke-1 dan ke-2 harus orang yang berbeda" }));

  const periode = await prisma.periode_bkd.findFirst({ where: { status: "aktif" } });
  if (!periode) redirect(withFlash(kembali, { err: "Belum ada periode aktif" }));

  const akun = await prisma.pengguna.findMany({
    where: { id_pengguna: { in: pilihan }, peran: "asesor", aktif: true },
    select: { id_pengguna: true },
  });
  if (akun.length !== 2)
    redirect(withFlash(kembali, { err: "Hanya akun asesor yang aktif dapat ditugaskan" }));

  const daftar = await prisma.lkd.findMany({
    where: { id_periode: periode!.id_periode, jenis: "laporan" },
    include: { penugasan_asesor: { select: { urutan: true, id_asesor: true } } },
  });

  const baru: { id_lkd: string; urutan: number; id_asesor: string }[] = [];
  let dilewati = 0;

  for (const lkd of daftar as any[]) {
    const terpakai = new Set(lkd.penugasan_asesor.map((p: any) => p.id_asesor));
    const perUrutan = new Map(lkd.penugasan_asesor.map((p: any) => [p.urutan, p]));
    for (const urutan of [1, 2]) {
      if (perUrutan.has(urutan)) continue;
      const id = pilihan[urutan - 1];
      // Lewati bila asesor itu sudah mengisi slot lain di LKD yang sama, atau
      // ia sendiri pemilik LKD-nya.
      if (terpakai.has(id) || id === lkd.id_pengguna) {
        dilewati++;
        continue;
      }
      terpakai.add(id);
      baru.push({ id_lkd: lkd.id_lkd, urutan, id_asesor: id });
    }
  }

  if (baru.length === 0)
    redirect(
      withFlash(kembali, {
        ok: dilewati
          ? `Tidak ada slot yang bisa diisi otomatis (${dilewati} bentrok dengan pemilik LKD-nya)`
          : "Semua slot asesor sudah terisi",
      })
    );

  await prisma.penugasan_asesor.createMany({ data: baru });

  revalidatePath(DASAR);
  revalidatePath("/asesor/asesor-bkd");
  redirect(
    withFlash(kembali, {
      ok:
        `${baru.length} slot asesor terisi` +
        (dilewati ? `, ${dilewati} slot dilewati karena bentrok` : ""),
    })
  );
}

/** Lepas seluruh penugasan pada satu LKD (hanya bila belum ada penilaian). */
export async function hapusPenugasan(formData: FormData) {
  await pastikanAdmin();
  const idLkd = String(formData.get("id_lkd") ?? "");
  const kembali = kembaliAman(formData.get("kembali"));

  const lkd = await prisma.lkd.findUnique({
    where: { id_lkd: idLkd },
    include: {
      pengguna: { select: { nama: true } },
      penugasan_asesor: { include: { _count: { select: { hasil_penilaian: true } } } },
    },
  });
  if (!lkd) redirect(withFlash(kembali, { err: "LKD tidak ditemukan" }));
  if (lkd!.penugasan_asesor.length === 0)
    redirect(withFlash(kembali, { err: "LKD ini belum punya penugasan asesor" }));
  if (lkd!.penugasan_asesor.some((p: any) => p.disahkan || p._count.hasil_penilaian > 0))
    redirect(
      withFlash(kembali, { err: "Penilaian sudah berjalan — penugasan tidak dapat dilepas" })
    );

  await prisma.penugasan_asesor.deleteMany({ where: { id_lkd: idLkd } });
  revalidatePath(DASAR);
  revalidatePath("/asesor/asesor-bkd");
  redirect(withFlash(kembali, { ok: `Penugasan asesor ${lkd!.pengguna.nama} dilepas` }));
}
