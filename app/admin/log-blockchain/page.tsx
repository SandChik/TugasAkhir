import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { bacaEventToken } from "../../../lib/blockchain";
import { prisma } from "../../../lib/prisma";
import AppShell from "../../../components/AppShell";
import TabelData from "../../../components/TabelData";
import StatusChip, { STATUS_VARIAN } from "../../../components/StatusChip";
import AlamatSalin from "../../../components/AlamatSalin";

const inputCls =
  "mt-1 rounded-md border border-line px-2.5 py-1.5 text-[11px] outline-none focus:border-primary";

/** Tampilkan SKS desimal ringkas: 2 -> "2,00"; nilai debu -> notasi ilmiah. */
function tampilSks(n: number): string {
  if (n === 0) return "0,00";
  if (Math.abs(n) < 0.0001) return n.toExponential(2).replace(".", ",");
  return n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

/** R10: Log Blockchain — event on-chain langsung dari kontrak token. */
export default async function LogBlockchainPage({
  searchParams,
}: {
  searchParams: { jenis?: string; cari?: string; skala?: string };
}) {
  const session = await getServerSession(authOptions);

  let data: Awaited<ReturnType<typeof bacaEventToken>> | [] = [];
  let error: string | null = null;
  try {
    data = await bacaEventToken(500);
  } catch (e: any) {
    error = e?.message ?? "Gagal membaca event on-chain";
  }

  const semua = Array.isArray(data) ? [] : data.baris;
  const kontrak = process.env.NEXT_PUBLIC_SKS_TOKEN_ADDRESS;

  // Pemilik wallet: cocokkan alamat on-chain -> akun pengguna (alamat disimpan
  // dengan checksum, event bisa berbeda kapitalisasi, jadi dibandingkan lowercase)
  const pemilikWallet = await prisma.pengguna.findMany({
    where: { alamat_wallet: { not: null } },
    select: { nama: true, peran: true, alamat_wallet: true, kode_dosen: true },
  });
  const perAlamat = new Map(
    pemilikWallet.map((p: any) => [String(p.alamat_wallet).toLowerCase(), p])
  );

  // Cadangan bila alamat tak lagi terpasang di akun mana pun (wallet dosen
  // pernah diturunkan ulang): telusuri lewat tx hash pada riwayat transaksi.
  const riwayat = await prisma.riwayat_transaksi.findMany({
    where: { tx_hash: { in: semua.map((e) => e.txHash).filter(Boolean) } },
    select: {
      tx_hash: true,
      admin: { select: { nama: true } },
      hasil_penilaian: {
        select: { kegiatan: { select: { lkd: { select: { pengguna: { select: { nama: true, peran: true, kode_dosen: true } } } } } } },
      },
    },
  });
  const perTx = new Map(riwayat.map((r: any) => [r.tx_hash, r]));

  /** Nama manusia untuk sebuah event: akun wallet -> riwayat transaksi -> null. */
  function pemilikEvent(e: any) {
    const akun = perAlamat.get((e.akun ?? "").toLowerCase());
    if (akun) return { ...akun, asal: "wallet" as const };
    const dariRiwayat = perTx.get(e.txHash)?.hasil_penilaian?.kegiatan?.lkd?.pengguna;
    if (dariRiwayat) return { ...dariRiwayat, asal: "riwayat" as const };
    return null;
  }

  // --- filter (server-side, tanpa JS: form GET) ---
  const jenisFilter = searchParams.jenis === "mint" || searchParams.jenis === "burn" ? searchParams.jenis : "";
  const cari = (searchParams.cari ?? "").trim().toLowerCase();
  const skalaFilter = searchParams.skala === "lama" || searchParams.skala === "baku" ? searchParams.skala : "";

  const baris = semua.filter((e) => {
    if (jenisFilter && e.jenis !== jenisFilter) return false;
    if (skalaFilter === "lama" && !e.jumlah.skalaLama) return false;
    if (skalaFilter === "baku" && e.jumlah.skalaLama) return false;
    if (!cari) return true;
    const pemilik = pemilikEvent(e);
    return [e.akun, e.txHash, e.referensi, pemilik?.nama, pemilik?.kode_dosen]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(cari));
  });

  const totalMint = baris.filter((e) => e.jenis === "mint").reduce((a, e) => a + e.jumlah.sks, 0);
  const totalBurn = baris.filter((e) => e.jenis === "burn").reduce((a, e) => a + e.jumlah.sks, 0);
  const takDikenal = baris.filter((e) => !pemilikEvent(e)).length;

  return (
    <AppShell
      peran="admin"
      nama={session?.user.name ?? "-"}
      deskripsi="Admin, Sistem"
      breadcrumb={["Beranda", "Blockchain", "Log Blockchain"]}
      title="Log Blockchain"
      subtitle="Penerbitan (mint) dan pembakaran (burn) token SKS yang tercatat permanen di jaringan (dibaca langsung on-chain)"
      actions={
        <div className="flex items-center gap-3 text-[10.5px]">
          <span className="rounded-lg border border-line px-3 py-2 text-navy">
            Mint: <b>{tampilSks(totalMint)}</b> SKS
          </span>
          <span className="rounded-lg border border-line px-3 py-2 text-navy">
            Burn: <b>{tampilSks(totalBurn)}</b> SKS
          </span>
        </div>
      }
    >
      {error && (
        <div className="rounded-lg bg-danger-soft px-4 py-3 text-xs text-danger">
          Tidak dapat membaca on-chain: {error}. Pastikan node RPC berjalan dan alamat kontrak terisi.
        </div>
      )}

      {/* Filter — form GET, tanpa JavaScript */}
      <form className="mt-4 flex flex-wrap items-end gap-3 rounded-[10px] border border-line px-4 py-3">
        <div className="flex flex-col">
          <label className="text-[10px] font-medium text-muted">Jenis transaksi</label>
          <select name="jenis" defaultValue={jenisFilter} className={`${inputCls} bg-white`}>
            <option value="">Semua</option>
            <option value="mint">Mint</option>
            <option value="burn">Burn</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] font-medium text-muted">Skala nilai</label>
          <select name="skala" defaultValue={skalaFilter} className={`${inputCls} bg-white`}>
            <option value="">Semua</option>
            <option value="baku">Sesuai decimals kontrak</option>
            <option value="lama">Skala lama (x100)</option>
          </select>
        </div>
        <div className="flex flex-1 flex-col">
          <label className="text-[10px] font-medium text-muted">
            Cari (nama dosen, kode, alamat wallet, tx hash, referensi)
          </label>
          <input
            name="cari"
            defaultValue={searchParams.cari ?? ""}
            placeholder="mis. Transmissia / KO019N / 0x3D78 / 0x…"
            className={`${inputCls} w-full`}
          />
        </div>
        <button className="rounded-md bg-primary px-4 py-2 text-[11px] font-medium text-white">
          Terapkan filter
        </button>
        {(jenisFilter || cari || skalaFilter) && (
          <a
            href="/admin/log-blockchain"
            className="rounded-md bg-head-bg px-3 py-2 text-[11px] font-medium text-muted"
          >
            Reset
          </a>
        )}
      </form>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-muted">
          Menampilkan <b>{baris.length}</b> dari {semua.length} event on-chain
          {takDikenal > 0 && ` · ${takDikenal} alamat tanpa akun terdaftar`}
        </p>
      </div>

      <div className="mt-2">
        <TabelData
          pencarian={false}
          kosong={error ? "—" : "Belum ada transaksi tercatat di blockchain."}
          kolom={[
            { label: "Block", width: "80px", urut: true },
            { label: "Jenis", width: "85px" },
            { label: "Dosen / pemilik wallet", width: "260px", urut: true },
            { label: "Jumlah SKS", width: "130px", urut: true },
            { label: "Keterangan" },
            { label: "Tx Hash", width: "170px" },
          ]}
          baris={baris.map((e, i) => {
            const pemilik: any = pemilikEvent(e);
            const operator = perTx.get(e.txHash)?.admin?.nama;
            return {
              id: `${e.txHash}-${i}`,
              nilai: [
                e.block,
                e.jenis === "mint" ? "Mint" : "Burn",
                pemilik?.nama ?? "Wallet tanpa akun terdaftar",
                e.jumlah.sks,
                null,
                e.txHash,
              ],
              sel: [
                `#${e.block}`,
                <StatusChip
                  label={e.jenis === "mint" ? "Mint" : "Burn"}
                  variant={STATUS_VARIAN[e.jenis]}
                />,
                <>
                  {pemilik ? (
                      <>
                        <span className="font-medium text-navy">{pemilik.nama}</span>
                        <span className="block text-[10.5px] text-muted">
                          {pemilik.peran}
                          {pemilik.kode_dosen ? ` · ${pemilik.kode_dosen}` : ""}
                          {pemilik.asal === "riwayat" ? " · dari riwayat transaksi" : ""}
                        </span>
                      </>
                    ) : (
                      <span className="text-crumb">Wallet tanpa akun terdaftar</span>
                    )}
                    <span className="mt-0.5 block">
                      {e.akun ? (
                        <AlamatSalin nilai={e.akun} className="text-[10px] text-crumb" />
                      ) : (
                        "-"
                      )}
                    </span>
                </>,
                <span title={`${e.jumlah.mentah} satuan on-chain`}>
                  <b>{tampilSks(e.jumlah.sks)}</b> SKS
                  {e.jumlah.skalaLama && (
                    <span className="block text-[9px] text-warning">transaksi skala lama</span>
                  )}
                </span>,
                <span className="text-[11px] text-muted">
                    {e.jenis === "burn" ? (
                      e.referensi || <span className="text-crumb">tanpa alasan</span>
                    ) : e.referensi ? (
                      <span>
                        Hash penilaian{" "}
                        <AlamatSalin nilai={e.referensi} akhir={4} className="text-[10px]" />
                      </span>
                    ) : (
                      "-"
                    )}
                    {operator && (
                      <span className="block text-[10px] text-crumb">oleh {operator}</span>
                    )}
                </span>,
                e.txHash ? (
                  <AlamatSalin nilai={e.txHash} akhir={8} className="text-[10px] text-primary" />
                ) : (
                  "-"
                ),
              ],
            };
          })}
        />
      </div>
    </AppShell>
  );
}
