// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
// @remove-on-eject-end
'use strict';

const address = require('address');
const chalk = require('chalk');
const url = require('url');

function resolveLoopback(proxy) {
  const o = url.parse(proxy);
  o.host = undefined;
  if (o.hostname !== 'localhost') {
    return proxy;
  }
  try {
    o.hostname = address.ipv6() ? '::1' : '127.0.0.1';
  } catch (_ignored) {
    o.hostname = '127.0.0.1';
  }
  return url.format(o);
}

// We need to provide a custom onError function for httpProxyMiddleware.
// It allows us to log custom error messages on the console.
function onProxyError(proxy) {
  return (err, req, res) => {
    const host = req.headers && req.headers.host;
    console.log(
      chalk.red('Proxy error:') +
        ' Could not proxy request ' +
        chalk.cyan(req.url) +
        ' from ' +
        chalk.cyan(host) +
        ' to ' +
        chalk.cyan(proxy) +
        '.'
    );
    console.log(
      'See https://nodejs.org/api/errors.html#errors_common_system_errors for more information (' +
        chalk.cyan(err.code) +
        ').'
    );
    console.log();

    // And immediately send the proper error response to the client.
    // Otherwise, the request will eventually timeout with ERR_EMPTY_RESPONSE on the client side.
    if (res.writeHead && !res.headersSent) {
      res.writeHead(500);
    }
    res.end(
      'Proxy error: Could not proxy request ' +
        req.url +
        ' from ' +
        host +
        ' to ' +
        proxy +
        ' (' +
        err.code +
        ').'
    );
  };
}

module.exports = function prepareProxy(proxy) {
  // `proxy` lets you specify alternate servers for specific requests.
  // It can either be a string or an object conforming to the Webpack dev server proxy configuration
  // https://webpack.github.io/docs/webpack-dev-server.html
  if (!proxy) {
    return undefined;
  }
  if (typeof proxy !== 'object' && typeof proxy !== 'string') {
    console.log(
      chalk.red(
        'When specified, "proxy" in package.json must be a string or an object.'
      )
    );
    console.log(
      chalk.red('Instead, the type of "proxy" was "' + typeof proxy + '".')
    );
    console.log(
      chalk.red(
        'Either remove "proxy" from package.json, or make it an object.'
      )
    );
    process.exit(1);
  }

  // Otherwise, if proxy is specified, we will let it handle any request.
  // There are a few exceptions which we won't send to the proxy:
  // - /index.html (served as HTML5 history API fallback)
  // - /*.hot-update.json (WebpackDevServer uses this too for hot reloading)
  // - /sockjs-node/* (WebpackDevServer uses this for hot reloading)
  // Tip: use https://jex.im/regulex/ to visualize the regex
  const mayProxy = /^(?!\/(index\.html$|.*\.hot-update\.json$|sockjs-node\/)).*$/;

  // Support proxy as a string for those who are using the simple proxy option
  if (typeof proxy === 'string') {
    if (!/^http(s)?:\/\//.test(proxy)) {
      console.log(
        chalk.red(
          'When "proxy" is specified in package.json it must start with either http:// or https://'
        )
      );
      process.exit(1);
    }

    let target;
    if (process.platform === 'win32') {
      target = resolveLoopback(proxy);
    } else {
      target = proxy;
    }
    return [
      {
        target,
        logLevel: 'silent',
        // For single page apps, we generally want to fallback to /index.html.
        // However we also want to respect `proxy` for API calls.
        // So if `proxy` is specified as a string, we need to decide which fallback to use.
        // We use a heuristic: if request `accept`s text/html, we pick /index.html.
        // Modern browsers include text/html into `accept` header when navigating.
        // However API calls like `fetch()` won’t generally accept text/html.
        // If this heuristic doesn’t work well for you, use a custom `proxy` object.
        context: function(pathname, req) {
          return mayProxy.test(pathname) &&
            req.headers.accept &&
            req.headers.accept.indexOf('text/html') === -1;
        },
        onProxyReq: proxyReq => {
          // Browers may send Origin headers even with same-origin
          // requests. To prevent CORS issues, we have to change
          // the Origin to match the target URL.
          if (proxyReq.getHeader('origin')) {
            proxyReq.setHeader('origin', target);
          }
        },
        onError: onProxyError(target),
        secure: false,
        changeOrigin: true,
        ws: true,
        xfwd: true,
      },
    ];
  }

  // Otherwise, proxy is an object so create an array of proxies to pass to webpackDevServer
  return Object.keys(proxy).map(function(context) {
    if (!proxy[context].hasOwnProperty('target')) {
      console.log(
        chalk.red(
          'When `proxy` in package.json is as an object, each `context` object must have a ' +
            '`target` property specified as a url string'
        )
      );
      process.exit(1);
    }
    let target;
    if (process.platform === 'win32') {
      target = resolveLoopback(proxy[context].target);
    } else {
      target = proxy[context].target;
    }
    return Object.assign({}, proxy[context], {
      context: function(pathname) {
        return mayProxy.test(pathname) && pathname.match(context);
      },
      onProxyReq: proxyReq => {
        // Browers may send Origin headers even with same-origin
        // requests. To prevent CORS issues, we have to change
        // the Origin to match the target URL.
        if (proxyReq.getHeader('origin')) {
          proxyReq.setHeader('origin', target);
        }
      },
      target,
      onError: onProxyError(target),
    });
  });
};
