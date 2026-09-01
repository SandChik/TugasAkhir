import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { bacaEventDokumen } from "../../../lib/blockchain";
import { prisma } from "../../../lib/prisma";
import AppShell from "../../../components/AppShell";
import TabelData from "../../../components/TabelData";
import StatusChip from "../../../components/StatusChip";
import AlamatSalin from "../../../components/AlamatSalin";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Registri Dokumen: event unggah/terapkan/hapus dokumen langsung dari kontrak registri. */
export default async function RegistriDokumenPage() {
  const session = await getServerSession(authOptions);

  let dokBaris: Awaited<ReturnType<typeof bacaEventDokumen>>["baris"] = [];
  let error: string | null = null;
  try {
    dokBaris = (await bacaEventDokumen(500)).baris;
  } catch (e: any) {
    error = e?.message ?? "Gagal membaca event registri dokumen";
  }

  // Konteks event: nama dokumen dari baris sistem yang masih ada, atau dari
  // riwayat transaksi bila barisnya sudah dihapus.
  const idUnggahan = [
    ...new Set(
      dokBaris
        .filter((e) => e.referensi.startsWith("unggahan:"))
        .map((e) => e.referensi.slice("unggahan:".length))
        .filter((id) => UUID_RE.test(id))
    ),
  ];
  const idBukti = [
    ...new Set(
      dokBaris
        .filter((e) => e.referensi.startsWith("bukti:"))
        .map((e) => e.referensi.slice("bukti:".length))
        .filter((id) => UUID_RE.test(id))
    ),
  ];
  const [unggahanRows, buktiRows, riwayatDok] = await Promise.all([
    idUnggahan.length
      ? prisma.unggahan_dokumen.findMany({
          where: { id_unggahan: { in: idUnggahan } },
          select: { id_unggahan: true, nama_file: true, nomor_surat: true },
        })
      : [],
    idBukti.length
      ? prisma.dokumen_kegiatan.findMany({
          where: { id_dokumen: { in: idBukti } },
          select: {
            id_dokumen: true,
            nama_dokumen: true,
            kegiatan: {
              select: {
                judul: true,
                lkd: { select: { pengguna: { select: { nama: true } } } },
              },
            },
          },
        })
      : [],
    dokBaris.length
      ? prisma.riwayat_transaksi.findMany({
          where: { tx_hash: { in: dokBaris.map((e) => e.txHash).filter(Boolean) } },
          select: { tx_hash: true, alasan: true, admin: { select: { nama: true, peran: true } } },
        })
      : [],
  ]);
  const perUnggahan = new Map<string, any>(
    unggahanRows.map((u: any) => [u.id_unggahan, u] as [string, any])
  );
  const perBukti = new Map<string, any>(
    buktiRows.map((b: any) => [b.id_dokumen, b] as [string, any])
  );
  const perTx = new Map<string, any>(
    riwayatDok.map((r: any) => [r.tx_hash, r] as [string, any])
  );

  /** Baris konteks untuk satu event registri dokumen. */
  function konteksDokumen(e: (typeof dokBaris)[number]) {
    if (e.referensi.startsWith("unggahan:")) {
      const u: any = perUnggahan.get(e.referensi.slice("unggahan:".length));
      if (u)
        return {
          nama: u.nama_file,
          rincian: u.nomor_surat ? `SK/ST ${u.nomor_surat}` : "unggahan admin",
        };
    }
    if (e.referensi.startsWith("bukti:")) {
      const b: any = perBukti.get(e.referensi.slice("bukti:".length));
      if (b)
        return {
          nama: b.nama_dokumen ?? "bukti kegiatan",
          rincian: [b.kegiatan?.judul, b.kegiatan?.lkd?.pengguna?.nama]
            .filter(Boolean)
            .join(" · "),
        };
    }
    const r: any = perTx.get(e.txHash);
    if (r?.alasan) {
      const [, nama = r.alasan] = String(r.alasan).split(": ", 2);
      return { nama, rincian: "baris sudah dihapus dari sistem" };
    }
    return { nama: e.referensi, rincian: null };
  }

  const jumlah = (aksi: string) => dokBaris.filter((e) => e.aksi === aksi).length;

  return (
    <AppShell
      peran="admin"
      nama={session?.user.name ?? "-"}
      deskripsi="Admin, Sistem"
      breadcrumb={["Beranda", "Blockchain", "Registri Dokumen"]}
      title="Registri Dokumen"
      subtitle="Jejak unggah, terapkan, dan hapus dokumen yang tercatat permanen di jaringan (dibaca langsung on-chain)"
      actions={
        <div className="flex items-center gap-3 text-[10.5px]">
          <span className="rounded-lg border border-line px-3 py-2 text-navy">
            Unggah: <b>{jumlah("unggah")}</b>
          </span>
          <span className="rounded-lg border border-line px-3 py-2 text-navy">
            Terapkan: <b>{jumlah("terapkan")}</b>
          </span>
          <span className="rounded-lg border border-line px-3 py-2 text-navy">
            Hapus: <b>{jumlah("hapus")}</b>
          </span>
        </div>
      }
    >
      {error && (
        <div className="rounded-lg bg-danger-soft px-4 py-3 text-xs text-danger">
          Tidak dapat membaca registri dokumen: {error}. Pastikan node RPC berjalan dan alamat kontrak terisi.
        </div>
      )}

      <p className="mt-3 text-[11px] text-muted">
        <b>{dokBaris.length}</b> event on-chain
      </p>

      <div className="mt-2">
        <TabelData
          placeholderCari="Cari dokumen, nomor surat, dosen, hash, tx hash…"
          kosong={error ? "—" : "Belum ada peristiwa dokumen tercatat di blockchain."}
          kolom={[
            { label: "Block", width: "80px", urut: true },
            { label: "Aksi", width: "95px", filter: true },
            { label: "Dokumen" },
            { label: "Pelaku", width: "180px" },
            { label: "Hash Dokumen", width: "160px" },
            { label: "Tx Hash", width: "160px" },
          ]}
          baris={dokBaris.map((e, i) => {
            const ctx = konteksDokumen(e);
            const pelaku: any = perTx.get(e.txHash)?.admin;
            const varian =
              e.aksi === "hapus" ? "danger" : e.aksi === "terapkan" ? "success" : "info";
            return {
              id: `${e.txHash}-${i}`,
              nilai: [e.block, e.aksi, ctx.nama, pelaku?.nama ?? "-", e.hash, e.txHash],
              cari: [ctx.rincian, e.referensi].filter(Boolean).join(" "),
              sel: [
                `#${e.block}`,
                <StatusChip label={e.aksi} variant={varian as any} />,
                <>
                  <span className="font-medium text-navy">{ctx.nama}</span>
                  {ctx.rincian && (
                    <span className="block text-[10.5px] text-muted">{ctx.rincian}</span>
                  )}
                </>,
                pelaku ? (
                  <>
                    <span className="text-navy">{pelaku.nama}</span>
                    <span className="block text-[10.5px] text-muted">{pelaku.peran}</span>
                  </>
                ) : (
                  <span className="text-crumb">-</span>
                ),
                e.hash ? (
                  <AlamatSalin nilai={e.hash} className="text-[10px] text-muted" />
                ) : (
                  "-"
                ),
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
