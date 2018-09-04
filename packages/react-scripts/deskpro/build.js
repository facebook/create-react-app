const chalk = require('chalk');
const printBuildError = require('react-dev-utils/printBuildError');
const path = require('path');
const paths = require('../config/paths');

const installer = require('./installer');
const docs = require('./docs');
const packager = require('./packager');
const manifest = require('./manifest');

module.exports = function(data) {
  return Promise.resolve(data)
    .then(
      () =>
        manifest.extractAndwrite(
          paths.appPackageJson,
          path.resolve(paths.appBuild, 'manifest.json')
        ),
      err => {
        console.log(chalk.red('Failed to write the deskpro app manifest.\n'));
        printBuildError(err);
        process.exit(1);
      }
    )
    .then(
      // bundle the installer
      () =>
        installer.useBundled
          ? installer.bundle(paths.deskproInstallerPackage, paths.appBuild)
          : null,
      err => {
        console.log(chalk.red('Failed to bundle the installer manifest.\n'));
        printBuildError(err);
        process.exit(1);
      }
    )
    .then(
      // bundle the docs
      () =>
        docs.bundle(path.resolve(paths.appPackageJson, '..'), paths.appBuild),
      err => {
        console.log(chalk.red('Failed to bundle application docs.\n'));
        console.log(err);
        printBuildError(err);
        process.exit(1);
      }
    )
    .then(
      // package the app
      () => packager(path.resolve(paths.appPackageJson, '..'), 'app.zip'),
      err => {
        console.log(chalk.red('Failed to package the app.\n'));
        printBuildError(err);
        process.exit(1);
      }
    );
};
