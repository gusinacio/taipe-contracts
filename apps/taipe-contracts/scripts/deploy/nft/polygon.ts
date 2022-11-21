import { ethers } from 'hardhat';
import { Network } from '../../../src';
import { getRelayerSigner } from '../../utils/signers';

const polygon_child_chain_manager =
  '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa';
const polygon_opensea_address = '0x00000000006c3852cbEf3e08E8dF289169EdE581';

async function main() {
  const signer = getRelayerSigner(Network.Polygon);

  const PolygonTaipe = await ethers.getContractFactory('PolygonTaipe');
  const taipe = await PolygonTaipe.connect(signer).deploy(
    polygon_child_chain_manager,
  );
  await taipe.deployed();

  const gas = await taipe.estimateGas.setOpenseaAddress(
    polygon_opensea_address,
  );
  await taipe.setOpenseaAddress(polygon_opensea_address, {
    gasLimit: gas,
  });

  console.log('PolygonTaipe NFT deployed to:', taipe.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
