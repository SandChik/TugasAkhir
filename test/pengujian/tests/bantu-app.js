// Helper alur aplikasi yang dipakai IT dan ST.
import path from "node:path";
import { expect } from "@playwright/test";
import { toast, toastApaSaja, konfirmasi, hapusToast, q, jepret, T_PARSER, T_CHAIN } from "./bantu.js";

/** Konfirmasi SweetAlert2, opsional simpan tangkapan layar dialog (bukti NFR-09). */
async function setujui(page, bukti) {
  if (bukti) {
    await page.locator(".swal2-popup:not(.swal2-toast)").waitFor({ state: "visible" });
    await jepret(page, bukti.info, bukti.nama);
  }
  await konfirmasi(page);
}

/** Pilih opsi <select> berdasarkan pola teks label. */
export async function pilihLabel(select, pola) {
  const opsi = await select.locator("option").evaluateAll((els) => els.map((e) => ({ v: e.value, t: e.textContent.trim() })));
  const cocok = opsi.find((o) => pola.test(o.t));
  if (!cocok) throw new Error(`opsi ${pola} tidak ada: ${opsi.map((o) => o.t).join(" | ")}`);
  await select.selectOption(cocok.v);
  return cocok;
}

/** Isi field parameter p_<nama> apa pun tipenya (number, select, checkbox). */
export async function isiParameter(scope, nilai) {
  for (const [nama, v] of Object.entries(nilai)) {
    const el = scope.locator(`[name="p_${nama}"]`).first();
    if (!(await el.count())) continue;
    const tag = await el.evaluate((e) => e.tagName.toLowerCase());
    const tipe = await el.evaluate((e) => (e.getAttribute("type") || "").toLowerCase());
    if (tipe === "hidden") continue;
    if (tag === "select") {
      const opsi = await el.locator("option").evaluateAll((els) => els.map((e) => e.value));
      await el.selectOption(opsi.includes(String(v)) ? String(v) : { label: String(v) });
    } else if (tipe === "checkbox") {
      await el.setChecked(Boolean(v));
    } else {
      await el.fill(String(v));
    }
  }
}

/** Admin: catat kegiatan dosen lewat modal /admin/kegiatan. Kembalikan teks toast. */
export async function kegiatanAdmin(page, base, { dosen, kode, judul, param, detail = {} }) {
  await page.goto(`${base}/admin/kegiatan`);
  await page.getByRole("button", { name: "Tambah Kegiatan" }).click();
  await pilihLabel(page.locator("select#id_pengguna"), dosen);
  await page.locator("select#kode_rule").selectOption(kode);
  await page.locator("#judul").fill(judul);
  await isiParameter(page, param);
  for (const [k, v] of Object.entries(detail)) {
    const el = page.locator(`#d_${k}`);
    if (await el.count()) await el.fill(String(v));
  }
  await page.getByRole("button", { name: "Simpan Kegiatan" }).click();
  return await toastApaSaja(page, T_CHAIN);
}

/** Admin: unggah satu atau beberapa berkas pada /admin/unggah. */
export async function unggahSk(page, base, jenis, berkas, timeout = T_PARSER) {
  await page.goto(`${base}/admin/unggah`);
  await page.locator("summary").filter({ hasText: "Unggah berkas" }).click();
  await page.locator("select#jenis").selectOption(jenis);
  await page.locator("input#file").setInputFiles(berkas);
  await page.getByRole("button", { name: "Unggah & Ekstrak" }).click();
  return await toastApaSaja(page, timeout);
}

export async function unggahanTerakhir(namaFile) {
  const [r] = await q(
    "select * from unggahan_dokumen where nama_file=$1 order by created_at desc limit 1",
    [namaFile]
  );
  return r;
}

/** Admin: terapkan unggahan dari daftar. */
export async function terapkan(page, base, idUnggahan, bukti) {
  await page.goto(`${base}/admin/unggah`);
  const baris = page.getByRole("row").filter({ has: page.locator(`a[href="/admin/unggah/${idUnggahan}"]`) });
  await baris.locator('button[title^="Terapkan"]').click();
  await setujui(page, bukti);
  return await toastApaSaja(page, T_PARSER);
}

/** Dosen: buka laporan periode aktif (buat bila belum ada). */
export async function bukaLaporan(page, base) {
  await page.goto(`${base}/dosen/rekap-kegiatan`);
  await page.waitForLoadState("networkidle");
  const buat = page.locator('button[title="Buat laporan kinerja"]');
  if (await buat.count()) {
    // buatLkd langsung mengarahkan ke halaman laporan
    await buat.first().click();
  } else {
    await page.locator('a[title="Lihat laporan kinerja"]').first().click();
  }
  await page.waitForURL(/\/dosen\/rekap-kegiatan\/[^/?]+/);
  await page.waitForLoadState("networkidle");
  return page.url().match(/rekap-kegiatan\/([^/?]+)/)[1];
}

export async function tarikSemua(page) {
  const tarik = page.getByRole("button", { name: /^Tarik Semua Kinerja dari Portofolio/ });
  if (await tarik.count()) {
    await tarik.click();
    return await toast(page, /kegiatan diklaim ke laporan|Tidak ada kegiatan baru/);
  }
  return null;
}

export async function simpanPermanen(page, bukti) {
  await hapusToast(page);
  await page.getByRole("button", { name: "Simpan Permanen (final)" }).click();
  await expect(page.locator(".swal2-popup:not(.swal2-toast) .swal2-title")).toHaveText("Kunci laporan untuk dinilai?");
  await setujui(page, bukti);
  return await toastApaSaja(page);
}

/** Admin: set fase periode aktif lewat UI /admin/periode. */
export async function setFaseUi(page, base, namaPeriode, fase) {
  await page.goto(`${base}/admin/periode`);
  const baris = page.getByRole("row").filter({ hasText: namaPeriode }).first();
  await baris.locator('select[name="fase"]').selectOption(fase);
  await baris.getByTitle("Terapkan fase").click();
  return await toastApaSaja(page);
}

/** Admin: isi slot asesor kosong secara massal dengan Asesor Satu dan Asesor Dua. */
export async function tugaskanMassal(page, base) {
  await page.goto(`${base}/admin/penugasan-asesor`);
  const form = page.locator("form").filter({ hasText: "Isi slot yang masih kosong" });
  if (!(await form.count())) return "form massal tidak tampil";
  await pilihLabel(form.locator('select[name="asesor_1"]'), /Asesor Satu/);
  await pilihLabel(form.locator('select[name="asesor_2"]'), /Asesor Dua/);
  await form.getByRole("button", { name: "Tugaskan" }).click();
  await konfirmasi(page);
  return await toastApaSaja(page);
}

/** Asesor: buka halaman penilaian untuk dosen tertentu. */
export async function bukaPenilaian(page, base, namaDosen, periode) {
  await page.goto(`${base}/asesor/asesor-bkd`);
  await page.locator('input[aria-label="Cari nama atau NIDN dosen…"]').fill(namaDosen);
  let baris = page.getByRole("row").filter({ hasText: namaDosen });
  if (periode) baris = baris.filter({ hasText: periode });
  baris = baris.first();
  await baris.locator('a[title="Lakukan penilaian"]').click();
  await page.waitForURL(/\/asesor\/penilaian\//);
  await page.waitForLoadState("networkidle");
  return page.url().match(/penilaian\/([^/?#]+)/)[1];
}

export async function nilaiDanSahkan(page, bukti) {
  await page.getByRole("button", { name: "Simpan Penilaian" }).click();
  const t1 = await toastApaSaja(page);
  await page.waitForLoadState("networkidle");
  await hapusToast(page);
  await page.getByRole("button", { name: "Sahkan Penilaian (final)" }).click();
  await expect(page.locator(".swal2-popup:not(.swal2-toast) .swal2-title")).toHaveText("Sahkan penilaian?");
  await setujui(page, bukti);
  const t2 = await toastApaSaja(page, T_CHAIN);
  return [t1, t2];
}

/** Dosen: unggah bukti pada halaman bukti kegiatan. */
export async function unggahBukti(page, { nama, jenis = "Bukti Lainnya", berkas, tautan }) {
  await hapusToast(page);
  const form = page.locator("#unggah-bukti");
  await form.locator('input[name="nama_dokumen"]').fill(nama);
  await form.locator('select[name="jenis_dokumen"]').selectOption(jenis);
  if (berkas) await form.locator('input[type="file"][name="file"]').setInputFiles(berkas);
  if (tautan) await form.locator('input[name="tautan"]').fill(tautan);
  await form.getByRole("button", { name: "Upload Dokumen" }).click();
  return await toastApaSaja(page, T_PARSER);
}

export const BUKTI = (f) => path.join("/uji/dokumen/bukti", f);
