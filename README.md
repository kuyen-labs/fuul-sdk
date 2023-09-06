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

For Fuul to attribute conversion events you'll need to report the "pageview" and "connect wallet" events.


#### Page view event

Projects must send this event every time a user visits a page on their website.

```tsx
import { Fuul } from ('@fuul/sdk');

await fuul.sendPageView();
```


#### Connect wallet event

Projects must send this event every time users connect a wallet to their website. 

NOTE: Make sure to send the event when connecting a wallet for the first time as well as when changing wallets during the session.

```tsx
import { Fuul } from ('@fuul/sdk');

await fuul.sendConnectWallet({ userAddress: '0x01' });
```
