import { isAddress } from 'ethers/lib/utils';
import { Network } from '../../src';
import { TaipeNFT } from '../../typechain-types';
import { getEthereumContract, getPolygonContract } from '../utils/contract';
import { isEthereumNetwork, isPolygonNetwork } from '../utils/signers';

async function main() {
  const toAddress = '0xaE6f962b55Ae4f654144c017EF9E183D7f0B1f62';
  if (!isAddress(toAddress)) throw new Error('Invalid address');
  const network = Network.Goerli;
  let contract: TaipeNFT;
  if (isEthereumNetwork(network)) {
    contract = await getEthereumContract(network);
  } else if (isPolygonNetwork(network)) {
    contract = await getPolygonContract(network);
  } else {
    throw new Error('Network is not supported');
  }
  const minterRole = await contract.MINTER_ROLE();
  console.log('Granting minter role...');
  const gas = await contract.estimateGas.grantRole(minterRole, toAddress);
  console.log('Estimated gas:', gas.toString());
  const tx = await contract.grantRole(minterRole, toAddress, { gasLimit: gas });
  await tx.wait();

  console.log('Minter role granted');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
