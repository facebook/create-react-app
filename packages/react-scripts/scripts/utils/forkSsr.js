/**
 * This script runs a Webpack compiler to watch the SSR build. It is designed to
 * be run by child_process.fork from the start-ssr script.
 */

const chalk = require('chalk');
const fs = require('fs');
const webpack = require('webpack');
const { prepareUrls } = require('react-dev-utils/WebpackDevServerUtils');
const paths = require('../../config/paths');

const ssrConfigFactory = require('../../config/webpack.config.ssr');
const statusFile = require('./statusFile');
const { DebugCompilerUi, ProcessSendCompilerUi } = require('./MultiCompilerUi');
const { createCustomCompiler } = require('./customWebpackUtils');

const useYarn = fs.existsSync(paths.yarnLockFile);

const config = ssrConfigFactory('development');
const appName = require(paths.appPackageJson).name;

const useTypeScript = fs.existsSync(paths.appTsConfig);
const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === 'true';

// We don't start a DevServer so we can use dummy URLs
const urls = prepareUrls(
  'http', // protocol
  'localhost', // HOST
  '3000', // port
  paths.publicUrlOrPath.slice(0, -1)
);

// We don't start a DevServer so we can drop devSocket messages
const devSocket = {
  warnings: () => {},
  errors: () => {},
};

const ui = process.send ? new ProcessSendCompilerUi() : new DebugCompilerUi();

const compiler = createCustomCompiler(ui, {
  appName,
  config,
  devSocket,
  urls,
  useYarn,
  useTypeScript,
  tscCompileOnError,
  webpack,
});

statusFile.init(compiler, paths.appBuildWeb);

compiler.watch(
  {
    ignored: ['node_modules'],
  },
  err => {
    if (err) {
      ui.clear();
      ui.log(chalk.red('Failed to compile:') + '\n' + (err.message || err));
      process.exit(1);
    }

    statusFile.done(paths.appBuildSsr);
  }
);
