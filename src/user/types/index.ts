import { UserIdentifierType } from 'src/types/user';

export interface GetUserReferrerParams {
  user_identifier: string;
  user_identifier_type: UserIdentifierType;
}

export interface GetUserReferrerResponse {
  user_identifier: string;
  referrer_identifier: string | null;
  referrer_name: string | null;
  /** @deprecated Equals `referrer_codes[0]` (oldest). Use `referrer_codes` to access all codes owned by the referrer. */
  referrer_code: string | null;
  /** All codes owned by the referrer for this project, ordered oldest-first. Empty array when there is no referrer or no codes. */
  referrer_codes?: string[];
  referrer_user_rebate_rate: number | null;
}
