---
id: proxying-api-requests-in-development
title: Proxying API Requests in Development
sidebar_label: Proxying in Development
---

> Note: this feature is available with `react-scripts@0.2.3` and higher.

People often serve the front-end React app from the same host and port as their backend implementation.

For example, a production setup might look like this after the app is deployed:

```
/             - static server returns index.html with React app
/todos        - static server returns index.html with React app
/api/todos    - server handles any /api/* requests using the backend implementation
```

Such setup is **not** required. However, **with** a setup like this, it is convenient to write requests like `fetch('/api/todos')` without worrying about redirecting them to another host or port during development.

To tell the development server to proxy any unknown requests to your API server in development, add a `proxy` field to `package.json`, for example:

```json
  "proxy": "http://localhost:4000",
```

This way, when `fetch('/api/todos')` is used in development, the development server will recognize that it is not a static asset, and will proxy the request to `http://localhost:4000/api/todos` as a fallback. The development server will **only** attempt to send requests without `text/html` in its `Accept` header to the proxy.

Conveniently, this avoids [CORS issues](http://stackoverflow.com/questions/21854516/understanding-ajax-cors-and-security-considerations) and error messages like this in development:

```
Fetch API cannot load http://localhost:4000/api/todos. No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'http://localhost:3000' is therefore not allowed access. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
```

Keep in mind that `proxy` only has effect in development (with `npm start`), and it is up to you to ensure that URLs like `/api/todos` point to the right thing in production. You don’t have to use the `/api` prefix. Any unrecognized request without a `text/html` accept header will be redirected to the specified `proxy`.

The `proxy` option supports HTTP, HTTPS and WebSocket connections.

The `proxy` can also be [configured manually](/docs/configuring-the-proxy-manually). This requires more setup but allows for greater control than the `package.json` `proxy` simple option.

The alternative to proxying is talking directly to a remote API. For static sites, or those served from different hosts/ports than the API they are talking to, then a proxy is not only not needed but not desirable. For those cases, the remote server usually has CORS enabled ([here’s how to do it for Express](http://enable-cors.org/server_expressjs.html)) to respond to requests. The app will need a way to specify what the API endpoint is though. Use [environment variables](adding-custom-environment-variables.md) to inject the right server host and port into your app to specify those. This has the added benefit of being able to have different values and inject them at run or build time.

## "Invalid Host Header" Errors After Configuring Proxy

When you enable the `proxy` option, you opt into a more strict set of host checks. This is necessary because leaving the backend open to remote hosts makes your computer vulnerable to DNS rebinding attacks. The issue is explained in [this article](https://medium.com/webpack/webpack-dev-server-middleware-security-issues-1489d950874a) and [this issue](https://github.com/webpack/webpack-dev-server/issues/887).

This shouldn’t affect you when developing on `localhost`, but if you develop remotely like [described here](https://github.com/facebook/create-react-app/issues/2271), you will see this error in the browser after enabling the `proxy` option:

> Invalid Host header

To work around it, you can specify your public development host in a file called `.env.development` in the root of your project:

```
HOST=mypublicdevhost.com
```

If you restart the development server now and load the app from the specified host, it should work.

If you are still having issues or if you’re using a more exotic environment like a cloud editor, you can bypass the host check completely by adding a line to `.env.development.local`. **Note that this is dangerous and exposes your machine to remote code execution from malicious websites:**

```
# NOTE: THIS IS DANGEROUS!
# It exposes your machine to attacks from the websites you visit.
DANGEROUSLY_DISABLE_HOST_CHECK=true
```

We don’t recommend this approach.

## Configuring the Proxy Manually

> Note: this feature is available with `react-scripts@2.0.0` and higher.

If the `proxy` option is **not** flexible enough for you, you can get direct access to the Express app instance and hook up your own proxy middleware.

You can use this feature in conjunction with the `proxy` property in `package.json`, but it is recommended you consolidate all of your logic into `src/setupProxy.js`.

First, install `http-proxy-middleware` using npm or Yarn:

```bash
$ npm install http-proxy-middleware --save
$ # or
$ yarn add http-proxy-middleware
```

Next, create `src/setupProxy.js` and place the following contents in it:

```js
const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  // ...
};
```

You can now register proxies as you wish! Here's an example using the above `http-proxy-middleware`:

```js
const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(proxy('/api', { target: 'http://localhost:5000/' }));
};
```

> **Note:** You do not need to import this file anywhere. It is automatically registered when you start the development server.

> **Note:** This file only supports Node's JavaScript syntax. Be sure to only use supported language features (i.e. no support for Flow, ES Modules, etc).

> **Note:** Passing the path to the proxy function allows you to use globbing and/or pattern matching on the path, which is more flexible than the express route matching.
