import { HttpClient } from '../HttpClient';
import {
  GetAffiliateStatsBreakdownParams,
  GetAffiliateStatsBreakdownResponse,
  GetAffiliateStatsParams,
  GetAffiliateStatsResponse,
  GetAffiliateTotalStatsParams,
  GetAffiliateTotalStatsResponse,
  GetNewTradersParams,
  GetReferralTreeParams,
  NewTraderResponse,
  ReferralTreeNodeResponse,
} from './types';

export type AffiliatePortalServiceSettings = {
  httpClient: HttpClient;
};

const basePath = '/affiliate-portal';

export class AffiliatePortalService {
  private readonly httpClient: HttpClient;

  constructor(settings: AffiliatePortalServiceSettings) {
    this.httpClient = settings.httpClient;
  }

  public async getAffiliateStats(params: GetAffiliateStatsParams): Promise<GetAffiliateStatsResponse> {
    const result = await this.httpClient.get<GetAffiliateStatsResponse>({
      path: `${basePath}/stats`,
      queryParams: {
        user_identifier: params.user_identifier,
        from: params.from,
        to: params.to,
        this_month: params.this_month,
        conversion_id: params.conversion_id,
        conversion_external_id: params.conversion_external_id,
        conversion_name: params.conversion_name,
      },
    });
    return result.data;
  }

  public async getAffiliateTotalStats(params: GetAffiliateTotalStatsParams): Promise<GetAffiliateTotalStatsResponse> {
    const result = await this.httpClient.get<GetAffiliateTotalStatsResponse>({
      path: `${basePath}/total-stats`,
      queryParams: {
        statuses: params.statuses,
        regions: params.regions,
        audiences: params.audiences,
      },
    });
    return result.data;
  }

  public async getReferralTree(params: GetReferralTreeParams): Promise<ReferralTreeNodeResponse> {
    const result = await this.httpClient.get<ReferralTreeNodeResponse>({
      path: `${basePath}/referral-tree`,
      queryParams: {
        user_identifier: params.user_identifier,
      },
    });
    return result.data;
  }

  public async getStatsBreakdown(params: GetAffiliateStatsBreakdownParams): Promise<GetAffiliateStatsBreakdownResponse> {
    const result = await this.httpClient.get<GetAffiliateStatsBreakdownResponse>({
      path: `${basePath}/stats-breakdown`,
      queryParams: {
        user_identifier: params.user_identifier,
        group_by: params.group_by,
        date_range: params.date_range,
        from: params.from,
        to: params.to,
        conversion_external_id: params.conversion_external_id,
        conversion_name: params.conversion_name,
        currency_id: params.currency_id,
      },
    });
    return result.data;
  }

  public async getAffiliateNewTraders(params: GetNewTradersParams): Promise<NewTraderResponse[]> {
    const result = await this.httpClient.get<NewTraderResponse[]>({
      path: `${basePath}/new-traders`,
      queryParams: {
        user_identifier: params.user_identifier,
        from: params.from,
        to: params.to,
        this_month: params.this_month,
      },
    });
    return result.data;
  }
}
