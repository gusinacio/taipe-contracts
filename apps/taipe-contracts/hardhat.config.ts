import * as dotenv from 'dotenv';

import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-abi-exporter';
import { HardhatUserConfig } from 'hardhat/config';
import { getNetworkConfig } from 'shared';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.9',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  abiExporter: {
    clear: true,
    only: [
      'BatchSale'
    ],
  },

  networks: {
    mainnet: {
      url: getNetworkConfig(1).rpcUrl,
    },
    polygon: {
      url: getNetworkConfig(137).rpcUrl,
    },
    goerli: {
      url: getNetworkConfig(5).rpcUrl,
    },
    polygonMumbai: {
      url: getNetworkConfig(80001).rpcUrl,
    },
  },
  etherscan: {
    apiKey: {
      goerli: process.env.GOERLI_ETHERSCAN_API_KEY || '',
      polygonMumbai: process.env.MUMBAI_ETHERSCAN_API_KEY || '',
      mainnet: process.env.ETHEREUM_ETHERSCAN_API_KEY || '',
      polygon: process.env.POLYGON_ETHERSCAN_API_KEY || '',
    },
  },
  gasReporter: {
    enabled: true,
  },
};

export default config;
