import { ethers } from 'hardhat';
import { Network } from '../../../src';
import { getRelayerSigner } from '../../utils/signers';

async function main() {
  const signer = getRelayerSigner(Network.Ethereum);

  const SplitterEthereum = await ethers.getContractFactory(
    'TaipeSplitterEthereum',
  );
  const splitter = await SplitterEthereum.connect(signer).deploy();

  await splitter.deployed();

  console.log('Splitter Ethereum deployed to:', splitter.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
