import { ethers } from 'hardhat';
import { Network } from '../../../src';
import { getRelayerSigner } from '../../utils/signers';

const mumbai_child_chain_manager = '0xb5505a6d998549090530911180f38aC5130101c6';
const mumbai_opensea_address = '0x1e0049783f008a0085193e00003d00cd54003c71';
async function main() {
  const signer = getRelayerSigner(Network.Mumbai);

  const PolygonTaipe = await ethers.getContractFactory('PolygonTaipe');
  const taipe = await PolygonTaipe.connect(signer).deploy(
    mumbai_child_chain_manager,
  );
  await taipe.deployed();

  const gas = await taipe.estimateGas.setOpenseaAddress(mumbai_opensea_address);
  await taipe.setOpenseaAddress(mumbai_opensea_address, {
    gasLimit: gas,
  });

  console.log('PolygonTaipe NFT deployed to:', taipe.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
