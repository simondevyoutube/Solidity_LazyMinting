require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");

const PRIVATE_KEY = null;

module.exports = {
  solidity: "0.8.14",
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: [PRIVATE_KEY]
    }
  },
};
