-- Unggah SK & ST oleh admin: dokumen sumber + hasil ekstraksi parser

-- Kode dosen pada surat tugas (kolom "Kd Dosen") untuk mencocokkan hasil
-- ekstraksi ST Pengajaran ke akun dosen. IF NOT EXISTS: sebagian basis data
-- pengembangan sudah memiliki kolom ini dari migrasi terdahulu.
ALTER TABLE "pengguna" ADD COLUMN IF NOT EXISTS "kode_dosen" VARCHAR;

CREATE TYPE "jenis_unggahan" AS ENUM ('st_pengajaran', 'st_bimbingan', 'st_pengujian', 'sk_pembinaan');
CREATE TYPE "status_unggahan" AS ENUM ('terparse', 'gagal', 'diterapkan');

CREATE TABLE "unggahan_dokumen" (
    "id_unggahan" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_periode" UUID,
    "id_admin" UUID,
    "jenis" "jenis_unggahan" NOT NULL,
    "nama_file" VARCHAR NOT NULL,
    "file_url" TEXT,
    "ukuran_byte" INTEGER,
    "sha256" VARCHAR,
    "nomor_surat" VARCHAR,
    "status" "status_unggahan" NOT NULL DEFAULT 'terparse',
    "pesan_galat" TEXT,
    "hasil_parse" JSONB,
    "ringkasan" JSONB,
    "jumlah_dosen_dokumen" INTEGER NOT NULL DEFAULT 0,
    "jumlah_dosen_cocok" INTEGER NOT NULL DEFAULT 0,
    "jumlah_kegiatan" INTEGER NOT NULL DEFAULT 0,
    "tanggal_terapkan" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "unggahan_dokumen_pkey" PRIMARY KEY ("id_unggahan")
);

CREATE INDEX "unggahan_dokumen_jenis_idx" ON "unggahan_dokumen"("jenis");
CREATE INDEX "unggahan_dokumen_status_idx" ON "unggahan_dokumen"("status");
CREATE INDEX "unggahan_dokumen_id_periode_idx" ON "unggahan_dokumen"("id_periode");

ALTER TABLE "unggahan_dokumen"
  ADD CONSTRAINT "unggahan_dokumen_id_periode_fkey" FOREIGN KEY ("id_periode")
    REFERENCES "periode_bkd"("id_periode") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "unggahan_dokumen_id_admin_fkey" FOREIGN KEY ("id_admin")
    REFERENCES "pengguna"("id_pengguna") ON DELETE SET NULL ON UPDATE CASCADE;

-- Jejak asal kegiatan yang lahir dari ekstraksi SK/ST
ALTER TABLE "kegiatan" ADD COLUMN "id_unggahan" UUID;

CREATE INDEX "kegiatan_id_unggahan_idx" ON "kegiatan"("id_unggahan");

ALTER TABLE "kegiatan"
  ADD CONSTRAINT "kegiatan_id_unggahan_fkey" FOREIGN KEY ("id_unggahan")
    REFERENCES "unggahan_dokumen"("id_unggahan") ON DELETE SET NULL ON UPDATE CASCADE;
