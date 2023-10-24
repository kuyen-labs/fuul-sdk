import { AxiosError } from 'axios';
import { HttpClient } from './HttpClient';
import { Affiliate } from './types/api';

export type AffiliateServiceSettings = {
  httpClient: HttpClient;
  debug?: boolean;
};

export class AddressInUseError extends Error {
  public readonly address: string;

  constructor(address: string) {
    super(`Address already used: ${address}`);
    this.name = 'AddressInUseError';
    this.address = address;
  }
}

export class CodeInUseError extends Error {
  public readonly code: string;

  constructor(code: string) {
    super(`Code already used: ${code}`);
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
  message: string;
}

export class AffiliateService {
  private readonly httpClient: HttpClient;
  private readonly _debug: boolean | undefined;

  constructor(settings: AffiliateServiceSettings) {
    this.httpClient = settings.httpClient;
    this._debug = settings.debug;
  }

  public async create(address: string, code: string, signature: string, signatureMessage: string): Promise<void> {
    try {
      await this.httpClient.post<ApiError>(`/affiliates`, {
        address,
        name: code,
        code,
        signature,
        signature_message: signatureMessage,
      });
    } catch (e) {
      console.error(`Fuul SDK: Could not create affiliate code`, e);

      if (e instanceof AxiosError) {
        const data = e.response?.data;
        if (data?.message) {
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
        }
      }

      throw e;
    }
  }

  public async getCode(address: string): Promise<string | null> {
    try {
      const res = await this.httpClient.get<Affiliate>(`/affiliates/${address}`);
      if (res.status !== 200) {
        return null;
      }
      return res.data.code;
    } catch (e) {
      console.error(`Fuul SDK: Could not get affiliate code`, e);
      return null;
    }
  }
}
