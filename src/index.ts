import axios from "axios";
import { nanoid } from "nanoid";

import { EventArgsType, EventType, SentEventParams } from "./types/types.js";
import { datesAreOnSameDay } from "./utils/date.js";

const SESSION_ID_KEY = "fuul.session_id";
const TRACKING_ID_KEY = "fuul.tracking_id";
const CAMPAIGN_ID_KEY = "fuul.campaign_id";
const REFERRER_ID_KEY = "fuul.referrer_id";
const SENT_EVENT_ID_KEY = "fuul.sent";

const getSessionId = () => localStorage.getItem(SESSION_ID_KEY);
const getTrackingId = () => localStorage.getItem(TRACKING_ID_KEY);
const getCampaignId = () => localStorage.getItem(CAMPAIGN_ID_KEY);
const getReferrerId = () => localStorage.getItem(REFERRER_ID_KEY);

export class Fuul {
  private projectId: string | undefined;
  private BASE_API_URL: string = "https://api.fuul.xyz/api/v1";

  constructor(projectId?: string) {
    this.projectId = projectId;

    this.saveSessionId();
    this.saveTrackingId();
  }

  private generateRandomId() {
    return nanoid();
  }

  async sendEvent(name: EventType, args?: EventArgsType) {
    const session_id = getSessionId();
    const tracking_id = getTrackingId();
    const campaign_id = getCampaignId();
    const referrer_id = getReferrerId();

    if (!tracking_id) return;

    let params: SentEventParams = {
      tracking_id,
    };

    let reqBody = {};

    if (name === "connect_wallet") {
      reqBody = {
        name,
        session_id,
        event_args: {
          ...args,
          tracking_id,
        },
      };
    } else {
      if (!campaign_id || !referrer_id) return;

      params = {
        ...params,
        referrer_id,
        campaign_id,
      };

      reqBody = {
        name,
        session_id,
        project_id: this.projectId ?? args?.project_id,
        event_args: {
          ...args,
          referrer: referrer_id,
          campaign_id,
          tracking_id,
        },
      };
    }

    if (this.isEventAlreadySentAndInValidTimestamp(name, params)) return;

    const url = `${this.BASE_API_URL}/events`;

    try {
      const response = await axios.post(url, reqBody);

      this.saveSentEvent(name, params);

      return response.data;
    } catch (error) {
      return error;
    }
  }

  private isEventAlreadySentAndInValidTimestamp(
    eventName: EventType,
    params: SentEventParams
  ): boolean {
    const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_${eventName}`;
    const storedEvent = localStorage.getItem(SENT_EVENT_KEY);

    if (!storedEvent) return false;

    const parsedEvent = JSON.parse(storedEvent);

    const isSameDay = datesAreOnSameDay(
      new Date(Date.now()),
      new Date(parsedEvent.timestamp)
    );

    if (eventName === "connect_wallet") {
      return parsedEvent["tracking_id"] === params.tracking_id && isSameDay;
    } else {
      return (
        parsedEvent["tracking_id"] === params.tracking_id &&
        parsedEvent["campaign_id"] === params.campaign_id &&
        parsedEvent["referrer_id"] === params.referrer_id &&
        isSameDay
      );
    }
  }

  private saveSentEvent(eventName: string, params: SentEventParams): void {
    const timestamp = Date.now();

    const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_${eventName}`;
    const eventParams = { ...params, timestamp };

    localStorage.setItem(SENT_EVENT_KEY, JSON.stringify(eventParams));
  }

  private saveSessionId(): void {
    if (typeof window === "undefined") return;

    localStorage.setItem(SESSION_ID_KEY, this.generateRandomId());
  }

  private saveTrackingId(): void {
    if (typeof window === "undefined" || typeof document === "undefined")
      return;

    const queryParams = new URLSearchParams(window.location.search);

    if (
      !queryParams.has("c") ||
      !queryParams.has("origin") ||
      !queryParams.has("r")
    )
      return;

    const isFuulOrigin = queryParams.get("origin") === "fuul";

    if (!isFuulOrigin) return;

    if (!getTrackingId()) {
      localStorage.setItem(TRACKING_ID_KEY, this.generateRandomId());
    }

    localStorage.setItem(CAMPAIGN_ID_KEY, queryParams.get("c") ?? "");
    localStorage.setItem(REFERRER_ID_KEY, queryParams.get("r") ?? "");
  }
}

export default {
  Fuul,
};
