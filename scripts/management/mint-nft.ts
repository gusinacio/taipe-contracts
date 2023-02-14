import { isAddress } from 'ethers/lib/utils';
import { Network, Tier } from '../../src';
import { getVRFMinter } from '../utils/contract';

async function main() {
  const toAddress = '0x1d4e6027a943ffFbBd9F53999d67DAD4a3AB1C0C';
  if (!isAddress(toAddress)) throw new Error('Invalid address');
  const network = Network.Mumbai;
  const tier = Tier.Tier3;
  const contract = await getVRFMinter(network, tier);

  console.log('Minting NFT...');
  console.log(contract.address);
  const gas = await contract.estimateGas.mint(toAddress);
  console.log('Estimated gas:', gas.toString());
  const tx = await contract.mint(toAddress, { gasLimit: gas });
  await tx.wait();

  console.log('Minted NFT ');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
