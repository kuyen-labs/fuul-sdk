import { ConversionService } from './infrastructure/conversions/conversionService';
import { ConversionDTO } from './infrastructure/conversions/dtos';
import { HttpClient } from './infrastructure/http/HttpClient';
import { EventArgs, FuulSettings, SendEventRequest,UserMetadata } from './types';
import { saveSentEvent, shouldSendEvent } from './utils/events';
import {
  getAffiliateId,
  getTrackingId,
  getTrafficCategory,
  getTrafficReferrerUrl,
  getTrafficSource,
  getTrafficTag,
  getTrafficTitle,
  saveTrackingId,
  saveUrlParams,
} from './utils/localStorage';

const DEFAULT_BASE_API_URL = 'https://api.fuul.xyz/api/v1/';

let _initialized = false;
let _debug = false;

let _apiKey: string;
let _httpClient: HttpClient;
let _settings: FuulSettings;
let _conversionService: ConversionService;

function init(apiKey: string, settings: FuulSettings = {}) {
  if (_initialized) {
    console.warn(`Fuul SDK: SDK was already initialized. Calling init() multiple times has no effect.`);
    return;
  }

  assertBrowserEnvironment();

  _apiKey = apiKey;
  assertValidApiKey();

  _settings = settings;
  if (_settings.debug) {
    _debug = true;
  }

  _httpClient = createApiClient();
  _conversionService = new ConversionService(_httpClient);

  saveTrackingId();
  saveUrlParams();

  _initialized = true;
  _debug && console.debug('Fuul SDK: Initialization complete!');
}

function isInitialized(): boolean {
  return _initialized;
}

function assertInitialized() {
  if (!isInitialized()) {
    throw new Error('Fuul SDK: Not initialized. Remember to call init() before using Fuul SDK.');
  }
}

function assertValidApiKey() {
  if (!_apiKey) {
    throw new Error('Fuul SDK: Invalid API key');
  }
}

function assertBrowserEnvironment() {
  const isBrowserUndefined = typeof window === 'undefined' || typeof document === 'undefined';
  if (isBrowserUndefined) {
    throw new Error(
      'Fuul SDK: Browserless environment not supported. Please use "typeof window !== undefined" to check if you are in the browser environment.',
    );
  }
}

function createApiClient() {
  return new HttpClient({
    baseURL: _settings.baseApiUrl || DEFAULT_BASE_API_URL,
    timeout: 10000,
    apiKey: _apiKey,
    ...(_settings.defaultQueryParams && { queryParams: _settings.defaultQueryParams }),
  });
}

/**
 * @param {string} name Event name
 * @param {EventArgs} args Event arguments
 * @param {UserMetadata} metadata Event metadata like userAddress, signature, signatureMessage
 * @returns {Promise<void>}
 * @example
 * ```typescript
 * Fuul.sendEvent('my_event', { value: 10 }, { userAddress: '0x01' })
 * ```
 */
async function sendEvent(name: string, args: EventArgs = {}, metadata: UserMetadata = {}): Promise<void> {
  assertInitialized();

  const tracking_id = getTrackingId();
  const affiliateId = getAffiliateId();
  const source = getTrafficSource();
  const category = getTrafficCategory();
  const title = getTrafficTitle();
  const tag = getTrafficTag();
  const referrerUrl = getTrafficReferrerUrl();

  if (!tracking_id) return;

  const event: SendEventRequest = {
    name,
    event_args: args,
    timestamp: Math.round(Date.now() / 1000),
    metadata: {
      referrer: affiliateId,
      affiliate_id: affiliateId,
      referrer_url: referrerUrl,
      tracking_id,
      source,
      category,
      title,
      tag,
    },
    user_address: metadata.userAddress,
    signature: metadata.signature,
    signature_message: metadata.signatureMessage,
  };

  if (!shouldSendEvent(event)) {
    _debug && console.debug(`Fuul SDK: Event is considered duplicate and will not be sent`, event);
    return;
  }

  _debug && console.debug(`Fuul SDK: Send event attempt`, event);
  const result = await _httpClient.post('events', event);
  _debug && console.debug(`Fuul SDK: Event sent`, event, result);

  saveSentEvent(event);
}

/**
 * @param {UserMetadata} userMetadata Metadata from the user that is connecting the wallet
 * @see https://docs.fuul.xyz/technical-guide-for-projects/sending-events-through-the-fuul-sdk#connect-wallet-event
 * @returns {Promise<void>}
 * @example
 * ```typescript
 * Fuul.sendConnectWalletEvent({
 *     userAddress: '0x12345',
 *     signature: '0xaad9a0b62f87c15a248cb99ca926785b828b5',
 *     signatureMessage: 'Accept referral from Fuul'
 * })
 * ```
 */
async function sendConnectWalletEvent(userMetadata: UserMetadata): Promise<void> {
  await sendEvent('connect_wallet', {}, userMetadata);
}

async function sendPageViewEvent(page?: string) {
  await sendEvent('pageview', {
    page: page ?? document.location.href,
  });
}

function verifyConnection(): void {
  assertInitialized();
  console.log('Fuul SDK: You are successfully connected! ✅');
}

/**
 * Generates a tracking link for a referrer
 * @param {string} referrerAddress - Referrer wallet address
 * @param {string} projectId - Project ID
 * @param {string} baseUrl - Base URL of your app. Defaults to window.location.href
 * @returns {string} tracking link
 **/
function generateTrackingLink(referrerAddress: string, projectId: string, baseUrl?: string): string {
  const qp = `p=${projectId}&source=fuul&referrer=${referrerAddress}`;
  return `${baseUrl ?? window.location.href}?${qp}`;
}

async function getAllConversions(): Promise<ConversionDTO[]> {
  return _conversionService.getAll();
}

export default {
  init,
  isInitialized,
  sendEvent,
  sendConnectWalletEvent,
  sendPageViewEvent,
  verifyConnection,
  getAllConversions,
  generateTrackingLink,
};
