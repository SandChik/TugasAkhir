import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";

const { ethers } = await network.create();

const REF = "0x3f2a9c1d4e5b6a7c8d9e0f1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e";

describe("Token SKS BKD", function () {
  let token;
  let owner;
  let minter;
  let dosen;
  let lain;

  beforeEach(async function () {
    [owner, minter, dosen, lain] = await ethers.getSigners();
    token = await ethers.deployContract("BKDSKSToken", [owner.address, minter.address]);
  });

  it("UT-TOK-001 (Positif) identitas token sesuai rancangan", async function () {
    assert.equal(await token.name(), "BKD SKS Token");
    assert.equal(await token.symbol(), "SKS");
    assert.equal(await token.decimals(), 18n);
  });

  it("UT-TOK-002 (Positif) penerbitan oleh pemegang peran penerbit menambah saldo", async function () {
    await token.connect(minter).mint(dosen.address, 350, REF);
    assert.equal(await token.balanceOf(dosen.address), 350n);
    assert.equal(await token.totalSupply(), 350n);
  });

  it("UT-TOK-003 (Positif) penerbitan memancarkan SKSMinted beserta referensinya", async function () {
    const tx = await token.connect(minter).mint(dosen.address, 900, REF);
    const receipt = await tx.wait();
    const ev = receipt.logs
      .map((l) => token.interface.parseLog(l))
      .find((e) => e?.name === "SKSMinted");
    assert.equal(ev.args.operator, minter.address);
    assert.equal(ev.args.recipient, dosen.address);
    assert.equal(ev.args.amount, 900n);
    assert.equal(ev.args.referenceId, REF);
  });

  it("UT-TOK-004 (Positif) penerbitan berulang mengakumulasi saldo", async function () {
    await token.connect(minter).mint(dosen.address, 350, REF);
    await token.connect(minter).mint(dosen.address, 250, REF);
    assert.equal(await token.balanceOf(dosen.address), 600n);
  });

  it("UT-TOK-005 (Positif) penghapusan oleh administrator kontrak mengurangi saldo", async function () {
    await token.connect(minter).mint(dosen.address, 500, REF);
    await token.connect(owner).burn(dosen.address, 200, "koreksi nilai kegiatan");
    assert.equal(await token.balanceOf(dosen.address), 300n);
  });

  it("UT-TOK-006 (Positif) penghapusan memancarkan SKSBurned beserta alasannya", async function () {
    await token.connect(minter).mint(dosen.address, 500, REF);
    const tx = await token.connect(owner).burn(dosen.address, 200, "koreksi nilai kegiatan");
    const receipt = await tx.wait();
    const ev = receipt.logs
      .map((l) => token.interface.parseLog(l))
      .find((e) => e?.name === "SKSBurned");
    assert.equal(ev.args.operator, owner.address);
    assert.equal(ev.args.account, dosen.address);
    assert.equal(ev.args.amount, 200n);
    assert.equal(ev.args.reason, "koreksi nilai kegiatan");
  });

  it("UT-TOK-007 (Negatif) penerbitan oleh alamat tanpa peran penerbit ditolak", async function () {
    await assert.rejects(
      token.connect(lain).mint(dosen.address, 100, REF),
      /AccessControlUnauthorizedAccount/
    );
  });

  it("UT-TOK-008 (Negatif) penghapusan oleh alamat tanpa peran administrator ditolak", async function () {
    await token.connect(minter).mint(dosen.address, 500, REF);
    await assert.rejects(
      token.connect(minter).burn(dosen.address, 100, "percobaan"),
      /AccessControlUnauthorizedAccount/
    );
  });

  it("UT-TOK-009 (Negatif) penerbitan ke alamat nol ditolak", async function () {
    await assert.rejects(
      token.connect(minter).mint(ethers.ZeroAddress, 100, REF),
      /InvalidAddress/
    );
  });

  it("UT-TOK-010 (Negatif) penerbitan dengan jumlah nol ditolak", async function () {
    await assert.rejects(
      token.connect(minter).mint(dosen.address, 0, REF),
      /Amount must be > 0/
    );
  });

  it("UT-TOK-011 (Negatif) penghapusan dengan jumlah nol ditolak", async function () {
    await token.connect(minter).mint(dosen.address, 500, REF);
    await assert.rejects(
      token.connect(owner).burn(dosen.address, 0, "percobaan"),
      /Amount must be > 0/
    );
  });

  it("UT-TOK-012 (Negatif) pemindahan langsung antar-alamat ditolak", async function () {
    await token.connect(minter).mint(dosen.address, 500, REF);
    await assert.rejects(
      token.connect(dosen).transfer(lain.address, 100),
      /TokenNonTransferable/
    );
  });

  it("UT-TOK-013 (Negatif) pemindahan atas nama pihak lain setelah persetujuan ditolak", async function () {
    await token.connect(minter).mint(dosen.address, 500, REF);
    await token.connect(dosen).approve(lain.address, 500);
    await assert.rejects(
      token.connect(lain).transferFrom(dosen.address, lain.address, 100),
      /TokenNonTransferable/
    );
  });

  it("UT-TOK-014 (Edge) penghapusan melebihi saldo ditolak", async function () {
    await token.connect(minter).mint(dosen.address, 100, REF);
    await assert.rejects(
      token.connect(owner).burn(dosen.address, 200, "koreksi berlebih"),
      /ERC20InsufficientBalance/
    );
  });

  it("UT-TOK-015 (Edge) penghapusan seluruh saldo menyisakan saldo nol", async function () {
    await token.connect(minter).mint(dosen.address, 400, REF);
    await token.connect(owner).burn(dosen.address, 400, "pembatalan penilaian");
    assert.equal(await token.balanceOf(dosen.address), 0n);
    assert.equal(await token.totalSupply(), 0n);
  });
});
