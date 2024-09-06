const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const {anyValue} = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const {expect} = require("chai");

describe("TaskOnContract", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployTaskOnFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, airdropAdmin, orangeSigner] = await ethers.getSigners();

        const TaskOnNFT721 = await ethers.getContractFactory("TaskOnNFT721");
        const taskOnNFT721 = await TaskOnNFT721.deploy("name", "symbol", airdropAdmin.address);

        const Manager = await ethers.getContractFactory("Manager");
        const managerImpl = await Manager.deploy();

        const ManagerProxy = await ethers.getContractFactory("ManagerProxy");
        let managerProxy = await ManagerProxy.deploy();
        await managerProxy._setPendingImplementation(managerImpl.address);
        await managerImpl._become(managerProxy.address);
        const managerProxy2 = await ethers.getContractAt("Manager", managerProxy.address);
        await managerProxy2.initialize(orangeSigner.address, taskOnNFT721.address);
        await taskOnNFT721.setManager(managerProxy.address);
        await managerProxy2.setAirdropAdmin(airdropAdmin.address);
        return {owner, airdropAdmin, orangeSigner, taskOnNFT721, managerProxy, managerProxy2, managerImpl};
    }

    describe("Deployment", function () {
        it("check parameter", async function () {
            const {
                owner,
                airdropAdmin,
                orangeSigner,
                taskOnNFT721,
                managerProxy,
                managerProxy2,
                managerImpl
            } = await loadFixture(deployTaskOnFixture);
            expect(await managerProxy.admin()).to.equal(owner.address);
            expect(await managerProxy.managerImplementation()).to.equal(managerImpl.address);
            expect(await managerProxy2.closedForAirdrop()).to.equal(false);
            expect(await taskOnNFT721.owner()).to.equal(owner.address);
            expect(await taskOnNFT721.manager()).to.equal(managerProxy.address);
        });

        it("check batchAirdrop", async function () {
            const {
                owner,
                airdropAdmin,
                orangeSigner,
                taskOnNFT721,
                managerProxy,
                managerProxy2,
                managerImpl
            } = await loadFixture(deployTaskOnFixture);
            let tos = [owner.address, airdropAdmin.address, orangeSigner.address];
            let cid = 1;
            let limit = 3;
            let tokenURI = "tokenURI";
            await managerProxy2.connect(airdropAdmin).batchAirdrop(cid, limit, tos, tokenURI);
            expect(await taskOnNFT721.ownerOf(0)).to.equal(owner.address);
            expect(await taskOnNFT721.ownerOf(1)).to.equal(airdropAdmin.address);
            expect(await taskOnNFT721.ownerOf(2)).to.equal(orangeSigner.address);
            expect(await taskOnNFT721.tokenURI(0)).to.equal(tokenURI);
            expect(await taskOnNFT721.tokenURI(1)).to.equal(tokenURI);
            expect(await taskOnNFT721.tokenURI(2)).to.equal(tokenURI);
        });
        it("check batchAirdropWithDifURI", async function () {
            const {
                owner,
                airdropAdmin,
                orangeSigner,
                taskOnNFT721,
                managerProxy,
                managerProxy2,
                managerImpl
            } = await loadFixture(deployTaskOnFixture);
            let tos = [owner.address, airdropAdmin.address, orangeSigner.address];
            let tokenURIs = ["tokenURI1", "tokenURI2", "tokenURI3"];
            let cid = 2;
            let limit = 3;
            await managerProxy2.connect(airdropAdmin).batchAirdropWithDifURI(cid, limit, tos, tokenURIs);
            expect(await taskOnNFT721.ownerOf(0)).to.equal(owner.address);
            expect(await taskOnNFT721.ownerOf(1)).to.equal(airdropAdmin.address);
            expect(await taskOnNFT721.ownerOf(2)).to.equal(orangeSigner.address);

            expect(await taskOnNFT721.tokenURI(0)).to.equal(tokenURIs[0]);
            expect(await taskOnNFT721.tokenURI(1)).to.equal(tokenURIs[1]);
            expect(await taskOnNFT721.tokenURI(2)).to.equal(tokenURIs[2]);
        });
    });
});
