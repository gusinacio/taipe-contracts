// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./BatchSale.sol";
import "./UniswapConsumer.sol";

contract Tier1Sale is BatchSale, UniswapConsumer {
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
        _setupBatch(5, MAX_INT, 1.25 ether);
        _setupBatch(5, MAX_INT, 1.25 ether);
        _setupBatch(4, MAX_INT, 1.25 ether);
    }
}
