export interface Project {
  id: string;
  name: string;
  thumbnail_url: string;
}

interface ConversionPaymentActionArgs {
  payment_type: string;
  payment_currency: string;
  referral_amount: number;
  referrer_amount: number;
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
}
