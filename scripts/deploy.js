// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

    let managerProxyAddress = "0x3159F0f56EedE7371Ff97f529C690aDcBad98A64";
    let nftAddress = "0xeB4Ef177861F045247e9CB1BCCC0f70295c737b1";

    let signers = await ethers.getSigners();
    console.log("signer:", signers[0].address);
    // const Manager = await ethers.getContractFactory("Manager");
    // const managerImpl = await Manager.deploy();
    const managerImpl = await ethers.getContractAt("Manager", "0x2c7d14C3E31d53f2F9fe21c830e64F83ACfe8cE8");
    console.log("managerImpl:", managerImpl.address);

    const managerProxy = await ethers.getContractAt("ManagerProxy", managerProxyAddress);
    // await managerProxy._setPendingImplementation(managerImpl.address);
    // await managerImpl._become(managerProxy.address);

    console.log(
        `new manager impl is`, await managerProxy.managerImplementation()
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
