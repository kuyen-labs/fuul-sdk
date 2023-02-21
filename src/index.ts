import axios from "axios";

import { EventArgsType, EventType } from "./types/types";

const SESSION_ID_KEY = "fuul.session_id";
const TRACKING_ID_KEY = "fuul.tracking_id";
const CAMPAIGN_ID_KEY = "fuul.campaign_id";
const REFERRER_ID_KEY = "fuul.referrer_id";

const getSessionId = () => localStorage.getItem(SESSION_ID_KEY);
const getTrackingId = () => localStorage.getItem(TRACKING_ID_KEY);
const getCampaignId = () => localStorage.getItem(CAMPAIGN_ID_KEY);
const getReferrerId = () => localStorage.getItem(REFERRER_ID_KEY);

export class Fuul {
  private projectId: string;
  private BASE_API_URL: string = "https://api.fuul.xyz/api/v1";

  constructor(projectId: string) {
    this.projectId = projectId;

    this.saveSessionId();
    this.saveTrackingId();
  }

  private async generateRandomId() {
    const { nanoid } = await import("nanoid");

    return nanoid();
  }

  async sendEvent(name: EventType, args?: EventArgsType) {
    const session_id = getSessionId();
    const tracking_id = getTrackingId();
    const campaign_id = getCampaignId();
    const referrer_id = getReferrerId();

    if (!tracking_id) {
      return;
    }

    const reqBody = {
      name,
      session_id,
      project_id: this.projectId,
      event_args: {
        ...args,
        campaign_id,
        referrer: referrer_id,
        tracking_id,
      },
    };

    const url = `${this.BASE_API_URL}/events`;

    try {
      const response = await axios.post(url, reqBody);

      return response.data;
    } catch (error) {
      return error;
    }
  }

  private async saveSessionId(): Promise<void> {
    if (typeof window === "undefined") return;

    localStorage.setItem(SESSION_ID_KEY, await this.generateRandomId());
  }

  private async saveTrackingId(): Promise<void> {
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

    localStorage.setItem(TRACKING_ID_KEY, await this.generateRandomId());

    localStorage.setItem(CAMPAIGN_ID_KEY, queryParams.get("c") ?? "");
    localStorage.setItem(REFERRER_ID_KEY, queryParams.get("r") ?? "");
  }
}

export default {
  Fuul,
};
