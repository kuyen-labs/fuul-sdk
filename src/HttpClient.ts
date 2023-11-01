import axios, { AxiosInstance, AxiosResponse } from 'axios';
import release from './release.json';

interface HttpClientOptions {
  baseURL: string;
  timeout: number;
  apiKey?: string;
  queryParams?: Record<string, string>;
}

export interface HttpError {
  message: string;
  status?: number;
}

export class HttpClient {
  private readonly client: AxiosInstance;
  private readonly queryParams: string;

  constructor(options: HttpClientOptions) {
    this.client = axios.create({
      ...options,
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        'X-Fuul-Sdk-Version': release.version,
      },
    });
    this.queryParams = options.queryParams ? this.buildQueryParams(options.queryParams) : '';
  }

  private buildQueryParams(args: Record<string, string>): string {
    let queryParams = '';

    Object.keys(args).forEach((key) => {
      queryParams =
        queryParams === '' ? queryParams + `?${key}=${args[key]}` : queryParams + '&' + `${key}=${args[key]}`;
    });

    return queryParams;
  }

  async get<T>(path: string, params?: any): Promise<AxiosResponse<T>> {
    return this.client.get<T>(path + this.queryParams, { params });
  }

  async post<T>(
    path: string,
    data: {
      [key: string]: any;
    },
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(path + this.queryParams, data);
  }

  async put<T>(
    path: string,
    data: {
      [key: string]: any;
    },
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(path + this.queryParams, data);
  }

  async delete<T>(path: string): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(path + this.queryParams);
  }
}
