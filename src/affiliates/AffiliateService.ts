import { AxiosError } from 'axios';

import { HttpClient } from '../HttpClient';
import { Affiliate } from '../types/api';
import { AddressInUseError, CodeInUseError, InvalidSignatureError, ValidationError } from './errors';

export type AffiliateServiceSettings = {
  httpClient: HttpClient;
  debug?: boolean;
};

const basePath = '/v1/affiliates';

export class AffiliateService {
  private readonly httpClient: HttpClient;
  private readonly _debug: boolean | undefined;

  constructor(settings: AffiliateServiceSettings) {
    this.httpClient = settings.httpClient;
    this._debug = settings.debug;
  }

  public async create(address: string, code: string, signature: string, accountChainId?: number): Promise<void> {
    try {
      await this.httpClient.post<void>(`${basePath}`, {
        address,
        name: code,
        code,
        signature,
        account_chain_id: accountChainId,
      });
    } catch (e: unknown) {
      if (e instanceof AxiosError) {
        const data = e.response?.data;
        if (typeof data?.message === 'string') {
          const message = data.message.toLowerCase();

          if (message == 'invalid signature') {
            throw new InvalidSignatureError();
          } else if (message == 'address in use') {
            throw new AddressInUseError(address);
          } else if (message == 'code in use') {
            throw new CodeInUseError(code);
          } else {
            throw new Error(message);
          }
        } else if (data?.message instanceof Array) {
          throw new ValidationError(data.message);
        }
      }

      throw e;
    }
  }

  public async update(address: string, code: string, signature: string, accountChainId?: number): Promise<void> {
    try {
      await this.httpClient.post<void>(`${basePath}/${address}`, {
        code,
        address,
        signature,
        account_chain_id: accountChainId,
      });
    } catch (e: unknown) {
      if (e instanceof AxiosError) {
        const data = e.response?.data;
        if (typeof data?.message === 'string') {
          const message = data.message.toLowerCase();

          if (message == 'invalid signature') {
            throw new InvalidSignatureError();
          } else if (message == 'address in use') {
            throw new AddressInUseError(address);
          } else if (message == 'code in use') {
            throw new CodeInUseError(code);
          } else {
            throw new Error(message);
          }
        } else if (data?.message instanceof Array) {
          throw new ValidationError(data.message);
        }
      }

      throw e;
    }
  }

  public async isCodeFree(code: string): Promise<boolean> {
    try {
      await this.httpClient.get<Affiliate>(`${basePath}/codes/${code}`);
      return false;
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e.response?.status === 404) {
          return true;
        }
      }
      console.error(`Fuul SDK: Could not check affiliate code`, e);
      throw e;
    }
  }

  public async getCode(address: string): Promise<string | null> {
    try {
      const res = await this.httpClient.get<Affiliate>(`${basePath}/${address}`);
      return res.data.code;
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      console.error(`Fuul SDK: Could not get affiliate code`, e);
      throw e;
    }
  }
}
