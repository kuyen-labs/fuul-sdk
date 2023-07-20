export interface SendEventMetadataRequest {
  referrer?: string;
  project_id?: string;
  tracking_id: string;
  source?: string;
  category?: string;
  title?: string;
  tag?: string;
}

export interface SendEventRequest {
  name: string;
  session_id: string;
  event_args: EventArgs;
  user_address?: string;
  metadata: SendEventMetadataRequest;
  signature?: string;
  signatureMessage?: string;
}

export interface SendEventArgs {
  args?: EventArgs;
  userAddress?: string; 
  signature?: string; 
  signatureMessage?: string;
  projectId?: string;
}

export type EventArgs = {
  [key: string]: string;
};

export type FuulSettings = {
  [key: string]: string | Record<string, string>;
};

export interface IGenerateTrackingLink {
  address: string;
  projectId: string;
  baseUrl?: string;
}
