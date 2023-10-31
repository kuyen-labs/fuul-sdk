import { AxiosError } from 'axios';

import { HttpClient } from './HttpClient';
import { Affiliate } from './types/api';

export type AffiliateServiceSettings = {
  httpClient: HttpClient;
  debug?: boolean;
};

export class ValidationError extends Error {
  public readonly errors: string[];

  constructor(errors: string[]) {
    super(errors.join(', '));
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class AddressInUseError extends Error {
  public readonly address: string;

  constructor(address: string) {
    super(`Address already registered.`);
    this.name = 'AddressInUseError';
    this.address = address;
  }
}

export class CodeInUseError extends Error {
  public readonly code: string;

  constructor(code: string) {
    super(`Code already registered.`);
    this.name = 'CodeInUseError';
    this.code = code;
  }
}

export class InvalidSignatureError extends Error {
  constructor() {
    super(`Invalid signature provided`);
    this.name = 'InvalidSignatureError';
  }
}

interface ApiError {
  message: string | string[];
}

export class AffiliateService {
  private readonly httpClient: HttpClient;
  private readonly _debug: boolean | undefined;

  constructor(settings: AffiliateServiceSettings) {
    this.httpClient = settings.httpClient;
    this._debug = settings.debug;
  }

  public async create(address: string, code: string, signature: string): Promise<void> {
    try {
      await this.httpClient.post<ApiError>(`/affiliates`, {
        address,
        name: code,
        code,
        signature,
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

  public async update(address: string, code: string, signature: string): Promise<void> {
    try {
      await this.httpClient.post<ApiError>(`/affiliates/${address}`, {
        code,
        address,
        signature,
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
      await this.httpClient.get<Affiliate>(`/affiliates/codes/${code}`);
      return false;
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e.response?.status === 404) {
          return true;
        }
      }
      console.error(`Fuul SDK: Could not check affiliate code`, e);
      return false;
    }
  }

  public async getCode(address: string): Promise<string | null> {
    try {
      const res = await this.httpClient.get<Affiliate>(`/affiliates/${address}`);
      return res.data.code;
    } catch (e) {
      console.error(`Fuul SDK: Could not get affiliate code`, e);
      return null;
    }
  }
}
