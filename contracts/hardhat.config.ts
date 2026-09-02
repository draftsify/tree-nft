import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViem],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
        settings: { optimizer: { enabled: true, runs: 800 } },
      },
    },
  },
  networks: {
    robinhood: {
      type: "http",
      chainType: "l1",
      url: process.env.RPC_URL ?? "https://rpc.mainnet.chain.robinhood.com",
      chainId: 4663,
      accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : [],
    },
  },
};

export default config;
