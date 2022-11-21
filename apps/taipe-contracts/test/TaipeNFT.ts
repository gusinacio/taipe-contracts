import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Tier } from './utils/utils';

describe('TaipeNFT', () => {

  async function deployTaipeNft() {
    const [owner, otherAccount] = await ethers.getSigners();

    const TaipeNFT = await ethers.getContractFactory('TaipeNFT');
    const taipe = await TaipeNFT.deploy();

    return { taipe, owner, otherAccount };
  }

  async function deployMinter() {
    const [owner, otherAccount] = await ethers.getSigners();

    const TaipeNFT = await ethers.getContractFactory('TaipeNFT');
    const taipe = await TaipeNFT.deploy();

    const RandomMinter = await ethers.getContractFactory('RandomMinter');
    const minter = await RandomMinter.deploy(Tier.Tier1, taipe.address);

    await taipe.grantRole(await taipe.MINTER_ROLE(), owner.address);

    return { taipe, minter, owner, otherAccount };
  }

  describe('Deployment', () => {
    it('Should deploy the right amount of NFTs for Ethereum deployment', async () => {
      const { taipe } = await loadFixture(deployTaipeNft);
      expect(await taipe.totalSupply()).to.equal(0);
    });
  });

  describe('Mint', () => {
    describe('Minter Role', () => {
      it('Should mint a nft', async () => {
        const { taipe, owner } = await loadFixture(deployMinter);

        const mintedNft = await taipe.mintTo(owner.address, 5);
        const rc = await mintedNft.wait();
        const event = rc.events?.find((event) => event.event === 'Transfer');
        const [_from, _to, nftId] = event?.args!;

        const expectedOwner = await taipe.ownerOf(nftId);
        expect(expectedOwner).to.be.eq(owner.address);
      });
      it('Should not mint the NFT', async () => {
        const { taipe, owner, otherAccount } = await loadFixture(deployMinter);
        expect(
          taipe.connect(otherAccount).mintTo(owner.address, 10),
        ).to.be.revertedWith('Only minters can mint tokens');
      });
    });
  });
});
