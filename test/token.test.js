/**
 * Unit test modul Token SKS (contracts/token.sol).
 * Jumlah skenario: 15 (Positif 6, Negatif 7, Edge 2).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Token SKS", function () {
  it("UT-TOK-01 [Positif] constructor: deploy dengan alamat admin dan minter valid memasang metadata token, decimals bawaan ERC20, dan kedua role awal", async function () {
    const [admin, minter, dosen, lain] = await ethers.getSigners();
    const token = await ethers.deployContract("BKDSKSToken", [admin.address, minter.address]);

    // constructor memasang metadata ERC20 dan dua role awal
    assert.equal(await token.name(), "BKD SKS Token");
    assert.equal(await token.symbol(), "SKS");
    assert.equal(await token.hasRole(await token.DEFAULT_ADMIN_ROLE(), admin.address), true);
    assert.equal(await token.hasRole(await token.MINTER_ROLE(), minter.address), true);
    // wallet lain tidak memegang role apa pun
    assert.equal(await token.hasRole(await token.MINTER_ROLE(), lain.address), false);
    assert.equal(await token.hasRole(await token.DEFAULT_ADMIN_ROLE(), dosen.address), false);
    assert.equal(await token.totalSupply(), 0n);
    // kontrak tidak override decimals(), jadi satuan token adalah 18 desimal ERC20
    assert.equal(await token.decimals(), 18n);
  });

  it("UT-TOK-02 [Positif] mint: wallet dengan MINTER_ROLE menerbitkan token SKS ke wallet dosen", async function () {
    const [admin, minter, dosen] = await ethers.getSigners();
    const token = await ethers.deployContract("BKDSKSToken", [admin.address, minter.address]);

    // amount adalah satuan mentah ERC20, konversi skala x100 dilakukan di lib/blockchain.ts
    await token.connect(minter).mint(dosen.address, 1250, "hasil:2024-1");
    assert.equal(await token.balanceOf(dosen.address), 1250n);
    assert.equal(await token.totalSupply(), 1250n);
  });

  it("UT-TOK-03 [Positif] mint: penerbitan token memancarkan event SKSMinted dengan operator, recipient, amount, dan referenceId yang benar", async function () {
    const [admin, minter, dosen] = await ethers.getSigners();
    const token = await ethers.deployContract("BKDSKSToken", [admin.address, minter.address]);

    const tx = await token.connect(minter).mint(dosen.address, 1250, "hasil:2024-1");
    const receipt = await tx.wait();
    const event = receipt.logs
      .map((l) => token.interface.parseLog(l))
      .find((e) => e?.name === "SKSMinted");
    assert.equal(event.args.operator, minter.address);
    assert.equal(event.args.recipient, dosen.address);
    assert.equal(event.args.amount, 1250n);
    assert.equal(event.args.referenceId, "hasil:2024-1");
  });

  it("UT-TOK-04 [Positif] burn: wallet dengan DEFAULT_ADMIN_ROLE membakar sebagian saldo token dosen untuk koreksi nilai", async function () {
    const [admin, minter, dosen] = await ethers.getSigners();
    const token = await ethers.deployContract("BKDSKSToken", [admin.address, minter.address]);

    await token.connect(minter).mint(dosen.address, 1250, "hasil:2024-1");
    // 1250 - 250 = 1000
    await token.connect(admin).burn(dosen.address, 250, "koreksi nilai");
    assert.equal(await token.balanceOf(dosen.address), 1000n);
    assert.equal(await token.totalSupply(), 1000n);
  });

  it("UT-TOK-05 [Positif] burn: pembakaran token memancarkan event SKSBurned dengan operator, account, amount, dan reason yang benar", async function () {
    const [admin, minter, dosen] = await ethers.getSigners();
    const token = await ethers.deployContract("BKDSKSToken", [admin.address, minter.address]);

    await token.connect(minter).mint(dosen.address, 1250, "hasil:2024-1");
    const tx = await token.connect(admin).burn(dosen.address, 250, "koreksi nilai");
    const receipt = await tx.wait();
    const event = receipt.logs
      .map((l) => token.interface.parseLog(l))
      .find((e) => e?.name === "SKSBurned");
    assert.equal(event.args.operator, admin.address);
    assert.equal(event.args.account, dosen.address);
    assert.equal(event.args.amount, 250n);
    assert.equal(event.args.reason, "koreksi nilai");
  });

  it("UT-TOK-06 [Positif] grantRole: admin memberikan MINTER_ROLE ke wallet lain dan wallet itu langsung dapat mint", async function () {
    const [admin, minter, dosen, lain] = await ethers.getSigners();
    const token = await ethers.deployContract("BKDSKSToken", [admin.address, minter.address]);

    const peranMinter = await token.MINTER_ROLE();
    assert.equal(await token.hasRole(peranMinter, lain.address), false);
    await token.connect(admin).grantRole(peranMinter, lain.address);
    assert.equal(await token.hasRole(peranMinter, lain.address), true);

    // wallet baru sekarang berwenang mint
    await token.connect(lain).mint(dosen.address, 400, "hasil:2024-2");
    assert.equal(await token.balanceOf(dosen.address), 400n);
  });

  it("UT-TOK-07 [Negatif] mint: pemanggil tanpa MINTER_ROLE ditolak, termasuk admin yang hanya memegang DEFAULT_ADMIN_ROLE", async function () {
    const [admin, minter, dosen, lain] = await ethers.getSigners();
    const token = await ethers.deployContract("BKDSKSToken", [admin.address, minter.address]);

    await assert.rejects(
      token.connect(lain).mint(dosen.address, 1250, "hasil:2024-1"),
      /AccessControlUnauthorizedAccount/
    );
    // admin pun tidak boleh mint karena hanya memegang DEFAULT_ADMIN_ROLE
    await assert.rejects(
      token.connect(admin).mint(dosen.address, 1250, "hasil:2024-1"),
      /AccessControlUnauthorizedAccount/
    );
    assert.equal(await token.totalSupply(), 0n);
  });

  it("UT-TOK-08 [Negatif] mint: penerbitan token ke alamat nol ditolak sebelum saldo bertambah", async function () {
    const [admin, minter] = await ethers.getSigners();
    const token = await ethers.deployContract("BKDSKSToken", [admin.address, minter.address]);

    await assert.rejects(
      token.connect(minter).mint(ethers.ZeroAddress, 1250, "hasil:2024-1"),
      /InvalidAddress/
    );
    assert.equal(await token.totalSupply(), 0n);
  });

  it("UT-TOK-09 [Negatif] mint: penerbitan token dengan jumlah nol ditolak require amount > 0", async function () {
    const [admin, minter, dosen] = await ethers.getSigners();
    const token = await ethers.deployContract("BKDSKSToken", [admin.address, minter.address]);

    await assert.rejects(
      token.connect(minter).mint(dosen.address, 0, "hasil:2024-1"),
      /Amount must be > 0/
    );
    assert.equal(await token.balanceOf(dosen.address), 0n);
  });

  it("UT-TOK-10 [Negatif] burn: pembakaran ditolak untuk pemanggil tanpa DEFAULT_ADMIN_ROLE, alamat akun nol, dan jumlah nol", async function () {
    const [admin, minter, dosen] = await ethers.getSigners();
    const token = await ethers.deployContract("BKDSKSToken", [admin.address, minter.address]);

    await token.connect(minter).mint(dosen.address, 1250, "hasil:2024-1");
    // minter tidak memegang DEFAULT_ADMIN_ROLE
    await assert.rejects(
      token.connect(minter).burn(dosen.address, 250, "koreksi nilai"),
      /AccessControlUnauthorizedAccount/
    );
    // pemilik saldo juga tidak boleh membakar tokennya sendiri
    await assert.rejects(
      token.connect(dosen).burn(dosen.address, 250, "koreksi nilai"),
      /AccessControlUnauthorizedAccount/
    );
    // admin berwenang, tetapi alamat nol dan jumlah nol tetap ditolak
    await assert.rejects(
      token.connect(admin).burn(ethers.ZeroAddress, 250, "koreksi nilai"),
      /InvalidAddress/
    );
    await assert.rejects(
      token.connect(admin).burn(dosen.address, 0, "koreksi nilai"),
      /Amount must be > 0/
    );
    assert.equal(await token.balanceOf(dosen.address), 1250n);
  });

  it("UT-TOK-11 [Negatif] _update: transfer token antar wallet ditolak karena token bersifat non-transferable", async function () {
    const [admin, minter, dosen, lain] = await ethers.getSigners();
    const token = await ethers.deployContract("BKDSKSToken", [admin.address, minter.address]);

    await token.connect(minter).mint(dosen.address, 1250, "hasil:2024-1");
    await assert.rejects(
      token.connect(dosen).transfer(lain.address, 100),
      /TokenNonTransferable/
    );
    // saldo kedua wallet tidak berubah
    assert.equal(await token.balanceOf(dosen.address), 1250n);
    assert.equal(await token.balanceOf(lain.address), 0n);
  });

  it("UT-TOK-12 [Negatif] _update: transferFrom setelah approve tetap ditolak walaupun allowance sudah terpasang", async function () {
    const [admin, minter, dosen, lain] = await ethers.getSigners();
    const token = await ethers.deployContract("BKDSKSToken", [admin.address, minter.address]);

    await token.connect(minter).mint(dosen.address, 1250, "hasil:2024-1");
    // approve berhasil karena tidak memindahkan saldo
    await token.connect(dosen).approve(lain.address, 500);
    assert.equal(await token.allowance(dosen.address, lain.address), 500n);

    await assert.rejects(
      token.connect(lain).transferFrom(dosen.address, lain.address, 500),
      /TokenNonTransferable/
    );
    assert.equal(await token.balanceOf(dosen.address), 1250n);
    // revert membatalkan seluruh transaksi, allowance tidak ikut terpakai
    assert.equal(await token.allowance(dosen.address, lain.address), 500n);
  });

  it("UT-TOK-13 [Negatif] constructor: deploy dengan alamat admin nol atau alamat minter nol ditolak", async function () {
    const [admin, minter] = await ethers.getSigners();

    await assert.rejects(
      ethers.deployContract("BKDSKSToken", [ethers.ZeroAddress, minter.address]),
      /InvalidAddress/
    );
    await assert.rejects(
      ethers.deployContract("BKDSKSToken", [admin.address, ethers.ZeroAddress]),
      /InvalidAddress/
    );
  });

  it("UT-TOK-14 [Edge] burn: pembakaran seluruh saldo menyisakan nol dan pembakaran berikutnya ditolak", async function () {
    const [admin, minter, dosen] = await ethers.getSigners();
    const token = await ethers.deployContract("BKDSKSToken", [admin.address, minter.address]);

    await token.connect(minter).mint(dosen.address, 1250, "hasil:2024-1");
    // 1250 - 1250 = 0
    await token.connect(admin).burn(dosen.address, 1250, "pembatalan pengesahan");
    assert.equal(await token.balanceOf(dosen.address), 0n);
    assert.equal(await token.totalSupply(), 0n);

    // burn kedua di saldo nol ditolak ERC20InsufficientBalance
    await assert.rejects(
      token.connect(admin).burn(dosen.address, 1, "pembatalan pengesahan"),
      /ERC20InsufficientBalance/
    );
  });

  it("UT-TOK-15 [Edge] mint: mint berulang ke penerima yang sama terakumulasi, termasuk nilai minimum satu satuan", async function () {
    const [admin, minter, dosen] = await ethers.getSigners();
    const token = await ethers.deployContract("BKDSKSToken", [admin.address, minter.address]);

    // 300 + 250 = 550
    await token.connect(minter).mint(dosen.address, 300, "hasil:2024-1");
    await token.connect(minter).mint(dosen.address, 250, "hasil:2024-2");
    assert.equal(await token.balanceOf(dosen.address), 550n);
    assert.equal(await token.totalSupply(), 550n);

    // nilai minimum 1 satuan mentah tetap diterima
    await token.connect(minter).mint(dosen.address, 1, "hasil:2024-3");
    assert.equal(await token.balanceOf(dosen.address), 551n);
    assert.equal(await token.totalSupply(), 551n);
  });
});
