import { CurrentTier } from '../../types/api';
import { UserIdentifierType } from '../../types/user';

export type AffiliateStatus = 'Active' | 'Paused' | 'Flagged' | 'Terminated';

export type AffiliateRegion = 'All' | 'CN' | 'JP' | 'KR' | 'SEA' | 'IND' | 'EN' | 'LATAM' | 'CIS' | 'GE' | 'SP' | 'SA' | 'EU' | 'Other';

export type AffiliatePortalTierView = CurrentTier;

export interface GetAffiliateStatsParams {
  user_identifier: string;
  /** @deprecated Not supported by the server. Will be removed in the next major version. */
  user_identifier_type?: UserIdentifierType;
  from?: string;
  to?: string;
  this_month?: boolean;
  /** @deprecated Use `conversion_external_id` instead. Will be removed in the next major version. */
  conversion_id?: string;
  conversion_external_id?: number;
  conversion_name?: string;
}

export interface AffiliateEarning {
  amount: number;
  currency: string;
}

export interface GetAffiliateStatsResponse {
  user_identifier: string;
  user_identifier_type: UserIdentifierType;
  /**
   * Movement-based commission totals per currency, across ALL referrer levels combined.
   * Native token units (already divided by decimals). Includes POINT rewards.
   */
  total_earnings: AffiliateEarning[];
  /** USD volume attributed to this affiliate as the direct (L1) referrer. */
  referred_volume: number;
  r2_volume: number;
  r3_volume: number;
  r4_volume: number;
  /** Sum of r2_volume + r3_volume + r4_volume. */
  multilevel_volume: number;
  /** referred_volume + multilevel_volume. */
  total_volume: number;
  end_user_volume: number;
  /** USD attributed revenue for L1 direct referrals. */
  referred_revenue: number;
  r2_revenue: number;
  r3_revenue: number;
  r4_revenue: number;
  /** Count of L1 attribution events for this affiliate, scoped to the same date range as volumes. */
  referred_attributions: number;
  /** Confirmed payout commissions in USD for L1 (direct) referrals. Excludes POINT-denomination payouts. */
  r1_earnings: number;
  /** Confirmed payout commissions in USD for L2 referrals. Excludes POINT-denomination payouts. */
  r2_earnings: number;
  /** Confirmed payout commissions in USD for L3 referrals. Excludes POINT-denomination payouts. */
  r3_earnings: number;
  /** Confirmed payout commissions in USD for L4 referrals. Excludes POINT-denomination payouts. */
  r4_earnings: number;
  /** Analytics-based referred-user count (existing semantics). Same value as `active_referrers`. */
  referred_users: number;
  /** Same as `referred_users` (analytics pipeline). */
  active_referrers: number;
  /** DISTINCT union of OLTP `user_referrers` and eligible `attribution` rows. All-time; not scoped by from/to or this_month. */
  total_referrers: number;
  /** DISTINCT referred users in `user_referrers` for this affiliate (OLTP). All-time; not scoped by from/to or this_month. */
  assigned_referrers: number;
  status: AffiliateStatus;
  region: AffiliateRegion | null;
  referral_codes: string[];
  /** Tier after audience/default rules; no tier-protection overlay. */
  effective_tier: AffiliatePortalTierView | null;
  /** Tier shown to the affiliate; includes tier-protection overlay when active. */
  current_tier: AffiliatePortalTierView | null;
}

export interface GetNewTradersParams {
  user_identifier: string;
  from?: string;
  to?: string;
  this_month?: boolean;
}

export interface NewTraderResponse {
  referrer_identifier: string;
  total_new_traders: string;
}

export interface GetReferralTreeParams {
  user_identifier: string;
}

export interface ReferralTreeNodeResponse {
  user_identifier: string;
  project_affiliate_id: string | null;
  traders: number;
  total_volume: number;
  total_revenue: number;
  children: ReferralTreeNodeResponse[];
}

export type GroupByPeriod = 'day' | 'week' | 'month';

export type DateRangePreset = '7d' | '30d' | 'MTD' | 'QTD' | 'custom';

export interface GetAffiliateStatsBreakdownParams {
  user_identifier: string;
  group_by: GroupByPeriod;
  date_range?: DateRangePreset;
  from?: string;
  to?: string;
  conversion_external_id?: number;
  conversion_name?: string;
  currency_id?: string;
}

export interface StatsBreakdownResult {
  date: string;
  r1_volume: number;
  r2_volume: number;
  r3_volume: number;
  revenue: number;
  attributions: number;
  referred_users: number;
  earnings: number;
  earnings_currency: string | null;
}

export interface GetAffiliateStatsBreakdownResponse {
  results: StatsBreakdownResult[];
}

export interface GetAffiliateTotalStatsParams {
  statuses?: AffiliateStatus[];
  regions?: AffiliateRegion[];
  audiences?: string[];
}

export interface GetAffiliateTotalStatsResponse {
  total_affiliates: number;
  active_affiliates: number;
  suspended_affiliates: number;
  total_regions: number;
  total_volume: number;
  total_revenue: number;
  total_attributions: number;
  total_referred_users: number;
  total_earnings: AffiliateEarning[];
}

export interface GetAffiliatePaidVolumesByLevelParams {
  user_identifier: string;
  from?: string;
  to?: string;
  this_month?: boolean;
}

export interface GetAffiliatePaidVolumesByLevelResponse {
  user_identifier: string;
  user_identifier_type: UserIdentifierType;
  /** Payout-eligible trading volume driven by this affiliate's direct (L1) referrals, in USD. */
  payout_eligible_l1_volume: number;
  /** Payout-eligible volume from second-level (L2) referrals, in USD. */
  payout_eligible_l2_volume: number;
  /** Payout-eligible volume from third-level (L3) referrals, in USD. */
  payout_eligible_l3_volume: number;
  /** Payout-eligible volume from fourth-level (L4) referrals, in USD. */
  payout_eligible_l4_volume: number;
  /** Attributed revenue at L1, in USD. */
  payout_eligible_l1_revenue: number;
  /** Attributed revenue at L2, in USD. */
  payout_eligible_l2_revenue: number;
  /** Attributed revenue at L3, in USD. */
  payout_eligible_l3_revenue: number;
  /** Attributed revenue at L4, in USD. */
  payout_eligible_l4_revenue: number;
  /** Number of payout-eligible attribution events at L1. */
  payout_eligible_l1_attributions: number;
  /** Number of payout-eligible attribution events at L2. */
  payout_eligible_l2_attributions: number;
  /** Number of payout-eligible attribution events at L3. */
  payout_eligible_l3_attributions: number;
  /** Number of payout-eligible attribution events at L4. */
  payout_eligible_l4_attributions: number;
  /** Sum of L1+L2+L3+L4 payout-eligible volume, in USD. */
  payout_eligible_total_volume: number;
  /** Sum of L1+L2+L3+L4 payout-eligible revenue, in USD. */
  payout_eligible_total_revenue: number;
  /** Sum of L1+L2+L3+L4 payout-eligible attribution counts. */
  payout_eligible_total_attributions: number;
}
