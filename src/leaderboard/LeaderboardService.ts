import { HttpClient } from '../HttpClient';
import {
  GetPayoutsLeaderboardParams,
  GetPointsLeaderboardParams,
  GetReferredUsersLeaderboardParams,
  GetReferredVolumeParams,
  GetRevenueLeaderboardParams,
  GetVolumeLeaderboardParams,
  LeaderboardResponse,
  PayoutsLeaderboard,
  PointsLeaderboard,
  ReferredUsersLeaderboard,
  ReferredVolumeResponse,
  RevenueLeaderboard,
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
    const { identifier_type, user_identifier_type, ...rest } = params;
    const queryParams = {
      ...rest,
      user_identifier_type: identifier_type ?? user_identifier_type,
    };
    const results = await this.httpClient.get<LeaderboardResponse<PayoutsLeaderboard>>({
      path: `/payouts/leaderboard/payouts`,
      queryParams,
    });
    return results.data;
  }

  public async getPointsLeaderboard(params: GetPointsLeaderboardParams): Promise<LeaderboardResponse<PointsLeaderboard>> {
    const { identifier_type, user_identifier_type, ...rest } = params;
    const queryParams = {
      ...rest,
      user_identifier_type: identifier_type ?? user_identifier_type,
    };
    const results = await this.httpClient.get<LeaderboardResponse<PointsLeaderboard>>({
      path: `/payouts/leaderboard/points`,
      queryParams,
    });
    return results.data;
  }

  public async getVolumeLeaderboard(params: GetVolumeLeaderboardParams): Promise<LeaderboardResponse<VolumeLeaderboard>> {
    const { identifier_type, user_identifier_type, ...rest } = params;
    const queryParams = {
      ...rest,
      identifier_type: identifier_type ?? user_identifier_type,
    };
    const results = await this.httpClient.get<LeaderboardResponse<VolumeLeaderboard>>({
      path: `/payouts/leaderboard/volume`,
      queryParams,
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

  public async getRevenueLeaderboard(params: GetRevenueLeaderboardParams): Promise<LeaderboardResponse<RevenueLeaderboard>> {
    const { identifier_type, user_identifier_type, ...rest } = params;
    const queryParams = {
      ...rest,
      identifier_type: identifier_type ?? user_identifier_type,
    };
    const results = await this.httpClient.get<LeaderboardResponse<RevenueLeaderboard>>({
      path: `/payouts/leaderboard/revenue`,
      queryParams,
    });
    return results.data;
  }
}
