import { HttpClient } from '../HttpClient';
import {
  GetAffiliateCodeStatsParams,
  GetAffiliateCodeStatsResponse,
  GetAffiliateStatsParams,
  GetAffiliateStatsResponse,
  GetNewTradersParams,
  NewTraderResponse,
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
      },
    });
    return result.data;
  }

  public async getAffiliateCodeStats(params: GetAffiliateCodeStatsParams): Promise<GetAffiliateCodeStatsResponse> {
    const result = await this.httpClient.get<GetAffiliateCodeStatsResponse>({
      path: `${basePath}/referral-code`,
      queryParams: {
        user_identifier: params.user_identifier,
      },
    });
    return result.data;
  }
}
