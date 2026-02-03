import { UserIdentifierType } from '../../types/user';

export interface GetAffiliateStatsParams {
  user_identifier: string;
  user_identifier_type: UserIdentifierType;
  from?: string;
  to?: string;
  this_month?: boolean;
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
