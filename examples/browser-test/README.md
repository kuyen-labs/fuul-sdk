# Fuul SDK Browser Test

Minimal browser environment for testing the Fuul SDK.

## Purpose

This is a simple HTML page that loads the Fuul SDK in a browser context, allowing you to test SDK functionality interactively via the browser console or by writing custom scripts.

## Setup

1. **Build the SDK** (from repository root):
   ```bash
   npm run build
   ```

2. **Open the test page**:

   Option 1 - Direct file access:
   ```bash
   cd examples/browser-test
   open index.html
   ```

   Option 2 - Local HTTP server (recommended):
   ```bash
   cd examples/browser-test
   npx serve . -p 8080
   # Then visit http://localhost:8080
   ```

## Usage

Once the page is loaded:

1. Open your browser's developer console (F12 or Cmd+Option+I)
2. The SDK is available as `window.Fuul`
3. Call any SDK method from the console or add scripts to `test.js`

### Example Usage

```javascript
// Initialize the SDK
Fuul.init({ apiKey: 'your-api-key-here', debug: true });

// Send a pageview
Fuul.sendPageview();

// Send a custom event
Fuul.sendEvent('test_event', { key: 'value' });

// Identify a user
Fuul.identifyUser({
    identifier: '0x123...',
    identifierType: 'evm_address'
});
```

## Available SDK Methods

### Core Methods
- `Fuul.init({ apiKey, debug? })` - Initialize the SDK
- `Fuul.sendPageview(pageName?, projectIds?)` - Send pageview event
- `Fuul.sendEvent(name, args?)` - Send custom event
- `Fuul.identifyUser({ identifier, identifierType, signature?, message? })` - Identify user

### Affiliate Methods
- `Fuul.generateTrackingLink(params)` - Generate tracking link
- `Fuul.createAffiliateCode(params)` - Create affiliate code
- `Fuul.updateAffiliateCode(params)` - Update affiliate code
- `Fuul.getAffiliateCode(userIdentifier)` - Get affiliate code
- `Fuul.isAffiliateCodeFree(code)` - Check if code is available

### User Methods
- `Fuul.getUserReferrer(params)` - Get user's referrer
- `Fuul.getUserAudiences(params)` - Get user audiences
- `Fuul.getConversions(params)` - Get conversion data

### Leaderboard Methods
- `Fuul.getPayoutsLeaderboard()` - Get payouts leaderboard
- `Fuul.getPointsLeaderboard()` - Get points leaderboard
- `Fuul.getReferredUsersLeaderboard()` - Get referred users leaderboard
- `Fuul.getVolumeLeaderboard()` - Get volume leaderboard

### Payout Methods
- `Fuul.getUserPayoutsByConversion()` - Get user payouts by conversion
- `Fuul.getUserPointsByConversion()` - Get user points by conversion
- `Fuul.getUserPayoutMovements()` - Get payout movements
- `Fuul.getUserPointsMovements()` - Get points movements

## Debugging

### Enable Debug Mode
```javascript
Fuul.init({ apiKey: 'your-key', debug: true });
```

### Inspect LocalStorage
The SDK uses localStorage for tracking:
```javascript
// View tracking ID
localStorage.getItem('fuul.tracking_id');

// View all Fuul-related keys
Object.keys(localStorage).filter(key => key.startsWith('fuul.'));
```

### Check Network Requests
With debug mode enabled, you can see API requests in the Network tab of your browser's developer tools.

## Troubleshooting

### SDK not loaded
- Make sure you've run `npm run build` from the repository root
- Check that `../../dist/index.umd.js` exists
- Look for errors in the browser console

### CORS issues
- Use a local HTTP server instead of opening the file directly
- Run: `npx serve . -p 8080`

### API errors
- Verify your API key is valid
- Enable debug mode to see detailed error messages
- Check the Network tab for failed requests
