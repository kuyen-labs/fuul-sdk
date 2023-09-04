export type FuulEventArgs = {
  [key: string]: unknown;
};

export type FuulEventMetadata = {
  tracking_id: string;
  referrer?: string; // Deprecated
  affiliate_id?: string;
  referrer_url?: string;
  project_id?: string;
  user_address?: string;
  source?: string;
  category?: string;
  title?: string;
  tag?: string;
};

export type FuulEvent = {
  name: string;
  user_address?: string;
  signature?: string;
  signature_message?: string;
  event_args?: FuulEventArgs;
  metadata: FuulEventMetadata;
};
