import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import AppShell from "../../../components/AppShell";
import TabelData from "../../../components/TabelData";
import StatusChip, { STATUS_VARIAN } from "../../../components/StatusChip";
import SubmitButton from "../../../components/SubmitButton";
import PilihDosenBurn from "../../../components/PilihDosenBurn";
import { saldoTokenBanyak } from "../../../lib/blockchain";
import { burnToken } from "./actions";

const fmt = (d: Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);

/** UI-ADM-05 / FR-18: riwayat mint/burn + koreksi burn. */
export default async function TokenPage() {
  const session = await getServerSession(authOptions);

  const [riwayat, dosenBerwallet, pemilikWallet] = await Promise.all([
    prisma.riwayat_transaksi.findMany({
      orderBy: { created_at: "desc" },
      take: 50,
      include: {
        admin: { select: { nama: true } },
        hasil_penilaian: {
          select: {
            kegiatan: {
              select: {
                lkd: { select: { pengguna: { select: { nama: true, kode_dosen: true } } } },
              },
            },
          },
        },
      },
    }),
    prisma.pengguna.findMany({
      where: { peran: { in: ["dosen", "asesor"] }, alamat_wallet: { not: null } },
      orderBy: { nama: "asc" },
    }),
    prisma.pengguna.findMany({
      where: { alamat_wallet: { not: null } },
      select: { nama: true, peran: true, kode_dosen: true, alamat_wallet: true },
    }),
  ]);

  // Saldo on-chain tiap wallet dosen — dibaca setelah daftar dosen diketahui.
  const saldoWallet = await saldoTokenBanyak(
    dosenBerwallet.map((d: any) => d.alamat_wallet)
  );
  const opsiBurn = dosenBerwallet.map((d: any) => ({
    id: d.id_pengguna,
    nama: d.nama,
    wallet: d.alamat_wallet as string,
    sks: saldoWallet.get(String(d.alamat_wallet).toLowerCase())?.sks ?? null,
  }));

  // Alamat disimpan ber-checksum; dibandingkan lowercase agar tidak meleset.
  const perAlamat = new Map(
    pemilikWallet.map((p: any) => [String(p.alamat_wallet).toLowerCase(), p])
  );

  /** Nama pemilik wallet: akun aktif -> LKD yang memicu mint -> null. */
  const pemilikBaris = (r: any) =>
    perAlamat.get((r.alamat_wallet ?? "").toLowerCase()) ??
    r.hasil_penilaian?.kegiatan?.lkd?.pengguna ??
    null;

  const totalMint = riwayat
    .filter((r: any) => r.jenis_transaksi === "mint" && r.status === "success")
    .reduce((a: number, r: any) => a + (r.jumlah_token_x100 ?? 0), 0);
  const totalBurn = riwayat
    .filter((r: any) => r.jenis_transaksi === "burn" && r.status === "success")
    .reduce((a: number, r: any) => a + (r.jumlah_token_x100 ?? 0), 0);

  const kontrak = process.env.NEXT_PUBLIC_SKS_TOKEN_ADDRESS;

  return (
    <AppShell
      peran="admin"
      nama={session?.user.name ?? "-"}
      deskripsi="Admin, Sistem"
      breadcrumb={["Beranda", "Blockchain", "Operasi Token"]}
      title="Operasi Token SKS"
      subtitle="Riwayat penerbitan (mint) dan pembakaran (burn) token SKS non-transferable"
    >
      {/* Kartu ringkas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          ["Kontrak Token (BKDSKSToken)", kontrak ? `${kontrak.slice(0, 6)}…${kontrak.slice(-4)}` : "-"],
          ["Total Token Diterbitkan", `${(totalMint / 100).toFixed(2)} SKS`],
          ["Total Token di Burn", `${(totalBurn / 100).toFixed(2)} SKS`],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-[10px] border border-line p-4">
            <p className="text-[11px] text-muted">{label}</p>
            <p className="mt-1 text-[17px] font-semibold text-navy">{value}</p>
          </div>
        ))}
      </div>

      {/* Form burn */}
      <form
        action={burnToken}
        className="mt-4 rounded-[10px] border border-danger/30 bg-danger-soft/40 p-4"
      >
        <h2 className="text-[12px] font-semibold text-danger">Koreksi Token (Burn)</h2>
        <p className="mt-0.5 text-[10.5px] text-muted">
          Menarik kembali token SKS yang terlanjur diterbitkan. Transaksi tercatat permanen di
          blockchain dan tidak dapat dibatalkan.
        </p>

        <div className="mt-3 grid grid-cols-1 items-start gap-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)_minmax(0,1.4fr)_auto]">
          <PilihDosenBurn dosen={opsiBurn} />
          <div>
            <label className="text-[11px] font-medium text-cell">Alasan Koreksi</label>
            <input
              name="alasan"
              required
              placeholder="cth: kelebihan penerbitan"
              className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-xs outline-none placeholder:text-crumb focus:border-primary"
            />
          </div>
          <div className="md:pt-[22px]">
            <SubmitButton
              variant="danger"
              className="w-full !bg-danger !text-white !px-4 !py-2 !text-xs"
              labelProses="Mengirim transaksi…"
              judulKonfirmasi="Bakar token SKS?"
              konfirmasi="Transaksi burn tercatat permanen di blockchain dan tidak dapat dibatalkan. Pastikan wallet, jumlah, dan alasannya sudah benar."
              tombolKonfirmasi="Ya, burn token"
            >
              Burn Token
            </SubmitButton>
          </div>
        </div>
      </form>

      <div className="mt-4">
        <TabelData
          placeholderCari="Cari nama dosen, wallet, tx hash…"
          kosong="Belum ada transaksi token."
          kolom={[
            { label: "No", width: "45px" },
            { label: "Waktu", width: "150px", urut: true },
            { label: "Jenis", width: "80px", filter: true },
            { label: "Dosen / pemilik wallet", width: "230px", urut: true },
            { label: "Jumlah SKS", width: "100px", urut: true },
            { label: "Keterangan" },
            { label: "Tx Hash", width: "150px" },
            { label: "Status", width: "95px", filter: true },
          ]}
          baris={riwayat.map((r: any, i: number) => {
            const pemilik: any = pemilikBaris(r);
            const jenis = r.jenis_transaksi === "mint" ? "Mint" : "Burn";
            return {
              id: r.id_transaksi,
              cari: `${fmt(r.created_at)} ${r.alamat_wallet ?? ""} ${r.tx_hash ?? ""} ${r.reference_id ?? ""} ${r.alasan ?? ""} ${r.admin?.nama ?? ""} ${pemilik?.kode_dosen ?? ""}`,
              nilai: [
                i + 1,
                r.created_at instanceof Date ? r.created_at.getTime() : null,
                jenis,
                pemilik?.nama ?? "Wallet tanpa akun terdaftar",
                r.jumlah_token_x100 != null ? r.jumlah_token_x100 / 100 : null,
                null,
                r.tx_hash,
                r.status,
              ],
              sel: [
                i + 1,
                fmt(r.created_at),
                <StatusChip label={jenis} variant={STATUS_VARIAN[r.jenis_transaksi]} />,
                <>
                  {pemilik ? (
                    <>
                      <span className="font-medium text-navy">{pemilik.nama}</span>
                      {(pemilik.peran || pemilik.kode_dosen) && (
                        <span className="block text-[10.5px] text-muted">
                          {pemilik.peran ?? "dosen"}
                          {pemilik.kode_dosen ? ` · ${pemilik.kode_dosen}` : ""}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-crumb">Wallet tanpa akun terdaftar</span>
                  )}
                  <span
                    className="mt-0.5 block font-mono text-[10px] text-crumb"
                    title={r.alamat_wallet ?? ""}
                  >
                    {r.alamat_wallet
                      ? `${r.alamat_wallet.slice(0, 10)}…${r.alamat_wallet.slice(-6)}`
                      : "-"}
                  </span>
                </>,
                r.jumlah_token_x100 != null ? (r.jumlah_token_x100 / 100).toFixed(2) : "-",
                <span className="text-[11px] text-muted">
                  {r.jenis_transaksi === "burn" ? (
                    r.alasan || <span className="text-crumb">tanpa alasan</span>
                  ) : r.reference_id ? (
                    <span title={r.reference_id}>
                      Hash penilaian{" "}
                      <span className="font-mono text-[10px]">
                        {r.reference_id.length > 14
                          ? `${r.reference_id.slice(0, 10)}…${r.reference_id.slice(-4)}`
                          : r.reference_id}
                      </span>
                    </span>
                  ) : (
                    "-"
                  )}
                  {r.admin?.nama && (
                    <span className="block text-[10px] text-crumb">oleh {r.admin.nama}</span>
                  )}
                </span>,
                <span className="font-mono text-[10px] text-primary">
                  {r.tx_hash ? `${r.tx_hash.slice(0, 8)}…${r.tx_hash.slice(-6)}` : "-"}
                </span>,
                <StatusChip label={r.status} variant={STATUS_VARIAN[r.status] ?? "neutral"} />,
              ],
            };
          })}
        />
      </div>
    </AppShell>
  );
}
