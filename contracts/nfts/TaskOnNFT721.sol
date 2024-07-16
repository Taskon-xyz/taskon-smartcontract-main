pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TaskOnNFT721 is ERC721URIStorage, Ownable {

    event SetManager(address oldManager, address newManager);

    event Mint(address indexed owner, uint256 indexed cid, uint256 tokenId);

    address public manager;

    uint256 public count;

    bool public transferable = false;

    mapping(uint256 => uint256[]) public cidHolders;

    modifier onlyAdmin() {
        require(msg.sender == owner() || msg.sender == manager, "must be admin address");
        _;
    }

    modifier onlyManager() {
        require(msg.sender == manager, "must be manager address");
        _;
    }

    constructor (string memory name_, string memory symbol_, address manager_) ERC721(name_, symbol_) {
        manager = manager_;
        emit SetManager(address(0), manager_);
    }

    function setManager(address newManager) external onlyOwner {
        address old = manager;
        manager = newManager;
        emit SetManager(old, newManager);
    }

    function mint(address account, uint256 cid, string memory tokenURI) external onlyAdmin returns (uint256) {
        uint256 tokenId = mint(account, cid);
        _setTokenURI(tokenId, tokenURI);
        emit Mint(account, cid, tokenId);
        return tokenId;
    }

    function setTokenURI(uint256 tokenId, string memory uri) public onlyManager {
        _setTokenURI(tokenId, uri);
    }

    function mint(address account, uint256 cid) internal returns (uint256) {
        uint256 tokenId = count;
        _mint(account, tokenId);
        uint256[] storage holders = cidHolders[cid];
        holders.push(tokenId);
        count++;
        return tokenId;
    }

    /**
 * @dev See {IERC721-transferFrom}.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        require(transferable, "disabled");
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: caller is not approved or owner"
        );
        _transfer(from, to, tokenId);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        require(transferable, "disabled");
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: caller is not approved or owner"
        );
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public override {
        require(transferable, "disabled");
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: caller is not approved or owner"
        );
        _safeTransfer(from, to, tokenId, _data);
    }

    /**
     * PRIVILEGED MODULE FUNCTION. Sets a new transferable for all token types.
     */
    function setTransferable(bool _transferable) external onlyOwner {
        transferable = _transferable;
    }
}
