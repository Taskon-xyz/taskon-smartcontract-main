import click

from brownie import ManagerProxy, TaskOnNFT721, Manager, accounts, network, web3, Contract
from eth_utils import is_checksum_address


def get_address(msg: str) -> str:
    while True:
        val = input(msg)
        if is_checksum_address(val):
            return val
        else:
            addr = web3.ens.address(val)
            if addr:
                print(f"Found ENS '{val}' [{addr}]")
                return addr
        print(f"I'm sorry, but '{val}' is not a checksummed address or ENS")


def main():
    print(f"You are using the '{network.show_active()}' network")
    oldOwner = accounts.load(click.prompt("Old Owner", type=click.Choice(accounts.load())))
    print(f"You are using: 'dev' [{oldOwner.address}]")
    newOwner = accounts.load(click.prompt("New Owner", type=click.Choice(accounts.load())))
    print(f"You are using: 'dev' [{oldOwner.address}]")
    managerProxy = ManagerProxy[-1]
    managerProxy._setPendingAdmin(newOwner.address, {"from": oldOwner})
    managerProxy._acceptAdmin({"from": newOwner})
    nft = TaskOnNFT721[-1]
    nft.transferOwnership(newOwner.address, {"from": oldOwner})
