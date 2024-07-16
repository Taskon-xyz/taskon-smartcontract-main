require("@nomicfoundation/hardhat-toolbox");

let {lvPinPrivateKey, mainnetPrivateKey, polygonPrivateKey} = require("./.secret2.json")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    networks: {
        ont_mainnet: {
            url: 'http://dappnode4.ont.io:20339',
            chainId: 58,
            gas: 2000000,
            gasPrice: 2500000000000,
            timeout: 10000000,
            accounts: [mainnetPrivateKey, lvPinPrivateKey],
        },
        bsc_mainnet: {
            url: 'https://bsc-dataseed.binance.org/',
            chainId: 56,
            gas: 2000000,
            timeout: 10000000,
            accounts: [mainnetPrivateKey, lvPinPrivateKey],
        },
        polygon_mainnet: {
            url: 'https://polygon-mainnet.g.alchemy.com/v2/NEhDP5SKnL6ZbIO37-B61hrMMPaaGK3y',
            chainId: 137,
            timeout: 10000000,
            gasPrice: 100000000000,
            accounts: [mainnetPrivateKey, lvPinPrivateKey],
        },
        eth_mainnet: {
            url: "https://eth-mainnet.g.alchemy.com/v2/9dOawif4UpGz4XQT6C6RUHCJbx8PHTYm",
            chainId: 1,
            timeout: 10000000,
            accounts: [mainnetPrivateKey, lvPinPrivateKey]
        },
        polygon_testnet: {
            url: 'https://rpc-mumbai.maticvigil.com/',
            chainId: 80001,
            timeout: 10000000,
            accounts: [polygonPrivateKey, lvPinPrivateKey, mainnetPrivateKey],
        },
        bsc_testnet: {
            url: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
            chainId: 97,
            gas: 2000000,
            timeout: 10000000,
            accounts: [lvPinPrivateKey, mainnetPrivateKey],
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
