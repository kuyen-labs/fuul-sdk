import { UserIdentifierType } from '..';

export type FuulSettings = {
  debug?: boolean;
  apiKey: string;
  baseApiUrl?: string;
  defaultQueryParams?: Record<string, string>;
};

export type IdentifyUserParams = {
  identifier: string;
  identifierType: UserIdentifierType;
  signature?: string;
  message?: string;
  signaturePublicKey?: string;
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
  signaturePublicKey?: string;
  accountChainId?: number;
};
