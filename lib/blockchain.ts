import {
  JsonRpcProvider,
  Wallet,
  HDNodeWallet,
  Mnemonic,
  keccak256,
  toUtf8Bytes,
} from "ethers";
import {
  KalkulatorBKDPendidikan__factory,
  BKDSKSToken__factory,
} from "../types/ethers-contracts";

/**
 * Satu-satunya pintu aplikasi ke blockchain (arsitektur custodial):
 * - Semua transaksi ditandatangani signer backend (ADMIN_PRIVATE_KEY).
 * - Wallet dosen diturunkan dari satu HD mnemonic server (WALLET_MNEMONIC),
 *   dosen tidak pernah memegang private key (Constraint #5 SRS).
 */

const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";

let _provider: JsonRpcProvider | null = null;

export function getProvider(): JsonRpcProvider {
  if (!_provider) _provider = new JsonRpcProvider(RPC_URL);
  return _provider;
}

export function getAdminSigner(): Wallet {
  const pk = process.env.ADMIN_PRIVATE_KEY;
  if (!pk) throw new Error("ADMIN_PRIVATE_KEY belum diset di environment");
  return new Wallet(pk, getProvider());
}

export function getKalkulatorContract() {
  const address = process.env.NEXT_PUBLIC_BKD_CONTRACT_ADDRESS;
  if (!address) throw new Error("NEXT_PUBLIC_BKD_CONTRACT_ADDRESS belum diset");
  // Fungsi kalkulator seluruhnya `pure` - cukup provider (read-only call)
  return KalkulatorBKDPendidikan__factory.connect(address, getProvider());
}

export function getTokenContract() {
  const address = process.env.NEXT_PUBLIC_SKS_TOKEN_ADDRESS;
  if (!address) throw new Error("NEXT_PUBLIC_SKS_TOKEN_ADDRESS belum diset");
  // Mint/burn butuh signer dengan MINTER_ROLE / DEFAULT_ADMIN_ROLE
  return BKDSKSToken__factory.connect(address, getAdminSigner());
}

/**
 * Derivasi wallet custodial dosen: m/44'/60'/0'/0/{index}.
 * Hanya address yang disimpan di DB; private key tidak pernah keluar dari server.
 */
export function deriveDosenWallet(index: number): { address: string; path: string } {
  const phrase = process.env.WALLET_MNEMONIC;
  if (!phrase) throw new Error("WALLET_MNEMONIC belum diset di environment");
  const path = `m/44'/60'/0'/0/${index}`;
  const wallet = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(phrase), path);
  return { address: wallet.address, path };
}

/**
 * Hash penilaian untuk jejak on-chain (mekanisme referenceId):
 * keccak256 atas JSON kanonis simpulan/hasil penilaian.
 * Hash ini dikirim sebagai `referenceId` pada mint() sehingga tercatat
 * permanen di event SKSMinted dan dapat diverifikasi ulang oleh siapa pun.
 */
export function hashPenilaian(payload: unknown): string {
  const canonical = JSON.stringify(payload, Object.keys(payload as object).sort());
  return keccak256(toUtf8Bytes(canonical));
}

/**
 * Panggil fungsi kalkulator (pure) di Rule Engine Contract secara dinamis
 * berdasarkan skema_parameter referensi kegiatan.
 * - number  -> BigInt
 * - boolean -> bool
 * - select  -> index opsi (urutan opsi seed = urutan enum Solidity)
 * Mengembalikan nilai SKS dalam skala x100.
 */
export async function hitungViaKontrak(
  fungsi: string,
  fields: { name: string; type: string; options?: string[] }[],
  values: Record<string, string>
): Promise<bigint> {
  const contract = getKalkulatorContract() as any;
  if (typeof contract[fungsi] !== "function") {
    throw new Error(`Fungsi kontrak tidak dikenal: ${fungsi}`);
  }
  const args = fields.map((f) => {
    const raw = values[f.name];
    if (f.type === "boolean") return raw === "true" || raw === "on";
    if (f.type === "select") {
      const idx = (f.options ?? []).indexOf(raw);
      if (idx < 0) throw new Error(`Opsi tidak valid untuk ${f.name}: ${raw}`);
      return BigInt(idx);
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) throw new Error(`Nilai tidak valid untuk ${f.name}`);
    return BigInt(Math.round(n));
  });
  const hasil: bigint = await contract[fungsi](...args);
  return hasil;
}

/**
 * Mint token SKS ke wallet dosen setelah simpulan final disahkan.
 * @param jumlahX100 nilai SKS dalam skala x100 (1 SKS = 100), konsisten dengan kontrak
 */
export async function mintSks(alamatDosen: string, jumlahX100: bigint, referenceId: string) {
  const token = getTokenContract();
  const tx = await token.mint(alamatDosen, jumlahX100, referenceId);
  const receipt = await tx.wait();
  return { txHash: tx.hash, blockNumber: receipt?.blockNumber ?? null };
}

/**
 * Burn token untuk koreksi (hanya admin).
 */
export async function burnSks(alamatDosen: string, jumlahX100: bigint, alasan: string) {
  const token = getTokenContract();
  const tx = await token.burn(alamatDosen, jumlahX100, alasan);
  const receipt = await tx.wait();
  return { txHash: tx.hash, blockNumber: receipt?.blockNumber ?? null };
}
