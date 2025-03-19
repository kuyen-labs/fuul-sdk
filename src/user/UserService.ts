import { HttpClient } from '../HttpClient';
import { GetUserAffiliatesParams, GetUserResponse, UserAffiliate } from './types';

export type UserServiceSettings = {
  httpClient: HttpClient;
};

const basePath = '/user';

export class UserService {
  private readonly httpClient: HttpClient;

  constructor(settings: UserServiceSettings) {
    this.httpClient = settings.httpClient;
  }

  public async getUserAffiliates(params: GetUserAffiliatesParams): Promise<UserAffiliate[]> {
    const results = await this.httpClient.get<GetUserResponse>({ path: basePath, queryParams: { ...params } });
    return results.data.affiliates;
  }
}
