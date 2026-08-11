-- Hapus opsi 'berlanjut' dari enum status_capaian.
-- Data lama yang bernilai 'berlanjut' dikosongkan (NULL = belum diisi dosen).
UPDATE "kegiatan" SET "status_capaian" = NULL WHERE "status_capaian" = 'berlanjut';

CREATE TYPE "status_capaian_new" AS ENUM ('selesai', 'gagal', 'beban_lebih');
ALTER TABLE "kegiatan"
  ALTER COLUMN "status_capaian" TYPE "status_capaian_new"
  USING ("status_capaian"::text::"status_capaian_new");
DROP TYPE "status_capaian";
ALTER TYPE "status_capaian_new" RENAME TO "status_capaian";
