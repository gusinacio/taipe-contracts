import { isAddress } from 'ethers/lib/utils';
import { Network, Tier } from '../../src';
import { getVRFMinter } from '../utils/contract';

async function main() {
  const toAddress = '0x07799ed441d934f50164a253976a43ec31a79d0a';
  if (!isAddress(toAddress)) throw new Error('Invalid address');
  const network = Network.Ethereum;
  const tier = Tier.Tier1;
  let contract = await getVRFMinter(network, tier);
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
