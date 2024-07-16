import click

from brownie import Manager, ManagerProxy, TaskOnNFT721, accounts, network, web3
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
    nft = TaskOnNFT721[-1]
    manager = Manager[-1]
    managerProxy = ManagerProxy[-1]
    TaskOnNFT721.publish_source(nft)
    Manager.publish_source(manager)
    ManagerProxy.publish_source(managerProxy)
