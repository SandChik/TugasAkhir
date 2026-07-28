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
  if (!_provider) {
    // batchMaxCount: 1 -> matikan auto-batching JSON-RPC bawaan ethers.
    // Banyak RPC publik free-tier (drpc dkk) menolak batch > 3 request sekaligus,
    // dan ethers otomatis menggabungkan panggilan concurrent (mis. Promise.all)
    // jadi satu batch request jika ini tidak dimatikan.
    _provider = new JsonRpcProvider(RPC_URL, undefined, { batchMaxCount: 1 });
  }
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

// Mnemonic default yang dipakai semua node/tutorial Hardhat di dunia - siapa pun
// bisa menurunkan address & private key yang sama persis dari frasa ini.
const DEFAULT_HARDHAT_MNEMONIC =
  "test test test test test test test test test test test junk";

/**
 * Derivasi wallet custodial dosen: m/44'/60'/0'/0/{index}.
 * Hanya address yang disimpan di DB; private key tidak pernah keluar dari server.
 */
export function deriveDosenWallet(index: number): { address: string; path: string } {
  const phrase = process.env.WALLET_MNEMONIC;
  if (!phrase) throw new Error("WALLET_MNEMONIC belum diset di environment");

  if (phrase.trim() === DEFAULT_HARDHAT_MNEMONIC && process.env.NEXT_PUBLIC_CHAIN_ID !== "31337") {
    throw new Error(
      "WALLET_MNEMONIC masih memakai mnemonic default Hardhat (publik, dipakai semua orang di dunia). " +
        "Address yang diturunkan darinya akan bentrok dengan pengguna lain di jaringan publik. " +
        "Generate mnemonic baru & rahasia sebelum pakai di Base Sepolia atau jaringan publik lain."
    );
  }

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
 * Banyak RPC publik (mis. free tier drpc/Alchemy/Infura) menolak eth_getLogs
 * dengan rentang > 10.000 block sekali panggil. Base Sepolia sudah punya
 * jutaan block, jadi query dari block 0 langsung gagal (code 35: "ranges
 * over 10000 blocks are not supported on free plan"). Pecah jadi beberapa
 * window kecil, mulai dari block deploy kontrak (bukan 0), lalu digabung.
 */
const MAX_BLOCK_RANGE = 10_000;

async function queryFilterChunked(
  contract: ReturnType<typeof BKDSKSToken__factory.connect>,
  filter: ReturnType<ReturnType<typeof BKDSKSToken__factory.connect>["filters"]["SKSMinted" | "SKSBurned"]>,
  fromBlock: number,
  toBlock: number
) {
  const events = [];
  for (let start = fromBlock; start <= toBlock; start += MAX_BLOCK_RANGE) {
    const end = Math.min(start + MAX_BLOCK_RANGE - 1, toBlock);
    events.push(...(await contract.queryFilter(filter, start, end)));
  }
  return events;
}

/**
 * R10: baca event on-chain (SKSMinted / SKSBurned) langsung dari kontrak token.
 * Dipakai halaman Log Blockchain admin — sumber kebenaran on-chain, bukan DB.
 */
export async function bacaEventToken(maksimal = 100) {
  const address = process.env.NEXT_PUBLIC_SKS_TOKEN_ADDRESS;
  if (!address) return [];
  const token = BKDSKSToken__factory.connect(address, getProvider());

  const fromBlock = Number(process.env.NEXT_PUBLIC_SKS_TOKEN_DEPLOY_BLOCK || 0);
  const toBlock = await getProvider().getBlockNumber();

  const [minted, burned] = await Promise.all([
    queryFilterChunked(token, token.filters.SKSMinted(), fromBlock, toBlock),
    queryFilterChunked(token, token.filters.SKSBurned(), fromBlock, toBlock),
  ]);

  const rows = [
    ...minted.map((e: any) => ({
      jenis: "mint" as const,
      operator: e.args?.operator as string,
      akun: e.args?.recipient as string,
      jumlahX100: Number(e.args?.amount ?? 0n),
      referensi: e.args?.referenceId as string,
      txHash: e.transactionHash,
      block: e.blockNumber,
    })),
    ...burned.map((e: any) => ({
      jenis: "burn" as const,
      operator: e.args?.operator as string,
      akun: e.args?.account as string,
      jumlahX100: Number(e.args?.amount ?? 0n),
      referensi: e.args?.reason as string,
      txHash: e.transactionHash,
      block: e.blockNumber,
    })),
  ];
  rows.sort((a, b) => b.block - a.block);
  return rows.slice(0, maksimal);
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
