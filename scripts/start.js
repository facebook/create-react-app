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
var WebpackDevServer = require('webpack-dev-server');
var config = require('../config/webpack.config.dev');
var execSync = require('child_process').execSync;
var opn = require('opn');
var vorpal = require('vorpal')();

// NOTE: Use `vorpal.log(...)` instead of `console.log(...)` here to redraw CLI prompts
// correctly. https://github.com/dthree/vorpal/wiki/API-%7C-vorpal#vorpallogstring-strings

var isInVerboseMode = false;
function maybeShowWebpackLogs(stats) {
  if (!isInVerboseMode) {
    return;
  }

  vorpal.log(stats.toString({colors: true}));
}

// TODO: hide this behind a flag and eliminate dead code on eject.
// This shouldn't be exposed to the user.
var handleCompile;
var isSmokeTest = process.argv.some(arg =>
  arg.indexOf('--smoke-test') > -1
);
if (isSmokeTest) {
  handleCompile = function (err, stats) {
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

function clearConsole() {
  process.stdout.write('\x1B[2J\x1B[0f');
}

var compiler = webpack(config, handleCompile);
compiler.plugin('invalid', function () {
  clearConsole();
  vorpal.log('Compiling...');
});
compiler.plugin('done', function (stats) {
  clearConsole();
  maybeShowWebpackLogs(stats);
  var hasErrors = stats.hasErrors();
  var hasWarnings = stats.hasWarnings();
  if (!hasErrors && !hasWarnings) {
    vorpal.log(chalk.green('Compiled successfully!'));
    vorpal.log();
    vorpal.log('The app is running at http://localhost:3000/');
    vorpal.log();
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
    vorpal.log(chalk.red('Failed to compile.'));
    vorpal.log();
    if (formattedErrors.some(isLikelyASyntaxError)) {
      // If there are any syntax errors, show just them.
      // This prevents a confusing ESLint parsing error
      // preceding a much more useful Babel syntax error.
      formattedErrors = formattedErrors.filter(isLikelyASyntaxError);
    }
    formattedErrors.forEach(message => {
      vorpal.log(message);
      vorpal.log();
    });
    // If errors exist, ignore warnings.
    return;
  }

  if (hasWarnings) {
    vorpal.log(chalk.yellow('Compiled with warnings.'));
    vorpal.log();
    formattedWarnings.forEach(message => {
      vorpal.log(message);
      vorpal.log();
    });

    vorpal.log('You may use special comments to disable some warnings.');
    vorpal.log('Use ' + chalk.yellow('// eslint-disable-next-line') + ' to ignore the next line.');
    vorpal.log('Use ' + chalk.yellow('/* eslint-disable */') + ' to ignore all warnings in a file.');
  }
});

function openBrowser() {
  vorpal.log(chalk.blue(
    'Opening http://localhost:3000/ in browser...\n'
  ));

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

var server = new WebpackDevServer(compiler, {
  historyApiFallback: true,
  hot: true, // Note: only CSS is currently hot reloaded
  publicPath: config.output.publicPath,
  quiet: true
});

server.listen(3000, 'localhost', function (err, result) {
  if (err) {
    return vorpal.log(err);
  }

  clearConsole();
  vorpal.log(chalk.cyan('Starting the development server...'));
  vorpal.log();
  openBrowser();
  startCLI();
});

function startCLI() {
  vorpal
    .command('open')
    .alias('o')
    .description('Opens your app in browser.')
    .action(function(args, onFinish) {
      openBrowser();
      onFinish();
    });

  vorpal
    .command('edit [editor...]')
    .alias('e')
    .description(
      'Opens your app in editor. Defaults to `$EDITOR`; pass an extra string ' +
      'to specify your editor of choice \n(e.g., `edit sublime text` or `e visual studio code`).'
    )
    .action(function(args, onFinish) {
      var ctx = this;

      var projectRootPath = config.cliInfo.projectRootPath;

      var editor = '';
      if (args.editor) {
        editor = args.editor.join(' ');
      } else if (process.env.EDITOR) {
        editor = process.env.EDITOR;
      } else {
        ctx.log(
          'Oops, no editor was found. You can pass an extra string ' +
          'to specify your editor of choice (e.g., `edit sublime text` or `e visual studio code`).'
        );
        onFinish();
      }

      ctx.log(chalk.blue(
        'Opening `' + projectRootPath + '` in `' + editor + '`...\n'
      ));

      opn(projectRootPath, {app: editor}).catch(function(e) {
        ctx.log(
          'Oops, we tried to open your app with `' + editor + '` but it didn\'t ' +
          'work. Please check if `' + editor + '` is an application. ' +
          'You can pass a second argument to specify ' +
          'your editor of choice (e.g., `edit sublime text` or `e visual studio code`).'
        );
      })
      onFinish();
    });

  vorpal
    .command('verbose')
    .alias('v')
    .description('Verbose mode (show all webpack logs).')
    .action(function(args, onFinish) {
      isInVerboseMode = !isInVerboseMode;
      this.log(chalk.blue(
        'Verbose mode ' + (!isInVerboseMode ?
          'off; will only show webpack errors.' :
          'on; will show all webpack logs.')
      ));
      onFinish();
    });

  vorpal.history('create-react-app-cli');

  vorpal
    .delimiter('\nAvailable commands: `help`, `open (o)`, `edit (e)`, `verbose (v)`, `exit`\n>')
    .show();
}
