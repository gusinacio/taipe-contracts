import { RelayerParams } from 'defender-relay-client';
import {
  DefenderRelayProvider,
  DefenderRelaySigner
} from 'defender-relay-client/lib/ethers';
import { Network } from '../../src';

export function isPolygonNetwork(network: Network): boolean {
  return network === Network.Mumbai || network === Network.Polygon;
}

export function isEthereumNetwork(network: Network): boolean {
  return network === Network.Goerli || network === Network.Ethereum;
}

export function getRelayerSigner(network: Network): DefenderRelaySigner {
  const networkName = Network[network];
  const apiKey = process.env[`${networkName.toUpperCase()}_RELAYER_API_KEY`];
  const apiSecret =
    process.env[`${networkName.toUpperCase()}_RELAYER_SECRET_KEY`];
  if (!apiKey || !apiSecret) {
    throw new Error(
      'RELAYER_API_KEY or RELAYER_SECRET_KEY not set for network ' + network,
    );
  }
  const credentials: RelayerParams = {
    apiKey,
    apiSecret,
  };
  const provider = new DefenderRelayProvider(credentials);
  const signer = new DefenderRelaySigner(credentials, provider, {
    speed: 'average',
  });
  return signer;
}
