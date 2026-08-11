/**
 * Verifikasi keaslian dokumen bukti (anti-kecurangan): lembar pengesahan /
 * artefak yang diunggah dosen diekstrak parser VLM universal (/parse/artefak),
 * lalu nama-nama orang di dokumen dicocokkan dengan nama pemilik akun.
 * Asesor memakai hasilnya untuk menilai apakah bukti benar milik dosen ybs.
 */

import { readFile } from "fs/promises";
import path from "path";
import { parseDokumen, parserDikonfigurasi } from "./parserDokumen";
import { buatPencocokDosen } from "./namaDosen";

export type OrangTerdeteksi = {
  nama: string;
  /** Enum peran parser (pembimbing_1, penguji, pengaju, dst.) */
  peran: string | null;
  /** Jabatan persis seperti tertulis di dokumen */
  peran_asli: string | null;
  tulisan_tangan?: boolean;
};

export type HasilVerifikasi = {
  status: "cocok" | "peran_tidak_sesuai" | "tidak_cocok" | "tanpa_nama" | "gagal";
  /** Nama akun dosen yang menjadi pembanding */
  nama_akun: string;
  /** Nama di dokumen yang berhasil dicocokkan ke akun (bila ditemukan) */
  nama_cocok?: string;
  /** Seluruh nama orang yang terbaca parser dari dokumen */
  nama_terdeteksi: string[];
  /** Rincian orang beserta perannya di dokumen (untuk panel detail asesor) */
  orang_terdeteksi?: OrangTerdeteksi[];
  /** Peran yang diklaim kegiatan (mis. "Pembimbing Pendamping") */
  peran_diharapkan?: string;
  /** Peran nama tsb. seperti tertulis di dokumen — diisi bila bertentangan */
  peran_terdeteksi?: string | null;
  /** Jenis dokumen menurut parser (mis. "lembar pengesahan") */
  jenis_dokumen?: string | null;
  pesan?: string;
  diperiksa_pada: string;
};

/** Info kegiatan untuk pemeriksaan peran (opsional). */
export type InfoKegiatan = { kodeRule?: string | null; parameter?: any };

type UjiPeran = { label: string; uji: (o: OrangTerdeteksi) => boolean | null };

/**
 * Peran yang diklaim kegiatan -> penguji kecocokan peran di dokumen.
 * uji() mengembalikan true (sesuai), false (bertentangan), atau null bila
 * peran pada dokumen tidak cukup jelas untuk memutus.
 */
function peranDiharapkan(info?: InfoKegiatan): UjiPeran | null {
  const p = info?.parameter ?? {};
  const kode = info?.kodeRule;

  const asli = (o: OrangTerdeteksi) => (o.peran_asli ?? "").toLowerCase();
  const sbgPembimbing2 = (o: OrangTerdeteksi) =>
    o.peran === "pembimbing_2" || /pembimbing\s*(ii|2|pendamping)/.test(asli(o));
  const sbgPembimbing1 = (o: OrangTerdeteksi) =>
    !sbgPembimbing2(o) &&
    (o.peran === "pembimbing_1" || /pembimbing\s*(i|1|utama)/.test(asli(o)));
  const sbgPembimbing = (o: OrangTerdeteksi) =>
    o.peran?.startsWith("pembimbing") || /pembimbing/.test(asli(o));
  const sbgPenguji = (o: OrangTerdeteksi) => o.peran === "penguji" || /penguji/.test(asli(o));

  if (kode === "EDU203" && (p.peran === "PembimbingUtama" || p.peran === "PembimbingPendamping")) {
    const utama = p.peran === "PembimbingUtama";
    return {
      label: utama ? "Pembimbing Utama" : "Pembimbing Pendamping",
      uji: (o) => {
        if (sbgPenguji(o)) return false; // diklaim membimbing, dokumen bilang menguji
        if (utama) return sbgPembimbing1(o) ? true : sbgPembimbing2(o) ? false : null;
        return sbgPembimbing2(o) ? true : sbgPembimbing1(o) ? false : null;
      },
    };
  }

  if (kode === "EDU301" && (p.peranPenguji === "Ketua" || p.peranPenguji === "Anggota")) {
    const ketua = p.peranPenguji === "Ketua";
    return {
      label: `Penguji ${p.peranPenguji}`,
      uji: (o) => {
        if (sbgPembimbing(o)) return false;
        if (!sbgPenguji(o)) return null;
        const anggota = /anggota|penguji\s*(ii|2)/.test(asli(o));
        const ketuaDok = !anggota && /ketua|penguji\s*(i|1)/.test(asli(o));
        if (ketua) return ketuaDok ? true : anggota ? false : null;
        return anggota ? true : ketuaDok ? false : null;
      },
    };
  }

  if (kode === "EDU201" || kode === "EDU202") {
    return {
      label: "Pembimbing",
      uji: (o) => (sbgPembimbing(o) ? true : sbgPenguji(o) ? false : null),
    };
  }

  return null;
}

/** Dokumen lokal hasil unggah dosen yang bisa diperiksa (bukan tautan luar). */
export function bisaDiverifikasi(dok: {
  file_url?: string | null;
  jenis_file?: string | null;
}): boolean {
  return (
    parserDikonfigurasi() &&
    Boolean(dok.file_url?.startsWith("/uploads/")) &&
    (/\.pdf$/i.test(dok.file_url ?? "") || dok.jenis_file === "application/pdf")
  );
}

/**
 * Jalankan parser universal atas berkas di `public/<fileUrl>` dan bandingkan
 * nama orang yang terdeteksi dengan `namaDosen` (pemilik akun pengunggah).
 * Tidak pernah melempar — kegagalan parser dilaporkan sebagai status "gagal"
 * supaya alur unggah/penilaian tidak ikut tumbang.
 */
export async function verifikasiNamaBukti(
  fileUrl: string,
  namaFileAsli: string | null,
  namaDosen: string,
  infoKegiatan?: InfoKegiatan
): Promise<HasilVerifikasi> {
  const dasar: HasilVerifikasi = {
    status: "gagal",
    nama_akun: namaDosen,
    nama_terdeteksi: [],
    diperiksa_pada: new Date().toISOString(),
  };

  try {
    const lokal = path.join(process.cwd(), "public", fileUrl.replace(/^\/+/, ""));
    const bytes = await readFile(lokal);
    const file = new File([new Uint8Array(bytes)], namaFileAsli ?? path.basename(lokal), {
      type: "application/pdf",
    });

    const hasil = await parseDokumen("artefak", file);
    const orang: any[] = Array.isArray(hasil?.dokumen?.orang) ? hasil.dokumen.orang : [];
    const perDosen: any[] = Array.isArray(hasil?.per_dosen) ? hasil.per_dosen : [];
    const namaTerdeteksi = [
      ...new Set(
        [...perDosen.map((d) => d?.nama), ...orang.map((o) => o?.nama)]
          .map((n) => String(n ?? "").trim())
          .filter(Boolean)
      ),
    ];

    // Rincian per orang: peran diambil dari blok `orang`; nama dari `per_dosen`
    // yang tak ada di sana (jarang) tetap masuk tanpa peran.
    const perNama = new Map<string, OrangTerdeteksi>();
    for (const o of orang) {
      const n = String(o?.nama ?? "").trim();
      if (!n || perNama.has(n)) continue;
      perNama.set(n, {
        nama: n,
        peran: o?.peran ?? null,
        peran_asli: o?.peran_asli ?? null,
        tulisan_tangan: Boolean(o?.tulisan_tangan),
      });
    }
    for (const n of namaTerdeteksi) {
      if (!perNama.has(n)) perNama.set(n, { nama: n, peran: null, peran_asli: null });
    }
    const orangTerdeteksi = [...perNama.values()];

    const jenisDokumen = hasil?.dokumen?.jenis_dokumen ?? null;
    if (namaTerdeteksi.length === 0)
      return {
        ...dasar,
        status: "tanpa_nama",
        jenis_dokumen: jenisDokumen,
        pesan: "Parser tidak menemukan nama orang pada dokumen",
      };

    // Pencocokan memakai aturan yang sama dengan pencocokan SK/ST admin
    // (gelar dibuang, toleran salah spasi & marga disingkat).
    const cocokkan = buatPencocokDosen([{ id_pengguna: "akun", nama: namaDosen }]);
    const entriCocok = orangTerdeteksi.filter((o) => cocokkan({ nama: o.nama }).status === "cocok");

    const bagian = {
      ...dasar,
      nama_cocok: entriCocok[0]?.nama,
      nama_terdeteksi: namaTerdeteksi,
      orang_terdeteksi: orangTerdeteksi,
      jenis_dokumen: jenisDokumen,
    };
    if (entriCocok.length === 0) return { ...bagian, status: "tidak_cocok" };

    // Nama ada — periksa juga PERANNYA: dosen yang mengklaim "Pembimbing
    // Pendamping" tetapi tertulis "Pembimbing 1" di dokumen adalah indikasi
    // klaim yang tidak sesuai, bukan bukti yang sah.
    const harapan = peranDiharapkan(infoKegiatan);
    if (harapan) {
      const nilaiUji = entriCocok.map((o) => ({ o, hasil: harapan.uji(o) }));
      const sesuai = nilaiUji.find((x) => x.hasil === true);
      const bertentangan = nilaiUji.find((x) => x.hasil === false);
      if (!sesuai && bertentangan) {
        return {
          ...bagian,
          status: "peran_tidak_sesuai",
          nama_cocok: bertentangan.o.nama,
          peran_diharapkan: harapan.label,
          peran_terdeteksi: bertentangan.o.peran_asli ?? bertentangan.o.peran,
        };
      }
      return {
        ...bagian,
        status: "cocok",
        nama_cocok: (sesuai ?? nilaiUji[0]).o.nama,
        peran_diharapkan: harapan.label,
        pesan: sesuai ? undefined : "Peran pada dokumen tidak dapat dipastikan parser",
      };
    }

    return { ...bagian, status: "cocok" };
  } catch (e: any) {
    return { ...dasar, pesan: String(e?.message ?? e) };
  }
}
