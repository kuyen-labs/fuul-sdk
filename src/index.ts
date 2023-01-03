import axios from "axios";

const SESSION_ID_KEY = "fuul.sessionId";

type EventParamsType = {
  name: string;
  project_id: string;
  event_args?: {
    address?: string;
    message?: string;
  };
};

export class Fuul {
  projectId: string;
  serverUrl: string;

  constructor(projectId: string, serverUrl: string) {
    this.projectId = projectId;
    this.serverUrl = serverUrl;
    this.saveSessionId();
  }

  generateSessionId() {
    return "test_session_id";
  }

  async sendEvent(params: EventParamsType) {
    const session_id: string = this.generateSessionId();

    try {
      const response = await axios.post(this.serverUrl, {
        ...params,
        session_id,
      });
      return response;
    } catch (error) {
      return error;
    }
  }

  saveSessionId() {
    if (typeof window === "undefined") return;

    const session_id = localStorage.getItem(SESSION_ID_KEY);

    if (session_id) return;

    localStorage.setItem(SESSION_ID_KEY, this.generateSessionId());
  }
}

export default {
  Fuul,
};
