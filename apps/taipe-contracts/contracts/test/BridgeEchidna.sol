// SPDX-License-Identifier: MIT
// Taipe Experience Contracts
pragma solidity ^0.8.9;

import "../nft/TaipeNFT.sol";
import "../bridge/EthereumTaipe.sol";
import "../bridge/PolygonTaipe.sol";
import "../minter/VRFMinter.sol";
import "./VRFCoordinatorMock.sol";
import "./BridgeMock.sol";

contract BridgeEchidna {
    EthereumTaipe private ethTaipe;
    PolygonTaipe private polygonTaipe;
    BridgeMock private bridgeMock;

    RandomMinter private tier1;
    RandomMinter private tier2;
    RandomMinter private tier3;
    uint private counter;
    uint private childMintedNotTransfered;

    constructor() {
        bridgeMock = new BridgeMock();
        ethTaipe = new EthereumTaipe(address(bridgeMock));
        polygonTaipe = new PolygonTaipe(address(bridgeMock));

        bridgeMock.setRoot(ethTaipe);
        bridgeMock.setChild(polygonTaipe);

        ethTaipe.setApprovalForAll(address(bridgeMock), true);
        polygonTaipe.setApprovalForAll(address(bridgeMock), true);

        tier1 = new RandomMinter(TaipeLib.Tier.TIER_1, address(ethTaipe));
        tier2 = new RandomMinter(TaipeLib.Tier.TIER_2, address(polygonTaipe));
        tier3 = new RandomMinter(TaipeLib.Tier.TIER_3, address(polygonTaipe));
    }

    function mint_tier_1() public returns (uint) {
        counter++;
        return tier1.mint(address(this));
    }

    function mint_tier_2() public returns (uint) {
        counter++;
        childMintedNotTransfered++;
        return tier2.mint(address(this));
    }

    function mint_tier_3() public returns (uint) {
        counter++;
        childMintedNotTransfered++;
        return tier3.mint(address(this));
    }

    function transfer_to_ethereum(uint tokenId) public {
        polygonTaipe.withdraw(tokenId);
        childMintedNotTransfered--;
        bridgeMock.transfer_to_ethereum(tokenId, address(this));
    }

    function transfer_to_polygon(uint tokenId) public {
        bridgeMock.transfer_to_polygon(tokenId, address(this));
    }

    function echidna_balance_total_supply() public view returns (bool) {
        return (polygonTaipe.totalSupply() -
            ethTaipe.balanceOf(address(this)) ==
            childMintedNotTransfered);
    }

    function echidna_market_cap() public view returns (bool) {
        return (ethTaipe.totalSupply() +
            polygonTaipe.totalSupply() -
            ethTaipe.balanceOf(address(this)) ==
            counter);
    }
}
