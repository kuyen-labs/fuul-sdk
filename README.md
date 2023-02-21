## GETTING SARTED

Clone the repo locally 

To build the project:

```bash
$ npm run build
$ yarn build
```

The files are generated in the `lib/` folder.

## How to use the SDK in any project

Send an event:

```javascript
import { Fuul } from "fuul-sdk";

const fuul = new Fuul('YOUR_PROJECT_ID')

fuul.sendEvent('pageview');
fuul.sendEvent('connect_wallet');
```
