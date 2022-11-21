import { ethers } from 'hardhat';
import { Network, Tier } from '../../src';
import { TaipeNFT } from '../../typechain-types';
import { getEthereumContract, getPolygonContract } from './contract';
import {
  getRelayerSigner,
  isEthereumNetwork,
  isPolygonNetwork
} from './signers';

export async function deployTaipeLib(network: Network) {
  const signer = getRelayerSigner(network);

  const TaipeLib = await ethers.getContractFactory('TaipeLib');
  const lib = await TaipeLib.connect(signer).deploy();
  await lib.deployed();

  return lib;
}

export async function deployRandomMinter(network: Network, tier: Tier) {
  const signer = getRelayerSigner(network);

  let contract: TaipeNFT;
  if (isEthereumNetwork(network)) {
    contract = await getEthereumContract(network);
  } else if (isPolygonNetwork(network)) {
    contract = await getPolygonContract(network);
  } else {
    throw new Error('Network is not supported');
  }
  const RandomMinter = await ethers.getContractFactory('RandomMinter');
  console.log('Deploying RandomMinter...');
  const minter = await RandomMinter.connect(signer).deploy(
    tier,
    contract.address,
  );
  console.log('Tx sent. Waiting for confirmation...');

  await minter.deployed();
  console.log('Deployed');

  const minterRole = await contract.MINTER_ROLE();
  console.log('Granting minter role...');
  const gas = await contract.estimateGas.grantRole(minterRole, minter.address);
  const tx = await contract.grantRole(minterRole, minter.address, {
    gasLimit: gas,
  });
  await tx.wait();
  console.log('Granted MINTER_ROLE to RandomMinter', tx.hash);
  return minter;
}

export async function deployVrfMinter(network: Network, tier: Tier) {
  const signer = getRelayerSigner(network);

  let contract: TaipeNFT;
  if (isEthereumNetwork(network)) {
    contract = await getEthereumContract(network);
  } else if (isPolygonNetwork(network)) {
    contract = await getPolygonContract(network);
  } else {
    throw new Error('Network is not supported');
  }
  const VRFMinter = await ethers.getContractFactory('VRFMinter');
  console.log('Deploying VRFMinter...');
  const minter = await VRFMinter.connect(signer).deploy(
    tier,
    contract.address,
    getVrfCoordinator(network),
    getSubscriptionId(network),
    getKeyHash(network),
  );
  console.log('Tx sent. Waiting for confirmation...');

  await minter.deployed();
  console.log('Deployed');

  const minterRole = await contract.MINTER_ROLE();
  console.log('Granting minter role...');
  const gas = await contract.estimateGas.grantRole(minterRole, minter.address);
  const tx = await contract.grantRole(minterRole, minter.address, {
    gasLimit: gas,
  });
  await tx.wait();
  console.log('Granted MINTER_ROLE to RandomMinter', tx.hash);
  return minter;
}

function getKeyHash(network: Network) {
  switch (network) {
    case Network.Mumbai:
      return '0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f';
    case Network.Goerli:
      return '0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15';
    case Network.Polygon:
      return '0xd729dc84e21ae57ffb6be0053bf2b0668aa2aaf300a2a7b2ddf7dc0bb6e875a8';
    case Network.Ethereum:
      return '0x8af398995b04c28e9951adb9721ef74c74f93e6a478f39e7e0777be13527e7ef';
    default:
      throw new Error('Network is not supported');
  }
}

function getVrfCoordinator(network: Network) {
  switch (network) {
    case Network.Mumbai:
      return '0x7a1bac17ccc5b313516c5e16fb24f7659aa5ebed';
    case Network.Goerli:
      return '0x2ca8e0c643bde4c2e08ab1fa0da3401adad7734d';
    case Network.Ethereum:
      return '0x271682DEB8C4E0901D1a1550aD2e64D568E69909';
    case Network.Polygon:
      return '0xAE975071Be8F8eE67addBC1A82488F1C24858067';
    default:
      throw new Error('Network is not supported');
  }
}

function getSubscriptionId(network: Network) {
  switch (network) {
    case Network.Mumbai:
      return 1543;
    case Network.Goerli:
      return 4765;
    case Network.Ethereum:
      return 513;
    case Network.Polygon:
      return 411;
    default:
      throw new Error('Network is not supported');
  }
}
