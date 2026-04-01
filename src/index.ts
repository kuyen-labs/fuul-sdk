import Fuul from './core';

export type {
  AffiliateEarning,
  AffiliateRegion,
  AffiliateStatus,
  GetAffiliateStatsParams,
  GetAffiliateStatsResponse,
  GetAffiliateTotalStatsParams,
  GetAffiliateTotalStatsResponse,
  GetAffiliateStatsBreakdownParams,
  GetAffiliateStatsBreakdownResponse,
  GetNewTradersParams,
  GetReferralTreeParams,
  GroupByPeriod,
  DateRangePreset,
  NewTraderResponse,
  ReferralTreeNodeResponse,
  StatsBreakdownResult,
} from './affiliate-portal/types';
export * from './affiliates/errors';
export type {
  ClaimCheckItem,
  ClaimCheckReason,
  ClaimCheckTotalItem,
  ClaimResponse,
  CloseClaimChecksParams,
  CloseClaimChecksResponse,
  GetClaimableChecksParams,
  GetClaimableChecksResponse,
  GetClaimChecksParams,
  GetClaimChecksResponse,
  GetClaimCheckTotalsParams,
  GetClaimCheckTotalsResponse,
} from './claim-checks/types';
export { ClaimCheckStatus } from './claim-checks/types';
export type {
  Affiliate,
  Conversion,
  CreateAffiliateResponse,
  DeleteReferralParams,
  EarningItem,
  GenerateReferralCodesParams,
  GenerateReferralCodesResponse,
  GetPayoutsByReferrerParams,
  GetReferralCodeParams,
  GetReferralCodeResponse,
  GetReferralStatusParams,
  GetReferralStatusResponse,
  GetReferredVolumeParams,
  GetRevenueLeaderboardParams,
  LeaderboardResponse,
  ListUserReferralCodesParams,
  ListUserReferralCodesResponse,
  PayoutsByReferrerResponse,
  ReferredVolumeItem,
  ReferredVolumeResponse,
  ReferrerPayoutData,
  RevenueLeaderboard,
  UpdateReferralCodeParams,
  UseReferralCodeParams,
  UserReferralCode,
} from './types/api';
export type { EventArgs, FuulSettings, IdentifyUserParams, UpdateRebateRateParams } from './types/sdk';
export { UserIdentifierType } from './types/user';
export type { GetUserReferrerParams, GetUserReferrerResponse } from './user/types';

export { Fuul };
