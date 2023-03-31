import { HttpClient } from "../http/HttpClient.js";
import { CampaignDTO } from "./dtos.js";

export class CampaignsService {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  async getAllCampaignsByProjectId(): Promise<CampaignDTO[]> {
    const { data } = await this.httpClient.get<CampaignDTO[]>("campaigns");

    return data;
  }
}
