import { AxiosError } from 'axios';

import { ValidationError } from '../affiliates/errors';
import { HttpClient } from '../HttpClient';
import {
  DeleteReferralParams,
  GenerateReferralCodesParams,
  GenerateReferralCodesResponse,
  GetReferralCodeParams,
  GetReferralCodeResponse,
  GetReferralStatusParams,
  GetReferralStatusResponse,
  ListUserReferralCodesParams,
  ListUserReferralCodesResponse,
  UpdateReferralCodeParams,
  UseReferralCodeParams,
} from '../types/api';

export type ReferralCodeServiceSettings = {
  httpClient: HttpClient;
  debug?: boolean;
};

export class ReferralCodeService {
  private readonly httpClient: HttpClient;
  private readonly _debug: boolean | undefined;

  constructor(settings: ReferralCodeServiceSettings) {
    this.httpClient = settings.httpClient;
    this._debug = settings.debug;
  }

  public async listUserReferralCodes(params: ListUserReferralCodesParams): Promise<ListUserReferralCodesResponse> {
    try {
      const response = await this.httpClient.get<ListUserReferralCodesResponse>({
        path: `/referral_codes`,
        queryParams: {
          user_identifier: params.user_identifier,
          user_identifier_type: params.user_identifier_type,
          page: params.page,
          page_size: params.page_size,
        },
      });
      return response.data;
    } catch (e) {
      this.handleError(e);
    }
  }

  public async generateReferralCodes(params: GenerateReferralCodesParams): Promise<GenerateReferralCodesResponse[]> {
    try {
      const response = await this.httpClient.post<GenerateReferralCodesResponse[]>({
        path: `/referral_codes`,
        queryParams: {
          user_identifier: params.user_identifier,
          user_identifier_type: params.user_identifier_type,
          quantity: params.quantity,
          max_uses: params.max_uses,
        },
      });

      return response.data;
    } catch (e) {
      this.handleError(e);
    }
  }

  public async getReferralStatus(params: GetReferralStatusParams): Promise<GetReferralStatusResponse> {
    try {
      const response = await this.httpClient.get<GetReferralStatusResponse>({
        path: `/referral_codes/status`,
        queryParams: {
          user_identifier: params.user_identifier,
          user_identifier_type: params.user_identifier_type,
        },
      });

      return response.data;
    } catch (e) {
      this.handleError(e);
    }
  }

  public async getReferralCode(params: GetReferralCodeParams): Promise<GetReferralCodeResponse> {
    try {
      const response = await this.httpClient.get<GetReferralCodeResponse>({
        path: `/referral_codes/${params.code}`,
      });

      return response.data;
    } catch (e) {
      this.handleError(e);
    }
  }

  public async useReferralCode(params: UseReferralCodeParams): Promise<void> {
    const { code, user_identifier, user_identifier_type, signature, signature_message, chain_id } = params;

    try {
      await this.httpClient.patch<void>({
        path: `/referral_codes/${code}/use`,
        queryParams: {
          user_identifier,
          user_identifier_type,
        },
        postData: {
          signature,
          signature_message,
          chain_id,
        },
      });
    } catch (e) {
      this.handleError(e);
    }
  }

  public async updateReferralCode(params: UpdateReferralCodeParams): Promise<void> {
    try {
      await this.httpClient.patch<void>({
        path: `/referral_codes/${params.code}`,
        postData: {
          max_uses: params.max_uses,
        },
      });
    } catch (e) {
      this.handleError(e);
    }
  }

  public async deleteReferral(params: DeleteReferralParams): Promise<void> {
    const { code, user_identifier, user_identifier_type, referrer_identifier, referrer_identifier_type, signature, signature_message, chain_id } =
      params;

    try {
      await this.httpClient.delete<void>({
        path: `/referral_codes/${code}/referrals`,
        queryParams: {
          user_identifier,
          user_identifier_type,
          referrer_identifier,
          referrer_identifier_type,
        },
        postData: {
          signature,
          signature_message,
          chain_id,
        },
      });
    } catch (e) {
      this.handleError(e);
    }
  }

  private handleError(e: unknown): never {
    if (e instanceof AxiosError) {
      const data = e.response?.data;
      if (typeof data?.message === 'string') {
        throw new Error(data.message);
      } else if (data?.message instanceof Array) {
        throw new ValidationError(data.message);
      }
    }
    throw e;
  }
}
