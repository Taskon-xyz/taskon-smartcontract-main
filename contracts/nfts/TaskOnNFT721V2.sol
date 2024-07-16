pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract TaskOnNFT721V2 is ERC721, Ownable {

    using Strings for uint256;

    event SetOperator(address oldOperator, address newOperator);
    event SetManager(address oldManager, address newManager);
    event SetUriSwitch(uint256 indexed cid, bool oldSwitch, bool newSwitch);
    event Mint(address indexed owner, uint256 indexed cid, uint256 tokenId);

    bool public transferable;
    address public manager;
    address public operator;
    mapping(uint256 => bool) public uriSwitch;
    mapping(uint256 => uint256) public currTokenIdByCID;
    mapping(uint256 => string) private tokenUri;
    mapping(uint256 => string) private baseTokenUri;


    modifier onlyAdmin() {
        require(msg.sender == owner() || msg.sender == manager, "must be admin address");
        _;
    }

    modifier onlyManager() {
        require(msg.sender == manager, "only manager");
        _;
    }
    modifier onlyOperator() {
        require(msg.sender == operator, "only operator");
        _;
    }

    constructor (string memory name_, string memory symbol_, address manager_) ERC721(name_, symbol_) {
        manager = manager_;
        operator = msg.sender;
        emit SetManager(address(0), manager_);
    }

    function setManager(address newManager) external onlyOwner {
        address old = manager;
        manager = newManager;
        emit SetManager(old, newManager);
    }

    function setOperator(address newOperator) external onlyOwner {
        address old = operator;
        operator = newOperator;
        emit SetOperator(old, newOperator);
    }

    function setUriSwitch(uint256 cid, bool boo) external onlyOperator {
        bool old = uriSwitch[cid];
        uriSwitch[cid] = boo;
        emit SetUriSwitch(cid, old, boo);
    }

    function mint(address account, uint256 cid, string calldata _tokenURI) external onlyAdmin returns (uint256) {
        uint256 tokenId = mintInner(account, cid, _tokenURI);
        emit Mint(account, cid, tokenId);
        return tokenId;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireMinted(tokenId);
        uint256 cid = tokenId >> 64;
        if (uriSwitch[cid]) {
            return string(abi.encodePacked(baseTokenUri[cid], "/", tokenId.toString()));
        } else {
            return tokenUri[cid];
        }
    }

    function setTokenURI(uint256 cid, string memory uri) public onlyOperator {
        tokenUri[cid] = uri;
    }

    function setBaseTokenURI(uint256 cid, string memory uri) public onlyOperator {
        baseTokenUri[cid] = uri;
    }

    function mintInner(address account, uint256 cid, string calldata _tokenURI) internal returns (uint256) {
        uint256 tokenId = currTokenIdByCID[cid];
        if (tokenId == 0) {
            tokenId = cid << 64;
            tokenUri[cid] = _tokenURI;
        } else {
            tokenId += 1;
        }
        currTokenIdByCID[cid] = tokenId;
        _mint(account, tokenId);
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
