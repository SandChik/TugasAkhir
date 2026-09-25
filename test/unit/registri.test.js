/**
 * Modul: Registri Dokumen (contracts/registri.sol, BKDDokumenRegistri)
 * Skenario mengikuti Tabel IV.80 laporan, satu it() per ID.
 * Jumlah skenario: 6
 * Rincian kategori: Positif 3, Negatif 2, Edge 1
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";

// jaringan simulasi bertipe rantai OP Stack, sama dengan Base Sepolia
const { ethers } = await network.create("hardhatOp");

async function siapkan() {
  const [admin, pencatat, lain] = await ethers.getSigners();
  const registri = await ethers.deployContract("BKDDokumenRegistri", [admin.address, pencatat.address]);
  return { registri, admin, pencatat, lain };
}

function daftarEvent(registri, receipt) {
  return receipt.logs
    .map((l) => registri.interface.parseLog(l))
    .filter((e) => e?.name === "DokumenTercatat");
}

const sidik = (isi) => ethers.keccak256(ethers.toUtf8Bytes(isi));

describe("Registri Dokumen", function () {
  it("UT-REG-001 [Positif] catat: pencatat mencatat aksi unggah dengan referensi baris unggahan", async function () {
    const { registri, pencatat } = await siapkan();
    const hash = sidik("sk-mengajar-2024.pdf");
    const receipt = await (await registri.connect(pencatat).catat(hash, "unggah", "unggahan:41")).wait();
    const [event] = daftarEvent(registri, receipt);
    assert.equal(event.args.operator, pencatat.address);
    assert.equal(event.args.hashDokumen, hash);
    assert.equal(event.args.aksi, "unggah");
    assert.equal(event.args.referensi, "unggahan:41");
  });

  it("UT-REG-002 [Positif] catat: aksi unggah, terapkan, dan hapus tercatat apa adanya", async function () {
    const { registri, pencatat } = await siapkan();
    const hash = sidik("berkas-siklus-penuh.pdf");
    const tercatat = [];
    for (const aksi of ["unggah", "terapkan", "hapus"]) {
      const receipt = await (await registri.connect(pencatat).catat(hash, aksi, "unggahan:41")).wait();
      tercatat.push(daftarEvent(registri, receipt)[0].args.aksi);
    }
    assert.deepEqual(tercatat, ["unggah", "terapkan", "hapus"]);
  });

  it("UT-REG-003 [Positif] catat: referensi dokumen bukti tercatat identik dengan masukan", async function () {
    const { registri, pencatat } = await siapkan();
    const receipt = await (await registri.connect(pencatat).catat(sidik("bukti-pengesahan.pdf"), "unggah", "bukti:7")).wait();
    assert.equal(daftarEvent(registri, receipt)[0].args.referensi, "bukti:7");
  });

  it("UT-REG-004 [Negatif] catat: alamat tanpa PENCATAT_ROLE ditolak", async function () {
    const { registri, lain } = await siapkan();
    await assert.rejects(
      registri.connect(lain).catat(sidik("dokumen-tanpa-izin"), "unggah", "unggahan:99"),
      /AccessControlUnauthorizedAccount/
    );
  });

  it("UT-REG-005 [Negatif] catat: sidik digital bernilai nol ditolak", async function () {
    const { registri, pencatat } = await siapkan();
    await assert.rejects(
      registri.connect(pencatat).catat(ethers.ZeroHash, "unggah", "unggahan:41"),
      /InvalidHash/
    );
  });

  it("UT-REG-006 [Edge] catat: sidik digital sama dicatat dua kali dengan aksi berbeda", async function () {
    const { registri, pencatat } = await siapkan();
    const hash = sidik("berkas-dicatat-ulang.pdf");
    const r1 = await (await registri.connect(pencatat).catat(hash, "unggah", "unggahan:41")).wait();
    const r2 = await (await registri.connect(pencatat).catat(hash, "terapkan", "unggahan:41")).wait();
    const e1 = daftarEvent(registri, r1);
    const e2 = daftarEvent(registri, r2);
    assert.equal(e1.length, 1);
    assert.equal(e2.length, 1);
    assert.notEqual(r1.hash, r2.hash);
    assert.equal(e1[0].args.hashDokumen, hash);
    assert.equal(e2[0].args.hashDokumen, hash);
  });
});
