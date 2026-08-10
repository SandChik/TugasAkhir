/**
 * Parameter rubrik yang nilainya sudah ditentukan konteks pelaporan, sehingga
 * tidak perlu — dan tidak boleh — diisi ulang lewat formulir.
 *
 * Satu LKD = satu periode = satu semester, jadi `jumlahSemester` pada rubrik
 * PO BKD 2021 selalu 1 untuk kegiatan yang dilaporkan pada periode berjalan.
 * Ekstraksi SK/ST memang sudah memakai nilai yang sama (lihat
 * `lib/pemetaanPenugasan`), dan kontrak kalkulator menolak nilai 0.
 */
export const PARAMETER_TETAP: Record<string, number> = {
  jumlahSemester: 1,
};

export type FieldRubrik = { name: string; label: string; type: string };

/** Field yang benar-benar ditanyakan ke pengguna (parameter tetap disembunyikan). */
export function fieldFormulir<T extends { name: string }>(fields: T[]): T[] {
  return fields.filter((f) => !(f.name in PARAMETER_TETAP));
}

/** Field yang nilainya dikunci sistem — untuk catatan penjelas di formulir. */
export function fieldTetap<T extends { name: string }>(fields: T[]): T[] {
  return fields.filter((f) => f.name in PARAMETER_TETAP);
}

/**
 * Baca parameter rubrik dari formulir. Parameter tetap TIDAK dibaca dari input:
 * nilainya selalu dari `PARAMETER_TETAP`, sehingga kiriman yang dibuat-buat pun
 * tidak dapat mengubahnya.
 *
 * `rawValues` tetap memuat seluruh field sesuai urutan skema karena
 * `hitungViaKontrak` memetakannya menjadi argumen fungsi kontrak.
 */
export function bacaParameterForm(
  fields: { name: string; type: string }[],
  formData: FormData
): { parameter: Record<string, any>; rawValues: Record<string, string> } {
  const parameter: Record<string, any> = {};
  const rawValues: Record<string, string> = {};

  for (const f of fields) {
    const tetap = PARAMETER_TETAP[f.name];
    const raw =
      tetap !== undefined ? String(tetap) : String(formData.get(`p_${f.name}`) ?? "");
    rawValues[f.name] = raw;
    parameter[f.name] =
      f.type === "boolean"
        ? raw === "true" || raw === "on"
        : f.type === "number"
          ? Number(raw)
          : raw;
  }

  return { parameter, rawValues };
}
