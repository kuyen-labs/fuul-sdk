interface ConversionPaymentActionArgs {
  payment_type: string
  payment_currency: string
  referral_amount: number
  referrer_amount: number
}

interface ContractDTO {
  address: string
  network: string
}

interface TriggerDTO {
  name: string
  description: string
  contracts: ContractDTO[]
}

enum ProjectIntegrationType {
  FUUL_HOSTED = 'FUUL_HOSTED',
  HYBRID = 'HYBRID',
  PROJECT_HOSTED = 'PROJECT_HOSTED',
}
interface ProjectSettingsDTO {
  validateEventSignature?: boolean
  integrationType?: ProjectIntegrationType
  userLandingPageUrl?: string // Url to redirect the user after connecting the wallet on fuul hosted page
  partnerLandingPageUrl?: string // Url of the project hosted page for creating tracking links
  userOnboardingPageUrl?: string // Url of the project hosted page for onboarding users and connecting wallets
}

interface ApiKeyDTO {
  id: string
  token: string
}

interface ProjectTeamMemberDTO {
  id: string
  address: string
  role: string
  enabled: boolean
}

export interface ProjectDTO {
  category: string
  conversions: ConversionDTO[] | []
  description: string
  slug: string
  id: string
  name: string
  thumbnail_url: string
  triggers: TriggerDTO[] | []
  twitter_handle: string
  website_url: string
  settings: ProjectSettingsDTO
  contract_address: string
  api_keys: ApiKeyDTO[] | []
  team_members: ProjectTeamMemberDTO[] | []
}

export interface ConversionDTO {
  action_args?: ConversionPaymentActionArgs
  action_type?: string
  attribution_type: string
  conversion_window: number
  created_at: string
  id: string
  name: string
  project: ProjectDTO
  rule: {
    expression: string
    prettified_expression: string
    timeframe_seconds: number
  }
  triggers: TriggerDTO[]
  total_converted?: number
  conversion_rate?: number
  payout?: {
    amount: number
    currency: string
  }
}
