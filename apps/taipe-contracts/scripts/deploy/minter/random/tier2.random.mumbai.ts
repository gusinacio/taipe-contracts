import { Network, Tier } from '../../../../src';
import { deployRandomMinter } from '../../../utils/deployment';

async function main() {
  const network = Network.Mumbai;
  const randomMinter = await deployRandomMinter(network, Tier.Tier2);

  console.log('Tier2 Random Minter deployed to:', randomMinter.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
