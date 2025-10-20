import { UserIdentifierType } from 'src/types/user';

export interface GetUserReferrerParams {
  user_identifier: string;
  user_identifier_type: UserIdentifierType;
}

export interface GetUserReferrerResponse {
  user_identifier: string;
  referrer_identifier: string | null;
}
