import { nanoid } from "nanoid";

import {
  getReferrerId,
  getSessionId,
  getTrackingId,
  getTrafficCategory,
  getTrafficSource,
  getTrafficTag,
  getTrafficTitle,
} from "./utils/localStorage.js";

import {
  REFERRER_ID_KEY,
  SENT_EVENT_ID_KEY,
  SESSION_ID_KEY,
  TRACKING_ID_KEY,
  SENT_EVENT_VALIDITY_PERIOD_MS,
  TRAFFIC_SOURCE_KEY,
  TRAFFIC_CATEGORY_KEY,
  TRAFFIC_TITLE_KEY,
  TRAFFIC_TAG_KEY,
  SEARCH_ENGINE_URLS,
} from "./constants.js";

import {
  EventArgsType,
  EventType,
  FuulSettings,
  SentEventParams,
} from "./types/types.js";

import { HttpClient } from "./infrastructure/http/HttpClient.js";
import { ConversionService } from "./infrastructure/conversions/conversionService.js";
import { ConversionDTO } from "./infrastructure/conversions/dtos.js";

const saveSentEvent = (eventName: string, params: SentEventParams): void => {
  const timestamp = Date.now();

  const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_${eventName}`;
  const eventParams = { ...params, timestamp };

  localStorage.setItem(SENT_EVENT_KEY, JSON.stringify(eventParams));
};

const shouldEventBeSent = (
  eventName: EventType,
  params: SentEventParams
): boolean => {
  const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_${eventName}`;
  const sentEvent = localStorage.getItem(SENT_EVENT_KEY);

  if (!sentEvent) {
    return true;
  }

  const parsedEvent = JSON.parse(sentEvent);

  const nowTimestamp = Date.now();
  const timespanMillis = nowTimestamp - parsedEvent.timestamp;
  const sentEventExpired = timespanMillis > SENT_EVENT_VALIDITY_PERIOD_MS;

  if (sentEventExpired) {
    return true;
  }

  let eventArgsMatch = false;

  if (eventName === "connect_wallet") {
    eventArgsMatch =
      parsedEvent["tracking_id"] === params.tracking_id &&
      parsedEvent["address"] === params.address;
  } else {
    eventArgsMatch =
      parsedEvent["tracking_id"] === params.tracking_id &&
      parsedEvent["project_id"] === params.project_id &&
      parsedEvent["referrer_id"] === params.referrer_id &&
      parsedEvent["source"] === params.source &&
      parsedEvent["category"] === params.category &&
      parsedEvent["title"] === params.title &&
      parsedEvent["tag"] === params.tag;
  }

  return !eventArgsMatch;
};

const generateRandomId = () => nanoid();

const isBrowserUndefined =
  typeof window === "undefined" || typeof document === "undefined";

const saveSessionId = (): void => {
  if (isBrowserUndefined) {
    return;
  }

  localStorage.setItem(SESSION_ID_KEY, generateRandomId());
};

const saveTrackingId = (): void => {
  if (isBrowserUndefined) {
    return;
  }

  if (!getTrackingId()) {
    localStorage.setItem(TRACKING_ID_KEY, generateRandomId());
  }
};

const saveUrlParams = (): void => {
  if (isBrowserUndefined) {
    return;
  }

  const queryParams = new URLSearchParams(window.location.search);

  saveTrafficSource(queryParams);

  localStorage.setItem(TRAFFIC_CATEGORY_KEY, queryParams.get("category") ?? "");
  localStorage.setItem(TRAFFIC_TITLE_KEY, queryParams.get("title") ?? "");
  localStorage.setItem(TRAFFIC_TAG_KEY, queryParams.get("tag") ?? "");
};

const saveTrafficSource = (queryParams: URLSearchParams): void => {
  const trafficSourceParam = queryParams.get("source");
  const referrerParam = queryParams.get("r");

  // if is an affiliate link
  if (referrerParam) {
    localStorage.setItem(TRAFFIC_SOURCE_KEY, "affiliate");
    localStorage.setItem(TRAFFIC_CATEGORY_KEY, "affiliate");
    localStorage.setItem(TRAFFIC_TITLE_KEY, referrerParam);
    localStorage.setItem(REFERRER_ID_KEY, referrerParam);
    return;
  }

  // if traffic source is defined
  if (trafficSourceParam) {
    localStorage.setItem(TRAFFIC_SOURCE_KEY, trafficSourceParam);
    return;
  }

  // if traffic source is not defined
  const originURL = document.referrer;

  localStorage.setItem(TRAFFIC_CATEGORY_KEY, originURL);
  localStorage.setItem(TRAFFIC_TITLE_KEY, originURL);

  // if traffic source is a search engine
  if (SEARCH_ENGINE_URLS.includes(originURL)) {
    localStorage.setItem(TRAFFIC_SOURCE_KEY, "organic");
  } else {
    // if traffic source is direct
    localStorage.setItem(TRAFFIC_SOURCE_KEY, "direct");
  }
};

export class Fuul {
  private readonly apiKey: string;
  private readonly BASE_API_URL: string = "https://api.fuul.xyz/api/v1/";
  private readonly httpClient: HttpClient;
  private readonly settings: FuulSettings;

  private conversionService: ConversionService;

  constructor(apiKey: string, settings: FuulSettings = {}) {
    this.apiKey = apiKey;
    this.settings = settings;
    this.checkApiKey();

    saveSessionId();
    saveTrackingId();
    saveUrlParams();

    this.httpClient = new HttpClient({
      baseURL: this.BASE_API_URL,
      timeout: 10000,
      apiKey: this.apiKey,
      ...(this.settings.defaultQueryParams &&
        typeof this.settings.defaultQueryParams !== "string" && {
          queryParams: this.settings.defaultQueryParams,
        }),
    });

    this.conversionService = new ConversionService(this.httpClient);

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
   * @param {String} signature Event signature.
   * @param {String} signature_message Event signature message.
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
  async sendEvent(
    name: EventType,
    args?: EventArgsType,
    signature?: string,
    signature_message?: string
  ): Promise<any> {
    const session_id = getSessionId();
    const tracking_id = getTrackingId();
    const referrer_id = getReferrerId();

    if (!tracking_id) return;

    let params: SentEventParams = {
      tracking_id,
    };

    let reqBody = {};

    if (name === "connect_wallet") {
      params = {
        ...params,
        address: args?.address,
      };

      reqBody = {
        name,
        session_id,
        event_args: {
          ...args,
          tracking_id,
        },
      };
    } else {
      const source = getTrafficSource();
      const category = getTrafficCategory();
      const title = getTrafficTitle();
      const tag = getTrafficTag();

      if (!referrer_id) return;

      params = {
        ...params,
        project_id: args?.project_id,
        referrer_id,
        source,
        category,
        title,
        tag,
      };

      reqBody = {
        name,
        session_id,
        event_args: {
          ...args,
          referrer: referrer_id,
          tracking_id,
          source,
          category,
          title,
          tag,
        },
      };
    }

    reqBody = {
      ...reqBody,
      ...(signature && {
        signature,
      }),
      ...(signature_message && {
        signature_message,
      }),
    };

    if (!shouldEventBeSent(name, params)) {
      return;
    }

    try {
      await this.httpClient.post("events", reqBody);

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

  async getAllConversions(): Promise<ConversionDTO[]> {
    return this.conversionService.getAll();
  }
}

declare module globalThis {
  var Fuul: Fuul;
}

export default {
  Fuul,
};
