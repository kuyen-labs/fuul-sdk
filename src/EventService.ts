import { HttpClient } from './HttpClient';
import { FuulEvent } from './types/api';

export const SENT_EVENT_ID_KEY = 'fuul.sent';
export const SENT_EVENT_VALIDITY_PERIOD_SECONDS = 60;

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
    if (this.isDuplicate(event)) {
      this.debug && console.debug(`Fuul SDK: Event is considered duplicate and will not be sent`);
      return;
    }

    await this.httpClient.post('events', event);
    this.debug && console.debug(`Fuul SDK: Sent '${event.name}' event`);

    this.saveSentEvent(event);
  }

  public isDuplicate(thisEvent: FuulEvent): boolean {
    const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_${thisEvent.name}`;

    const lastSentEvent = localStorage.getItem(SENT_EVENT_KEY);
    if (!lastSentEvent) {
      return false;
    }

    const savedEvent = JSON.parse(lastSentEvent) as FuulEvent & { timestamp: number };

    const nowTimestamp = this.getCurrentTimestamp();
    const timespanSeconds = nowTimestamp - savedEvent.timestamp;
    const savedEventExpired = timespanSeconds > SENT_EVENT_VALIDITY_PERIOD_SECONDS;

    if (savedEventExpired) {
      return false;
    }

    let matchesMetadata = false;
    if (thisEvent.metadata) {
      matchesMetadata =
        savedEvent.metadata.tracking_id === thisEvent.metadata.tracking_id &&
        savedEvent.metadata.project_id === thisEvent.metadata.project_id &&
        savedEvent.metadata.referrer === thisEvent.metadata.referrer &&
        savedEvent.metadata.source === thisEvent.metadata.source &&
        savedEvent.metadata.category === thisEvent.metadata.category &&
        savedEvent.metadata.title === thisEvent.metadata.title &&
        savedEvent.metadata.tag === thisEvent.metadata.tag &&
        savedEvent.user_address === thisEvent.user_address &&
        savedEvent.signature === thisEvent.signature &&
        savedEvent.signature_message === thisEvent.signature_message;
    }

    let matchesArgs = false;
    if (thisEvent.args && savedEvent.args) {
      matchesArgs = savedEvent.args.page === thisEvent.args.page;
    }

    return matchesArgs && matchesMetadata;
  }

  private getCurrentTimestamp() {
    return Date.now() / 1000;
  }

  private saveSentEvent(event: FuulEvent): void {
    const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_${event.name}`;

    const timestamp = this.getCurrentTimestamp();
    const eventParams = { ...event, timestamp };

    localStorage.setItem(SENT_EVENT_KEY, JSON.stringify(eventParams));
  }
}
