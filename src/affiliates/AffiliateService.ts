import { AxiosError } from 'axios';

import { UserIdentifierType } from '..';
import { HttpClient } from '../HttpClient';
import { Affiliate, CheckAffiliateCodeAvailabilityResponse } from '../types/api';
import { AddressInUseError, CodeInUseError, InvalidSignatureError, ValidationError } from './errors';

export type AffiliateServiceSettings = {
  httpClient: HttpClient;
  debug?: boolean;
};

export class AffiliateService {
  private readonly httpClient: HttpClient;
  private readonly _debug: boolean | undefined;

  constructor(settings: AffiliateServiceSettings) {
    this.httpClient = settings.httpClient;
    this._debug = settings.debug;
  }

  public async create(
    address: string,
    identifier_type: UserIdentifierType,
    code: string,
    signature: string,
    signaturePublicKey?: string,
    accountChainId?: number,
    userRebateRate?: number,
  ): Promise<void> {
    try {
      await this.httpClient.post<void>({
        path: `/affiliates`,
        postData: {
          address,
          identifier_type,
          name: code,
          code,
          signature,
          signature_public_key: signaturePublicKey,
          account_chain_id: accountChainId,
          user_rebate_rate: userRebateRate,
        },
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

  public async update(
    user_identifier: string,
    identifier_type: UserIdentifierType,
    code: string,
    signature: string,
    signaturePublicKey?: string,
    accountChainId?: number,
    userRebateRate?: number,
  ): Promise<void> {
    try {
      await this.httpClient.post<void>({
        path: `/affiliates/${user_identifier}`,
        postData: {
          code,
          user_identifier,
          identifier_type,
          signature,
          signature_public_key: signaturePublicKey,
          account_chain_id: accountChainId,
          user_rebate_rate: userRebateRate,
        },
      });
    } catch (e: unknown) {
      if (e instanceof AxiosError) {
        const data = e.response?.data;
        if (typeof data?.message === 'string') {
          const message = data.message.toLowerCase();

          if (message == 'invalid signature') {
            throw new InvalidSignatureError();
          } else if (message == 'address in use') {
            throw new AddressInUseError(user_identifier);
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
      const res = await this.httpClient.get<CheckAffiliateCodeAvailabilityResponse>({ path: `/affiliates/codes/${code}` });
      return res.data.available;
    } catch (e) {
      console.error(`Fuul SDK: Could not check affiliate code`, e);
      throw e;
    }
  }

  public async getCode(address: string, identifier_type: UserIdentifierType): Promise<Affiliate | null> {
    try {
      const res = await this.httpClient.get<Affiliate>({ path: `/affiliates/${address}`, queryParams: { identifier_type } });
      return res.data;
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
