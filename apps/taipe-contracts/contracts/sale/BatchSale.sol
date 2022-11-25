// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./SaleDrop.sol";
import "../minter/VRFMinter.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

abstract contract BatchSale is SaleDrop, AccessControl {
    struct BatchInfo {
        uint price;
        uint size;
        uint expiration;
    }

    event BatchChange(uint indexed newBatch);
    event Sale(
        address indexed buyer,
        uint currentBatch,
        uint price,
        uint requestId
    );

    mapping(uint => BatchInfo) public batchInfo;

    uint public totalBatches;
    uint public totalSize;

    uint MAX_INT = type(uint).max;

    uint public currentBatch = 0;
    uint private nftsSold = 0;

    address public feeRecipient;
    VRFMinter public minter;

    constructor(address _minter, address _feeRecipient) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        minter = VRFMinter(_minter);
        feeRecipient = _feeRecipient;
    }

    function _setupBatch(uint _size, uint _expiration, uint _price) internal {
        uint batch = totalBatches++;
        batchInfo[batch] = BatchInfo({
            price: _price,
            expiration: _expiration,
            size: _size
        });
        totalSize += _size;
    }

    function checkForBatchChange() internal {
        BatchInfo storage batch = batchInfo[currentBatch];
        if (batch.size == 0 || batch.expiration > block.timestamp) {
            changeBatch();
        }
    }

    function changeBatch() internal {
        currentBatch++;
        emit BatchChange(currentBatch);
    }

    // ADMIN FUNCTIONS
    function updateBatch(
        uint _batch,
        uint _price,
        uint _size,
        uint _expiration
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            _batch > currentBatch && _batch < totalBatches,
            "Must be a future batch index"
        );
        batchInfo[_batch] = BatchInfo({
            price: _price,
            expiration: _expiration,
            size: _size
        });
    }

    function updateFeeRecipient(
        address _feeRecipient
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        feeRecipient = _feeRecipient;
    }

    function updateMinter(
        address _minter
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        minter = VRFMinter(_minter);
    }

    // BUY FUNCTION
    function buy() external payable override {
        // checks
        uint price = getPrice();
        require(!isSoldOut(), "Is sold out");
        require(msg.value >= price, "Not enough token sent");
        (bool succeed, ) = feeRecipient.call{value: msg.value}("");
        require(succeed, "Failed to transfer");

        // effects
        batchInfo[currentBatch].size--;
        nftsSold++;
        checkForBatchChange();
        // interactions
        uint requestId = minter.mint(_msgSender());
        emit Sale(_msgSender(), currentBatch, price, requestId);
    }

    function expireCurrentBatch() external {
        BatchInfo storage batch = batchInfo[currentBatch];
        require(batch.expiration > block.timestamp, "Batch did not expire");
        changeBatch();
    }

    // VIEW FUNCTIONS

    function isSoldOut() public view override returns (bool) {
        return nftsSold >= totalSize || minter.tokensLeft() == 0;
    }

    function getPrice() public view override returns (uint) {
        if (currentBatch < totalBatches) {
            return batchInfo[currentBatch].price;
        } else {
            return MAX_INT;
        }
    }

    function getTotalSold() external view override returns (uint) {
        return nftsSold;
    }

    // FALLBACK FUNCTIONS

    function withdraw() external onlyRole(DEFAULT_ADMIN_ROLE) {
        (bool succeed, ) = feeRecipient.call{value: address(this).balance}("");
        require(succeed, "Failed to transfer");
    }

    function withdrawERC20(address addr) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20 erc20 = IERC20(addr);
        erc20.transfer(feeRecipient, erc20.balanceOf(address(this)));
    }
}
