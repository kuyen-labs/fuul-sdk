import { HttpClient } from "../HttpClient";
import { GetUserAudiencesParams, GetUserAudiencesResponse } from "../types/api";

export type AudienceServiceSettings = {
  httpClient: HttpClient;
  debug?: boolean;
};

const basePath = '/audiences';

export class AudienceService {
  private readonly httpClient: HttpClient;
  private readonly _debug: boolean | undefined;

  constructor(settings: AudienceServiceSettings) {
    this.httpClient = settings.httpClient;
    this._debug = settings.debug;
  }

  public async getUserAudiences(params: GetUserAudiencesParams): Promise<GetUserAudiencesResponse> {
    const results = await this.httpClient.get<GetUserAudiencesResponse>(`${basePath}/user`, params);
    return results.data;
  }
}