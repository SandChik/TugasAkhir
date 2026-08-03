-- Koreksi manual admin atas hasil pemetaan ekstraksi SK/ST.
-- Terpisah dari `hasil_parse` agar respons parser tetap utuh sebagai bukti audit.
ALTER TABLE "unggahan_dokumen" ADD COLUMN "koreksi" JSONB;
