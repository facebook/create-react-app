/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

// This alternative WebpackDevServer combines the functionality of:
// https://github.com/webpack/webpack-dev-server/blob/webpack-1/client/index.js
// https://github.com/webpack/webpack/blob/webpack-1/hot/dev-server.js

// It only supports their simplest configuration (hot updates on same server).
// It makes some opinionated choices on top, like adding a syntax error overlay
// that looks similar to our console output. The error overlay is inspired by:
// https://github.com/glenjamin/webpack-hot-middleware

var SockJS = require('sockjs-client');
var stripAnsi = require('strip-ansi');
var url = require('url');
var formatWebpackMessages = require('./formatWebpackMessages');
var Entities = require('html-entities').AllHtmlEntities;
var ansiHTML = require('./ansiHTML');
var entities = new Entities();

function createOverlayIframe(onIframeLoad) {
  var iframe = document.createElement('iframe');
  iframe.id = 'react-dev-utils-webpack-hot-dev-client-overlay';
  iframe.src = 'about:blank';
  iframe.style.position = 'fixed';
  iframe.style.left = 0;
  iframe.style.top = 0;
  iframe.style.right = 0;
  iframe.style.bottom = 0;
  iframe.style.width = '100vw';
  iframe.style.height = '100vh';
  iframe.style.border = 'none';
  iframe.style.zIndex = 9999999999;
  iframe.onload = onIframeLoad;
  return iframe;
}

function addOverlayDivTo(iframe) {
  // TODO: unify these styles with react-error-overlay
  iframe.contentDocument.body.style.margin = 0;
  iframe.contentDocument.body.style.maxWidth = '100vw';

  var outerDiv = iframe.contentDocument.createElement('div');
  outerDiv.id = 'react-dev-utils-webpack-hot-dev-client-overlay-div';
  outerDiv.style.width = '100%';
  outerDiv.style.height = '100%';
  outerDiv.style.boxSizing = 'border-box';
  outerDiv.style.textAlign = 'center';
  outerDiv.style.backgroundColor = 'rgb(255, 255, 255)';

  var div = iframe.contentDocument.createElement('div');
  div.style.position = 'relative';
  div.style.display = 'inline-flex';
  div.style.flexDirection = 'column';
  div.style.height = '100%';
  div.style.width = '1024px';
  div.style.maxWidth = '100%';
  div.style.overflowX = 'hidden';
  div.style.overflowY = 'auto';
  div.style.padding = '0.5rem';
  div.style.boxSizing = 'border-box';
  div.style.textAlign = 'left';
  div.style.fontFamily = 'Consolas, Menlo, monospace';
  div.style.fontSize = '11px';
  div.style.whiteSpace = 'pre-wrap';
  div.style.wordBreak = 'break-word';
  div.style.lineHeight = '1.5';
  div.style.color = 'rgb(41, 50, 56)';

  outerDiv.appendChild(div);
  iframe.contentDocument.body.appendChild(outerDiv);
  return div;
}

function overlayHeaderStyle() {
  return 'font-size: 2em;' +
    'font-family: sans-serif;' +
    'color: rgb(206, 17, 38);' +
    'white-space: pre-wrap;' +
    'margin: 0 2rem 0.75rem 0px;' +
    'flex: 0 0 auto;' +
    'max-height: 35%;' +
    'overflow: auto;';
}

var overlayIframe = null;
var overlayDiv = null;
var lastOnOverlayDivReady = null;

function ensureOverlayDivExists(onOverlayDivReady) {
  if (overlayDiv) {
    // Everything is ready, call the callback right away.
    onOverlayDivReady(overlayDiv);
    return;
  }

  // Creating an iframe may be asynchronous so we'll schedule the callback.
  // In case of multiple calls, last callback wins.
  lastOnOverlayDivReady = onOverlayDivReady;

  if (overlayIframe) {
    // We're already creating it.
    return;
  }

  // Create iframe and, when it is ready, a div inside it.
  overlayIframe = createOverlayIframe(function onIframeLoad() {
    overlayDiv = addOverlayDivTo(overlayIframe);
    // Now we can talk!
    lastOnOverlayDivReady(overlayDiv);
  });

  // Zalgo alert: onIframeLoad() will be called either synchronously
  // or asynchronously depending on the browser.
  // We delay adding it so `overlayIframe` is set when `onIframeLoad` fires.
  document.body.appendChild(overlayIframe);
}

function showErrorOverlay(message) {
  ensureOverlayDivExists(function onOverlayDivReady(overlayDiv) {
    // TODO: unify this with our runtime overlay
    overlayDiv.innerHTML = '<div style="' +
      overlayHeaderStyle() +
      '">Failed to compile</div>' +
      '<pre style="' +
      'display: block; padding: 0.5em; margin-top: 0; ' +
      'margin-bottom: 0.5em; overflow-x: auto; white-space: pre-wrap; ' +
      'border-radius: 0.25rem; background-color: rgba(206, 17, 38, 0.05)">' +
      '<code style="font-family: Consolas, Menlo, monospace;">' +
      ansiHTML(entities.encode(message)) +
      '</code></pre>' +
      '<div style="' +
      'font-family: sans-serif; color: rgb(135, 142, 145); margin-top: 0.5rem; ' +
      'flex: 0 0 auto">' +
      'This error occurred during the build time and cannot be dismissed.</div>';
  });
}

function destroyErrorOverlay() {
  if (!overlayDiv) {
    // It is not there in the first place.
    return;
  }

  // Clean up and reset internal state.
  document.body.removeChild(overlayIframe);
  overlayDiv = null;
  overlayIframe = null;
  lastOnOverlayDivReady = null;
}

// Connect to WebpackDevServer via a socket.
var connection = new SockJS(
  url.format({
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    port: window.location.port,
    // Hardcoded in WebpackDevServer
    pathname: '/sockjs-node',
  })
);

// Unlike WebpackDevServer client, we won't try to reconnect
// to avoid spamming the console. Disconnect usually happens
// when developer stops the server.
connection.onclose = function() {
  console.info(
    'The development server has disconnected.\nRefresh the page if necessary.'
  );
};

// Remember some state related to hot module replacement.
var isFirstCompilation = true;
var mostRecentCompilationHash = null;
var hasCompileErrors = false;

function clearOutdatedErrors() {
  // Clean up outdated compile errors, if any.
  if (hasCompileErrors && typeof console.clear === 'function') {
    console.clear();
  }
}

// Successful compilation.
function handleSuccess() {
  clearOutdatedErrors();
  destroyErrorOverlay();

  var isHotUpdate = !isFirstCompilation;
  isFirstCompilation = false;
  hasCompileErrors = false;

  // Attempt to apply hot updates or reload.
  if (isHotUpdate) {
    tryApplyUpdates();
  }
}

// Compilation with warnings (e.g. ESLint).
function handleWarnings(warnings) {
  clearOutdatedErrors();
  destroyErrorOverlay();

  var isHotUpdate = !isFirstCompilation;
  isFirstCompilation = false;
  hasCompileErrors = false;

  function printWarnings() {
    // Print warnings to the console.
    var formatted = formatWebpackMessages({
      warnings: warnings,
      errors: [],
    });

    for (var i = 0; i < formatted.warnings.length; i++) {
      console.warn(stripAnsi(formatted.warnings[i]));
    }
  }

  // Attempt to apply hot updates or reload.
  if (isHotUpdate) {
    tryApplyUpdates(function onSuccessfulHotUpdate() {
      // Only print warnings if we aren't refreshing the page.
      // Otherwise they'll disappear right away anyway.
      printWarnings();
    });
  } else {
    // Print initial warnings immediately.
    printWarnings();
  }
}

// Compilation with errors (e.g. syntax error or missing modules).
function handleErrors(errors) {
  clearOutdatedErrors();

  isFirstCompilation = false;
  hasCompileErrors = true;

  // "Massage" webpack messages.
  var formatted = formatWebpackMessages({
    errors: errors,
    warnings: [],
  });

  // Only show the first error.
  showErrorOverlay(formatted.errors[0]);

  // Also log them to the console.
  for (var i = 0; i < formatted.errors.length; i++) {
    console.error(stripAnsi(formatted.errors[i]));
  }

  // Do not attempt to reload now.
  // We will reload on next success instead.
}

// There is a newer version of the code available.
function handleAvailableHash(hash) {
  // Update last known compilation hash.
  mostRecentCompilationHash = hash;
}

// Handle messages from the server.
connection.onmessage = function(e) {
  var message = JSON.parse(e.data);
  switch (message.type) {
    case 'hash':
      handleAvailableHash(message.data);
      break;
    case 'still-ok':
    case 'ok':
      handleSuccess();
      break;
    case 'content-changed':
      // Triggered when a file from `contentBase` changed.
      window.location.reload();
      break;
    case 'warnings':
      handleWarnings(message.data);
      break;
    case 'errors':
      handleErrors(message.data);
      break;
    default:
    // Do nothing.
  }
};

// Is there a newer version of this code available?
function isUpdateAvailable() {
  /* globals __webpack_hash__ */
  // __webpack_hash__ is the hash of the current compilation.
  // It's a global variable injected by Webpack.
  return mostRecentCompilationHash !== __webpack_hash__;
}

// Webpack disallows updates in other states.
function canApplyUpdates() {
  return module.hot.status() === 'idle';
}

// Attempt to update code on the fly, fall back to a hard reload.
function tryApplyUpdates(onHotUpdateSuccess) {
  if (!module.hot) {
    // HotModuleReplacementPlugin is not in Webpack configuration.
    window.location.reload();
    return;
  }

  if (!isUpdateAvailable() || !canApplyUpdates()) {
    return;
  }

  function handleApplyUpdates(err, updatedModules) {
    if (err || !updatedModules) {
      window.location.reload();
      return;
    }

    if (typeof onHotUpdateSuccess === 'function') {
      // Maybe we want to do something.
      onHotUpdateSuccess();
    }

    if (isUpdateAvailable()) {
      // While we were updating, there was a new update! Do it again.
      tryApplyUpdates();
    }
  }

  // https://webpack.github.io/docs/hot-module-replacement.html#check
  var result = module.hot.check(/* autoApply */ true, handleApplyUpdates);

  // // Webpack 2 returns a Promise instead of invoking a callback
  if (result && result.then) {
    result.then(
      function(updatedModules) {
        handleApplyUpdates(null, updatedModules);
      },
      function(err) {
        handleApplyUpdates(err, null);
      }
    );
  }
}
