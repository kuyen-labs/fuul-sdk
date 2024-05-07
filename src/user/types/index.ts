export interface GetUserAffiliatesParams {
  user_address: string;
}

export interface GetUserResponse {
  affiliates: UserAffiliate[];
}

export interface UserAffiliate {
  conversion_name: string;
  affiliate_address: string;
}