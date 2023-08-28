export type EventArgs = {
  [key: string]: unknown;
};

export type UserMetadata = {
  userAddress?: string;
  signature?: string;
  signatureMessage?: string;
};

export type SendEventRequest = {
  name: string;
  user_address?: string;
  signature?: string;
  signature_message?: string;
  event_args?: EventArgs;
  timestamp: number;
  metadata?: {
    referrer?: string | null; // Affiliate_id -> deprected
    affiliate_id?: string | null;
    referrer_url?: string | null;
    project_id?: string;
    tracking_id: string;
    user_address?: string;
    signature?: string;
    signature_message?: string;
    source?: string | null;
    category?: string | null;
    title?: string | null;
    tag?: string | null;
  };
};

export type FuulSettings = {
  baseApiUrl?: string;
  defaultQueryParams?: Record<string, string>;
  debug?: boolean;
};
