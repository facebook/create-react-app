// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');
// @remove-on-eject-begin
// Do the preflight check (only happens before eject).
const verifyPackageTree = require('./utils/verifyPackageTree');
if (process.env.SKIP_PREFLIGHT_CHECK !== 'true') {
  verifyPackageTree();
}
const verifyTypeScriptSetup = require('./utils/verifyTypeScriptSetup');
verifyTypeScriptSetup();
// @remove-on-eject-end

const fs = require('fs');
const chalk = require('react-dev-utils/chalk');
const webpack = require('webpack');
const clearConsole = require('react-dev-utils/clearConsole');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const { createCompiler } = require('react-dev-utils/WebpackDevServerUtils');
const paths = require('../config/paths');
const configFactory = require('../config/webpack.config');

const useYarn = fs.existsSync(paths.yarnLockFile);
const isInteractive = process.stdout.isTTY;

// Warn and crash if required files are missing
if (
  !checkRequiredFiles([
    paths.appPopupHtml,
    paths.appIndexJs,
    paths.appBackgroundJs,
  ])
) {
  process.exit(1);
}

if (process.env.HOST) {
  console.log(
    chalk.cyan(
      `Attempting to bind to HOST environment variable: ${chalk.yellow(
        chalk.bold(process.env.HOST)
      )}`
    )
  );
  console.log(
    `If this was unintentional, check that you haven't mistakenly set it in your shell.`
  );
  console.log(
    `Learn more here: ${chalk.yellow('https://bit.ly/CRA-advanced-config')}`
  );
  console.log();
}

// We require that you explicitly set browsers and do not fall back to
// browserslist defaults.
const { checkBrowsers } = require('react-dev-utils/browsersHelper');
checkBrowsers(paths.appPath, isInteractive).then(() => {
  const config = configFactory('development');
  const appName = require(paths.appPackageJson).name;
  const useTypeScript = fs.existsSync(paths.appTsConfig);

  // Merge with the public folder
  const copyPublicFolder = require('./utils/copyPublicFolder');
  copyPublicFolder(paths.devAppBuild);

  // There are no urls but want to support the original CRA "createCompiler"
  const urls = { localUrlForTerminal: '' };
  // Same with dev socket, we are not running a dev server, but don't want to have to repeat what
  // is in "create compiler"
  const devSocket = {
    errors: () => {},
    warnings: () => {},
  };
  // Create a webpack compiler that is configured with custom messages.
  const compiler = createCompiler({
    appName,
    config,
    devSocket,
    urls,
    useYarn,
    useTypeScript,
    webpack,
  });

  // Do not need to run a dev server, just need to watch for changes and recompile
  compiler.watch({}, (err, stats) => {
    if (err) {
      return console.log(err);
    }

    if (isInteractive) {
      clearConsole();
    }

    // We used to support resolving modules according to `NODE_PATH`.
    // This now has been deprecated in favor of jsconfig/tsconfig.json
    // This lets you use absolute paths in imports inside large monorepos:
    if (process.env.NODE_PATH) {
      console.log(
        chalk.yellow(
          'Setting NODE_PATH to resolve modules absolutely has been deprecated in favor of setting baseUrl in jsconfig.json (or tsconfig.json if you are using TypeScript) and will be removed in a future major release of create-react-app.'
        )
      );
    }

    console.log(
      chalk.green('Load the /dev folder to test your react browser extension')
    );
  });
});

['SIGINT', 'SIGTERM'].forEach(function(sig) {
  process.on(sig, function() {
    process.exit();
  });
});
