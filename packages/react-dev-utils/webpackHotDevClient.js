/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

// This alternative WebpackDevServer combines the functionality of:
// https://github.com/webpack/webpack-dev-server/blob/webpack-1/client/index.js
// https://github.com/webpack/webpack/blob/webpack-1/hot/dev-server.js

// It only supports their simplest configuration (hot updates on same server).
// It makes some opinionated choices on top, like adding a syntax error overlay
// that looks similar to our console output. The error overlay is inspired by:
// https://github.com/glenjamin/webpack-hot-middleware

var ansiHTML = require('ansi-html');
var SockJS = require('sockjs-client');
var stripAnsi = require('strip-ansi');
var url = require('url');
var formatWebpackMessages = require('./formatWebpackMessages');
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();

// Color scheme inspired by https://github.com/glenjamin/webpack-hot-middleware
var colors = {
  reset: ['transparent', 'transparent'],
  black: '181818',
  red: 'E36049',
  green: 'B3CB74',
  yellow: 'FFD080',
  blue: '7CAFC2',
  magenta: '7FACCA',
  cyan: 'C3C2EF',
  lightgrey: 'EBE7E3',
  darkgrey: '6D7891'
};
ansiHTML.setColors(colors);

function showErrorOverlay(message) {
  // Use an iframe so that document styles don't mess up the overlay.
  var iframeID = 'react-dev-utils-webpack-hot-dev-client-overlay';
  var iframe =
    document.getElementById(iframeID) ||
    document.createElement('iframe');
  iframe.id = iframeID;
  iframe.style.position = 'fixed';
  iframe.style.left = 0;
  iframe.style.top = 0;
  iframe.style.right = 0;
  iframe.style.bottom = 0;
  iframe.style.width = '100vw';
  iframe.style.height = '100vh';
  iframe.style.border = 'none';
  iframe.style.zIndex = 9999999999;
  document.body.appendChild(iframe);

  // Inside, make a div.
  var overlayID = 'react-dev-utils-webpack-hot-dev-client-overlay-div';
  var overlay =
    iframe.contentDocument.getElementById(overlayID) ||
    iframe.contentDocument.createElement('div');
  overlay.id = overlayID;
  overlay.style.position = 'fixed';
  overlay.style.left = 0;
  overlay.style.top = 0;
  overlay.style.right = 0;
  overlay.style.bottom = 0;
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'black';
  overlay.style.color = '#E8E8E8';
  overlay.style.fontFamily = 'Menlo, Consolas, monospace';
  overlay.style.fontSize = 'large';
  overlay.style.padding = '2rem';
  overlay.style.lineHeight = '1.2';
  overlay.style.whiteSpace = 'pre-wrap';
  overlay.style.overflow = 'auto';

  // Make it look similar to our terminal.
  overlay.innerHTML =
    '<span style="color: #' +
    colors.red +
    '">Failed to compile.</span><br><br>' +
    ansiHTML(entities.encode(message));

  // Render!
  iframe.contentDocument.body.appendChild(overlay);
}

// Connect to WebpackDevServer via a socket.
var connection = new SockJS(url.format({
  protocol: window.location.protocol,
  hostname: window.location.hostname,
  port: window.location.port,
  // Hardcoded in WebpackDevServer
  pathname: '/sockjs-node'
}));
// Note: unlike WebpackDevServer's built-in client,
// we don't handle disconnect. If connection fails,
// just leave it instead of spamming the console.

// Remember some state related to hot module replacement.
var isFirstCompilation = true;
var mostRecentCompilationHash = null;

// Successful compilation.
function handleSuccess() {
  var isHotUpdate = !isFirstCompilation;
  isFirstCompilation = false;

  // Attempt to apply hot updates or reload.
  if (isHotUpdate) {
    tryApplyUpdates();
  }
}

// Compilation with warnings (e.g. ESLint).
function handleWarnings(warnings) {
  var isHotUpdate = !isFirstCompilation;
  isFirstCompilation = false;

  function printWarnings() {
    // Print warnings to the console.
    for (var i = 0; i < warnings.length; i++) {
      console.warn(stripAnsi(warnings[i]));
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
  isFirstCompilation = false;

  // "Massage" webpack messages.
  var formatted = formatWebpackMessages({
    errors: errors,
    warnings: []
  });

  // Only show the first error.
  showErrorOverlay(formatted.errors[0]);
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
  case 'ok':
    handleSuccess();
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
}

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

  // https://webpack.github.io/docs/hot-module-replacement.html#check
  module.hot.check(/* autoApply */true, function(err, updatedModules) {
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
  });
};
