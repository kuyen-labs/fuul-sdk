import { UserIdentifierType } from '..';

export type FuulEventArgs = {
  [key: string]: unknown;
};

export type FuulEventMetadata = {
  tracking_id: string;
  referrer?: string; // Deprecated
  affiliate_id?: string;
  referrer_url?: string;
  project_id?: string;
  source?: string;
  category?: string;
  title?: string;
  tag?: string;
};

export type FuulEvent = {
  name: string;
  user_address?: string; // Deprecated, use user.identifier and user.identifier_type instead
  user?: {
    identifier: string;
    identifier_type: UserIdentifierType;
  };
  signature?: string;
  signature_message?: string;
  signature_public_key?: string;
  args?: FuulEventArgs;
  metadata: FuulEventMetadata;
  account_chain_id?: number;
};

export type AbiInput = {
  name: string;
  type: string;
  internalType: string;
};

enum EventType {
  OnChainFunction = 'on-chain-function',
  OnChainInternalFunction = 'on-chain-internal-function',
  OnChainEvent = 'on-chain-event',
  OffChainEvent = 'off-chain-event',
}

interface Contract {
  address: string;
  network: string;
}

export interface Trigger {
  id: string;
  name: string;
  description: string;
  ref: string;
  signature: string;
  type: EventType;
  condition_expression: string;
  end_user_argument: string;
  contracts?: Contract[];
}

enum ProjectIntegrationType {
  FUUL_HOSTED = 'FUUL_HOSTED',
  HYBRID = 'HYBRID',
  PROJECT_HOSTED = 'PROJECT_HOSTED',
}

type ProjectSettings = {
  validateEventSignature?: boolean;
  integrationType?: ProjectIntegrationType;
  userLandingPageUrl?: string; // Url to redirect the user after connecting the wallet on fuul hosted page
  partnerLandingPageUrl?: string; // Url of the project hosted page for creating tracking links
  userOnboardingPageUrl?: string; // Url of the project hosted page for onboarding users and connecting wallets
};

type ApiKey = {
  id: string;
  token: string;
};

type ProjectTeamMember = {
  id: string;
  address: string;
  role: string;
  enabled: boolean;
};

export interface CurrentTier {
  id: string;
  name: string;
  slug: string;
  rank: number;
}

export interface AffiliateCodeWithStats {
  code: string;
  created_at: string;
  uses: number;
  clicks: number;
  total_users: number;
  /** USD. */
  total_earnings: number;
  rebate_rate: number | null;
  current_tier: CurrentTier | null;
}

export type Affiliate = {
  id: string;
  name: string;
  user_identifier: string;
  user_identifier_type: string;
  updated_at: string;
  region: string;
  /** All referral codes owned by this affiliate, ordered oldest-first. */
  codes: AffiliateCodeWithStats[];
  /** @deprecated No longer returned at the root by the server. Read `codes[0].code`. Populated from `codes[0]` for backward compatibility. */
  code: string;
  /** @deprecated No longer returned at the root by the server. Read `codes[0].created_at`. Populated from `codes[0]` for backward compatibility. */
  created_at: string;
  /** @deprecated No longer returned at the root by the server. Read `codes[0].uses`. Populated from `codes[0]` for backward compatibility. */
  uses: number;
  /** @deprecated No longer returned at the root by the server. Read `codes[0].clicks`. Populated from `codes[0]` for backward compatibility. */
  clicks: number;
  /** @deprecated No longer returned at the root by the server. Read `codes[0].total_users`. Populated from `codes[0]` for backward compatibility. */
  total_users: number;
  /** @deprecated No longer returned at the root by the server. Read `codes[0].total_earnings`. Populated from `codes[0]` for backward compatibility. */
  total_earnings: number;
  /** @deprecated No longer returned at the root by the server. Read `codes[0].rebate_rate`. Populated from `codes[0]` for backward compatibility. */
  rebate_rate: number | null;
  /** @deprecated No longer returned at the root by the server. Read `codes[0].current_tier`. Populated from `codes[0]` for backward compatibility. */
  current_tier: CurrentTier | null;
  /** @deprecated No longer returned by the server. Use `rebate_rate`. */
  user_rebate_rate?: number | null;
  /** @deprecated No longer returned by the server. Use `rebate_rate`. */
  rebate_rates?: { project_id: string; rebate_rate: number | null }[];
};

export type CreateAffiliateResponse = {
  id: string;
  name: string;
  code: string;
  user_identifier: string;
  user_identifier_type: string;
  region: string;
  updated_at: string;
};

export type CheckAffiliateCodeAvailabilityResponse = {
  free: boolean;
};

export type CheckAffiliateCodeAvailableResponse = {
  available: boolean;
};

export type Project = {
  category: string;
  conversions: Conversion[] | [];
  description: string;
  slug: string;
  id: string;
  name: string;
  thumbnail_url: string;
  triggers: Trigger[] | [];
  twitter_handle: string;
  website_url: string;
  settings: ProjectSettings;
  contract_address: string;
  api_keys: ApiKey[] | [];
  team_members: ProjectTeamMember[] | [];
};

export interface Rule {
  expression: string;
  prettified_expression: string;
  timeframe_seconds: number;
}

interface ProjectInvestor {
  name: string;
  url?: string;
}

interface ProjectGeoRestriction {
  name: string;
  flag: string;
}

interface ProjectOtherLink {
  name: string;
  url: string;
}

interface DeprecatedPayoutTermTriggerArgument {
  trigger_id: string;
  amount_argument: string;
  currency_argument: string;
}
interface DeprecatedPayoutTermPayoutGroup {
  id: string;
  affiliate_amount?: string;
  end_user_amount?: string;
  affiliate_amount_percentage?: number;
  end_user_amount_percentage?: number;
}
interface DeprecatedPayoutTermResponse {
  /**
   * @deprecated This parameter will be removed after front-end migration
   */
  payment_type: string;
  payout_type: string;
  /**
   * @deprecated This parameter will be removed after front-end migration
   */
  payment_currency: string;
  payout_currency: string;
  referral_amount?: string | null;
  referrer_amount?: string | null;

  /**
   * @deprecated This parameter will be removed after front-end migration
   */
  payment_argument?: string | null;
  trigger_arguments?: DeprecatedPayoutTermTriggerArgument[];

  payout_groups: DeprecatedPayoutTermPayoutGroup[];
}

export type PayoutScheme = 'pay-per-attribution' | 'pool' | 'rank';
export type TierType = 'audience' | 'event';
export type PayoutType = 'point' | 'onchain-currency';
export type PayoutCalculationStrategy = 'fixed' | 'variable';
export type TriggerAmountSource = 'volume' | 'revenue';
export type BaseCurrency = 'usd' | 'eth' | 'btc' | 'none';
export type AmountSource = 'volume' | 'revenue' | 'attribution-count';
export type PayeeType = 'affiliate' | 'end-user' | 'both';
export type PoolDistributionMode = 'linear' | 'square_root';

export interface RankPayoutSchemeConfig {
  ranks: Record<number, { prizeAmount: string }>;
}

export interface PayoutTermPayoutGroup {
  id: string;
  name?: string;
  description?: string;
  affiliate_amount?: string;
  end_user_amount?: string;
  affiliate_amount_percentage?: number;
  end_user_amount_percentage?: number;
  affiliate2_amount?: string | null;
  affiliate3_amount?: string | null;
  affiliate4_amount?: string | null;
  affiliate2_amount_percentage?: number | null;
  affiliate3_amount_percentage?: number | null;
  affiliate4_amount_percentage?: number | null;
  audience?: { id: string; name: string } | null;
  project_tier?: {
    id: string;
    name: string;
    slug: string;
    rank: number;
    description: string | null;
  } | null;
  payout_cap_enabled?: boolean;
  enduser_cap_enabled?: boolean;
  wallet_cap_enabled?: boolean;
  dynamic_referral_cap_enabled?: boolean;
}

export interface PayoutTermResponse {
  id: string;
  scheme: PayoutScheme;
  tier_type: TierType;
  conversion_id: string;
  type: PayoutType;
  calculation_strategy: PayoutCalculationStrategy | null;
  trigger_amount_source: TriggerAmountSource | null;
  base_currency: BaseCurrency | null;
  payout_currency_address: string | null;
  payout_currency_chain_id: number | null;
  require_affiliate: boolean;
  require_approval: boolean;
  referral_amount?: string;
  referrer_amount?: string;
  referrer2_amount?: string;
  referrer3_amount?: string;
  referrer4_amount?: string;
  max_payout_amount?: string | null;
  end_user_cap_amount?: string | null;
  end_user_cap_window_days?: number | null;
  wallet_cap_amount?: string | null;
  wallet_cap_window_days?: number | null;
  dynamic_referral_cap_multiplier?: number | null;
  payout_groups: PayoutTermPayoutGroup[];
  amount_source?: AmountSource;
  payee_type?: PayeeType;
  pool_amount?: string | null;
  pool_calculation_day_cron?: string;
  pool_duration?: number;
  pool_start_date?: string;
  pool_end_date?: string | null;
  pool_distribution_mode?: PoolDistributionMode | null;
  rank_scheme_config?: RankPayoutSchemeConfig | null;
  payout_condition_expression?: string | null;
}

export interface ConversionMetrics {
  tvl: number;
  apr: number;
}

export interface Conversion {
  id: string;
  external_id: number;
  name: string;
  slug: string;
  enabled?: boolean;
  /** @deprecated No longer returned by the server. Will be removed in the next major version. */
  conversion_window?: number;
  /** @deprecated No longer returned by the server. Will be removed in the next major version. */
  attribution_type?: string;
  triggers: Trigger[];
  payout_terms?: PayoutTermResponse[];
  metrics?: ConversionMetrics;
  created_at: Date;
  updated_at: Date;
  /** @deprecated No longer returned by the server. Will be removed in the next major version. */
  rule?: Rule;
  project?: {
    name: string;
    slug: string;
    id: string;
    thumbnail_url: string;
    integration_type: string;
    user_landing_page_url?: string;
    partner_landing_page_url?: string;
    user_onboarding_page_url?: string;
    contract_chain_id: string | null;
    github_account?: string;
    whitepaper_url?: string;
    investors?: ProjectInvestor[];
    geo_restrictions?: ProjectGeoRestriction[];
    assets_url?: string;
    documentation_url?: string;
    other_links?: ProjectOtherLink[];
    description?: string;
    twitter_handle?: string;
  };
  /** @deprecated No longer returned by the server. Will be removed in the next major version. */
  action_id?: string;
  /** @deprecated No longer returned by the server. Will be removed in the next major version. */
  action_type?: string;
  /** @deprecated No longer returned by the server. Will be removed in the next major version. */
  action_args?: DeprecatedPayoutTermResponse;
  conversion_rate?: number;
  total_converted?: number;
  total_payout?: {
    amount: number;
    currency: string;
  };
  /** @deprecated No longer returned by the server. Will be removed in the next major version. */
  converted?: boolean;
}

type LeaderboardUserType = 'affiliate' | 'end_user';

/**
 * Parameters for getPayoutsLeaderboard endpoint
 *
 * Note: The following field was removed and is no longer supported:
 * - `conversions` - No longer available
 */
export interface GetPayoutsLeaderboardParams {
  page?: number;
  page_size?: number;
  currency_address?: string;
  /** @deprecated Use user_identifier instead */
  user_address?: string;
  user_identifier?: string;
  identifier_type?: UserIdentifierType;
  /** @deprecated Use identifier_type instead */
  user_identifier_type?: UserIdentifierType;
  from?: string;
  to?: string;
  user_type?: LeaderboardUserType;
  fields?: string;
  conversion_external_ids?: number[];
}

/**
 * Parameters for getPointsLeaderboard endpoint
 *
 * Note: The following fields were removed and are no longer supported:
 * - `currency_address` - Currency filtering is not available
 * - `from` - Date filtering is not available
 * - `to` - Date filtering is not available
 * - `user_type` - User type filtering is not available
 * - `conversions` - No longer available
 */
export interface GetPointsLeaderboardParams {
  /** @deprecated Use user_identifier instead */
  user_address?: string;
  user_identifier?: string;
  identifier_type?: UserIdentifierType;
  /** @deprecated Use identifier_type instead */
  user_identifier_type?: UserIdentifierType;
  fields?: string;
  page?: number;
  page_size?: number;
}

/**
 * Parameters for getVolumeLeaderboard endpoint
 *
 * Note: The following fields were removed and are no longer supported:
 * - `from` - Date filtering is not available
 * - `to` - Date filtering is not available
 * - `fields` - Field selection is not available
 * - `conversions` - No longer available
 * - `conversion_external_ids` - No longer supported
 */
export interface GetVolumeLeaderboardParams {
  page?: number;
  page_size?: number;
  currency_address?: string;
  /** @deprecated Use user_identifier instead */
  user_address?: string;
  user_identifier?: string;
  identifier_type?: UserIdentifierType;
  /** @deprecated Use identifier_type instead */
  user_identifier_type?: UserIdentifierType;
  user_type?: LeaderboardUserType;
}

/**
 * Parameters for getRevenueLeaderboard endpoint
 */
export interface GetRevenueLeaderboardParams {
  page?: number;
  page_size?: number;
  currency_address?: string;
  /** @deprecated Use user_identifier instead */
  user_address?: string;
  user_identifier?: string;
  identifier_type?: UserIdentifierType;
  /** @deprecated Use identifier_type instead */
  user_identifier_type?: UserIdentifierType;
  fields?: string;
  user_type?: LeaderboardUserType;
}

export interface LeaderboardResponse<T> {
  total_results: number;
  page: number;
  page_size: number;
  results: T[];
  calculated_at: string;
}

export interface PayoutsLeaderboard {
  address: string;
  affiliate_code?: string;
  user_identifier: string;
  user_identifier_type: string;
  rank: number;
  chain_id: string;
  total_amount: number;
  total_attributions: number;
  tiers?: Record<string, string>;
  referred_volume?: number;
  referred_users?: number;
}

export interface VolumeLeaderboard {
  address: string;
  user_identifier: string;
  user_identifier_type: string;
  affiliate_code: string | null;
  total_amount: string;
  chain_id: string | null;
  rank: number;
}

export interface RevenueLeaderboard {
  address: string;
  total_amount: string;
  rank: number;
  affiliate_code: string | null;
  attributions?: number;
  volume_usd?: number;
  points?: number;
}

export interface PointsLeaderboard {
  address: string;
  affiliate_code?: string;
  total_amount: number;
  rank: number;
  total_attributions: number;
  tiers?: Record<string, string>;
  referred_volume?: number;
  enduser_revenue?: number;
  referred_users?: number;
  enduser_volume?: number;
}

export interface ReferredUsersLeaderboard {
  address: string;
  total_referred_users: number;
  rank: number;
}

export interface GetReferredUsersLeaderboardParams {
  page?: number;
  page_size?: number;
}

export interface GetUserPayoutsByConversionParams {
  user_identifier: string;
  identifier_type: UserIdentifierType;
  project_id?: string;
  group_by?: string;
  page?: number;
  page_size?: number;
  from: string;
  to: string;
}

export interface GetUserPointsByConversionParams {
  user_identifier: string;
  identifier_type: UserIdentifierType;
  project_id?: string;
  group_by?: string;
  page?: number;
  page_size?: number;
  from: string;
  to: string;
}

export interface UserPayoutsByConversionResponse {
  total_results: number;
  page: number;
  page_size: number;
  results: UserConversionPayout[];
}

export interface UserConversionPayout {
  is_referrer: boolean;
  total_amount: string;
  conversion_id: string;
  conversion_name: string;
  currency_address: string;
  chain_id: string;
}

export interface UserPointsByConversionResponse {
  total_results: number;
  page: number;
  page_size: number;
  results: UserConversionPoints[];
}

export interface UserConversionPoints {
  is_referrer: boolean;
  total_amount: string;
  conversion_id: string;
  conversion_name: string;
}

export interface GetUserPayoutMovementsParams {
  user_identifier: string;
  identifier_type: UserIdentifierType;
  project_id?: string;
  page?: number;
  page_size?: number;
  from_date?: string;
  to_date?: string;
}

export interface UserPayoutMovementsResponse {
  total_results: number;
  page: number;
  page_size: number;
  results: UserPayoutMovement[];
}

export interface UserPayoutMovement {
  date: string;
  currency_address: string;
  chain_id: number;
  is_referrer: boolean;
  conversion_id: string;
  conversion_name: string;
  total_amount: string;
  project_name: string;
  payout_status: string;
  payout_status_details: string | null;
}

export interface GetUserPointsMovementsParams {
  user_identifier: string;
  identifier_type: UserIdentifierType;
  project_id?: string;
  page?: number;
  page_size?: number;
  from_date?: string;
  to_date?: string;
}

export interface UserPointsMovementsResponse {
  total_results: number;
  page: number;
  page_size: number;
  results: UserPointsMovement[];
}

export interface UserPointsMovement {
  date: string;
  is_referrer: boolean;
  conversion_id: string;
  conversion_name: string;
  total_amount: string;
  project_name: string;
  payout_status: string;
  payout_status_details: string | null;
}

export interface GetIncentivesByTierParams {
  /**
   * Filter to specific tiers. Each entry is either a tier UUID or the literal string `'null'`
   * to include the default (no-tier) bucket. Omit to return all tiers plus the default bucket.
   */
  tier_ids?: string[];
}

export interface PayoutTermRate {
  amount: string | null;
  currency: string | null;
  unit: string;
}

export interface PayoutTermByTier {
  conversion_name: string;
  payout_type: 'variable' | 'fixed';
  payee_type: 'affiliate' | 'end-user' | 'both';
  is_multi_level: boolean;
  affiliate_rate: PayoutTermRate;
  affiliate2_rate: PayoutTermRate;
  affiliate3_rate: PayoutTermRate;
  affiliate4_rate: PayoutTermRate;
  end_user_rate: PayoutTermRate;
}

export interface TierPayoutTerms {
  tier_id: string | null;
  tier_name: string | null;
  tier_description: string | null;
  tier_slug: string | null;
  tier_rank: number | null;
  payout_terms: PayoutTermByTier[];
}

export interface GetIncentivesByTierResponse {
  tiers: TierPayoutTerms[];
}

export interface GetConversionsParams {
  /** @deprecated The server does not accept this parameter. Will be removed in the next major version. */
  user_identifier?: string;
  /** @deprecated The server does not accept this parameter. Will be removed in the next major version. */
  identifier_type?: UserIdentifierType;
}

export interface GetUserAudiencesParams {
  user_identifier: string;
  user_identifier_type: UserIdentifierType;
}

export interface GetUserAudiencesResponse {
  results: {
    id: string;
    name: string;
    badge_name: string | null;
    badge_description: string | null;
    badge_image: string | null;
    /** @deprecated Not returned by the server. Will be removed in the next major version. */
    active?: boolean;
  }[];
}

export interface UserReferralCode {
  code: string;
  created_at: string;
  used_by: {
    identifier: string;
    identifier_type: string;
    used_at: string;
  }[];
  max_uses: number | null;
  uses: number;
  remaining_uses: number | null;
  rebate_rate: number | null;
  clicks: number;
  total_users: number;
  total_earnings: number;
}

export interface ListUserReferralCodesParams {
  user_identifier: string;
  user_identifier_type: UserIdentifierType;
  page?: number;
  page_size?: number;
}

export interface ListUserReferralCodesResponse {
  results: UserReferralCode[];
  count: number;
  next_page: number | null;
}

export interface GenerateReferralCodesParams {
  user_identifier: string;
  user_identifier_type: UserIdentifierType;
  quantity?: number;
  max_uses?: number;
}

export interface GenerateReferralCodesResponse {
  code: string;
}

export interface GetReferralStatusParams {
  user_identifier: string;
  user_identifier_type: UserIdentifierType;
}

export interface GetReferralStatusResponse {
  referred: boolean;
  code?: string;
  referrer_identifier?: string;
  referrer_identifier_type?: UserIdentifierType;
  referred_at?: string;
}

export interface GetReferralCodeParams {
  code: string;
}

export interface GetReferralCodeResponse {
  available: boolean;
}

export interface UseReferralCodeParams {
  code: string;
  user_identifier: string;
  user_identifier_type: UserIdentifierType;
  signature: string;
  signature_message: string;
  chain_id?: number;
  /** @deprecated Not supported by the server. Will be removed in the next major version. */
  account_chain_id?: number;
}

export interface UpdateReferralCodeParams {
  code: string;
  max_uses: number | null;
}

export interface DeleteReferralParams {
  code: string;
  user_identifier: string;
  user_identifier_type: UserIdentifierType;
  referrer_identifier: string;
  referrer_identifier_type: UserIdentifierType;
  signature?: string;
  signature_message?: string;
  chain_id?: number;
}

export interface EarningItem {
  currency: {
    address: string | null;
    chainId: string | null;
  };
  amount: number;
}

export interface ReferrerPayoutData {
  volume: number;
  earnings: EarningItem[];
  date_joined: string;
  event_referrer_identifier: string;
  user_rebate_rate?: number | null;
  referral_code: string | null;
}

export type PayoutsByReferrerResponse = Array<Record<string, ReferrerPayoutData>>;

export interface GetPayoutsByReferrerParams {
  user_identifier: string;
  user_identifier_type: UserIdentifierType;
}

// Referred Volume types
export interface GetReferredVolumeParams {
  user_identifiers: string[];
  identifier_type?: UserIdentifierType;
  no_cache?: boolean;
}

export interface ReferredVolumeItem {
  user_identifier: string;
  referred_volume: number;
}

export interface ReferredVolumeResponse {
  project_id: string;
  referred_volumes: ReferredVolumeItem[];
  total_count: number;
}
