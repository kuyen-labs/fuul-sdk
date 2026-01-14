# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run build        # Compile TypeScript and bundle with Vite (tsc && vite build)
npm run test         # Run tests with coverage
npm run test:ci      # Run tests in CI mode
npm run lint         # Lint source files
npm run lint:fix     # Auto-fix lint issues
npm run format       # Format code with Prettier
```

To run a single test file:
```bash
npx jest src/EventService.test.ts
```

## Architecture

This is a browser-only SDK for the Fuul affiliate/referral tracking protocol. It requires browser context (`window`, `document`, `localStorage`) and will not work in Node.js server environments.

### Core Structure

- **`src/core.ts`** - Main SDK singleton with all public methods (~30 exported functions). Uses module-level state variables for initialization.
- **`src/HttpClient.ts`** - Axios wrapper that handles authentication (Bearer token), SDK versioning headers, and default query params.
- **`src/index.ts`** - Public exports (types and `Fuul` object).

### Service Architecture

Each feature area has a dedicated service class in its own directory:

| Service | Directory | Purpose |
|---------|-----------|---------|
| EventService | `src/` | Pageviews, custom events, wallet identification with 60s deduplication |
| AffiliateService | `src/affiliates/` | Create/update affiliate codes, signature validation |
| ReferralCodeService | `src/referral-codes/` | Generate/use/manage referral codes |
| PayoutService | `src/payouts/` | Payout queries, volume leaderboard, movements |
| LeaderboardService | `src/leaderboard/` | Points/payouts/referred users leaderboards |
| ClaimCheckService | `src/claim-checks/` | On-chain claimable rewards with Merkle proofs |
| AffiliatePortalService | `src/affiliate-portal/` | Affiliate statistics and new traders |
| UserService | `src/user/` | User referrer information |
| AudienceService | `src/audiences/` | User audience segmentation |

All services follow the same pattern:
```typescript
constructor(settings: { httpClient: HttpClient; debug?: boolean })
```

### Multi-Chain Support

The SDK supports multiple blockchain identifiers via `UserIdentifierType` enum:
- `evm_address` - Ethereum/EVM chains
- `solana_address`
- `xrpl_address`
- `sui_address`
- `email`

### Signature Verification

Operations like creating affiliate codes or using referral codes require message signatures:
- Standard EIP-191 signatures
- EIP-1271 smart contract signatures (using `accountChainId` parameter)

### Key Types

Type definitions are in `src/types/`:
- `api.ts` - API request/response interfaces
- `sdk.ts` - SDK configuration and method params
- `user.ts` - UserIdentifierType enum

### Custom Errors

`src/affiliates/errors.ts` defines: `ValidationError`, `AddressInUseError`, `CodeInUseError`, `InvalidSignatureError`

## Output

Build produces dual module formats:
- `dist/index.umd.js` - UMD/CommonJS
- `dist/index.mjs` - ES modules
- `dist/index.d.ts` - TypeScript declarations
