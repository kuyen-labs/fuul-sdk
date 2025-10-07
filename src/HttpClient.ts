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

export interface Request {
  path: string;
  postData?: Record<string, unknown>;
  queryParams?: Record<string, unknown>;
}

export class HttpClient {
  private readonly client: AxiosInstance;
  private defaultQueryParams: Record<string, unknown>;

  constructor(options: HttpClientOptions) {
    this.client = axios.create({
      ...options,
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        'X-Fuul-Sdk-Version': release.version,
      },
    });

    this.defaultQueryParams = options.queryParams || {};
  }

  private makeQueryParams(queryParams?: Record<string, unknown>): Record<string, unknown> {
    return Object.assign({}, this.defaultQueryParams || {}, queryParams || {});
  }

  async get<T>(req: Request): Promise<AxiosResponse<T>> {
    return this.client.request<T>({
      url: req.path,
      params: this.makeQueryParams(req.queryParams),
      method: 'GET',
    });
  }

  async post<T>(req: Request): Promise<AxiosResponse<T>> {
    return this.client.request<T>({
      url: req.path,
      params: this.makeQueryParams(req.queryParams),
      data: req.postData,
      method: 'POST',
    });
  }

  async put<T>(req: Request): Promise<AxiosResponse<T>> {
    return this.client.request<T>({
      url: req.path,
      params: this.makeQueryParams(req.queryParams),
      data: req.postData,
      method: 'PUT',
    });
  }

  async patch<T>(req: Request): Promise<AxiosResponse<T>> {
    return this.client.request<T>({
      url: req.path,
      params: this.makeQueryParams(req.queryParams),
      data: req.postData,
      method: 'PATCH',
    });
  }

  async delete<T>(req: Request): Promise<AxiosResponse<T>> {
    return this.client.request<T>({
      url: req.path,
      params: this.makeQueryParams(req.queryParams),
      method: 'DELETE',
    });
  }
}
