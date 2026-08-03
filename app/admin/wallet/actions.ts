"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import { deriveDosenWallet } from "../../../lib/blockchain";
import { withFlash } from "../../../lib/flash";

const DASAR = "/admin/wallet";

/**
 * FR-04: tetapkan satu wallet address per akun dosen.
 * Index HD diambil dari nilai terbesar yang sudah terpakai + 1,
 * address diturunkan deterministik dari WALLET_MNEMONIC server.
 */
export async function tetapkanWallet(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect(withFlash(DASAR, { err: "Pengguna tidak dikenal" }));

  const user = await prisma.pengguna.findUnique({ where: { id_pengguna: id } });
  if (!user || user.peran !== "dosen")
    redirect(withFlash(DASAR, { err: "Wallet hanya untuk akun dosen" }));
  if (user!.wallet_index != null)
    redirect(withFlash(DASAR, { err: `${user!.nama} sudah memiliki wallet` }));

  const max = await prisma.pengguna.aggregate({ _max: { wallet_index: true } });
  const nextIndex = (max._max.wallet_index ?? -1) + 1;

  let address: string;
  try {
    address = deriveDosenWallet(nextIndex).address;
  } catch (e: any) {
    redirect(withFlash(DASAR, { err: String(e?.message ?? e) }));
  }

  await prisma.pengguna.update({
    where: { id_pengguna: id },
    data: { wallet_index: nextIndex, alamat_wallet: address! },
  });
  revalidatePath(DASAR);
  revalidatePath("/admin/pengguna");
  redirect(withFlash(DASAR, { ok: `Wallet untuk ${user!.nama} ditetapkan (index ${nextIndex})` }));
}
