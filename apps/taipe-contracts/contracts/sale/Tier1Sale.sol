// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./BatchSale.sol";

contract Tier1Sale is BatchSale {
    constructor(
        address _minter,
        address _feeRecipient
    ) BatchSale(_minter, _feeRecipient) {
        _setupBatch(5, MAX_INT, 1.25 ether);
        _setupBatch(5, MAX_INT, 1.25 ether);
        _setupBatch(4, MAX_INT, 1.25 ether);
    }
}
