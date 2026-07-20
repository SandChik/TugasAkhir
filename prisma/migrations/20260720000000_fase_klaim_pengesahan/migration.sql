-- R3: fase enum + rentang tanggal + override manual pada periode
CREATE TYPE "fase_bkd" AS ENUM ('pengisian', 'penilaian', 'perbaikan', 'selesai');

ALTER TABLE "periode_bkd"
  ADD COLUMN "pengisian_mulai" DATE,
  ADD COLUMN "pengisian_selesai" DATE,
  ADD COLUMN "penilaian_mulai" DATE,
  ADD COLUMN "penilaian_selesai" DATE,
  ADD COLUMN "perbaikan_mulai" DATE,
  ADD COLUMN "perbaikan_selesai" DATE,
  ADD COLUMN "fase_override" "fase_bkd";

-- R5 + R7: klaim portofolio dan sumber data kegiatan
ALTER TABLE "kegiatan"
  ADD COLUMN "diklaim" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "sumber_data" VARCHAR NOT NULL DEFAULT 'manual';

-- R11: pengesahan per penugasan asesor
ALTER TABLE "penugasan_asesor"
  ADD COLUMN "disahkan" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "tanggal_pengesahan" TIMESTAMP(6);
