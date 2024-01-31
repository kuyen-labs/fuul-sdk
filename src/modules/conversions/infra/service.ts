import { HttpClient } from 'src/modules/http/client';

import { Conversion } from '../types';

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
