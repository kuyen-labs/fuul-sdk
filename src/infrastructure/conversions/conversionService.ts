import { HttpClient } from '../http/HttpClient'
import { ConversionDTO } from './dtos'

export class ConversionService {
  private httpClient: HttpClient

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient
  }

  async getAll(): Promise<ConversionDTO[]> {
    const { data } = await this.httpClient.get<ConversionDTO[]>('conversions')

    return data
  }
}
