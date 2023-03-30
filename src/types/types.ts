export interface SendEventParams {
  name: EventType;
  args?: EventArgsType;
}

export type EventArgsType = {
  [key: string]: string;
};

export type FuulSettings = {
  [key: string]: string;
};

export type EventType = "connect_wallet" | "pageview";

export interface SentEventParams {
  tracking_id: string;
  project_id?: string;
  referrer_id?: string;
}

export interface IGenerateTrackingLink {
  address: string;
  pid: string;
  baseUrl?: string;
}
