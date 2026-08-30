import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
import { configVariable, defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthers],
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    fuji: {
      type: "http",
      chainType: "l1",
      url: configVariable("PROVIDER_WSS"),
      accounts: [configVariable("PRIVATE_KEY")],
    },
  },
});
