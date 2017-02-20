/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var execSync = require('child_process').execSync;
var spawn = require('cross-spawn');
var opn = require('opn');

// https://github.com/sindresorhus/opn#app
var OSX_CHROME = 'google chrome';


/**
 * Use an enum for the possible uses of the BROWSER environment variable
 * 'browser': open a browser specified by the user. if value is not specified,
 * use the system's default browser.
 * 'browser': open a browser.
 * 'none': Don't open anything.
 * 'script': run a node.js script.
 *
 */
const BROWSER_TYPES = Object.freeze({
  'browser': 0,
  'none': 1,
  'script': 2,
})

/**
 * Returns an object with the BROWSER environment variable's value and type
 */
function getBrowserEnv() {
  // Attempt to honor this environment variable.
  // It is specific to the operating system.
  // See https://github.com/sindresorhus/opn#app for documentation.
  const browserStr = process.env.BROWSER;
  const result = { value: browserStr }
  if (!browserStr)
    result.type = BROWSER_TYPES.browser;
  else if (browserStr && browserStr.endsWith('.js'))
    result.type = BROWSER_TYPES.script;
  else if (browserStr.toLowerCase() === 'none')
    result.type = BROWSER_TYPES.none;
  else
    result.type = BROWSER_TYPES.browser;
  return result
}

/**
 * spawns a new child process to execute a node.js script
 */
function executeNodeScript(scriptPath, url) {
  const extraArgs = process.argv.slice(2);
  const args = [scriptPath]
                .concat(extraArgs) // add any extra flags
                .concat(url); // add url last
  spawn('node', args);
  return true;
}

function startBrowserProcess(browser, url) {
  // If we're on OS X, the user hasn't specifically
  // requested a different browser, we can try opening
  // Chrome with AppleScript. This lets us reuse an
  // existing tab when possible instead of creating a new one.
  const shouldTryOpenChromeWithAppleScript = process.platform === 'darwin' &&
    (typeof browser !== 'string' || browser === OSX_CHROME);

  if (shouldTryOpenChromeWithAppleScript) {
    try {
      // Try our best to reuse existing tab
      // on OS X Google Chrome with AppleScript
      execSync('ps cax | grep "Google Chrome"');
      execSync('osascript openChrome.applescript ' + url, {
        cwd: __dirname,
        stdio: 'ignore',
      });
      return true;
    } catch (err) {
      // Ignore errors.
    }
  }

  // Another special case: on OS X, check if BROWSER has been set to "open".
  // In this case, instead of passing `open` to `opn` (which won't work),
  // just ignore it (thus ensuring the intended behavior, i.e. opening the system browser):
  // https://github.com/facebookincubator/create-react-app/pull/1690#issuecomment-283518768
  if (process.platform === 'darwin' && browser === 'open') {
    browser = undefined;
  }

  // Fallback to opn
  // (It will always open new tab)
  try {
    var options = { app: browser };
    opn(url, options).catch(() => {}); // Prevent `unhandledRejection` error.
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Reads the BROWSER evironment variable and decides what to do with it. Returns
 * true if it opened a browser or ran a node.js script, otherwise false.
 */
function openBrowser(url) {
  const browser = getBrowserEnv();

  switch (browser.type) {
    case BROWSER_TYPES.none:
      // Special case: BROWSER="none" will prevent opening completely.
      return false;
    case BROWSER_TYPES.script:
      return executeNodeScript(browser.value, url);
    case BROWSER_TYPES.browser: {
      return startBrowserProcess(browser.value, url);
    }
    default: {
      throw new Error('Unknown Browser Type: ' + browser.type);
    }
  }

}

module.exports = openBrowser;
