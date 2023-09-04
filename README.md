# Getting started with Fuul SDK

## Installation

### 1. Install the Fuul SDK

Run one of the following commands to add Fuul SDK to your project:

Npm:

```bash
npm install @fuul/sdk
```

Yarn:

```bash
yarn add @fuul/sdk
```

### 2. Set up the Fuul SDK

In order to authenticate to Fuul with your project you must initialize the SDK with your API key:

```tsx
import Fuul from ('@fuul/sdk');

const fuul = new Fuul({
  apiKey: "your-fuul-api-key" 
});
```

Now you can start sending events.

### 3. Sending events

For Fuul to attribute conversion events to your visitors you'll need to report the "pageview" and "connect_wallet" events.


#### Page view event

Projects must send this event every time a user visits a page on their website.

```tsx
await fuul.sendPageViewEvent();
```


#### Connect wallet event

Projects must send this event every time users connect a wallet to their website (both when connecting a wallet for the first time and when changing wallets during the session).

```tsx
await fuul.sendConnectWalletEvent({ userAddress: '0x01' });
```

### Sending Custom Events

Beside the required `pageview` and `connect wallet` events, you can send any custom events you want to track.

```tsx
await fuul.sendEvent("my-custom-event", {
	arg1: 'arg1',
	arg2: 'arg2',
});
```

### 5. Generating Tracking Links

You can also generate the tracking link for a given wallet `address` and `project id`

```tsx
const landingUrl = 'https://www.mycoolproject.com/campaign'
const affiliateAddress = "0xE8BF39dCd16CF20d39006ba3C722A02e701bf0eE"
const projectId = "79e72760-c730-4422-9e7b-3b730e8800dc"

const myTrackingLink = fuul.generateTrackingLink(landingUrl, affiliateAddress, projectId);

console.log(myTrackingLink) 
// https://www.mycoolproject.com/campaign?p=79e72760-c730-4422-9e7b-3b730e8800dc&origin=fuul&r=0xE8BF39dCd16CF20d39006ba3C722A02e701bf0eE 
```
