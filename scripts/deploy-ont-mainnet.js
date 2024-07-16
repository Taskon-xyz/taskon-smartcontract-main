// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {


    let signers = await ethers.getSigners();
    console.log("signer:", signers[0].address);

    // const Manager = await ethers.getContractFactory("ManagerV3");
    // const managerImpl = await Manager.deploy();
    const managerImpl = await ethers.getContractAt("ManagerV3", "0xebbCf5718cC24A72B43B07d60102B21aeB42e11C");
    console.log("managerImpl:", managerImpl.address);
    // return;
    // const ManagerProxy = await ethers.getContractFactory("ManagerProxy");
    // const managerProxy = await ManagerProxy.deploy();
    const managerProxy = await ethers.getContractAt("ManagerProxy", "0x57e54d4147AFdA7F0b55498EAf44e713811c3519");
    console.log("managerProxy:", managerProxy.address);
    console.log("managerProxy admin:", await managerProxy.admin());
    // await managerProxy._setPendingImplementation(managerImpl.address);
    // await managerImpl._become(managerProxy.address);
    // return;

    const TaskOnNFT721V2 = await ethers.getContractFactory("TaskOnNFT721V2");
    const nft = await TaskOnNFT721V2.deploy("TaskOn CAP", "CAP", managerProxy.address);
    // const nft = await ethers.getContractAt("TaskOnNFT721V2", "0xc8bCf06DAE0dB7538FFbd17Ce793b249DDb24Ead");
    console.log("nft address:", nft.address);
    return;

    const managV3 = await ethers.getContractAt("ManagerV3", managerProxy.address);
    if (true) {
        await managV3.setNFTAddr(nft.address);
        return;
    }
    const managV2 = await ethers.getContractAt("ManagerV3", "0x362495Aec908F916E48642bcd28c0F8f25130251");
    let orangeSinger = await managV3.orangeSinger();
    let airdropAdmin = await managV3.airdropAdmin();
    let batchAirdropAdmin = await managV3.batchAirdropAdmin();

    console.log("orangeSinger:", orangeSinger, airdropAdmin, batchAirdropAdmin);
    // await managV3.setOrangeSigner("0x1aE43Df6F4C5621E2b156162e958c80A67Ee4F5f");
    // await managV3.setAirdropAdmin(airdropAdmin);
    // await managV3.setBatchAirdropAdmin(batchAirdropAdmin);
    // await manag.setNFTAddr(nft.address);
    return;

    console.log(
        `new manager impl is`, await managerProxy.managerImplementation()
    );

    const manager = await ethers.getContractAt("Manager", managerProxy.address);

    console.log("batchAirdropAdmin:", await manager.batchAirdropAdmin());
    return

    const TaskOnNFT721 = await ethers.getContractFactory("TaskOnNFT721");
    const taskOnNFT721 = await TaskOnNFT721.deploy("name", "SYMBOL", managerProxy.address);

    await manager.setNFTAddr(taskOnNFT721.address);
    await manager.setOrangeSigner("0x1ae43df6f4c5621e2b156162e958c80a67ee4f5f");
    await manager.setAirdropAdmin("0x1ae43df6f4c5621e2b156162e958c80a67ee4f5f");
    await manager.setBatchAirdropAdmin("0x4e359fdefb19417d467b9f539c2fad45fd4ef4a4");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
