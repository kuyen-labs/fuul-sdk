import { nanoid } from "nanoid";

import { datesAreOnSameDay } from "./utils/date.js";
import {
  getReferrerId,
  getSessionId,
  getTrackingId,
} from "./utils/localStorage.js";

import {
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

import { HttpClient } from "./infrastructure/http/HttpClient.js";
import { CampaignsService } from "./infrastructure/campaigns/campaignsService.js";
import { CampaignDTO } from "./infrastructure/campaigns/dtos.js";

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
      parsedEvent["project_id"] === params.project_id &&
      parsedEvent["referrer_id"] === params.referrer_id &&
      isSameDay
    );
  }
};

const generateRandomId = () => nanoid();

const saveSessionId = (): void => {
  if (typeof window === "undefined") return;

  localStorage.setItem(SESSION_ID_KEY, generateRandomId());
};

const saveTrackingId = (): void => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const queryParams = new URLSearchParams(window.location.search);

  if (
    !queryParams.has("p") ||
    !queryParams.has("origin") ||
    !queryParams.has("r")
  )
    return;

  const isFuulOrigin = queryParams.get("origin") === "fuul";

  if (!isFuulOrigin) return;

  if (!getTrackingId()) {
    localStorage.setItem(TRACKING_ID_KEY, generateRandomId());
  }

  localStorage.setItem(REFERRER_ID_KEY, queryParams.get("r") ?? "");
};

const buildTrackingLinkQueryParams = (r: string, p: string) => {
  return `p=${p}&origin=fuul&r=${r}`;
};

export class Fuul {
  private readonly apiKey: string;
  private readonly BASE_API_URL: string = "https://api.fuul.xyz/api/v1/";
  private readonly httpClient: HttpClient;
  private campaignsService: CampaignsService;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.checkApiKey();

    saveSessionId();
    saveTrackingId();

    this.httpClient = new HttpClient({
      baseURL: this.BASE_API_URL,
      timeout: 10000,
      apiKey: this.apiKey,
    });

    this.campaignsService = new CampaignsService(this.httpClient);

    this.init();
  }

  async init() {
    globalThis.Fuul = this;

    if (typeof window !== "undefined") {
      await this.sendEvent("pageview");
    }
  }

  checkApiKey(): void {
    if (!this.apiKey) {
      throw new Error("Fuul API key is required");
    }
  }

  /**
   * @param {EventType} name Event name.
   * @param {EventArgsType} args Event additional arguments.
   * ```js
   * import { Fuul } from 'fuul-sdk'
   *
   * // Initialize Fuul in your app root file
   * new Fuul('your-api-key')
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
      if (!referrer_id) return;

      params = {
        ...params,
        referrer_id,
        project_id: args?.project_id,
      };

      reqBody = {
        name,
        session_id,
        event_args: {
          ...args,
          referrer: referrer_id,
          tracking_id,
        },
      };
    }

    if (isEventAlreadySentAndInValidTimestamp(name, params)) return;

    try {
      const PATH = args?.project_id
        ? `events?project_id=${args.project_id}`
        : "events";
      await this.httpClient.post(PATH, reqBody);

      saveSentEvent(name, params);
    } catch (error: any) {
      return error;
    }
  }

  verifyConnection(): void {
    if (typeof window !== undefined && globalThis.Fuul) {
      window.alert("You are successfully connected to Fuul SDK! ✅");
    }
  }

  /**
   * Generates a tracking link for a referrer
   * @param  {string} address referrer address
   * @param  {string} pid project id you want to refer the user
   * @param  {string} baseUrl base url of your app
   * @returns {string} tracking link
   */
  generateTrackingLink({
    address,
    pid,
    baseUrl,
  }: IGenerateTrackingLink): string {
    return `${baseUrl ?? window.location.href}?${buildTrackingLinkQueryParams(
      address,
      pid
    )}`;
  }

  async getAllCampaigns(args?: Record<string, string>): Promise<CampaignDTO[]> {
    return this.campaignsService.getAllCampaignsByProjectId(args);
  }
}

declare module globalThis {
  var Fuul: Fuul;
}

export default {
  Fuul,
};
