import Fuul from './core';

export * from './affiliates/errors';
export type {
  GetReferralCodeParams,
  GetReferralCodeResponse,
  Conversion,
  GenerateReferralCodesParams,
  GenerateReferralCodesResponse,
  GetReferralStatusParams,
  GetReferralStatusResponse,
  ListUserReferralCodesParams,
  ListUserReferralCodesResponse,
  UpdateReferralCodeParams,
  UseReferralCodeParams,
  UserReferralCode,
} from './types/api';
export type { EventArgs, FuulSettings, IdentifyUserParams } from './types/sdk';
export { UserIdentifierType } from './types/user';
export type { GetUserReferrerParams, GetUserReferrerResponse } from './user/types';

export { Fuul };
