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

Get aggregated totals of claimed and unclaimed claim checks for a user, grouped by currency.

```tsx
import { Fuul, UserIdentifierType } from '@fuul/sdk';

const totals = await Fuul.getClaimCheckTotals({
  user_identifier: '0xe06099DbbF626892397f9A74C7f42F16748292Db',
  user_identifier_type: UserIdentifierType.EvmAddress
});

// Display claimed totals
console.log('Claimed:');
totals.claimed.forEach(item => {
  console.log(`  ${item.currency_name}: ${item.amount} (${item.currency_address})`);
});

// Display unclaimed totals
console.log('Unclaimed:');
totals.unclaimed.forEach(item => {
  console.log(`  ${item.currency_name}: ${item.amount} (${item.currency_address})`);
});
```

This endpoint includes both expired and non-expired claims, providing a complete view of all historical and current claim checks.
