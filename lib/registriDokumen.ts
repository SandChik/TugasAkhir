import crypto from "crypto";
import { readFile } from "fs/promises";
import path from "path";
import { keccak256, toUtf8Bytes } from "ethers";
import { prisma } from "./prisma";
import { catatDokumen, type AksiDokumen } from "./blockchain";

/**
 * Jembatan aksi dokumen ke registri on-chain (BKDDokumenRegistri):
 * unggah/terapkan/hapus dokumen dicatat sebagai event permanen, plus satu baris
 * riwayat_transaksi (jenis catat_dokumen) sebagai penunjuk pelaku dan konteks.
 */

/** Hash isi Buffer berkas (sha256 hex), identitas dokumen di registri. */
export const hashIsiBerkas = (bytes: Buffer): string =>
  crypto.createHash("sha256").update(bytes).digest("hex");

/**
 * Hash identitas dari file_url: sha256 isi berkas lokal bila terbaca,
 * selain itu (tautan eksternal / berkas hilang) keccak256 atas URL-nya.
 */
export async function hashBerkasBukti(fileUrl: string): Promise<string> {
  if (fileUrl.startsWith("/uploads/")) {
    try {
      const data = await readFile(
        path.join(process.cwd(), "public", fileUrl.replace(/^\/+/, ""))
      );
      return hashIsiBerkas(data);
    } catch {
      // berkas tidak terbaca; jatuhkan ke hash URL supaya tetap tercatat
    }
  }
  return keccak256(toUtf8Bytes(fileUrl)).slice(2);
}

/**
 * Catat ke registri on-chain + riwayat_transaksi. Best-effort: kegagalan RPC
 * tidak menggagalkan aksi pengguna, percobaannya tetap tercatat di riwayat
 * berstatus failed.
 */
export async function catatDokumenDenganRiwayat(opsi: {
  hashHex: string;
  aksi: AksiDokumen;
  /** Penunjuk baris sistem, mis. "unggahan:<id>" / "bukti:<id_dokumen>" */
  referensi: string;
  /** Konteks terbaca manusia (nama dokumen), tersimpan di riwayat */
  keterangan: string;
  idPengguna?: string | null;
}): Promise<boolean> {
  let txHash: string | null = null;
  let status: "success" | "failed" = "failed";
  let contractAddress: string | null =
    process.env.NEXT_PUBLIC_DOKUMEN_REGISTRI_ADDRESS ?? null;

  try {
    const res = await catatDokumen(opsi.hashHex, opsi.aksi, opsi.referensi);
    txHash = res.txHash;
    contractAddress = res.contractAddress;
    status = "success";
  } catch (e) {
    console.error(`catatDokumen ${opsi.aksi} gagal:`, e);
  }

  try {
    await prisma.riwayat_transaksi.create({
      data: {
        jenis_transaksi: "catat_dokumen",
        contract_address: contractAddress,
        tx_hash: txHash,
        reference_id: opsi.referensi,
        alasan: `${opsi.aksi}: ${opsi.keterangan}`,
        status,
        id_admin: opsi.idPengguna ?? null,
      },
    });
  } catch (e) {
    console.error("riwayat catat_dokumen gagal disimpan:", e);
  }
  return status === "success";
}
