import { ConversionService } from './ConversionService';
import { HttpClient } from './HttpClient';
import { EventArgs, FuulSettings, UserMetadata } from './types/sdk';
import { Conversion, FuulEvent } from './types/api';
import { EventService } from './EventService';

import {
  getAffiliateId,
  getReferrerUrl,
  getTrackingId,
  getTrafficCategory,
  getTrafficSource,
  getTrafficTag,
  getTrafficTitle,
} from './tracking';

const FUUL_API_DEFAULT_ENDPOINT_URI = 'https://api.fuul.xyz/api/v1/';

let _debug: boolean = false;
let _initialized: boolean = false;
let _apiKey: string;
let _httpClient: HttpClient;
let _conversionService: ConversionService;
let _eventService: EventService;

export function init(settings: FuulSettings) {
  _debug = !!settings.debug;

  if (_initialized) {
    console.warn(`Fuul SDK: Calling init() on an already initialized context does nothing.`);
    return;
  }

  _apiKey = settings.apiKey;
  assertValidApiKey();

  _httpClient = createApiClient(
    settings.baseApiUrl ?? FUUL_API_DEFAULT_ENDPOINT_URI,
    settings.defaultQueryParams ?? {},
  );

  _conversionService = new ConversionService({ httpClient: _httpClient, debug: _debug });
  _eventService = new EventService({ httpClient: _httpClient, debug: _debug });

  _initialized = true;
  _debug && console.debug(`Fuul SDK: init() complete`);
}

function assertInitialized() {
  if (!_initialized) {
    throw new Error(`Fuul SDK: You need to call init() to initialize the library before using any methods`);
  }
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
export async function sendEvent(name: string, args?: EventArgs, userMetadata?: UserMetadata): Promise<void> {
  assertInitialized();
  assertBrowserContext();

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

  _eventService.sendEvent(fuulEvent, _httpClient);
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
export async function sendPageViewEvent(pageName?: string): Promise<void> {
  await sendEvent('pageview', {
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
export async function sendConnectWalletEvent(userMetadata: UserMetadata): Promise<void> {
  await sendEvent('connect_wallet', {}, userMetadata);
}

/**
 * Generates a tracking link for an affiliate
 * @param {string} landingUrl - Landing URL of your project
 * @param {string} affiliateAddress - Affiliate wallet address
 * @param {string} projectId - Project ID
 * @returns {string} Tracking link
 **/
export function generateTrackingLink(landingUrl: string, affiliateAddress: string, projectId: string): string {
  return `${landingUrl}?p=${projectId}&source=fuul&referrer=${affiliateAddress}`;
}

export async function getConversions(): Promise<Conversion[]> {
  assertInitialized();
  return _conversionService.getAll();
}

function assertBrowserContext(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error(`Fuul SDK: Browser context required`);
  }
}

function assertValidApiKey(): void {
  if (!_apiKey) {
    throw new Error('Fuul SDK: Invalid API key');
  }
}

function createApiClient(baseUrl: string, defaultQueryParams: Record<string, string>): HttpClient {
  return new HttpClient({
    baseURL: baseUrl,
    timeout: 10000,
    apiKey: _apiKey,
    queryParams: defaultQueryParams,
  });
}

export default {
  init,
  sendEvent,
  sendPageViewEvent,
  sendConnectWalletEvent,
  generateTrackingLink,
  getConversions,
};
