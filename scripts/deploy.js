import { network } from "hardhat";

const { ethers } = await network.create();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with", deployer.address);

  const assessment = await ethers.deployContract("KalkulatorBKDPendidikan");
  await assessment.waitForDeployment();

  const token = await ethers.deployContract("BKDSKSToken", [deployer.address, deployer.address]);
  await token.waitForDeployment();

  console.log("KalkulatorBKDPendidikan:", await assessment.getAddress());
  console.log("BKDSKSToken:", await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
