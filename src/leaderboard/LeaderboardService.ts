import { HttpClient } from '../HttpClient';
import {
  GetPayoutsLeaderboardParams,
  GetPointsLeaderboardParams,
  GetReferredUsersLeaderboardParams,
  GetReferredVolumeParams,
  GetVolumeLeaderboardParams,
  LeaderboardResponse,
  PayoutsLeaderboard,
  PointsLeaderboard,
  ReferredUsersLeaderboard,
  ReferredVolumeResponse,
  VolumeLeaderboard,
} from '../types/api';

export type LeaderboardServiceSettings = {
  httpClient: HttpClient;
};

export class LeaderboardService {
  private readonly httpClient: HttpClient;

  constructor(settings: LeaderboardServiceSettings) {
    this.httpClient = settings.httpClient;
  }

  public async getPayoutsLeaderboard(params: GetPayoutsLeaderboardParams): Promise<LeaderboardResponse<PayoutsLeaderboard>> {
    const results = await this.httpClient.get<LeaderboardResponse<PayoutsLeaderboard>>({
      path: `/payouts/leaderboard/payouts`,
      queryParams: { ...params },
    });
    return results.data;
  }

  public async getPointsLeaderboard(params: GetPointsLeaderboardParams): Promise<LeaderboardResponse<PointsLeaderboard>> {
    const results = await this.httpClient.get<LeaderboardResponse<PointsLeaderboard>>({
      path: `/payouts/leaderboard/points`,
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

  public async getReferredVolume(params: GetReferredVolumeParams): Promise<ReferredVolumeResponse> {
    const { user_identifiers, ...restParams } = params;
    const results = await this.httpClient.get<ReferredVolumeResponse>({
      path: `/payouts/leaderboard/referred-volume`,
      queryParams: {
        ...restParams,
        user_identifiers: user_identifiers.join(','),
      },
    });
    return results.data;
  }

  public async getVolumeLeaderboard(params: GetVolumeLeaderboardParams): Promise<LeaderboardResponse<VolumeLeaderboard>> {
    const results = await this.httpClient.get<LeaderboardResponse<VolumeLeaderboard>>({
      path: `/payouts/leaderboard/volume`,
      queryParams: { ...params },
    });
    return results.data;
  }
}
