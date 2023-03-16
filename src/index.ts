import axios from "axios";
import { nanoid } from "nanoid";

import { datesAreOnSameDay } from "./utils/date.js";
import {
  getCampaignId,
  getReferrerId,
  getSessionId,
  getTrackingId,
} from "./utils/localStorage.js";

import {
  CAMPAIGN_ID_KEY,
  REFERRER_ID_KEY,
  SENT_EVENT_ID_KEY,
  SESSION_ID_KEY,
  TRACKING_ID_KEY,
} from "./constants.js";

import {
  EventArgsType,
  EventType,
  IGenerateTrackingLink,
  SentEventParams,
} from "./types/types.js";

const saveSentEvent = (eventName: string, params: SentEventParams): void => {
  const timestamp = Date.now();

  const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_${eventName}`;
  const eventParams = { ...params, timestamp };

  localStorage.setItem(SENT_EVENT_KEY, JSON.stringify(eventParams));
};

const isEventAlreadySentAndInValidTimestamp = (
  eventName: EventType,
  params: SentEventParams
): boolean => {
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
};

const generateRandomId = () => {
  return nanoid();
};

const saveSessionId = (): void => {
  if (typeof window === "undefined") return;

  localStorage.setItem(SESSION_ID_KEY, generateRandomId());
};

const saveTrackingId = (): void => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

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
    localStorage.setItem(TRACKING_ID_KEY, generateRandomId());
  }

  localStorage.setItem(CAMPAIGN_ID_KEY, queryParams.get("c") ?? "");
  localStorage.setItem(REFERRER_ID_KEY, queryParams.get("r") ?? "");
};

const buildTrackingLinkQueryParams = (r: string, c: string) => {
  return `c=${c}&origin=fuul&r=${r}`;
};

export class Fuul {
  private projectId?: string;
  private BASE_API_URL: string = "https://api.fuul.xyz/api/v1";

  constructor(projectId?: string) {
    this.projectId = projectId;

    saveSessionId();
    saveTrackingId();

    globalThis.Fuul = this;
  }

  /**
   * @param {EventType} name Event name.
   * @param {EventArgsType} args Event additional arguments.
   * ```js
   * import { Fuul } from 'fuul-sdk'
   *
   * // Initialize Fuul in your app root file
   * new Fuul('your-project-id')
   *
   * // Then you can send an event as follows:
   * fuul.sendEvent('connect_wallet', {
   *    address,
   *    ...args
   * })
   * ```
   */
  async sendEvent(name: EventType, args?: EventArgsType): Promise<any> {
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

    if (isEventAlreadySentAndInValidTimestamp(name, params)) return;

    const url = `${this.BASE_API_URL}/events`;

    try {
      const response = await axios.post(url, reqBody);

      saveSentEvent(name, params);

      return response.data;
    } catch (error) {
      return error;
    }
  }

  verifyConnection(): void {
    if (window !== undefined && globalThis.Fuul) {
      window.alert("You are successfully connected to Fuul SDK! ✅");
    }
  }

  /**
   * Generates a tracking link for a referrer
   * @param  {string} address referrer address
   * @param  {string} cid campaign id you want to refer the user
   * @param  {string} baseUrl base url of your app
   * @returns {string} tracking link
   */
  generateTrackingLink({
    address,
    cid,
    baseUrl,
  }: IGenerateTrackingLink): string {
    return `${baseUrl ?? window.location.href}?${buildTrackingLinkQueryParams(
      address,
      cid
    )}`;
  }
}

declare module globalThis {
  var Fuul: Fuul;
}

export default {
  Fuul,
};
