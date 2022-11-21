import { Network, Tier } from '../../../../src';
import { deployRandomMinter } from '../../../utils/deployment';

async function main() {
  const network = Network.Goerli;
  const randomMinter = await deployRandomMinter(network, Tier.Tier1);

  console.log('Tier1 Random Minter deployed to:', randomMinter.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
