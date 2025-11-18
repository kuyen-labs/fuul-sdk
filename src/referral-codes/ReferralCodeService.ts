import { HttpClient } from '../HttpClient';
import {
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
  }

  public async generateReferralCodes(params: GenerateReferralCodesParams): Promise<GenerateReferralCodesResponse[]> {
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
  }

  public async getReferralStatus(params: GetReferralStatusParams): Promise<GetReferralStatusResponse> {
    const response = await this.httpClient.get<GetReferralStatusResponse>({
      path: `/referral_codes/status`,
      queryParams: {
        user_identifier: params.user_identifier,
        user_identifier_type: params.user_identifier_type,
      },
    });

    return response.data;
  }

  public async getReferralCode(params: GetReferralCodeParams): Promise<GetReferralCodeResponse> {
    const response = await this.httpClient.get<GetReferralCodeResponse>({
      path: `/referral_codes/${params.code}`,
    });

    return response.data;
  }

  public async useReferralCode(params: UseReferralCodeParams): Promise<void> {
    const { code, user_identifier, user_identifier_type, signature, signature_message, chain_id } = params;

    await this.httpClient.patch<void>({
      path: `/referral_codes/${code}/use`,
      queryParams: {
        user_identifier,
        user_identifier_type,
        chain_id,
      },
      postData: {
        signature,
        signature_message,
      },
    });
  }

  public async updateReferralCode(params: UpdateReferralCodeParams): Promise<void> {
    await this.httpClient.patch<void>({
      path: `/referral_codes/${params.code}`,
      postData: {
        max_uses: params.max_uses,
      },
    });
  }
}
