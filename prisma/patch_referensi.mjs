/**
 * Patch referensi kegiatan pada DB yang sudah ter-seed lama:
 *  - EDU501 & EDU502 menjadi manual (dinilai asesor, tanpa fungsi kontrak)
 *  - EDU601, EDU801, EDU802, EDU901, EDU902 dihapus (batal diterapkan,
 *    tidak ada datanya) — hanya bila belum dipakai kegiatan.
 *
 * Jalankan dari root proyek (butuh DATABASE_URL, mis. via tunnel SSH):
 *   set -a; . ./.env; set +a; node prisma/patch_referensi.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JADI_MANUAL = ["EDU501", "EDU502"];
const RULE_DIHAPUS = ["EDU601", "EDU801", "EDU802", "EDU901", "EDU902"];

async function main() {
  const upd = await prisma.referensi_kegiatan.updateMany({
    where: { kode_rule: { in: JADI_MANUAL } },
    data: {
      fungsi_contract: null,
      keterangan: "Dinilai langsung oleh asesor (tidak diotomatisasi).",
    },
  });
  console.log(`EDU501/EDU502 menjadi manual (${upd.count} baris diperbarui)`);

  const usang = await prisma.referensi_kegiatan.findMany({
    where: { kode_rule: { in: RULE_DIHAPUS } },
    include: { _count: { select: { kegiatan: true } } },
  });
  if (usang.length === 0) console.log("Tidak ada rule usang tersisa di DB.");
  for (const r of usang) {
    if (r._count.kegiatan > 0) {
      console.warn(`LEWATI ${r.kode_rule}: masih dipakai ${r._count.kegiatan} kegiatan`);
      continue;
    }
    await prisma.referensi_kegiatan.delete({ where: { id_referensi: r.id_referensi } });
    console.log(`${r.kode_rule} dihapus`);
  }

  const sisa = await prisma.referensi_kegiatan.findMany({
    select: { kode_rule: true, fungsi_contract: true },
    orderBy: { kode_rule: "asc" },
  });
  console.log("Referensi tersisa:");
  for (const r of sisa)
    console.log(`  ${r.kode_rule}  ${r.fungsi_contract ?? "(manual - dinilai asesor)"}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
