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
    signer = get_address("Signer Address: ")
    manager = Contract.from_abi("Manager", ManagerProxy[-1].address, Manager.abi)
    manager.setOrangeSigner(signer, {"from": dev, 'gas_limit': 5000000})
