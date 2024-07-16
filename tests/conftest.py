import pytest
from brownie import Contract


@pytest.fixture
def owner(accounts):
    return accounts.add(private_key="0x416b8a7d9290502f5661da81f0cf43893e3d19cb9aea3c426cfb36e8186e9c09")


@pytest.fixture
def taskOnNFT(owner, manager, TaskOnNFT721):
    nft = owner.deploy(TaskOnNFT721, "TEST", "TEST", manager)
    yield nft


@pytest.fixture
def delegate(owner, Manager):
    managerContract = owner.deploy(Manager)
    yield managerContract


@pytest.fixture
def manager(owner, delegate, ManagerProxy, Manager):
    proxyContract = owner.deploy(ManagerProxy)
    proxyContract._setPendingImplementation(delegate.address)
    delegate._become(proxyContract.address)
    m = Contract.from_abi("Manager", proxyContract.address, Manager.abi)
    yield m


@pytest.fixture
def managerV2(owner, manager, Manager, ManagerProxy):

    yield manager
