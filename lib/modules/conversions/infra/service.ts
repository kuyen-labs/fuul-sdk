import { Conversion } from '@conversions/types';
import { HttpClient } from 'lib/modules/http/client';

export type ConversionServiceSettings = {
  httpClient: HttpClient;
  debug?: boolean;
};

export class ConversionService {
  private httpClient: HttpClient;

  constructor(settings: ConversionServiceSettings) {
    this.httpClient = settings.httpClient;
  }

  async getAll(): Promise<Conversion[]> {
    const { data } = await this.httpClient.get<Conversion[]>('conversions');

    return data;
  }
}
