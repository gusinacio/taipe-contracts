// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./SaleDrop.sol";
import "../minter/VRFMinter.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Tier3Sale is SaleDrop, AccessControl {
    enum Batch {
        BATCH_1,
        BATCH_2,
        BATCH_3
    }

    mapping(Batch => uint) public batchPrice;
    mapping(Batch => uint) public batchSize;

    uint MAX_INT = 2**256 - 1;

    uint private nftsSold = 0;

    address private feeRecipient;
    VRFMinter private minter;

    constructor(address _minter, address _feeRecipient) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        minter = VRFMinter(_minter);
        feeRecipient = _feeRecipient;
        batchSize[Batch.BATCH_1] = 2500;
        batchSize[Batch.BATCH_2] = 2500;
        batchSize[Batch.BATCH_3] = 2475;

        batchPrice[Batch.BATCH_1] = 55 ether;
        batchPrice[Batch.BATCH_2] = 65 ether;
        batchPrice[Batch.BATCH_3] = 75 ether;
    }

    // ADMIN FUNCTIONS
    function updateBatchPrice(Batch batch, uint price)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        batchPrice[batch] = price;
    }

    function updateBatchSize(Batch batch, uint price)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        batchSize[batch] = price;
    }

    function updateFeeRecipient(address _feeRecipient)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        feeRecipient = _feeRecipient;
    }

    function updateMinter(address _minter)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        minter = VRFMinter(_minter);
    }

    // BUY FUNCTION
    function buy() external payable override {
        require(!isSoldOut(), "Is sold out");
        require(msg.value >= getPrice(), "Not enough token sent");
        require(minter.tokensLeft() > 0, "No more tokens left");
        (bool succeed, bytes memory data) = feeRecipient.call{value: msg.value}(
            ""
        );
        require(succeed, "Failed to transfer");

        minter.mint(msg.sender);
        nftsSold++;
    }

    // VIEW FUNCTIONS

    function isSoldOut() public view override returns (bool) {
        return
            nftsSold >=
            batchSize[Batch.BATCH_1] +
                batchSize[Batch.BATCH_2] +
                batchSize[Batch.BATCH_3];
    }

    function getPrice() public view override returns (uint) {
        if (nftsSold < batchSize[Batch.BATCH_1]) {
            return batchPrice[Batch.BATCH_1];
        } else if (
            nftsSold < batchSize[Batch.BATCH_1] + batchSize[Batch.BATCH_2]
        ) {
            return batchPrice[Batch.BATCH_2];
        } else if (
            nftsSold <
            batchSize[Batch.BATCH_1] +
                batchSize[Batch.BATCH_2] +
                batchSize[Batch.BATCH_3]
        ) {
            return batchPrice[Batch.BATCH_3];
        } else {
            return MAX_INT;
        }
    }

    function getTotalSold() external view override returns (uint) {
        return nftsSold;
    }

    // FALLBACK FUNCTIONS

    function withdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
        (bool succeed, bytes memory data) = feeRecipient.call{
            value: address(this).balance
        }("");
        require(succeed, "Failed to transfer");
    }

    function withdrawERC20(address addr) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20 erc20 = IERC20(addr);
        erc20.transfer(feeRecipient, erc20.balanceOf(address(this)));
    }
}
