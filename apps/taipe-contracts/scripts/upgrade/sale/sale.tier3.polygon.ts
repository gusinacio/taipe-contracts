import { ethers, upgrades } from 'hardhat';
import {
  Network,
  SALE_ADDRESS,
  Tier
} from '../../../src';
import { getRelayerSigner } from '../../utils/signers';

async function main() {
  const network = Network.Polygon;
  const signer = getRelayerSigner(network);
  const tier = Tier.Tier3;

  const sale = SALE_ADDRESS[tier][network];

  const Tier3Sale = await ethers.getContractFactory('Tier3Sale', signer);

  const saleTier3 = await upgrades.upgradeProxy(sale, Tier3Sale, {
    kind: 'uups',
  });

  await saleTier3.deployed();
  console.log('Sale Tier3 deployed to:', saleTier3.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
