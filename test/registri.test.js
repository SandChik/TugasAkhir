/**
 * Modul: Registri Dokumen (contracts/registri.sol, BKDDokumenRegistri).
 * Jumlah skenario: 6.
 * Rincian kategori: Positif 3, Negatif 2, Edge 1.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Registri Dokumen", function () {
  it("UT-REG-01 [Positif] constructor: Deploy dengan dua alamat valid memberikan DEFAULT_ADMIN_ROLE ke admin dan PENCATAT_ROLE ke initialPencatat.", async function () {
    const [admin, pencatat, lain] = await ethers.getSigners();
    const registri = await ethers.deployContract("BKDDokumenRegistri", [admin.address, pencatat.address]);

    const roleAdmin = await registri.DEFAULT_ADMIN_ROLE();
    const rolePencatat = await registri.PENCATAT_ROLE();

    // constructor memberi satu role ke masing-masing alamat
    assert.equal(await registri.hasRole(roleAdmin, admin.address), true);
    assert.equal(await registri.hasRole(rolePencatat, pencatat.address), true);

    // tidak ada role silang yang ikut diberikan
    assert.equal(await registri.hasRole(rolePencatat, admin.address), false);
    assert.equal(await registri.hasRole(roleAdmin, pencatat.address), false);
    assert.equal(await registri.hasRole(rolePencatat, lain.address), false);
  });

  it("UT-REG-02 [Positif] catat: Pencatat mencatat aksi unggah dan kontrak memancarkan event DokumenTercatat dengan argumen sesuai masukan.", async function () {
    const [admin, pencatat] = await ethers.getSigners();
    const registri = await ethers.deployContract("BKDDokumenRegistri", [admin.address, pencatat.address]);

    const hash = ethers.keccak256(ethers.toUtf8Bytes("sk-mengajar-2024.pdf"));
    const tx = await registri.connect(pencatat).catat(hash, "unggah", "unggahan:41");
    const receipt = await tx.wait();

    const event = receipt.logs
      .map((l) => registri.interface.parseLog(l))
      .find((e) => e?.name === "DokumenTercatat");

    // operator diisi msg.sender, bukan alamat admin
    assert.equal(event.args.operator, pencatat.address);
    assert.equal(event.args.hashDokumen, hash);
    assert.equal(event.args.aksi, "unggah");
    assert.equal(event.args.referensi, "unggahan:41");
  });

  it("UT-REG-03 [Positif] grantRole: Konstanta PENCATAT_ROLE cocok dengan keccak256 labelnya dan admin dapat menambah pencatat baru yang langsung bisa memanggil catat.", async function () {
    const [admin, pencatat, lain] = await ethers.getSigners();
    const registri = await ethers.deployContract("BKDDokumenRegistri", [admin.address, pencatat.address]);

    // konstanta role dihitung dari keccak256 label yang sama
    const rolePencatat = await registri.PENCATAT_ROLE();
    assert.equal(rolePencatat, ethers.keccak256(ethers.toUtf8Bytes("PENCATAT_ROLE")));

    // PENCATAT_ROLE dikelola DEFAULT_ADMIN_ROLE karena kontrak tidak memanggil _setRoleAdmin
    assert.equal(await registri.getRoleAdmin(rolePencatat), await registri.DEFAULT_ADMIN_ROLE());

    // admin sebagai DEFAULT_ADMIN_ROLE menambah pencatat baru
    await registri.connect(admin).grantRole(rolePencatat, lain.address);
    assert.equal(await registri.hasRole(rolePencatat, lain.address), true);

    const hash = ethers.keccak256(ethers.toUtf8Bytes("bukti-tautan-drive"));
    const tx = await registri.connect(lain).catat(hash, "terapkan", "bukti:7");
    const receipt = await tx.wait();

    const event = receipt.logs
      .map((l) => registri.interface.parseLog(l))
      .find((e) => e?.name === "DokumenTercatat");

    assert.equal(event.args.operator, lain.address);
    assert.equal(event.args.aksi, "terapkan");
    assert.equal(event.args.referensi, "bukti:7");
  });

  it("UT-REG-04 [Negatif] catat: Wallet tanpa PENCATAT_ROLE, termasuk admin, ditolak modifier onlyRole.", async function () {
    const [admin, pencatat, lain] = await ethers.getSigners();
    const registri = await ethers.deployContract("BKDDokumenRegistri", [admin.address, pencatat.address]);

    const hash = ethers.keccak256(ethers.toUtf8Bytes("dokumen-tanpa-izin"));

    // wallet luar tidak memegang PENCATAT_ROLE
    await assert.rejects(
      registri.connect(lain).catat(hash, "unggah", "unggahan:99"),
      /AccessControlUnauthorizedAccount/
    );

    // admin hanya pemegang DEFAULT_ADMIN_ROLE, bukan pencatat
    await assert.rejects(
      registri.connect(admin).catat(hash, "unggah", "unggahan:99"),
      /AccessControlUnauthorizedAccount/
    );
  });

  it("UT-REG-05 [Negatif] catat: Hash dokumen bernilai nol ditolak walau pemanggil memegang PENCATAT_ROLE.", async function () {
    const [admin, pencatat] = await ethers.getSigners();
    const registri = await ethers.deployContract("BKDDokumenRegistri", [admin.address, pencatat.address]);

    // role sudah benar, yang salah hanya hash-nya
    assert.equal(await registri.hasRole(await registri.PENCATAT_ROLE(), pencatat.address), true);

    await assert.rejects(
      registri.connect(pencatat).catat(ethers.ZeroHash, "hapus", "unggahan:41"),
      /InvalidHash/
    );
  });

  it("UT-REG-06 [Edge] catat: Hash yang sama dicatat berulang untuk aksi unggah, terapkan, dan hapus, ketiganya tetap diterima karena kontrak tidak menyimpan state.", async function () {
    const [admin, pencatat] = await ethers.getSigners();
    const registri = await ethers.deployContract("BKDDokumenRegistri", [admin.address, pencatat.address]);

    const hash = ethers.keccak256(ethers.toUtf8Bytes("berkas-siklus-penuh.pdf"));
    const urutanAksi = ["unggah", "terapkan", "hapus"];
    const tercatat = [];

    for (const aksi of urutanAksi) {
      const tx = await registri.connect(pencatat).catat(hash, aksi, "unggahan:41");
      const receipt = await tx.wait();
      const daftarEvent = receipt.logs
        .map((l) => registri.interface.parseLog(l))
        .filter((e) => e?.name === "DokumenTercatat");
      // satu transaksi memancarkan tepat satu event
      assert.equal(daftarEvent.length, 1);
      // hash yang sama boleh muncul lagi pada aksi berikutnya
      assert.equal(daftarEvent[0].args.hashDokumen, hash);
      tercatat.push(daftarEvent[0].args.aksi);
    }

    assert.deepEqual(tercatat, urutanAksi);
  });
});
