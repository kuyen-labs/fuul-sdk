import axios, { AxiosInstance, AxiosResponse, RawAxiosRequestHeaders } from 'axios'
import { buildQueryParams } from '../../utils/queryParams'

interface HttpClientOptions {
  baseURL: string
  timeout: number
  apiKey?: string
  queryParams?: Record<string, string>
}

export interface HttpError {
  message: string
  status?: number
}

export class HttpClient {
  private readonly client: AxiosInstance
  private readonly queryParams: string

  constructor(options: HttpClientOptions) {
    this.client = axios.create({
      ...options,
      headers: options.apiKey ? this._getHeaders(options.apiKey) : {},
    })
    this.queryParams = options.queryParams ? buildQueryParams(options.queryParams) : ''
  }

  async get<T>(path: string, params?: any): Promise<AxiosResponse<T>> {
    return this.client.get<T>(path + this.queryParams, { params })
  }

  async post<T>(
    path: string,
    data: {
      [key: string]: any
    },
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(path + this.queryParams, data)
  }

  async put<T>(
    path: string,
    data: {
      [key: string]: any
    },
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(path + this.queryParams, data)
  }

  async delete<T>(path: string): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(path + this.queryParams)
  }

  _getHeaders(apiKey: string): RawAxiosRequestHeaders {
    const headers: RawAxiosRequestHeaders = {}

    headers.Authorization = `Bearer ${apiKey}`

    return headers
  }
}
