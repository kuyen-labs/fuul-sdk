import { HttpClient } from "../http/HttpClient.js";
import { CampaignDTO } from "./dtos.js";

export const buildQueryParams = (args: Record<string, string>) => {
  let queryParams = "";

  Object.keys(args).forEach((key) => {
    queryParams =
      queryParams === ""
        ? queryParams + `${key}=${args[key]}`
        : queryParams + "&" + `${key}=${args[key]}`;
  });

  return queryParams;
};

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
