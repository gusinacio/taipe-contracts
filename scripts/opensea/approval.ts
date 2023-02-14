import { Network } from '../../src';
import { getPolygonContract } from '../utils/contract';

const mumbai_opensea_address = '0x1e0049783f008a0085193e00003d00cd54003c71';

async function main() {
  const network = Network.Mumbai;
  const taipe = await getPolygonContract(network);

  const gas = await taipe.estimateGas.setOpenseaAddress(mumbai_opensea_address);
  const tx = await taipe.setOpenseaAddress(mumbai_opensea_address, {
    gasLimit: gas,
  });
  await tx.wait();

  console.log('Set approval to opensea:', tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
