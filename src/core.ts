import { AffiliateService } from './AffiliateService';
import { ConversionService } from './ConversionService';
import { EventService } from './EventService';
import { HttpClient } from './HttpClient';
import {
  getAffiliateId,
  getReferrerUrl,
  getTrackingId,
  getTrafficCategory,
  getTrafficSource,
  getTrafficTag,
  getTrafficTitle,
} from './tracking';
import { Conversion, FuulEvent } from './types/api';
import { AffiliateLinkParams, EventArgs, FuulSettings, UserMetadata } from './types/sdk';

const FUUL_API_DEFAULT_ENDPOINT_URI = 'https://api.fuul.xyz/api/v1/';

let _debug = false;
let _initialized = false;
let _apiKey: string;
let _httpClient: HttpClient;
let _conversionService: ConversionService;
let _affiliateService: AffiliateService;
let _eventService: EventService;

export function init(settings: FuulSettings) {
  _debug = !!settings.debug;

  if (_initialized) {
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
  _affiliateService = new AffiliateService({ httpClient: _httpClient, debug: _debug });

  _initialized = true;
  _debug && console.debug(`Fuul SDK: init() complete`);
}

function assertInitialized() {
  if (!_initialized) {
    throw new Error(`Fuul SDK: You need to call init() to initialize the library before using any methods`);
  }
}

/**
 * @param {string} name Event name
 * @param {EventArgs} args Event arguments
 * @param {UserMetadata} userMetadata User metadata
 * @returns {Promise<void>}
 * @example
 * ```js
 * sendEvent('my_event', { value: 10 }, { userAddress: '0x01' })
 * ```
 */
export async function sendEvent(name: string, args?: EventArgs, userMetadata?: UserMetadata): Promise<void> {
  assertInitialized();
  assertBrowserContext();

  const trackingId = getTrackingId();
  const affiliateId = getAffiliateId();
  const source = getTrafficSource();
  const category = getTrafficCategory();
  const title = getTrafficTitle();
  const tag = getTrafficTag();
  const referrerUrl = getReferrerUrl();

  const fuulEvent: FuulEvent = {
    name,
    args: args || {},
    metadata: {
      tracking_id: trackingId ?? '',
    },
  };

  if (userMetadata?.address) {
    fuulEvent.user_address = userMetadata.address;
  }

  if (userMetadata?.signature) {
    fuulEvent.signature = userMetadata?.signature;
    fuulEvent.signature_message = userMetadata?.message;
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

  _eventService.sendEvent(fuulEvent);
}

/**
 * @param {string} pageName Optional page name, default is document.location.pathname
 * @see https://docs.fuul.xyz/technical-guide-for-projects/sending-events-through-the-fuul-sdk#pageview-event
 * @returns {Promise<void>}
 * @example
 * ```typescript
 * sendPageview({ page: '/home' })
 * sendPageview({ page: '/product/123' })
 * ```
 */
export async function sendPageview(pageName?: string): Promise<void> {
  await sendEvent('pageview', {
    page: pageName ?? document.location.pathname,
    locationOrigin: document.location.origin,
  });
}

/**
 * @param {UserMetadata} userMetadata Metadata from the user that connected the wallet
 * @see https://docs.fuul.xyz/technical-guide-for-projects/sending-events-through-the-fuul-sdk#connect-wallet-event
 * @returns {Promise<void>}
 * @example
 * ```typescript
 * sendConnectWallet({
 *   userAddress: '0x12345',
 *   signature: '0xaad9a0b62f87c15a248cb99ca926785b828b5',
 *   signatureMessage: 'Accept referral from Fuul'
 * })
 * ```
 */
export async function sendConnectWallet(userMetadata: UserMetadata): Promise<void> {
  await sendEvent('connect_wallet', {}, userMetadata);
}

/**
 * Creates a code registered to an affiliate address
 * @param {string} address Affiliate wallet address
 * @param {string} code Affiliate code to map address to
 * @param {string} signature Signed message authenticating address ownership
 * @example
 * ```typescript
 * await Fuul.createAffiliateCode('0x12345', 'my-cool-code', '<signature>')
 * ```
 **/
export async function createAffiliateCode(address: string, code: string, signature: string): Promise<void> {
  const signatureMessage = `I confirm that I am creating the ${code} code on Fuul`;
  await _affiliateService.create(address, code, signature, signatureMessage);
}

/**
 * Updates the code registered to an affiliate address
 * @param {string} address Affiliate wallet address
 * @param {string} code New affiliate code
 * @param {string} signature Signed message authenticating code update
 * @example
 * ```typescript
 * await Fuul.updateAffiliateCode('0x12345', 'my-new-cool-code', '<signature>')
 * ```
 **/
export async function updateAffiliateCode(address: string, code: string, signature: string): Promise<void> {
  const signatureMessage = `I confirm that I am updating my code to ${code} on Fuul`;
  await _affiliateService.update(address, code, signature, signatureMessage);
}

/**
 * Gets the code registered to an affiliate address
 * @param {string} address Affiliate wallet address
 * @returns {string} Affiliate code
 * @example
 * ```typescript
 * const code = await Fuul.getAffiliateCode('0x12345');
 * ```
 **/
export async function getAffiliateCode(address: string): Promise<string | null> {
  return await _affiliateService.getCode(address);
}

/**
 * Checks if an affiliate code is free to use
 * @param {string} code Affiliate code to check
 * @returns {boolean}
 * @example
 * ```typescript
 * if (await Fuul.isAffiliateCodeFree('my-cool-code')) {
 *   // Code is free to use
 * }
 * ```
 **/
export async function isAffiliateCodeFree(code: string): Promise<boolean> {
  return await _affiliateService.isCodeFree(code);
}

/**
 * Generates a tracking link for an affiliate
 * @param {string} baseUrl Base url of the project
 * @param {string} affiliateAddress Affiliate wallet address
 * @param {AffiliateLinkParams} params Optional tracking parameters
 * @returns {string} Tracking link
 * @example
 * ```typescript
 * const trackingLink = Fuul.generateTrackingLink('https://myproject.com', '0x12345')
 * console.log(trackingLink) // https://myproject.com?af=0x12345
 * ```
 * @see https://docs.fuul.xyz/technical-guide-for-projects/creating-partners-tracking-links-using-the-fuul-sdk
 **/
export async function generateTrackingLink(
  baseUrl: string,
  affiliateAddress: string,
  params?: AffiliateLinkParams,
): Promise<string> {
  const affiliateCode = await _affiliateService.getCode(affiliateAddress);
  const qp = new URLSearchParams({
    af: affiliateCode ?? affiliateAddress,
  });

  if (params?.title) {
    qp.append('af_title', params.title);
  }
  if (params?.format) {
    qp.append('af_format', params.format);
  }
  if (params?.place) {
    qp.append('af_place', params.place);
  }

  return `${baseUrl}?${qp.toString()}`;
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
  sendPageview,
  sendConnectWallet,
  generateTrackingLink,
  getConversions,
  createAffiliateCode,
  updateAffiliateCode,
  getAffiliateCode,
  isAffiliateCodeFree,
};
