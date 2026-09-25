// Integration testing, Tabel IV.82. Periode: seed "2025/2026 Genap".
// Urutan eksekusi mengikuti ketergantungan data, bukan urutan ID.
import { test } from "@playwright/test";
import fs from "node:fs";
import { ethers } from "ethers";
import {
  expect, q, AKUN, URL_NORMAL, URL_RPC_MATI, URL_PARSER_MATI, PENUGASAN,
  login, loginBerhasil, logout, toastApaSaja, konfirmasi, jepret, idPengguna, saldoToken, chain, ALAMAT,
  T_PARSER, T_CHAIN,
} from "./bantu.js";
import {
  pilihLabel, kegiatanAdmin, unggahSk, unggahanTerakhir, terapkan, bukaLaporan, tarikSemua,
  simpanPermanen, setFaseUi, tugaskanMassal, bukaPenilaian, nilaiDanSahkan, unggahBukti, BUKTI,
} from "./bantu-app.js";

const PERIODE = "2025/2026 Genap";
const [ST_PENGAJARAN, ST_PKL, ST_PENGUJI, , , SK_PEMBINAAN] = PENUGASAN;
const catat = (info, k, v) => info.annotations.push({ type: k, description: String(v) });

// ---------------------------------------------------------------- basis data
test("IT-001 [Positif] autentikasi dosen: sesi berisi peran dan diarahkan ke ruang kerja", async ({ page }, info) => {
  await login(page, AKUN.dosen);
  await page.waitForURL(/\/dosen\//);
  const sesi = await (await page.request.get(`${URL_NORMAL}/api/auth/session`)).json();
  catat(info, "url", page.url());
  catat(info, "sesi.peran", sesi?.user?.peran);
  expect(sesi?.user?.peran).toBe("dosen");
  expect(page.url()).toMatch(/\/dosen\/pengajaran$/);
  await jepret(page, info, "IT-001-ruang-kerja-dosen");
});

test("IT-002 [Negatif] akun nonaktif ditolak dengan pesan sama seperti kredensial keliru", async ({ page }, info) => {
  const email = "zulkifli.arsyad@polban.ac.id";
  await loginBerhasil(page, AKUN.admin);
  await page.goto(`${URL_NORMAL}/admin/pengguna`);
  await page.locator('input[aria-label="Cari nama, email, NIDN, kode dosen…"]').fill("Zulkifli");
  const baris = page.getByRole("row").filter({ hasText: email });
  await baris.locator('button[title="Nonaktifkan akun"]').click();
  await expect(page.locator(".swal2-popup:not(.swal2-toast) .swal2-title")).toHaveText("Nonaktifkan akun?");
  await konfirmasi(page);
  catat(info, "toast admin", await toastApaSaja(page));
  expect((await idPengguna(email)).aktif).toBe(false);
  await logout(page);

  await login(page, { email, pw: "dosen123" });
  const pesanNonaktif = page.locator("p.bg-danger-soft");
  await expect(pesanNonaktif).toBeVisible();
  const teksNonaktif = (await pesanNonaktif.textContent()).trim();
  await jepret(page, info, "IT-002-akun-nonaktif");

  await login(page, { email: AKUN.dosen.email, pw: "salah-sandi" });
  await expect(page.locator("p.bg-danger-soft")).toBeVisible();
  const teksSalah = (await page.locator("p.bg-danger-soft").textContent()).trim();
  catat(info, "pesan nonaktif", teksNonaktif);
  catat(info, "pesan sandi keliru", teksSalah);
  expect(page.url()).toMatch(/\/login/);
  expect(teksNonaktif).toBe(teksSalah);
});

test("IT-003 [Positif] tetapkan wallet: alamat tersimpan dengan indeks turunan unik", async ({ page }, info) => {
  const email = "dosen.ujiwallet@polban.ac.id";
  await loginBerhasil(page, AKUN.admin);
  await page.goto(`${URL_NORMAL}/admin/pengguna`);
  const f = page.locator("form").filter({ has: page.getByRole("button", { name: "+ Tambah" }) });
  await f.locator('input[name="nama"]').fill("Dosen Uji Wallet");
  await f.locator('input[name="email"]').fill(email);
  await f.locator('select[name="peran"]').selectOption("dosen");
  await f.locator('input[name="password"]').fill("dosenuji123");
  await f.locator('input[name="nidn"]').fill("9900000001");
  await f.getByRole("button", { name: "+ Tambah" }).click();
  catat(info, "toast buat akun", await toastApaSaja(page));
  const sebelum = await idPengguna(email);
  expect(sebelum.alamat_wallet).toBeNull();

  await page.goto(`${URL_NORMAL}/admin/wallet`);
  await page.locator('input[aria-label="Cari nama, NIDN, atau address…"]').fill("Dosen Uji Wallet");
  const baris = page.getByRole("row").filter({ hasText: "Dosen Uji Wallet" });
  await baris.locator('button[title="Tetapkan wallet"]').click();
  catat(info, "toast wallet", await toastApaSaja(page));
  const p = await idPengguna(email);
  const [{ n }] = await q("select count(*)::int n from pengguna where wallet_index=$1", [p.wallet_index]);
  const turunan = ethers.HDNodeWallet.fromMnemonic(
    ethers.Mnemonic.fromPhrase("test test test test test test test test test test test junk"),
    `m/44'/60'/0'/0/${p.wallet_index}`
  ).address;
  catat(info, "wallet_index", p.wallet_index);
  catat(info, "alamat_wallet", p.alamat_wallet);
  expect(p.alamat_wallet).toBe(turunan);
  expect(n).toBe(1);
  await jepret(page, info, "IT-003-wallet");
});

// ---------------------------------------------------------------- kontrak kalkulator
const PARAM_VALID = { sksMataKuliah: 3, jumlahPertemuanRencana: 16, jumlahPertemuanRealisasi: 16, semesterPenuh: true, teamTeaching: false, persenPorsiDosen: 100 };

test("IT-004 [Positif] simpan kegiatan pengajaran: nilai kredit dari kontrak tersimpan", async ({ page }, info) => {
  await loginBerhasil(page, AKUN.admin);
  const judul = "IT-004 Basis Data / 2CTI1";
  const t = await kegiatanAdmin(page, URL_NORMAL, { dosen: /Dosen Dua/, kode: "EDU101", judul, param: PARAM_VALID, detail: { kelas: "2CTI1", jumlah_mahasiswa: 30 } });
  catat(info, "toast", t);
  const [k] = await q("select sks_dihitung_x100, status_perhitungan from kegiatan where judul=$1", [judul]);
  catat(info, "db", JSON.stringify(k));
  expect(k.status_perhitungan).toBe("berhasil");
  expect(k.sks_dihitung_x100).toBe(300);
  expect(t).toContain("SKS terhitung: 3.00");
});

test("IT-005 [Negatif] parameter ditolak kontrak: kegiatan tersimpan dengan status gagal", async ({ page }, info) => {
  await loginBerhasil(page, AKUN.admin);
  const judul = "IT-005 Realisasi Melebihi Rencana";
  const t = await kegiatanAdmin(page, URL_NORMAL, { dosen: /Ade Hodijah/, kode: "EDU101", judul, param: { ...PARAM_VALID, jumlahPertemuanRealisasi: 17 } });
  catat(info, "toast", t);
  const [k] = await q("select sks_dihitung_x100, status_perhitungan from kegiatan where judul=$1", [judul]);
  catat(info, "db", JSON.stringify(k));
  expect(k).toBeTruthy();
  expect(k.status_perhitungan).toBe("gagal");
  expect(k.sks_dihitung_x100).toBeNull();
  expect(t).toMatch(/perhitungan kontrak gagal/);
});

test("IT-006 [Negatif] RPC tidak dapat dihubungi: kegiatan tersimpan dengan status gagal dan pesan aksi", async ({ page }, info) => {
  test.setTimeout(6 * 60_000);
  await loginBerhasil(page, AKUN.admin, URL_RPC_MATI);
  const judul = "IT-006 RPC Mati";
  const mulai = Date.now();
  const t = await kegiatanAdmin(page, URL_RPC_MATI, { dosen: /Ade Hodijah/, kode: "EDU101", judul, param: PARAM_VALID });
  catat(info, "durasi_ms", Date.now() - mulai);
  catat(info, "toast", t);
  const [k] = await q("select sks_dihitung_x100, status_perhitungan from kegiatan where judul=$1", [judul]);
  catat(info, "db", JSON.stringify(k));
  expect(k?.status_perhitungan).toBe("gagal");
  expect(k?.sks_dihitung_x100).toBeNull();
  expect(t).toMatch(/perhitungan kontrak gagal/);
});

// ---------------------------------------------------------------- layanan ekstraksi
test("IT-007 [Positif] ekstraksi deterministik: keluaran parser tersimpan dan baris tampil di pratinjau", async ({ page }, info) => {
  test.setTimeout(T_PARSER + 60_000);
  await loginBerhasil(page, AKUN.admin);
  const t = await unggahSk(page, URL_NORMAL, "st_pengajaran", ST_PENGAJARAN);
  catat(info, "toast", t);
  const u = await unggahanTerakhir("st_pengajaran.pdf");
  catat(info, "status", u.status);
  expect(u.status).toBe("terparse");
  expect(u.hasil_parse).not.toBeNull();
  await page.goto(`${URL_NORMAL}/admin/unggah/${u.id_unggahan}`);
  const n = await page.locator('div[id^="baris-"]').count();
  catat(info, "baris pratinjau (halaman 1)", n);
  expect(n).toBeGreaterThan(0);
  await jepret(page, info, "IT-007-pratinjau");
});

test("IT-008 [Positif] ekstraksi jalur VLM: SK pindaian tertafsir dan baris pembina tampil", async ({ page }, info) => {
  test.setTimeout(T_PARSER + 60_000);
  await loginBerhasil(page, AKUN.admin);
  const mulai = Date.now();
  const t = await unggahSk(page, URL_NORMAL, "sk_pembinaan", SK_PEMBINAAN);
  catat(info, "durasi_ms", Date.now() - mulai);
  catat(info, "toast", t);
  const u = await unggahanTerakhir("sk_pembinaan.pdf");
  catat(info, "status", `${u.status} ${u.pesan_galat ?? ""}`);
  expect(u.status).toBe("terparse");
  await page.goto(`${URL_NORMAL}/admin/unggah/${u.id_unggahan}`);
  const n = await page.locator('div[id^="baris-"]').count();
  catat(info, "baris pratinjau (halaman 1)", n);
  expect(n).toBeGreaterThan(0);
  await jepret(page, info, "IT-008-pratinjau-vlm");
});

test("IT-009 [Negatif] berkas bukan PDF ditolak sebelum dikirim ke layanan ekstraksi", async ({ page }, info) => {
  const berkas = "/tmp/bukan-pdf.txt";
  fs.writeFileSync(berkas, "ini bukan dokumen PDF\n");
  await loginBerhasil(page, AKUN.admin);
  const t = await unggahSk(page, URL_NORMAL, "st_pengajaran", berkas, 60_000);
  catat(info, "toast", t);
  const [{ n }] = await q("select count(*)::int n from unggahan_dokumen where nama_file='bukan-pdf.txt'");
  catat(info, "baris unggahan", n);
  expect(t).toMatch(/bukan berkas PDF/);
  expect(n).toBe(0);
});

test("IT-010 [Negatif] layanan ekstraksi mati: unggahan tercatat gagal dengan pesan, aplikasi tetap berjalan", async ({ page }, info) => {
  await loginBerhasil(page, AKUN.admin, URL_PARSER_MATI);
  await page.goto(`${URL_PARSER_MATI}/admin/unggah`);
  await page.locator("summary").filter({ hasText: "Unggah berkas" }).click();
  const tombol = page.getByRole("button", { name: "Unggah & Ekstrak" });
  const terkunci = await tombol.isDisabled();
  catat(info, "tombol unggah nonaktif saat /health gagal", terkunci);
  await jepret(page, info, "IT-010-tombol-terkunci");
  // simulasi parser mati setelah halaman dimuat: kirim form walau tombol dikunci UI
  await page.locator("select#jenis").selectOption("st_pengajaran");
  await page.locator("input#file").setInputFiles(ST_PENGAJARAN);
  await tombol.evaluate((b) => b.removeAttribute("disabled"));
  await tombol.click();
  const t = await toastApaSaja(page, 120_000);
  catat(info, "toast", t);
  const [u] = await q("select status, pesan_galat from unggahan_dokumen where nama_file='st_pengajaran.pdf' and status='gagal' order by created_at desc limit 1");
  catat(info, "db", JSON.stringify(u));
  expect(u?.status).toBe("gagal");
  expect(u?.pesan_galat).toMatch(/tidak dapat dihubungi/);
  const r = await page.goto(`${URL_PARSER_MATI}/admin/unggah?status=gagal`);
  expect(r.status()).toBe(200);
  await expect(page.getByText(/tidak dapat dihubungi/).first()).toBeVisible();
  await jepret(page, info, "IT-010-baris-gagal");
});

test("IT-011 [Edge] terapkan ulang: kegiatan diperbarui tanpa penggandaan, kegiatan diklaim tidak berubah", async ({ page }, info) => {
  test.setTimeout(10 * 60_000);
  await loginBerhasil(page, AKUN.admin);
  const u = await unggahanTerakhir("st_pengajaran.pdf").then(async (x) =>
    x.status === "gagal" ? (await q("select * from unggahan_dokumen where nama_file='st_pengajaran.pdf' and status<>'gagal' order by created_at desc limit 1"))[0] : x);
  catat(info, "terapkan pertama", await terapkan(page, URL_NORMAL, u.id_unggahan));
  const [{ n: n1 }] = await q("select count(*)::int n from kegiatan where id_unggahan=$1", [u.id_unggahan]);

  // dosen mengklaim kegiatannya
  await logout(page);
  await loginBerhasil(page, AKUN.dosen);
  await bukaLaporan(page, URL_NORMAL);
  catat(info, "klaim dosen", await tarikSemua(page));
  const diklaim = await q(
    "select k.id_kegiatan, k.judul, k.parameter::text p, k.sks_dihitung_x100, k.updated_at from kegiatan k join lkd l on l.id_lkd=k.id_lkd join pengguna g on g.id_pengguna=l.id_pengguna where k.id_unggahan=$1 and k.diklaim and g.email=$2 order by k.id_kegiatan",
    [u.id_unggahan, AKUN.dosen.email]
  );
  catat(info, "kegiatan diklaim", diklaim.length);
  expect(diklaim.length).toBeGreaterThan(0);

  // admin mengoreksi satu baris milik dosen lain, lalu terapkan ulang
  await logout(page);
  await loginBerhasil(page, AKUN.admin);
  await page.goto(`${URL_NORMAL}/admin/unggah/${u.id_unggahan}`);
  const kartu = page.locator('div[id^="baris-"]').filter({ hasNotText: "Ade Chandra" }).filter({ has: page.locator('a[title="Ubah baris"]') }).first();
  await kartu.locator('a[title="Ubah baris"]').click();
  const panel = page.locator('form').filter({ has: page.locator('input[name="tanda"]') }).first();
  const judulLama = await panel.locator('input[name="judul"]').inputValue();
  const judulBaru = `${judulLama} (koreksi IT-011)`;
  await panel.locator('input[name="judul"]').fill(judulBaru);
  await panel.getByRole("button", { name: "Simpan koreksi" }).click();
  catat(info, "toast koreksi", await toastApaSaja(page));
  const t2 = await terapkan(page, URL_NORMAL, u.id_unggahan);
  catat(info, "terapkan ulang", t2);

  const [{ n: n2 }] = await q("select count(*)::int n from kegiatan where id_unggahan=$1", [u.id_unggahan]);
  const [{ n: nKoreksi }] = await q("select count(*)::int n from kegiatan where id_unggahan=$1 and judul=$2", [u.id_unggahan, judulBaru]);
  const sesudah = await q(
    "select id_kegiatan, judul, parameter::text p, sks_dihitung_x100, updated_at from kegiatan where id_kegiatan = any($1::uuid[]) order by id_kegiatan",
    [diklaim.map((d) => d.id_kegiatan)]
  );
  catat(info, "jumlah kegiatan sebelum/sesudah", `${n1}/${n2}`);
  catat(info, "baris terkoreksi", nKoreksi);
  expect(n2).toBe(n1);
  expect(nKoreksi).toBe(1);
  expect(sesudah.map((s) => [s.judul, s.p, s.sks_dihitung_x100, +s.updated_at])).toEqual(
    diklaim.map((s) => [s.judul, s.p, s.sks_dihitung_x100, +s.updated_at])
  );
  expect(t2).toMatch(/tidak diubah karena sudah diklaim dosen/);
});

// ---------------------------------------------------------------- kontrak registri
async function riwayatCatat(idUnggahan) {
  return q("select * from riwayat_transaksi where jenis_transaksi='catat_dokumen' and reference_id=$1 order by created_at", [`unggahan:${idUnggahan}`]);
}

test("IT-019 [Positif] unggah dokumen penugasan: sidik digital tercatat di registri, riwayat berhasil", async ({ page }, info) => {
  test.setTimeout(T_PARSER + 60_000);
  await loginBerhasil(page, AKUN.admin);
  catat(info, "toast", await unggahSk(page, URL_NORMAL, "st_bimbingan", ST_PKL));
  const u = await unggahanTerakhir("st_bimbingan_PKL.pdf");
  const [r] = await riwayatCatat(u.id_unggahan);
  catat(info, "riwayat", JSON.stringify({ status: r?.status, tx: r?.tx_hash }));
  expect(r?.status).toBe("success");
  const rc = await chain.getTransactionReceipt(r.tx_hash);
  const iface = new ethers.Interface(["event DokumenTercatat(address indexed operator, bytes32 indexed hashDokumen, string aksi, string referensi)"]);
  const ev = rc.logs.map((l) => { try { return iface.parseLog(l); } catch { return null; } }).find(Boolean);
  catat(info, "event", `${ev?.args?.hashDokumen} ${ev?.args?.aksi} ${ev?.args?.referensi}`);
  expect(rc.to.toLowerCase()).toBe(ALAMAT.REG.toLowerCase());
  expect(ev.args.hashDokumen).toBe(`0x${u.sha256}`);
  expect(ev.args.referensi).toBe(`unggahan:${u.id_unggahan}`);
});

test("IT-020 [Negatif] RPC mati saat unggah dokumen penugasan: unggahan tersimpan, riwayat gagal", async ({ page }, info) => {
  test.setTimeout(T_PARSER + 60_000);
  await loginBerhasil(page, AKUN.admin, URL_RPC_MATI);
  const mulai = Date.now();
  const t = await unggahSk(page, URL_RPC_MATI, "st_pengujian", ST_PENGUJI);
  catat(info, "durasi_ms", Date.now() - mulai);
  catat(info, "toast", t);
  const u = await unggahanTerakhir("st_pengujian.pdf");
  const [r] = await riwayatCatat(u.id_unggahan);
  catat(info, "unggahan", u.status);
  catat(info, "riwayat", JSON.stringify({ status: r?.status, tx: r?.tx_hash }));
  expect(u.status).toBe("terparse");
  expect(r?.status).toBe("failed");
});

// ---------------------------------------------------------------- pemeriksaan bukti
async function halamanBuktiPkl(page, base) {
  const [k] = await q(
    `select k.id_kegiatan from kegiatan k join lkd l on l.id_lkd=k.id_lkd join pengguna g on g.id_pengguna=l.id_pengguna
     join referensi_kegiatan r on r.id_referensi=k.id_referensi join periode_bkd p on p.id_periode=l.id_periode
     where g.email=$1 and r.kode_rule='EDU202' and p.status='aktif' order by k.created_at limit 1`,
    [AKUN.dosen.email]
  );
  await page.goto(`${base}/dosen/bimbingan-mahasiswa/${k.id_kegiatan}/bukti`);
  await page.waitForLoadState("networkidle");
  return k.id_kegiatan;
}

test("IT-012 [Positif] pemeriksaan bukti: dokumen memuat nama pemilik akun berstatus cocok", async ({ page }, info) => {
  test.setTimeout(T_PARSER * 2);
  await loginBerhasil(page, AKUN.admin);
  const u = await unggahanTerakhir("st_bimbingan_PKL.pdf");
  catat(info, "terapkan ST PKL", await terapkan(page, URL_NORMAL, u.id_unggahan));
  await logout(page);
  await loginBerhasil(page, AKUN.dosen);
  const id = await halamanBuktiPkl(page, URL_NORMAL);
  const t = await unggahBukti(page, { nama: "IT-012 Lembar Pengesahan PKL", berkas: BUKTI("pengesahan_pkl_221524001.pdf") });
  catat(info, "toast", t);
  const [d] = await q("select verifikasi from dokumen_kegiatan where id_kegiatan=$1 and nama_dokumen=$2", [id, "IT-012 Lembar Pengesahan PKL"]);
  catat(info, "verifikasi.status", d?.verifikasi?.status);
  catat(info, "nama_terdeteksi", JSON.stringify(d?.verifikasi?.nama_terdeteksi));
  expect(d?.verifikasi?.status).toBe("cocok");
  await jepret(page, info, "IT-012-bukti-cocok");
});

test("IT-013 [Negatif] layanan pemeriksaan mati: dokumen tersimpan, pemeriksaan gagal dengan pesan", async ({ page }, info) => {
  await loginBerhasil(page, AKUN.dosen, URL_PARSER_MATI);
  const id = await halamanBuktiPkl(page, URL_PARSER_MATI);
  const t = await unggahBukti(page, { nama: "IT-013 Pengesahan PKL", berkas: BUKTI("pengesahan_pkl_221524023.pdf") });
  catat(info, "toast", t);
  const [d] = await q("select verifikasi from dokumen_kegiatan where id_kegiatan=$1 and nama_dokumen=$2", [id, "IT-013 Pengesahan PKL"]);
  catat(info, "verifikasi", JSON.stringify(d?.verifikasi));
  expect(d).toBeTruthy();
  expect(d.verifikasi?.status).toBe("gagal");
  expect(d.verifikasi?.pesan).toMatch(/tidak dapat dihubungi/);
});

test("IT-014 [Negatif] bukti berupa pranala luar: pemeriksaan tidak dijalankan", async ({ page }, info) => {
  await loginBerhasil(page, AKUN.dosen);
  const id = await halamanBuktiPkl(page, URL_NORMAL);
  const t = await unggahBukti(page, { nama: "IT-014 Tautan Drive", tautan: "https://drive.google.com/file/d/uji-it014/view" });
  catat(info, "toast", t);
  const [d] = await q("select jenis_file, verifikasi from dokumen_kegiatan where id_kegiatan=$1 and nama_dokumen=$2", [id, "IT-014 Tautan Drive"]);
  catat(info, "db", JSON.stringify(d));
  expect(d?.jenis_file).toBe("tautan");
  expect(d?.verifikasi).toBeNull();
});

// ---------------------------------------------------------------- kontrak token
test("IT-015 [Positif] pengesahan asesor kedua: token terbit, tx hash tersimpan, saldo bertambah", async ({ page }, info) => {
  test.setTimeout(15 * 60_000);
  // prasyarat fase pengisian: dosen1 dan dosen2 mengunci laporan
  await loginBerhasil(page, AKUN.dosen1);
  await bukaLaporan(page, URL_NORMAL);
  catat(info, "dosen1 klaim", await tarikSemua(page));
  catat(info, "dosen1 permanen", await simpanPermanen(page));
  await logout(page);
  await loginBerhasil(page, { email: "dosen2@polban.ac.id", pw: "dosen123", beranda: /\/dosen/ });
  await bukaLaporan(page, URL_NORMAL);
  catat(info, "dosen2 klaim", await tarikSemua(page));
  catat(info, "dosen2 permanen", await simpanPermanen(page));
  await logout(page);
  await loginBerhasil(page, AKUN.admin);
  catat(info, "penugasan massal", await tugaskanMassal(page, URL_NORMAL));
  catat(info, "fase", await setFaseUi(page, URL_NORMAL, PERIODE, "penilaian"));
  await logout(page);

  await loginBerhasil(page, AKUN.asesor1);
  for (const nama of ["Dosen Satu", "Dosen Dua"]) {
    await bukaPenilaian(page, URL_NORMAL, nama);
    catat(info, `asesor1 ${nama}`, (await nilaiDanSahkan(page)).join(" | "));
  }
  await logout(page);

  const d1 = await idPengguna(AKUN.dosen1.email);
  const saldoAwal = await saldoToken(d1.alamat_wallet);
  await loginBerhasil(page, AKUN.asesor2);
  await bukaPenilaian(page, URL_NORMAL, "Dosen Satu");
  const [, t] = await nilaiDanSahkan(page);
  catat(info, "toast asesor2", t);
  const saldoAkhir = await saldoToken(d1.alamat_wallet);
  const [s] = await q("select s.* from simpulan_bkd s join lkd l on l.id_lkd=s.id_lkd where l.id_pengguna=$1", [d1.id_pengguna]);
  const [r] = await q("select * from riwayat_transaksi where jenis_transaksi='mint' and reference_id=$1", [s.hash_penilaian]);
  catat(info, "simpulan", `${s.sks_pendidikan_x100} ${s.status_final}`);
  catat(info, "riwayat mint", `${r?.status} ${r?.tx_hash}`);
  catat(info, "saldo", `${saldoAwal} -> ${saldoAkhir}`);
  expect(t).toMatch(/Kedua asesor mengesahkan\. Token .* SKS diterbitkan/);
  expect(r?.status).toBe("success");
  expect(r?.tx_hash).toMatch(/^0x[0-9a-f]{64}$/);
  expect(saldoAkhir - saldoAwal).toBe(BigInt(s.sks_pendidikan_x100) * 10n ** 16n);
  await jepret(page, info, "IT-015-pengesahan");
});

test("IT-016 [Negatif] RPC mati saat pengesahan kedua: simpulan tersimpan, riwayat mint gagal", async ({ page }, info) => {
  test.setTimeout(8 * 60_000);
  await loginBerhasil(page, AKUN.asesor2, URL_RPC_MATI);
  await bukaPenilaian(page, URL_RPC_MATI, "Dosen Dua");
  const mulai = Date.now();
  const [, t] = await nilaiDanSahkan(page);
  catat(info, "durasi_ms", Date.now() - mulai);
  catat(info, "toast", t);
  const d2 = await idPengguna("dosen2@polban.ac.id");
  const [s] = await q("select s.* from simpulan_bkd s join lkd l on l.id_lkd=s.id_lkd where l.id_pengguna=$1", [d2.id_pengguna]);
  const [r] = await q("select * from riwayat_transaksi where jenis_transaksi='mint' and reference_id=$1", [s?.hash_penilaian ?? "-"]);
  catat(info, "simpulan", s ? `${s.sks_pendidikan_x100} ${s.status_final}` : "tidak ada");
  catat(info, "riwayat mint", r ? `${r.status} ${r.tx_hash}` : "tidak ada");
  expect(s).toBeTruthy();
  expect(r?.status).toBe("failed");
});

test("IT-017 [Positif] koreksi token: saldo berkurang, event burn tercatat, riwayat tersimpan", async ({ page }, info) => {
  test.setTimeout(5 * 60_000);
  const d1 = await idPengguna(AKUN.dosen1.email);
  const saldoAwal = await saldoToken(d1.alamat_wallet);
  await loginBerhasil(page, AKUN.admin);
  await page.goto(`${URL_NORMAL}/admin/token`);
  await pilihLabel(page.locator('select[name="id_dosen"]'), /Dosen Satu/);
  await page.locator('input[name="jumlah_sks"]').fill("1.00");
  await page.locator('input[name="alasan"]').fill("koreksi IT-017");
  await page.getByRole("button", { name: "Burn Token" }).click();
  await expect(page.locator(".swal2-popup:not(.swal2-toast) .swal2-title")).toHaveText("Bakar token SKS?");
  await konfirmasi(page);
  const t = await toastApaSaja(page, T_CHAIN);
  catat(info, "toast", t);
  const saldoAkhir = await saldoToken(d1.alamat_wallet);
  const [r] = await q("select * from riwayat_transaksi where jenis_transaksi='burn' and alasan='koreksi IT-017'");
  const rc = await chain.getTransactionReceipt(r.tx_hash);
  const iface = new ethers.Interface(["event SKSBurned(address indexed operator, address indexed account, uint256 amount, string reason)"]);
  const ev = rc.logs.map((l) => { try { return iface.parseLog(l); } catch { return null; } }).find(Boolean);
  catat(info, "saldo", `${saldoAwal} -> ${saldoAkhir}`);
  catat(info, "event", `${ev?.name} ${ev?.args?.amount} ${ev?.args?.reason}`);
  expect(saldoAwal - saldoAkhir).toBe(10n ** 18n);
  expect(r.status).toBe("success");
  expect(ev?.args?.reason).toBe("koreksi IT-017");
});

test("IT-018 [Edge] log blockchain Base Sepolia: pembacaan berjenjang berhasil tanpa galat penyedia", async ({ page }, info) => {
  test.setTimeout(20 * 60_000);
  // 3103: konfigurasi produksi (gateway arsip, rentang penuh sekali tembak) sebagai pembanding.
  // 3104: RPC publik dengan window 50.000 blok (bawaan kode), rentang deploy->tip melebihi batas penyedia.
  const hasil = {};
  for (const [label, BASE] of [["pembanding", "http://127.0.0.1:3103"], ["berjenjang", "http://127.0.0.1:3104"]]) {
    await logout(page);
    await loginBerhasil(page, AKUN.admin, BASE);
    const mulai = Date.now();
    const r = await page.goto(`${BASE}/admin/log-blockchain`, { timeout: 15 * 60_000 });
    await page.waitForLoadState("networkidle");
    const durasi = Date.now() - mulai;
    const galat = ((await page.getByText(/Tidak dapat membaca on-chain/).first().textContent().catch(() => "")) || "").trim();
    const ringkas = ((await page.getByText(/Menampilkan \d+ dari \d+ event on-chain/).first().textContent().catch(() => "")) || "").trim();
    hasil[label] = { status: r.status(), durasi, galat, total: Number(ringkas.match(/dari (\d+)/)?.[1] ?? -1) };
    catat(info, `${label} durasi_ms`, durasi);
    catat(info, `${label} ringkasan`, ringkas || "(tidak ada)");
    if (galat) catat(info, `${label} galat`, galat);
    await jepret(page, info, `IT-018-log-${label}`);
  }
  expect(hasil.pembanding.galat).toBe("");
  expect(hasil.pembanding.total).toBeGreaterThan(0);
  expect(hasil.berjenjang.status).toBe(200);
  expect(hasil.berjenjang.galat).toBe("");
  expect(hasil.berjenjang.total).toBe(hasil.pembanding.total);
});
