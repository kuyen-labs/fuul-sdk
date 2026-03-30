import { UserIdentifierType } from '../../types/user';

export interface GetAffiliateStatsParams {
  user_identifier: string;
  /** @deprecated Not supported by the server. Will be removed in the next major version. */
  user_identifier_type?: UserIdentifierType;
  from?: string;
  to?: string;
  this_month?: boolean;
  conversion_id?: string;
  conversion_name?: string;
}

export interface AffiliateEarning {
  amount: number;
  currency: string;
}

export interface GetAffiliateStatsResponse {
  user_identifier: string;
  user_identifier_type: UserIdentifierType;
  total_earnings: AffiliateEarning[];
  referred_volume: number;
  referred_revenue: number;
  referred_users: number;
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

export interface GetAffiliateTotalStatsParams {
  statuses?: string[];
  regions?: string[];
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
