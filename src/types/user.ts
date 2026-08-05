export enum UserIdentifierType {
  EvmAddress = 'evm_address',
  SolanaAddress = 'solana_address',
  XRPLAddress = 'xrpl_address',
  SuiAddress = 'sui_address',
  StellarAddress = 'stellar_address',
  /**
   * Stellar contract (Soroban SAC / SEP-41) address — a `C…` StrKey.
   *
   * Note: the API scopes this type to currencies. User-identifier endpoints
   * validate against wallet/opaque types and will reject it.
   */
  StellarContract = 'stellar_contract',
  Email = 'email',
}
