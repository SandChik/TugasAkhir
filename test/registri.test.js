import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("Registri Dokumen BKD", function () {
  let registri;
  let owner;
  let pencatat;
  let luar;
  let hash;

  beforeEach(async function () {
    [owner, pencatat, luar] = await ethers.getSigners();
    registri = await ethers.deployContract("BKDDokumenRegistri", [
      owner.address,
      pencatat.address,
    ]);
    hash = ethers.keccak256(ethers.toUtf8Bytes("dokumen-uji"));
  });

  const ambilEvent = (receipt) =>
    receipt.logs
      .map((l) => registri.interface.parseLog(l))
      .find((e) => e?.name === "DokumenTercatat");

  it("UT-REG-001 (Positif) pencatatan oleh pemegang peran pencatat memancarkan DokumenTercatat", async function () {
    const tx = await registri.connect(pencatat).catat(hash, "unggah", "unggahan:abc");
    const ev = ambilEvent(await tx.wait());
    assert.equal(ev.args.operator, pencatat.address);
    assert.equal(ev.args.hashDokumen, hash);
    assert.equal(ev.args.aksi, "unggah");
    assert.equal(ev.args.referensi, "unggahan:abc");
  });

  it("UT-REG-002 (Positif) ketiga jenis aksi tercatat apa adanya", async function () {
    for (const aksi of ["unggah", "terapkan", "hapus"]) {
      const tx = await registri.connect(pencatat).catat(hash, aksi, "unggahan:abc");
      const ev = ambilEvent(await tx.wait());
      assert.equal(ev.args.aksi, aksi);
    }
  });

  it("UT-REG-003 (Positif) referensi dokumen bukti tercatat apa adanya", async function () {
    const tx = await registri.connect(pencatat).catat(hash, "unggah", "bukti:xyz");
    const ev = ambilEvent(await tx.wait());
    assert.equal(ev.args.referensi, "bukti:xyz");
  });

  it("UT-REG-004 (Negatif) pencatatan oleh alamat tanpa peran pencatat ditolak", async function () {
    await assert.rejects(
      registri.connect(luar).catat(hash, "hapus", "bukti:xyz"),
      /AccessControlUnauthorizedAccount/
    );
  });

  it("UT-REG-005 (Negatif) pencatatan dengan sidik digital bernilai nol ditolak", async function () {
    await assert.rejects(
      registri.connect(pencatat).catat(ethers.ZeroHash, "unggah", "unggahan:abc"),
      /InvalidHash/
    );
  });

  it("UT-REG-006 (Edge) sidik digital yang sama dapat dicatat lebih dari satu kali", async function () {
    const a = await (await registri.connect(pencatat).catat(hash, "unggah", "unggahan:abc")).wait();
    const b = await (await registri.connect(pencatat).catat(hash, "hapus", "unggahan:abc")).wait();
    assert.equal(ambilEvent(a).args.aksi, "unggah");
    assert.equal(ambilEvent(b).args.aksi, "hapus");
  });
});
