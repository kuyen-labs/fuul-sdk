import { UserIdentifierType } from '../../types/user';

export interface GetClaimableChecksParams {
  user_identifier: string;
  user_identifier_type: UserIdentifierType;
}

export enum ClaimCheckStatus {
  Open = 'open',
  Unclaimed = 'unclaimed',
  Claimed = 'claimed',
}

export interface ClaimCheckItem {
  id: string;
  currency_address: string;
  currency_chain_id: string;
  currency_name: string;
  currency_decimals: number;
  reason: string;
  amount: string;
  status: string;
  deadline_seconds: number;
  created_at: string;
}

export interface GetClaimChecksParams {
  user_identifier: string;
  user_identifier_type: UserIdentifierType;
  status?: ClaimCheckStatus;
}

export interface GetClaimChecksResponse {
  claim_checks: ClaimCheckItem[];
}

export interface CloseClaimChecksParams {
  user_identifier: string;
  user_identifier_type: UserIdentifierType;
  claim_check_ids: string[];
}

export type CloseClaimChecksResponse = ClaimResponse[];

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

export interface UserClaimHistoryCurrencyTotalItem {
  currency_address: string;
  currency_chain_id: string;
  currency_name: string;
  currency_decimals: number;

  /**
   * Raw integer amount. Divide by 10 ** currency_decimals before display.
   */
  amount: string;
}

export interface UserClaimHistoryTransactionItem {
  hash: string;
  chain_id: string;

  /**
   * ISO 8601 UTC date-time string.
   */
  claimed_at: string;

  totals: UserClaimHistoryCurrencyTotalItem[];
}

export interface GetClaimHistoryParams {
  user_identifier: string;
  user_identifier_type: UserIdentifierType;

  /**
   * 1-indexed page number. Server default: 1.
   */
  page?: number;

  /**
   * Items per page (1-100). Server default: 25.
   */
  page_size?: number;
}

export interface GetClaimHistoryResponse {
  results: UserClaimHistoryTransactionItem[];
  total_count: number;
  next_page: number | null;
}
