import { HttpClient } from "../http/HttpClient.js";
import { ConversionDTO } from "./dtos.js";

export class ConversionsService {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  async getAllConversionsByProjectId(): Promise<ConversionDTO[]> {
    const { data } = await this.httpClient.get<ConversionDTO[]>("conversions");

    return data;
  }
}
