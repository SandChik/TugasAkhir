import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";

const { ethers } = await network.create();

const SKS = 100n;

describe("BKD education contracts", function () {
  it("calculates teaching and thesis guidance credits", async function () {
    const assessment = await ethers.deployContract("KalkulatorBKDPendidikan");

    assert.equal(await assessment.hitungPengajaran.staticCall(3, 16, 16, true, false, 100), 3n * SKS);
    assert.equal(await assessment.hitungPengajaran.staticCall(3, 16, 7, true, false, 100), 0n);
    assert.equal(await assessment.hitungPengajaran.staticCall(3, 16, 16, true, true, 50), 150n);
    assert.equal(await assessment.hitungPembimbinganTugasAkhir.staticCall(0, 0, 2), 266n);
    assert.equal(await assessment.hitungPengujiUjianAkhir.staticCall(1, 4), 100n);
  });

  it("mints and blocks transfer of non-transferable SKS token", async function () {
    const [owner, minter, lecturer, other] = await ethers.getSigners();
    const token = await ethers.deployContract("BKDSKSToken", [owner.address, minter.address]);

    await token.connect(minter).mint(lecturer.address, 350, "assessment-1");
    assert.equal(await token.balanceOf(lecturer.address), 350n);
    await assert.rejects(token.connect(lecturer).transfer(other.address, 100), /TokenNonTransferable/);
  });
});
