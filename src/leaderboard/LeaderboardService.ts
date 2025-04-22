import { HttpClient } from '../HttpClient';
import {
  GetReferredUsersLeaderboardParams,
  GetRewardsLeaderboardParams,
  LeaderboardResponse,
  ReferredUsersLeaderboard,
  RewardsLeaderboard,
} from '../types/api';

export type LeaderboardServiceSettings = {
  httpClient: HttpClient;
};

export class LeaderboardService {
  private readonly httpClient: HttpClient;

  constructor(settings: LeaderboardServiceSettings) {
    this.httpClient = settings.httpClient;
  }

  public async getRewardsLeaderboard(params: GetRewardsLeaderboardParams): Promise<LeaderboardResponse<RewardsLeaderboard>> {
    const results = await this.httpClient.get<LeaderboardResponse<RewardsLeaderboard>>({
      path: `/rewards/leaderboard`,
      queryParams: { ...params },
    });
    return results.data;
  }

  public async getReferredUsersLeaderboard(params: GetReferredUsersLeaderboardParams): Promise<LeaderboardResponse<ReferredUsersLeaderboard>> {
    const results = await this.httpClient.get<LeaderboardResponse<ReferredUsersLeaderboard>>({
      path: `/leaderboard/referred`,
      queryParams: { ...params },
    });
    return results.data;
  }
}
