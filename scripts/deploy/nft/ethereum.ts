import { ethers } from 'hardhat';
import { Network } from '../../../src';
import { getRelayerSigner } from '../../utils/signers';

const erc721_proxy_ethereum = '0x932532aA4c0174b8453839A6E44eE09Cc615F2b7';
const ethereum_opensea_address = '0x1e0049783f008a0085193e00003d00cd54003c71';

async function main() {
  const signer = getRelayerSigner(Network.Ethereum);

  const EthereumTaipe = await ethers.getContractFactory('EthereumTaipe');
  const taipe = await EthereumTaipe.connect(signer).deploy(
    erc721_proxy_ethereum,
  );

  await taipe.deployed();

  const gas = await taipe.estimateGas.setOpenseaAddress(
    ethereum_opensea_address,
  );
  await taipe.setOpenseaAddress(ethereum_opensea_address, {
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
