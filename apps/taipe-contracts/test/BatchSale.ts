import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { constants, utils } from 'ethers';
import { ethers } from 'hardhat';
import { Tier } from './utils/utils';

const BASE_FEE = '1000';
const GAS_PRICE_LINK = '1000000000'; // 0.000000001 LINK per gas
const fundAmount = '1000000000000000000';
const keyHash =
    '0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc';


describe('BatchSale', () => {
    async function deployBatchSale() {
        const [owner, otherAccount] = await ethers.getSigners();

        // taipe nft
        const TaipeNFT = await ethers.getContractFactory('TaipeNFT');
        const taipe = await TaipeNFT.deploy();

        // vrf coordinator
        const VRFCoordinatorV2Mock = await ethers.getContractFactory(
            'VRFCoordinatorV2Mock',
        );
        const vrfCoordinator = await VRFCoordinatorV2Mock.deploy(
            BASE_FEE,
            GAS_PRICE_LINK,
        );
        const tx = await vrfCoordinator.createSubscription();
        const transactionReceipt = await tx.wait();
        const subscriptionId = ethers.BigNumber.from(
            transactionReceipt.events?.[0].topics?.[1],
        );

        const VRFMinter = await ethers.getContractFactory('VRFMinter');
        const minter = await VRFMinter.deploy(
            Tier.Tier1,
            taipe.address,
            vrfCoordinator.address,
            subscriptionId,
            keyHash,
        );
        const Tier1Sale = await ethers.getContractFactory('Tier1Sale');
        const sale = await Tier1Sale.deploy(minter.address, otherAccount.address);

        return { sale, taipe, minter, vrfCoordinator, owner, otherAccount };
    }

    describe('Deployment', () => {
        it('Should deploy with the right amount of batches', async () => {
            const { sale, otherAccount, minter } = await loadFixture(deployBatchSale);
            console.log("teste")
            expect(await sale.totalBatches()).to.equal(3);
            expect(await sale.totalSize()).to.equal(14);
            expect(await sale.getTotalSold()).to.equal(0);
            expect(await sale.currentBatch()).to.equal(0);
            expect(await sale.feeRecipient()).to.equal(otherAccount.address);
            expect(await sale.minter()).to.equal(minter.address);
            const batchInfo = await sale.batchInfo(1);
            expect(batchInfo.price).to.equal(utils.parseEther("1.25"));
            expect(batchInfo.size).to.equal(5);
            expect(batchInfo.expiration).to.equal(constants.MaxUint256);
        });
    });

});
