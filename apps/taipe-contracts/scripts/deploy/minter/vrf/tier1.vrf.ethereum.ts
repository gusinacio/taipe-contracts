import { Network, Tier } from '../../../../src';
import { deployVrfMinter } from '../../../utils/deployment';

async function main() {
  const network = Network.Ethereum;
  const randomMinter = await deployVrfMinter(network, Tier.Tier1);

  console.log('Tier1 Vrf Minter deployed to:', randomMinter.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
