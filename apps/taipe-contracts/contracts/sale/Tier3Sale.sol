// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./BatchSale.sol";
import "./UniswapConsumer.sol";

contract Tier3Sale is BatchSale, UniswapConsumer {
    constructor(
        address _minter,
        address _feeRecipient,
        address _swapRouter,
        address _desiredToken,
        address _priceFeed
    )
        BatchSale(_minter, _feeRecipient)
        UniswapConsumer(_swapRouter, _desiredToken, _priceFeed)
    {
        _setupBatch(2500, MAX_INT, 60 ether);
        _setupBatch(2500, MAX_INT, 70 ether);
        _setupBatch(2475, MAX_INT, 80 ether);
    }
}
