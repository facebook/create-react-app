'use strict';
const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const crypto = require('crypto');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const clearConsole = require('./clearConsole');
const chalk = require('chalk');
const environment = process.env.NODE_ENV;

module.exports = ({ mainConfig, vendorConfig, paths }) =>
  new Promise(resolve => {
    const vendorHash = getVendorHash(paths.vendorSrc);
    const vendorPath = paths.vendorPath;
    function shouldVendorBundleUpdate() {
      clearConsole();
      console.log('Checking if ' + vendorHash + ' vendor bundle exists');
      if (vendorBundleExist()) {
        clearConsole();
        console.log(
          chalk.green('Vendor bundle is up to date and safe to use!')
        );
        return false;
      }
      console.log('Vendor bundle needs to be compiled...');
      return true;
    }

    function vendorBundleExist() {
      return fs.existsSync(path.join(vendorPath, vendorHash + '.json')) &&
        fs.existsSync(path.join(vendorPath, vendorHash + '.js'));
    }

    function cleanUpStaleFiles(files) {
      try {
        // delete all stale vendor bundle for this environment
        files.filter(file => !file.indexOf(environment)).forEach(file => {
          fs.unlinkSync(path.join(vendorPath, file));
        });
      } catch (ignored) {
        //ignored
      }
    }

    function resolveConfig(mainConfig) {
      return Object.assign({}, mainConfig, {
        plugins: mainConfig.plugins.concat([
          new webpack.DllReferencePlugin({
            context: '.',
            manifest: require(path.join(vendorPath, vendorHash + '.json')),
          }),
          new AddAssetHtmlPlugin({
            outputPath: path.join('static', 'js'),
            publicPath: mainConfig.output.publicPath +
              path.join('static', 'js'),
            filepath: require.resolve(
              path.join(vendorPath, vendorHash + '.js')
            ),
          }),
        ]),
      });
    }

    function getVendorHash(vendorSrc) {
      if (fs.existsSync(vendorSrc)) {
        const hash = crypto.createHash('md5');
        const input = fs.readFileSync(vendorSrc);
        const appPackageJson = fs.readFileSync(paths.appPackageJson);

        hash.update(input);
        hash.update(appPackageJson);

        if (fs.existsSync(paths.yarnLockFile)) {
          hash.update(fs.readFileSync(paths.yarnLockFile));
        }

        return (process.env.REACT_APP_VENDOR_HASH = [
          environment,
          hash.digest('hex'),
        ].join('.'));
      } else {
        return false;
      }
    }

    if (!vendorHash) {
      // false vendorHash means that we cannot find vendorSrc.
      // continue without enabling dll feature.
      return resolve(mainConfig);
    }
    if (shouldVendorBundleUpdate()) {
      // Read vendor path for stale files
      return fs.readdir(vendorPath, (err, files) => {
        cleanUpStaleFiles(files);

        console.log('Compiling vendor bundle for faster rebuilds...');
        webpack(vendorConfig(vendorHash)).run((err, stats) => {
          checkForErrors(err, stats);

          // When the process still run until here, there are no errors :)
          console.log(chalk.green('Vendor bundle compiled successfully!'));
          resolve(resolveConfig(mainConfig)); // Let the main compiler do its job
        });
      });
    }
    // Just run the main compiler if vendor bundler is up to date
    return resolve(resolveConfig(mainConfig));
  });

function printErrors(summary, errors) {
  console.log(chalk.red(summary));
  console.log();
  errors.forEach(err => {
    console.log(err.message || err);
    console.log();
  });
}

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
