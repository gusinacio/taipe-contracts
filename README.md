# Taipe Experience Contracts
This repository contains the source code of the Taipe Experience Contracts. Taipe Experience is a NFT project multi-chain, with the aim of creating a unique experience for the user, through the creation of NFTs that are not only unique but also have a unique experience.

## Contracts

- EthereumTaipe - Ethereum instance of the ERC721 contract for working with Polygon Bridge
- PolygonTaipe - Polygon instance of the ERC721 contract for working with Polygon Bridge
- VRFMinter - Contract for minting NFTs with VRF from Chainlink
- BatchSale - Contract for batch sales of NFTs that communicates with the VRFMinter contract
- UniswapConsumer - Contract for swapping tokens with Uniswap
- TaipeSplitter - Contract for splitter with all parties


The ERC721 contract is compatible with the OperatorFilterer interface from Opensea. The Batchsale contract is upgradable and can be used with the OpenZeppelin Upgrades plugin.