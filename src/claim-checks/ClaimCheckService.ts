import { HttpClient } from '../HttpClient';
import { GetClaimableChecksParams, GetClaimableChecksResponse, GetClaimCheckTotalsParams, GetClaimCheckTotalsResponse } from './types';

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
