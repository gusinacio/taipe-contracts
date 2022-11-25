// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./BatchSale.sol";

contract Tier3Sale is BatchSale {
    constructor(
        address _minter,
        address _feeRecipient
    ) BatchSale(_minter, _feeRecipient) {
        _setupBatch(2500, MAX_INT, 60 ether);
        _setupBatch(2500, MAX_INT, 70 ether);
        _setupBatch(2475, MAX_INT, 80 ether);
    }
}
