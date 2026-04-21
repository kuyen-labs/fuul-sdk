import { AxiosError } from 'axios';

import { UserIdentifierType } from '..';
import { HttpClient } from '../HttpClient';
import {
  Affiliate,
  AffiliateCodeWithStats,
  CheckAffiliateCodeAvailabilityResponse,
  CheckAffiliateCodeAvailableResponse,
  CreateAffiliateResponse,
} from '../types/api';

type GetAffiliateApiResponse = {
  id: string;
  name: string;
  user_identifier: string;
  user_identifier_type: string;
  updated_at: string;
  region?: string;
  codes: AffiliateCodeWithStats[];
};
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
  ): Promise<CreateAffiliateResponse> {
    try {
      const response = await this.httpClient.post<CreateAffiliateResponse>({
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
      return response.data;
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

  public async updateRebateRate(
    user_identifier: string,
    identifier_type: UserIdentifierType,
    code: string,
    signature: string,
    rebateRate: number,
    signaturePublicKey?: string,
    accountChainId?: number,
    sourceProjectId?: string,
  ): Promise<void> {
    try {
      await this.httpClient.post<void>({
        path: `/affiliates/${user_identifier}/rebate-rate`,
        postData: {
          identifier_type,
          code,
          signature,
          signature_public_key: signaturePublicKey,
          account_chain_id: accountChainId,
          source_project_id: sourceProjectId,
          rebate_rate: rebateRate,
        },
      });
    } catch (e: unknown) {
      if (e instanceof AxiosError) {
        const data = e.response?.data;
        if (typeof data?.message === 'string') {
          const message = data.message.toLowerCase();

          if (message == 'invalid signature') {
            throw new InvalidSignatureError();
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
      return res.data.free;
    } catch (e) {
      console.error(`Fuul SDK: Could not check affiliate code`, e);
      throw e;
    }
  }

  public async isCodeAvailable(code: string): Promise<boolean> {
    try {
      const res = await this.httpClient.get<CheckAffiliateCodeAvailableResponse>({ path: `/affiliates/codes/${code}/availability` });
      return res.data.available;
    } catch (e) {
      console.error(`Fuul SDK: Could not check affiliate code availability`, e);
      throw e;
    }
  }

  public async getReferral(address: string, identifier_type: UserIdentifierType): Promise<Affiliate | null> {
    try {
      const res = await this.httpClient.get<GetAffiliateApiResponse>({ path: `/affiliates/${address}`, queryParams: { identifier_type } });
      const data = res.data;
      const codes = data.codes ?? [];
      const first = codes[0];
      return {
        id: data.id,
        name: data.name,
        user_identifier: data.user_identifier,
        user_identifier_type: data.user_identifier_type,
        updated_at: data.updated_at,
        region: data.region ?? '',
        codes,
        code: first?.code ?? '',
        created_at: first?.created_at ?? '',
        uses: first?.uses ?? 0,
        clicks: first?.clicks ?? 0,
        total_users: first?.total_users ?? 0,
        total_earnings: first?.total_earnings ?? 0,
        rebate_rate: first?.rebate_rate ?? null,
        current_tier: first?.current_tier ?? null,
      };
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e.response?.status === 404) {
          return null;
        }
      }
      console.error(`Fuul SDK: Could not get affiliate referral`, e);
      throw e;
    }
  }
}
