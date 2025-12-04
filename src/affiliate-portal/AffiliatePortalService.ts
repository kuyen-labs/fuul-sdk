import { HttpClient } from '../HttpClient';
import { GetAffiliateStatsParams, GetAffiliateStatsResponse } from './types';

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
}
