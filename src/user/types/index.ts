export interface GetUserReferrerParams {
  user_identifier: string;
  user_identifier_type: string;
}

export interface GetUserReferrerResponse {
  user_identifier: string;
  referrer_identifier: string | null;
}