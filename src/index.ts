import Fuul from './core';

export * from './affiliates/errors';
export type { Conversion } from './types/api';
export type { ConnectWalletEventParams, EventArgs, FuulSettings } from './types/sdk';

export enum UserIdentifierType {
  EvmAddress = 'evm_address',
  SolanaAddress = 'solana_address',
  Email = 'email',
}

export { Fuul };
