import { AffiliateService } from './affiliates/AffiliateService';
import { AudienceService } from './audiences/AudienceService';
import { ConversionService } from './ConversionService';
import { EventService } from './EventService';
import { ChainParams, ListingResponse, PaginationParams, ProjectDetails, RewardDetails, RewardItem } from './explorer/explorer.types';
import { ExplorerService } from './explorer/ExplorerService';
import { HttpClient } from './HttpClient';
import { LeaderboardService } from './leaderboard/LeaderboardService';
import { PayoutService } from './payouts/PayoutService';
import { getAffiliateId, getReferrerUrl, getTrackingId, getTrafficCategory, getTrafficSource, getTrafficTag, getTrafficTitle } from './tracking';
import {
  Conversion,
  FuulEvent,
  GetConversionsParams,
  GetPayoutsLeaderboardParams,
  GetPointsLeaderboardParams,
  GetReferredUsersLeaderboardParams,
  GetUserAudiencesParams,
  GetUserAudiencesResponse,
  GetUserPayoutMovementsParams,
  GetUserPayoutsByConversionParams,
  GetUserPointsByConversionParams,
  GetUserPointsMovementsParams,
  GetVolumeLeaderboardParams,
  LeaderboardResponse,
  PayoutsLeaderboard,
  PointsLeaderboard,
  ReferredUsersLeaderboard,
  UserPayoutMovementsResponse,
  UserPayoutsByConversionResponse,
  UserPointsByConversionResponse,
  UserPointsMovementsResponse,
  VolumeLeaderboard,
} from './types/api';
import { AffiliateCodeParams, AffiliateLinkParams, EventArgs, FuulSettings, UserMetadata } from './types/sdk';
import { GetUserAffiliatesParams, UserAffiliate } from './user/types';
import { UserService } from './user/UserService';

const FUUL_API_DEFAULT_ENDPOINT_URI = 'https://api.fuul.xyz/api/v1/';

let _debug = false;
let _initialized = false;
let _apiKey: string;
let _httpClient: HttpClient;
let _conversionService: ConversionService;
let _userService: UserService;
let _affiliateService: AffiliateService;
let _eventService: EventService;
let _payoutService: PayoutService;
let _explorerService: ExplorerService;
let _audienceService: AudienceService;
let _leaderboardService: LeaderboardService;

export function init(settings: FuulSettings) {
  _debug = !!settings.debug;

  if (_initialized) {
    return;
  }

  _apiKey = settings.apiKey;
  assertValidApiKey();

  _httpClient = createApiClient(settings.baseApiUrl ?? FUUL_API_DEFAULT_ENDPOINT_URI, settings.defaultQueryParams ?? {});

  _conversionService = new ConversionService({ httpClient: _httpClient, debug: _debug });
  _eventService = new EventService({ httpClient: _httpClient, debug: _debug });
  _affiliateService = new AffiliateService({ httpClient: _httpClient, debug: _debug });
  _payoutService = new PayoutService({ httpClient: _httpClient, debug: _debug });
  _explorerService = new ExplorerService({ httpClient: _httpClient, debug: _debug });
  _userService = new UserService({ httpClient: _httpClient });
  _audienceService = new AudienceService({ httpClient: _httpClient, debug: _debug });
  _leaderboardService = new LeaderboardService({ httpClient: _httpClient });

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
  detectAutomation();

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
  detectAutomation();

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
 *
 *
 * // You can also send the account chain id if you are using a smart contract account (EIP-1271)
 * sendConnectWallet({
 *  userAddress: '0x12345',
 *  signature: '0xaad9a0b62f87c15a248cb99ca926785b828b5',
 *  signatureMessage: 'Accept referral from Fuul'
 *  accountChainId: 8453,
 * })
 * ```
 */
export async function sendConnectWallet(userMetadata: UserMetadata): Promise<void> {
  assertInitialized();
  assertBrowserContext();
  detectAutomation();

  const event: FuulEvent = {
    name: 'connect_wallet',
    args: {
      page: document.location.pathname,
      locationOrigin: document.location.origin,
    },
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

  if (userMetadata?.accountChainId) {
    event.account_chain_id = userMetadata.accountChainId;
  }

  await _eventService.sendEvent(event);
}

/**
 * Creates a code registered to an affiliate address
 * @param {object} params Create affiliate code parameters
 * @param {string} params.address Affiliate wallet address
 * @param {string} params.code Affiliate code to map address to
 * @param {string} params.signature Signed message authenticating address ownership. Message to be signed: `I confirm that I am creating the ${code} code on Fuul`
 * @param {number} [params.accountChainId] Account chain id (required for EIP-1271 signature validation)
 * @example
 * ```typescript
 * await Fuul.createAffiliateCode({
 *   address: '0x12345',
 *   code: 'my-cool-code',
 *   signature: '<signature>'
 * })
 * ```
 **/
export async function createAffiliateCode(params: AffiliateCodeParams): Promise<void> {
  assertInitialized();
  await _affiliateService.create(params.address, params.code, params.signature, params.accountChainId);
}

/**
 * Updates the code registered to an affiliate address
 * @param {object} params Update affiliate code parameters
 * @param {string} params.address Affiliate wallet address
 * @param {string} params.code New affiliate code
 * @param {string} params.signature Signed message authenticating code update. Message to be signed: `I confirm that I am updating my code to ${code} on Fuul`
 * @param {number} [params.accountChainId] Account chain id (required for EIP-1271 signature validation)
 * @example
 * ```typescript
 * await Fuul.updateAffiliateCode({
 *   address: '0x12345',
 *   code: 'my-new-cool-code',
 *   signature: '<signature>'
 * })
 * ```
 **/
export async function updateAffiliateCode(params: AffiliateCodeParams): Promise<void> {
  assertInitialized();
  await _affiliateService.update(params.address, params.code, params.signature, params.accountChainId);
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
export async function generateTrackingLink(baseUrl: string, affiliateAddress: string, params?: AffiliateLinkParams): Promise<string> {
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
 * const results = await Fuul.getPayoutsLeaderboard({ currency_address: '0x12345', page: 1, page_size: 10 });
 * ```
 **/
export function getPayoutsLeaderboard(params: GetPayoutsLeaderboardParams): Promise<LeaderboardResponse<PayoutsLeaderboard>> {
  return _leaderboardService.getPayoutsLeaderboard(params);
}

/**
 * Gets the project points leaderboard
 * @param {GetPointsLeaderboardParams} params The search params
 * @returns {LeaderboardResponse<PointsLeaderboard>} Points leaderboard response
 * @example
 * ```typescript
 * const results = await Fuul.getPointsLeaderboard({ currency_address: '0x12345', page: 1, page_size: 10 });
 * ```
 **/
export function getPointsLeaderboard(params: GetPointsLeaderboardParams): Promise<LeaderboardResponse<PointsLeaderboard>> {
  return _leaderboardService.getPointsLeaderboard(params);
}

/**
 * Gets the referred users leaderboard
 * @param params {GetReferredUsersLeaderboardParams} The search params
 * @returns {LeaderboardResponse<ReferredUsersLeaderboard>} Referred users leaderboard response
 * @example
 * ```typescript
 * const results = await Fuul.getReferredUsersLeaderboard({ page: 1, page_size: 10 });;
 * ```
 */
export function getReferredUsersLeaderboard(params: GetReferredUsersLeaderboardParams): Promise<LeaderboardResponse<ReferredUsersLeaderboard>> {
  return _leaderboardService.getReferredUsersLeaderboard(params);
}

/**
 * Gets the project value leaderboard, the amounts are converted into UDSC
 * @param {GetVolumeLeaderboardParams} params The search params
 * @returns {LeaderboardResponse<VolumeLeaderboard>} Value leaderboard response
 * @example
 * ```typescript
 * const results = await Fuul.getVolumeLeaderboard({ user_address: '0x12345' }})
 * ```
 **/
export function getVolumeLeaderboard(params: GetVolumeLeaderboardParams): Promise<LeaderboardResponse<VolumeLeaderboard>> {
  return _payoutService.getVolumeLeaderboard(params);
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

/**
 * Gets user point movements
 * @param {GetConversionsParams} params The search params
 * @returns {Conversion[]} List of conversions
 * @example
 * ```typescript
 * const results = await Fuul.getConversions({ user_address: '0x12345' }});
 * ```
 **/
export async function getConversions(params?: GetConversionsParams): Promise<Conversion[]> {
  assertInitialized();
  return _conversionService.getAll(params);
}

/**
 *
 * @param {GetUserAffiliatesParams} params The query params
 * @returns {Promise<UserAffiliate[]>} List of user affiliates
 * @example
 * ```typescript
 * const results = await Fuul.getUserAffiliates({ user_address: '0x12345' });
 * ```
 */
export async function getUserAffiliates(params: GetUserAffiliatesParams): Promise<UserAffiliate[]> {
  assertInitialized();
  return _userService.getUserAffiliates(params);
}

/**
 *
 * @param {GetUserAudiencesParams} params The query params
 * @returns {Promise<GetUserAudiencesResponse>} List of user audiences
 * ```typescript
 * const results = await Fuul.getUserAudiences({ user_address: '0x12345' });
 * ```
 *
 */
export async function getUserAudiences(params: GetUserAudiencesParams): Promise<GetUserAudiencesResponse> {
  assertInitialized();
  return _audienceService.getUserAudiences(params);
}

/**
 * Gets incentive rewards listing
 * @param {PaginationParams & ChainParams} params The search params
 * @returns {ListingResponse<RewardItem>} Incentive rewards listing
 * @example
 * ```typescript
 * const results = await Fuul.getIncentiveRewards({ page: 1, page_size: 25 });
 * ```
 **/
export function getIncentiveRewards(params: PaginationParams & ChainParams): Promise<ListingResponse<RewardItem>> {
  return _explorerService.getIncentiveRewards(params);
}

/**
 * Gets referral rewards listing
 * @param {PaginationParams & ChainParams} params The search params
 * @returns {ListingResponse<RewardItem>} Referral rewards listing
 * @example
 * ```typescript
 * const results = await Fuul.getReferralRewards({ page: 1, page_size: 25 });
 * ```
 **/
export function getReferralRewards(params: PaginationParams & ChainParams): Promise<ListingResponse<RewardItem>> {
  return _explorerService.getReferralRewards(params);
}

/**
 * Gets reward details
 * @param {object} params The search params
 * @returns {RewardDetails} Reward details
 * @example
 * ```typescript
 * const results = await Fuul.getRewardDetails({ type: 'incentive', project_id: '123' });
 * ```
 **/
export function getRewardDetails(params: {
  type: 'incentive' | 'referral';
  project_id: string;
  conversion_external_id?: string;
}): Promise<RewardDetails> {
  return _explorerService.getRewardDetails(params);
}

/**
 * Gets project details
 * @param {object} params The search params
 * @returns {ProjectDetails} Project details
 * @example
 * ```typescript
 * const results = await Fuul.getProjectDetails();
 * ```
 **/
export function getProjectDetails(params: { project_id: string }): Promise<ProjectDetails> {
  return _explorerService.getProjectDetails(params.project_id);
}

function assertBrowserContext(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error(`Fuul SDK: Browser context required`);
  }
}

function detectAutomation(): void {
  if (navigator.webdriver) {
    throw new Error(`Fuul SDK: You are using a browser automation tool`);
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
  getReferredUsersLeaderboard,
  getUserAudiences,
  getUserPayoutsByConversion,
  getUserPointsByConversion,
  getUserPointsMovements,
  getUserPayoutMovements,
  getUserAffiliates,
  getVolumeLeaderboard,
  getIncentiveRewards,
  getReferralRewards,
  getRewardDetails,
  getProjectDetails,
};
