# Getting started with Fuul SDK

**Setting up the Fuul SDK**

## 1. Install the Fuul SDK

Run one of the following commands to add Fuul SDK to your project:

### npm

```bash
npm install @fuul/sdk
```

### yarn

```bash
yarn add @fuul/sdk
```

## 2. Set up the Fuul SDK

In order to authenticate to full with your project, you must execute the following in the root file of your app.

```
// App.tsx

// Settings config object
const settings = {
  apiKey: "your-fuul-api-key" 
};

const fuul = new Fuul(settings);
```

Now you’ll be able to use Fuul as a global object in any of your files, so you don’t have to create a new instance every time.

## 3. Test your integration

Test your integration with the following method:

```
function main() {
  fuul.verifyConnection();
}
main();
```

## 4. Sending events

For Fuul to attribute conversion events to your visitors, you'll need to report the connect_wallet event. 

### Connect wallet event
Projects must send this event every time users connect a wallet to their website (both when connecting a wallet for the first time and when changing wallets during the session).
For this type of event, projects must send the user address that is being connected to the website as an argument.

```
await Fuul.sendEvent("connect_wallet", {
    address: <address>,
    signing_message: <message>,
    signature: <signature>
});
```

### Sending custom events (optional)
Apart from the necessary `connect wallet` event, we allow projects to send any custom event to track as pleased.

```
await fuul.sendEvent("myCustomEvent", {
	foo,
	bar,
	...myWonderfulArguments
});
```

## 5. Generating tracking links

You can also generate the tracking link for a given wallet `address` and `project id`

```tsx
// Let's assume you are testing in localhost:3000

const myWonderfulReferrerAddress: string = "0xE8BF39dCd16CF20d39006ba3C722A02e701bf0eE"
const projectId: string = "79e72760-c730-4422-9e7b-3b730e8800dc"

const myTrackingId: string = Fuul.generateTrackingLink(myWonderfulReferrerAddress, projectId);

console.log(myTrackingId) // http://localhost:3000?p=79e72760-c730-4422-9e7b-3b730e8800dc&origin=fuul&r=0xE8BF39dCd16CF20d39006ba3C722A02e701bf0eE 
```
