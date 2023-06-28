export interface Project {
  id: string;
  name: string;
  thumbnail_url: string;
  integration_type: string;
  user_landing_page_url?: string;
  partner_landing_page_url?: string;
  user_onboarding_page_url?: string;
}

interface ConversionPaymentActionArgs {
  payment_type: string;
  payment_currency: string;
  referral_amount: number;
  referrer_amount: number;
}

interface ContractDTO {
  address: string;
  network: string;
}

interface TriggerDTO {
  name: string;
  description: string;
  contracts: ContractDTO[];
}

export interface ConversionDTO {
  action_args?: ConversionPaymentActionArgs;
  action_type?: string;
  attribution_type: string;
  conversion_window: number;
  created_at: string;
  id: string;
  name: string;
  project: Project;
  triggers: TriggerDTO[];
}
