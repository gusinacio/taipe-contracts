import { isAddress } from 'ethers/lib/utils';
import { FEE_RECIPIENT_ADDRESS, Network } from '../../src';
import { TaipeNFT } from '../../typechain-types';
import { getEthereumContract, getPolygonContract } from '../utils/contract';
import { isEthereumNetwork, isPolygonNetwork } from '../utils/signers';

const percentage = 800; // 8%

async function main() {
  const network = Network.Polygon;
  const toAddress = FEE_RECIPIENT_ADDRESS[network]
  if (!isAddress(toAddress)) throw new Error('Invalid address');
  let contract: TaipeNFT;
  if (isEthereumNetwork(network)) {
    contract = await getEthereumContract(network);
  } else if (isPolygonNetwork(network)) {
    contract = await getPolygonContract(network);
  } else {
    throw new Error('Network is not supported');
  }

  console.log('Setting Royalty...');
  const gas = await contract.estimateGas.setDefaultRoyalty(
    toAddress,
    percentage,
  );
  console.log('Estimated gas:', gas.toString());
  const tx = await contract.setDefaultRoyalty(toAddress, percentage, {
    gasLimit: gas,
  });
  await tx.wait();

  console.log('Royalty updated. tx hash: ', tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
