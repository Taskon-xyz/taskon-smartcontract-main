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
    let managerProxyPolygonStage = "0xb01C59369174A0026cDb548EB3bc5A08f37782ea";
    let managerProxyBscStage = "0x69c0308aE3737fAA51ddF04455dAF3C3c7Ef9D96";

    const manager = await ethers.getContractAt("ManagerProxy", managerProxyPolygonStage);
    console.log(await manager.admin())
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
