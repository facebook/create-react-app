// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
// @remove-on-eject-end

var path = require('path');
var fs = require('fs');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
var appDirectory = fs.realpathSync(process.cwd());
function resolveApp(relativePath) {
  return path.resolve(appDirectory, relativePath);
}

// We support resolving modules according to `NODE_PATH`.
// This lets you use absolute paths in imports inside large monorepos:
// https://github.com/facebookincubator/create-react-app/issues/253.

// It works similar to `NODE_PATH` in Node itself:
// https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders

// We will export `nodePaths` as an array of absolute paths.
// It will then be used by Webpack configs.
// Jest doesn’t need this because it already handles `NODE_PATH` out of the box.

var nodePaths = (process.env.NODE_PATH || '')
  .split(process.platform === 'win32' ? ';' : ':')
  .filter(Boolean)
  .map(resolveApp);

// config after eject: we're in ./config/
module.exports = {
  appBuild: resolveApp('build'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveApp('src/index.js'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  yarnLockFile: resolveApp('yarn.lock'),
  testsSetup: resolveApp('src/setupTests.js'),
  appNodeModules: resolveApp('node_modules'),
  ownNodeModules: resolveApp('node_modules'),
  nodePaths: nodePaths
};

// @remove-on-eject-begin
function resolveOwn(relativePath) {
  return path.resolve(__dirname, relativePath);
}

// Set up module.exports depending on how react-scripts is run. The current
// path will contain `packages/react-scripts` when running from create-react-app.
// We don't make assumptions about the path when this package is installed from
// another app since it could've be renamed.
// Note that when installing this package using `npm link`, the current
// directory path contains `packages/react-scripts` (instead of, for example,
// `node_modules/react-scripts`). There is a specific condition to handle this
// case so that it doesn't conflict with other scripts (like `build` or
// `publish`) or running the smoke test.
var isRunningFromOwn = __dirname.indexOf(path.join('packages', 'react-scripts', 'config')) !== -1;
var isSmokeTest = process.argv.some(arg => arg.indexOf('--smoke-test') > -1);
var isRunningFromAppUsingLink = (process.env.npm_lifecycle_event === 'start') && isRunningFromOwn && !isSmokeTest

if (!isRunningFromOwn || isRunningFromAppUsingLink) {
  module.exports = {
    appBuild: resolveApp('build'),
    appPublic: resolveApp('public'),
    appHtml: resolveApp('public/index.html'),
    appIndexJs: resolveApp('src/index.js'),
    appPackageJson: resolveApp('package.json'),
    appSrc: resolveApp('src'),
    yarnLockFile: resolveApp('yarn.lock'),
    testsSetup: resolveApp('src/setupTests.js'),
    appNodeModules: resolveApp('node_modules'),
    // this is empty with npm3 but node resolution searches higher anyway:
    ownNodeModules: resolveOwn('../node_modules'),
    nodePaths: nodePaths
  };
} else {
  module.exports = {
    appBuild: resolveOwn('../../../build'),
    appPublic: resolveOwn('../template/public'),
    appHtml: resolveOwn('../template/public/index.html'),
    appIndexJs: resolveOwn('../template/src/index.js'),
    appPackageJson: resolveOwn('../package.json'),
    appSrc: resolveOwn('../template/src'),
    yarnLockFile: resolveOwn('../template/yarn.lock'),
    testsSetup: resolveOwn('../template/src/setupTests.js'),
    appNodeModules: resolveOwn('../node_modules'),
    ownNodeModules: resolveOwn('../node_modules'),
    nodePaths: nodePaths
  };
}
// @remove-on-eject-end
