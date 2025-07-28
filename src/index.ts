import Fuul from './core';

export * from './affiliates/errors';
export type { Conversion } from './types/api';
export type { ConnectWalletEventParams, EventArgs, FuulSettings } from './types/sdk';

export enum BlockchainType {
  Ethereum = 'ethereum',
  Solana = 'solana',
}

export { Fuul };
