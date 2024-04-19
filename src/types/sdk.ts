export type FuulSettings = {
  debug?: boolean;
  apiKey: string;
  baseApiUrl?: string;
  defaultQueryParams?: Record<string, string>;
};

export type UserMetadata = {
  address: string;
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
