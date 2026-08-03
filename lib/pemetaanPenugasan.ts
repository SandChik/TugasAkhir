/**
 * Pemetaan hasil parser dokumen (SK/ST) -> calon kegiatan BKD.
 *
 * Parser mengembalikan data per dosen dalam bahasa dokumen ("beban_dosen",
 * "penugasan"). Rubrik BKD memerlukan bentuk lain: satu kegiatan per baris
 * dengan `kode_rule` referensi + `parameter` sesuai skema smart contract.
 * Modul ini murni (tanpa I/O) sehingga hasil pemetaan bisa ditampilkan sebagai
 * pratinjau di halaman admin sebelum benar-benar dibuat.
 *
 * Kaidah pemetaan:
 *   ST Pengajaran   -> EDU101 per (mata kuliah, kelas) yang dipegang dosen
 *   ST Pembimbing   -> EDU202 satu kegiatan per dosen (per semester)
 *   ST Penguji TA   -> EDU301 per peran penguji (Ketua / Anggota)
 *   SK Pembina      -> EDU401 per organisasi yang dibina
 */

import type { JenisUnggahan } from "./parserDokumen";
import { kunciNama } from "./namaDosen";

/** Jumlah pertemuan baku satu semester; ST penugasan tidak memuat realisasi. */
export const PERTEMUAN_BAKU = 16;

export type PenugasanTerpetakan = {
  /**
   * Penanda baris yang stabil (dosen + rubrik + judul asli hasil parser).
   * Dipakai sebagai kunci koreksi manual admin dan untuk mengenali kembali
   * kegiatan yang sudah pernah dibuat dari baris ini.
   */
  tanda: string;
  /** Nama dosen persis seperti tertulis di dokumen */
  namaDokumen: string;
  nip: string | null;
  /** Kolom "Kd Dosen" pada ST Pengajaran — bukti pencocokan terkuat */
  kodeDosen: string | null;
  kodeRule: string;
  judul: string;
  detail: Record<string, unknown>;
  parameter: Record<string, unknown>;
  /** Ringkasan satu baris untuk kolom pratinjau */
  ringkas: string;
};

/** Baris hasil pemetaan sebelum diberi tanda (tanda dibubuhkan terpusat). */
type TanpaTanda = Omit<PenugasanTerpetakan, "tanda">;

export type PemetaanDokumen = {
  nomorSurat: string | null;
  tanggalSurat: string | null;
  sha256: string | null;
  ringkasan: Record<string, unknown> | null;
  temuan: any[];
  jumlahDitolak: number;
  penugasan: PenugasanTerpetakan[];
};

const teks = (v: unknown): string | null => {
  const s = v == null ? "" : String(v).trim();
  return s ? s : null;
};

const angka = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Metadata surat: field `surat` ada pada parser offline, tidak pada VLM. */
function metaSurat(hasil: any): { nomor: string | null; tanggal: string | null; sha: string | null } {
  const s = hasil?.surat ?? {};
  return {
    nomor: teks(s.nomor),
    tanggal:
      teks(s.tanggal_ditetapkan_iso) ??
      teks(s.tanggal_ditetapkan) ??
      teks(s.ditetapkan) ??
      teks(s.berlaku_sejak_iso),
    sha: teks(s.sha256),
  };
}

// ---------------------------------------------------------------------------
// ST Pengajaran -> EDU101
// ---------------------------------------------------------------------------

function petakanPengajaran(hasil: any, noSk: string | null, tglSk: string | null): TanpaTanda[] {
  const out: TanpaTanda[] = [];

  for (const dosen of hasil?.beban_dosen ?? []) {
    // rincian parser: satu baris per (mata kuliah, kelas, komponen TE/PR).
    // Satu kegiatan BKD = satu kelas, jadi TE dan PR digabung dulu.
    const perKelas = new Map<
      string,
      {
        kodeMk: string;
        namaMk: string;
        kelas: string;
        tercatat: number;
        efektif: number;
        teamTeaching: boolean;
        komponen: Record<string, number>;
      }
    >();

    for (const r of dosen?.rincian ?? []) {
      const kunci = `${r.kode_mk}||${r.kelas}`;
      const g =
        perKelas.get(kunci) ??
        {
          kodeMk: String(r.kode_mk ?? ""),
          namaMk: String(r.nama_mk ?? ""),
          kelas: String(r.kelas ?? ""),
          tercatat: 0,
          efektif: 0,
          teamTeaching: false,
          komponen: {} as Record<string, number>,
        };
      g.tercatat += angka(r.tercatat);
      g.efektif += angka(r.efektif);
      g.teamTeaching = g.teamTeaching || Boolean(r.team_teaching);
      g.komponen[String(r.komponen)] = angka(r.tercatat);
      perKelas.set(kunci, g);
    }

    for (const g of perKelas.values()) {
      if (g.tercatat <= 0) continue; // kontrak menolak sksMataKuliah == 0
      // Porsi dosen pada slot team teaching = beban efektif / beban slot.
      const porsi = g.teamTeaching
        ? Math.min(100, Math.max(1, Math.round((g.efektif / g.tercatat) * 100)))
        : 100;

      out.push({
        namaDokumen: String(dosen?.nama_dosen ?? ""),
        nip: null,
        kodeDosen: teks(dosen?.kd_dosen),
        kodeRule: "EDU101",
        judul: `${g.namaMk} / ${g.kelas}`,
        detail: {
          no_sk: noSk,
          tgl_sk: tglSk,
          kelas: g.kelas,
          kode_mk: g.kodeMk,
          jenis_mata_kuliah: null,
          bidang_keilmuan: null,
          jumlah_mahasiswa: null,
          kd_dosen: teks(dosen?.kd_dosen),
          beban_komponen: g.komponen,
          sumber: "ST Pengajaran (ekstraksi otomatis)",
        },
        parameter: {
          sksMataKuliah: g.tercatat,
          jumlahPertemuanRencana: PERTEMUAN_BAKU,
          jumlahPertemuanRealisasi: PERTEMUAN_BAKU,
          semesterPenuh: true,
          teamTeaching: g.teamTeaching,
          persenPorsiDosen: porsi,
        },
        ringkas:
          `${g.tercatat} SKS` +
          (g.teamTeaching ? ` · mengajar bersama, porsi ${porsi}%` : "") +
          ` · ${Object.entries(g.komponen)
            .map(([k, v]) => `${k === "TE" ? "teori" : k === "PR" ? "praktik" : k} ${v} SKS`)
            .join(" + ")}`,
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// SK Pembimbing Tugas Akhir -> EDU203 per peran (Pembimbing 1 = utama)
// ---------------------------------------------------------------------------

const PERAN_PEMBIMBING: Record<string, "PembimbingUtama" | "PembimbingPendamping"> = {
  "Pembimbing 1": "PembimbingUtama",
  "Pembimbing 2": "PembimbingPendamping",
};

const SEBUTAN_PERAN = {
  PembimbingUtama: "Pembimbing Utama",
  PembimbingPendamping: "Pembimbing Pendamping",
} as const;

function petakanBimbinganTA(hasil: any, noSk: string | null, tglSk: string | null): TanpaTanda[] {
  const out: TanpaTanda[] = [];

  for (const dosen of hasil?.beban_dosen ?? []) {
    const perPeran = new Map<keyof typeof SEBUTAN_PERAN, any[]>();
    for (const p of dosen?.penugasan ?? []) {
      const peran = PERAN_PEMBIMBING[String(p.peran)] ?? "PembimbingPendamping";
      const arr = perPeran.get(peran);
      if (arr) arr.push(p);
      else perPeran.set(peran, [p]);
    }

    for (const [peran, daftar] of perPeran) {
      out.push({
        namaDokumen: String(dosen?.nama ?? ""),
        nip: teks(dosen?.nip),
        kodeDosen: null,
        kodeRule: "EDU203",
        judul: `${SEBUTAN_PERAN[peran]} Tugas Akhir (${daftar.length} mahasiswa)`,
        detail: {
          no_sk: noSk,
          tgl_sk: tglSk,
          bidang_keilmuan: null,
          peran_pembimbing: SEBUTAN_PERAN[peran],
          jumlah_mahasiswa: daftar.length,
          mahasiswa: daftar.map((p) => ({
            nim: p.nim,
            nama: p.nama_mahasiswa,
            kelompok: p.kelompok,
            judul: p.judul,
          })),
          sumber: "SK Pembimbing Tugas Akhir (ekstraksi otomatis)",
        },
        parameter: {
          peran,
          jenisTugasAkhir: "TugasAkhir",
          jumlahMahasiswa: daftar.length,
        },
        ringkas: `${SEBUTAN_PERAN[peran]} · ${daftar.length} mahasiswa`,
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// ST Pembimbing PKL -> EDU202 (2 SKS per semester, bukan per mahasiswa)
// ---------------------------------------------------------------------------

function petakanBimbingan(hasil: any, noSk: string | null, tglSk: string | null): TanpaTanda[] {
  // Satu endpoint parser melayani dua surat berbeda; jenisnya ikut di hasil.
  if (hasil?.surat?.jenis_bimbingan === "ta") return petakanBimbinganTA(hasil, noSk, tglSk);

  const out: TanpaTanda[] = [];

  for (const dosen of hasil?.beban_dosen ?? []) {
    const penugasan: any[] = dosen?.penugasan ?? [];
    if (penugasan.length === 0) continue;

    out.push({
      namaDokumen: String(dosen?.nama ?? ""),
      nip: teks(dosen?.nip),
      kodeDosen: null,
      kodeRule: "EDU202",
      judul: `Membimbing PKL (${penugasan.length} mahasiswa)`,
      detail: {
        no_sk: noSk,
        tgl_sk: tglSk,
        bidang_keilmuan: null,
        jumlah_mahasiswa: penugasan.length,
        mahasiswa: penugasan.map((p) => ({
          nim: p.nim,
          nama: p.nama_mahasiswa,
          instansi: p.instansi,
          judul: p.judul,
        })),
        sumber: "ST Pembimbing PKL (ekstraksi otomatis)",
      },
      parameter: { jumlahSemester: 1 },
      ringkas: `${penugasan.length} mahasiswa PKL · 1 semester`,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// ST Penguji TA -> EDU301 per peran (Ketua = Penguji 1, Anggota = Penguji 2)
// ---------------------------------------------------------------------------

const PERAN_PENGUJI: Record<string, "Ketua" | "Anggota"> = {
  "Penguji 1": "Ketua",
  "Penguji 2": "Anggota",
};

function petakanPengujian(hasil: any, noSk: string | null, tglSk: string | null): TanpaTanda[] {
  const out: TanpaTanda[] = [];

  for (const dosen of hasil?.beban_dosen ?? []) {
    const perPeran = new Map<"Ketua" | "Anggota", any[]>();
    for (const p of dosen?.penugasan ?? []) {
      const peran = PERAN_PENGUJI[String(p.peran)] ?? "Anggota";
      const arr = perPeran.get(peran);
      if (arr) arr.push(p);
      else perPeran.set(peran, [p]);
    }

    for (const [peran, daftar] of perPeran) {
      out.push({
        namaDokumen: String(dosen?.nama ?? ""),
        nip: teks(dosen?.nip),
        kodeDosen: null,
        kodeRule: "EDU301",
        judul: `Penguji ${peran} Sidang TA (${daftar.length} mahasiswa)`,
        detail: {
          no_sk: noSk,
          tgl_sk: tglSk,
          bidang_keilmuan: null,
          jenis_pengujian: "Sidang Tugas Akhir",
          mahasiswa: daftar.map((p) => ({
            nim: p.nim,
            nama: p.nama_mahasiswa,
            kota: p.kota,
            judul: p.judul,
          })),
          sumber: "ST Penguji Tugas Akhir (ekstraksi otomatis)",
        },
        parameter: { peranPenguji: peran, jumlahMahasiswa: daftar.length },
        ringkas: `${peran} · ${daftar.length} mahasiswa`,
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// SK Pembina Ormawa -> EDU401 per organisasi
// ---------------------------------------------------------------------------

function petakanPembinaan(hasil: any): TanpaTanda[] {
  const out: TanpaTanda[] = [];

  for (const dosen of hasil?.pembina_jtk ?? []) {
    for (const p of dosen?.penugasan ?? []) {
      const organisasi = teks(p.organisasi) ?? "Organisasi kemahasiswaan";
      out.push({
        namaDokumen: String(dosen?.nama ?? ""),
        nip: teks(dosen?.nip),
        kodeDosen: null,
        kodeRule: "EDU401",
        judul: `Pembina ${organisasi}`,
        detail: {
          no_sk: teks(p.nomor_sk),
          tgl_sk: teks(p.tanggal_sk),
          jenis_bimbingan: "Kemahasiswaan",
          organisasi,
          unit_kerja: teks(p.unit_kerja),
          honor_per_bulan: p.honor_per_bulan ?? null,
          no_baris_sk: p.no_baris_sk ?? null,
          status_baris: teks(p.status),
          catatan_parser: p.catatan ?? null,
          sumber: "SK Pembina Ormawa (ekstraksi VLM)",
        },
        parameter: { jumlahSemester: 1 },
        ringkas: `${organisasi} · 1 semester`,
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------

/** Terjemahkan respons parser menjadi daftar calon kegiatan + metadata surat. */
export function petakanDokumen(jenis: JenisUnggahan, hasil: any): PemetaanDokumen {
  const meta = metaSurat(hasil);
  let penugasan: TanpaTanda[] = [];

  switch (jenis) {
    case "st_pengajaran":
      penugasan = petakanPengajaran(hasil, meta.nomor, meta.tanggal);
      break;
    case "st_bimbingan":
      penugasan = petakanBimbingan(hasil, meta.nomor, meta.tanggal);
      break;
    case "st_pengujian":
      penugasan = petakanPengujian(hasil, meta.nomor, meta.tanggal);
      break;
    case "sk_pembinaan":
      penugasan = petakanPembinaan(hasil);
      break;
  }

  // SK (VLM) tidak punya blok `surat`; nomor/tanggal diambil dari baris pertama
  const dariBaris = penugasan[0]?.detail as Record<string, unknown> | undefined;

  return {
    nomorSurat: meta.nomor ?? (teks(dariBaris?.no_sk) as string | null) ?? null,
    tanggalSurat: meta.tanggal ?? (teks(dariBaris?.tgl_sk) as string | null) ?? null,
    sha256: meta.sha,
    ringkasan: (hasil?.ringkasan as Record<string, unknown>) ?? null,
    temuan: Array.isArray(hasil?.temuan) ? hasil.temuan : [],
    jumlahDitolak: Array.isArray(hasil?.ditolak) ? hasil.ditolak.length : 0,
    penugasan: bubuhiTanda(penugasan),
  };
}

/**
 * Beri tiap baris penanda stabil: rubrik + nama dosen tanpa gelar + judul asli.
 * Tidak memakai indeks supaya koreksi admin tidak bergeser ke baris lain bila
 * dokumen diparse ulang. Tanda kembar (jarang) dibedakan dengan sufiks urutan.
 */
function bubuhiTanda(daftar: TanpaTanda[]): PenugasanTerpetakan[] {
  const terpakai = new Map<string, number>();
  return daftar.map((p) => {
    const dasar = `${p.kodeRule}|${kunciNama(p.namaDokumen)}|${p.judul}`;
    const ke = (terpakai.get(dasar) ?? 0) + 1;
    terpakai.set(dasar, ke);
    return { ...p, tanda: ke === 1 ? dasar : `${dasar}#${ke}` };
  });
}

/** Jumlah dosen berbeda (menurut nama dokumen) pada hasil pemetaan. */
export function jumlahDosenDokumen(penugasan: PenugasanTerpetakan[]): number {
  return new Set(penugasan.map((p) => p.namaDokumen.trim().toLowerCase())).size;
}

// ---------------------------------------------------------------------------
// Koreksi manual admin
// ---------------------------------------------------------------------------

/** Koreksi satu baris; field yang tidak diisi berarti "pakai hasil parser". */
export type KoreksiBaris = {
  /** Paksa kegiatan ini ke akun dosen tertentu (menimpa hasil pencocokan) */
  id_pengguna?: string | null;
  judul?: string | null;
  parameter?: Record<string, unknown> | null;
  /** true = baris tidak diterapkan */
  lewati?: boolean;
};

/** Isi kolom `unggahan_dokumen.koreksi`. `_surat` = koreksi tingkat dokumen. */
export type PetaKoreksi = {
  _surat?: { nomor?: string | null; tanggal?: string | null };
  [tanda: string]: KoreksiBaris | { nomor?: string | null; tanggal?: string | null } | undefined;
};

export type BarisTerapan = PenugasanTerpetakan & {
  /** Nilai asli parser, untuk ditampilkan sebagai pembanding */
  judulAsli: string;
  parameterAsli: Record<string, unknown>;
  dikoreksi: boolean;
  lewati: boolean;
  idPenggunaPaksa: string | null;
};

export const koreksiBaris = (koreksi: unknown, tanda: string): KoreksiBaris =>
  ((koreksi as PetaKoreksi | null)?.[tanda] as KoreksiBaris) ?? {};

/**
 * Tumpangkan koreksi admin di atas hasil pemetaan parser.
 * `hasil_parse` tidak pernah diubah — inilah yang menjaga jejak audit tetap
 * bisa dibandingkan dengan apa yang akhirnya diterapkan.
 */
export function gabungKoreksi(
  peta: PemetaanDokumen,
  koreksi: unknown
): { penugasan: BarisTerapan[]; nomorSurat: string | null; tanggalSurat: string | null } {
  const surat = (koreksi as PetaKoreksi | null)?._surat ?? {};
  const nomorSurat = teks(surat.nomor) ?? peta.nomorSurat;
  const tanggalSurat = teks(surat.tanggal) ?? peta.tanggalSurat;

  const penugasan = peta.penugasan.map((p) => {
    const k = koreksiBaris(koreksi, p.tanda);
    const parameter = { ...p.parameter, ...(k.parameter ?? {}) };
    const judul = teks(k.judul) ?? p.judul;
    const detail = { ...p.detail, no_sk: nomorSurat, tgl_sk: tanggalSurat };

    const dikoreksi =
      Boolean(teks(k.judul) && k.judul !== p.judul) ||
      Boolean(k.id_pengguna) ||
      Object.keys(k.parameter ?? {}).some(
        (nama) => String(parameter[nama]) !== String(p.parameter[nama])
      );

    return {
      ...p,
      judul,
      parameter,
      detail: dikoreksi ? { ...detail, dikoreksi_admin: true } : detail,
      judulAsli: p.judul,
      parameterAsli: p.parameter,
      dikoreksi,
      lewati: Boolean(k.lewati),
      idPenggunaPaksa: k.id_pengguna ?? null,
    };
  });

  return { penugasan, nomorSurat, tanggalSurat };
}
