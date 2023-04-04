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

In order to authenticate to Fuul with your project, you must execute the following in the root file of your app.

```tsx
// App.tsx

// Settings config object
const settings = {
  projectId: "myprojectid", // Replace with your Fuul Project Id.
};

const fuul = new Fuul(settings);
```

This way you’ll be able to use Fuul as a global object in any of your files, so you don’t have to create a new instance every time.

- Please note that `projectId` is not required when you initialize Fuul SDK, but it is mandatory in order to send a `“connect_wallet”` event. But don’t worry, you can send it later as an argument using the `Fuul.sendEvent()` method if needed (please refer to section 3 of this guide)

## 3. Verifying the connection to Fuul SDK

You can verify that everything was set up successfully with the following method

```tsx
Fuul.verifyConnection()
```

If everything is ok, you will see a prompt as below:

![Untitled](Getting%20started%20with%20Fuul%20SDK%205855c088f6d14fcf9dca9d3a13e9bd86/Untitled.png)

## 4. Sending events

In order to send events such as `pageview` or `connect_wallet` you must do the following

```tsx
// Sending a pageview event does not need any parameters, just the event name
const handlePageView = async () => {
	await Fuul.sendEvent("pageview");
}

// You can also send additional event arguments as follows:
const handlePageView = async () => {
	await Fuul.sendEvent("pageview", {
		foo,
		bar,
		...myWonderfulArguments
	});
}

// For connect_wallet events, you must send the address that is being connected as an argument
const handlePageView = async () => {
	await Fuul.sendEvent("connect_wallet", {
		address: "0x3Ec0590BC79c74B0145f94C0bE1C5d63E491569f"
		});
}

// Sending projectId as an event argument (please note that you must send it as project_id)
const handlePageView = async () => {
	await Fuul.sendEvent("pageview", {
		project_id: "my-wonderful-project-id"
	});
}
```

## 5. Generating tracking links

You can also generate the tracking link for a given wallet `address` and `campaign id`

```tsx
// Let's assume you are testing in localhost:3000

const myWonderfulReferrerAddress: string = "0xE8BF39dCd16CF20d39006ba3C722A02e701bf0eE"
const campaignId: string = "79e72760-c730-4422-9e7b-3b730e8800dc"

const myTrackingId: string = Fuul.generateTrackingLink(myWonderfulReferrerAddress, campaignId);

console.log(myTrackingId) // http://localhost:3000?c=79e72760-c730-4422-9e7b-3b730e8800dc&origin=fuul&r=0xE8BF39dCd16CF20d39006ba3C722A02e701bf0eE 
```
