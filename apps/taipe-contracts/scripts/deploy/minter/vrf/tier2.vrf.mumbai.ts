import { Network, Tier } from '../../../../src';
import { deployVrfMinter } from '../../../utils/deployment';

async function main() {
  const network = Network.Mumbai;
  const randomMinter = await deployVrfMinter(network, Tier.Tier2);

  console.log('Tier2 Vrf Minter deployed to:', randomMinter.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
