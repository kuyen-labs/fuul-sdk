# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Browser-only SDK for the Fuul affiliate/referral tracking protocol. Requires browser context (`window`, `document`, `localStorage`) — will not work in Node.js server environments.

## Validation Loop

```bash
# Level 1 — lint + format
npm run lint && npm run format

# Level 2 — tests
npm run test

# Level 3 — build (dual format output)
npm run build
```

Other commands:
```bash
npm run lint:fix     # Auto-fix lint issues
npm run test:ci      # Run tests in CI mode (no watch)
npx jest src/EventService.test.ts  # Single test file
```

## Quick Start (Initialization)

The SDK uses a singleton pattern with module-level state. `init()` must be called before any other method.

```typescript
import Fuul from '@fuul/sdk';

Fuul.init({
  apiKey: 'your-api-key',
  debug: true,                        // optional — enables console.debug logs
  baseApiUrl: 'https://...',          // optional — default: https://api.fuul.xyz/api/v1/
  defaultQueryParams: { project_id: '...' },  // optional — appended to every request
});

// Tracking methods require browser context
await Fuul.sendPageview();
await Fuul.identifyUser({ identifier: '0x...', identifierType: UserIdentifierType.EvmAddress, ... });
await Fuul.sendEvent('my_event', { value: 10 });
```

Guards applied on every tracking method call:
- `assertInitialized()` — throws if `init()` has not been called
- `assertBrowserContext()` — throws if `window` or `document` is undefined
- `detectAutomation()` — throws if `navigator.webdriver` is set (bot detection)

## Architecture

### Core Structure

- **`src/core.ts`** — Main SDK singleton (~30 exported functions). Module-level `let` variables hold all service instances. `init()` populates them; guards protect against premature use.
- **`src/HttpClient.ts`** — Axios wrapper handling Bearer token auth, SDK version headers, and default query params.
- **`src/tracking.ts`** — Browser utilities: `getTrackingId()` (nanoid, persisted in localStorage), `getAffiliateId()` (`?af=` / `?referrer=` query params), `getReferrerUrl()`, traffic source/category/title/tag helpers.
- **`src/index.ts`** — Public exports: types + `Fuul` default object.

### Service Architecture

Each feature area is a dedicated service class:

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
| ConversionService | `src/` | Conversion queries |

All services share the same constructor signature:
```typescript
constructor(settings: { httpClient: HttpClient; debug?: boolean })
```

### Multi-Chain Support

`UserIdentifierType` enum values: `evm_address`, `solana_address`, `xrpl_address`, `sui_address`, `stellar_address`, `stellar_contract`, `email`.

`stellar_contract` (Soroban SAC / SEP-41 `C…` StrKey) is scoped to currencies on the API side — user-identifier endpoints validate against wallet/opaque types and reject it. It is exported for completeness with the backend enum, not as a valid user identifier.

### Signature Verification

Affiliate code creation and referral code usage require message signatures:
- EIP-191 standard signatures (EVM)
- EIP-1271 smart contract signatures (EVM, requires `accountChainId` parameter)

Non-EVM identifiers authenticate with their chain's native scheme (e.g. Stellar `G…` addresses sign with ed25519 — a StrKey-encoded ed25519 public key — and take no `accountChainId`). The SDK is a pure pass-through: it forwards `signature` / `signaturePublicKey` / `accountChainId` untouched and performs no scheme validation, so any scheme works at runtime.

### Key Types

- `src/types/api.ts` — API request/response interfaces
- `src/types/sdk.ts` — SDK configuration (`FuulSettings`) and method params
- `src/types/user.ts` — `UserIdentifierType` enum

### Custom Errors

`src/affiliates/errors.ts`: `ValidationError`, `AddressInUseError`, `CodeInUseError`, `InvalidSignatureError`

## Key Patterns

### Browser-Only Requirements

The SDK depends on browser globals at runtime:
- `localStorage` — tracking ID persistence (`fuul.tracking_id` key) and event deduplication
- `window.location` — query param extraction (`?af=`, `?source=`, `?category=`, etc.)
- `document.referrer` — referrer URL for pageview events
- `navigator.webdriver` — bot detection

Tests use `jest-localstorage-mock` to satisfy the localStorage dependency. Always `import 'jest-localstorage-mock'` at the top of test files that exercise localStorage-dependent code, and call `localStorage.clear()` in `beforeEach`/`afterEach`.

### Event Deduplication

`EventService` deduplicates events within a 60-second window using localStorage:
- Key per event name: `SENT_EVENT_ID_KEY + '_' + event.name`
- `SENT_EVENT_VALIDITY_PERIOD_SECONDS = 60` — events within this window are dropped
- Deduplication checks: same event name + same tracking_id + same user identifier + same page + same signature
- `connect_wallet` events are additionally stored in an audit list (key: `..._all`), capped at 10 entries FIFO

Multi-project support: when `projectIds` array is passed to `sendEvent()`, one HTTP request is fired per project ID.

### Testing Pattern

Test files are colocated with their source: `src/EventService.test.ts`, `src/core.test.ts`, `src/tracking.test.ts`.

Standard test structure:
```typescript
import 'jest-localstorage-mock';  // required for any localStorage usage

import { EventService } from './EventService';
import { HttpClient } from './HttpClient';

beforeEach(() => { localStorage.clear(); });
afterEach(() => { localStorage.clear(); });

describe('EventService', () => {
  it('posts event', async () => {
    const httpClientMock = {
      post: jest.fn().mockResolvedValue(null),
    };
    const es = new EventService({ httpClient: httpClientMock as unknown as HttpClient });

    await es.sendEvent({ name: 'my-event', args: {}, metadata: { tracking_id: '123' } });

    expect(httpClientMock.post).toHaveBeenCalledTimes(1);
  });
});
```

Test tooling: Jest + jsdom environment, `@golevelup/ts-jest` for deep mocking, `jest-localstorage-mock` for localStorage.

## Build & Publish

Built with Vite + `vite-plugin-dts`. Output:
- `dist/index.umd.js` — UMD/CommonJS
- `dist/index.mjs` — ES modules
- `dist/index.d.ts` — TypeScript declarations

Publishing is automated via `semantic-release` (`@semantic-release/exec`, `@semantic-release/git`, `@semantic-release/npm`). Commit message format drives version bumps — do not manually edit `package.json` version.

Git hooks via `husky`. Import ordering enforced by `eslint-plugin-simple-import-sort`.

## Anti-Patterns

- **Do not use server-side** — `window`, `document`, and `localStorage` do not exist in Node.js; the SDK will throw on any tracking method.
- **Do not call methods before `init()`** — all methods call `assertInitialized()` and throw if the singleton is not set up.
- **Do not create multiple SDK instances** — the module exports a singleton object; calling `init()` a second time is a no-op (guarded by `_initialized` flag).
- **Do not store the `httpClient` reference externally** — it is module-private state managed by `init()`.
- **Do not mutate module-level state variables directly** — `_debug`, `_initialized`, `_apiKey`, `_httpClient`, and service instances are managed exclusively by `init()`.
- **Do not bypass deduplication** — do not manually clear `SENT_EVENT_ID_KEY` entries in production code to force re-sends; the 60s window is intentional.

## Continuous Learning

After completing a non-trivial task, check:
1. Did I discover a pattern that should be documented? → Update Key Patterns
2. Did I make a mistake that others might repeat? → Add to Anti-Patterns
3. Did I find a gotcha that wasted time? → Add to this file
4. Should this fix be documented for future reference? → Create `docs/solutions/` entry
