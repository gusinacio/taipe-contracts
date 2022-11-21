import { Network } from '../../src';
import { TaipeNFT } from '../../typechain-types';
import { getEthereumContract, getPolygonContract } from '../utils/contract';
import { isEthereumNetwork, isPolygonNetwork } from '../utils/signers';

const uri =
  'https://api.immerstring.xyz/metadata/collection/0a3f4cad-31a0-40ca-96ab-c934905b9356/nft/';

async function main() {
  //   const toAddress = '';
  //   if (!isAddress(toAddress)) throw new Error('Invalid address');
  const network = Network.Ethereum;
  let contract: TaipeNFT;
  if (isEthereumNetwork(network)) {
    contract = await getEthereumContract(network);
  } else if (isPolygonNetwork(network)) {
    contract = await getPolygonContract(network);
  } else {
    throw new Error('Network is not supported');
  }

  console.log('Setting URI...');
  const gas = await contract.estimateGas.setBaseURI(uri);
  console.log('Estimated gas:', gas.toString());
  const tx = await contract.setBaseURI(uri, { gasLimit: gas });
  await tx.wait();

  console.log('URI setted to ', uri);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
