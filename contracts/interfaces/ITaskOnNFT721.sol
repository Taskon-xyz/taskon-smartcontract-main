pragma solidity ^0.8.1;

interface ITaskOnNFT721 {

    function setManager(address newManager) external;

    function mint(address account, uint256 cid, string calldata tokenURI) external returns (uint256);

    function setTokenURI(uint256 cid, string memory uri) external;

    function ownerOf(uint256 tokenId) external returns (address);

}
