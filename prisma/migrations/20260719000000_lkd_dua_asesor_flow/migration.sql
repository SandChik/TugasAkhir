-- Revisi skema: alur LKD (rencana/laporan), 2 asesor per LKD, simpulan M/TM, wallet custodial.
-- PERINGATAN: migration ini destruktif terhadap relasi lama kegiatan->pengguna/periode
-- dan hasil_penilaian->asesor. Aman untuk DB dev tanpa data produksi.

-- CreateEnum
CREATE TYPE "jenis_lkd" AS ENUM ('rencana', 'laporan');
CREATE TYPE "status_lkd" AS ENUM ('draft', 'diajukan', 'dinilai', 'final');
CREATE TYPE "status_capaian" AS ENUM ('selesai', 'berlanjut', 'gagal', 'beban_lebih');
CREATE TYPE "status_simpulan" AS ENUM ('M', 'TM');

-- AlterTable pengguna
ALTER TABLE "pengguna"
  ADD COLUMN "aktif" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "wallet_index" INTEGER,
  ADD COLUMN "nira" VARCHAR,
  ADD COLUMN "kelompok_bidang" VARCHAR;

CREATE UNIQUE INDEX "pengguna_wallet_index_key" ON "pengguna"("wallet_index");

-- CreateTable lkd
CREATE TABLE "lkd" (
  "id_lkd" UUID NOT NULL DEFAULT gen_random_uuid(),
  "id_pengguna" UUID NOT NULL,
  "id_periode" UUID NOT NULL,
  "jenis" "jenis_lkd" NOT NULL,
  "status" "status_lkd" NOT NULL DEFAULT 'draft',
  "simpan_permanen" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6),
  CONSTRAINT "lkd_pkey" PRIMARY KEY ("id_lkd")
);

CREATE UNIQUE INDEX "lkd_id_pengguna_id_periode_jenis_key" ON "lkd"("id_pengguna", "id_periode", "jenis");
CREATE INDEX "lkd_id_periode_idx" ON "lkd"("id_periode");
CREATE INDEX "lkd_status_idx" ON "lkd"("status");

ALTER TABLE "lkd"
  ADD CONSTRAINT "lkd_id_pengguna_fkey" FOREIGN KEY ("id_pengguna") REFERENCES "pengguna"("id_pengguna") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "lkd_id_periode_fkey" FOREIGN KEY ("id_periode") REFERENCES "periode_bkd"("id_periode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable penugasan_asesor
CREATE TABLE "penugasan_asesor" (
  "id_penugasan" UUID NOT NULL DEFAULT gen_random_uuid(),
  "id_lkd" UUID NOT NULL,
  "id_asesor" UUID NOT NULL,
  "urutan" INTEGER NOT NULL,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "penugasan_asesor_pkey" PRIMARY KEY ("id_penugasan")
);

CREATE UNIQUE INDEX "penugasan_asesor_id_lkd_urutan_key" ON "penugasan_asesor"("id_lkd", "urutan");
CREATE UNIQUE INDEX "penugasan_asesor_id_lkd_id_asesor_key" ON "penugasan_asesor"("id_lkd", "id_asesor");
CREATE INDEX "penugasan_asesor_id_asesor_idx" ON "penugasan_asesor"("id_asesor");

ALTER TABLE "penugasan_asesor"
  ADD CONSTRAINT "penugasan_asesor_id_lkd_fkey" FOREIGN KEY ("id_lkd") REFERENCES "lkd"("id_lkd") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "penugasan_asesor_id_asesor_fkey" FOREIGN KEY ("id_asesor") REFERENCES "pengguna"("id_pengguna") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable kegiatan: pindah relasi ke lkd
ALTER TABLE "kegiatan" DROP CONSTRAINT IF EXISTS "kegiatan_id_pengguna_fkey";
ALTER TABLE "kegiatan" DROP CONSTRAINT IF EXISTS "kegiatan_id_periode_fkey";
DROP INDEX IF EXISTS "kegiatan_id_pengguna_id_periode_idx";

ALTER TABLE "kegiatan"
  DROP COLUMN IF EXISTS "id_pengguna",
  DROP COLUMN IF EXISTS "id_periode",
  ADD COLUMN "id_lkd" UUID NOT NULL,
  ADD COLUMN "status_capaian" "status_capaian";

CREATE INDEX "kegiatan_id_lkd_idx" ON "kegiatan"("id_lkd");

ALTER TABLE "kegiatan"
  ADD CONSTRAINT "kegiatan_id_lkd_fkey" FOREIGN KEY ("id_lkd") REFERENCES "lkd"("id_lkd") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable hasil_penilaian: per asesor (via penugasan)
ALTER TABLE "hasil_penilaian" DROP CONSTRAINT IF EXISTS "hasil_penilaian_id_asesor_fkey";
DROP INDEX IF EXISTS "hasil_penilaian_id_asesor_idx";
DROP INDEX IF EXISTS "hasil_penilaian_id_kegiatan_key";

ALTER TABLE "hasil_penilaian"
  DROP COLUMN IF EXISTS "id_asesor",
  ADD COLUMN "id_penugasan" UUID NOT NULL,
  ADD COLUMN "pertemuan_keputusan" INTEGER,
  ADD COLUMN "capaian_persen" INTEGER;

CREATE UNIQUE INDEX "hasil_penilaian_id_kegiatan_id_penugasan_key" ON "hasil_penilaian"("id_kegiatan", "id_penugasan");

ALTER TABLE "hasil_penilaian"
  ADD CONSTRAINT "hasil_penilaian_id_penugasan_fkey" FOREIGN KEY ("id_penugasan") REFERENCES "penugasan_asesor"("id_penugasan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable simpulan_bkd
CREATE TABLE "simpulan_bkd" (
  "id_simpulan" UUID NOT NULL DEFAULT gen_random_uuid(),
  "id_lkd" UUID NOT NULL,
  "sks_pendidikan_x100" INTEGER NOT NULL DEFAULT 0,
  "sks_penelitian_x100" INTEGER NOT NULL DEFAULT 0,
  "sks_pengabdian_x100" INTEGER NOT NULL DEFAULT 0,
  "sks_penunjang_x100" INTEGER NOT NULL DEFAULT 0,
  "status_kewajiban_khusus" "status_simpulan",
  "status_final" "status_simpulan",
  "hash_penilaian" VARCHAR,
  "tx_hash" VARCHAR,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6),
  CONSTRAINT "simpulan_bkd_pkey" PRIMARY KEY ("id_simpulan")
);

CREATE UNIQUE INDEX "simpulan_bkd_id_lkd_key" ON "simpulan_bkd"("id_lkd");

ALTER TABLE "simpulan_bkd"
  ADD CONSTRAINT "simpulan_bkd_id_lkd_fkey" FOREIGN KEY ("id_lkd") REFERENCES "lkd"("id_lkd") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable riwayat_transaksi: id_hasil jadi opsional
ALTER TABLE "riwayat_transaksi" ALTER COLUMN "id_hasil" DROP NOT NULL;
