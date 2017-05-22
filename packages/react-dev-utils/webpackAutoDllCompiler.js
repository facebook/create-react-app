'use strict';
const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const crypto = require('crypto');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const clearConsole = require('./clearConsole');
const chalk = require('chalk');
// const ManifestPlugin = require('webpack-manifest-plugin');
const environment = process.env.NODE_ENV;

// inspired by https://github.com/erm0l0v/webpack-md5-hash/blob/da8efa2fc7fe5c373c95f9ba859dbe208a8b844b/plugin/webpack_md5_hash.js
class WebpackAdditionalSourceHashPlugin {
  constructor({ additionalSourceHash }) {
    this.additionalSourceHash = additionalSourceHash;
  }
  apply(compiler) {
    compiler.plugin('compilation', compilation => {
      compilation.plugin('chunk-hash', (chunk, chunkHash) => {
        const oldHash = chunkHash.digest();
        chunkHash.digest = () => {
          const hash = crypto.createHash('md5');
          hash.update(this.additionalSourceHash);
          hash.update(oldHash);
          return hash.digest('hex');
        };
      });
    });
  }
}

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
        plugins: mainConfig.plugins
          .concat([
            new WebpackAdditionalSourceHashPlugin({
              additionalSourceHash: vendorHash,
            }),
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
          ])
          .map(plugin => {
            if (plugin.constructor.name === 'ManifestPlugin') {
              plugin.opts.cache = {
                'vendor.js': path.join('static', 'js', vendorHash + '.js'),
                'vendor.js.map': path.join(
                  'static',
                  'js',
                  vendorHash + '.js.map'
                ),
              };
            }
            return plugin;
          }),
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

        return [environment, hash.digest('hex').substring(0, 8)].join('.');
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
