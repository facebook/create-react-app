// @remove-file-on-eject
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const { createServer } = require('http');
const { writeFileSync } = require('fs');
const { join } = require('path');
const { choosePort } = require('react-dev-utils/WebpackDevServerUtils');
const open = require('open');
const handler = require('serve-handler');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const paths = require('../config/paths');

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// https://github.com/GoogleChrome/lighthouse/blob/master/docs/readme.md#using-programmatically
const launchChromeAndRunLighthouse = (url, opts) => {
  return chromeLauncher
    .launch({ chromeFlags: opts.chromeFlags })
    .then(chrome => {
      opts.port = chrome.port;
      return lighthouse(url, opts).then(results => {
        return chrome.kill().then(() => results.report);
      });
    });
};

const server = createServer((request, response) =>
  handler(request, response, {
    renderSingle: true,
    public: paths.appBuild,
  })
);

choosePort(HOST, DEFAULT_PORT)
  .then(() => choosePort(HOST, DEFAULT_PORT))
  .then(port => {
    if (port == null) {
      console.log('Unable to find a free port');
      process.exit(1);
    }

    server.listen(port);

    console.log('Server started, beginning audit...');

    return launchChromeAndRunLighthouse(`http://${HOST}:${port}`, {
      output: 'html',
    });
  })
  .then(report => {
    console.log('Audit finished, writing report...');

    const reportPath = join(paths.appPath, 'lighthouse-audit.html');
    writeFileSync(reportPath, report);

    console.log('Opening report in browser...');

    open(reportPath, { url: true });

    console.log('Exiting...');

    server.close();
  })
  .catch(() => {
    console.log('Something went wrong, exiting...');
    server.close();
  });
