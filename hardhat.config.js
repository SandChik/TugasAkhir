import "dotenv/config";
import { defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    version: "0.8.28",
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    hardhatMainnet: { type: "edr-simulated", chainType: "l1" },
    hardhatOp: { type: "edr-simulated", chainType: "op" },
    localhost: { type: "http", url: process.env.RPC_URL || "http://127.0.0.1:8545" },
    baseSepolia: {
      type: "http",
      chainType: "op",
      chainId: 84532,
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.ADMIN_PRIVATE_KEY ? [process.env.ADMIN_PRIVATE_KEY] : []
    }
  },
  verify: {
    etherscan: {
      apiKey: process.env.BASESCAN_API_KEY || ""
    }
  }
});
