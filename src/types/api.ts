export type FuulEventArgs = {
  [key: string]: unknown;
};

export type FuulEventMetadata = {
  tracking_id: string;
  referrer?: string | null; // Deprecated
  affiliate_id?: string | null;
  referrer_url?: string | null;
  project_id?: string | null;
  user_address?: string | null;
  source?: string | null;
  category?: string | null;
  title?: string | null;
  tag?: string | null;
};

export type FuulEvent = {
  name: string;
  user_address?: string;
  signature?: string;
  signature_message?: string;
  event_args?: FuulEventArgs;
  metadata?: FuulEventMetadata;
};
