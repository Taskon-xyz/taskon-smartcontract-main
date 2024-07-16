pragma solidity ^0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "../../interfaces/ITaskOnNFT721.sol";
import "./ManagerStorage.sol";
import "./ManagerProxy.sol";


contract Manager is ManagerStorageV1 {
    using ECDSA for bytes32;

    modifier onlyOwner() {
        require(msg.sender == admin, "must be owner");
        _;
    }

    modifier onlySigner() {
        require(msg.sender == orangeSinger, "must be signer address");
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

    function _become(ManagerProxy managerProxy) public {
        require(msg.sender == managerProxy.admin(), "only proxy admin can change brains");
        managerProxy._acceptImplementation();
    }

    function mint(address account, uint256 cid, string memory tokenURI, uint256 limit, bytes32 unsigned, bytes memory signature) public returns (uint256) {
        require(nftAddr != address(0), "nftAddr not set");
        // check orangeSinger's signature
        bytes32 hash = hashTransaction(account, cid, limit, tokenURI);
        require(hash == unsigned, "hash not equal");
        require(verify(hash, signature), "verify orange signer failed");
        // check cid exists
        if (!campaigns[cid].isUsed) {
            campaigns[cid] = Campaign(cid, 0, limit, 1, true);
        } else if (campaigns[cid].limit != limit) {
            campaigns[cid].limit = limit;
        }
        // revert if this cid have exceeded its limit
        Campaign storage campaign = campaigns[cid];
        require(campaign.minted < campaign.limit, "cid exceed its limit");
        // not exceed limit
        bytes32 key = genParticipateKey(account, cid);
        uint256 count = participated[key];
        require(count < campaign.limitPerUser, "participated exceed limit");
        campaign.minted++;
        participated[key]++;
        return ITaskOnNFT721(nftAddr).mint(account, cid, tokenURI);
    }

    function setParticipateLimit(uint256 cid, uint256 limit) external onlySigner {
        Campaign storage campaign = campaigns[cid];
        require(campaign.isUsed, "campaign is not initialized");
        campaign.limitPerUser = limit;
    }

    function setTokenURI(address account, uint256 tokenId, string memory uri, bytes32 unsigned, bytes memory signature) public {
        require(nftAddr != address(0), "nftAddr not set");
        // check owner
        require(account == ITaskOnNFT721(nftAddr).ownerOf(tokenId), "not owner");
        // check orangeSinger's signature
        bytes32 hash = hashUri(account, tokenId, uri);
        require(hash == unsigned, "hash not equal");
        require(verify(hash, signature), "verify orange signer failed");
        ITaskOnNFT721(nftAddr).setTokenURI(tokenId, uri);
    }

    function genParticipateKey(address account, uint256 cid) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(account, cid));
    }

    function hashUri(address account, uint256 tokenId, string memory tokenURI) internal pure returns (bytes32){
        bytes32 hash = keccak256(
            abi.encodePacked(
                signMessage,
                keccak256(abi.encodePacked(account, tokenId, tokenURI))
            )
        );
        return hash;
    }

    function hashTransaction(address account, uint256 cid, uint256 limit, string memory tokenURI) internal pure returns (bytes32) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                signMessage,
                keccak256(abi.encodePacked(account, cid, limit, tokenURI))
            )
        );
        return hash;
    }

    function verify(bytes32 hash, bytes memory signature) internal view returns (bool) {
        return orangeSinger == hash.recover(signature);
    }

}
