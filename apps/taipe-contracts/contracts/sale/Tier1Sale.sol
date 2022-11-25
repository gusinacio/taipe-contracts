// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./SaleDrop.sol";
import "../minter/VRFMinter.sol";
import "./BatchSale.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

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
