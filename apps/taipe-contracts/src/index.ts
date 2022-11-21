export * from '../typechain-types';

export enum Network {
  Goerli = 5,
  Mumbai = 80001,
  Polygon = 137,
  Ethereum = 1,
}

export enum Tier {
  Tier1 = 0,
  Tier2 = 1,
  Tier3 = 2,
}

export const TAIPE_ADDRESS: { [key in Network]: string } = {
  [Network.Goerli]: '0x94E45dCE34b3030dEDdB72C2D41f20444ef5D4CE',
  [Network.Mumbai]: '0xe2118B9EBC0217eEe5D56b2D11198363D66358AE',
  [Network.Polygon]: '0xD67fd42025127D3248a81f2CEAB1E82b935b75DA',
  [Network.Ethereum]: '0x99F3C49B5095D96195Ef34D224d2C019Fd7b2512',
};

export const TIER1_MINTER_ADDRESS = {
  [Network.Goerli]: '0x685870b969fEE866C0c4Acef1dCF70DDE79FdE21',
  [Network.Ethereum]: '0xEF5Ea27ea5a3A97Fdb3d670152A12e1c64778d9d',
};

export const TIER2_MINTER_ADDRESS = {
  [Network.Mumbai]: '0xbc3F11b45e2c479f50e5F968590B6A92d72402D3',
  [Network.Polygon]: '0x366F12E5181d801eC5642984Bc1fC381E6526443',
};

export const TIER3_MINTER_ADDRESS = {
  [Network.Mumbai]: '0xAdCc8688C19999E2882a98D5956E0E68F978eD43',
  [Network.Polygon]: '0xA05240DD88B3D579ab98Dcdca3F07eb9231e0089',
};
export const MINTER_ADDRESS = {
  [Tier.Tier1]: TIER1_MINTER_ADDRESS,
  [Tier.Tier2]: TIER2_MINTER_ADDRESS,
  [Tier.Tier3]: TIER3_MINTER_ADDRESS,
};

export const FEE_RECIPIENT_ADDRESS: { [key in Network]: string } = {
  [Network.Goerli]: '0x22a9Bc85d6a41eA1A842F5165e04bC6f0cD15EF5',
  [Network.Mumbai]: '0x7642D005b903127075bB17C14f2bB28088E5B17c',
  [Network.Polygon]: '0x1D449CcF8c61748f4c633EEBDA62efCd93F4afEB',
  [Network.Ethereum]: '0xC2c179B207fc6ACf5D6AfDd75aC69C19ecB909f1',
};
