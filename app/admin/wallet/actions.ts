"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../../lib/prisma";
import { deriveDosenWallet } from "../../../lib/blockchain";

/**
 * FR-04: tetapkan satu wallet address per akun dosen.
 * Index HD diambil dari nilai terbesar yang sudah terpakai + 1,
 * address diturunkan deterministik dari WALLET_MNEMONIC server.
 */
export async function tetapkanWallet(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const user = await prisma.pengguna.findUnique({ where: { id_pengguna: id } });
  if (!user || user.peran !== "dosen" || user.wallet_index != null) return;

  const max = await prisma.pengguna.aggregate({ _max: { wallet_index: true } });
  const nextIndex = (max._max.wallet_index ?? -1) + 1;
  const { address } = deriveDosenWallet(nextIndex);

  await prisma.pengguna.update({
    where: { id_pengguna: id },
    data: { wallet_index: nextIndex, alamat_wallet: address },
  });
  revalidatePath("/admin/wallet");
  revalidatePath("/admin/pengguna");
}
