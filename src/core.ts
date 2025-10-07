import { UserIdentifierType } from '.';
import { AffiliateService } from './affiliates/AffiliateService';
import { AudienceService } from './audiences/AudienceService';
import { ConversionService } from './ConversionService';
import { EventService } from './EventService';
import { HttpClient } from './HttpClient';
import { InviteCodeService } from './invite-codes/InviteCodeService';
import { LeaderboardService } from './leaderboard/LeaderboardService';
import { PayoutService } from './payouts/PayoutService';
import { getAffiliateId, getReferrerUrl, getTrackingId, getTrafficCategory, getTrafficSource, getTrafficTag, getTrafficTitle } from './tracking';
import {
  CheckInviteCodeParams,
  CheckInviteCodeResponse,
  Conversion,
  FuulEvent,
  GenerateInviteCodesParams,
  GenerateInviteCodesResponse,
  GetConversionsParams,
  GetInvitationStatusParams,
  GetInvitationStatusResponse,
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
  ListUserInviteCodesParams,
  ListUserInviteCodesResponse,
  PayoutsLeaderboard,
  PointsLeaderboard,
  ReferredUsersLeaderboard,
  UseInviteCodeParams,
  UserPayoutMovementsResponse,
  UserPayoutsByConversionResponse,
  UserPointsByConversionResponse,
  UserPointsMovementsResponse,
  VolumeLeaderboard,
} from './types/api';
import { AffiliateCodeParams, AffiliateLinkParams, EventArgs, FuulSettings, IdentifyUserParams } from './types/sdk';
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
let _audienceService: AudienceService;
let _leaderboardService: LeaderboardService;
let _inviteCodeService: InviteCodeService;

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
  _userService = new UserService({ httpClient: _httpClient });
  _audienceService = new AudienceService({ httpClient: _httpClient, debug: _debug });
  _leaderboardService = new LeaderboardService({ httpClient: _httpClient });
  _inviteCodeService = new InviteCodeService({ httpClient: _httpClient, debug: _debug });

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
  );
}

/**
 * Gets the code registered to an affiliate
 * @param {string} userIdentifier Affiliate identifier
 * @param {UserIdentifierType} identifierType Affiliate identifier type
 * @returns {string} Affiliate code
 * @example
 * ```typescript
 * const code = await Fuul.getAffiliateCode('0x12345', UserIdentifierType.EvmAddress);
 * ```
 **/
export async function getAffiliateCode(userIdentifier: string, identifierType: UserIdentifierType): Promise<string | null> {
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
  const affiliateCode = await _affiliateService.getCode(userIdentifier, identifierType);
  const qp = new URLSearchParams({
    af: affiliateCode ?? userIdentifier,
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
 * Gets the project value leaderboard, the amounts are converted into UDSC
 * @param {GetVolumeLeaderboardParams} params The search params
 * @returns {LeaderboardResponse<VolumeLeaderboard>} Value leaderboard response
 * @example
 * ```typescript
 * const results = await Fuul.getVolumeLeaderboard({ user_identifier: '0x12345', identifier_type: UserIdentifierType.EvmAddress });
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
 * Lists invite codes for a user
 * @param {ListUserInviteCodesParams} params List user invite codes parameters
 * @returns {Promise<ListUserInviteCodesResponse>} List of user invite codes with pagination
 * @example
 * ```typescript
 * const result = await Fuul.listUserInviteCodes({
 *   user_identifier: '0x12345',
 *   user_identifier_type: UserIdentifierType.EvmAddress,
 *   page: 1,
 *   page_size: 25
 * });
 * ```
 */
export async function listUserInviteCodes(params: ListUserInviteCodesParams): Promise<ListUserInviteCodesResponse> {
  assertInitialized();
  return _inviteCodeService.listUserInviteCodes(params);
}

/**
 * Generates invite codes for a user
 * @param {GenerateInviteCodesParams} params Generate invite codes parameters
 * @returns {Promise<GenerateInviteCodesResponse[]>} Generated invite codes
 * @example
 * ```typescript
 * const codes = await Fuul.generateInviteCodes({
 *   user_identifier: '0x12345',
 *   user_identifier_type: UserIdentifierType.EvmAddress
 * });
 * ```
 */
export async function generateInviteCodes(params: GenerateInviteCodesParams): Promise<GenerateInviteCodesResponse[]> {
  assertInitialized();
  return _inviteCodeService.generateInviteCodes(params);
}

/**
 * Gets the invitation status for a user
 * @param {GetInvitationStatusParams} params Get invitation status parameters
 * @returns {Promise<GetInvitationStatusResponse>} Invitation status
 * @example
 * ```typescript
 * const status = await Fuul.getInvitationStatus({
 *   user_identifier: '0x12345',
 *   user_identifier_type: UserIdentifierType.EvmAddress
 * });
 * if (status.invited) {
 *   console.log('User was invited with code:', status.code);
 * }
 * ```
 */
export async function getInvitationStatus(params: GetInvitationStatusParams): Promise<GetInvitationStatusResponse> {
  assertInitialized();
  return _inviteCodeService.getInvitationStatus(params);
}

/**
 * Checks if an invite code is free to use
 * @param {CheckInviteCodeParams} params Check invite code parameters
 * @returns {Promise<CheckInviteCodeResponse>} Check result
 * @example
 * ```typescript
 * const result = await Fuul.checkInviteCode({ code: 'WELCOME2024' });
 * if (result.is_free) {
 *   console.log('Invite code is available!');
 * }
 * ```
 */
export async function checkInviteCode(params: CheckInviteCodeParams): Promise<CheckInviteCodeResponse> {
  assertInitialized();
  return _inviteCodeService.checkInviteCode(params);
}

/**
 * Uses an invite code
 * @param {UseInviteCodeParams} params Use invite code parameters
 * @returns {Promise<void>}
 * @example
 * ```typescript
 * await Fuul.useInviteCode({
 *   code: 'WELCOME2024',
 *   user_identifier: '0x12345',
 *   user_identifier_type: UserIdentifierType.EvmAddress,
 *   signature: '0xaad9a0b62f87c15a248cb99ca926785b828b5',
 *   signature_message: 'Accept invitation'
 * });
 * ```
 */
export async function useInviteCode(params: UseInviteCodeParams): Promise<void> {
  assertInitialized();
  return _inviteCodeService.useInviteCode(params);
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
  getUserAudiences,
  getUserPayoutsByConversion,
  getUserPointsByConversion,
  getUserPointsMovements,
  getUserPayoutMovements,
  getUserAffiliates,
  getVolumeLeaderboard,
  listUserInviteCodes,
  generateInviteCodes,
  getInvitationStatus,
  checkInviteCode,
  useInviteCode,
};
