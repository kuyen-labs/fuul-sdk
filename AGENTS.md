# AGENTS.md — fuul-sdk

Tool-agnostic conventions for AI coding assistants (Claude Code, Cursor, Copilot, etc.).

## Overview

Browser-only SDK for the Fuul affiliate/referral tracking protocol. Requires browser context (`window`, `document`, `localStorage`) — will not work in Node.js.

## Commands

| Task | Command |
|------|---------|
| Build | `npm run build` |
| Test | `npm run test` |
| Test (single file) | `npx jest src/EventService.test.ts` |
| Lint | `npm run lint` |
| Lint fix | `npm run lint:fix` |
| Format | `npm run format` |

## Architecture

- **Language**: TypeScript 4.7
- **Build**: Vite + vite-plugin-dts (outputs UMD, ESM, and .d.ts)
- **Testing**: Jest 29 with jsdom + jest-localstorage-mock
- **Publishing**: semantic-release (automated)

### Singleton Pattern
Module-level state variables in `src/core.ts`. `Fuul.init({ apiKey })` must be called before any method. Three guards enforce this: `assertInitialized()`, `assertBrowserContext()`, `detectAutomation()`.

### Service Architecture
Each feature has a dedicated service class: EventService, AffiliateService, ReferralCodeService, PayoutService, LeaderboardService, ClaimCheckService, AffiliatePortalService, UserService, AudienceService, ConversionService.

All services take `{ httpClient: HttpClient, debug?: boolean }` in constructor.

## Patterns

### Event Deduplication
EventService uses localStorage (`SENT_EVENT_ID_KEY`) with 60-second validity period to prevent duplicate events.

### Multi-Project Support
Events can be sent to multiple projects: `sendEvent(event, ['projectId1', 'projectId2'])` — sends one HTTP call per project.

### Signature Verification
Affiliate operations require EIP-191 signatures. Smart contract signatures supported via EIP-1271 with `accountChainId` parameter.

## Testing

- Colocated test files: `src/EventService.test.ts`, `src/core.test.ts`, `src/tracking.test.ts`
- Mock the HttpClient, instantiate the service, test behavior
- Use `jest-localstorage-mock` — clear localStorage in `beforeEach`/`afterEach`

## Anti-Patterns

- Don't use the SDK server-side — no window/document/localStorage in Node.js
- Don't call methods before `init()` — will throw
- Don't create multiple SDK instances — it's a singleton with module-level state
- Don't modify module-level state variables directly
- Don't skip `assertBrowserContext()` guard in new public methods
