import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Tier } from './utils/utils';

const BASE_FEE = '1000';
const GAS_PRICE_LINK = '1000000000'; // 0.000000001 LINK per gas
const fundAmount = '1000000000000000000';
const keyHash =
  '0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc';
describe('VRF', () => {
  async function deployMinterVRF() {
    const [owner, otherAccount] = await ethers.getSigners();

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

    const TaipeNFT = await ethers.getContractFactory('TaipeNFT');
    const taipe = await TaipeNFT.deploy();

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

    return { taipe, minter, vrfCoordinator, owner, otherAccount };
  }

  describe('Deployment', () => {
    it('should deploy link to vrfCoordinator correctly', async () => {
      const { minter, vrfCoordinator } = await loadFixture(deployMinterVRF);
      const addr = await minter.COORDINATOR();

      expect(addr).to.be.equal(vrfCoordinator.address);
    });
  });
  describe('Mint', () => {
    it('should request random number', async () => {
      const { minter, vrfCoordinator, owner } = await loadFixture(
        deployMinterVRF,
      );
      await expect(minter.mint(owner.address)).to.emit(
        vrfCoordinator,
        'RandomWordsRequested',
      );
    });

    it("shouldn't request random number if not minter", async () => {
      const { minter, owner, otherAccount } = await loadFixture(
        deployMinterVRF,
      );
      await expect(minter.connect(otherAccount).mint(owner.address)).to.be
        .reverted;
    });

    it('should fulfill the request', async () => {
      const { minter, vrfCoordinator, owner } = await loadFixture(
        deployMinterVRF,
      );
      const requestId = await minter.callStatic.mint(owner.address);
      await minter.mint(owner.address);
      // generate integer random number
      const rand = Math.floor(Math.random() * 100000000000000);
      await expect(
        vrfCoordinator.fulfillRandomWordsWithOverride(
          requestId,
          minter.address,
          [rand],
        ),
      )
        .to.emit(minter, 'RequestFulfilled')
        .withArgs(requestId, owner.address, anyValue);
    });
    it('owner should unpack the request into an nft', async () => {
      const { minter, taipe, vrfCoordinator, owner } = await loadFixture(
        deployMinterVRF,
      );
      const requestId = await minter.callStatic.mint(owner.address);
      await minter.mint(owner.address);
      const rand = Math.floor(Math.random() * 100000000000000);
      await vrfCoordinator.fulfillRandomWordsWithOverride(
        requestId,
        minter.address,
        [rand],
      );
      await expect(minter.unpack(requestId)).to.emit(taipe, 'Transfer');
      const balance = await taipe.balanceOf(owner.address);
      expect(balance.toNumber()).to.be.greaterThan(0);
    });
    it('minter role should mint the request into an nft', async () => {
      const { minter, taipe, vrfCoordinator, owner, otherAccount } =
        await loadFixture(deployMinterVRF);
      await minter.grantRole(await minter.MINTER_ROLE(), otherAccount.address);
      const requestId = await minter.callStatic.mint(owner.address);
      await minter.connect(otherAccount).mint(owner.address);
      const rand = Math.floor(Math.random() * 100000000000000);
      await vrfCoordinator.fulfillRandomWordsWithOverride(
        requestId,
        minter.address,
        [rand],
      );
      await expect(minter.unpack(requestId)).to.emit(taipe, 'Transfer');
      const balance = await taipe.balanceOf(owner.address);
      expect(balance.toNumber()).to.be.greaterThan(0);
    });
    it('minter role should unpack the request into an nft', async () => {
      const { minter, taipe, vrfCoordinator, owner, otherAccount } =
        await loadFixture(deployMinterVRF);
      await minter.grantRole(await minter.MINTER_ROLE(), otherAccount.address);
      const requestId = await minter.callStatic.mint(owner.address);
      await minter.mint(owner.address);
      const rand = Math.floor(Math.random() * 100000000000000);
      await vrfCoordinator.fulfillRandomWordsWithOverride(
        requestId,
        minter.address,
        [rand],
      );
      await expect(minter.connect(otherAccount).unpack(requestId)).to.emit(
        taipe,
        'Transfer',
      );
      const balance = await taipe.balanceOf(owner.address);
      expect(balance.toNumber()).to.be.greaterThan(0);
    });
    it("shouldn't be able to unpack the request if not minter role", async () => {
      const { minter, taipe, vrfCoordinator, owner, otherAccount } =
        await loadFixture(deployMinterVRF);
      const requestId = await minter.callStatic.mint(owner.address);
      await minter.mint(owner.address);
      const rand = Math.floor(Math.random() * 100000000000000);
      await vrfCoordinator.fulfillRandomWordsWithOverride(
        requestId,
        minter.address,
        [rand],
      );
      await expect(
        minter.connect(otherAccount).unpack(requestId),
      ).to.be.revertedWith('VRFMinter: caller does not have permission');
    });
    it("shouldn't mint if the request is not fulfilled", async () => {
      const { minter, owner } = await loadFixture(deployMinterVRF);
      const requestId = await minter.callStatic.mint(owner.address);
      await minter.mint(owner.address);
      await expect(minter.unpack(requestId)).to.be.revertedWith(
        'VRFMinter: request not fulfilled',
      );
    });
    it("shouldn't be able to request nft if not enought tokens left", async () => {
      const { minter, owner, vrfCoordinator } = await loadFixture(
        deployMinterVRF,
      );
      for (let i = 0; i < 25; i++) {
        const requestId = await minter.callStatic.mint(owner.address);
        await minter.mint(owner.address);
        const rand = Math.floor(Math.random() * 100000000000000);
        await vrfCoordinator.fulfillRandomWordsWithOverride(
          requestId,
          minter.address,
          [rand],
        );
        await minter.unpack(requestId);
      }
      await expect(minter.mint(owner.address)).to.be.revertedWith(
        'No available token',
      );
    });
    it("shouldn't be able to request nft if a lot of requests are pending", async () => {
      const { minter, owner, vrfCoordinator } = await loadFixture(
        deployMinterVRF,
      );
      const resquestsIds = [];
      for (let i = 0; i < 25; i++) {
        const requestId = await minter.callStatic.mint(owner.address);
        await minter.mint(owner.address);
        resquestsIds.push(requestId);
      }
      await expect(minter.mint(owner.address)).to.be.revertedWith(
        'No available token',
      );
      for (let requestId of resquestsIds) {
        const rand = Math.floor(Math.random() * 100000000000000);
        await vrfCoordinator.fulfillRandomWordsWithOverride(
          requestId,
          minter.address,
          [rand],
        );
        await minter.unpack(requestId);
      }
    });
  });
});
