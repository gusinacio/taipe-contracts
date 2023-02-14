// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./BatchSale.sol";
import "./UniswapConsumer.sol";

contract Tier3SaleV2 is BatchSale, UniswapConsumer {

    function initializeUniswap(
        address _swapRouter,
        address _desiredToken,
        address _priceFeed
    ) public reinitializer(2) {
        UniswapConsumer.initialize(
            _swapRouter,
            _desiredToken,
            _priceFeed
        );
    }
}
