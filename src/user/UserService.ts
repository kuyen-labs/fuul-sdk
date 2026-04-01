import { HttpClient } from '../HttpClient';
import { GetUserReferrerParams, GetUserReferrerResponse } from './types';

export type UserServiceSettings = {
  httpClient: HttpClient;
};

const basePath = '/user';

export class UserService {
  private readonly httpClient: HttpClient;

  constructor(settings: UserServiceSettings) {
    this.httpClient = settings.httpClient;
  }

  public async getUserReferrer(params: GetUserReferrerParams): Promise<GetUserReferrerResponse> {
    const result = await this.httpClient.get<GetUserReferrerResponse>({ path: `${basePath}/referrer`, queryParams: { ...params } });
    return result.data;
  }
}
