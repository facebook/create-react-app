var fs = require('fs-extra');
var path = require('path');
var webpack = require('webpack');
var paths = require('../config/paths');
var config = require('../config/webpack.config.vendor');
var clearConsole = require('react-dev-utils/clearConsole');
var os = require('os');
var chalk = require('chalk');
var printErrors = require('../utils/printErrors');
var environment = process.env.NODE_ENV;
var hashFilePrefix = 'REACT_APP_PACKAGE_JSON_MD5_';
var vendorManifestId = require('../utils/vendorManifestId');

module.exports = (callback, args) => {
  if (shouldManifestUpdate()) {
    fs.emptyDirSync(paths.vendorPath);
    var compiler = webpack(config);
    console.log('Current environment: ', environment);
    console.log();
    console.log('Current dependencies :');
    console.log();
    Object.keys(require(paths.appPackageJson).dependencies)
      .forEach(dependency => console.log(dependency));
    Object.keys(require(paths.appPackageJson).devDependencies)
      .forEach(dependency => console.log(dependency));
    console.log('Creating Vendor Files...');
    return compiler.run((err, stats) => {
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

      console.log(chalk.green('Vendor compiled successfully.'));
      console.log();
      fs.writeFileSync(
        path.join(os.tmpdir(), hashFilePrefix + vendorManifestId)
      );
      callback();
    });
  }
  console.log('Vendor file is up to date! No need to rebuild it');
  return callback();
};

function manifestExists() {
  return fs.existsSync(
    path.join(paths.vendorPath, 'manifest.' + vendorManifestId + '.json')
  );
}

function manifestStale() {
  if (md5Exists(vendorManifestId)) {
    return false;
  }
  return true;
}

function md5Exists(md5) {
  return fs.existsSync(path.join(os.tmpdir(), hashFilePrefix + md5));
}

function shouldManifestUpdate() {
  clearConsole();
  console.log('Using ' + vendorManifestId + ' vendor build');
  if (!manifestExists()) {
    console.log('Vendor file needs to be created...');
    return true;
  }
  if (manifestExists() && manifestStale()) {
    console.log('Vendor file needs to be updated...');
    return true;
  }
  return false;
}
