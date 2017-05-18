'use strict';
const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const paths = require('../../config/paths');
const vendorConfig = require('../../config/webpack.config.vendor');
const clearConsole = require('react-dev-utils/clearConsole');
const chalk = require('chalk');
const printErrors = require('./printErrors');
const environment = process.env.NODE_ENV;
const vendorHash = require('./vendorHash');

module.exports = config => new Promise(resolve => {
  if (shouldVendorBundleUpdate()) {
    // Read vendor path for stale files
    return fs.readdir(paths.vendorPath, (err, files) => {
      cleanUpStaleFiles(files);

      console.log('Compiling vendor bundle for faster rebuilds...');
      webpack(vendorConfig).run((err, stats) => {
        checkForErrors(err, stats);

        // When the process still run until here, there are no errors :)
        console.log(chalk.green('Vendor bundle compiled successfully!'));
        resolve(resolveConfig(config)); // Let the main compiler do its job
      });
    });
  }
  // Just run the main compiler if vendor bundler is up to date
  return resolve(resolveConfig(config));
});

function checkForErrors(err, stats) {
  if (err) {
    printErrors('Failed to compile.', [err]);
    process.exit(1);
  }

  if (stats.compilation.errors.length) {
    printErrors('Failed to compile.', stats.compilation.errors);
    process.exit(1);
  }

  if (process.env.CI && stats.compilation.warnings.length) {
    printErrors(
      'Failed to compile. When process.env.CI = true, warnings are treated as failures. Most CI servers set this automatically.',
      stats.compilation.warnings
    );
    process.exit(1);
  }
}

function manifestExists() {
  return fs.existsSync(path.join(paths.vendorPath, vendorHash + '.json'));
}

function shouldVendorBundleUpdate() {
  clearConsole();
  console.log('Checking if ' + vendorHash + ' vendor bundle exists');
  if (manifestExists()) {
    clearConsole();
    console.log(chalk.green('Vendor bundle is up to date and safe to use!'));
    return false;
  }
  console.log('Vendor bundle needs to be compiled...');
  return true;
}

function cleanUpStaleFiles(files) {
  try {
    // delete all stale vendor bundle for this environment
    files.filter(file => !file.indexOf(environment)).forEach(file => {
      fs.unlinkSync(path.join(paths.vendorPath, file));
    });
  } catch (ignored) {
    //ignored
  }
}

function resolveConfig(config) {
  return Object.assign(config, {
    plugins: config.plugins.concat([
      new webpack.DllReferencePlugin({
        context: '.',
        manifest: require(path.join(paths.vendorPath, vendorHash + '.json')),
      }),
      new AddAssetHtmlPlugin({
        outputPath: path.join('static', 'js'),
        publicPath: config.output.publicPath + path.join('static', 'js'),
        filepath: require.resolve(
          path.join(paths.vendorPath, vendorHash + '.js')
        ),
      }),
    ]),
  });
}
