import axios, { AxiosInstance, AxiosResponse } from "axios";

interface HttpClientOptions {
  baseURL: string;
  timeout: number;
}

export interface HttpError {
  message: string;
  status?: number;
}

export class HttpClient {
  private readonly client: AxiosInstance;
  private token: string | null;

  constructor(options: HttpClientOptions) {
    this.client = axios.create(options);
    this.token = null;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  async get<T>(path: string, params?: any): Promise<AxiosResponse<T>> {
    try {
      const headers = this._getHeaders();
      const response = await this.client.get<T>(path, { params, headers });
      return response;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async post<T>(path: string, data?: any): Promise<AxiosResponse<T>> {
    try {
      const headers = this._getHeaders();
      const response = await this.client.post<T>(path, data, { headers });
      return response;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async put<T>(path: string, data?: any): Promise<AxiosResponse<T>> {
    try {
      const headers = this._getHeaders();
      const response = await this.client.put<T>(path, data, { headers });
      return response;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  async delete<T>(path: string): Promise<AxiosResponse<T>> {
    try {
      const headers = this._getHeaders();
      const response = await this.client.delete<T>(path, { headers });
      return response;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  private _getHeaders(): any {
    const headers: any = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  private _handleError(error: any): HttpError {
    if (error.response) {
      return {
        message: error.response.data.message || "An error occurred",
        status: error.response.status,
      };
    } else if (error.request) {
      return {
        message: "Bad request",
      };
    } else {
      return {
        message: error.message || "An error occurred, please try again",
      };
    }
  }
}
