import { nanoid } from 'nanoid'

import {
  getReferrerId,
  getSessionId,
  getTrackingId,
  getTrafficCategory,
  getTrafficSource,
  getTrafficTag,
  getTrafficTitle,
} from './utils/localStorage'

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
  TRAFFIC_ORIGIN_URL,
} from './constants'

import {
  EventArgs,
  FuulSettings,
  IGenerateTrackingLink,
  EventMetadata,
  SendEventRequest,
} from './types/index'

import { HttpClient } from './infrastructure/http/HttpClient'
import { ConversionService } from './infrastructure/conversions/conversionService'
import { ConversionDTO } from './infrastructure/conversions/dtos'

const saveSentEvent = (eventName: string, params: SendEventRequest): void => {
  const timestamp = Date.now()

  const SENT_EVENT_KEY = `${SENT_EVENT_ID_KEY}_${eventName}`
  const eventParams = { ...params, timestamp }

  localStorage.setItem(SENT_EVENT_KEY, JSON.stringify(eventParams))
}

const shouldSendEvent = (eventName: string, reqBody: SendEventRequest): boolean => {
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

const generateRandomId = () => nanoid()

const isBrowserUndefined = typeof window === 'undefined' || typeof document === 'undefined'

const saveSessionId = (): void => {
  if (isBrowserUndefined) {
    return
  }

  localStorage.setItem(SESSION_ID_KEY, generateRandomId())
}

const saveTrackingId = (): void => {
  if (isBrowserUndefined) {
    return
  }

  if (!getTrackingId()) {
    localStorage.setItem(TRACKING_ID_KEY, generateRandomId())
  }
}

const saveUrlParams = (): void => {
  if (isBrowserUndefined) {
    return
  }

  const queryParams = new URLSearchParams(window.location.search)

  localStorage.setItem(REFERRER_ID_KEY, queryParams.get('referrer') ?? '')
  localStorage.setItem(TRAFFIC_SOURCE_KEY, queryParams.get('source') ?? '')
  localStorage.setItem(TRAFFIC_CATEGORY_KEY, queryParams.get('category') ?? '')
  localStorage.setItem(TRAFFIC_TITLE_KEY, queryParams.get('title') ?? '')
  localStorage.setItem(TRAFFIC_TAG_KEY, queryParams.get('tag') ?? '')
  localStorage.setItem(TRAFFIC_ORIGIN_URL, document.referrer ?? '')

  saveTrafficSource()
}

const saveTrafficSource = (): void => {
  const queryParams = new URLSearchParams(window.location.search)
  const source = queryParams.get('source')
  const referrer = queryParams.get('referrer')

  if (source) {
    return
  }

  if (referrer) {
    localStorage.setItem(TRAFFIC_SOURCE_KEY, 'affiliate')
    localStorage.setItem(TRAFFIC_CATEGORY_KEY, 'affiliate')
    localStorage.setItem(TRAFFIC_TITLE_KEY, referrer)
  } else {
    // if traffic source is not defined
    const originURL = document.referrer

    localStorage.setItem(TRAFFIC_CATEGORY_KEY, originURL)
    localStorage.setItem(TRAFFIC_TITLE_KEY, originURL)

    // if traffic source is a search engine
    if (SEARCH_ENGINE_URLS.includes(originURL)) {
      localStorage.setItem(TRAFFIC_SOURCE_KEY, 'organic')
    } else {
      // if traffic source is direct
      localStorage.setItem(TRAFFIC_SOURCE_KEY, 'direct')
    }
  }
}

const buildTrackingLinkQueryParams = (referrer: string, projectId: string) => {
  return `p=${projectId}&source=fuul&referrer=${referrer}`
}

class Fuul {
  private readonly apiKey: string
  private readonly BASE_API_URL: string = 'https://api.fuul.xyz/api/v1/'
  private readonly httpClient: HttpClient
  private readonly settings: FuulSettings

  private conversionService: ConversionService

  constructor(apiKey: string, settings: FuulSettings = {}) {
    this.apiKey = apiKey
    this.settings = settings
    this.checkApiKey()

    saveSessionId()
    saveTrackingId()
    saveUrlParams()

    this.httpClient = new HttpClient({
      baseURL: settings.baseApiUrl || this.BASE_API_URL,
      timeout: 10000,
      apiKey: this.apiKey,
      ...(this.settings.defaultQueryParams && { queryParams: this.settings.defaultQueryParams }),
    })

    this.conversionService = new ConversionService(this.httpClient)

    this.init()
  }

  async init() {
    if (isBrowserUndefined) {
      return
    }

    await this.sendEvent('pageview')
  }

  checkApiKey(): void {
    if (!this.apiKey) {
      throw new Error('Fuul API key is required')
    }
  }

  /**
   * @param {EventType} name Event name.
   * @param {EventArgs} args Event additional arguments.
   * @param {String} signature Event signature.
   * @param {String} signature_message Event signature message.
   * @returns {Promise<any>} Promise object represents the result of the event.
   * @example
   * ```js
   * import { Fuul } from 'fuul-sdk'
   *
   * // Initialize Fuul in your app root file
   * new Fuul('your-api-key')
   *
   * // Then you can send an event as follows:
   * fuul.sendEvent('my event', { value: 10 }, { user_address: '0x01' })
   * ```
   */
  async sendEvent(name: string, args: EventArgs = {}, metadata: EventMetadata = {}): Promise<any> {
    const session_id = getSessionId()
    const tracking_id = getTrackingId()
    const referrerId = getReferrerId()
    const source = getTrafficSource()
    const category = getTrafficCategory()
    const title = getTrafficTitle()
    const tag = getTrafficTag()

    const { userAddress, signature, signatureMessage } = metadata

    if (!tracking_id) return

    const reqBody = {
      name,
      event_args: args,
      metadata: {
        ...(referrerId && { referrer: referrerId }),
        session_id,
        tracking_id,
        source,
        category,
        title,
        tag,
      },
      ...(userAddress && { user_address: userAddress }),
      ...(signature && { signature }),
      ...(signatureMessage && { signature_message: signatureMessage }),
    } as SendEventRequest

    if (!shouldSendEvent(name, reqBody)) {
      return
    }

    try {
      await this.httpClient.post('events', reqBody)

      saveSentEvent(name, reqBody)
    } catch (error: any) {
      return error
    }
  }

  verifyConnection(): void {
    if (isBrowserUndefined) {
      throw new Error(
        'Fuul SDK is not supported in this environment. Please use "typeof window !== undefined" to check if you are in the browser environment.',
      )
    }

    window.alert('You are successfully connected to Fuul SDK! ✅')
  }

  /**
   * Generates a tracking link for a referrer
   * @param {Object} trackingLinkParams - Tracking link parameters
   * @param {string} trackingLinkParams.address - Referrer wallet address.
   * @param {string} trackingLinkParams.projectId - Project ID.
   * @param {string} trackingLinkParams.baseUrl - Base URL of your app. Defaults to window.location.href.
   * @returns {string} tracking link
   **/
  generateTrackingLink({ address, projectId, baseUrl }: IGenerateTrackingLink): string {
    return `${baseUrl ?? window.location.href}?${buildTrackingLinkQueryParams(address, projectId)}`
  }

  async getAllConversions(): Promise<ConversionDTO[]> {
    return this.conversionService.getAll()
  }
}

export default Fuul
