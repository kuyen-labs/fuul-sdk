import { HttpClient } from '../HttpClient';
import { GetAffiliateStatsParams, GetAffiliateStatsResponse, GetNewTradersParams, NewTraderResponse } from './types';

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
