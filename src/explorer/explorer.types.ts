export interface PaginationParams {
    page: number;
    page_size?: number;
  }
  
  export interface ChainParams {
    trigger_chain_id?: number;
    payout_chain_id?: number;
  }
  
  export interface ListingResponse<T> {
    page: number;
    page_size: number;
    total_items: number;
    calculation_date: string;
    items: T[];
  }
  
  export interface RewardItem {
    conversion_id: string;
    conversion_external_id: number;
    project_id: string;
    project_slug: string;
    project_thumbnail_url: string;
    project_name: string;
    project_contract_address: string;
    project_chain_id: string;
    conversion_name: string;
    action_name: string;
    reward_description: string;
    currency: string;
    affiliate_amount: string;
    enduser_amount: string;
    total_amount: string;
  }
  
  export interface RewardDetails {
    project_id: string;
    conversion_external_id: number;
    project_name: string;
    project_chain_id: number;
    project_contract_address: string;
    conversion_name: string;
    action_name: string;
    reward_description: string;
    calculation_date: string;
    totals: {
      all_time: RewardTotals;
      last_seven_days: RewardTotals;
    };
    payouts: RewardPayouts;
    triggers: RewardTriggers;
  }
  
  export interface RewardTotals {
    currency: string;
    affiliate_amount: string;
    enduser_amount: string;
    total_amount: string;
  }
  
  export interface RewardPayouts {
    id: string;
    tiers: {
      id: string;
      name: string;
      description?: string;
      affiliate_amount: string;
      affiliate_percentage: number;
      enduser_amount: string;
      enduser_percentage: number;
    };
    is_tiered: boolean;
    calculation_strategy: 'fixed' | 'variable';
    payout_currency: string;
    base_currency: string;
    affiliate_amount: string;
    affiliate_percentage: number;
    enduser_amount: string;
    enduser_percentage: number;
  }
  
  export interface RewardTriggers {
    type: 'liquidity_pool' | 'classic';
    name: string;
    signature: string;
    contract_address: string;
    contract_chain_id: number;
    token0?: {
      symbol: string;
      address: string;
    };
    token1?: {
      symbol: string;
      address: string;
    };
    distribution_weights?: {
      token0: number;
      token1: number;
      liquidity: number;
    };
    pool_tvl_usd?: number;
    incentives_apr?: number;
    only_in_range_liquidity?: boolean;
  }
  
  export interface ProjectDetails {
    id: string;
    integration_type: string;
    user_onboarding_page_url: string;
    category: string;
    description: string;
    thumbnail_url: string;
    website: string;
    twitter_handle: string;
    github_account?: string;
    whitepaper_url: string;
    investors?: string;
    geo_restrictions?: string;
    assets_url?: string;
    documentation_url?: string;
    other_links?: Array<{
      url: string;
      name: string;
    }>;
    calculation_date: string;
  }