export type FuulEventArgs = {
  [key: string]: unknown;
};

export type FuulEventMetadata = {
  tracking_id: string;
  referrer?: string; // Deprecated
  affiliate_id?: string;
  referrer_url?: string;
  project_id?: string;
  source?: string;
  category?: string;
  title?: string;
  tag?: string;
};

export type FuulEvent = {
  name: string;
  user_address?: string;
  signature?: string;
  signature_message?: string;
  args?: FuulEventArgs;
  metadata: FuulEventMetadata;
};

export type AbiInput = {
  name: string;
  type: string;
  internalType: string;
};

enum EventType {
  OnChainFunction = 'on-chain-function',
  OnChainInternalFunction = 'on-chain-internal-function',
  OnChainEvent = 'on-chain-event',
  OffChainEvent = 'off-chain-event',
}

interface Contract {
  address: string;
  network: string;
}

export interface Trigger {
  id: string;
  name: string;
  description: string;
  ref: string;
  signature: string;
  type: EventType;
  condition_expression: string;
  end_user_argument: string;
  contracts?: Contract[];
}

enum ProjectIntegrationType {
  FUUL_HOSTED = 'FUUL_HOSTED',
  HYBRID = 'HYBRID',
  PROJECT_HOSTED = 'PROJECT_HOSTED',
}
type ProjectSettings = {
  validateEventSignature?: boolean;
  integrationType?: ProjectIntegrationType;
  userLandingPageUrl?: string; // Url to redirect the user after connecting the wallet on fuul hosted page
  partnerLandingPageUrl?: string; // Url of the project hosted page for creating tracking links
  userOnboardingPageUrl?: string; // Url of the project hosted page for onboarding users and connecting wallets
};

type ApiKey = {
  id: string;
  token: string;
};

type ProjectTeamMember = {
  id: string;
  address: string;
  role: string;
  enabled: boolean;
};

export type Affiliate = {
  code: string;
};

export type Project = {
  category: string;
  conversions: Conversion[] | [];
  description: string;
  slug: string;
  id: string;
  name: string;
  thumbnail_url: string;
  triggers: Trigger[] | [];
  twitter_handle: string;
  website_url: string;
  settings: ProjectSettings;
  contract_address: string;
  api_keys: ApiKey[] | [];
  team_members: ProjectTeamMember[] | [];
};

export interface Rule {
  expression: string;
  prettified_expression: string;
  timeframe_seconds: number;
}

interface ProjectInvestor {
  name: string;
  url?: string;
}

interface ProjectGeoRestriction {
  name: string;
  flag: string;
}

interface ProjectOtherLink {
  name: string;
  url: string;
}

interface PayoutTermTriggerArgument {
  trigger_id: string;
  amount_argument: string;
  currency_argument: string;
}
interface PayoutTermPayoutGroup {
  id: string;
  affiliate_amount?: string;
  end_user_amount?: string;
  affiliate_amount_percentage?: number;
  end_user_amount_percentage?: number;
}
interface PayoutTermResponse {
  /**
   * @deprecated This parameter will be removed after front-end migration
   */
  payment_type: string;
  payout_type: string;
  /**
   * @deprecated This parameter will be removed after front-end migration
   */
  payment_currency: string;
  payout_currency: string;
  referral_amount?: string | null;
  referrer_amount?: string | null;

  /**
   * @deprecated This parameter will be removed after front-end migration
   */
  payment_argument?: string | null;
  trigger_arguments?: PayoutTermTriggerArgument[];

  payout_groups: PayoutTermPayoutGroup[];
}

export interface Conversion {
  id: string;
  name: string;
  slug: string;
  conversion_window: number;
  attribution_type: string;
  triggers: Trigger[];
  created_at: Date;
  updated_at: Date;
  rule: Rule;
  project?: {
    name: string;
    slug: string;
    id: string;
    thumbnail_url: string;
    integration_type: string;
    user_landing_page_url?: string;
    partner_landing_page_url?: string;
    user_onboarding_page_url?: string;
    contract_chain_id: number | null;
    github_account?: string;
    whitepaper_url?: string;
    investors?: ProjectInvestor[];
    geo_restrictions?: ProjectGeoRestriction[];
    assets_url?: string;
    documentation_url?: string;
    other_links?: ProjectOtherLink[];
  };
  action_id?: string;
  action_type?: string;
  action_args?: PayoutTermResponse;
  conversion_rate?: number;
  total_converted?: number;
  total_payout?: {
    amount: number;
    currency: string;
  };
}

export interface GetPayoutsLeaderboardParams {
  currency_address?: string;
  page?: number;
  page_size?: number;
}

export interface GetPointsLeaderboardParams {
  page?: number;
  page_size?: number;
}

export interface LeaderboardResponse<T> {
  total_results: number;
  page: number;
  page_size: number;
  results: T[];
}

export interface PayoutsLeaderboard {
  address: string;
  total_amount: string;
  chain_id: number;
  rank: number;
}

export interface PointsLeaderboard {
  address: string;
  total_amount: string;
  rank: number;
}

export interface GetUserPayoutsByConversionParams {
  user_address: string;
  page?: number;
  page_size?: number;
  group_by?: string;
}

export interface GetUserPointsByConversionParams {
  user_address: string;
  page?: number;
  page_size?: number;
  group_by?: string;
}

export interface UserPayoutsByConversionResponse {
  total_results: number;
  page: number;
  page_size: number;
  results: UserConversionPayout[];
}

export interface UserConversionPayout {
  is_referrer: boolean;
  total_amount: string;
  conversion_id: string;
  conversion_name: string;
  currency_address: string;
  chain_id: number;
}

export interface UserPointsByConversionResponse {
  total_results: number;
  page: number;
  page_size: number;
  results: UserConversionPoints[];
}

export interface UserConversionPoints {
  is_referrer: boolean;
  total_amount: string;
  conversion_id: string;
  conversion_name: string;
}
