import { Trigger } from '../../triggers/types';

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
export interface Rule {
  expression: string;
  prettified_expression: string;
  timeframe_seconds: number;
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
