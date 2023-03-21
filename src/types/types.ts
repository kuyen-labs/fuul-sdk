export interface SendEventParams {
  name: EventType;
  args?: EventArgsType;
  projectId?: string;
}

export type EventArgsType = {
  [key: string]: string;
  project_id: string;
};

export type EventType = "connect_wallet" | "pageview";

export interface SentEventParams {
  tracking_id: string;
  campaign_id?: string;
  referrer_id?: string;
}

export interface IGenerateTrackingLink {
  address: string;
  cid: string;
  baseUrl?: string;
}
