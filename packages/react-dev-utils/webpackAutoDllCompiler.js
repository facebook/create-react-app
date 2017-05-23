'use strict';
const fs = require('fs-extra');
const path = require('path');
const webpack = require('webpack');
const crypto = require('crypto');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const clearConsole = require('./clearConsole');
const chalk = require('chalk');
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

module.exports = ({ mainConfig, dllConfig, paths }) => new Promise(resolve => {
  const dllHash = getDllHash(paths.dllSrc);
  if (dllHash === false) {
    // we cannot find dllSrc.
    // continue without enabling dll feature.
    return resolve(mainConfig);
  }

  //start the procedure for building dll bundle
  clearConsole();
  const dllPath = paths.dllPath;
  const dllBundleFilePath = path.join(dllPath, dllHash + '.js');
  const dllManifestFilePath = path.join(dllPath, dllHash + '.json');
  const config = dllConfig(dllHash);
  console.log('Checking if ' + dllHash + ' dll bundle exists');
  if (dllExists()) {
    console.log(chalk.green('Dll bundle is up to date and safe to use!'));
    // Just run the main compiler if dll bundler is up to date
    return resolve(resolveConfig(mainConfig));
  }
  console.log('Dll bundle needs to be compiled...');
  // Read dll path for stale files
  fs.readdir(dllPath, (err, files) => {
    cleanUpStaleFiles(files);

    console.log('Compiling dll bundle for faster rebuilds...');
    webpack(config).run((err, stats) => {
      checkForErrors(err, stats);

      // When the process still run until here, there are no errors :)
      console.log(chalk.green('Dll bundle compiled successfully!'));
      resolve(resolveConfig(mainConfig)); // Let the main compiler do its job
    });
  });

  function dllExists() {
    return fs.existsSync(dllManifestFilePath) &&
      fs.existsSync(dllBundleFilePath);
  }

  function cleanUpStaleFiles(files) {
    try {
      // delete all stale dll bundle for this environment
      files.filter(file => !file.indexOf(environment)).forEach(file => {
        fs.unlinkSync(path.join(dllPath, file));
      });
    } catch (ignored) {
      //ignored
    }
  }

  function resolveConfig(mainConfig) {
    return Object.assign({}, mainConfig, {
      entry: mainConfig.entry.filter(path => !config.entry.includes(path)),
      plugins: mainConfig.plugins
        .concat([
          new WebpackAdditionalSourceHashPlugin({
            additionalSourceHash: dllHash,
          }),
          new webpack.DllReferencePlugin({
            context: '.',
            manifest: require(dllManifestFilePath),
          }),
          new AddAssetHtmlPlugin({
            outputPath: path.join('static', 'js'),
            publicPath: mainConfig.output.publicPath +
              path.join('static', 'js'),
            filepath: require.resolve(dllBundleFilePath),
          }),
        ])
        .map(plugin => {
          if (plugin.constructor.name === 'ManifestPlugin') {
            plugin.opts.cache = {
              'dll.js': path.join('static', 'js', dllHash + '.js'),
              'dll.js.map': path.join('static', 'js', dllHash + '.js.map'),
            };
          }
          return plugin;
        }),
    });
  }

  function getDllHash(dllSrc) {
    if (fs.existsSync(dllSrc)) {
      const hash = crypto.createHash('md5');
      const input = fs.readFileSync(dllSrc);
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
