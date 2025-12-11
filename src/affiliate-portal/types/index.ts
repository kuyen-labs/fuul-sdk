import { UserIdentifierType } from '../../types/user';

export interface GetAffiliateStatsParams {
  user_identifier: string;
  user_identifier_type: UserIdentifierType;
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
}

export interface NewTraderResponse {
  referrer_identifier: string;
  total_new_traders: string;
}

export interface GetAffiliateCodeStatsParams {
  user_identifier: string;
}

export interface GetAffiliateCodeStatsResponse {
  code: string;
  created_at: string;
  uses: number;
  clicks: number;
  total_users: number;
  total_earnings: number;
  user_split_percentage: number | null;
}
