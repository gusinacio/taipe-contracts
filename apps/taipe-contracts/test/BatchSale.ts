import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { constants, utils } from 'ethers';
import { ethers } from 'hardhat';
import { Tier } from './utils/utils';
import { getBlock, advanceTimeAndBlock } from './helpers/time';

const BASE_FEE = '1000';
const GAS_PRICE_LINK = '1000000000'; // 0.000000001 LINK per gas
const fundAmount = '1000000000000000000';
const keyHash =
    '0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc';


describe('BatchSale', () => {
    async function deployBatchSale() {
        const [owner, otherAccount, feeRecipient] = await ethers.getSigners();

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
        await vrfCoordinator.fundSubscription(subscriptionId, fundAmount);

        const VRFMinter = await ethers.getContractFactory('VRFMinter');
        const minter = await VRFMinter.deploy(
            Tier.Tier1,
            taipe.address,
            vrfCoordinator.address,
            subscriptionId,
            keyHash,
        );
        await taipe.grantRole(await taipe.MINTER_ROLE(), minter.address);

        await vrfCoordinator.addConsumer(subscriptionId, minter.address);

        await minter.grantRole(await minter.MINTER_ROLE(), owner.address);
        const Tier1Sale = await ethers.getContractFactory('Tier1Sale');
        const sale = await Tier1Sale.deploy(minter.address, feeRecipient.address);

        await minter.grantRole(await minter.MINTER_ROLE(), sale.address);

        return { sale, taipe, minter, vrfCoordinator, owner, otherAccount, feeRecipient };
    }

    describe('Deployment', () => {
        it('Should deploy with the right amount of batches', async () => {
            const { sale, feeRecipient, minter } = await loadFixture(deployBatchSale);
            expect(await sale.totalBatches()).to.equal(3);
            expect(await sale.totalSize()).to.equal(14);
            expect(await sale.getTotalSold()).to.equal(0);
            expect(await sale.currentBatch()).to.equal(0);
            expect(await sale.feeRecipient()).to.equal(feeRecipient.address);
            expect(await sale.minter()).to.equal(minter.address);
            const batchInfo = await sale.batchInfo(0);
            expect(batchInfo.price).to.equal(utils.parseEther("1.25"));
            expect(batchInfo.sizeLeft).to.equal(5);
            expect(batchInfo.expiration).to.equal(constants.MaxUint256);
        });
    });

    describe('Update', () => {
        it('should update a batch info', async () => {
            const { sale } = await loadFixture(deployBatchSale);
            const batchNumber = 0;
            const newPrice = utils.parseEther("1");
            const batchInfo = await sale.batchInfo(batchNumber);
            const tx = await sale.updateBatch(batchNumber, newPrice, batchInfo.sizeLeft, batchInfo.expiration);
            await tx.wait();
            const batchInfoAfterUpdate = await sale.batchInfo(batchNumber);
            expect(batchInfoAfterUpdate.price).to.equal(newPrice);
            expect(batchInfoAfterUpdate.sizeLeft).to.equal(batchInfo.sizeLeft);
            expect(batchInfoAfterUpdate.expiration).to.equal(batchInfo.expiration);
        })

        it('only admins should update a batch info', async () => {
            const { sale, otherAccount } = await loadFixture(deployBatchSale);
            const batchNumber = 0;
            const batchInfo = await sale.batchInfo(batchNumber);
            const tx = sale.connect(otherAccount).updateBatch(batchNumber, batchInfo.price, batchInfo.sizeLeft.add(10), batchInfo.expiration);
            await expect(tx).to.be.reverted;
        })

        it('should not update old batches', async () => {
            const { sale } = await loadFixture(deployBatchSale);
            const price = await sale.getPrice();
            await sale.updateBatch(0, price, 1, constants.MaxUint256);
            await sale.buy({
                value: price
            });

            await expect(sale.updateBatch(0, price, 1, constants.MaxUint256)).to.be.revertedWith('Must be a current or future batch index')
        })
        it('should not update batch that does not exist', async () => {
            const { sale } = await loadFixture(deployBatchSale);
            const batchNumber = (await sale.totalBatches()).add(1);
            const tx = sale.updateBatch(batchNumber, 10, 10, 10);
            await expect(tx).to.be.revertedWith('Must be a current or future batch index');
        })
        it('should update total size', async () => {
            const { sale } = await loadFixture(deployBatchSale);
            const batchNumber = 0;
            const newSize = 2;
            const batchInfo = await sale.batchInfo(batchNumber);
            const oldTotalSize = await sale.totalSize();
            const oldBatchSize = batchInfo.sizeLeft;
            const tx = await sale.updateBatch(batchNumber, batchInfo.price, newSize, batchInfo.expiration);
            await tx.wait();
            const batchInfoAfterUpdate = await sale.batchInfo(batchNumber);
            const newTotalSize = await sale.totalSize();
            const expectedTotalSize = oldTotalSize.add(newSize).sub(oldBatchSize);
            expect(batchInfoAfterUpdate.sizeLeft).to.equal(newSize);
            expect(newTotalSize).to.be.equals(expectedTotalSize);
         })
    })

    describe('Buy', () => {
        it('should buy an nft', async () => {
            const { sale, otherAccount, vrfCoordinator, minter, taipe, feeRecipient } = await loadFixture(deployBatchSale);

            const price = await sale.getPrice();
            const currentBatch = await sale.currentBatch();
            const requestId = await sale.connect(otherAccount).callStatic.buy({
                value: price
            });

            const oldFeeBalance = await feeRecipient.getBalance();
            await expect(sale.connect(otherAccount).buy({
                value: price
            })).to.emit(sale, 'Sale').withArgs(otherAccount.address, currentBatch, price, requestId)

            const rand = Math.floor(Math.random() * 100000000000000);
            await vrfCoordinator.fulfillRandomWordsWithOverride(
                requestId,
                minter.address,
                [rand],
            );

            await expect(minter.unpack(requestId)).to.emit(taipe, 'Transfer');

            const expectedBatch  = await sale.currentBatch();
            const expectedPrice = await sale.getPrice();
            const expectedBalance = await feeRecipient.getBalance();

            expect(expectedBatch).to.equal(currentBatch);
            expect(expectedPrice).to.equal(price);
            expect(expectedBalance).to.equal(oldFeeBalance.add(price));
        })
        it('should change batch on last nft', async () => {
            const { sale } = await loadFixture(deployBatchSale);

            const price = await sale.getPrice();
            await sale.updateBatch(0, price, 1, constants.MaxUint256);
            const currentBatch = await sale.currentBatch();
            await expect(sale.buy({
                value: price
            })).to.emit(sale, 'BatchChange').withArgs(currentBatch.add(1));
            const expectedBatch = await sale.currentBatch();

            expect(expectedBatch).to.equal(currentBatch.add(1));
        })
        it('should expire batch', async () => {
            const { sale } = await loadFixture(deployBatchSale);
            const price = await sale.getPrice();
            const currentBatch = await sale.currentBatch();
            const currentTimestamp = (await getBlock()).timestamp;
            const batchInfo = await sale.batchInfo(currentBatch);
            await sale.updateBatch(currentBatch, price, batchInfo.sizeLeft, currentTimestamp + 100);
            await advanceTimeAndBlock(101);

            const newerBatchInfo = await sale.batchInfo(currentBatch);
            expect(newerBatchInfo.sizeLeft).to.be.greaterThan(1);

            await expect(sale.buy({
                value: price
            })).to.emit(sale, 'BatchChange');
        })

        it('should not buy if not enought tokens', async () => {
            const { sale } = await loadFixture(deployBatchSale);

            const price = await sale.getPrice();
            await expect(sale.buy({
                value: price.sub(1)
            })).to.be.revertedWith('Not enough token sent');
        })
        it('should not buy if sold out', async () => {
            const { sale } = await loadFixture(deployBatchSale);

            const tokensLeft = await sale.totalSize();
            for (let i = 0; i < tokensLeft.toNumber(); i++) {
                const price = await sale.getPrice();
                await sale.buy({
                    value: price
                });
            }
            await expect(sale.buy({
                value: 1
            })).to.be.revertedWith('Is sold out');
        })

    })

    describe('Expiration', () => {
        it('should expire batch if time passed', async () => {
            const { sale } = await loadFixture(deployBatchSale);
            const price = await sale.getPrice();
            const currentBatch = await sale.currentBatch();
            const currentTimestamp = (await getBlock()).timestamp;
            const batchInfo = await sale.batchInfo(currentBatch);
            await sale.updateBatch(currentBatch, price, batchInfo.sizeLeft, currentTimestamp + 100);
            await advanceTimeAndBlock(101);
            await expect(sale.expireCurrentBatch()).to.emit(sale, 'BatchChange');
        })
        it('should not expire batch if time does not passed', async () => {
            const { sale } = await loadFixture(deployBatchSale);

            await expect(sale.expireCurrentBatch()).to.be.revertedWith('Batch did not expire');
        })
    })

});
