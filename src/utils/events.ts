import { SENT_EVENT_ID_KEY, SENT_EVENT_VALIDITY_PERIOD_SECONDS } from '../constants';
import { SendEventRequest } from '../types';

export function getSentEvent(eventName: string): string | null {
  const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_${eventName}`;
  return localStorage.getItem(SENT_EVENT_KEY);
}

export function saveSentEvent(event: SendEventRequest): void {
  const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_${event.name}`;
  localStorage.setItem(SENT_EVENT_KEY, JSON.stringify(event));
}

export function shouldSendEvent(thisEvent: SendEventRequest): boolean {
  const lastSentEventData = getSentEvent(thisEvent.name);
  if (!lastSentEventData) {
    return true;
  }

  const lastSentEvent = JSON.parse(lastSentEventData);

  const nowTimestamp = Date.now() / 1000;
  const timespanMillis = nowTimestamp - lastSentEvent.timestamp;
  const sentEventExpired = timespanMillis > SENT_EVENT_VALIDITY_PERIOD_SECONDS;

  if (sentEventExpired) {
    return true;
  }

  if (thisEvent.metadata) {
    const { tracking_id, project_id, referrer, source, category, title, tag } = thisEvent.metadata;

    const matches =
      lastSentEvent.metadata.tracking_id === tracking_id &&
      lastSentEvent.metadata.project_id === project_id &&
      lastSentEvent.metadata.referrer === referrer &&
      lastSentEvent.metadata.source === source &&
      lastSentEvent.metadata.category === category &&
      lastSentEvent.metadata.title === title &&
      lastSentEvent.metadata.tag === tag &&
      lastSentEvent.user_address === thisEvent.user_address;

    return !matches;
  }

  return true;
}
