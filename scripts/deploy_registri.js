// Deploy HANYA BKDDokumenRegistri, untuk jaringan yang kalkulator & token-nya
// sudah terpasang. Jalankan:
//   npx hardhat run scripts/deploy_registri.js --network baseSepolia
import { network } from "hardhat";

const { ethers } = await network.create();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with", deployer.address);

  const registri = await ethers.deployContract("BKDDokumenRegistri", [
    deployer.address,
    deployer.address,
  ]);
  await registri.waitForDeployment();
  const receipt = await registri.deploymentTransaction().wait();

  console.log("BKDDokumenRegistri:", await registri.getAddress());
  console.log("Deploy block:", receipt.blockNumber);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
