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
