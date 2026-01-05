import { UserIdentifierType } from '../../types/user';

/**
 * Parameters for getting claimable claim checks
 */
export interface GetClaimableChecksParams {
  /**
   * User's blockchain address or email
   */
  user_identifier: string;

  /**
   * Type of user identifier (EVM address, Solana address, etc.)
   */
  user_identifier_type: UserIdentifierType;
}

/**
 * Reason for a claim check payout
 */
export enum ClaimCheckReason {
  AffiliatePayout = 0,
  EndUserPayout = 1,
}

/**
 * Individual claimable claim check response
 */
export interface ClaimResponse {
  /**
   * Smart contract address from the project
   */
  project_address: string;

  /**
   * User's identifier (normalized/lowercased)
   */
  to: string;

  /**
   * Token contract address or identifier
   */
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

  /**
   * Proof hash for on-chain verification
   */
  proof: string;

  /**
   * Cryptographic signatures for claim verification
   */
  signatures: string[];
}

/**
 * Response containing array of claimable claim checks
 */
export type GetClaimableChecksResponse = ClaimResponse[];

/**
 * Parameters for getting claim check totals
 */
export interface GetClaimCheckTotalsParams {
  /**
   * User's blockchain address or email
   */
  user_identifier: string;

  /**
   * Type of user identifier (EVM address, Solana address, etc.)
   */
  user_identifier_type: UserIdentifierType;
}

/**
 * Aggregated total for a specific currency
 */
export interface ClaimCheckTotalItem {
  /**
   * Token contract address or identifier
   */
  currency_address: string;

  /**
   * Blockchain network identifier
   */
  currency_chain_id: string;

  /**
   * Token symbol or name
   */
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

/**
 * Response containing claim check totals grouped by status
 */
export interface GetClaimCheckTotalsResponse {
  /**
   * Array of claimed totals by currency
   */
  claimed: ClaimCheckTotalItem[];

  /**
   * Array of unclaimed totals by currency
   */
  unclaimed: ClaimCheckTotalItem[];
}
