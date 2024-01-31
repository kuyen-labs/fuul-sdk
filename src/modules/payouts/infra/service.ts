import { HttpClient } from 'src/modules/http/client';

import {
  GetProjectPayoutsLeaderboardParams,
  GetUserPayoutsParams,
  ProjectPayoutsLeaderboardResponse,
  UserPayoutsResponse,
} from '../types';

export type PayoutServiceSettings = {
  httpClient: HttpClient;
  debug?: boolean;
};

const basePath = '/payouts';

export class PayoutService {
  private readonly httpClient: HttpClient;
  private readonly _debug: boolean | undefined;

  constructor(settings: PayoutServiceSettings) {
    this.httpClient = settings.httpClient;
    this._debug = settings.debug;
  }

  public async getProjectPayoutsLeaderboard(
    params: GetProjectPayoutsLeaderboardParams,
  ): Promise<ProjectPayoutsLeaderboardResponse> {
    const results = await this.httpClient.get<ProjectPayoutsLeaderboardResponse>(`${basePath}/leaderboard`, params);
    return results.data;
  }

  public async getUserPayouts(params: GetUserPayoutsParams): Promise<UserPayoutsResponse> {
    const results = await this.httpClient.get<UserPayoutsResponse>(basePath, params);
    return results.data;
  }
}
