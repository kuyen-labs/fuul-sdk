import { SENT_EVENT_ID_KEY, SENT_EVENT_VALIDITY_PERIOD_MS } from '../constants';
import { FuulEvent } from '../types/api';

export const saveSentEvent = (event: FuulEvent): void => {
  const timestamp = Date.now();

  const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_${event.name}`;
  const eventParams = { ...event, timestamp };

  localStorage.setItem(SENT_EVENT_KEY, JSON.stringify(eventParams));
};

export const shouldSendEvent = (event: FuulEvent): boolean => {
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
};
