# Getting started with Fuul SDK

## Installation & minimum set up

### 1. Installation

Run one of the following commands to add Fuul SDK to your project:

Npm:

```bash
npm install @fuul/sdk
```

Yarn:

```bash
yarn add @fuul/sdk
```

### 2. Set up

Before using the SDK you must initialize it by supplying your Fuul issued API key.

NOTE: Be sure to do this at the root of your app so you have the SDK ready for use just by importing it at the usage point.

```tsx
import { Fuul } from ('@fuul/sdk');

Fuul.init({ apiKey: "your-fuul-api-key" });
```

Now you can start sending events.

### 3. Sending events

For Fuul to attribute conversion events you'll need to report the following tracking events

#### Page view event

Projects must send this event every time a user visits a page on their website.

```tsx
import { Fuul } from ('@fuul/sdk');

await Fuul.sendPageview();
```

#### Identify user

Projects must send this event every time users connect a wallet to their website.

```tsx
import { Fuul } from ('@fuul/sdk');

await Fuul.identifyUser({
  userIdentifier: "0xe06099DbbF626892397f9A74C7f42F16748292Db",
  identifierType: UserIdentifierType.EvmAddress,
  signature: "0xb823038d78e541470946e5125b74878c226a84f891671946f18fbe7e5995171731b92f569c3e83f1c9fb89c5351245494c5d2ce6273f74c853a2cace6073f09c1c",
  message: "Connect wallet"
});
```

NOTE: Make sure to send the event when connecting a wallet for the first time as well as when changing wallets during the session.

## Payouts

### List Referral Earnings

Cursor-paginated breakdown of a referrer's book, one row per **referred user**.

`user_identifier` is the *referrer*. Each row is a user they referred directly (level 1): `volume`,
`direct_eligible_volume` and `indirect_eligible_volume` describe that referred user's activity, while
`earnings` and `total_commission_earned` are what the referrer earned from it.

```tsx
import { Fuul, UserIdentifierType } from '@fuul/sdk';

const page = await Fuul.listReferralEarnings({
  user_identifier: '0xe06099DbbF626892397f9A74C7f42F16748292Db',
  user_identifier_type: UserIdentifierType.EvmAddress,
  referrer_scope: 'all', // 'active' (default) skips referred users with no activity
  limit: 1000,           // 1-1000, defaults to 500
});

console.log(page.results); // rows for this page
console.log(page.count);   // rows in THIS page - not a grand total
console.log(page.next_cursor);
```

Optionally pass `from_date` and `to_date` (ISO 8601, inclusive) to limit the amounts to a window.
They must be sent **as a pair** — sending only one returns a 400. `date_joined` is always all-time.

#### Walking every page

Pass the previous page's `next_cursor` back as `after`, and stop when it comes back `null`. Cursors
are opaque: forward them verbatim, don't parse or build them.

```tsx
const rows = [];
let cursor = null;

do {
  const page = await Fuul.listReferralEarnings({
    user_identifier: '0xe06099DbbF626892397f9A74C7f42F16748292Db',
    user_identifier_type: UserIdentifierType.EvmAddress,
    limit: 1000,
    ...(cursor ? { after: cursor } : {}),
  });

  rows.push(...page.results);
  cursor = page.next_cursor;
} while (cursor);
```

NOTE: `next_cursor` is the only terminator. The server returns a cursor whenever a page is *full*, so
the last page carrying rows can still come with one — the final request may return an empty `results`.
Never stop just because a page came back shorter than `limit`.

This replaces `getPayoutsByReferrer`, which is deprecated: it returns the entire referred-user list in
a single response and fails for referrers with a large book.

## Claim Checks

The SDK provides methods to retrieve claim checks for users - these are claimable rewards that users can redeem on-chain.

### Get Claimable Checks

Retrieve all claimable claim checks for a user. This returns only unclaimed checks with valid (non-expired) deadlines.

```tsx
import { Fuul, UserIdentifierType } from '@fuul/sdk';

const claimableChecks = await Fuul.getClaimableChecks({
  user_identifier: '0xe06099DbbF626892397f9A74C7f42F16748292Db',
  user_identifier_type: UserIdentifierType.EvmAddress
});

// Process each claimable check
claimableChecks.forEach(check => {
  console.log(`Amount: ${check.amount}`);
  console.log(`Currency: ${check.currency}`);
  console.log(`Deadline: ${new Date(check.deadline * 1000).toISOString()}`);
  console.log(`Proof: ${check.proof}`);
  console.log(`Signatures:`, check.signatures);
});
```

The response includes all the data needed for on-chain claim verification including cryptographic proofs and signatures.

### Get Claim Check Totals

Get aggregated totals of claim checks for a user, one row per currency per state.

Every row carries a `status` label. The `unclaimed` array is the **umbrella** for two states: `'open'` (still accumulating rewards — must be closed before it can be claimed) and `'closed'` (ready to claim on-chain right now). A "ready to claim" figure must only sum rows with `status: 'closed'`. Note: other endpoints (e.g. `getClaimChecks`) use the stored status value `unclaimed` to mean what this endpoint labels `closed`.

```tsx
import { ClaimCheckTotalsStatusFilter, Fuul, UserIdentifierType } from '@fuul/sdk';

const totals = await Fuul.getClaimCheckTotals({
  user_identifier: '0xe06099DbbF626892397f9A74C7f42F16748292Db',
  user_identifier_type: UserIdentifierType.EvmAddress
});

// Display claimed totals
console.log('Claimed:');
totals.claimed.forEach(item => {
  console.log(`  ${item.currency_name}: ${item.amount} (${item.currency_address})`);
});

// Display unclaimed totals, split by state
console.log('Ready to claim:');
totals.unclaimed
  .filter(item => item.status === 'closed')
  .forEach(item => {
    console.log(`  ${item.currency_name}: ${item.amount} (${item.currency_address})`);
  });

console.log('Still accumulating:');
totals.unclaimed
  .filter(item => item.status === 'open')
  .forEach(item => {
    console.log(`  ${item.currency_name}: ${item.amount} (${item.currency_address})`);
  });
```

An optional `status` filter of type `ClaimCheckTotalsStatusFilter` limits the response to a single state — for example `status: ClaimCheckTotalsStatusFilter.Closed` returns only the ready-to-claim rows. `ClaimCheckTotalsStatusFilter.Unclaimed` filters to the umbrella (both `open` and `closed` rows). The enum members map to the wire values `'claimed' | 'unclaimed' | 'open' | 'closed'`; invalid values return a `400` listing the valid ones.

An optional `reason` filter of type `ClaimCheckTotalsReasonFilter` narrows which rows are summed by earning type: `AffiliatePayout` is commission earned for referring others, `EndUserPayout` is the rebate a user earned on their own activity, `AgencyPayout` is an agency's share. When omitted, all earning types are merged into one figure per currency and state.

The filter does not change the response shape — rows carry no `reason` field — so showing commission and rebates as separate figures means calling twice:

```tsx
import { ClaimCheckTotalsReasonFilter, Fuul, UserIdentifierType } from '@fuul/sdk';

const ids = {
  user_identifier: '0xe06099DbbF626892397f9A74C7f42F16748292Db',
  user_identifier_type: UserIdentifierType.EvmAddress
};

const commission = await Fuul.getClaimCheckTotals({ ...ids, reason: ClaimCheckTotalsReasonFilter.AffiliatePayout });
const rebates = await Fuul.getClaimCheckTotals({ ...ids, reason: ClaimCheckTotalsReasonFilter.EndUserPayout });
```

`reason` combines with `status` — pass both to get, for example, only the ready-to-claim rebate rows.

Expired checks are excluded from `open` and `closed` rows, so `closed` sums are always claimable right now. Claimed totals are the user's claim history.
