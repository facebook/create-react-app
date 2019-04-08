## Proxy

- Use this proxy in localdev to talk to your environment's APIs, control their timeouts, etc.
- Requires Node 10+ during localdev.
- App must run on PORT 5000-5009 to comply with auth service whitelist, until we can get the default PORT 3000 added to it

### Usage

- In your app (if not installed by create-react-app for you already):  
  `npm install --save-dev @fs/react-scripts`

#### Create-React-App for app dev

- If using create-react-app - based app, then in file:  
  `src/setupProxy.js`

```javascript
const setupProxy = require('@fs/react-scripts/proxy/setupProxy'); // ◠

// optional
const customProxies = [
  {
    route: '/service', // required
    options: {
      // all optional, have smart defaults already set
      target: 'https://beta.familysearch.org', // optional, default
      changeOrigin: true, // optional, default
      logLevel: 'debug', // optional, default
      timeout: 5000, // optional, default
    },
  },
];

module.exports = function(app) {
  // run to set default and custom proxies
  setupProxy(app /* required */, customProxies /* optional */);
};
```

### Change remote environment (int, beta only right now)

in .env file or process.env:

```sh
REMOTE_ENV=int
```

- Apps can set their own local proxy overrides
- Config options from http-proxy-middleware
- [https://github.com/chimurai/http-proxy-middleware#http-proxy-options](https://github.com/chimurai/http-proxy-middleware#http-proxy-options)
- If others will use the service you add, please add it to the default proxy config here:
- [https://github.com/fs-webdev/create-react-app/tree/master/packages/react-scripts/proxy/proxies.js](https://github.com/fs-webdev/create-react-app/tree/master/packages/react-scripts/proxy/proxies.js)

### Default Proxy Schema

For default proxies here in ./proxy/proxies.js:

```javascript
{
  // `route`: Required. (the only required field)
  // Must start with slash and must resolve in your remote env
  route: '/example',
  // `options`: Optional.
  // Only use if you need to override the default http-proxy-middleware config for this route
  // Takes http-proxy-middleware config options.
  // See: https://github.com/chimurai/http-proxy-middleware
  options: {}
}
```
