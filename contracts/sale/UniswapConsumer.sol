// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./BatchSale.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "../interfaces/IWETH9.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IPeripheryImmutableState.sol";
import "@chainlink/contracts/src/v0.4/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

abstract contract UniswapConsumer is AccessControlUpgradeable, UUPSUpgradeable {
    address public NATIVE_TOKEN;
    address public DESIRED_TOKEN;
    uint24 public poolFee;

    ISwapRouter public swapRouter;

    AggregatorV3Interface internal priceFeed;

    function initialize(
        address _swapRouter,
        address _desiredToken,
        address _priceFeed
    ) internal virtual onlyInitializing {
        swapRouter = ISwapRouter(_swapRouter);
        NATIVE_TOKEN = IPeripheryImmutableState(_swapRouter).WETH9();
        DESIRED_TOKEN = _desiredToken;
        priceFeed = AggregatorV3Interface(_priceFeed);
        poolFee = 500;
    }

    function updatePriceFeed(
        address _priceFeed
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function updateDesiredToken(
        address _desiredToken
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        DESIRED_TOKEN = _desiredToken;
    }

    function updatePoolFee(
        uint24 _poolFee
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        poolFee = _poolFee;
    }

    function swapTokenToDesired(
        uint amountIn,
        address token
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint amountOutMinimum = 0;

        swap(amountIn, token, DESIRED_TOKEN, poolFee, amountOutMinimum);
    }

    function swapNativeToDesired(
        uint amountIn
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IWETH9(NATIVE_TOKEN).deposit{value: amountIn}();
        uint8 decimals = priceFeed.decimals();
        uint amountOutMinimum = (amountIn / uint(getLatestPrice())) *
            (10 ** decimals);
        amountOutMinimum -= amountOutMinimum / 100 * 1; // 1% slippage
        swap(amountIn, address(NATIVE_TOKEN), DESIRED_TOKEN, poolFee, amountOutMinimum);
    }

    function swap(
        uint _amountIn,
        address _tokenIn,
        address _tokenOut,
        uint24 _poolFee,
        uint _amountOutMinimum
    ) internal returns (uint amountOut) {
        TransferHelper.safeApprove(_tokenIn, address(swapRouter), _amountIn);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: _tokenIn,
                tokenOut: _tokenOut,
                fee: _poolFee,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: _amountIn,
                amountOutMinimum: _amountOutMinimum,
                sqrtPriceLimitX96: 0
            });

        // The call to `exactInputSingle` executes the swap.
        amountOut = swapRouter.exactInputSingle(params);
    }

    function getLatestPrice() public view returns (int) {
        (
            ,
            /*uint80 roundID*/
            int price /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/,
            ,
            ,

        ) = priceFeed.latestRoundData();
        return price;
    }
}
