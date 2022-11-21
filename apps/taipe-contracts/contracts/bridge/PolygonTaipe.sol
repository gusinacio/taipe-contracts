// SPDX-License-Identifier: MIT
// Taipe Experience Contracts
pragma solidity ^0.8.9;

import "../nft/TaipeNFT.sol";
import "../lib/TaipeLib.sol";
import "../polygon/IChildToken.sol";

contract PolygonTaipe is TaipeNFT, IChildToken {
    bytes32 public constant DEPOSITOR_ROLE = keccak256("DEPOSITOR_ROLE");

    constructor(address childChainManager) TaipeNFT() {
        _setupRole(DEPOSITOR_ROLE, childChainManager);
    }

    function deposit(address user, bytes calldata depositData)
        external
        override
        onlyRole(DEPOSITOR_ROLE)
    {
        // deposit single
        if (depositData.length == 32) {
            uint tokenId = abi.decode(depositData, (uint));
            _mint(user, tokenId);

            // deposit batch
        } else {
            uint[] memory tokenIds = abi.decode(depositData, (uint[]));
            uint length = tokenIds.length;
            for (uint i; i < length; i++) {
                _mint(user, tokenIds[i]);
            }
        }
    }

    function withdraw(uint tokenId) external {
        require(
            _msgSender() == ownerOf(tokenId),
            "PolygonTaipe: INVALID_TOKEN_OWNER"
        );
        _burn(tokenId);
    }

    function _insideTokenMintCap(uint tokenId)
        internal
        pure
        override
        returns (bool)
    {
        return
            tokenId > TaipeLib.TOTAL_TIER_1 &&
            tokenId <=
            TaipeLib.TOTAL_TIER_1 +
                TaipeLib.TOTAL_TIER_2 +
                TaipeLib.TOTAL_TIER_3;
    }
}
