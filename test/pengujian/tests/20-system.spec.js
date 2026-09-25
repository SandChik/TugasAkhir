// System testing, Tabel IV.84. Periode baru "2026/2027 Ganjil" dibuat di ST-SYS-01.
// Setiap langkah disimpan tangkapan layarnya sebagai bukti.
import { test } from "@playwright/test";
import { ethers } from "ethers";
import {
  expect, q, AKUN, URL_NORMAL, PENUGASAN, loginBerhasil, logout, toastApaSaja, hapusToast, konfirmasi,
  jepret, idPengguna, saldoToken, chain, ALAMAT, T_PARSER, T_CHAIN,
} from "./bantu.js";
import {
  pilihLabel, isiParameter, kegiatanAdmin, unggahSk, terapkan, bukaLaporan, tarikSemua, simpanPermanen,
  setFaseUi, tugaskanMassal, bukaPenilaian, nilaiDanSahkan, unggahBukti, BUKTI,
} from "./bantu-app.js";

const PERIODE = "2026/2027 Ganjil";
const catat = (info, k, v) => info.annotations.push({ type: k, description: String(v) });
const ADE = AKUN.dosen;
const UJI = { email: "dosen.ujisistem@polban.ac.id", pw: "dosenuji123", beranda: /\/dosen/ };
const BAMBANG = { email: "bambang.wisnuadhi@polban.ac.id", pw: "dosen123", beranda: /\/dosen/ };
const IRWAN = { email: "irwan.setiawan@polban.ac.id", pw: "dosen123", beranda: /\/dosen/ };
const [ST_PENGAJARAN, ST_PKL, ST_PENGUJI, ST_TA_D3, ST_TA_D4, SK_PEMBINAAN] = PENUGASAN;

async function periodeUji() {
  const [p] = await q("select * from periode_bkd where nama_periode=$1", [PERIODE]);
  return p;
}
async function kegiatanDosen(email, kode, where = "") {
  return q(
    `select k.* from kegiatan k join lkd l on l.id_lkd=k.id_lkd join pengguna g on g.id_pengguna=l.id_pengguna
     join referensi_kegiatan r on r.id_referensi=k.id_referensi join periode_bkd p on p.id_periode=l.id_periode
     where g.email=$1 and r.kode_rule=$2 and p.nama_periode=$3 ${where} order by k.created_at`,
    [email, kode, PERIODE]
  );
}
async function lkdDosen(email) {
  const [l] = await q(
    `select l.* from lkd l join pengguna g on g.id_pengguna=l.id_pengguna join periode_bkd p on p.id_periode=l.id_periode
     where g.email=$1 and p.nama_periode=$2 and l.jenis='laporan'`, [email, PERIODE]);
  return l;
}
async function tambahAkun(page, { nama, email, peran, pw, nidn, nira }) {
  await page.goto(`${URL_NORMAL}/admin/pengguna`);
  const f = page.locator("form").filter({ has: page.getByRole("button", { name: "+ Tambah" }) });
  await f.locator('input[name="nama"]').fill(nama);
  await f.locator('input[name="email"]').fill(email);
  await f.locator('select[name="peran"]').selectOption(peran);
  await f.locator('input[name="password"]').fill(pw);
  if (nidn) await f.locator('input[name="nidn"]').fill(nidn);
  if (nira) await f.locator('input[name="nira"]').fill(nira);
  await f.getByRole("button", { name: "+ Tambah" }).click();
  return toastApaSaja(page);
}
/** Dosen: tambah kegiatan mandiri pada kategori yang boleh diisi dosen. */
async function tambahMandiri(page, slug, kode, judul, param) {
  await page.goto(`${URL_NORMAL}/dosen/${slug}/tambah?ref=${kode}`);
  await page.locator('input[name="judul"]').fill(judul);
  await isiParameter(page, param);
  for (const el of await page.locator('form input[name^="d_"][required]').all()) {
    if (!(await el.inputValue())) await el.fill("Uji sistem");
  }
  await page.getByRole("button", { name: /Simpan/ }).first().click();
  return toastApaSaja(page, T_CHAIN);
}
const PENANDA = 'span[title^="Nama/peran dosen tidak sesuai pada"]';
// penanda di daftar seksi selalu terlihat; ikon di kolom bukti hanya pada seksi yang sedang dibuka
const PENANDA_SEKSI = 'nav[aria-label="Daftar seksi"] span[title$="kegiatan dengan bukti tidak sesuai"]';

// ------------------------------------------------------------------------------------
test("ST-SYS-01 [Positif] penyiapan periode, akun, wallet, dan penugasan asesor", async ({ page }, info) => {
  await loginBerhasil(page, AKUN.admin);
  await page.goto(`${URL_NORMAL}/admin/periode`);
  await page.locator('input[name="tahun_ajaran"]').fill("2026/2027");
  await page.locator('select[name="semester"]').selectOption("Ganjil");
  const tgl = {
    tanggal_mulai: "2026-09-01", tanggal_selesai: "2027-01-31",
    pengisian_mulai: "2026-09-01", pengisian_selesai: "2026-10-31",
    pemeriksaan_mulai: "2026-11-01", pemeriksaan_selesai: "2026-11-15",
    penilaian_mulai: "2026-11-16", penilaian_selesai: "2027-01-31",
  };
  for (const [k, v] of Object.entries(tgl)) await page.locator(`input[name="${k}"]`).first().fill(v);
  await page.getByRole("button", { name: "+ Tambah Periode" }).click();
  catat(info, "buat periode", await toastApaSaja(page));
  const baris = page.getByRole("row").filter({ hasText: PERIODE }).first();
  await hapusToast(page);
  await baris.locator('button[title="Aktifkan periode"]').click();
  catat(info, "aktifkan", await toastApaSaja(page));
  await jepret(page, info, "ST01-1-periode");

  catat(info, "akun dosen", await tambahAkun(page, { nama: "Dosen Uji Sistem", email: UJI.email, peran: "dosen", pw: UJI.pw, nidn: "9900000002" }));
  catat(info, "akun asesor", await tambahAkun(page, { nama: "Asesor Uji Tiga", email: "asesor3@polban.ac.id", peran: "asesor", pw: "asesoruji123", nidn: "9900000003", nira: "000000000000000003" }));
  await jepret(page, info, "ST01-2-akun");

  // tetapkan wallet untuk akun baru (tabel berhalaman, jadi dicari per nama)
  for (const nama of ["Dosen Uji Sistem", "Asesor Uji Tiga"]) {
    await page.goto(`${URL_NORMAL}/admin/wallet`);
    await page.locator('input[aria-label="Cari nama, NIDN, atau address…"]').fill(nama);
    await page.getByRole("row").filter({ hasText: nama }).locator('button[title="Tetapkan wallet"]').click();
    catat(info, "wallet", await toastApaSaja(page));
  }
  await jepret(page, info, "ST01-3-wallet");
  await logout(page);

  // dokumen BKD dosen di periode baru
  for (const akun of [ADE, UJI]) {
    await loginBerhasil(page, akun);
    await bukaLaporan(page, URL_NORMAL);
    await logout(page);
  }
  await loginBerhasil(page, AKUN.admin);
  catat(info, "penugasan massal", await tugaskanMassal(page, URL_NORMAL));
  await jepret(page, info, "ST01-4-penugasan-asesor");

  const p = await periodeUji();
  const [{ aktif }] = await q("select count(*)::int aktif from periode_bkd where status='aktif'");
  const [{ tanpa, ganda }] = await q(
    `select count(*) filter (where alamat_wallet is null)::int tanpa,
            (count(alamat_wallet) - count(distinct alamat_wallet))::int ganda
     from pengguna where peran='dosen' and aktif`);
  const lkd = await q(
    `select l.id_lkd, count(pa.*)::int n, count(distinct pa.id_asesor)::int beda
     from lkd l left join penugasan_asesor pa on pa.id_lkd=l.id_lkd where l.id_periode=$1 and l.jenis='laporan' group by l.id_lkd`, [p.id_periode]);
  catat(info, "periode", `${p.status} override=${p.fase_override}`);
  catat(info, "dosen tanpa wallet / alamat ganda", `${tanpa} / ${ganda}`);
  catat(info, "LKD dan asesor", JSON.stringify(lkd.map((l) => `${l.n}/${l.beda}`)));
  expect(p.status).toBe("aktif");
  expect(aktif).toBe(1);
  expect(p.fase_override).toBeNull();
  await page.goto(`${URL_NORMAL}/admin/periode`);
  await expect(page.getByRole("row").filter({ hasText: PERIODE }).first()).toContainText("Masa Pengisian");
  expect(tanpa).toBe(0);
  expect(ganda).toBe(0);
  expect(lkd.length).toBeGreaterThan(0);
  for (const l of lkd) { expect(l.n).toBe(2); expect(l.beda).toBe(2); }
});

test("ST-SYS-02 [Positif] ekstraksi enam dokumen penugasan menjadi kegiatan portofolio", async ({ page }, info) => {
  test.setTimeout(45 * 60_000);
  const t0 = new Date();
  await loginBerhasil(page, AKUN.admin);
  for (const [jenis, berkas] of [
    ["st_pengajaran", [ST_PENGAJARAN]],
    ["st_bimbingan", [ST_PKL, ST_TA_D3, ST_TA_D4]],
    ["st_pengujian", [ST_PENGUJI]],
    ["sk_pembinaan", [SK_PEMBINAAN]],
  ]) {
    catat(info, `unggah ${jenis}`, await unggahSk(page, URL_NORMAL, jenis, berkas, 15 * 60_000));
  }
  const unggahan = await q("select * from unggahan_dokumen where created_at >= $1 order by created_at", [t0]);
  catat(info, "unggahan", unggahan.map((u) => `${u.nama_file}:${u.status}`).join(", "));
  expect(unggahan.length).toBe(6);
  for (const u of unggahan) expect(u.status).toBe("terparse");

  // tinjau pratinjau dan koreksi satu baris
  const uAjar = unggahan.find((u) => u.nama_file === "st_pengajaran.pdf");
  await page.goto(`${URL_NORMAL}/admin/unggah/${uAjar.id_unggahan}?f=masalah`);
  await jepret(page, info, "ST02-1-pratinjau-perlu-perhatian");
  let kartu = page.locator('div[id^="baris-"]').filter({ has: page.locator('a[title="Ubah baris"]') }).first();
  const adaMasalah = (await kartu.count()) > 0;
  if (!adaMasalah) {
    await page.goto(`${URL_NORMAL}/admin/unggah/${uAjar.id_unggahan}`);
    kartu = page.locator('div[id^="baris-"]').filter({ has: page.locator('a[title="Ubah baris"]') }).first();
  }
  await kartu.locator('a[title="Ubah baris"]').click();
  const panel = page.locator("form").filter({ has: page.locator('input[name="tanda"]') }).first();
  if (adaMasalah) {
    await panel.locator('input[name="lewati"]').check();
  } else {
    const j = panel.locator('input[name="judul"]');
    await j.fill(`${await j.inputValue()} (koreksi ST-02)`);
  }
  await panel.getByRole("button", { name: "Simpan koreksi" }).click();
  catat(info, `koreksi (${adaMasalah ? "lewati baris bermasalah" : "ubah judul"})`, await toastApaSaja(page));
  await jepret(page, info, "ST02-2-koreksi");

  for (const [i, u] of unggahan.entries()) {
    const bukti = i === 0 ? { info, nama: "ST02-3-dialog-terapkan" } : undefined;
    catat(info, `terapkan ${u.nama_file}`, await terapkan(page, URL_NORMAL, u.id_unggahan, bukti));
  }
  const jumlah1 = await q("select id_unggahan, count(*)::int n from kegiatan where id_unggahan = any($1::uuid[]) group by 1 order by 1", [unggahan.map((u) => u.id_unggahan)]);
  catat(info, "terapkan ulang st_pengajaran", await terapkan(page, URL_NORMAL, uAjar.id_unggahan));
  const jumlah2 = await q("select id_unggahan, count(*)::int n from kegiatan where id_unggahan = any($1::uuid[]) group by 1 order by 1", [unggahan.map((u) => u.id_unggahan)]);
  const [{ tanpaLampiran }] = await q(
    `select count(*)::int "tanpaLampiran" from kegiatan k where k.id_unggahan = any($1::uuid[])
     and not exists (select 1 from dokumen_kegiatan d where d.id_kegiatan=k.id_kegiatan and d.jenis_dokumen='SK Penugasan')`,
    [unggahan.map((u) => u.id_unggahan)]);
  const [{ salahLkd }] = await q(
    `select count(*)::int "salahLkd" from kegiatan k join lkd l on l.id_lkd=k.id_lkd join periode_bkd p on p.id_periode=l.id_periode
     where k.id_unggahan = any($1::uuid[]) and p.nama_periode <> $2`, [unggahan.map((u) => u.id_unggahan), PERIODE]);
  const total = jumlah2.reduce((a, b) => a + b.n, 0);
  catat(info, "kegiatan per unggahan", JSON.stringify(jumlah2.map((j) => j.n)));
  catat(info, "kegiatan tanpa lampiran surat / di luar periode", `${tanpaLampiran} / ${salahLkd}`);
  await page.goto(`${URL_NORMAL}/admin/unggah`);
  await jepret(page, info, "ST02-4-daftar-unggahan");
  expect(total).toBeGreaterThan(0);
  expect(jumlah2).toEqual(jumlah1);
  expect(tanpaLampiran).toBe(0);
  expect(salahLkd).toBe(0);
});

test("ST-SYS-03 [Positif] pengisian dan pengajuan dokumen BKD oleh dosen", async ({ page }, info) => {
  test.setTimeout(20 * 60_000);
  await loginBerhasil(page, ADE);
  await bukaLaporan(page, URL_NORMAL);
  catat(info, "tarik", await tarikSemua(page));
  await jepret(page, info, "ST03-1-tarik");

  const t = await tambahMandiri(page, "tugas-tambahan", "EDU701", "Ketua Jurusan (ST-03)", {
    jabatan: "WakilDirekturAkademik_SekretarisLembaga_KetuaJurusan_Departemen", jumlahSemester: 1,
  });
  catat(info, "kegiatan mandiri", t);
  expect(t).toContain("SKS terhitung: 3.00");

  const [pkl] = await kegiatanDosen(ADE.email, "EDU202");
  await page.goto(`${URL_NORMAL}/dosen/bimbingan-mahasiswa/${pkl.id_kegiatan}/bukti`);
  catat(info, "bukti", await unggahBukti(page, { nama: "Kartu Bimbingan PKL (ST-03)", berkas: BUKTI("kartu_bimbingan_pkl.pdf") }));
  await jepret(page, info, "ST03-2-bukti");

  const idLkd = await bukaLaporan(page, URL_NORMAL);
  await page.locator('button[title="Ubah status kegiatan"]').first().click();
  const dlg = page.locator("dialog[open]");
  await dlg.locator('select[name="capaian"]').selectOption("selesai");
  await dlg.getByRole("button", { name: "Simpan" }).click();
  catat(info, "capaian", await toastApaSaja(page));
  await page.waitForLoadState("networkidle");
  // dialog tidak menutup sendiri setelah Simpan; pengguna menekan Tutup
  const masihTerbuka = await page.locator("dialog[open]").count();
  catat(info, "dialog masih terbuka setelah Simpan", masihTerbuka);
  if (masihTerbuka) await page.locator("dialog[open]").getByRole("button", { name: "Tutup", exact: true }).filter({ hasText: "Tutup" }).click();
  catat(info, "permanen", await simpanPermanen(page, { info, nama: "ST03-3-dialog-simpan-permanen" }));
  await jepret(page, info, "ST03-4-terkunci");

  const [l] = await q("select * from lkd where id_lkd=$1", [idLkd]);
  const rinci = await q(
    `select k.status_perhitungan s, (r.fungsi_contract is not null) otomatis, count(*)::int n
     from kegiatan k join referensi_kegiatan r on r.id_referensi=k.id_referensi where k.id_lkd=$1 and k.diklaim group by 1,2`, [idLkd]);
  catat(info, "lkd", `${l.status} permanen=${l.simpan_permanen}`);
  catat(info, "kegiatan diklaim per status", JSON.stringify(rinci));
  expect(l.simpan_permanen).toBe(true);
  expect(l.status).toBe("diajukan");
  expect(rinci.filter((r) => r.otomatis && r.s !== "berhasil")).toEqual([]);
});

test("ST-SYS-04 [Positif] penilaian dua asesor hingga penerbitan token", async ({ page }, info) => {
  test.setTimeout(20 * 60_000);
  await loginBerhasil(page, AKUN.admin);
  catat(info, "fase", await setFaseUi(page, URL_NORMAL, PERIODE, "penilaian"));
  await logout(page);
  const ade = await idPengguna(ADE.email);
  const saldoAwal = await saldoToken(ade.alamat_wallet);

  for (const [akun, urut] of [[AKUN.asesor1, 1], [AKUN.asesor2, 2]]) {
    await loginBerhasil(page, akun);
    await bukaPenilaian(page, URL_NORMAL, "Ade Chandra", PERIODE);
    await jepret(page, info, `ST04-${urut}-halaman-penilaian`);
    const bukti = urut === 2 ? { info, nama: "ST04-dialog-sahkan" } : undefined;
    catat(info, `asesor ${urut}`, (await nilaiDanSahkan(page, bukti)).join(" | "));
    await jepret(page, info, `ST04-${urut}-sesudah-sahkan`);
    await logout(page);
  }
  const l = await lkdDosen(ADE.email);
  const [s] = await q("select * from simpulan_bkd where id_lkd=$1", [l.id_lkd]);
  const [r] = await q("select * from riwayat_transaksi where jenis_transaksi='mint' and reference_id=$1", [s?.hash_penilaian ?? "-"]);
  const saldoAkhir = await saldoToken(ade.alamat_wallet);
  catat(info, "simpulan", `${s?.sks_pendidikan_x100} ${s?.status_final}`);
  catat(info, "mint", `${r?.status} ${r?.tx_hash}`);
  catat(info, "saldo", `${saldoAwal} -> ${saldoAkhir}`);
  catat(info, "lkd", l.status);
  expect(["M", "TM"]).toContain(s.status_final);
  expect(r.status).toBe("success");
  expect(r.tx_hash).toMatch(/^0x[0-9a-f]{64}$/);
  expect(saldoAkhir - saldoAwal).toBe(BigInt(s.sks_pendidikan_x100) * 10n ** 16n);
  expect(l.status).toBe("final");

  // NFR-06: hitung ulang hash simpulan dari basis data, bandingkan dengan DB dan event on-chain
  const hasil = await q(
    `select h.id_kegiatan, h.sks_disetujui_x100, h.status from hasil_penilaian h join penugasan_asesor pa on pa.id_penugasan=h.id_penugasan where pa.id_lkd=$1`, [l.id_lkd]);
  const asesor = (await q("select id_asesor from penugasan_asesor where id_lkd=$1", [l.id_lkd])).map((x) => x.id_asesor).sort();
  const per = {};
  for (const h of hasil) if (h.status === "disetujui" && h.sks_disetujui_x100 != null) (per[h.id_kegiatan] ||= []).push(h.sks_disetujui_x100);
  let total = 0; const rincian = {};
  for (const [k, a] of Object.entries(per)) { const v = Math.round(a.reduce((x, y) => x + y, 0) / a.length); rincian[k] = v; total += v; }
  const payload = { id_lkd: l.id_lkd, total_sks_x100: total, rincian, disahkan_oleh: asesor };
  const kanonis = JSON.stringify(payload, Object.keys(payload).sort());
  const hashUlang = ethers.keccak256(ethers.toUtf8Bytes(kanonis));
  const rc = await chain.getTransactionReceipt(r.tx_hash);
  const iface = new ethers.Interface(["event SKSMinted(address indexed operator, address indexed recipient, uint256 amount, string referenceId)"]);
  const ev = rc.logs.map((x) => { try { return iface.parseLog(x); } catch { return null; } }).find(Boolean);
  catat(info, "NFR-06 hash ulang", hashUlang);
  catat(info, "NFR-06 hash DB", s.hash_penilaian);
  catat(info, "NFR-06 referenceId event", ev?.args?.referenceId);
  catat(info, "NFR-06 JSON kanonis", kanonis);
  catat(info, "NFR-06 total dari rincian = total simpulan", `${total} = ${s.sks_pendidikan_x100}`);
  expect(hashUlang).toBe(s.hash_penilaian);
  expect(ev.args.referenceId).toBe(s.hash_penilaian);
});

test("ST-SYS-05 [Positif] koreksi kredit dan penelusuran hasil", async ({ page }, info) => {
  test.setTimeout(10 * 60_000);
  const ade = await idPengguna(ADE.email);
  const saldoAwal = await saldoToken(ade.alamat_wallet);
  await loginBerhasil(page, AKUN.admin);
  await page.goto(`${URL_NORMAL}/admin/token`);
  await pilihLabel(page.locator('select[name="id_dosen"]'), /Ade Chandra/);
  await page.locator('input[name="jumlah_sks"]').fill("1.00");
  await page.locator('input[name="alasan"]').fill("koreksi ST-05");
  await page.getByRole("button", { name: "Burn Token" }).click();
  await page.locator(".swal2-popup:not(.swal2-toast)").waitFor();
  await jepret(page, info, "ST05-1-dialog-burn");
  await konfirmasi(page);
  catat(info, "burn", await toastApaSaja(page, T_CHAIN));
  const saldoAkhir = await saldoToken(ade.alamat_wallet);
  catat(info, "saldo", `${saldoAwal} -> ${saldoAkhir}`);
  expect(saldoAwal - saldoAkhir).toBe(10n ** 18n);

  await page.goto(`${URL_NORMAL}/admin/log-blockchain`);
  await page.waitForLoadState("networkidle");
  await jepret(page, info, "ST05-2-log-blockchain");
  await expect(page.getByRole("row").filter({ hasText: "koreksi ST-05" })).toHaveCount(1);

  await page.goto(`${URL_NORMAL}/admin/registri-dokumen`);
  await page.waitForLoadState("networkidle");
  await jepret(page, info, "ST05-3-registri-dokumen");
  const nRegistri = await page.getByRole("row").filter({ hasText: /st_pengajaran\.pdf/ }).count();
  catat(info, "baris registri st_pengajaran", nRegistri);
  expect(nRegistri).toBeGreaterThan(0);

  const l = await lkdDosen(ADE.email);
  const [s] = await q("select * from simpulan_bkd where id_lkd=$1", [l.id_lkd]);
  await page.goto(`${URL_NORMAL}/admin/rekapitulasi`);
  await page.locator('input[aria-label="Cari nama atau NIDN…"]').fill("Ade Chandra");
  const baris = page.getByRole("row").filter({ hasText: "Ade Chandra" }).first();
  await jepret(page, info, "ST05-4-rekapitulasi");
  const sksSah = (s.sks_pendidikan_x100 / 100).toFixed(2);
  const teks = (await baris.textContent()).replace(/\s+/g, " ");
  catat(info, "baris rekap", teks);
  catat(info, "simpulan", sksSah);
  expect(teks).toContain(sksSah);
});

test("ST-SYS-06 [Negatif] pembatasan akses lintas peran", async ({ page }, info) => {
  const kasus = [
    [ADE, "/asesor/asesor-bkd", /\/dosen/],
    [ADE, "/admin/pengguna", /\/dosen/],
    [AKUN.asesor1, "/admin/pengguna", /\/asesor/],
    [AKUN.admin, "/dosen/pengajaran", /\/admin/],
  ];
  for (const [akun, tujuan, harap] of kasus) {
    await loginBerhasil(page, akun);
    await page.goto(`${URL_NORMAL}${tujuan}`);
    await page.waitForLoadState("networkidle");
    const akhir = new URL(page.url()).pathname;
    catat(info, `${akun.email} -> ${tujuan}`, akhir);
    await jepret(page, info, `ST06-${akun.email.split("@")[0]}-${tujuan.split("/")[1]}`);
    expect.soft(akhir).toMatch(harap);
    await logout(page);
  }
});

test("ST-SYS-07 [Negatif] deteksi bukti yang bukan milik dosen bersangkutan", async ({ page }, info) => {
  test.setTimeout(40 * 60_000);
  // prasyarat: fase pengisian, dua dosen mengunggah bukti dan mengunci laporan
  await loginBerhasil(page, AKUN.admin);
  catat(info, "fase", await setFaseUi(page, URL_NORMAL, PERIODE, "pengisian"));
  catat(info, "kegiatan TA Irwan", await kegiatanAdmin(page, URL_NORMAL, {
    dosen: /Irwan Setiawan/, kode: "EDU203", judul: "Bimbingan TA KoTA205 (ST-08)",
    param: { peran: "PembimbingUtama", jenisTugasAkhir: "TugasAkhir", jumlahMahasiswa: 3 },
  }));
  await logout(page);

  await loginBerhasil(page, BAMBANG);
  await bukaLaporan(page, URL_NORMAL);
  catat(info, "Bambang tarik", await tarikSemua(page));
  const [pkl] = await kegiatanDosen(BAMBANG.email, "EDU202");
  await page.goto(`${URL_NORMAL}/dosen/bimbingan-mahasiswa/${pkl.id_kegiatan}/bukti`);
  catat(info, "Bambang unggah", await unggahBukti(page, { nama: "Pengesahan PKL (ST-07)", berkas: BUKTI("pengesahan_pkl_221524001.pdf") }));
  await jepret(page, info, "ST07-1-unggah-dosen");
  await bukaLaporan(page, URL_NORMAL);
  catat(info, "Bambang permanen", await simpanPermanen(page));
  await logout(page);

  await loginBerhasil(page, IRWAN);
  await bukaLaporan(page, URL_NORMAL);
  catat(info, "Irwan tarik", await tarikSemua(page));
  const [ta] = await kegiatanDosen(IRWAN.email, "EDU203", "and k.judul='Bimbingan TA KoTA205 (ST-08)'");
  await page.goto(`${URL_NORMAL}/dosen/bimbingan-mahasiswa/${ta.id_kegiatan}/bukti`);
  catat(info, "Irwan unggah", await unggahBukti(page, { nama: "Pengesahan TA KoTA205 (ST-08)", berkas: BUKTI("pengesahan_ta_kota205.pdf") }));
  await jepret(page, info, "ST08-1-unggah-dosen");
  await bukaLaporan(page, URL_NORMAL);
  catat(info, "Irwan permanen", await simpanPermanen(page));
  await logout(page);

  await loginBerhasil(page, AKUN.admin);
  catat(info, "penugasan", await tugaskanMassal(page, URL_NORMAL));
  catat(info, "fase", await setFaseUi(page, URL_NORMAL, PERIODE, "penilaian"));
  await logout(page);

  const [dok] = await q("select * from dokumen_kegiatan where id_kegiatan=$1 and nama_dokumen='Pengesahan PKL (ST-07)'", [pkl.id_kegiatan]);
  catat(info, "verifikasi", JSON.stringify({ s: dok.verifikasi?.status, nama: dok.verifikasi?.nama_terdeteksi }));
  expect(dok.verifikasi?.status).toBe("tidak_cocok");

  await loginBerhasil(page, AKUN.asesor1);
  const idPen = await bukaPenilaian(page, URL_NORMAL, "Bambang Wisnuadhi", PERIODE);
  await jepret(page, info, "ST07-2-penilaian-asesor");
  await expect(page.locator(PENANDA_SEKSI).first()).toBeVisible();
  await expect(page.getByText(/Verifikasi nama: \d+ kegiatan dengan bukti tidak sesuai/)).toBeVisible();
  await page.goto(`${URL_NORMAL}/asesor/penilaian/${idPen}/bukti/${pkl.id_kegiatan}`);
  await page.locator('button[title="Detail verifikasi"]').first().click();
  await jepret(page, info, "ST07-3-rincian-bukti");
  const panel = page.getByText("Nama pada dokumen").first();
  await expect(panel).toBeVisible();
  for (const nama of dok.verifikasi.nama_terdeteksi ?? []) {
    await expect(page.getByText(nama, { exact: false }).first()).toBeVisible();
  }
});

test("ST-SYS-08 [Negatif] deteksi peran yang tidak sesuai klaim", async ({ page }, info) => {
  const [ta] = await kegiatanDosen(IRWAN.email, "EDU203", "and k.judul='Bimbingan TA KoTA205 (ST-08)'");
  const [dok] = await q("select * from dokumen_kegiatan where id_kegiatan=$1 and nama_dokumen='Pengesahan TA KoTA205 (ST-08)'", [ta.id_kegiatan]);
  catat(info, "verifikasi", JSON.stringify({ s: dok?.verifikasi?.status, harap: dok?.verifikasi?.peran_diharapkan, baca: dok?.verifikasi?.peran_terdeteksi, orang: dok?.verifikasi?.orang_terdeteksi }));
  await loginBerhasil(page, AKUN.asesor1);
  await bukaPenilaian(page, URL_NORMAL, "Irwan Setiawan", PERIODE);
  await jepret(page, info, "ST08-2-penilaian-asesor");
  expect(dok?.verifikasi?.status).toBe("peran_tidak_sesuai");
  await expect(page.locator(PENANDA_SEKSI).first()).toBeVisible();
  await expect(page.getByText(/Verifikasi nama: \d+ kegiatan dengan bukti tidak sesuai/)).toBeVisible();
});

test("ST-SYS-09 [Positif] persetujuan manual asesor atas hasil pemeriksaan", async ({ page }, info) => {
  test.setTimeout(20 * 60_000);
  const [pkl] = await kegiatanDosen(BAMBANG.email, "EDU202");
  await loginBerhasil(page, AKUN.asesor1);
  const idPen = await bukaPenilaian(page, URL_NORMAL, "Bambang Wisnuadhi", PERIODE);
  const urlBukti = `${URL_NORMAL}/asesor/penilaian/${idPen}/bukti/${pkl.id_kegiatan}`;
  const baris = () => page.getByRole("row").filter({ hasText: "Pengesahan PKL (ST-07)" }).first();
  const bukaPanel = async () => {
    const t = page.locator('button[title="Detail verifikasi"]');
    if (await t.count()) await t.first().click();
  };

  await page.goto(urlBukti);
  await bukaPanel();
  await page.getByRole("button", { name: "Periksa ulang" }).first().click();
  catat(info, "periksa ulang", await toastApaSaja(page, T_PARSER));
  await page.goto(urlBukti);
  await bukaPanel();
  await jepret(page, info, "ST09-1-periksa-ulang");
  await page.getByRole("button", { name: "Accept Pemeriksaan" }).first().click();
  await expect(page.locator(".swal2-popup:not(.swal2-toast) .swal2-title")).toHaveText("Accept pemeriksaan dokumen ini?");
  await jepret(page, info, "ST09-2-dialog-acc");
  await konfirmasi(page);
  catat(info, "acc", await toastApaSaja(page));

  await page.goto(`${URL_NORMAL}/asesor/penilaian/${idPen}`);
  await page.waitForLoadState("networkidle");
  const setelahAcc = await page.locator(PENANDA).count();
  await jepret(page, info, "ST09-3-penanda-hilang");

  await page.goto(urlBukti);
  await bukaPanel();
  await page.getByRole("button", { name: "Batalkan ACC" }).first().click();
  catat(info, "batal acc", await toastApaSaja(page));
  await page.goto(`${URL_NORMAL}/asesor/penilaian/${idPen}`);
  await page.waitForLoadState("networkidle");
  const setelahBatal = await page.locator(PENANDA).count();
  await jepret(page, info, "ST09-4-penanda-kembali");

  const [dok] = await q("select verifikasi from dokumen_kegiatan where id_kegiatan=$1 and nama_dokumen='Pengesahan PKL (ST-07)'", [pkl.id_kegiatan]);
  catat(info, "penanda setelah ACC / setelah batal", `${setelahAcc} / ${setelahBatal}`);
  catat(info, "verifikasi akhir", JSON.stringify({ s: dok.verifikasi?.status, nama: dok.verifikasi?.nama_terdeteksi, acc: dok.verifikasi?.acc ?? null }));
  expect(setelahAcc).toBe(0);
  expect(setelahBatal).toBeGreaterThan(0);
  expect((dok.verifikasi?.nama_terdeteksi ?? []).length).toBeGreaterThan(0);
  expect(dok.verifikasi?.acc ?? null).toBeNull();
});

test("ST-SYS-10 [Negatif] pembatasan aksi di luar fase yang berlaku", async ({ page }, info) => {
  test.setTimeout(10 * 60_000);
  // prasyarat: dosen uji punya kegiatan mandiri dari fase pengisian
  await loginBerhasil(page, AKUN.admin);
  catat(info, "fase", await setFaseUi(page, URL_NORMAL, PERIODE, "pengisian"));
  await logout(page);
  await loginBerhasil(page, UJI);
  catat(info, "kegiatan mandiri", await tambahMandiri(page, "tugas-tambahan", "EDU701", "Sekretaris Jurusan (ST-10)", {
    jabatan: "BagianProgramStudi_KepalaLaboratorium_SekretarisJurusanDepartemen", jumlahSemester: 1,
  }));
  await logout(page);
  await loginBerhasil(page, AKUN.admin);
  catat(info, "fase", await setFaseUi(page, URL_NORMAL, PERIODE, "penilaian"));
  await logout(page);

  const pesan = {};
  // 1. dosen menyunting kegiatan pada fase penilaian
  const [k] = await kegiatanDosen(UJI.email, "EDU701");
  await loginBerhasil(page, UJI);
  await page.goto(`${URL_NORMAL}/dosen/tugas-tambahan/${k.id_kegiatan}/edit`);
  await page.locator('input[name="judul"]').fill("Sekretaris Jurusan (ST-10 diubah)");
  await page.getByRole("button", { name: /Simpan Perubahan/ }).click();
  pesan.sunting = await toastApaSaja(page);
  await jepret(page, info, "ST10-1-dosen-sunting");
  // 2. dosen mencoba mengunggah bukti pada fase penilaian
  await page.goto(`${URL_NORMAL}/dosen/tugas-tambahan/${k.id_kegiatan}/bukti`);
  await page.waitForLoadState("networkidle");
  const formAda = await page.locator("#unggah-bukti").count();
  pesan.unggah = ((await page.getByText(/Unggah bukti sedang tertutup/).first().textContent().catch(() => "")) || "").trim();
  if (!pesan.unggah) {
    await page.goto(`${URL_NORMAL}/dosen/pengajaran`);
    const a = page.locator('a[title="Lihat detail"]').first();
    if (await a.count()) { await a.click(); await page.waitForLoadState("networkidle"); }
    pesan.unggah = ((await page.getByText(/Unggah bukti sedang tertutup/).first().textContent().catch(() => "")) || "(tidak ada pesan)").trim();
  }
  catat(info, "form unggah bukti tampil", formAda);
  await jepret(page, info, "ST10-2-dosen-unggah");
  await logout(page);
  // 3. asesor mencoba menilai pada fase pengisian
  await loginBerhasil(page, AKUN.admin);
  catat(info, "fase", await setFaseUi(page, URL_NORMAL, PERIODE, "pengisian"));
  await logout(page);
  await loginBerhasil(page, AKUN.asesor1);
  await bukaPenilaian(page, URL_NORMAL, "Irwan Setiawan", PERIODE);
  pesan.nilai = ((await page.getByText(/Penilaian terkunci/).first().textContent().catch(() => "")) || "(tidak ada pesan)").trim();
  const tombolSimpan = await page.getByRole("button", { name: "Simpan Penilaian" }).count();
  catat(info, "tombol Simpan Penilaian tampil", tombolSimpan);
  await jepret(page, info, "ST10-3-asesor-nilai");

  const [kSesudah] = await q("select judul from kegiatan where id_kegiatan=$1", [k.id_kegiatan]);
  for (const [a, p] of Object.entries(pesan)) catat(info, `pesan ${a}`, p);
  catat(info, "judul kegiatan sesudah percobaan", kSesudah.judul);
  expect(kSesudah.judul).toBe("Sekretaris Jurusan (ST-10)");
  expect(tombolSimpan).toBe(0);
  // hasil diharapkan: pesan menyebut fase yang sedang berjalan
  expect.soft(pesan.sunting, "dosen sunting pada fase penilaian").toMatch(/penilaian/i);
  expect.soft(pesan.unggah, "dosen unggah pada fase penilaian").toMatch(/penilaian/i);
  expect.soft(pesan.nilai, "asesor menilai pada fase pengisian").toMatch(/pengisian/i);
});
