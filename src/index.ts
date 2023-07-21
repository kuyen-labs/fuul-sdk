import {
  getReferrerId,
  getSessionId,
  getTrackingId,
  getTrafficCategory,
  getTrafficSource,
  getTrafficTag,
  getTrafficTitle,
  isBrowserUndefined,
  saveSessionId,
  saveTrackingId,
  saveUrlParams,
} from './utils/localStorage'

import {
  EventArgs,
  FuulSettings,
  IGenerateTrackingLink,
  EventMetadata,
  SendEventRequest,
} from './types'

import { HttpClient } from './infrastructure/http/HttpClient'
import { ConversionService } from './infrastructure/conversions/conversionService'
import { ConversionDTO } from './infrastructure/conversions/dtos'
import { saveSentEvent, shouldSendEvent } from './utils/events'

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
