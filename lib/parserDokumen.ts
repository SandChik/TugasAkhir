/**
 * Klien layanan ekstraksi dokumen (folder `backend-extract`, FastAPI).
 *
 * Layanan itu membungkus lima parser PDF menjadi endpoint HTTP dan diproteksi
 * header `X-API-Key`. Aplikasi ini memakai empat di antaranya untuk dokumen
 * penugasan yang diunggah admin (SK & ST). Kunci API tidak pernah dikirim ke
 * browser: seluruh pemanggilan terjadi di server action.
 *
 * Konfigurasi (.env):
 *   PARSER_API_URL      default http://localhost:8000
 *   PARSER_API_KEY      nilai API_KEY pada backend-extract/.env
 *   PARSER_TIMEOUT_MS   default 600000 (endpoint VLM bisa beberapa menit)
 */

export type JenisUnggahan =
  | "st_pengajaran"
  | "st_bimbingan"
  | "st_pengujian"
  | "sk_pembinaan"
  | "artefak";

export type SpekJenis = {
  key: JenisUnggahan;
  label: string;
  dokumen: string;
  endpoint: string;
  mesin: "offline" | "vlm";
  /** Kode rule referensi_kegiatan yang dihasilkan jenis dokumen ini */
  kodeRule: string;
  /** Kata kunci nama berkas untuk deteksi otomatis saat unggah massal */
  petunjukNama: RegExp;
  /** Bentuk terbaca `petunjukNama` untuk ditampilkan ke admin di halaman unggah */
  petunjukTeks: string;
};

export const JENIS_UNGGAHAN: SpekJenis[] = [
  {
    key: "st_pengajaran",
    label: "ST Pengajaran",
    dokumen: "Surat Penugasan Pengajaran (beban SKS TE/PR per kelas)",
    endpoint: "/parse/pengajaran",
    mesin: "offline",
    kodeRule: "EDU101",
    petunjukNama: /pengajar|mengajar|perkuliahan/i,
    petunjukTeks: "pengajar, mengajar, perkuliahan",
  },
  {
    key: "st_bimbingan",
    label: "ST/SK Pembimbing (PKL & TA)",
    dokumen:
      "Surat Tugas Pembimbing PKL atau SK Pembimbing Tugas Akhir — jenisnya dikenali otomatis dari isi surat",
    endpoint: "/parse/bimbingan",
    mesin: "offline",
    kodeRule: "EDU202 (PKL) / EDU203 (TA)",
    // "tugas akhir" sengaja TIDAK dipakai sebagai petunjuk: ST Penguji TA juga
    // memuatnya, dan berkas bimbingan TA sudah tertangkap oleh "bimbing".
    petunjukNama: /bimbing|pkl|kerja[_ -]?lapangan|magang/i,
    petunjukTeks: "bimbing, pembimbing, pkl, kerja lapangan, magang",
  },
  {
    key: "st_pengujian",
    label: "ST Penguji TA",
    dokumen: "Surat Tugas Penguji Tugas Akhir",
    endpoint: "/parse/pengujian",
    mesin: "offline",
    kodeRule: "EDU301",
    petunjukNama: /penguji|pengujian|sidang/i,
    petunjukTeks: "penguji, pengujian, sidang",
  },
  {
    key: "sk_pembinaan",
    label: "SK Pembina Ormawa",
    dokumen: "SK Pembina Organisasi Kemahasiswaan (dokumen pindai, parser VLM)",
    endpoint: "/parse/sk-pembinaan",
    mesin: "vlm",
    kodeRule: "EDU401",
    petunjukNama: /pembina|ormawa|kemahasiswaan/i,
    petunjukTeks: "pembina, ormawa, kemahasiswaan",
  },
  // Sengaja paling akhir: bila nama berkas juga cocok dengan jenis spesifik di
  // atas, deteksiJenis memilih yang lebih dulu — parser universal jadi jaring
  // pengaman, bukan pengganti parser khusus.
  {
    key: "artefak",
    label: "Artefak Dokumen Umum",
    dokumen:
      "Dokumen dosen lain-lain (formulir, berita acara, lembar persetujuan) — peran dosen dikenali dari isi memakai skema umum (parser VLM universal)",
    endpoint: "/parse/artefak",
    mesin: "vlm",
    kodeRule: "EDU202/203/301/401 (menurut peran di dokumen)",
    petunjukNama: /artefak|berita[_ -]?acara|persetujuan|formulir/i,
    petunjukTeks: "artefak, berita acara, persetujuan, formulir",
  },
];

export const spekJenis = (jenis: string): SpekJenis | undefined =>
  JENIS_UNGGAHAN.find((j) => j.key === jenis);

export const LABEL_JENIS: Record<string, string> = Object.fromEntries(
  JENIS_UNGGAHAN.map((j) => [j.key, j.label])
);

/**
 * Tebak jenis dokumen dari nama berkas — dipakai saat admin memilih seluruh
 * isi folder SK/ST sekaligus. Urutan pengecekan penting: "sk_pembinaan"
 * mengandung kata "pembina" sehingga dicek lewat petunjuk masing-masing spek,
 * bukan lewat pencocokan longgar.
 */
export function deteksiJenis(namaFile: string): JenisUnggahan | null {
  const nama = namaFile.replace(/\.pdf$/i, "");
  const cocok = JENIS_UNGGAHAN.filter((j) => j.petunjukNama.test(nama));
  if (cocok.length === 1) return cocok[0].key;
  // Lebih dari satu petunjuk cocok (mis. "sk_pembina_bimbingan"): pakai
  // penanda awalan dokumen — "sk" -> SK, "st"/"sp" -> surat tugas.
  if (cocok.length > 1) {
    const awalanSk = /^\s*sk[_\s-]/i.test(nama);
    const pilih = cocok.find((j) => (awalanSk ? j.key === "sk_pembinaan" : j.key !== "sk_pembinaan"));
    return (pilih ?? cocok[0]).key;
  }
  return null;
}

const baseUrl = () => (process.env.PARSER_API_URL || "http://localhost:8000").replace(/\/+$/, "");
const timeoutMs = () => Number(process.env.PARSER_TIMEOUT_MS || 600_000);

export function parserDikonfigurasi(): boolean {
  return Boolean(process.env.PARSER_API_KEY);
}

/** Cek `GET /health` layanan parser (tanpa auth). null = tidak dapat dihubungi. */
export async function kesehatanParser(): Promise<
  { status: string; auth_dikonfigurasi: boolean; vlm_aktif: boolean } | null
> {
  try {
    const res = await fetch(`${baseUrl()}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export type OpsiSkPembinaan = {
  nomor_sk?: string;
  tanggal_sk?: string;
  halaman_l1?: string;
  halaman_l2?: string;
  dpi?: string;
};

/**
 * Kirim PDF ke endpoint parser yang sesuai dan kembalikan JSON hasilnya.
 * Melempar Error berisi pesan `detail` dari layanan bila gagal, supaya pesan
 * asli parser (mis. "layout lampiran berubah") tetap terbaca admin.
 */
export async function parseDokumen(
  jenis: JenisUnggahan,
  file: File,
  opsi: OpsiSkPembinaan = {}
): Promise<any> {
  const spek = spekJenis(jenis);
  if (!spek) throw new Error(`Jenis dokumen tidak dikenal: ${jenis}`);

  const apiKey = process.env.PARSER_API_KEY;
  if (!apiKey)
    throw new Error(
      "PARSER_API_KEY belum diset di .env — layanan ekstraksi dokumen tidak dapat dipanggil."
    );

  const body = new FormData();
  body.append("file", file, file.name);
  if (jenis === "sk_pembinaan") {
    for (const [k, v] of Object.entries(opsi)) {
      if (v) body.append(k, v);
    }
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl()}${spek.endpoint}`, {
      method: "POST",
      headers: { "X-API-Key": apiKey },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs()),
    });
  } catch (e: any) {
    const alasan = e?.name === "TimeoutError" ? "melebihi batas waktu" : "tidak dapat dihubungi";
    throw new Error(
      `Layanan ekstraksi di ${baseUrl()} ${alasan}. Pastikan backend-extract berjalan (uvicorn api:app --port 8000).`
    );
  }

  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const j = await res.json();
      if (j?.detail) detail = typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    } catch {
      /* biarkan detail default */
    }
    throw new Error(`Parser menolak dokumen (${res.status}): ${detail}`);
  }

  return res.json();
}
