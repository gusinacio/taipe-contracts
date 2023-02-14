import { ethers, upgrades } from 'hardhat';
import {
    Network,
    SALE_ADDRESS,
    Tier
} from '../../../src';
import { getRelayerSigner } from '../../utils/signers';

async function main() {
  const network = Network.Goerli;
  const signer = getRelayerSigner(network);
  const tier = Tier.Tier1;

  const sale = SALE_ADDRESS[tier][network];

  const Tier1Sale = await ethers.getContractFactory('Tier1Sale', signer);

  const saleTier1 = await upgrades.upgradeProxy(sale, Tier1Sale, {
    kind: 'uups',
  });

  const tier1Deployed = await saleTier1.deployed();
  console.log('Sale Tier1 deployed tx hash:', saleTier1.deployTransaction.hash);
  console.log('Sale Tier1 deployed to:', tier1Deployed.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
