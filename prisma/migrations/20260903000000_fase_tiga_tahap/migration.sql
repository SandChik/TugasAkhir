-- Fase periode jadi tiga tahap berurutan: pengisian, pemeriksaan, penilaian.
-- Rentang lama dipetakan urut kronologis: penilaian lama -> pemeriksaan,
-- perbaikan lama -> penilaian. Nilai override lama: penilaian tetap penilaian,
-- perbaikan -> pemeriksaan, selesai -> penilaian.
BEGIN;

ALTER TABLE "periode_bkd" RENAME COLUMN "penilaian_mulai" TO "pemeriksaan_mulai";
ALTER TABLE "periode_bkd" RENAME COLUMN "penilaian_selesai" TO "pemeriksaan_selesai";
ALTER TABLE "periode_bkd" RENAME COLUMN "perbaikan_mulai" TO "penilaian_mulai";
ALTER TABLE "periode_bkd" RENAME COLUMN "perbaikan_selesai" TO "penilaian_selesai";

CREATE TYPE "fase_bkd_new" AS ENUM ('pengisian', 'pemeriksaan', 'penilaian');
ALTER TABLE "periode_bkd"
  ALTER COLUMN "fase_override" TYPE "fase_bkd_new"
  USING (
    CASE "fase_override"::text
      WHEN 'perbaikan' THEN 'pemeriksaan'
      WHEN 'selesai' THEN 'penilaian'
      ELSE "fase_override"::text
    END
  )::"fase_bkd_new";
ALTER TYPE "fase_bkd" RENAME TO "fase_bkd_old";
ALTER TYPE "fase_bkd_new" RENAME TO "fase_bkd";
DROP TYPE "fase_bkd_old";

COMMIT;
