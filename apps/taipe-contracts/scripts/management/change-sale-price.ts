import { utils } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import { Network, Tier } from '../../src';
import { getSaleContract } from '../utils/contract';

async function main() {
  const network = Network.Mumbai;
  const tier = Tier.Tier3;
  const contract = await getSaleContract(network, tier);

  const currentBatch = await contract.currentBatch();
  const batchInfo = await contract.batchInfo(currentBatch);

  const batch = {
    currentBatch: currentBatch,
    price: utils.parseEther('0.01'),
    sizeLeft: batchInfo.sizeLeft,
    expiration: batchInfo.expiration,
  };

  const gas = await contract.estimateGas.updateBatch(
    batch.currentBatch,
    batch.price,
    batch.sizeLeft,
    batch.expiration,
  );
  console.log('Estimated gas:', gas.toString());
  const tx = await contract.updateBatch(
    batch.currentBatch,
    batch.price,
    batch.sizeLeft,
    batch.expiration,
    { gasLimit: gas },
  );
  await tx.wait();

  console.log('Updated batch', batch.currentBatch);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
