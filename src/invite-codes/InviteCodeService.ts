import { HttpClient } from '../HttpClient';
import {
  CheckInviteCodeParams,
  CheckInviteCodeResponse,
  GenerateInviteCodesParams,
  GenerateInviteCodesResponse,
  GetInvitationStatusParams,
  GetInvitationStatusResponse,
  ListUserInviteCodesParams,
  ListUserInviteCodesResponse,
  UseInviteCodeParams,
} from '../types/api';

export type InviteCodeServiceSettings = {
  httpClient: HttpClient;
  debug?: boolean;
};

export class InviteCodeService {
  private readonly httpClient: HttpClient;
  private readonly _debug: boolean | undefined;

  constructor(settings: InviteCodeServiceSettings) {
    this.httpClient = settings.httpClient;
    this._debug = settings.debug;
  }

  public async listUserInviteCodes(params: ListUserInviteCodesParams): Promise<ListUserInviteCodesResponse> {
    const response = await this.httpClient.get<ListUserInviteCodesResponse>({
      path: `/invite_codes`,
      queryParams: {
        user_identifier: params.user_identifier,
        user_identifier_type: params.user_identifier_type,
        page: params.page,
        page_size: params.page_size,
      },
    });
    return response.data;
  }

  public async generateInviteCodes(params: GenerateInviteCodesParams): Promise<GenerateInviteCodesResponse[]> {
    const response = await this.httpClient.post<GenerateInviteCodesResponse[]>({
      path: `/invite_codes`,
      queryParams: {
        user_identifier: params.user_identifier,
        user_identifier_type: params.user_identifier_type,
      },
    });
    return response.data;
  }

  public async getInvitationStatus(params: GetInvitationStatusParams): Promise<GetInvitationStatusResponse> {
    const response = await this.httpClient.get<GetInvitationStatusResponse>({
      path: `/invite_codes/status`,
      queryParams: {
        user_identifier: params.user_identifier,
        user_identifier_type: params.user_identifier_type,
      },
    });
    return response.data;
  }

  public async checkInviteCode(params: CheckInviteCodeParams): Promise<CheckInviteCodeResponse> {
    const response = await this.httpClient.get<CheckInviteCodeResponse>({
      path: `/invite_codes/check`,
      queryParams: {
        code: params.code,
      },
    });
    return response.data;
  }

  public async useInviteCode(params: UseInviteCodeParams): Promise<void> {
    const { code, user_identifier, user_identifier_type, signature, signature_message } = params;
    await this.httpClient.patch<void>({
      path: `/invite_codes/use`,
      queryParams: {
        code,
        user_identifier,
        user_identifier_type,
      },
      postData: {
        signature,
        signature_message,
      },
    });
  }
}
