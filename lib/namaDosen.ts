/**
 * Pencocokan nama dosen dari dokumen SK/ST ke akun `pengguna`.
 *
 * Dokumen menulis nama lengkap bergelar ("Dr. Ir. Budi Santoso, M.T."),
 * sedangkan akun sistem menyimpan nama polos ("Budi Santoso"). Normalisasi di
 * sini mengikuti `_kunci_nama` pada parser Python (backend-extract): buang
 * gelar depan, potong di koma pertama, rapikan spasi, huruf kecil — lalu
 * ditambah pembersihan gelar belakang tanpa koma yang kerap muncul pada hasil
 * pindai.
 */

const GELAR_DEPAN = /^\s*(prof|dr|drs|dra|ir|h|hj|st|se|spd)\.?\s+/i;

/** Kunci pencocokan utama: nama tanpa gelar, huruf kecil, spasi tunggal. */
export function kunciNama(nama: string): string {
  let s = (nama ?? "").replace(/\([^)]*\)/g, " ");
  if (s.includes(",")) s = s.split(",")[0];

  // gelar depan bisa bertumpuk ("Dr. Ir. ...")
  let sebelum = "";
  while (sebelum !== s) {
    sebelum = s;
    s = s.replace(GELAR_DEPAN, "");
  }

  // sisa gelar belakang tanpa koma ("Budi Santoso S.T. M.T.")
  const token = s.split(/\s+/).filter(Boolean);
  while (token.length > 1 && /\./.test(token[token.length - 1])) token.pop();

  return token
    .join(" ")
    .replace(/[^a-zA-Z\s'-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Kunci longgar: tanpa spasi/tanda hubung, untuk pindaian yang salah spasi. */
const kunciRapat = (nama: string) => kunciNama(nama).replace(/[\s'-]/g, "");

/**
 * Kunci tanpa inisial: dokumen kadang menyingkat marga panjang
 * ("Djoko Cahyo Utomo L." untuk "Djoko Cahyo Utomo Lieharyani").
 * Token satu huruf dibuang supaya sisanya bisa dicocokkan sebagai awalan.
 */
const kunciTanpaInisial = (kunci: string) =>
  kunci
    .split(" ")
    .filter((t) => t.length > 1)
    .join(" ");

/** Minimal token agar pencocokan awalan tidak terlalu longgar ("Ade ..."). */
const MIN_TOKEN_AWALAN = 2;

const normalNip = (nip?: string | null) => (nip ?? "").replace(/\D/g, "");

/** Kode dosen ST: samakan huruf besar & buang pemisah ("ko-019n" = "KO019N"). */
const normalKode = (kode?: string | null) =>
  (kode ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

export type AkunDosen = {
  id_pengguna: string;
  nama: string;
  nip?: string | null;
  nidn?: string | null;
  /** Kolom "Kd Dosen" pada surat tugas JTK (mis. KO019N) */
  kode_dosen?: string | null;
};

/** Petunjuk identitas dari satu baris dokumen, seurut kekuatan buktinya. */
export type PetunjukDosen = {
  nama: string;
  nip?: string | null;
  kodeDosen?: string | null;
};

export type HasilCocok<T extends AkunDosen> =
  | { status: "cocok"; dosen: T }
  | { status: "ambigu"; kandidat: T[] }
  | { status: "tidak_cocok" };

/**
 * Indeks pencocokan sekali-bangun untuk dipakai berulang atas daftar dosen.
 * Urutan percobaan mengikuti kekuatan bukti:
 * kode dosen -> NIP -> kunci nama -> kunci nama rapat -> nama berinisial marga.
 */
export function buatPencocokDosen<T extends AkunDosen>(daftar: T[]) {
  const perKode = new Map<string, T[]>();
  const perNip = new Map<string, T[]>();
  const perNama = new Map<string, T[]>();
  const perRapat = new Map<string, T[]>();
  // daftar linier untuk pencocokan awalan (jumlah dosen kecil, cukup dipindai)
  const semua: { kunci: string; dasar: string; dosen: T }[] = [];

  const dorong = (peta: Map<string, T[]>, kunci: string, d: T) => {
    if (!kunci) return;
    const arr = peta.get(kunci);
    if (arr) arr.push(d);
    else peta.set(kunci, [d]);
  };

  for (const d of daftar) {
    dorong(perKode, normalKode(d.kode_dosen), d);
    dorong(perNip, normalNip(d.nip), d);
    const kunci = kunciNama(d.nama);
    dorong(perNama, kunci, d);
    dorong(perRapat, kunciRapat(d.nama), d);
    if (kunci) semua.push({ kunci, dasar: kunciTanpaInisial(kunci), dosen: d });
  }

  /**
   * Upaya terakhir: marga panjang yang disingkat di dokumen.
   * "Djoko Cahyo Utomo L., S.Kom." menyisakan kunci "djoko cahyo utomo"
   * (token berinisial ikut dibuang), yang merupakan AWALAN dari
   * "djoko cahyo utomo lieharyani". Dicocokkan dua arah pada batas token, dan
   * hanya bila sisi terpendek punya >= 2 token — jadi "ade" tidak menyeret
   * "ade chandra nugraha", dan "muhammad riza" tidak menyentuh
   * "muhammad rizqi sholahuddin" (token 'riza' != 'rizqi').
   * Lebih dari satu kandidat dilaporkan ambigu, bukan ditebak.
   */
  function lewatAwalan(kunciCari: string): T[] {
    const dasar = kunciTanpaInisial(kunciCari);
    if (dasar.split(" ").filter(Boolean).length < MIN_TOKEN_AWALAN) return [];
    return semua
      .filter(
        (x) =>
          x.dasar === dasar ||
          x.dasar.startsWith(dasar + " ") ||
          (x.dasar.split(" ").length >= MIN_TOKEN_AWALAN && dasar.startsWith(x.dasar + " "))
      )
      .map((x) => x.dosen);
  }

  return function cocokkan(petunjuk: PetunjukDosen): HasilCocok<T> {
    const { nama, nip, kodeDosen } = petunjuk;

    const kandidatKode = perKode.get(normalKode(kodeDosen)) ?? [];
    if (kandidatKode.length === 1) return { status: "cocok", dosen: kandidatKode[0] };

    const kandidatNip = perNip.get(normalNip(nip)) ?? [];
    if (kandidatNip.length === 1) return { status: "cocok", dosen: kandidatNip[0] };

    for (const peta of [perNama, perRapat]) {
      const kunci = peta === perNama ? kunciNama(nama) : kunciRapat(nama);
      const kandidat = peta.get(kunci) ?? [];
      if (kandidat.length === 1) return { status: "cocok", dosen: kandidat[0] };
      if (kandidat.length > 1) return { status: "ambigu", kandidat };
    }
    const kandidatAwalan = lewatAwalan(kunciNama(nama));
    if (kandidatAwalan.length === 1) return { status: "cocok", dosen: kandidatAwalan[0] };

    for (const kandidat of [kandidatKode, kandidatNip, kandidatAwalan]) {
      if (kandidat.length > 1) return { status: "ambigu", kandidat };
    }
    return { status: "tidak_cocok" };
  };
}
