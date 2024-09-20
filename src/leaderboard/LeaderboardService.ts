import { HttpClient } from "../HttpClient";
import { GetPayoutsLeaderboardParams, GetPointsLeaderboardParams, GetReferredUsersLeaderboardParams, LeaderboardResponse, PayoutsLeaderboard, PointsLeaderboard, ReferredUsersLeaderboard } from "../types/api";

export type LeaderboardServiceSettings = {
  httpClient: HttpClient;
};

export class LeaderboardService {
  private readonly httpClient: HttpClient;

  constructor(settings: LeaderboardServiceSettings) {
    this.httpClient = settings.httpClient;
  }

  public async getPayoutsLeaderboard(params: GetPayoutsLeaderboardParams): Promise<LeaderboardResponse<PayoutsLeaderboard>> {
    const results = await this.httpClient.get<LeaderboardResponse<PayoutsLeaderboard>>(`/payouts/leaderboard/payouts`, params);
    return results.data;
  }

  public async getPointsLeaderboard(params: GetPointsLeaderboardParams): Promise<LeaderboardResponse<PointsLeaderboard>> {
    const results = await this.httpClient.get<LeaderboardResponse<PointsLeaderboard>>(`/payouts/leaderboard/points`, params);
    return results.data;
  }

  public async getReferredUsersLeaderboard(params: GetReferredUsersLeaderboardParams): Promise<LeaderboardResponse<ReferredUsersLeaderboard>> {
    const results = await this.httpClient.get<LeaderboardResponse<ReferredUsersLeaderboard>>(`/leaderboard/referred`, params);
    return results.data;
  }
}