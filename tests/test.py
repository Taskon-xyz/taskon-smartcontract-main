import brownie
from brownie import web3, Contract
from eth_account.messages import encode_defunct


#     function mint(address account, uint256 cid, string memory tokenURI, uint8 _v, bytes32 _r, bytes32 _s) public returns (uint256) s


def test_integration(accounts, owner, manager, taskOnNFT):
    # 0x33a4622b82d4c04a53e170c638b944ce27cffce3000000000000000000000000000000000000000000000000000000000000000168747470733a2f2f7777772e62616964752e636f6d
    manager.initialize(owner, taskOnNFT, {"from": owner})
    # function mint(address account, uint256 cid, string memory tokenURI, uint8 _v, bytes32 _r, bytes32 _s) public returns (uint256) {
    unsigned = web3.solidityKeccak(['address', 'uint256', 'uint256', 'string'],
                                   [accounts[1].address, 1, 10, "https://www.baidu.com"])
    # unsigned = web3.solidityKeccak(['string', 'bytes32'], ['\x19Ethereum Signed Message:\n32', unsigned])
    message = encode_defunct(primitive=unsigned)
    signed = web3.eth.account.sign_message(message,
                                           private_key='0x416b8a7d9290502f5661da81f0cf43893e3d19cb9aea3c426cfb36e8186e9c09')
    tx = manager.mint(accounts[1], 1, "https://www.baidu.com", 10, signed[0], signed[4], {"from": owner})
    assert tx.events["Mint"] != None


def test_mint_twice(accounts, owner, manager, taskOnNFT):
    manager.initialize(owner, taskOnNFT, {"from": owner})
    unsigned = web3.solidityKeccak(['address', 'uint256', 'uint256', 'string'],
                                   [accounts[1].address, 1, 10, "https://www.baidu.com"])
    # unsigned = web3.solidityKeccak(['string', 'bytes32'], ['\x19Ethereum Signed Message:\n32', unsigned])
    message = encode_defunct(primitive=unsigned)
    signed = web3.eth.account.sign_message(message,
                                           private_key='0x416b8a7d9290502f5661da81f0cf43893e3d19cb9aea3c426cfb36e8186e9c09')
    tx1 = manager.mint(accounts[1], 1, "https://www.baidu.com", 10, signed[0], signed[4], {"from": owner})
    assert tx1.events["Mint"] != None
    with brownie.reverts("participated exceed limit"):
        unsigned = web3.solidityKeccak(['address', 'uint256', 'uint256', 'string'],
                                       [accounts[1].address, 1, 10, "https://www.baidu.com"])
        message = encode_defunct(primitive=unsigned)
        signed = web3.eth.account.sign_message(message,
                                               private_key='0x416b8a7d9290502f5661da81f0cf43893e3d19cb9aea3c426cfb36e8186e9c09')
        manager.mint(accounts[1], 1, "https://www.baidu.com", 10, signed[0], signed[4], {"from": owner})


def test_exceed_limit(accounts, owner, manager, taskOnNFT):
    manager.initialize(owner, taskOnNFT, {"from": owner})
    unsigned = web3.solidityKeccak(['address', 'uint256', 'uint256', 'string'],
                                   [accounts[1].address, 1, 1, "https://www.baidu.com"])
    message = encode_defunct(primitive=unsigned)
    signed = web3.eth.account.sign_message(message,
                                           private_key='0x416b8a7d9290502f5661da81f0cf43893e3d19cb9aea3c426cfb36e8186e9c09')
    tx1 = manager.mint(accounts[1], 1, "https://www.baidu.com", 1, signed[0], signed[4], {"from": owner})
    assert tx1.events["Mint"] != None
    with brownie.reverts("cid exceed its limit"):
        unsigned = web3.solidityKeccak(['address', 'uint256', 'uint256', 'string'],
                                       [accounts[2].address, 1, 1, "https://www.baidu.com"])
        message = encode_defunct(primitive=unsigned)
        signed = web3.eth.account.sign_message(message,
                                               private_key='0x416b8a7d9290502f5661da81f0cf43893e3d19cb9aea3c426cfb36e8186e9c09')
        manager.mint(accounts[2], 1, "https://www.baidu.com", 1, signed[0], signed[4], {"from": owner})


def test_owner_mint(accounts, owner, taskOnNFT):
    tx1 = taskOnNFT.mint(accounts[1], 1, "https://www.baidu.com", {"from": owner})
    assert tx1.events["Mint"] != None
    with brownie.reverts("must be admin address"):
        taskOnNFT.mint(accounts[1], 1, "https://www.baidu.com", {"from": accounts[2]})


def test_pause_transfer(accounts, owner, manager, taskOnNFT):
    manager.initialize(owner, taskOnNFT, {"from": owner})
    unsigned = web3.solidityKeccak(['address', 'uint256', 'uint256', 'string'],
                                   [accounts[1].address, 1, 10, "https://www.baidu.com"])
    # unsigned = web3.solidityKeccak(['string', 'bytes32'], ['\x19Ethereum Signed Message:\n32', unsigned])
    message = encode_defunct(primitive=unsigned)
    signed = web3.eth.account.sign_message(message,
                                           private_key='0x416b8a7d9290502f5661da81f0cf43893e3d19cb9aea3c426cfb36e8186e9c09')
    tx1 = manager.mint(accounts[1], 1, "https://www.baidu.com", 10, signed[0], signed[4], {"from": owner})
    assert tx1.events["Mint"] != None

    taskOnNFT.setTransferable(False, {"from": owner})

    with brownie.reverts("disabled"):
        taskOnNFT.transferFrom(accounts[1], accounts[2], 0, {"from": accounts[1]})

    taskOnNFT.setTransferable(True, {"from": owner})
    tx2 = taskOnNFT.transferFrom(accounts[1], accounts[2], 0, {"from": accounts[1]})
    assert tx2.events["Transfer"] != None


def test_change_limit(accounts, owner, manager, taskOnNFT):
    manager.initialize(owner, taskOnNFT, {"from": owner})
    unsigned = web3.solidityKeccak(['address', 'uint256', 'uint256', 'string'],
                                   [accounts[1].address, 1, 10, "https://www.baidu.com"])
    message = encode_defunct(primitive=unsigned)
    signed = web3.eth.account.sign_message(message,
                                           private_key='0x416b8a7d9290502f5661da81f0cf43893e3d19cb9aea3c426cfb36e8186e9c09')
    tx1 = manager.mint(accounts[1], 1, "https://www.baidu.com", 10, signed[0], signed[4], {"from": owner})
    assert tx1.events["Mint"] != None

    with brownie.reverts("participated exceed limit"):
        unsigned = web3.solidityKeccak(['address', 'uint256', 'uint256', 'string'],
                                       [accounts[1].address, 1, 10, "https://www.baidu.com"])
        message = encode_defunct(primitive=unsigned)
        signed = web3.eth.account.sign_message(message,
                                               private_key='0x416b8a7d9290502f5661da81f0cf43893e3d19cb9aea3c426cfb36e8186e9c09')
        manager.mint(accounts[1], 1, "https://www.baidu.com", 10, signed[0], signed[4], {"from": owner})

    manager.setParticipateLimit(1, 2, {"from": owner})

    unsigned = web3.solidityKeccak(['address', 'uint256', 'uint256', 'string'],
                                   [accounts[1].address, 1, 10, "https://www.baidu.com"])
    message = encode_defunct(primitive=unsigned)
    signed = web3.eth.account.sign_message(message,
                                           private_key='0x416b8a7d9290502f5661da81f0cf43893e3d19cb9aea3c426cfb36e8186e9c09')
    tx2 = manager.mint(accounts[1], 1, "https://www.baidu.com", 10, signed[0], signed[4], {"from": owner})
    assert tx2.events["Mint"] != None

    with brownie.reverts("participated exceed limit"):
        unsigned = web3.solidityKeccak(['address', 'uint256', 'uint256', 'string'],
                                       [accounts[1].address, 1, 10, "https://www.baidu.com"])
        message = encode_defunct(primitive=unsigned)
        signed = web3.eth.account.sign_message(message,
                                               private_key='0x416b8a7d9290502f5661da81f0cf43893e3d19cb9aea3c426cfb36e8186e9c09')
        manager.mint(accounts[1], 1, "https://www.baidu.com", 10, signed[0], signed[4], {"from": owner})


def test_set_uri(accounts, owner, manager, taskOnNFT):
    manager.initialize(owner, taskOnNFT, {"from": owner})
    # function mint(address account, uint256 cid, string memory tokenURI, uint8 _v, bytes32 _r, bytes32 _s) public returns (uint256) {
    unsigned = web3.solidityKeccak(['address', 'uint256', 'uint256', 'string'],
                                   [accounts[1].address, 1, 10, "https://www.baidu.com"])
    # unsigned = web3.solidityKeccak(['string', 'bytes32'], ['\x19Ethereum Signed Message:\n32', unsigned])
    message = encode_defunct(primitive=unsigned)
    signed = web3.eth.account.sign_message(message,
                                           private_key='0x416b8a7d9290502f5661da81f0cf43893e3d19cb9aea3c426cfb36e8186e9c09')
    tx = manager.mint(accounts[1], 1, "https://www.baidu.com", 10, signed[0], signed[4], {"from": owner})
    assert tx.events["Mint"] != None
    assert taskOnNFT.tokenURI(0) == "https://www.baidu.com"
    # function setTokenURI(address account, uint256 tokenId, string memory uri, bytes32 unsigned, bytes memory signature) public {

    unsigned = web3.solidityKeccak(['address', 'uint256', 'string'],
                                   [accounts[1].address, 0, "https://www.sina.com"])
    message = encode_defunct(primitive=unsigned)
    signed = web3.eth.account.sign_message(message,
                                           private_key='0x416b8a7d9290502f5661da81f0cf43893e3d19cb9aea3c426cfb36e8186e9c09')

    manager.setTokenURI(accounts[1], 0, "https://www.sina.com", signed[0], signed[4], {"from": owner})
    assert taskOnNFT.tokenURI(0) == "https://www.sina.com"


def test_upgrade(accounts, owner, manager, taskOnNFT, ManagerProxy, ManagerV2):
    # 0x33a4622b82d4c04a53e170c638b944ce27cffce3000000000000000000000000000000000000000000000000000000000000000168747470733a2f2f7777772e62616964752e636f6d
    manager.initialize(owner, taskOnNFT, {"from": owner})
    # function mint(address account, uint256 cid, string memory tokenURI, uint8 _v, bytes32 _r, bytes32 _s) public returns (uint256) {
    unsigned = web3.solidityKeccak(['address', 'uint256', 'uint256', 'string'],
                                   [accounts[1].address, 1, 10, "https://www.baidu.com"])
    # unsigned = web3.solidityKeccak(['string', 'bytes32'], ['\x19Ethereum Signed Message:\n32', unsigned])
    message = encode_defunct(primitive=unsigned)
    signed = web3.eth.account.sign_message(message,
                                           private_key='0x416b8a7d9290502f5661da81f0cf43893e3d19cb9aea3c426cfb36e8186e9c09')
    tx = manager.mint(accounts[1], 1, "https://www.baidu.com", 10, signed[0], signed[4], {"from": owner})
    assert tx.events["Mint"] != None
    assert manager.admin() == owner.address

    managerContract = owner.deploy(ManagerV2)
    proxy = Contract.from_abi("ManagerProxy", manager.address, ManagerProxy.abi)
    proxy._setPendingImplementation(managerContract.address, {"from": owner})
    managerContract._become(manager.address)
    managerV2 = Contract.from_abi("ManagerV2", proxy.address, ManagerV2.abi)
    res = managerV2.upgrade()
    assert res == 1
    assert manager.admin() == owner.address
    assert manager.campaigns(1)[0] == 1

    unsigned = web3.solidityKeccak(['address', 'uint256', 'uint256', 'string'],
                                   [accounts[2].address, 1, 10, "https://www.baidu.com"])
    message = encode_defunct(primitive=unsigned)
    signed = web3.eth.account.sign_message(message,
                                           private_key='0x416b8a7d9290502f5661da81f0cf43893e3d19cb9aea3c426cfb36e8186e9c09')
    tx = manager.mint(accounts[2], 1, "https://www.baidu.com", 10, signed[0], signed[4], {"from": owner})
    assert tx.events["Mint"] != None