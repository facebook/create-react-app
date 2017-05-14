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

const chalk = require('chalk');
const dns = require('dns');
const historyApiFallback = require('connect-history-api-fallback');
const httpProxyMiddleware = require('http-proxy-middleware');
const launchEditor = require('react-dev-utils/launchEditor');
const url = require('url');
const paths = require('../../config/paths');

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

function resolveProxy(proxy) {
  const p = url.parse(proxy);
  const hostname = p.hostname;
  if (hostname !== 'localhost') {
    return Promise.resolve(proxy);
  }
  p.host = undefined; // Remove the host; we don't care about it
  return new Promise(resolve => {
    dns.lookup(hostname, { hints: 0, all: false }, (err, address) => {
      if (err) {
        console.log(
          chalk.red(
            '"proxy" in package.json is set to localhost and cannot be resolved.'
          )
        );
        console.log(
          chalk.red('Try setting "proxy" to 127.0.0.1 instead of localhost.')
        );
        process.exit(1);
      }
      p.hostname = address;
      resolve(url.format(p));
    });
  });
}

function registerProxy(devServer, _proxy) {
  if (typeof _proxy !== 'string') {
    console.log(
      chalk.red('When specified, "proxy" in package.json must be a string.')
    );
    console.log(
      chalk.red('Instead, the type of "proxy" was "' + typeof _proxy + '".')
    );
    console.log(
      chalk.red('Either remove "proxy" from package.json, or make it a string.')
    );
    process.exit(1);
    // Test that proxy url specified starts with http:// or https://
  } else if (!/^http(s)?:\/\//.test(_proxy)) {
    console.log(
      chalk.red(
        'When "proxy" is specified in package.json it must start with either http:// or https://'
      )
    );
    process.exit(1);
  }

  return (process.platform === 'win32'
    ? resolveProxy(_proxy)
    : Promise.resolve(_proxy)).then(proxy => {
    // Otherwise, if proxy is specified, we will let it handle any request.
    // There are a few exceptions which we won't send to the proxy:
    // - /index.html (served as HTML5 history API fallback)
    // - /*.hot-update.json (WebpackDevServer uses this too for hot reloading)
    // - /sockjs-node/* (WebpackDevServer uses this for hot reloading)
    // Tip: use https://jex.im/regulex/ to visualize the regex
    const mayProxy = /^(?!\/(index\.html$|.*\.hot-update\.json$|sockjs-node\/)).*$/;

    // Pass the scope regex both to Express and to the middleware for proxying
    // of both HTTP and WebSockets to work without false positives.
    const hpm = httpProxyMiddleware(pathname => mayProxy.test(pathname), {
      target: proxy,
      logLevel: 'silent',
      onProxyReq: proxyReq => {
        // Browers may send Origin headers even with same-origin
        // requests. To prevent CORS issues, we have to change
        // the Origin to match the target URL.
        if (proxyReq.getHeader('origin')) {
          proxyReq.setHeader('origin', proxy);
        }
      },
      onError: onProxyError(proxy),
      secure: false,
      changeOrigin: true,
      ws: true,
      xfwd: true,
    });
    devServer.use(mayProxy, hpm);

    // Listen for the websocket 'upgrade' event and upgrade the connection.
    // If this is not done, httpProxyMiddleware will not try to upgrade until
    // an initial plain HTTP request is made.
    devServer.listeningApp.on('upgrade', hpm.upgrade);
  });
}

// This is used by the crash overlay.
function launchEditorMiddleware() {
  return function(req, res, next) {
    if (req.url.startsWith('/__open-stack-frame-in-editor')) {
      launchEditor(req.query.fileName, req.query.lineNumber);
      res.end();
    } else {
      next();
    }
  };
}

module.exports = function addWebpackMiddleware(devServer) {
  // `proxy` lets you to specify a fallback server during development.
  // Every unrecognized request will be forwarded to it.
  const proxy = require(paths.appPackageJson).proxy;
  devServer.use(launchEditorMiddleware());
  devServer.use(
    historyApiFallback({
      // Paths with dots should still use the history fallback.
      // See https://github.com/facebookincubator/create-react-app/issues/387.
      disableDotRule: true,
      // For single page apps, we generally want to fallback to /index.html.
      // However we also want to respect `proxy` for API calls.
      // So if `proxy` is specified, we need to decide which fallback to use.
      // We use a heuristic: if request `accept`s text/html, we pick /index.html.
      // Modern browsers include text/html into `accept` header when navigating.
      // However API calls like `fetch()` won’t generally accept text/html.
      // If this heuristic doesn’t work well for you, don’t use `proxy`.
      htmlAcceptHeaders: proxy ? ['text/html'] : ['text/html', '*/*'],
    })
  );
  return (proxy
    ? registerProxy(devServer, proxy)
    : Promise.resolve()).then(() => {
    // Finally, by now we have certainly resolved the URL.
    // It may be /index.html, so let the dev server try serving it again.
    devServer.use(devServer.middleware);
  });
};
