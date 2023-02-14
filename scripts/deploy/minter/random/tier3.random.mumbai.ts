import { Network, Tier } from '../../../../src';
import { deployRandomMinter } from '../../../utils/deployment';

async function main() {
  const network = Network.Mumbai;
  const randomMinter = await deployRandomMinter(network, Tier.Tier3);

  console.log('Tier3 Random Minter deployed to:', randomMinter.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
