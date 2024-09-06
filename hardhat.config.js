require("@nomicfoundation/hardhat-toolbox");

let  {lvPinPrivateKey} = require("./.secret.json")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    polygon_testnet: {
      url: 'https://rpc-mumbai.maticvigil.com/',
      chainId: 80001,
      timeout: 10000000,
      accounts: [lvPinPrivateKey],
    },
  },
  solidity: "0.8.9",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
