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
  event_args?: FuulEventArgs;
  metadata: FuulEventMetadata;
};

type ConversionPaymentActionArgs = {
  payment_type: string;
  payment_currency: string;
  referral_amount?: string;
  referrer_amount?: string;
  referrer_amount_percentage?: number;
  referral_amount_percentage?: number;
  payment_argument?: string;
};

export type Contract = {
  address: string;
  createdAt: string;
  deletedAt: null;
  id: string;
  network: string;
  sentinelId: null;
  updatedAt: string;
};

export type AbiInput = {
  name: string;
  type: string;
  internalType: string;
};

export type Trigger = {
  id: string;
  projectId: string;
  name: string;
  description: string;
  type: string;
  networks: string[];
  signature: string;
  ref: string;
  contractAddress: string;
  contract_address: string;
  contracts?: Contract[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  arguments?: AbiInput[];
  condition_expression?: string;
};

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

export type Conversion = {
  action_args?: ConversionPaymentActionArgs;
  action_type?: string;
  attribution_type: string;
  conversion_window: number;
  created_at: string;
  id: string;
  name: string;
  project: Project;
  rule: {
    expression: string;
    prettified_expression: string;
    timeframe_seconds: number;
  };
  triggers: Trigger[];
  total_converted?: number;
  conversion_rate?: number;
  payout?: {
    amount: number;
    currency: string;
  };
};
