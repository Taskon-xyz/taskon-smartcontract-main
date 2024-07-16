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

        const TaskOnNFT721 = await ethers.getContractFactory("TaskOnNFT721V2");
        const taskOnNFT721 = await TaskOnNFT721.deploy("name", "symbol", airdropAdmin.address);

        const Manager = await ethers.getContractFactory("ManagerV3");
        const managerImpl = await Manager.deploy();

        const ManagerProxy = await ethers.getContractFactory("ManagerProxy");
        let managerProxy = await ManagerProxy.deploy();
        await managerProxy._setPendingImplementation(managerImpl.address);
        await managerImpl._become(managerProxy.address);
        const managerProxy2 = await ethers.getContractAt("ManagerV3", managerProxy.address);
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

        it("check-mint", async function () {
            const {
                owner,
                airdropAdmin,
                orangeSigner,
                taskOnNFT721,
                managerProxy,
                managerProxy2,
                managerImpl
            } = await loadFixture(deployTaskOnFixture);
            //account, uint256 cid, string memory tokenURI, uint256 limit, bytes32 unsigned, bytes memory signature
            let account = orangeSigner.address;
            let cid = 1;
            let tokenURI = "tokenURI";
            // let limit = 100;
            let now = await time.latest() + 100;
            // console.log(ethers.utils);
            let network = await owner.provider.getNetwork();
            // let data = ethers.utils.solidityPack(["address","uint256","uint256","string"],[account, cid, limit, tokenURI])
            let unsigned = ethers.utils.solidityKeccak256(["address", "uint256", "uint256", "string", "uint256"], [account, cid, 2, tokenURI, network.chainId]);
            let unsigned2 = ethers.utils.hashMessage(ethers.utils.arrayify(unsigned));
            let signature = await orangeSigner.signMessage(ethers.utils.arrayify(unsigned));
            let tx = await managerProxy2.mint(account, cid, tokenURI, 2, unsigned2, signature);
            let r = await tx.wait(1);
            console.log("r gasUsed::", r.gasUsed)


            let unsigned222 = ethers.utils.solidityKeccak256(["address", "uint256", "uint256", "string", "uint256"], [account, cid, 2, tokenURI, network.chainId]);
            let signature222 = await orangeSigner.signMessage(ethers.utils.arrayify(unsigned222));
            let tx222 = await managerProxy2.mint(account, cid, tokenURI, 2, unsigned2, signature222);
            let r222 = await tx222.wait(1);
            console.log("r222 gasUsed:", r222.gasUsed);

            console.log(await taskOnNFT721.tokenURI(ethers.BigNumber.from("18446744073709551616")));
            console.log(await taskOnNFT721.tokenURI(ethers.BigNumber.from("18446744073709551617")));

            await taskOnNFT721.setUriSwitch(1, true);

            await taskOnNFT721.setBaseTokenURI(1, "hahahahahha");
            console.log(await taskOnNFT721.tokenURI(ethers.BigNumber.from("18446744073709551616")));
            console.log(await taskOnNFT721.tokenURI(ethers.BigNumber.from("18446744073709551617")));
            // await taskOnNFT721.setTokenURI(cid, "uriiiii");
            // console.log(await taskOnNFT721.tokenURI(ethers.BigNumber.from("18446744073709551617")));

        });

        it("check-batchmint-with-sig", async function () {
            const {
                owner,
                airdropAdmin,
                orangeSigner,
                taskOnNFT721,
                managerProxy,
                managerProxy2,
                managerImpl
            } = await loadFixture(deployTaskOnFixture);
            //account, uint256 cid, string memory tokenURI, uint256 limit, bytes32 unsigned, bytes memory signature
            let account = orangeSigner.address;
            let cid = 1;
            let tokenURI = "tokenURI";
            // let limit = 100;
            let now = await time.latest() + 100;
            let network = await owner.provider.getNetwork();
            let unsigned = ethers.utils.solidityKeccak256(["uint256", "uint256", "address[]","string", "uint256"], [cid, 2, [account], tokenURI, network.chainId]);
            let unsigned2 = ethers.utils.hashMessage(ethers.utils.arrayify(unsigned));
            let signature = await orangeSigner.signMessage(ethers.utils.arrayify(unsigned));
            await managerProxy2.addSigner(orangeSigner.address);
            let tx = await managerProxy2.batchAirdropWithSig({cid:cid, limit:2, tos:[account], tokenURI:tokenURI}, signature);
            let r = await tx.wait(1);
            console.log("r gasUsed::", r.gasUsed);
        });

        it("check-batchAirdrop", async function () {
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
            let id = ethers.BigNumber.from("18446744073709551616");
            console.log("id:", id);
            expect(await taskOnNFT721.ownerOf(id)).to.equal(owner.address);
            expect(await taskOnNFT721.ownerOf(id.add(1))).to.equal(airdropAdmin.address);
            expect(await taskOnNFT721.ownerOf(id.add(2))).to.equal(orangeSigner.address);
            expect(await taskOnNFT721.tokenURI(id)).to.equal(tokenURI);
            expect(await taskOnNFT721.tokenURI(id.add(1))).to.equal(tokenURI);
            expect(await taskOnNFT721.tokenURI(id.add(2))).to.equal(tokenURI);
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
            // expect(await taskOnNFT721.ownerOf(0)).to.equal(owner.address);
            // expect(await taskOnNFT721.ownerOf(1)).to.equal(airdropAdmin.address);
            // expect(await taskOnNFT721.ownerOf(2)).to.equal(orangeSigner.address);
            //
            // expect(await taskOnNFT721.tokenURI(0)).to.equal(tokenURIs[0]);
            // expect(await taskOnNFT721.tokenURI(1)).to.equal(tokenURIs[1]);
            // expect(await taskOnNFT721.tokenURI(2)).to.equal(tokenURIs[2]);
        });
    });
});
