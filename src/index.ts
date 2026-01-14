import Fuul from './core';

export type {
  AffiliateEarning,
  GetAffiliateStatsParams,
  GetAffiliateStatsResponse,
  GetNewTradersParams,
  NewTraderResponse,
} from './affiliate-portal/types';
export * from './affiliates/errors';
export type {
  ClaimCheckReason,
  ClaimCheckTotalItem,
  ClaimResponse,
  GetClaimableChecksParams,
  GetClaimableChecksResponse,
  GetClaimCheckTotalsParams,
  GetClaimCheckTotalsResponse,
} from './claim-checks/types';
export type {
  Affiliate,
  Conversion,
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
  ListUserReferralCodesParams,
  ListUserReferralCodesResponse,
  PayoutsByReferrerResponse,
  ReferredVolumeItem,
  ReferredVolumeResponse,
  ReferrerPayoutData,
  UpdateReferralCodeParams,
  UseReferralCodeParams,
  UserReferralCode,
} from './types/api';
export type { EventArgs, FuulSettings, IdentifyUserParams } from './types/sdk';
export { UserIdentifierType } from './types/user';
export type { GetUserReferrerParams, GetUserReferrerResponse } from './user/types';

export { Fuul };
