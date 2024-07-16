import click

from brownie import TaskOnNFT721, Manager, ManagerProxy, accounts, web3, Contract, network
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
    manager = Manager.deploy({"from": dev, 'gas_limit': 5000000})
    click.echo(f"New Manager deployed [{manager.address}]")
    managerProxy = ManagerProxy.deploy({"from": dev, 'gas_limit': 5000000})
    click.echo(f"New Manager Proxy deployed [{managerProxy.address}]")
    nft = TaskOnNFT721.deploy("Collaboration Achievement Proof", "CAP", managerProxy, {"from": dev, 'gas_limit': 5000000})
    click.echo(f"New TaskOnNFT721 deployed [{nft.address}]")
    managerProxy._setPendingImplementation(manager.address, {"from": dev, 'gas_limit': 5000000})
    manager._become(managerProxy.address, {"from": dev, 'gas_limit': 5000000})
    m = Contract.from_abi("Manager", managerProxy.address, Manager.abi)
    m.initialize("0x450FcAE8a3b81090Cf267D737Eb9bc82e6729c04", nft, {"from": dev, 'gas_limit': 5000000})
