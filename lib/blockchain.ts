import {
  BaseContract,
  JsonRpcProvider,
  Wallet,
  HDNodeWallet,
  Mnemonic,
  keccak256,
  toUtf8Bytes,
  formatUnits,
} from "ethers";
import {
  KalkulatorBKDPendidikan__factory,
  BKDSKSToken__factory,
  BKDDokumenRegistri__factory,
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

let _providerLog: JsonRpcProvider | null = null;

/**
 * Provider khusus pembacaan event. RPC transaksi tidak harus menyimpan riwayat
 * log penuh: node publik umumnya memangkas log lama (publicnode hanya menyimpan
 * sekitar 110.000 block terakhir), sehingga mint/burn lama terbaca kosong tanpa
 * error. `RPC_LOGS_URL` diisi gateway arsip yang menyimpan log sejak deploy dan
 * menerima rentang block penuh sekali panggil. Bila kosong, jatuh ke RPC utama.
 */
export function getProviderLog(): JsonRpcProvider {
  const url = process.env.RPC_LOGS_URL;
  if (!url) return getProvider();
  if (!_providerLog) {
    _providerLog = new JsonRpcProvider(url, undefined, { batchMaxCount: 1 });
  }
  return _providerLog;
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

export function getRegistriContract() {
  const address = process.env.NEXT_PUBLIC_DOKUMEN_REGISTRI_ADDRESS;
  if (!address) throw new Error("NEXT_PUBLIC_DOKUMEN_REGISTRI_ADDRESS belum diset");
  // catat() butuh signer dengan PENCATAT_ROLE
  return BKDDokumenRegistri__factory.connect(address, getAdminSigner());
}

export type AksiDokumen = "unggah" | "terapkan" | "hapus";

/**
 * Catat peristiwa dokumen (unggah/terapkan/hapus) ke registri on-chain.
 * `hashHex` = hex 32 byte identitas berkas (sha256 isi, atau keccak256 URL
 * untuk bukti berupa tautan), dengan atau tanpa awalan 0x.
 */
export async function catatDokumen(hashHex: string, aksi: AksiDokumen, referensi: string) {
  const registri = getRegistriContract();
  const hash = hashHex.startsWith("0x") ? hashHex : `0x${hashHex}`;
  const tx = await registri.catat(hash, aksi, referensi);
  const receipt = await tx.wait();
  return {
    txHash: tx.hash,
    blockNumber: receipt?.blockNumber ?? null,
    contractAddress: await registri.getAddress(),
  };
}

/**
 * Baca event DokumenTercatat langsung dari registri on-chain (halaman Log
 * Blockchain admin). Rentang block disapu lewat `sapuEvent`, sama dengan
 * event token.
 */
export async function bacaEventDokumen(maksimal = 200) {
  const address = process.env.NEXT_PUBLIC_DOKUMEN_REGISTRI_ADDRESS;
  if (!address) return { kontrak: null, baris: [], total: 0 };
  const registri = BKDDokumenRegistri__factory.connect(address, getProviderLog());

  const fromBlock = Number(process.env.NEXT_PUBLIC_DOKUMEN_REGISTRI_DEPLOY_BLOCK || 0);
  const toBlock = await getProviderLog().getBlockNumber();

  const events = await sapuEvent(
    `dokumen:${address.toLowerCase()}`,
    registri,
    registri.filters.DokumenTercatat(),
    fromBlock,
    toBlock
  );

  const baris = events.map((e: any) => ({
    operator: e.args?.operator as string,
    hash: e.args?.hashDokumen as string,
    aksi: e.args?.aksi as string,
    referensi: e.args?.referensi as string,
    txHash: e.transactionHash as string,
    block: e.blockNumber as number,
  }));
  baris.sort((a, b) => b.block - a.block);
  return { kontrak: address, baris: baris.slice(0, maksimal), total: baris.length };
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
 * Konversi nilai SKS skala x100 (konvensi kalkulator & basis data) menjadi
 * satuan mentah token sesuai `decimals()` kontrak:
 *
 *     satuan = jumlahX100 * 10^decimals / 100
 *
 * Aritmetika BigInt penuh (tanpa float), dan karena `decimals >= 2` pada semua
 * konfigurasi yang dipakai, pembagian /100 selalu habis — tidak ada pembulatan
 * yang menghilangkan nilai. Contoh pada decimals = 18: 200 (2 SKS) -> 2e18.
 */
export function keSatuanToken(jumlahX100: bigint, decimals: number): bigint {
  return (jumlahX100 * 10n ** BigInt(decimals)) / 100n;
}

/** `decimals()` kontrak token, dibaca sekali lalu di-cache per proses. */
let _desimalToken: number | null = null;

export async function desimalToken(): Promise<number> {
  if (_desimalToken === null) {
    const address = process.env.NEXT_PUBLIC_SKS_TOKEN_ADDRESS;
    if (!address) throw new Error("NEXT_PUBLIC_SKS_TOKEN_ADDRESS belum diset");
    const token = BKDSKSToken__factory.connect(address, getProvider());
    _desimalToken = Number(await token.decimals());
  }
  return _desimalToken;
}

/**
 * Mint token SKS ke wallet dosen setelah simpulan final disahkan.
 * @param jumlahX100 nilai SKS dalam skala x100 (1 SKS = 100), konsisten dengan kalkulator
 */
export async function mintSks(alamatDosen: string, jumlahX100: bigint, referenceId: string) {
  const token = getTokenContract();
  const jumlah = keSatuanToken(jumlahX100, await desimalToken());
  const tx = await token.mint(alamatDosen, jumlah, referenceId);
  const receipt = await tx.wait();
  return { txHash: tx.hash, blockNumber: receipt?.blockNumber ?? null };
}

/**
 * Saldo token beberapa wallet sekaligus (kunci map = alamat lowercase).
 * Dipakai form burn agar admin tahu berapa SKS yang dimiliki wallet tujuan.
 * Fail-soft: bila RPC/kontrak tidak tersedia, map dikembalikan kosong dan
 * halaman tetap tampil tanpa angka saldo.
 */
export async function saldoTokenBanyak(
  alamat: string[]
): Promise<Map<string, TafsirJumlah>> {
  const hasil = new Map<string, TafsirJumlah>();
  const address = process.env.NEXT_PUBLIC_SKS_TOKEN_ADDRESS;
  if (!address || alamat.length === 0) return hasil;

  try {
    const token = BKDSKSToken__factory.connect(address, getProvider());
    const decimals = Number(await token.decimals());
    const saldo = await Promise.all(alamat.map((a) => token.balanceOf(a)));
    alamat.forEach((a, i) => {
      hasil.set(a.toLowerCase(), tafsirJumlahToken(saldo[i], decimals));
    });
  } catch (e) {
    console.error("saldoTokenBanyak gagal:", e);
  }
  return hasil;
}

/**
 * Sebagian RPC menolak eth_getLogs dengan rentang block terlalu lebar sekali
 * panggil, jadi rentang deploy..tip dipecah jadi beberapa window. Batasnya
 * berbeda per provider (publicnode 50.000, sebagian free tier 10.000), dan
 * gateway arsip menerima rentang penuh sekali tembak. `RPC_MAX_BLOCK_RANGE=0`
 * berarti tanpa pemecahan. Window yang tetap ditolak dibelah otomatis oleh
 * `queryFilterBelah`, jadi salah setel tidak membuat pembacaan gagal.
 */
const MAX_BLOCK_RANGE = (() => {
  const env = process.env.RPC_MAX_BLOCK_RANGE;
  if (env === undefined || env === "") return 50_000;
  const n = Number(env);
  if (!Number.isFinite(n) || n < 0) return 50_000;
  return n === 0 ? Number.POSITIVE_INFINITY : n;
})();

/** Jumlah window yang ditembak bersamaan. Terlalu tinggi memicu rate limit. */
const RPC_KONKURENSI = Number(process.env.RPC_KONKURENSI || 8);

/**
 * Block paling ujung belum final dan masih bisa tergeser reorg, jadi sebanyak
 * ini selalu disapu ulang saat menyegarkan cache, tidak dianggap sudah pasti.
 */
const MARGIN_REORG = 64;

/**
 * Satu window eth_getLogs. Kalau provider menolak (rentang terlalu lebar atau
 * hasilnya terlalu banyak), window dibelah dua lalu dicoba lagi berurutan -
 * sengaja tidak paralel supaya kegagalan rate limit tidak berlipat.
 */
async function queryFilterBelah(
  contract: BaseContract,
  filter: any,
  fromBlock: number,
  toBlock: number
): Promise<any[]> {
  try {
    return await (contract as any).queryFilter(filter, fromBlock, toBlock);
  } catch (e) {
    if (toBlock <= fromBlock) throw e;
    const tengah = Math.floor((fromBlock + toBlock) / 2);
    const kiri = await queryFilterBelah(contract, filter, fromBlock, tengah);
    const kanan = await queryFilterBelah(contract, filter, tengah + 1, toBlock);
    return [...kiri, ...kanan];
  }
}

/**
 * Sapu rentang block penuh. Window dikerjakan beberapa sekaligus lalu hasilnya
 * disusun ulang sesuai urutan window supaya event tetap urut block menaik.
 */
async function queryFilterParalel(
  contract: BaseContract,
  filter: any,
  fromBlock: number,
  toBlock: number
): Promise<any[]> {
  if (toBlock < fromBlock) return [];

  const potongan: Array<[number, number]> = [];
  for (let start = fromBlock; start <= toBlock; start += MAX_BLOCK_RANGE) {
    potongan.push([start, Math.min(start + MAX_BLOCK_RANGE - 1, toBlock)]);
  }

  const hasil: any[][] = new Array(potongan.length);
  let berikut = 0;
  const pekerja = Array.from({ length: Math.min(RPC_KONKURENSI, potongan.length) }, async () => {
    while (berikut < potongan.length) {
      const i = berikut++;
      hasil[i] = await queryFilterBelah(contract, filter, potongan[i][0], potongan[i][1]);
    }
  });
  await Promise.all(pekerja);

  return hasil.flat();
}

/**
 * Hasil sapuan per kontrak, ditahan di memori proses. Rentang deploy..tip terus
 * melebar seumur chain, sedangkan block yang sudah lewat isinya tidak berubah,
 * jadi yang perlu disapu ulang tiap permintaan hanya selisih sejak sapuan
 * terakhir ditambah `MARGIN_REORG`. Cache hilang saat server restart, sapuan
 * penuh berikutnya membangunnya lagi.
 */
const cacheEvent = new Map<string, { blokTerakhir: number; events: any[] }>();

async function sapuEvent(
  kunci: string,
  contract: BaseContract,
  filter: any,
  deployBlock: number,
  toBlock: number
): Promise<any[]> {
  const cache = cacheEvent.get(kunci);
  const mulai = cache ? Math.max(deployBlock, cache.blokTerakhir - MARGIN_REORG + 1) : deployBlock;

  // Tip mundur lebih jauh dari margin (RPC di belakang load balancer bisa
  // menjawab dari node yang tertinggal): pakai cache apa adanya, jangan sampai
  // event yang sudah terkumpul terbuang oleh sapuan kosong.
  if (cache && toBlock < mulai) return cache.events;

  const baru = await queryFilterParalel(contract, filter, mulai, toBlock);
  const lama = cache ? cache.events.filter((e) => e.blockNumber < mulai) : [];
  const events = [...lama, ...baru];

  cacheEvent.set(kunci, { blokTerakhir: Math.max(toBlock, cache?.blokTerakhir ?? toBlock), events });
  return events;
}

/**
 * Ambang pembeda skala nilai token pada event.
 *
 * Kontrak adalah ERC20 dengan `decimals() = 18`, sehingga 1 SKS = 10^18 satuan
 * mentah — dan sejak `keSatuanToken()` dipakai, `mintSks`/`burnSks` selalu
 * mengirim skala itu. Namun riwayat on-chain bersifat permanen: transaksi lama
 * terlanjur dikirim memakai satuan x100 apa adanya (2 SKS -> 200 satuan), jadi
 * ada dua skala berbeda di log. Nilai di bawah ambang ini pasti bukan skala 18
 * desimal (10^12 satuan = 0,000001 token), jadi ditafsirkan sebagai skala lama.
 */
export const AMBANG_SKALA_LAMA = 10n ** 12n;

export type TafsirJumlah = {
  /** Nilai SKS yang ditampilkan ke pengguna */
  sks: number;
  /** true = event memakai konvensi lama x100, bukan 18 desimal token */
  skalaLama: boolean;
  /** Satuan mentah apa adanya, untuk penelusuran on-chain */
  mentah: string;
};

/** Terjemahkan satuan mentah event menjadi nilai SKS desimal. */
export function tafsirJumlahToken(mentah: bigint, decimals: number): TafsirJumlah {
  if (mentah > 0n && mentah < AMBANG_SKALA_LAMA) {
    return { sks: Number(mentah) / 100, skalaLama: true, mentah: mentah.toString() };
  }
  return {
    sks: Number(formatUnits(mentah, decimals)),
    skalaLama: false,
    mentah: mentah.toString(),
  };
}

/**
 * R10: baca event on-chain (SKSMinted / SKSBurned) langsung dari kontrak token.
 * Dipakai halaman Log Blockchain admin — sumber kebenaran on-chain, bukan DB.
 * `decimals` ikut dibaca dari kontrak supaya konversi satuan tidak ditebak.
 */
export async function bacaEventToken(maksimal = 100) {
  const address = process.env.NEXT_PUBLIC_SKS_TOKEN_ADDRESS;
  if (!address) return [];
  const token = BKDSKSToken__factory.connect(address, getProviderLog());

  const fromBlock = Number(process.env.NEXT_PUBLIC_SKS_TOKEN_DEPLOY_BLOCK || 0);
  const toBlock = await getProviderLog().getBlockNumber();

  // Mint dan burn diambil dalam satu sapuan (filter topic0 berisi dua event)
  // supaya rentang block cukup ditembak sekali, bukan dua kali.
  const [decimals, events] = await Promise.all([
    token.decimals(),
    sapuEvent(
      `token:${address.toLowerCase()}`,
      token,
      [["SKSMinted", "SKSBurned"]],
      fromBlock,
      toBlock
    ),
  ]);
  const desimal = Number(decimals);
  const minted = events.filter((e: any) => e.fragment?.name === "SKSMinted");
  const burned = events.filter((e: any) => e.fragment?.name === "SKSBurned");

  const baris = (e: any, jenis: "mint" | "burn") => {
    const mentah = BigInt(e.args?.amount ?? 0n);
    return {
      jenis,
      operator: e.args?.operator as string,
      akun: (jenis === "mint" ? e.args?.recipient : e.args?.account) as string,
      jumlah: tafsirJumlahToken(mentah, desimal),
      referensi: (jenis === "mint" ? e.args?.referenceId : e.args?.reason) as string,
      txHash: e.transactionHash as string,
      block: e.blockNumber as number,
    };
  };

  const rows = [
    ...minted.map((e: any) => baris(e, "mint")),
    ...burned.map((e: any) => baris(e, "burn")),
  ];
  rows.sort((a, b) => b.block - a.block);
  return { desimal, kontrak: address, baris: rows.slice(0, maksimal), total: rows.length };
}

/**
 * Burn token untuk koreksi (hanya admin).
 * @param jumlahX100 nilai SKS dalam skala x100 — diskalakan sama persis seperti `mintSks`
 */
export async function burnSks(alamatDosen: string, jumlahX100: bigint, alasan: string) {
  const token = getTokenContract();
  const jumlah = keSatuanToken(jumlahX100, await desimalToken());
  const tx = await token.burn(alamatDosen, jumlah, alasan);
  const receipt = await tx.wait();
  return { txHash: tx.hash, blockNumber: receipt?.blockNumber ?? null };
}
