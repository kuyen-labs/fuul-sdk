## GETTING SARTED

Start node server

```bash
$ node server.js
```

You can then access the SDK through [http://localhost:8080/fuul.js](http://localhost:8080/fuul.js).

To compile the project:

```bash
$ npm run compile
```

The files are generated in the `dest/` directory.

For development, you have to use the `fuul.local.js` file.

## How to install the SDK

Paste this code at the bottom of the `<body>` of your page.

```javascript
<script>
  (function () {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = 'http://localhost:8080/fuul.js';
    s.setAttribute('project-id', 'cdf95efb-9693-4503-8133-4fc0bb3a1c04');
    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
  })();
</script>
```

Send an event:

```javascript
fuul('connect_wallet', {
  address: 'Oxcda72070e455bb31c7690a170224ce43623d0b6f'
})
```
