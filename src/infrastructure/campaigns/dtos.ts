export interface Project {
  id: string;
  name: string;
  thumbnail_url: string;
}

export interface ConversionDTO {
  id: string;
  payment_type: string;
  referrer_amount: number;
  referral_amount: number;
  payment_currency: string;
  triggers?: TriggerDTO[];
}

export interface TriggerDTO {
  name: string;
  description: string;
  contracts?: ContractDTO[];
}

export interface ContractDTO {
  address: string;
  network: string;
}

export interface CampaignDTO {
  conversions?: ConversionDTO[];
  id: string;
  name: string;
  project: Project;
  referrer_excerpt?: string;
  url: string;
  user_excerpt?: string;
}
