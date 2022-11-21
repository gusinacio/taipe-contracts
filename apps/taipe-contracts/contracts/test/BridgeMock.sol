// SPDX-License-Identifier: MIT
// Taipe Experience Contracts
pragma solidity ^0.8.9;

import "../nft/TaipeNFT.sol";
import "../bridge/EthereumTaipe.sol";
import "../bridge/PolygonTaipe.sol";
import "../minter/VRFMinter.sol";
import "./VRFCoordinatorMock.sol";

contract BridgeMock {
    EthereumTaipe private root;
    PolygonTaipe private child;

    function setRoot(EthereumTaipe _root) public {
        root = _root;
    }

    function setChild(PolygonTaipe _child) public {
        child = _child;
    }

    function transfer_to_ethereum(uint tokenId, address to) public {
        require(
            child.ownerOf(tokenId) ==
                0x0000000000000000000000000000000000000000,
            "BridgeMock: not burned"
        );
        root.mint(to, tokenId);
    }

    function transfer_to_polygon(uint tokenId, address to) public {
        root.transferFrom(to, address(this), tokenId);
        child.deposit(to, abi.encodePacked((tokenId)));
    }
}
