import click

from brownie import Manager, ManagerProxy, accounts, network, web3
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
    if input("Deploy Contracts? y/[N]: ").lower() != "y":
        return
    manager = Manager.deploy({"from": dev})
    click.echo(f"New Manager deployed [{manager.address}]")
    managerProxy = ManagerProxy[-1]
    managerProxy._setPendingImplementation(manager.address, {"from": dev})
    manager._become(managerProxy.address, {"from": dev})
