import axios, {
  AxiosInstance,
  AxiosResponse,
  RawAxiosRequestHeaders,
} from "axios";

interface HttpClientOptions {
  baseURL: string;
  timeout: number;
  apiKey?: string;
}

export interface HttpError {
  message: string;
  status?: number;
}

export class HttpClient {
  private readonly client: AxiosInstance;

  constructor(options: HttpClientOptions) {
    this.client = axios.create({
      ...options,
      headers: options.apiKey ? this._getHeaders(options.apiKey) : {},
    });
  }

  async get<T>(path: string, params?: any): Promise<AxiosResponse<T>> {
    return this.client.get<T>(path, { params });
  }

  async post<T>(
    path: string,
    data: {
      [key: string]: any;
    }
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(path, data);
  }

  async put<T>(
    path: string,
    data: {
      [key: string]: any;
    }
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(path, data);
  }

  async delete<T>(path: string): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(path);
  }

  _getHeaders(apiKey: string): RawAxiosRequestHeaders {
    const headers: RawAxiosRequestHeaders = {};

    headers.Authorization = `Bearer ${apiKey}`;

    return headers;
  }
}
