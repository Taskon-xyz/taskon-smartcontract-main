pragma solidity ^0.8.1;

contract ManagerStorage {
    /**
    * @notice Administrator for this contract
    */
    address public admin;

    /**
    * @notice Pending administrator for this contract
    */
    address public pendingAdmin;

    /**
    * @notice Active brains of Manager
    */
    address public managerImplementation;

    /**
    * @notice Pending brains of Manager
    */
    address public pendingManagerImplementation;

}

contract ManagerStorageV1 is ManagerStorage {
    string constant signMessage = "\x19Ethereum Signed Message:\n32";
    address public orangeSinger;
    address public nftAddr;
    mapping(uint256 => Campaign) public campaigns;
    mapping(bytes32 => uint256) public participated;

    struct Campaign {
        uint256 cid;
        uint256 minted;
        uint256 limit;
        uint256 limitPerUser;
        bool isUsed;
    }
}
