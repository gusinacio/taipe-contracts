import { ethers } from 'hardhat';
import { getVRFMinter } from '../../utils/contract';
import { FEE_RECIPIENT_ADDRESS, MINTER_ADDRESS, Network, Tier } from '../../../src';
import { getRelayerSigner } from '../../utils/signers';

async function main() {
    const network = Network.Goerli
    const signer = getRelayerSigner(network);
    const tier = Tier.Tier1;

    const feeRecipient = FEE_RECIPIENT_ADDRESS[network];
    const minter = MINTER_ADDRESS[tier][network];

    const Tier1Sale = await ethers.getContractFactory('Tier1Sale');
    const saleTier1 = await Tier1Sale.connect(signer).deploy(minter, feeRecipient);

    await saleTier1.deployed();
    console.log('Sale Tier1 deployed to:', saleTier1.address);

    const contract = await getVRFMinter(network, tier);
    const minterRole = await contract.MINTER_ROLE();

    console.log('Granting minter role...');
    const gas = await contract.estimateGas.grantRole(minterRole, saleTier1.address);
    console.log('Estimated gas:', gas.toString());
    const tx = await contract.grantRole(minterRole, saleTier1.address, { gasLimit: gas });
    await tx.wait();

    console.log('Minter role granted. tx hash: ' + tx.hash);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
