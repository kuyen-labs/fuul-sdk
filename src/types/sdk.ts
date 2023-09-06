export type UserMetadata = {
  userAddress: string;
  signature?: string;
  signatureMessage?: string;
};

export type EventArgs = {
  [key: string]: unknown;
};

export type FuulSettings = {
  debug?: boolean;
  apiKey: string;
  baseApiUrl?: string;
  defaultQueryParams?: Record<string, string>;
};
