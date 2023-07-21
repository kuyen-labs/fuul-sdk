import { SENT_EVENT_ID_KEY, SENT_EVENT_VALIDITY_PERIOD_MS } from '../constants'
import { SendEventRequest } from '../types'

export const saveSentEvent = (eventName: string, params: SendEventRequest): void => {
  const timestamp = Date.now()

  const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_${eventName}`
  const eventParams = { ...params, timestamp }

  localStorage.setItem(SENT_EVENT_KEY, JSON.stringify(eventParams))
}

export const shouldSendEvent = (eventName: string, reqBody: SendEventRequest): boolean => {
  const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_${eventName}`

  let lastSentEvent = localStorage.getItem(SENT_EVENT_KEY)
  if (!lastSentEvent) {
    return true
  }

  const parsedEvent = JSON.parse(lastSentEvent)

  const nowTimestamp = Date.now()
  const timespanMillis = nowTimestamp - parsedEvent.timestamp
  const sentEventExpired = timespanMillis > SENT_EVENT_VALIDITY_PERIOD_MS

  if (sentEventExpired) {
    return true
  }

  const { tracking_id, project_id, referrer, source, category, title, tag, user_address } =
    reqBody.metadata

  const eventMetadata = parsedEvent['metadata']

  const eventMetadataMatches =
    eventMetadata['tracking_id'] === tracking_id &&
    eventMetadata['project_id'] === project_id &&
    eventMetadata['referrer'] === referrer &&
    eventMetadata['source'] === source &&
    eventMetadata['category'] === category &&
    eventMetadata['title'] === title &&
    eventMetadata['tag'] === tag
  eventMetadata['user_address'] === user_address

  return !eventMetadataMatches
}
