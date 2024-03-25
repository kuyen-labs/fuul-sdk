import { HttpClient } from '../HttpClient';
import {
  GetPayoutsLeaderboardParams,
  GetPointsLeaderboardParams,
  GetUserPayoutMovementsParams,
  GetUserPayoutsByConversionParams,
  GetUserPointsByConversionParams,
  GetUserPointsMovementsParams,
  GetVolumeLeaderboardParams,
  LeaderboardResponse,
  PayoutsLeaderboard,
  PointsLeaderboard,
  UserPayoutMovementsResponse,
  UserPayoutsByConversionResponse,
  UserPointsByConversionResponse,
  UserPointsMovementsResponse,
  VolumeLeaderboard,
} from '../types/api';

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

  public async getPayoutsLeaderboard(params: GetPayoutsLeaderboardParams): Promise<LeaderboardResponse<PayoutsLeaderboard>> {
    const results = await this.httpClient.get<LeaderboardResponse<PayoutsLeaderboard>>(`${basePath}/leaderboard`, params);
    return results.data;
  }

  public async getPointsLeaderboard(params: GetPointsLeaderboardParams): Promise<LeaderboardResponse<PointsLeaderboard>> {
    const results = await this.httpClient.get<LeaderboardResponse<PointsLeaderboard>>(`${basePath}/leaderboard`, params);
    return results.data;
  }

  public async getUserPayoutsByConversion(params: GetUserPayoutsByConversionParams): Promise<UserPayoutsByConversionResponse> {
    const results = await this.httpClient.get<UserPayoutsByConversionResponse>(basePath, { ...params, type: 'onchain-currency' });
    return results.data;
  }

  public async getUserPointsByConversion(params: GetUserPointsByConversionParams): Promise<UserPointsByConversionResponse> {
    const results = await this.httpClient.get<UserPointsByConversionResponse>(basePath, { ...params, type: 'point' });
    return results.data;
  }

  public async getUserPayoutMovements(params: GetUserPayoutMovementsParams): Promise<UserPayoutMovementsResponse> {
    const results = await this.httpClient.get<UserPayoutMovementsResponse>(`${basePath}/movements`, { ...params, type: 'onchain-currency' });
    return results.data;
  }

  public async getUserPointsMovements(params: GetUserPointsMovementsParams): Promise<UserPointsMovementsResponse> {
    const results = await this.httpClient.get<UserPointsMovementsResponse>(`${basePath}/movements`, { ...params, type: 'point' });
    return results.data;
  }

  public async getVolumeLeaderboard(params: GetVolumeLeaderboardParams): Promise<LeaderboardResponse<VolumeLeaderboard>> {
    const results = await this.httpClient.get<LeaderboardResponse<VolumeLeaderboard>>(`${basePath}/leaderboard/volume`, params);
    return results.data;
  }
}
