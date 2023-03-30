import { buildQueryParams } from "../../utils/queryParams.js";
import { HttpClient } from "../http/HttpClient.js";
import { CampaignDTO } from "./dtos.js";

export class CampaignsService {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  async getAllCampaignsByProjectId(
    queryParams?: Record<string, string>
  ): Promise<CampaignDTO[]> {
    const PATH = queryParams
      ? `campaigns?${buildQueryParams(queryParams)}`
      : `campaigns`;
    const { data } = await this.httpClient.get<CampaignDTO[]>(PATH);

    return data;
  }
}
