import { AffiliateService } from './affiliates/AffiliateService';
import { ConversionService } from './ConversionService';
import { EventService } from './EventService';
import { HttpClient } from './HttpClient';
import { PayoutService } from './payouts/PayoutService';
import {
  getAffiliateId,
  getReferrerUrl,
  getTrackingId,
  getTrafficCategory,
  getTrafficSource,
  getTrafficTag,
  getTrafficTitle,
} from './tracking';
import { Conversion, FuulEvent, GetPayoutsLeaderboardParams, GetPointsLeaderboardParams, GetUserPayoutMovementsParams, GetUserPayoutsByConversionParams, GetUserPointsByConversionParams, GetUserPointsMovementsParams, LeaderboardResponse, PayoutsLeaderboard, PointsLeaderboard, UserPayoutMovementsResponse, UserPayoutsByConversionResponse, UserPointsByConversionResponse, UserPointsMovementsResponse } from './types/api';
import { AffiliateLinkParams, EventArgs, FuulSettings, UserMetadata } from './types/sdk';

const FUUL_API_DEFAULT_ENDPOINT_URI = 'https://api.fuul.xyz/api/v1/';

let _debug = false;
let _initialized = false;
let _apiKey: string;
let _httpClient: HttpClient;
let _conversionService: ConversionService;
let _affiliateService: AffiliateService;
let _eventService: EventService;
let _payoutService: PayoutService;

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
  _payoutService = new PayoutService({ httpClient: _httpClient, debug: _debug })

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
 * @returns {Promise<void>}
 * @example
 * ```js
 * sendEvent('my_event', { value: 10 })
 * ```
 */
export async function sendEvent(name: string, args?: EventArgs): Promise<void> {
  assertInitialized();
  assertBrowserContext();

  const event: FuulEvent = {
    name,
    args: args ?? {},
    metadata: {
      tracking_id: getTrackingId(),
    },
  };

  await _eventService.sendEvent(event);
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
  assertInitialized();
  assertBrowserContext();

  const event: FuulEvent = {
    name: 'pageview',
    args: {
      page: pageName ?? document.location.pathname,
      locationOrigin: document.location.origin,
    },
    metadata: {
      tracking_id: getTrackingId(),
      referrer_url: getReferrerUrl(),
      source: getTrafficSource(),
      affiliate_id: getAffiliateId() ?? undefined,
      referrer: getAffiliateId() ?? undefined,
      category: getTrafficCategory() ?? undefined,
      title: getTrafficTitle() ?? undefined,
      tag: getTrafficTag() ?? undefined,
    },
  };

  await _eventService.sendEvent(event);
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
  assertInitialized();
  assertBrowserContext();

  const event: FuulEvent = {
    name: 'connect_wallet',
    args: {},
    metadata: {
      tracking_id: getTrackingId(),
    },
  };

  if (userMetadata?.address) {
    event.user_address = userMetadata.address;
  }

  if (userMetadata?.signature) {
    event.signature = userMetadata?.signature;
    event.signature_message = userMetadata?.message;
  }

  await _eventService.sendEvent(event);
}

/**
 * Creates a code registered to an affiliate address
 * @param {string} address Affiliate wallet address
 * @param {string} code Affiliate code to map address to
 * @param {string} signature Signed message authenticating address ownership. Message to be signed: `I confirm that I am creating the ${code} code on Fuul`
 * @example
 * ```typescript
 * await Fuul.createAffiliateCode('0x12345', 'my-cool-code', '<signature>')
 * ```
 **/
export async function createAffiliateCode(address: string, code: string, signature: string): Promise<void> {
  assertInitialized();
  await _affiliateService.create(address, code, signature);
}

/**
 * Updates the code registered to an affiliate address
 * @param {string} address Affiliate wallet address
 * @param {string} code New affiliate code
 * @param {string} signature Signed message authenticating code update. Message to be signed: `I confirm that I am updating my code to ${code} on Fuul`
 * @example
 * ```typescript
 * await Fuul.updateAffiliateCode('0x12345', 'my-new-cool-code', '<signature>')
 * ```
 **/
export async function updateAffiliateCode(address: string, code: string, signature: string): Promise<void> {
  assertInitialized();
  await _affiliateService.update(address, code, signature);
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
  assertInitialized();
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
  assertInitialized();
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
  assertInitialized();
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

/**
 * Gets the project payouts leaderboard
 * @param {GetPayoutsLeaderboardParams} params The search params
 * @returns {LeaderboardResponse<PayoutsLeaderboard>} Payouts leaderboard response
 * @example
 * ```typescript
 * const results = await Fuul.getPayoutsLeaderboard({ currency_address: '0x12345' }});
 * ```
 **/
export function getPayoutsLeaderboard(params: GetPayoutsLeaderboardParams): Promise<LeaderboardResponse<PayoutsLeaderboard>> {
  return _payoutService.getPayoutsLeaderboard(params);
}

/**
 * Gets the project points leaderboard
 * @param {GetPointsLeaderboardParams} params The search params
 * @returns {LeaderboardResponse<PointsLeaderboard>} Points leaderboard response
 * @example
 * ```typescript
 * const results = await Fuul.getPointsLeaderboard({ currency_address: '0x12345' }});
 * ```
 **/
export function getPointsLeaderboard(params: GetPointsLeaderboardParams): Promise<LeaderboardResponse<PointsLeaderboard>> {
  return _payoutService.getPointsLeaderboard(params);
}

/**
 * Gets the user payouts by conversion
 * @param {GetUserPayoutsByConversionParams} params The search params
 * @returns {UserPayoutsByConversionResponse} User payouts by conversion
 * @example
 * ```typescript
 * const results = await Fuul.getUserPayoutsByConversion({ user_address: '0x12345' }});
 * ```
 **/
export function getUserPayoutsByConversion(params: GetUserPayoutsByConversionParams): Promise<UserPayoutsByConversionResponse> {
  return _payoutService.getUserPayoutsByConversion(params);
}

/**
 * Gets user points by conversion
 * @param {GetUserPointsByConversionParams} params The search params
 * @returns {UserPointsByConversionResponse} User points by conversion
 * @example
 * ```typescript
 * const results = await Fuul.getUserPointsByConversion({ user_address: '0x12345' }});
 * ```
 **/
export function getUserPointsByConversion(params: GetUserPointsByConversionParams): Promise<UserPointsByConversionResponse> {
  return _payoutService.getUserPointsByConversion(params);
}

/**
 * Gets user payout movements
 * @param {UserPayoutMovementsParams} params The search params
 * @returns {UserPayoutMovementsResponse} User payout movements
 * @example
 * ```typescript
 * const results = await Fuul.getUserPayoutMovements({ user_address: '0x12345' }});
 * ```
 **/
export function getUserPayoutMovements(params: GetUserPayoutMovementsParams): Promise<UserPayoutMovementsResponse> {
  return _payoutService.getUserPayoutMovements(params);
}


/**
 * Gets user point movements
 * @param {UserPointsMovementsParams} params The search params
 * @returns {UserPointsMovementsResponse} User payout movements
 * @example
 * ```typescript
 * const results = await Fuul.getUserPointsMovements({ user_address: '0x12345' }});
 * ```
 **/
export function getUserPointsMovements(params: GetUserPointsMovementsParams): Promise<UserPointsMovementsResponse> {
  return _payoutService.getUserPointsMovements(params);
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
  getPayoutsLeaderboard,
  getPointsLeaderboard,
  getUserPayoutsByConversion,
  getUserPointsByConversion
};
