import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('Splitter', () => {
  async function deploySplitter() {
    const [owner, otherAccount] = await ethers.getSigners();

    const Splitter = await ethers.getContractFactory('TaipeSplitterPolygon');
    const splitter = await Splitter.deploy();

    return { splitter, owner, otherAccount };
  }

  describe('Deployment', () => {
    it('Should deploy with the right amount of shares', async () => {
      const { splitter } = await loadFixture(deploySplitter);
      expect(await splitter.totalShares()).to.equal(100000);
    });
  });

  describe('Splitting', () => {
    it('Should split the amount correctly', async () => {
      const { splitter, owner } = await loadFixture(
        deploySplitter,
      );

      const value = ethers.utils.parseEther('1');

      await owner.sendTransaction({
        to: splitter.address,
        value: value,
      });

      expect(await splitter['totalReleased()']()).to.be.eq(0);

      const contractBalance = await splitter.provider.getBalance(
        splitter.address,
      );

      expect(contractBalance).to.be.eq(value);

      const releasable = await splitter['releasable(address)']("0xaE6f962b55Ae4f654144c017EF9E183D7f0B1f62")
      const twoPercent = value.mul(2).div(100);

      expect(releasable).to.be.eq(twoPercent);

    });
    it('After the release should be 0', async () => {
        const { splitter, owner } = await loadFixture(
            deploySplitter,
          );
    
          const value = ethers.utils.parseEther('1');
    
          await owner.sendTransaction({
            to: splitter.address,
            value: value,
          });
    
          const addr = "0xaE6f962b55Ae4f654144c017EF9E183D7f0B1f62"

          const releasable = await splitter['releasable(address)'](addr)
          const twoPercent = value.mul(2).div(100);
    
          expect(releasable).to.be.eq(twoPercent);
          const balanceBefore = await splitter.provider.getBalance(addr);

          const tx = await splitter['release(address)'](addr);
          tx.wait();

          const balanceOfAddr = await splitter.provider.getBalance(addr);
          const releasableAfter = await splitter['releasable(address)'](addr)

          expect(balanceOfAddr).to.be.eq(balanceBefore.add(twoPercent));
          expect(releasableAfter).to.be.eq(0);
    });
  });
});
