import { UserIdentifierType } from 'src/types/user';

export interface GetUserReferrerParams {
  user_identifier: string;
  user_identifier_type: UserIdentifierType;
}

export interface GetUserReferrerResponse {
  user_identifier: string;
  referrer_identifier: string | null;
  referrer_name: string | null;
  referrer_code: string | null;
  referrer_user_split_percentage: number | null;
}
