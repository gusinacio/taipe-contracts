import { isAddress } from 'ethers/lib/utils';
import { TaipeNFT } from 'typechain-types';
import { Network } from '../../src';
import { getEthereumContract, getPolygonContract } from '../utils/contract';
import { isEthereumNetwork, isPolygonNetwork } from '../utils/signers';

async function main() {
  const toAddress = '0x450B2deC6461217b8222F989E7F447FB4bd06184';
  if (!isAddress(toAddress)) throw new Error('Invalid address');
  const network = Network.Ethereum;
  let contract: TaipeNFT;
  if (isEthereumNetwork(network)) {
    contract = await getEthereumContract(network);
  } else if (isPolygonNetwork(network)) {
    contract = await getPolygonContract(network);
  } else {
    throw new Error('Network is not supported');
  }

  const gas = await contract.estimateGas.transferOwnership(toAddress);
  console.log('Estimated gas:', gas.toString());
  const tx = await contract.transferOwnership(toAddress, { gasLimit: gas });
  await tx.wait();

  console.log('Ownership transfered ');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
