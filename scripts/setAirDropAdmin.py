import click

from brownie import Manager, accounts, network, web3, Contract, ManagerProxy
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
    dev = accounts.load(click.prompt("Account", type=click.Choice(accounts.load())))
    print(f"You are using: 'dev' [{dev.address}]")
    managerProxy = "0x57e54d4147afda7f0b55498eaf44e713811c3519"
    manager = Contract.from_abi("Manager", managerProxy, Manager.abi)
    manager.setAirdropAdmin("0xe4dA48f287c2Aa9460249131421f8318D278F905", {"from": dev, 'gas_limit': 5000000})

