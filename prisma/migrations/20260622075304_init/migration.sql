-- CreateEnum
CREATE TYPE "peran_pengguna" AS ENUM ('dosen', 'asesor', 'admin');

-- CreateEnum
CREATE TYPE "status_periode" AS ENUM ('aktif', 'nonaktif');

-- CreateEnum
CREATE TYPE "status_kegiatan" AS ENUM ('draft', 'diajukan', 'dihitung', 'disetujui', 'ditolak', 'revisi');

-- CreateEnum
CREATE TYPE "status_perhitungan" AS ENUM ('berhasil', 'gagal', 'tidak_diotomatisasi');

-- CreateEnum
CREATE TYPE "status_penilaian" AS ENUM ('disetujui', 'ditolak', 'revisi');

-- CreateEnum
CREATE TYPE "jenis_transaksi" AS ENUM ('mint', 'burn');

-- CreateEnum
CREATE TYPE "status_transaksi" AS ENUM ('pending', 'success', 'failed');

-- CreateTable
CREATE TABLE "pengguna" (
    "id_pengguna" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nama" VARCHAR NOT NULL,
    "email" VARCHAR,
    "password_hash" VARCHAR,
    "peran" "peran_pengguna" NOT NULL,
    "alamat_wallet" VARCHAR,
    "nip" VARCHAR,
    "nidn" VARCHAR,
    "program_studi" VARCHAR,
    "jabatan_fungsional" VARCHAR,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pengguna_pkey" PRIMARY KEY ("id_pengguna")
);

-- CreateTable
CREATE TABLE "periode_bkd" (
    "id_periode" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nama_periode" VARCHAR NOT NULL,
    "tahun_ajaran" VARCHAR,
    "semester" VARCHAR,
    "tanggal_mulai" DATE,
    "tanggal_selesai" DATE,
    "status" "status_periode" NOT NULL DEFAULT 'nonaktif',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "periode_bkd_pkey" PRIMARY KEY ("id_periode")
);

-- CreateTable
CREATE TABLE "referensi_kegiatan" (
    "id_referensi" UUID NOT NULL DEFAULT gen_random_uuid(),
    "kode_rule" VARCHAR NOT NULL,
    "kategori" VARCHAR NOT NULL,
    "nama_kegiatan" VARCHAR NOT NULL,
    "fungsi_contract" VARCHAR,
    "skema_parameter" JSONB,
    "sks_maksimal_x100" INTEGER,
    "keterangan" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referensi_kegiatan_pkey" PRIMARY KEY ("id_referensi")
);

-- CreateTable
CREATE TABLE "kegiatan" (
    "id_kegiatan" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_pengguna" UUID NOT NULL,
    "id_periode" UUID NOT NULL,
    "id_referensi" UUID NOT NULL,
    "judul" VARCHAR NOT NULL,
    "detail_kegiatan" JSONB,
    "parameter" JSONB,
    "sks_dihitung_x100" INTEGER,
    "status_perhitungan" "status_perhitungan",
    "status" "status_kegiatan" NOT NULL DEFAULT 'draft',
    "tanggal_pengajuan" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "kegiatan_pkey" PRIMARY KEY ("id_kegiatan")
);

-- CreateTable
CREATE TABLE "dokumen_kegiatan" (
    "id_dokumen" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_kegiatan" UUID NOT NULL,
    "nama_dokumen" VARCHAR,
    "nama_file" VARCHAR,
    "jenis_file" VARCHAR,
    "jenis_dokumen" VARCHAR,
    "file_url" TEXT,
    "keterangan" TEXT,
    "tanggal_upload" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "dokumen_kegiatan_pkey" PRIMARY KEY ("id_dokumen")
);

-- CreateTable
CREATE TABLE "hasil_penilaian" (
    "id_hasil" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_kegiatan" UUID NOT NULL,
    "id_asesor" UUID NOT NULL,
    "sks_disetujui_x100" INTEGER,
    "status" "status_penilaian" NOT NULL,
    "catatan" TEXT,
    "tanggal_penilaian" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hasil_penilaian_pkey" PRIMARY KEY ("id_hasil")
);

-- CreateTable
CREATE TABLE "riwayat_transaksi" (
    "id_transaksi" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_hasil" UUID NOT NULL,
    "id_admin" UUID,
    "jenis_transaksi" "jenis_transaksi" NOT NULL,
    "contract_address" VARCHAR,
    "tx_hash" VARCHAR,
    "jumlah_token_x100" INTEGER,
    "alamat_wallet" VARCHAR,
    "reference_id" VARCHAR,
    "alasan" TEXT,
    "status" "status_transaksi" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riwayat_transaksi_pkey" PRIMARY KEY ("id_transaksi")
);

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_email_key" ON "pengguna"("email");

-- CreateIndex
CREATE INDEX "pengguna_peran_idx" ON "pengguna"("peran");

-- CreateIndex
CREATE INDEX "pengguna_alamat_wallet_idx" ON "pengguna"("alamat_wallet");

-- CreateIndex
CREATE INDEX "periode_bkd_status_idx" ON "periode_bkd"("status");

-- CreateIndex
CREATE UNIQUE INDEX "referensi_kegiatan_kode_rule_key" ON "referensi_kegiatan"("kode_rule");

-- CreateIndex
CREATE INDEX "referensi_kegiatan_kategori_idx" ON "referensi_kegiatan"("kategori");

-- CreateIndex
CREATE INDEX "kegiatan_id_pengguna_id_periode_idx" ON "kegiatan"("id_pengguna", "id_periode");

-- CreateIndex
CREATE INDEX "kegiatan_id_referensi_idx" ON "kegiatan"("id_referensi");

-- CreateIndex
CREATE INDEX "kegiatan_status_idx" ON "kegiatan"("status");

-- CreateIndex
CREATE INDEX "dokumen_kegiatan_id_kegiatan_idx" ON "dokumen_kegiatan"("id_kegiatan");

-- CreateIndex
CREATE UNIQUE INDEX "hasil_penilaian_id_kegiatan_key" ON "hasil_penilaian"("id_kegiatan");

-- CreateIndex
CREATE INDEX "hasil_penilaian_id_asesor_idx" ON "hasil_penilaian"("id_asesor");

-- CreateIndex
CREATE INDEX "hasil_penilaian_status_idx" ON "hasil_penilaian"("status");

-- CreateIndex
CREATE UNIQUE INDEX "riwayat_transaksi_tx_hash_key" ON "riwayat_transaksi"("tx_hash");

-- CreateIndex
CREATE INDEX "riwayat_transaksi_jenis_transaksi_idx" ON "riwayat_transaksi"("jenis_transaksi");

-- CreateIndex
CREATE INDEX "riwayat_transaksi_tx_hash_idx" ON "riwayat_transaksi"("tx_hash");

-- CreateIndex
CREATE INDEX "riwayat_transaksi_status_idx" ON "riwayat_transaksi"("status");

-- AddForeignKey
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_id_pengguna_fkey" FOREIGN KEY ("id_pengguna") REFERENCES "pengguna"("id_pengguna") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_id_periode_fkey" FOREIGN KEY ("id_periode") REFERENCES "periode_bkd"("id_periode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatan" ADD CONSTRAINT "kegiatan_id_referensi_fkey" FOREIGN KEY ("id_referensi") REFERENCES "referensi_kegiatan"("id_referensi") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dokumen_kegiatan" ADD CONSTRAINT "dokumen_kegiatan_id_kegiatan_fkey" FOREIGN KEY ("id_kegiatan") REFERENCES "kegiatan"("id_kegiatan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hasil_penilaian" ADD CONSTRAINT "hasil_penilaian_id_kegiatan_fkey" FOREIGN KEY ("id_kegiatan") REFERENCES "kegiatan"("id_kegiatan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hasil_penilaian" ADD CONSTRAINT "hasil_penilaian_id_asesor_fkey" FOREIGN KEY ("id_asesor") REFERENCES "pengguna"("id_pengguna") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_transaksi" ADD CONSTRAINT "riwayat_transaksi_id_hasil_fkey" FOREIGN KEY ("id_hasil") REFERENCES "hasil_penilaian"("id_hasil") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_transaksi" ADD CONSTRAINT "riwayat_transaksi_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "pengguna"("id_pengguna") ON DELETE SET NULL ON UPDATE CASCADE;
