import { UserIdentifierType } from '..';

export type FuulSettings = {
  debug?: boolean;
  apiKey: string;
  baseApiUrl?: string;
  defaultQueryParams?: Record<string, string>;
};

export type ConnectWalletEventParams = {
  userIdentifier: string;
  identifierType: UserIdentifierType;
  signature?: string;
  message?: string;
  accountChainId?: number;
};

export type EventArgs = {
  [key: string]: unknown;
};

export type AffiliateLinkParams = {
  title?: string;
  format?: string;
  place?: string;
};

export type AffiliateCodeParams = {
  userIdentifier: string;
  identifierType: UserIdentifierType;
  code: string;
  signature: string;
  accountChainId?: number;
};
