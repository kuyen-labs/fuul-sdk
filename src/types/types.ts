export type EventArgsType = {
  [key: string]: string;
};

export type EventType = "connect_wallet" | "pageview";

export interface SentEventParams {
  tracking_id: string;
  campaign_id?: string;
  referrer_id?: string;
}
