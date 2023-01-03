## GETTING SARTED

Clone the repo locally 

To build the project:

```bash
$ npm run build
$ yarn build
```

The files are generated in the `lib/` folder.

## How to use the SDK in any project

```javascript
import { Fuul } from "fuul-sdk";
const fuul = new Fuul("{project_id}", "{server_url}");
```

Send an event:

```javascript
fuul.sendEvent({
    name: "connect_wallet",
    project_id: "testprojectid",
    event_args: {
    address: "test",
  },
});
```
