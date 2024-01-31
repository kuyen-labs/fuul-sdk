export interface GetProjectPayoutsLeaderboardParams {
  currency_address: string;
  page?: number;
  page_size?: number;
}

export interface ProjectPayoutsLeaderboardResponse {
  total_results: number;
  page: number;
  page_size: number;
  results: ProjectPayoutsLeaderboardResponseResult[];
}

export interface ProjectPayoutsLeaderboardResponseResult {
  address: string;
  total_paid: number;
}

export interface GetUserPayoutsParams {
  user_address: string;
  page?: number;
  page_size?: number;
  group_by?: string;
}

export interface UserPayoutsResponse {
  total_results: number;
  page: number;
  page_size: number;
  results: UserPayoutsResponseResult[];
}

export interface UserPayoutsResponseResult {
  is_referrer: boolean;
  total_paid: number;
  currency_address: string;
  conversion_id?: string;
  conversion_name?: string;
}
