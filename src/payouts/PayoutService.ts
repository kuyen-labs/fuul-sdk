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
