import { HttpClient } from './HttpClient';
import { FuulEvent } from './types/api';

export const SENT_EVENT_ID_KEY = 'fuul.sent';
export const SENT_EVENT_VALIDITY_PERIOD_MS = 60000;

export type EventServiceSettings = {
  httpClient: HttpClient;
  debug?: boolean;
};

export class EventService {
  private readonly debug: boolean;
  private readonly httpClient: HttpClient;

  constructor(settings: EventServiceSettings) {
    this.httpClient = settings.httpClient;
    this.debug = !!settings.debug;
  }

  public async sendEvent(event: FuulEvent): Promise<void> {
    if (!this.shouldSendEvent(event)) {
      this.debug && console.debug(`Fuul SDK: Event is considered duplicate and will not be sent`);
      return;
    }

    await this.httpClient.post('events', event);
    this.debug && console.debug(`Fuul SDK: Sent '${event.name}' event`);

    this.saveSentEvent(event);
  }

  public shouldSendEvent(event: FuulEvent): boolean {
    const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_${event.name}`;

    const lastSentEvent = localStorage.getItem(SENT_EVENT_KEY);
    if (!lastSentEvent) {
      return true;
    }

    const parsedEvent = JSON.parse(lastSentEvent);

    const nowTimestamp = Date.now();
    const timespanMillis = nowTimestamp - parsedEvent.timestamp;
    const sentEventExpired = timespanMillis > SENT_EVENT_VALIDITY_PERIOD_MS;

    if (sentEventExpired) {
      return true;
    }

    if (event.metadata) {
      const { tracking_id, project_id, referrer, source, category, title, tag } = event.metadata;

      const matches =
        parsedEvent.metadata.tracking_id === tracking_id &&
        parsedEvent.metadata.project_id === project_id &&
        parsedEvent.metadata.referrer === referrer &&
        parsedEvent.metadata.source === source &&
        parsedEvent.metadata.category === category &&
        parsedEvent.metadata.title === title &&
        parsedEvent.metadata.tag === tag &&
        parsedEvent.user_address === event.user_address;

      return !matches;
    }

    return true;
  }

  private saveSentEvent(event: FuulEvent): void {
    const timestamp = Date.now();

    const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_${event.name}`;
    const eventParams = { ...event, timestamp };

    localStorage.setItem(SENT_EVENT_KEY, JSON.stringify(eventParams));
  }
}
