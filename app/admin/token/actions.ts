"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { burnSks, getTokenContract } from "../../../lib/blockchain";

/**
 * FR-18: burn token SKS untuk koreksi kelebihan penerbitan.
 * Transaksi dicatat ke riwayat_transaksi apa pun hasilnya (success/failed).
 */
export async function burnToken(formData: FormData) {
  const session = await getServerSession(authOptions);
  const idDosen = String(formData.get("id_dosen") ?? "");
  const jumlahSks = parseFloat(String(formData.get("jumlah_sks") ?? "0"));
  const alasan = String(formData.get("alasan") ?? "").trim();

  if (!idDosen || !alasan || !(jumlahSks > 0)) return;

  const dosen = await prisma.pengguna.findUnique({ where: { id_pengguna: idDosen } });
  if (!dosen?.alamat_wallet) return;

  const jumlahX100 = BigInt(Math.round(jumlahSks * 100));

  let txHash: string | null = null;
  let status: "success" | "failed" = "failed";
  let contractAddress: string | null = null;

  try {
    contractAddress = await getTokenContract().getAddress();
    const res = await burnSks(dosen.alamat_wallet, jumlahX100, alasan);
    txHash = res.txHash;
    status = "success";
  } catch (e) {
    console.error("burnToken gagal:", e);
  }

  await prisma.riwayat_transaksi.create({
    data: {
      jenis_transaksi: "burn",
      contract_address: contractAddress,
      tx_hash: txHash,
      jumlah_token_x100: Number(jumlahX100),
      alamat_wallet: dosen.alamat_wallet,
      alasan,
      status,
      id_admin: session?.user.id ?? null,
    },
  });
  revalidatePath("/admin/token");
}
