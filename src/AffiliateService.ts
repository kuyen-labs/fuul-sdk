import { HttpClient } from './HttpClient';
import { Affiliate } from './types/api';

export type AffiliateServiceSettings = {
  httpClient: HttpClient;
  debug?: boolean;
};

export class AffiliateService {
  private readonly httpClient: HttpClient;
  private readonly _debug: boolean | undefined;

  constructor(settings: AffiliateServiceSettings) {
    this.httpClient = settings.httpClient;
    this._debug = settings.debug;
  }

  public async getCode(address: string): Promise<string | null> {
    try {
      const res = await this.httpClient.get<Affiliate>(`/affiliates/${address}`);

      if (res.status !== 200) {
        return null;
      }
      return res.data.code;
    } catch (e) {
      this._debug && console.error(`Fuul SDK: Could not get affiliate code`, e);
      return null;
    }
  }
}
