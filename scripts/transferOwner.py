import click

from brownie import ManagerProxy, TaskOnNFT721, accounts, network, web3
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
    # newOwner = accounts.load(click.prompt("New Owner", type=click.Choice(accounts.load())))
    # print(f"You are using: 'dev' [{newOwner.address}]")
    managerProxy = ManagerProxy.at("0x57e54d4147AFdA7F0b55498EAf44e713811c3519")
    managerProxy._setPendingAdmin("0x8EE64ABBB6c22C7f56625c0F5A1367844E086265",
                                  {"from": oldOwner, 'gas_limit': 5000000})
    # managerProxy._acceptAdmin({"from": newOwner})
    nft = TaskOnNFT721.at("0x9C19c0393Bd67A98C89088207112c1D7ca28Fa95")
    nft.transferOwnership("0x8EE64ABBB6c22C7f56625c0F5A1367844E086265", {"from": oldOwner, 'gas_limit': 5000000})
