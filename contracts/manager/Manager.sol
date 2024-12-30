pragma solidity ^0.8.1;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "../interfaces/ITaskOnNFT721.sol";
import "./ManagerStorage.sol";
import "./ManagerProxy.sol";


contract ManagerV3 is ManagerStorageV2 {
    using ECDSA for bytes32;

    modifier onlyOwner() {
        require(msg.sender == admin, "must be owner");
        _;
    }

    modifier onlySigner() {
        require(msg.sender == orangeSinger, "must be signer address");
        _;
    }

    modifier onlyAirdropAdmin() {
        require(msg.sender == airdropAdmin, "must be airdropAdmin address");
        _;
    }

    modifier onlyBatchAirdropAdmin() {
        require(msg.sender == batchAirdropAdmin, "must be batchAirdropAdmin address");
        _;
    }

    modifier onlyCanAirdrop() {
        require(closedForAirdrop == false, "airdrop status is closed");
        _;
    }

    function initialize(address _orangeSigner, address taskOnNFT) external onlyOwner {
        orangeSinger = _orangeSigner;
        nftAddr = taskOnNFT;
    }

    function setNFTAddr(address taskOnNft) external onlyOwner {
        nftAddr = taskOnNft;
    }

    function setOrangeSigner(address _orangeSigner) external onlyOwner {
        orangeSinger = _orangeSigner;
    }

    function setAirdropAdmin(address newAirdropAdmin) external onlyOwner {
        airdropAdmin = newAirdropAdmin;
    }

    function setBatchAirdropAdmin(address newBatchAirdropAdmin) external onlyOwner {
        batchAirdropAdmin = newBatchAirdropAdmin;
    }

    function _become(ManagerProxy managerProxy) public {
        require(msg.sender == managerProxy.admin(), "only proxy admin can change brains");
        managerProxy._acceptImplementation();
    }

    //true 表示关闭空投功能, false 表示打开空投功能
    function setAirdropStatus(bool status) external onlyOwner {
        closedForAirdrop = status;
    }

    function addSigner(address newSigner) external onlyOwner {
        isSigner[newSigner] = true;
    }

    function removeSigner(address newSigner) external onlyOwner {
        delete isSigner[newSigner];
    }

    //batch airdrop with the same tokenURI
    function batchAirdrop(uint256 cid, uint256 limit, address[] calldata tos, string calldata tokenURI) public onlyAirdropAdmin onlyCanAirdrop {
        batchAirdropInner(cid, limit, tos, tokenURI);
    }

    function batchAirdropInner(uint256 cid, uint256 limit, address[] calldata tos, string calldata tokenURI) internal {
        for (uint i = 0; i < tos.length; i++) {
            mintInner(cid, limit, tos[i], tokenURI);
        }
    }

    struct BatchAirdropV2Param {
        uint256 cid;
        uint256 limit;
        address[] tos;
        string tokenURI;
    }

    function batchAirdropV2(BatchAirdropV2Param[] calldata params) public onlyBatchAirdropAdmin onlyCanAirdrop {
        for (uint i = 0; i < params.length; i++) {
            batchAirdropInner(params[i].cid, params[i].limit, params[i].tos, params[i].tokenURI);
        }
    }

    function batchAirdropWithSig(BatchAirdropV2Param calldata param, bytes calldata signature) public onlyCanAirdrop {
        bytes32 hash = hashBatchAirdropV2Param(param);
        address signer = hash.recover(signature);
        require(isSigner[signer], "verify signer failed");
        batchAirdropInner(param.cid, param.limit, param.tos, param.tokenURI);
    }

    function hashBatchAirdropV2Param(BatchAirdropV2Param calldata params) internal view returns (bytes32) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                signMessage,
                keccak256(abi.encodePacked(params.cid, params.limit, params.tos, params.tokenURI, block.chainid))
            )
        );
        return hash;
    }

    //batch airdrop with the different tokenURI
    function batchAirdropWithDifURI(uint256 cid, uint256 limit, address[] calldata tos, string[] calldata tokenURIs) public onlyAirdropAdmin onlyCanAirdrop {
        for (uint i = 0; i < tos.length; i++) {
            mintInner(cid, limit, tos[i], tokenURIs[i]);
        }
    }

    function mintInner(uint256 cid, uint256 limit, address to, string calldata tokenURI) internal returns (uint256){
        bytes32 key = genParticipateKey(to, cid);
        uint256 count = participated[key];
        // not exceed limit
        require(count + 1 <= limit, "participated exceed limit");
        participated[key]++;
        return ITaskOnNFT721(nftAddr).mint(to, cid, tokenURI);
    }

    function mint(address account, uint256 cid, string calldata tokenURI, uint256 limit, bytes32 unsigned, bytes calldata signature) public returns (uint256) {
        // check orangeSinger's signature
        bytes32 hash = hashTransaction(account, cid, limit, tokenURI);
        require(hash == unsigned, "hash not equal");
        require(verify(hash, signature), "verify orange signer failed");
        return mintInner(cid, limit, account, tokenURI);
    }

    function setParticipateLimit(uint256 cid, uint256 limit) external onlySigner {
        Campaign storage campaign = campaigns[cid];
        require(campaign.isUsed, "campaign is not initialized");
        campaign.limitPerUser = limit;
    }

    function setTokenURI(address account, uint256 cid, string memory uri, bytes32 unsigned, bytes memory signature) public {
        bytes32 hash = hashUri(account, cid, uri);
        require(hash == unsigned, "hash not equal");
        require(verify(hash, signature), "verify orange signer failed");
        ITaskOnNFT721(nftAddr).setTokenURI(cid, uri);
    }

    function genParticipateKey(address account, uint256 cid) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(account, cid));
    }

    function hashUri(address account, uint256 tokenId, string memory tokenURI) internal view returns (bytes32){
        bytes32 hash = keccak256(
            abi.encodePacked(
                signMessage,
                keccak256(abi.encodePacked(account, tokenId, tokenURI, block.chainid))
            )
        );
        return hash;
    }

    function hashTransaction(address account, uint256 cid, uint256 limit, string memory tokenURI) internal view returns (bytes32) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                signMessage,
                keccak256(abi.encodePacked(account, cid, limit, tokenURI, block.chainid))
            )
        );
        return hash;
    }

    function verify(bytes32 hash, bytes memory signature) internal view returns (bool) {
        return orangeSinger == hash.recover(signature);
    }

}
