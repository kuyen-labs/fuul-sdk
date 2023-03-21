import { HttpClient } from "../http/HttpClient.js";
import { CampaignDTO } from "./dtos.js";

export class CampaignsService {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  async getCampaignyById(campaignId: string): Promise<CampaignDTO> {
    try {
      const { data } = await this.httpClient.get<CampaignDTO>(
        `/campaigns/${campaignId}`
      );

      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
