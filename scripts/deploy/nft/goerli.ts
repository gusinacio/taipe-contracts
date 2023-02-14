import { ethers } from 'hardhat';
import { Network } from '../../../src';
import { getRelayerSigner } from '../../utils/signers';

const erc721_proxy_goerli = '0x56E14C4C1748a818a5564D33cF774c59EB3eDF59';
const goerli_opensea_address = '0x00000000006c3852cbEf3e08E8dF289169EdE581';

async function main() {
  const signer = getRelayerSigner(Network.Goerli);

  const EthereumTaipe = await ethers.getContractFactory('EthereumTaipe');
  const taipe = await EthereumTaipe.connect(signer).deploy(erc721_proxy_goerli);

  await taipe.deployed();

  const gas = await taipe.estimateGas.setOpenseaAddress(goerli_opensea_address);
  await taipe.setOpenseaAddress(goerli_opensea_address, {
    gasLimit: gas,
  });

  console.log('EthereumTaipe NFT deployed to:', taipe.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
