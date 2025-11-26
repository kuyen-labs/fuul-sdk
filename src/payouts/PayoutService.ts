import { HttpClient } from '../HttpClient';
import {
  GetPayoutsByReferrerParams,
  GetUserPayoutMovementsParams,
  GetUserPayoutsByConversionParams,
  GetUserPointsByConversionParams,
  GetUserPointsMovementsParams,
  GetVolumeLeaderboardParams,
  LeaderboardResponse,
  PayoutsByReferrerResponse,
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
    const results = await this.httpClient.get<UserPayoutsByConversionResponse>({
      path: basePath,
      queryParams: { ...params, type: 'onchain-currency' },
    });
    return results.data;
  }

  public async getUserPointsByConversion(params: GetUserPointsByConversionParams): Promise<UserPointsByConversionResponse> {
    const results = await this.httpClient.get<UserPointsByConversionResponse>({
      path: basePath,
      queryParams: { ...params, type: 'point' },
    });
    return results.data;
  }

  public async getUserPayoutMovements(params: GetUserPayoutMovementsParams): Promise<UserPayoutMovementsResponse> {
    const results = await this.httpClient.get<UserPayoutMovementsResponse>({
      path: `${basePath}/movements`,
      queryParams: { ...params, type: 'onchain-currency' },
    });
    return results.data;
  }

  public async getUserPointsMovements(params: GetUserPointsMovementsParams): Promise<UserPointsMovementsResponse> {
    const results = await this.httpClient.get<UserPointsMovementsResponse>({
      path: `${basePath}/movements`,
      queryParams: { ...params, type: 'point' },
    });
    return results.data;
  }

  public async getVolumeLeaderboard(params: GetVolumeLeaderboardParams): Promise<LeaderboardResponse<VolumeLeaderboard>> {
    const results = await this.httpClient.get<LeaderboardResponse<VolumeLeaderboard>>({
      path: `${basePath}/leaderboard/volume`,
      queryParams: { ...params },
    });
    return results.data;
  }

  public async getPayoutsByReferrer(params: GetPayoutsByReferrerParams): Promise<PayoutsByReferrerResponse> {
    const results = await this.httpClient.get<PayoutsByReferrerResponse>({
      path: `${basePath}/by-referrer`,
      queryParams: {
        user_identifier: params.user_identifier,
        user_identifier_type: params.user_identifier_type,
      },
    });
    return results.data;
  }
}
