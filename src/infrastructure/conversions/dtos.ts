export interface Project {
  id: string;
  name: string;
  thumbnail_url: string;
}

export interface ConversionDTO {
  id: string;
  payment_currency: string;
  conversion_window: number;
  payment_type: string;
  payment_argument: string;
  referrer_amount: number;
  referral_amount: number;
  attribution_type: string;
}
