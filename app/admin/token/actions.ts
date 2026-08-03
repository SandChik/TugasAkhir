"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { burnSks, getTokenContract } from "../../../lib/blockchain";
import { withFlash } from "../../../lib/flash";

const DASAR = "/admin/token";

/**
 * FR-18: burn token SKS untuk koreksi kelebihan penerbitan.
 * Transaksi dicatat ke riwayat_transaksi apa pun hasilnya (success/failed).
 */
export async function burnToken(formData: FormData) {
  const session = await getServerSession(authOptions);
  const idDosen = String(formData.get("id_dosen") ?? "");
  const jumlahSks = parseFloat(String(formData.get("jumlah_sks") ?? "0"));
  const alasan = String(formData.get("alasan") ?? "").trim();

  if (!idDosen || !alasan || !(jumlahSks > 0))
    redirect(withFlash(DASAR, { err: "Lengkapi dosen, jumlah SKS, dan alasan koreksi" }));

  const dosen = await prisma.pengguna.findUnique({ where: { id_pengguna: idDosen } });
  if (!dosen?.alamat_wallet)
    redirect(withFlash(DASAR, { err: "Dosen tersebut belum memiliki wallet" }));

  const jumlahX100 = BigInt(Math.round(jumlahSks * 100));

  let txHash: string | null = null;
  let status: "success" | "failed" = "failed";
  let contractAddress: string | null = null;
  let galat = "";

  try {
    contractAddress = await getTokenContract().getAddress();
    const res = await burnSks(dosen!.alamat_wallet!, jumlahX100, alasan);
    txHash = res.txHash;
    status = "success";
  } catch (e: any) {
    console.error("burnToken gagal:", e);
    // Pesan revert kontrak (mis. saldo kurang) jauh lebih berguna bagi admin
    // daripada stack trace ethers yang panjang.
    galat = String(e?.shortMessage ?? e?.reason ?? e?.message ?? e).slice(0, 200);
  }

  await prisma.riwayat_transaksi.create({
    data: {
      jenis_transaksi: "burn",
      contract_address: contractAddress,
      tx_hash: txHash,
      jumlah_token_x100: Number(jumlahX100),
      alamat_wallet: dosen!.alamat_wallet,
      alasan,
      status,
      id_admin: session?.user.id ?? null,
    },
  });
  revalidatePath(DASAR);
  revalidatePath("/admin/log-blockchain");

  redirect(
    withFlash(
      DASAR,
      status === "success"
        ? { ok: `${jumlahSks.toFixed(2)} SKS diburn dari wallet ${dosen!.nama}` }
        : { err: `Burn gagal${galat ? `: ${galat}` : ""}. Transaksi tercatat berstatus failed.` }
    )
  );
}
