import { UserIdentifierType } from '../../types/user';

export interface GetClaimableChecksParams {
  user_identifier: string;
  user_identifier_type: UserIdentifierType;
}

export enum ClaimCheckReason {
  AffiliatePayout = 0,
  EndUserPayout = 1,
}

export interface ClaimResponse {
  project_address: string;

  /**
   * User's identifier (normalized/lowercased)
   */
  to: string;

  currency: string;

  /**
   * Currency type (always 1 for ERC20-type tokens)
   */
  currency_type: number;

  /**
   * Token amount as string (with decimals)
   */
  amount: string;

  /**
   * Reason for the payout (0 = AffiliatePayout, 1 = EndUserPayout)
   */
  reason: ClaimCheckReason;

  /**
   * Token ID (always "0" for fungible tokens)
   */
  token_id: string;

  /**
   * Claim deadline as Unix timestamp in seconds
   */
  deadline: number;

  proof: string;
  signatures: string[];
}

export type GetClaimableChecksResponse = ClaimResponse[];

export interface GetClaimCheckTotalsParams {
  user_identifier: string;
  user_identifier_type: UserIdentifierType;
}

export interface ClaimCheckTotalItem {
  currency_address: string;
  currency_chain_id: string;
  currency_name: string;

  /**
   * Number of decimal places for the token
   */
  currency_decimals: number;

  /**
   * Total amount as string (summed across all claim checks)
   */
  amount: string;
}

export interface GetClaimCheckTotalsResponse {
  claimed: ClaimCheckTotalItem[];
  unclaimed: ClaimCheckTotalItem[];
}
