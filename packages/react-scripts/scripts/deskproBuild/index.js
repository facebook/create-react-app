const chalk = require('chalk');
const printBuildError = require('react-dev-utils/printBuildError');
const path = require('path');
const paths = require('../../config/paths');
const createManifest = require('./createManifest');
const bundleInstaller = require('./bundleInstaller');
const bundleDocs = require('./bundleDocs');
const packageApp = require('./packageApp');

module.exports = function(data) {
  return Promise.resolve(data)
    .then(
      () =>
        createManifest(
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
        bundleInstaller(
          path.resolve(
            paths.appPackageJson,
            '..',
            'node_modules',
            '@deskpro',
            'apps-installer'
          ),
          paths.appBuild
        ),
      err => {
        console.log(chalk.red('Failed to write the deskpro app manifest.\n'));
        printBuildError(err);
        process.exit(1);
      }
    )
    .then(
      // bundle the docs
      () =>
        bundleDocs(path.resolve(paths.appPackageJson, '..'), paths.appBuild),
      err => {
        console.log(chalk.red('Failed to write the deskpro app manifest.\n'));
        printBuildError(err);
        process.exit(1);
      }
    )
    .then(
      // package the app
      () => packageApp(path.resolve(paths.appPackageJson, '..'), 'app.zip'),
      err => {
        console.log(chalk.red('Failed to write the deskpro app manifest.\n'));
        printBuildError(err);
        process.exit(1);
      }
    );
};
