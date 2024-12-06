import { HttpClient } from '../HttpClient';
import { ChainParams, ListingResponse, PaginationParams, ProjectDetails, RewardDetails, RewardItem } from './explorer.types';

export type ExplorerServiceSettings = {
  httpClient: HttpClient;
  debug?: boolean;
};

const basePath = '/explorer/v1';

export class ExplorerService {
  private readonly httpClient: HttpClient;
  private readonly _debug: boolean | undefined;

  constructor(settings: ExplorerServiceSettings) {
    this.httpClient = settings.httpClient;
    this._debug = settings.debug;
  }

  public async getIncentiveRewards(params: PaginationParams & ChainParams): Promise<ListingResponse<RewardItem>> {
    const results = await this.httpClient.get<ListingResponse<RewardItem>>(`${basePath}/listings/incentive-rewards`, params);
    return results.data;
  }

  public async getReferralRewards(params: PaginationParams & ChainParams): Promise<ListingResponse<RewardItem>> {
    const results = await this.httpClient.get<ListingResponse<RewardItem>>(`${basePath}/listings/referral-rewards`, params);
    return results.data;
  }

  public async getRewardDetails(params: {
    type: 'incentive' | 'referral';
    project_id: string;
    conversion_external_id?: string;
  }): Promise<RewardDetails> {
    const results = await this.httpClient.get<RewardDetails>(`${basePath}/details`, params);
    return results.data;
  }

  public async getProjectDetails(projectId: string): Promise<ProjectDetails> {
    const results = await this.httpClient.get<ProjectDetails>(`${basePath}/projects/${projectId}`);
    return results.data;
  }
}
