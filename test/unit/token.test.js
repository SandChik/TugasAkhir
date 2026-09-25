/**
 * Modul: Token SKS (contracts/token.sol, BKDSKSToken)
 * Skenario mengikuti Tabel IV.79 laporan, satu it() per ID.
 * Jumlah skenario: 15
 * Rincian kategori: Positif 6, Negatif 7, Edge 2
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";

// jaringan simulasi bertipe rantai OP Stack, sama dengan Base Sepolia
const { ethers } = await network.create("hardhatOp");

async function siapkan(saldoAwal = 0) {
  const [admin, minter, dosen, lain] = await ethers.getSigners();
  const token = await ethers.deployContract("BKDSKSToken", [admin.address, minter.address]);
  if (saldoAwal > 0) {
    await token.connect(minter).mint(dosen.address, saldoAwal, "simpulan:awal");
  }
  return { token, admin, minter, dosen, lain };
}

function ambilEvent(kontrak, receipt, nama) {
  return receipt.logs
    .map((l) => kontrak.interface.parseLog(l))
    .find((e) => e?.name === nama);
}

describe("Token SKS", function () {
  it("UT-TOK-001 [Positif] name, symbol, decimals: identitas token sesuai rancangan", async function () {
    const { token } = await siapkan();
    assert.equal(await token.name(), "BKD SKS Token");
    assert.equal(await token.symbol(), "SKS");
    assert.equal(await token.decimals(), 18n);
  });

  it("UT-TOK-002 [Positif] mint: pemegang MINTER_ROLE menerbitkan 350 satuan", async function () {
    const { token, minter, dosen } = await siapkan();
    await token.connect(minter).mint(dosen.address, 350, "simpulan:1");
    assert.equal(await token.balanceOf(dosen.address), 350n);
    assert.equal(await token.totalSupply(), 350n);
  });

  it("UT-TOK-003 [Positif] mint: event SKSMinted memuat referensi berupa hash simpulan", async function () {
    const { token, minter, dosen } = await siapkan();
    const hashSimpulan = ethers.keccak256(ethers.toUtf8Bytes("simpulan_bkd:dosen-uji:2024-1"));
    const receipt = await (await token.connect(minter).mint(dosen.address, 900, hashSimpulan)).wait();
    const event = ambilEvent(token, receipt, "SKSMinted");
    assert.equal(event.args.operator, minter.address);
    assert.equal(event.args.recipient, dosen.address);
    assert.equal(event.args.amount, 900n);
    assert.equal(event.args.referenceId, hashSimpulan);
  });

  it("UT-TOK-004 [Positif] mint: penerbitan berulang mengakumulasi saldo 350 + 250", async function () {
    const { token, minter, dosen } = await siapkan(350);
    await token.connect(minter).mint(dosen.address, 250, "simpulan:2");
    assert.equal(await token.balanceOf(dosen.address), 600n);
  });

  it("UT-TOK-005 [Positif] burn: administrator menghapus 200 dari saldo 500", async function () {
    const { token, admin, dosen } = await siapkan(500);
    await token.connect(admin).burn(dosen.address, 200, "koreksi");
    assert.equal(await token.balanceOf(dosen.address), 300n);
  });

  it("UT-TOK-006 [Positif] burn: event SKSBurned memuat alasan koreksi nilai kegiatan", async function () {
    const { token, admin, dosen } = await siapkan(500);
    const alasan = "koreksi nilai kegiatan";
    const receipt = await (await token.connect(admin).burn(dosen.address, 200, alasan)).wait();
    const event = ambilEvent(token, receipt, "SKSBurned");
    assert.equal(event.args.operator, admin.address);
    assert.equal(event.args.account, dosen.address);
    assert.equal(event.args.amount, 200n);
    assert.equal(event.args.reason, alasan);
  });

  it("UT-TOK-007 [Negatif] mint: alamat tanpa MINTER_ROLE ditolak", async function () {
    const { token, dosen, lain } = await siapkan();
    await assert.rejects(
      token.connect(lain).mint(dosen.address, 100, "simpulan:x"),
      /AccessControlUnauthorizedAccount/
    );
    assert.equal(await token.totalSupply(), 0n);
  });

  it("UT-TOK-008 [Negatif] burn: pemegang MINTER_ROLE saja ditolak", async function () {
    const { token, minter, dosen } = await siapkan(500);
    await assert.rejects(
      token.connect(minter).burn(dosen.address, 200, "koreksi"),
      /AccessControlUnauthorizedAccount/
    );
    assert.equal(await token.balanceOf(dosen.address), 500n);
  });

  it("UT-TOK-009 [Negatif] mint: 100 satuan ke alamat nol ditolak", async function () {
    const { token, minter } = await siapkan();
    await assert.rejects(
      token.connect(minter).mint(ethers.ZeroAddress, 100, "simpulan:x"),
      /InvalidAddress/
    );
  });

  it("UT-TOK-010 [Negatif] mint: jumlah nol ditolak", async function () {
    const { token, minter, dosen } = await siapkan();
    await assert.rejects(
      token.connect(minter).mint(dosen.address, 0, "simpulan:x"),
      /Amount must be > 0/
    );
  });

  it("UT-TOK-011 [Negatif] burn: jumlah nol ditolak", async function () {
    const { token, admin, dosen } = await siapkan(500);
    await assert.rejects(
      token.connect(admin).burn(dosen.address, 0, "koreksi"),
      /Amount must be > 0/
    );
    assert.equal(await token.balanceOf(dosen.address), 500n);
  });

  it("UT-TOK-012 [Negatif] transfer: pemindahan langsung 100 satuan ditolak", async function () {
    const { token, dosen, lain } = await siapkan(500);
    await assert.rejects(token.connect(dosen).transfer(lain.address, 100), /TokenNonTransferable/);
    assert.equal(await token.balanceOf(dosen.address), 500n);
    assert.equal(await token.balanceOf(lain.address), 0n);
  });

  it("UT-TOK-013 [Negatif] transferFrom: pemindahan 100 satuan lewat persetujuan ditolak", async function () {
    const { token, dosen, lain } = await siapkan(500);
    await token.connect(dosen).approve(lain.address, 100);
    await assert.rejects(
      token.connect(lain).transferFrom(dosen.address, lain.address, 100),
      /TokenNonTransferable/
    );
    assert.equal(await token.balanceOf(dosen.address), 500n);
  });

  it("UT-TOK-014 [Edge] burn: menghapus 200 dari saldo 100 ditolak", async function () {
    const { token, admin, dosen } = await siapkan(100);
    await assert.rejects(
      token.connect(admin).burn(dosen.address, 200, "koreksi"),
      /ERC20InsufficientBalance/
    );
    assert.equal(await token.balanceOf(dosen.address), 100n);
  });

  it("UT-TOK-015 [Edge] burn: menghapus seluruh saldo 400", async function () {
    const { token, admin, dosen } = await siapkan(400);
    await token.connect(admin).burn(dosen.address, 400, "pembatalan pengesahan");
    assert.equal(await token.balanceOf(dosen.address), 0n);
    assert.equal(await token.totalSupply(), 0n);
  });
});
