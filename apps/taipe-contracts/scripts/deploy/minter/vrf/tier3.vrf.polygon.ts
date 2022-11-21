import { Network, Tier } from '../../../../src';
import { deployVrfMinter } from '../../../utils/deployment';

async function main() {
  const network = Network.Polygon;
  const randomMinter = await deployVrfMinter(network, Tier.Tier3);

  console.log('Tier3 Vrf Minter deployed to:', randomMinter.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
