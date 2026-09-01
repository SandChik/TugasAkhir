import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("BKDDokumenRegistri", function () {
  it("emits DokumenTercatat for pencatat and rejects others", async function () {
    const [owner, pencatat, luar] = await ethers.getSigners();
    const registri = await ethers.deployContract("BKDDokumenRegistri", [
      owner.address,
      pencatat.address,
    ]);

    const hash = ethers.keccak256(ethers.toUtf8Bytes("dokumen-uji"));
    const tx = await registri.connect(pencatat).catat(hash, "unggah", "unggahan:abc");
    const receipt = await tx.wait();
    const event = receipt.logs
      .map((l) => registri.interface.parseLog(l))
      .find((e) => e?.name === "DokumenTercatat");
    assert.equal(event.args.operator, pencatat.address);
    assert.equal(event.args.hashDokumen, hash);
    assert.equal(event.args.aksi, "unggah");
    assert.equal(event.args.referensi, "unggahan:abc");

    await assert.rejects(
      registri.connect(luar).catat(hash, "hapus", "bukti:xyz"),
      /AccessControlUnauthorizedAccount/
    );
    await assert.rejects(
      registri.connect(pencatat).catat(ethers.ZeroHash, "unggah", "unggahan:abc"),
      /InvalidHash/
    );
  });
});
