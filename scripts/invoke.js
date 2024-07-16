// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {


    let signers = await ethers.getSigners();
    console.log("signer:", signers[0].address, signers[1].address);

    // const Manager = await ethers.getContractFactory("ManagerV3");
    // const managerImpl = await Manager.deploy();
    let managerProxyBsc = "0x7cF3d2fE1bB390566C0f8b491eC04837aeB87536";
    let managerProxyPolygon = "0x57e54d4147AFdA7F0b55498EAf44e713811c3519";
    let manaerProxyEth = "0xA01E0F451D27e3F1468BD678105e5b7559728ae1";
    const manager = await ethers.getContractAt("ManagerProxy", manaerProxyEth);
    console.log(await manager.admin());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
