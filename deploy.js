import { network } from "hardhat";
import { mkdirSync, writeFileSync } from "node:fs";

const { ethers, networkName } = await network.create();

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log(`Network        : ${networkName}`);
  console.log(`Deployer       : ${deployer.address}`);
  console.log(`Deployer saldo : ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    throw new Error(
      `Saldo deployer 0 di jaringan ${networkName}. Isi dulu dari faucet sebelum deploy.`
    );
  }

  const assessment = await ethers.deployContract("KalkulatorBKDPendidikan");
  await assessment.waitForDeployment();

  const token = await ethers.deployContract("BKDSKSToken", [deployer.address, deployer.address]);
  await token.waitForDeployment();

  const kalkulatorAddress = await assessment.getAddress();
  const tokenAddress = await token.getAddress();

  console.log("KalkulatorBKDPendidikan:", kalkulatorAddress);
  console.log("BKDSKSToken:", tokenAddress);

  mkdirSync("deployments", { recursive: true });
  writeFileSync(
    `deployments/${networkName}.json`,
    JSON.stringify(
      {
        network: networkName,
        deployer: deployer.address,
        deployedAt: new Date().toISOString(),
        contracts: {
          KalkulatorBKDPendidikan: kalkulatorAddress,
          BKDSKSToken: tokenAddress
        }
      },
      null,
      2
    )
  );

  console.log(`\nDeployment tersimpan di deployments/${networkName}.json`);
  console.log("\nSalin ke .env:");
  console.log(`NEXT_PUBLIC_BKD_CONTRACT_ADDRESS=${kalkulatorAddress}`);
  console.log(`NEXT_PUBLIC_SKS_TOKEN_ADDRESS=${tokenAddress}`);

  if (networkName === "baseSepolia") {
    console.log("\nVerifikasi kontrak (opsional, butuh BASESCAN_API_KEY di .env):");
    console.log(`npx hardhat verify --network baseSepolia ${kalkulatorAddress}`);
    console.log(
      `npx hardhat verify --network baseSepolia ${tokenAddress} ${deployer.address} ${deployer.address}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
