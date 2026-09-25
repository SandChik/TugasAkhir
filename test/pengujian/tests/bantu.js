// Helper bersama: login, toast SweetAlert2, konfirmasi, akses database uji dan chain lokal.
import { expect } from "@playwright/test";
import pg from "pg";
import { ethers } from "ethers";
import fs from "node:fs";
import path from "node:path";

export const URL_NORMAL = "http://127.0.0.1:3100";
export const URL_RPC_MATI = "http://127.0.0.1:3101";
export const URL_PARSER_MATI = "http://127.0.0.1:3102";

export const AKUN = {
  admin: { email: "admin@polban.ac.id", pw: "admin123", beranda: /\/admin/ },
  dosen: { email: "ade.chandra@polban.ac.id", pw: "dosen123", beranda: /\/dosen/ },
  dosen1: { email: "dosen1@polban.ac.id", pw: "dosen123", beranda: /\/dosen/ },
  asesor1: { email: "asesor1@polban.ac.id", pw: "asesor123", beranda: /\/asesor/ },
  asesor2: { email: "asesor2@polban.ac.id", pw: "asesor123", beranda: /\/asesor/ },
};

export const DOK = "/uji/dokumen";
export const PENUGASAN = [
  "st_pengajaran.pdf",
  "st_bimbingan_PKL.pdf",
  "st_pengujian.pdf",
  "st_bimbingan_TA_D3.pdf",
  "st_bimbingan_TA_D4.pdf",
  "sk_pembinaan.pdf",
].map((f) => path.join(DOK, "penugasan", f));

export const T_PARSER = 10 * 60_000;
export const T_CHAIN = 3 * 60_000;

const PW_DB = process.env.PW_DB;
export const db = new pg.Pool({
  host: "127.0.0.1", port: 5433, user: "postgres", password: PW_DB, database: "bkd_test", max: 2,
});
export async function q(sql, params = []) {
  const r = await db.query(sql, params);
  return r.rows;
}

export const chain = new ethers.JsonRpcProvider("http://127.0.0.1:18545");
const alamat = Object.fromEntries(
  fs.readFileSync("/uji/alamat-lokal.txt", "utf8").trim().split(/\s+/).map((kv) => kv.split("="))
);
export const ALAMAT = alamat;
export async function saldoToken(addr) {
  const t = new ethers.Contract(alamat.TOK, ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"], chain);
  return await t.balanceOf(addr);
}

export async function login(page, akun, base = URL_NORMAL) {
  await page.goto(`${base}/login`);
  await page.locator('input[type="email"]').fill(akun.email);
  await page.locator('input[type="password"]').fill(akun.pw);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
}

export async function loginBerhasil(page, akun, base = URL_NORMAL) {
  await login(page, akun, base);
  await page.waitForURL(akun.beranda);
  await page.waitForLoadState("networkidle");
}

export async function logout(page) {
  await page.context().clearCookies();
}

/** Tunggu toast SweetAlert2, kembalikan teks judulnya. */
export async function toast(page, pola, timeout = 60_000) {
  const t = page.locator(".swal2-toast .swal2-title").filter({ hasText: pola }).first();
  await t.waitFor({ state: "visible", timeout });
  return ((await t.textContent()) ?? "").trim();
}

/** Toast apa pun yang muncul berikutnya (sukses atau galat). */
export async function toastApaSaja(page, timeout = 60_000) {
  const t = page.locator(".swal2-toast .swal2-title").first();
  await t.waitFor({ state: "visible", timeout });
  return ((await t.textContent()) ?? "").trim();
}

/** Buang toast yang masih tampil supaya toast berikutnya tidak tertukar. */
export async function hapusToast(page) {
  const t = page.locator(".swal2-toast");
  if (!(await t.count())) return;
  const tutup = t.locator(".swal2-close");
  if (await tutup.isVisible().catch(() => false)) await tutup.click().catch(() => {});
  await t.first().waitFor({ state: "detached", timeout: 15_000 }).catch(() => {});
}

export async function konfirmasi(page) {
  const popup = page.locator(".swal2-popup:not(.swal2-toast)");
  await popup.waitFor({ state: "visible" });
  await popup.locator("button.swal2-confirm").click();
}

export async function menu(page, label) {
  await page.locator("aside nav").getByRole("link", { name: label, exact: true }).click();
  await page.waitForLoadState("networkidle");
}

/** Simpan tangkapan layar bukti per langkah. */
export async function jepret(page, testInfo, nama) {
  const berkas = testInfo.outputPath(`${nama}.png`);
  await page.screenshot({ path: berkas, fullPage: true });
  await testInfo.attach(nama, { path: berkas, contentType: "image/png" });
}

export async function idPengguna(email) {
  const [r] = await q("select id_pengguna, nama, alamat_wallet, wallet_index, aktif from pengguna where email=$1", [email]);
  return r;
}

export async function periodeAktif() {
  const [r] = await q("select * from periode_bkd where status='aktif' order by created_at desc nulls last limit 1");
  return r;
}

export async function setFase(fase) {
  await q("update periode_bkd set fase_override=$1 where status='aktif'", [fase]);
}

export { expect };
