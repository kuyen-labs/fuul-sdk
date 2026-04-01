import { HttpClient } from '../HttpClient';
import {
  CloseClaimChecksParams,
  CloseClaimChecksResponse,
  GetClaimableChecksParams,
  GetClaimableChecksResponse,
  GetClaimChecksParams,
  GetClaimChecksResponse,
  GetClaimCheckTotalsParams,
  GetClaimCheckTotalsResponse,
} from './types';

export type ClaimCheckServiceSettings = {
  httpClient: HttpClient;
  debug?: boolean;
};

const basePath = '/claim-checks';

/**
 * Service for managing claim checks
 */
export class ClaimCheckService {
  private readonly httpClient: HttpClient;
  private readonly _debug: boolean | undefined;

  constructor(settings: ClaimCheckServiceSettings) {
    this.httpClient = settings.httpClient;
    this._debug = settings.debug;
  }

  /**
   * Retrieves claim checks for a user with optional status filtering
   *
   * @param {GetClaimChecksParams} params - User identifier and optional status filter
   * @returns {Promise<GetClaimChecksResponse>} List of claim checks
   */
  public async getClaimChecks(params: GetClaimChecksParams): Promise<GetClaimChecksResponse> {
    const queryParams: Record<string, string> = {
      user_identifier: params.user_identifier,
      user_identifier_type: params.user_identifier_type,
    };

    if (params.status) {
      queryParams.status = params.status;
    }

    const response = await this.httpClient.get<GetClaimChecksResponse>({
      path: basePath,
      queryParams,
    });
    return response.data;
  }

  /**
   * Closes open claim checks, aggregating and signing them for on-chain claiming
   *
   * @param {CloseClaimChecksParams} params - User identifier and claim check IDs to close
   * @returns {Promise<CloseClaimChecksResponse>} Array of signed claim responses ready for on-chain execution
   */
  public async closeClaimChecks(params: CloseClaimChecksParams): Promise<CloseClaimChecksResponse> {
    const response = await this.httpClient.post<CloseClaimChecksResponse>({
      path: `${basePath}/close`,
      postData: {
        userIdentifier: params.user_identifier,
        userIdentifierType: params.user_identifier_type,
        claim_check_ids: params.claim_check_ids,
      },
    });
    return response.data;
  }

  /**
   * Retrieves all claimable claim checks for a user
   * Returns only unclaimed checks with valid (non-expired) deadlines
   *
   * @param {GetClaimableChecksParams} params - User identifier parameters
   * @returns {Promise<GetClaimableChecksResponse>} Array of claimable claim checks
   */
  public async getClaimableChecks(params: GetClaimableChecksParams): Promise<GetClaimableChecksResponse> {
    const response = await this.httpClient.post<GetClaimableChecksResponse>({
      path: `${basePath}/claim`,
      postData: {
        userIdentifier: params.user_identifier,
        userIdentifierType: params.user_identifier_type,
      },
    });
    return response.data;
  }

  /**
   * Gets aggregated totals of claimed and unclaimed claim checks for a user
   * Includes both expired and non-expired claims, grouped by currency
   *
   * @param {GetClaimCheckTotalsParams} params - User identifier parameters
   * @returns {Promise<GetClaimCheckTotalsResponse>} Totals grouped by status and currency
   */
  public async getClaimCheckTotals(params: GetClaimCheckTotalsParams): Promise<GetClaimCheckTotalsResponse> {
    const response = await this.httpClient.get<GetClaimCheckTotalsResponse>({
      path: `${basePath}/totals`,
      queryParams: {
        user_identifier: params.user_identifier,
        user_identifier_type: params.user_identifier_type,
      },
    });
    return response.data;
  }
}
