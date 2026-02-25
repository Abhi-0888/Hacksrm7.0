require("@nomicfoundation/hardhat-toolbox");
require("@quai/hardhat-deploy-metadata");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    hardhat: {
      chainId: 15000,
    },
    // ─── Quai Network Testnet (Colosseum – Cyprus-1 zone) ───
    quaiTestnet: {
      url: process.env.QUAI_TESTNET_RPC || "https://rpc.quai.network/cyprus1",
      chainId: 9000,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },

    // ─── Quai Network Orchard (Devnet/Testnet – Cyprus-1 zone) ───
    quaiOrchard: {
      url: process.env.QUAI_ORCHARD_RPC || "https://orchard.rpc.quai.network/cyprus1",
      chainId: 15000,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },

    // ─── Local development ───
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 15000,
    },
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
