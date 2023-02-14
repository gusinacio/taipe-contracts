export type Network = {
    chainId: number;
    rpcUrl: string;
    network: string;
    nativeCurrencySymbol: string;
    nativeCurrencyName: string;
    decimals: string;
    blockExplorerUrl: string;
    blockTime: number;
  };
  
  export const networks: Network[] = [
    {
      chainId: 1,
      rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/f8SO_6hq10Fo-1zA5EONkHVzNGV9cnyj',
      network: 'Ethereum Mainnet',
      nativeCurrencySymbol: 'ETH',
      nativeCurrencyName: 'Ether',
      decimals: '18',
      blockExplorerUrl: 'https://etherscan.io',
      blockTime: 15,
    },
    {
      chainId: 5,
      rpcUrl: "https://eth-goerli.g.alchemy.com/v2/-4M5B1hnL20YibBoRBV-2uWNLzE-VnSa",
      network: 'Goerli Test Network',
      nativeCurrencySymbol: 'GoerliETH',
      nativeCurrencyName: 'Ether',
      decimals: '18',
      blockExplorerUrl: 'https://goerli.etherscan.io',
      blockTime: 15,
    },
    {
      chainId: 137,
      rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/z-e8Hb4SeyV5cbFzmFOuVBkFH1MRzKGv',
      network: 'Polygon Mainnet',
      nativeCurrencySymbol: 'MATIC',
      nativeCurrencyName: 'Matic',
      decimals: '18',
      blockExplorerUrl: 'https://polygonscan.com/',
      blockTime: 3,
    },
    {
      chainId: 80001,
      rpcUrl: 'https://polygon-mumbai.g.alchemy.com/v2/z8FoavihmhLT_N8hJ1yD5os0jsy6rkQW',
      network: 'Mumbai',
      nativeCurrencySymbol: 'MATIC',
      nativeCurrencyName: 'Matic',
      decimals: '18',
      blockExplorerUrl: 'https://mumbai.polygonscan.com/',
      blockTime: 3,
    },
  ];
  
  export const getNetworkConfig = (chainId: number): Network =>
    networks.find((n) => n.chainId === chainId) as Network;