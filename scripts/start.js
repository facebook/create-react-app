/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

process.env.NODE_ENV = 'development';

var path = require('path');
var chalk = require('chalk');
var webpack = require('webpack');
var request = require('request');
var UrlResolver = require('url');
var SingleChild = require('single-child');
var WebpackDevServer = require('webpack-dev-server');
var configClient = require('../config/webpack.config.dev');
var configServer = require('../config/webpack.config.server.dev');
var execSync = require('child_process').execSync;
var opn = require('opn');

process.on('uncaughtException', err => console.error(err));

const SERVER_PATH = 'http://localhost:3001';
const MAX_PROXY_RETRIES = 3;

let server = null;

// TODO: hide this behind a flag and eliminate dead code on eject.
// This shouldn't be exposed to the user.
var handleCompileClient;
var isSmokeTest = process.argv.some(arg =>
  arg.indexOf('--smoke-test') > -1
);
if (isSmokeTest) {
  handleCompileClient = function (err, stats) {
    if (err || stats.hasErrors() || stats.hasWarnings()) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  };
}

var friendlySyntaxErrorLabel = 'Syntax error:';

function isLikelyASyntaxError(message) {
  return message.indexOf(friendlySyntaxErrorLabel) !== -1;
}

// This is a little hacky.
// It would be easier if webpack provided a rich error object.

function formatMessage(message) {
  return message
    // Make some common errors shorter:
    .replace(
      // Babel syntax error
      'Module build failed: SyntaxError:',
      friendlySyntaxErrorLabel
    )
    .replace(
      // Webpack file not found error
      /Module not found: Error: Cannot resolve 'file' or 'directory'/,
      'Module not found:'
    )
    // Internal stacks are generally useless so we strip them
    .replace(/^\s*at\s.*:\d+:\d+[\s\)]*\n/gm, '') // at ... ...:x:y
    // Webpack loader names obscure CSS filenames
    .replace('./~/css-loader!./~/postcss-loader!', '');
}

function openBrowser() {
  if (process.platform === 'darwin') {
    try {
      // Try our best to reuse existing tab
      // on OS X Google Chrome with AppleScript
      execSync('ps cax | grep "Google Chrome"');
      execSync(
        'osascript ' +
        path.resolve(__dirname, './openChrome.applescript') +
        ' http://localhost:3000/'
      );
      return;
    } catch (err) {
      // Ignore errors.
    }
  }
  // Fallback to opn
  // (It will always open new tab)
  opn('http://localhost:3000/');
}

function clearConsole() {
  process.stdout.write('\x1B[2J\x1B[0f');
}

function webpackOnInvalid() {
  clearConsole();
  console.log('Compiling...');  
}

function webpackOnDone(stats) {
  clearConsole();
  var hasErrors = stats.hasErrors();
  var hasWarnings = stats.hasWarnings();
  if (!hasErrors && !hasWarnings) {
    console.log(chalk.green('Compiled successfully!'));
    console.log();
    console.log('The app is running at http://localhost:3000/');
    console.log();
    return;
  }

  var json = stats.toJson();
  var formattedErrors = json.errors.map(message =>
    'Error in ' + formatMessage(message)
  );
  var formattedWarnings = json.warnings.map(message =>
    'Warning in ' + formatMessage(message)
  );

  if (hasErrors) {
    console.log(chalk.red('Failed to compile.'));
    console.log();
    if (formattedErrors.some(isLikelyASyntaxError)) {
      // If there are any syntax errors, show just them.
      // This prevents a confusing ESLint parsing error
      // preceding a much more useful Babel syntax error.
      formattedErrors = formattedErrors.filter(isLikelyASyntaxError);
    }
    formattedErrors.forEach(message => {
      console.log(message);
      console.log();
    });
    // If errors exist, ignore warnings.
    return;
  }

  if (hasWarnings) {
    console.log(chalk.yellow('Compiled with warnings.'));
    console.log();
    formattedWarnings.forEach(message => {
      console.log(message);
      console.log();
    });

    console.log('You may use special comments to disable some warnings.');
    console.log('Use ' + chalk.yellow('// eslint-disable-next-line') + ' to ignore the next line.');
    console.log('Use ' + chalk.yellow('/* eslint-disable */') + ' to ignore all warnings in a file.');
  }
}

function exponentialBackoff(step) {
  return Math.pow(2, step);
}

const clientCompiler = webpack(configClient, handleCompileClient);
clientCompiler.plugin('invalid', webpackOnInvalid);
clientCompiler.plugin('done', webpackOnDone);

// Here's the server compiler
webpack(configServer, function(error, stats) {
  webpackOnDone(stats);

  if (!server) {
    server = new SingleChild('node', ['build/server/server-dev.js'], {
      stdio: [0, 1, 2]
    });
    server.start();
  } else {
    server.restart();
  }
});

const devServer = new WebpackDevServer(clientCompiler, {
  historyApiFallback: true,
  hot: true, // Note: only CSS is currently hot reloaded
  publicPath: configClient.output.publicPath,
  quiet: true
});

devServer.use('/', (req, res) => {
  const url = UrlResolver.resolve(SERVER_PATH, req.url);

  let retries = 0;
  const proxyRequest = () => {
    req
      .pipe(request(url))
      .on('error', error => {
        if (retries <= MAX_PROXY_RETRIES) {
          setTimeout(proxyRequest, exponentialBackoff(retries) * 1000)
          retries++;
        } else {
          console.error(error);

          res
            .status(500)
            .send('Proxy does not work');
        }
      })
      .pipe(res);
  }

  proxyRequest();
});

devServer.listen(3000, function (err, result) {
  if (err) {
    return console.log(err);
  }

  clearConsole();
  console.log(chalk.cyan('Starting the development server...'));
  console.log();
  openBrowser();
});


