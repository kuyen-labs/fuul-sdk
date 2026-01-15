import { UserIdentifierType } from '.';
import { AffiliatePortalService } from './affiliate-portal/AffiliatePortalService';
import { GetAffiliateStatsParams, GetAffiliateStatsResponse, GetNewTradersParams, NewTraderResponse } from './affiliate-portal/types';
import { AffiliateService } from './affiliates/AffiliateService';
import { AudienceService } from './audiences/AudienceService';
import { ClaimCheckService } from './claim-checks/ClaimCheckService';
import { GetClaimableChecksParams, GetClaimableChecksResponse, GetClaimCheckTotalsParams, GetClaimCheckTotalsResponse } from './claim-checks/types';
import { ConversionService } from './ConversionService';
import { EventService } from './EventService';
import { HttpClient } from './HttpClient';
import { LeaderboardService } from './leaderboard/LeaderboardService';
import { PayoutService } from './payouts/PayoutService';
import { ReferralCodeService } from './referral-codes/ReferralCodeService';
import { getAffiliateId, getReferrerUrl, getTrackingId, getTrafficCategory, getTrafficSource, getTrafficTag, getTrafficTitle } from './tracking';
import {
  Affiliate,
  Conversion,
  DeleteReferralParams,
  FuulEvent,
  GenerateReferralCodesParams,
  GenerateReferralCodesResponse,
  GetConversionsParams,
  GetPayoutsByReferrerParams,
  GetPayoutsLeaderboardParams,
  GetPointsLeaderboardParams,
  GetReferralCodeParams,
  GetReferralCodeResponse,
  GetReferralStatusParams,
  GetReferralStatusResponse,
  GetReferredUsersLeaderboardParams,
  GetReferredVolumeParams,
  GetRevenueLeaderboardParams,
  GetUserAudiencesParams,
  GetUserAudiencesResponse,
  GetUserPayoutMovementsParams,
  GetUserPayoutsByConversionParams,
  GetUserPointsByConversionParams,
  GetUserPointsMovementsParams,
  GetVolumeLeaderboardParams,
  LeaderboardResponse,
  ListUserReferralCodesParams,
  ListUserReferralCodesResponse,
  PayoutsByReferrerResponse,
  PayoutsLeaderboard,
  PointsLeaderboard,
  ReferredUsersLeaderboard,
  ReferredVolumeResponse,
  RevenueLeaderboard,
  UpdateReferralCodeParams,
  UseReferralCodeParams,
  UserPayoutMovementsResponse,
  UserPayoutsByConversionResponse,
  UserPointsByConversionResponse,
  UserPointsMovementsResponse,
  VolumeLeaderboard,
} from './types/api';
import { AffiliateCodeParams, AffiliateLinkParams, EventArgs, FuulSettings, IdentifyUserParams } from './types/sdk';
import { GetUserReferrerParams, GetUserReferrerResponse } from './user/types';
import { UserService } from './user/UserService';

const FUUL_API_DEFAULT_ENDPOINT_URI = 'https://api.fuul.xyz/api/v1/';

let _debug = false;
let _initialized = false;
let _apiKey: string;
let _httpClient: HttpClient;
let _conversionService: ConversionService;
let _userService: UserService;
let _affiliateService: AffiliateService;
let _affiliatePortalService: AffiliatePortalService;
let _eventService: EventService;
let _payoutService: PayoutService;
let _audienceService: AudienceService;
let _leaderboardService: LeaderboardService;
let _referralCodeService: ReferralCodeService;
let _claimCheckService: ClaimCheckService;

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
  _affiliatePortalService = new AffiliatePortalService({ httpClient: _httpClient });
  _payoutService = new PayoutService({ httpClient: _httpClient, debug: _debug });
  _userService = new UserService({ httpClient: _httpClient });
  _audienceService = new AudienceService({ httpClient: _httpClient, debug: _debug });
  _leaderboardService = new LeaderboardService({ httpClient: _httpClient });
  _referralCodeService = new ReferralCodeService({ httpClient: _httpClient, debug: _debug });
  _claimCheckService = new ClaimCheckService({ httpClient: _httpClient, debug: _debug });

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
 * @see https://docs.fuul.xyz/for-devs/tracking-referrals-in-your-app#pageview-event
 * @returns {Promise<void>}
 * @example
 * ```typescript
 * sendPageview({ page: '/home' })
 * sendPageview({ page: '/product/123' })
 * ```
 */
export async function sendPageview(pageName?: string, projectIds?: string[]): Promise<void> {
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

  await _eventService.sendEvent(event, projectIds);
}

/**
 * @param {IdentifyUserParams} IdentifyUserParams Identify user params
 * @see https://docs.fuul.xyz/for-devs/tracking-referrals-in-your-app#connect-wallet-event
 * @returns {Promise<void>}
 * @example
 * ```typescript
 * identifyUser({
 *   identifier: '0x12345',
 *   identifierType: UserIdentifierType.EvmAddress,
 *   signature: '0xaad9a0b62f87c15a248cb99ca926785b828b5',
 *   message: 'Accept referral from Fuul',
 *   signaturePublicKey: '<public-key>' // optional
 * })
 *
 *
 * // You can also send the account chain id if you are using a smart contract account (EIP-1271)
 * identifyUser({
 *  identifier: '0x12345',
 *  identifierType: UserIdentifierType.EvmAddress,
 *  signature: '0xaad9a0b62f87c15a248cb99ca926785b828b5',
 *  message: 'Accept referral from Fuul',
 *  signaturePublicKey: '<public-key>', // optional
 *  accountChainId: 8453,
 * })
 * ```
 */
export async function identifyUser(params: IdentifyUserParams, projectIds?: string[]): Promise<void> {
  assertInitialized();
  assertBrowserContext();
  detectAutomation();

  const event: FuulEvent = {
    name: 'connect_wallet',
    user: {
      identifier: params.identifier,
      identifier_type: params.identifierType,
    },
    args: {
      page: document.location.pathname,
      locationOrigin: document.location.origin,
    },
    metadata: {
      tracking_id: getTrackingId(),
    },
  };

  if (params?.signature) {
    event.signature = params?.signature;
    event.signature_message = params?.message;
  }

  if (params?.signaturePublicKey) {
    event.signature_public_key = params.signaturePublicKey;
  }

  if (params?.accountChainId) {
    event.account_chain_id = params.accountChainId;
  }

  await _eventService.sendEvent(event, projectIds);
}

/**
 * Creates a code registered to an affiliate address
 * @param {object} params Create affiliate code parameters
 * @param {string} params.userIdentifier The affiliate identifier
 * @param {UserIdentifierType} params.identifierType The affiliate identifier type
 * @param {string} params.code Affiliate code to map address to
 * @param {string} params.signature Signed message authenticating address ownership. Message to be signed: `I confirm that I am creating the ${code} code on Fuul`
 * @param {string} [params.signaturePublicKey] Public key used for signature verification
 * @param {number} [params.accountChainId] Account chain id (required for EIP-1271 signature validation)
 * @param {number} [params.userRebateRate] Percentage of rewards split to the user
 * @example
 * ```typescript
 * await Fuul.createAffiliateCode({
 *   userIdentifier: '0x12345',
 *   identifierType: UserIdentifierType.EvmAddress,
 *   code: 'my-cool-code',
 *   signature: '<signature>',
 *   signaturePublicKey: '<public-key>' // optional
 * })
 * ```
 **/
export async function createAffiliateCode(params: AffiliateCodeParams): Promise<void> {
  assertInitialized();
  await _affiliateService.create(
    params.userIdentifier,
    params.identifierType,
    params.code,
    params.signature,
    params.signaturePublicKey,
    params.accountChainId,
    params.userRebateRate,
  );
}

/**
 * Updates the code registered to an affiliate address
 * @param {object} params Update affiliate code parameters
 * @param {string} params.userIdentifier Affiliate identifier
 * @param {UserIdentifierType} params.identifierType Affiliate identifier type
 * @param {string} params.code New affiliate code
 * @param {string} params.signature Signed message authenticating code update. Message to be signed: `I confirm that I am updating my code to ${code} on Fuul`
 * @param {string} [params.signaturePublicKey] Public key used for signature verification
 * @param {number} [params.accountChainId] Account chain id (required for EIP-1271 signature validation)
 * @param {number} [params.userRebateRate] Percentage of rewards split to the user
 * @example
 * ```typescript
 * await Fuul.updateAffiliateCode({
 *   userIdentifier: '0x12345',
 *   identifierType: UserIdentifierType.EvmAddress,
 *   code: 'my-new-cool-code',
 *   signature: '<signature>',
 *   signaturePublicKey: '<public-key>' // optional
 * })
 * ```
 **/
export async function updateAffiliateCode(params: AffiliateCodeParams): Promise<void> {
  assertInitialized();
  await _affiliateService.update(
    params.userIdentifier,
    params.identifierType,
    params.code,
    params.signature,
    params.signaturePublicKey,
    params.accountChainId,
    params.userRebateRate,
  );
}

/**
 * Gets the affiliate code for a given identifier
 * @param {string} userIdentifier Affiliate identifier
 * @param {UserIdentifierType} identifierType Affiliate identifier type
 * @returns {Affiliate | null} Affiliate code data
 * @example
 * ```typescript
 * const affiliateCode = await Fuul.getAffiliateCode('0x12345', UserIdentifierType.EvmAddress);
 * ```
 **/
export async function getAffiliateCode(userIdentifier: string, identifierType: UserIdentifierType): Promise<Affiliate | null> {
  assertInitialized();
  return await _affiliateService.getCode(userIdentifier, identifierType);
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
 * @param {string} affiliateAddress Affiliate identifier
 * @param {UserIdentifierType} identifierType The affiliate identifier type
 * @param {AffiliateLinkParams} params Optional tracking parameters
 * @returns {string} Tracking link
 * @example
 * ```typescript
 * const trackingLink = Fuul.generateTrackingLink('https://myproject.com', '0x12345')
 * console.log(trackingLink) // https://myproject.com?af=0x12345
 * ```
 * @see https://docs.fuul.xyz/for-devs/building-your-incentives-hub-in-your-app-white-label/creating-affiliate-links-or-codes
 **/
export async function generateTrackingLink(
  baseUrl: string,
  userIdentifier: string,
  identifierType: UserIdentifierType,
  params?: AffiliateLinkParams,
): Promise<string> {
  assertInitialized();
  const affiliate = await _affiliateService.getCode(userIdentifier, identifierType);
  const qp = new URLSearchParams({
    af: affiliate?.code ?? userIdentifier,
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
 * const results = await Fuul.getReferredUsersLeaderboard({ page: 1, page_size: 10 });
 * ```
 */
export function getReferredUsersLeaderboard(params: GetReferredUsersLeaderboardParams): Promise<LeaderboardResponse<ReferredUsersLeaderboard>> {
  return _leaderboardService.getReferredUsersLeaderboard(params);
}

/**
 * Gets the referred volume for a list of user identifiers
 * @param {GetReferredVolumeParams} params The search params
 * @param {string[]} params.user_identifiers Array of user identifiers to query (min 1, max 100)
 * @param {UserIdentifierType} [params.identifier_type] The identifier type, defaults to 'evm_address'
 * @param {boolean} [params.no_cache] Whether to bypass cache, defaults to false
 * @returns {Promise<ReferredVolumeResponse>} Referred volume response with project_id, referred_volumes array, and total_count
 * @example
 * ```typescript
 * const result = await Fuul.getReferredVolume({
 *   user_identifiers: ['0x1234...', '0x5678...'],
 *   identifier_type: UserIdentifierType.EvmAddress
 * });
 * ```
 */
export function getReferredVolume(params: GetReferredVolumeParams): Promise<ReferredVolumeResponse> {
  assertInitialized();
  return _leaderboardService.getReferredVolume(params);
}

/**
 * Gets the project value leaderboard, the amounts are converted into UDSC
 * @param {GetVolumeLeaderboardParams} params The search params
 * @returns {LeaderboardResponse<VolumeLeaderboard>} Value leaderboard response
 * @example
 * ```typescript
 * const results = await Fuul.getVolumeLeaderboard({ user_identifier: '0x12345', identifier_type: UserIdentifierType.EvmAddress });
 * ```
 **/
export function getVolumeLeaderboard(params: GetVolumeLeaderboardParams): Promise<LeaderboardResponse<VolumeLeaderboard>> {
  assertInitialized();
  return _leaderboardService.getVolumeLeaderboard(params);
}

/**
 * Gets the project revenue leaderboard
 * @param {GetRevenueLeaderboardParams} params The search params
 * @returns {LeaderboardResponse<RevenueLeaderboard>} Revenue leaderboard response
 * @example
 * ```typescript
 * const results = await Fuul.getRevenueLeaderboard({ user_identifier: '0x12345', identifier_type: UserIdentifierType.EvmAddress, user_type: 'end_user' });
 * ```
 **/
export function getRevenueLeaderboard(params: GetRevenueLeaderboardParams): Promise<LeaderboardResponse<RevenueLeaderboard>> {
  assertInitialized();
  return _leaderboardService.getRevenueLeaderboard(params);
}

/**
 * Gets the user payouts by conversion
 * @param {GetUserPayoutsByConversionParams} params The search params
 * @returns {UserPayoutsByConversionResponse} User payouts by conversion
 * @example
 * ```typescript
 * const results = await Fuul.getUserPayoutsByConversion({ user_identifier: '0x12345',  identifier_type: UserIdentifierType.EvmAddress });
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
 * const results = await Fuul.getUserPointsByConversion({ user_identifier: '0x12345', identifier_type: UserIdentifierType.EvmAddress });
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
 * const results = await Fuul.getUserPayoutMovements({ user_identifier: '0x12345', identifier_type: UserIdentifierType.EvmAddress });
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
 * const results = await Fuul.getUserPointsMovements({ user_identifier: '0x12345', identifier_type: UserIdentifierType.EvmAddress }};
 * ```
 **/
export function getUserPointsMovements(params: GetUserPointsMovementsParams): Promise<UserPointsMovementsResponse> {
  return _payoutService.getUserPointsMovements(params);
}

/**
 * Gets payouts and volumes by referrer
 * @param {GetPayoutsByReferrerParams} params The search params
 * @returns {PayoutsByReferrerResponse} Object where each key is a referrer address with volume and earnings
 * @example
 * ```typescript
 * const results = await Fuul.getPayoutsByReferrer({ user_identifier: '0x12345', user_identifier_type: UserIdentifierType.EvmAddress });
 * ```
 **/
export function getPayoutsByReferrer(params: GetPayoutsByReferrerParams): Promise<PayoutsByReferrerResponse> {
  assertInitialized();
  return _payoutService.getPayoutsByReferrer(params);
}

/**
 * Gets user point movements
 * @param {GetConversionsParams} params The search params
 * @returns {Conversion[]} List of conversions
 * @example
 * ```typescript
 * const results = await Fuul.getConversions({ user_identifier: '0x12345', identifier_type: UserIdentifierType.EvmAddress });
 * ```
 **/
export async function getConversions(params?: GetConversionsParams): Promise<Conversion[]> {
  assertInitialized();
  return _conversionService.getAll(params);
}

/**
 * Gets the referrer information for a user
 * @param {GetUserReferrerParams} params The query params
 * @returns {Promise<GetUserReferrerResponse>} User referrer information
 * @example
 * ```typescript
 * const result = await Fuul.getUserReferrer({
 *   user_identifier: '0x12345',
 *   user_identifier_type: UserIdentifierType.EvmAddress
 * });
 * // result: { user_identifier: '0x12345', referrer_identifier: '0xabcde' }
 * ```
 */
export async function getUserReferrer(params: GetUserReferrerParams): Promise<GetUserReferrerResponse> {
  assertInitialized();
  return _userService.getUserReferrer(params);
}

/**
 *
 * @param {GetUserAudiencesParams} params The query params
 * @returns {Promise<GetUserAudiencesResponse>} List of user audiences
 * @example
 * ```typescript
 * const results = await Fuul.getUserAudiences({ user_identifier: '0x12345', user_identifier_type: 'evm_address' });
 * ```
 *
 */
export async function getUserAudiences(params: GetUserAudiencesParams): Promise<GetUserAudiencesResponse> {
  assertInitialized();
  return _audienceService.getUserAudiences(params);
}

/**
 * Lists referral codes for a user
 * @param {ListUserReferralCodesParams} params List user referral codes parameters
 * @returns {Promise<ListUserReferralCodesResponse>} List of user referral codes with pagination
 * @example
 * ```typescript
 * const result = await Fuul.listUserReferralCodes({
 *   user_identifier: '0x12345',
 *   user_identifier_type: UserIdentifierType.EvmAddress,
 *   page: 1,
 *   page_size: 25
 * });
 * ```
 */
export async function listUserReferralCodes(params: ListUserReferralCodesParams): Promise<ListUserReferralCodesResponse> {
  assertInitialized();
  return _referralCodeService.listUserReferralCodes(params);
}

/**
 * Generates referral codes for a user
 * @param {GenerateReferralCodesParams} params Generate referral codes parameters
 * @returns {Promise<GenerateReferralCodesResponse[]>} Generated referral codes
 * @example
 * ```typescript
 * const codes = await Fuul.generateReferralCodes({
 *   user_identifier: '0x12345',
 *   user_identifier_type: UserIdentifierType.EvmAddress,
 *   quantity: 5,
 *   max_uses: 10
 * });
 * ```
 */
export async function generateReferralCodes(params: GenerateReferralCodesParams): Promise<GenerateReferralCodesResponse[]> {
  assertInitialized();
  return _referralCodeService.generateReferralCodes(params);
}

/**
 * Gets the referral status for a user
 * @param {GetReferralStatusParams} params Get referral status parameters
 * @returns {Promise<GetReferralStatusResponse>} referral status
 * @example
 * ```typescript
 * const status = await Fuul.getReferralStatus({
 *   user_identifier: '0x12345',
 *   user_identifier_type: UserIdentifierType.EvmAddress
 * });
 * if (status.referred) {
 *   console.log('User was referred with code:', status.code);
 * }
 * ```
 */
export async function getReferralStatus(params: GetReferralStatusParams): Promise<GetReferralStatusResponse> {
  assertInitialized();
  return _referralCodeService.getReferralStatus(params);
}

/**
 * Checks if an referral code is free to use
 * @param {GetReferralCodeParams} params Check referral code parameters
 * @returns {Promise<GetReferralCodeResponse>} Check result
 * @example
 * ```typescript
 * const result = await Fuul.getReferralCode({ code: 'abc1234' });
 * if (result.available) {
 *   console.log('Referral code is available!');
 * }
 * ```
 */
export async function getReferralCode(params: GetReferralCodeParams): Promise<GetReferralCodeResponse> {
  assertInitialized();
  return _referralCodeService.getReferralCode(params);
}

/**
 * Uses an referral code
 * @param {UseReferralCodeParams} params Use referral code parameters
 * @returns {Promise<void>}
 * @example
 * ```typescript
 * await Fuul.useReferralCode({
 *   code: 'abc1234',
 *   user_identifier: '0x12345',
 *   user_identifier_type: UserIdentifierType.EvmAddress,
 *   signature: '0xaad9a0b62f87c15a248cb99ca926785b828b5',
 *   signature_message: 'I am using referral code abc1234',
 * });
 * ```
 */
export async function useReferralCode(params: UseReferralCodeParams): Promise<void> {
  assertInitialized();
  return _referralCodeService.useReferralCode(params);
}

/**
 * Updates the properties of an existing referral code
 * @param {UpdateReferralCodeParams} params Update referral code parameters
 * @returns {Promise<void>}
 * @example
 * ```typescript
 * // Set maximum uses to 10
 * await Fuul.updateReferralCode({
 *   code: 'ABC1234',
 *   max_uses: 10
 * });
 *
 * // Set unlimited uses
 * await Fuul.updateReferralCode({
 *   code: 'ABC1234',
 *   max_uses: null
 * });
 *
 * // Disable code (set to 0 uses)
 * await Fuul.updateReferralCode({
 *   code: 'ABC1234',
 *   max_uses: 0
 * });
 * ```
 */
export async function updateReferralCode(params: UpdateReferralCodeParams): Promise<void> {
  assertInitialized();
  return _referralCodeService.updateReferralCode(params);
}

/**
 * Deletes a referral relationship between a user and a referrer
 * @param {DeleteReferralParams} params Delete referral parameters
 * @returns {Promise<void>}
 * @example
 * ```typescript
 * await Fuul.deleteReferral({
 *   code: 'abc1234',
 *   user_identifier: '0x12345',
 *   user_identifier_type: UserIdentifierType.EvmAddress,
 *   referrer_identifier: '0xabcde',
 *   referrer_identifier_type: UserIdentifierType.EvmAddress,
 *   signature: '0xaad9a0b62f87c15a248cb99ca926785b828b5',
 *   signature_message: 'I am deleting referral for user 0x12345 from code abc1234',
 * });
 * ```
 */
export async function deleteReferral(params: DeleteReferralParams): Promise<void> {
  assertInitialized();
  return _referralCodeService.deleteReferral(params);
}

/**
 * Gets affiliate statistics including earnings, volume, revenue and referred users
 * @param {GetAffiliateStatsParams} params Get affiliate stats parameters
 * @returns {Promise<GetAffiliateStatsResponse>} Affiliate statistics
 * @example
 * ```typescript
 * const stats = await Fuul.getAffiliateStats({
 *   user_identifier: '0x12345',
 *   user_identifier_type: UserIdentifierType.EvmAddress
 * });
 * ```
 */
export async function getAffiliateStats(params: GetAffiliateStatsParams): Promise<GetAffiliateStatsResponse> {
  assertInitialized();
  return _affiliatePortalService.getAffiliateStats(params);
}

/**
 * Gets new traders for an affiliate within a date range
 * @param {GetNewTradersParams} params Get new traders parameters
 * @returns {Promise<NewTraderResponse[]>} New traders response
 * @example
 * ```typescript
 * const newTraders = await Fuul.getAffiliateNewTraders({
 *   user_identifier: '0x12345',
 *   from: '2024-01-01',
 *   to: '2024-12-31'
 * });
 * ```
 */
export async function getAffiliateNewTraders(params: GetNewTradersParams): Promise<NewTraderResponse[]> {
  assertInitialized();
  return _affiliatePortalService.getAffiliateNewTraders(params);
}

/**
 * Gets all claimable claim checks for a user within a project
 * Returns only unclaimed checks with valid (non-expired) deadlines
 * @param {GetClaimableChecksParams} params Get claimable checks parameters
 * @returns {Promise<GetClaimableChecksResponse>} Array of claimable claim checks
 * @example
 * ```typescript
 * const claimableChecks = await Fuul.getClaimableChecks({
 *   user_identifier: '0x12345',
 *   user_identifier_type: UserIdentifierType.EvmAddress
 * });
 * console.log('Claimable checks:', claimableChecks.length);
 * claimableChecks.forEach(check => {
 *   console.log(`Amount: ${check.amount}, Currency: ${check.currency}, Deadline: ${check.deadline}`);
 * });
 * ```
 */
export async function getClaimableChecks(params: GetClaimableChecksParams): Promise<GetClaimableChecksResponse> {
  assertInitialized();
  return _claimCheckService.getClaimableChecks(params);
}

/**
 * Gets totals of claimed and unclaimed claim checks for a user
 * Includes both expired and non-expired claims, aggregated by currency
 * @param {GetClaimCheckTotalsParams} params Get claim check totals parameters
 * @returns {Promise<GetClaimCheckTotalsResponse>} Claim check totals grouped by status and currency
 * @example
 * ```typescript
 * const totals = await Fuul.getClaimCheckTotals({
 *   user_identifier: '0x12345',
 *   user_identifier_type: UserIdentifierType.EvmAddress
 * });
 * console.log('Claimed totals:', totals.claimed);
 * console.log('Unclaimed totals:', totals.unclaimed);
 * totals.unclaimed.forEach(item => {
 *   console.log(`${item.currency_name}: ${item.amount} (${item.currency_address})`);
 * });
 * ```
 */
export async function getClaimCheckTotals(params: GetClaimCheckTotalsParams): Promise<GetClaimCheckTotalsResponse> {
  assertInitialized();
  return _claimCheckService.getClaimCheckTotals(params);
}

function assertBrowserContext(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error(`Fuul SDK: Browser context required`);
  }
}

function detectAutomation(): void {
  if (navigator.webdriver) {
    throw new Error(`Fuul SDK: Error`);
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
    timeout: 30000,
    apiKey: _apiKey,
    queryParams: defaultQueryParams,
  });
}

export default {
  init,
  sendEvent,
  sendPageview,
  identifyUser,
  generateTrackingLink,
  getConversions,
  createAffiliateCode,
  updateAffiliateCode,
  getAffiliateCode,
  isAffiliateCodeFree,
  getPayoutsLeaderboard,
  getPointsLeaderboard,
  getReferredUsersLeaderboard,
  getReferredVolume,
  getUserAudiences,
  getUserPayoutsByConversion,
  getUserPointsByConversion,
  getUserPointsMovements,
  getUserPayoutMovements,
  getPayoutsByReferrer,
  getUserReferrer,
  getVolumeLeaderboard,
  getRevenueLeaderboard,
  listUserReferralCodes,
  generateReferralCodes,
  getReferralStatus,
  getReferralCode,
  useReferralCode,
  updateReferralCode,
  deleteReferral,
  getAffiliateStats,
  getAffiliateNewTraders,
  getClaimableChecks,
  getClaimCheckTotals,
};
