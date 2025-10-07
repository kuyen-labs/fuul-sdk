import Fuul from './core';

export * from './affiliates/errors';
export type {
  CheckInviteCodeParams,
  CheckInviteCodeResponse,
  Conversion,
  GenerateInviteCodesParams,
  GenerateInviteCodesResponse,
  GetInvitationStatusParams,
  GetInvitationStatusResponse,
  ListUserInviteCodesParams,
  ListUserInviteCodesResponse,
  UseInviteCodeParams,
  UserInviteCode,
} from './types/api';
export type { EventArgs, FuulSettings, IdentifyUserParams } from './types/sdk';
export { UserIdentifierType } from './types/user';

export { Fuul };
