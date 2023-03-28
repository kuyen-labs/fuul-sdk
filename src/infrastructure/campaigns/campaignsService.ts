import { HttpClient } from "../http/HttpClient.js";
import { CampaignDTO } from "./dtos.js";

export class CampaignsService {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  async getAllCampaignsByProjectId(projectId?: string): Promise<CampaignDTO[]> {
    const PATH = projectId ? `campaigns?project_id=${projectId}` : `campaigns`;
    const { data } = await this.httpClient.get<CampaignDTO[]>(PATH);

    return data;
  }
}
