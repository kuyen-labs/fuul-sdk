import { ConversionService } from './infrastructure/conversions/conversionService';
import { ConversionDTO } from './infrastructure/conversions/dtos';
import { HttpClient } from './infrastructure/http/HttpClient';
import { EventArgs, FuulSettings, UserMetadata } from './types';
import { FuulEvent } from './types/api';
import { saveSentEvent, shouldSendEvent } from './utils/events';
import {
  getAffiliateId,
  getReferrerUrl,
  getTrackingId,
  getTrafficCategory,
  getTrafficSource,
  getTrafficTag,
  getTrafficTitle,
  saveTrackingId,
  saveUrlParams,
} from './utils/localStorage';

class Fuul {
  private readonly apiKey: string;
  private readonly BASE_API_URL: string = 'https://api.fuul.xyz/api/v1/';
  private readonly httpClient: HttpClient;
  private readonly settings: FuulSettings;

  private conversionService: ConversionService;

  constructor(apiKey: string, settings: FuulSettings = {}) {
    this.assertBrowserContext();

    this.apiKey = apiKey;
    this.assertValidApiKey();

    this.settings = settings;

    this.httpClient = this.createApiClient(settings.baseApiUrl ?? this.BASE_API_URL, settings.defaultQueryParams ?? {});
    this.conversionService = new ConversionService(this.httpClient);

    saveTrackingId();
    saveUrlParams();
  }

  /**
   * @param {EventType} name Event name
   * @param {EventArgs} args Event arguments
   * @param {EventMetadata} metadata Event metadata like userAddress, signature, signatureMessage
   * @returns {Promise<void>}
   * @example
   * ```js
   * sendEvent('my_event', { value: 10 }, { userAddress: '0x01' })
   * ```
   */
  public async sendEvent(name: string, args?: EventArgs, userMetadata?: UserMetadata): Promise<void> {
    const tracking_id = getTrackingId();
    const affiliateId = getAffiliateId();
    const source = getTrafficSource();
    const category = getTrafficCategory();
    const title = getTrafficTitle();
    const tag = getTrafficTag();
    const referrerUrl = getReferrerUrl();

    if (!tracking_id) return;

    const fuulEvent: FuulEvent = {
      name,
      event_args: args,
      metadata: {
        tracking_id,
      },
    };

    if (userMetadata?.userAddress) {
      fuulEvent.user_address = userMetadata.userAddress;
    }

    if (userMetadata?.signature) {
      fuulEvent.signature = userMetadata?.signature;
      fuulEvent.signature_message = userMetadata?.signatureMessage;
    }

    if (affiliateId) {
      fuulEvent.metadata.referrer = affiliateId;
      fuulEvent.metadata.affiliate_id = affiliateId;
    }

    if (referrerUrl) {
      fuulEvent.metadata.referrer_url = referrerUrl;
    }

    if (source) {
      fuulEvent.metadata.source = source;
    }

    if (category) {
      fuulEvent.metadata.category = category;
    }

    if (title) {
      fuulEvent.metadata.title = title;
    }

    if (tag) {
      fuulEvent.metadata.tag = tag;
    }

    if (!shouldSendEvent(fuulEvent)) {
      return;
    }

    await this.httpClient.post('events', fuulEvent);
    saveSentEvent(fuulEvent);
  }

  /**
   * @param {string} pageName Optional page name, default is document.location.pathname
   * @see https://docs.fuul.xyz/technical-guide-for-projects/sending-events-through-the-fuul-sdk#connect-wallet-event
   * @returns {Promise<void>}
   * @example
   * ```typescript
   * sendPageViewEvent({ page: '/home' })
   * sendPageViewEvent({ page: '/product/123' })
   * ```
   */
  public async sendPageViewEvent(pageName?: string): Promise<void> {
    await this.sendEvent('pageview', {
      page: pageName ?? document.location.pathname,
      origin: document.location.origin,
    });
  }

  /**
   * @param {UserMetadata} userMetadata Metadata from the user that connected the wallet
   * @see https://docs.fuul.xyz/technical-guide-for-projects/sending-events-through-the-fuul-sdk#connect-wallet-event
   * @returns {Promise<void>}
   * @example
   * ```typescript
   * sendConnectWalletEvent({
   *   userAddress: '0x12345',
   *   signature: '0xaad9a0b62f87c15a248cb99ca926785b828b5',
   *   signatureMessage: 'Accept referral from Fuul'
   * })
   * ```
   */
  public async sendConnectWalletEvent(userMetadata: UserMetadata): Promise<void> {
    await this.sendEvent('connect_wallet', {}, userMetadata);
  }

  /**
   * Generates a tracking link for an affiliate
   * @param {string} landingUrl - Landing URL of your project
   * @param {string} affiliateAddress - Affiliate wallet address
   * @param {string} projectId - Project ID
   * @returns {string} Tracking link
   **/
  public generateTrackingLink(landingUrl: string, affiliateAddress: string, projectId: string): string {
    return `${landingUrl}?p=${projectId}&source=fuul&referrer=${affiliateAddress}`;
  }

  public async getAllConversions(): Promise<ConversionDTO[]> {
    return this.conversionService.getAll();
  }

  private assertBrowserContext(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      throw new Error(`Fuul SDK: Fuul SDK can only operate in a browser context`);
    }
  }

  private assertValidApiKey(): void {
    if (!this.apiKey) {
      throw new Error('Fuul API key is required');
    }
  }

  private createApiClient(baseUrl: string, defaultQueryParams: Record<string, string>): HttpClient {
    return new HttpClient({
      baseURL: baseUrl,
      timeout: 10000,
      apiKey: this.apiKey,
      queryParams: defaultQueryParams,
    });
  }
}

export default Fuul;
