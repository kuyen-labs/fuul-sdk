// vendors
import axios from "axios";

// types
import { EventArgsType, EventType } from "./types/types";

const SESSION_ID_KEY = "fuul.session_id";
const TRACKING_ID_KEY = "fuul.tracking_id";

const getSessionId = () => localStorage.getItem(SESSION_ID_KEY);
const getTrackingId = () => localStorage.getItem(TRACKING_ID_KEY);

export class Fuul {
  public project_id: string;
  private BASE_API_URL: string = 'http://fuul-server-production-lb-1150554069.us-east-1.elb.amazonaws.com/api/v1';

  constructor(projectId: string) {
    this.project_id = projectId;

    this.saveSessionId();
    this.saveTrackingId();
  }

  private async generateRandomId() {
    const { nanoid } = await import('nanoid');
    return nanoid();
  };

  async sendEvent(name: EventType, args?: EventArgsType) {
    const session_id = getSessionId();
    const tracking_id = getTrackingId();

    if (!(session_id || tracking_id)) {
      return;
    }

    const reqBody = {
      name,
      session_id,
      project_id: this.project_id,
      event_args: {
        ...args,
        tracking_id,
      }
    };

    const url = `${this.BASE_API_URL}/events`;

    try {
      const response = await axios.post(url, reqBody);

      return response;
    } catch (error) {
      return error;
    }
  }

  private async saveSessionId(): Promise<void> {
    if (typeof window === "undefined") return;

    localStorage.setItem(SESSION_ID_KEY, await this.generateRandomId());
  }

  private async saveTrackingId(): Promise<void> {
    if (
      typeof window === 'undefined' ||
      typeof document === 'undefined'
    ) return;

    if (!document.referrer) return;

    const queryParams = new URLSearchParams(window.location.search);

    if (!(queryParams.has('c') || queryParams.has('r'))) return;

    localStorage.setItem(TRACKING_ID_KEY, await this.generateRandomId());

    this.sendEvent('pageview');
  }
}

export default {
  Fuul,
};
