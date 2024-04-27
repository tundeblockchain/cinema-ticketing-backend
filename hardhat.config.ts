import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();
import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
const PROVIDER_WSS = vars.get("PROVIDER_WSS");
const PRIVATEKEY = vars.get("PRIVATEKEY");

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24", // Note that this only has the version number
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    fuji: {
      url: process.env.PROVIDER_WSS,
      accounts: [process.env.PRIVATE_KEY as string],
    },
  },
};

export default config;
