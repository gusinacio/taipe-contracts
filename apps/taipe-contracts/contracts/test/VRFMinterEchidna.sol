// SPDX-License-Identifier: MIT
// Taipe Experience Contracts
pragma solidity ^0.8.9;

import "../nft/TaipeNFT.sol";
import "../minter/VRFMinter.sol";
import "./VRFCoordinatorMock.sol";

contract MinterEchidna {
    TaipeNFT private nft;
    VRFMinter private minter;
    VRFCoordinatorV2Mock private coordinator;
    uint96 constant baseFee = 1000;
    uint96 constant gasPriceLink = 1000;
    bytes32 constant keyHash =
        0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc;
    uint96 constant fundAmount = 1000000000000000000;

    uint private requests;
    uint private unpacked;

    constructor() {
        nft = new TaipeNFT();
        coordinator = new VRFCoordinatorV2Mock(baseFee, gasPriceLink);
        uint64 subscriptionId = coordinator.createSubscription();
        coordinator.fundSubscription(subscriptionId, fundAmount);

        minter = new VRFMinter(
            TaipeLib.Tier.TIER_1,
            address(nft),
            address(coordinator),
            subscriptionId,
            keyHash
        );
        nft.grantRole(nft.MINTER_ROLE(), address(this));
        nft.grantRole(nft.MINTER_ROLE(), address(minter));
    }

    function mint(address to) public {
        minter.mint(to);
        requests++;
    }

    function unpack(uint96 requestId) public {
        minter.unpack(requestId);
        unpacked++;
    }

    function fulfillRequest(
        uint96 requestId,
        address consumer,
        uint[] memory randomness
    ) public {
        coordinator.fulfillRandomWordsWithOverride(
            requestId,
            consumer,
            randomness
        );
    }

    function echidna_check_total_supply() public view returns (bool) {
        return (nft.totalSupply() == unpacked);
    }

    function echidna_check_tokens_left() public view returns (bool) {
        return (minter.tokensLeft() == 25 - requests);
    }
}
