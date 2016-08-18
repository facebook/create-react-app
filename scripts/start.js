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
var historyApiFallback = require('connect-history-api-fallback');
var httpProxyMiddleware = require('http-proxy-middleware');
var execSync = require('child_process').execSync;
var opn = require('opn');
var detect = require('detect-port');
var prompt = require('./utils/prompt');
var config = require('../config/webpack.config.dev');
var paths = require('../config/paths');
var cli = require('./utils/cli');

// Tools like Cloud9 rely on this.
var DEFAULT_PORT = process.env.PORT || 3000;
var compiler;

// TODO: hide this behind a flag and eliminate dead code on eject.
// This shouldn't be exposed to the user.
var handleCompile;
var isSmokeTest = process.argv.some(arg => arg.indexOf('--smoke-test') > -1);
if (isSmokeTest) {
  handleCompile = function (err, stats) {
    if (err || stats.hasErrors() || stats.hasWarnings()) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  };
}





function setupCompiler(port) {
  // "Compiler" is a low-level interface to Webpack.
  // It lets us listen to some events and provide our own custom messages.
  compiler = webpack(config, handleCompile);

  // "invalid" event fires when you have changed a file, and Webpack is
  // recompiling a bundle. WebpackDevServer takes care to pause serving the
  // bundle, so if you refresh, it'll wait instead of serving the old one.
  // "invalid" is short for "bundle invalidated", it doesn't imply any errors.
  compiler.plugin('invalid', function() {
    cli.clear();
    cli.info({type:'title',
              name:'WAIT',
              message:'Compiling...\n'});
  });

  // "done" event fires when Webpack has finished recompiling the bundle.
  // Whether or not you have warnings or errors, you will get this event.
  compiler.plugin('done', function(stats) {
    cli.clear();
    var hasErrors = stats.hasErrors();
    var hasWarnings = stats.hasWarnings();
    if (!hasErrors && !hasWarnings) {
      // cli.displayHeader();
      cli.success({type:'title', name:'DONE', message:'Compiled successfully!\n'});

      cli.buildInfo(stats);


      cli.info('The app is running at http://localhost:' + port + '/');

      console.log();
      cli.note([
        'Note that the development build is not optimized.',
        'To create a production build, use ' + chalk.cyan('npm run build') + '.']);

      return;
    }

    // We have switched off the default Webpack output in WebpackDevServer
    // options so we are going to "massage" the warnings and errors and present
    // them in a readable focused way.
    // We use stats.toJson({}, true) to make output more compact and readable:
    // https://github.com/facebookincubator/create-react-app/issues/401#issuecomment-238291901
    var json = stats.toJson({}, true);

    if (hasErrors) {
        cli.displayErrors('Failed to compile.\n', json.errors);
        return;
    }

    if (hasWarnings) {
      cli.displayWarnings('Compiled with warnings.\n', json.warnings);
    }
  });
}

function openBrowser(port) {
  if (process.platform === 'darwin') {
    try {
      // Try our best to reuse existing tab
      // on OS X Google Chrome with AppleScript
      execSync('ps cax | grep "Google Chrome"');
      execSync(
        'osascript chrome.applescript http://localhost:' + port + '/',
        {cwd: path.join(__dirname, 'utils'), stdio: 'ignore'}
      );
      return;
    } catch (err) {
      // Ignore errors.
    }
  }
  // Fallback to opn
  // (It will always open new tab)
  opn('http://localhost:' + port + '/');
}

function addMiddleware(devServer) {
  // `proxy` lets you to specify a fallback server during development.
  // Every unrecognized request will be forwarded to it.
  var proxy = require(paths.appPackageJson).proxy;
  devServer.use(historyApiFallback({
    // Allow paths with dots in them to be loaded, reference issue #387
    disableDotRule: true,
    // For single page apps, we generally want to fallback to /index.html.
    // However we also want to respect `proxy` for API calls.
    // So if `proxy` is specified, we need to decide which fallback to use.
    // We use a heuristic: if request `accept`s text/html, we pick /index.html.
    // Modern browsers include text/html into `accept` header when navigating.
    // However API calls like `fetch()` won’t generally won’t accept text/html.
    // If this heuristic doesn’t work well for you, don’t use `proxy`.
    htmlAcceptHeaders: proxy ?
      ['text/html'] :
      ['text/html', '*/*']
  }));
  if (proxy) {
    if (typeof proxy !== 'string') {
      cli.error({type:'title', name:'PROXY',
        message:[
          'When specified, "proxy" in package.json must be a string.',
          'Instead, the type of "proxy" was "' + typeof proxy + '".',
          'Either remove "proxy" from package.json, or make it a string.'
        ]
      });

      process.exit(1);
    }

    // Otherwise, if proxy is specified, we will let it handle any request.
    // There are a few exceptions which we won't send to the proxy:
    // - /index.html (served as HTML5 history API fallback)
    // - /*.hot-update.json (WebpackDevServer uses this too for hot reloading)
    // - /sockjs-node/* (WebpackDevServer uses this for hot reloading)
    // Tip: use https://www.debuggex.com/ to visualize the regex
    var mayProxy = /^(?!\/(index\.html$|.*\.hot-update\.json$|sockjs-node\/)).*$/;
    devServer.use(mayProxy,
      // Pass the scope regex both to Express and to the middleware for proxying
      // of both HTTP and WebSockets to work without false positives.
      httpProxyMiddleware(pathname => mayProxy.test(pathname), {
        target: proxy,
        logLevel: 'silent',
        secure: false,
        changeOrigin: true
      })
    );
  }
  // Finally, by now we have certainly resolved the URL.
  // It may be /index.html, so let the dev server try serving it again.
  devServer.use(devServer.middleware);
}

function runDevServer(port) {
  var devServer = new WebpackDevServer(compiler, {
    // Enable hot reloading server. It will provide /sockjs-node/ endpoint
    // for the WebpackDevServer client so it can learn when the files were
    // updated. The WebpackDevServer client is included as an entry point
    // in the Webpack development configuration. Note that only changes
    // to CSS are currently hot reloaded. JS changes will refresh the browser.
    hot: true,
    // It is important to tell WebpackDevServer to use the same "root" path
    // as we specified in the config. In development, we always serve from /.
    publicPath: config.output.publicPath,
    // WebpackDevServer is noisy by default so we emit custom message instead
    // by listening to the compiler events with `compiler.plugin` calls above.
    quiet: true,
    // Reportedly, this avoids CPU overload on some systems.
    // https://github.com/facebookincubator/create-react-app/issues/293
    watchOptions: {
      ignored: /node_modules/
    }
  });

  // Our custom middleware proxies requests to /index.html or a remote API.
  addMiddleware(devServer);

  // Launch WebpackDevServer.
  devServer.listen(port, (err, result) => {
    if (err) {
      return cli.error(err);
    }

    cli.clear();
    cli.displayHeader();
    cli.info({type:'title',
                    name:'WAIT',
                    message:'Starting the development server...\n'});
    openBrowser(port);
  });
}

function run(port) {
  setupCompiler(port);
  runDevServer(port);
}

// We attempt to use the default port but if it is busy, we offer the user to
// run on a different port. `detect()` Promise resolves to the next free port.
detect(DEFAULT_PORT).then(port => {
  if (port === DEFAULT_PORT) {
    run(port);
    return;
  }

  cli.clear();
  var question =
    chalk.yellow('Something is already running on port ' + DEFAULT_PORT + '.') +
    '\n\nWould you like to run the app on another port instead?';

  prompt(question, true).then(shouldChangePort => {
    if (shouldChangePort) {
      run(port);
    }
  });
});
