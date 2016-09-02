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

function resolveApp(relativePath) {
  return path.resolve(relativePath);
}

// config after eject: we're in ./config/
module.exports = {
  appBuild: resolveApp('build'),
  appHtml: resolveApp('index.html'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appNodeModules: resolveApp('node_modules'),
  ownNodeModules: resolveApp('node_modules')
};

// @remove-on-eject-begin
function resolveOwn(relativePath) {
  return path.resolve(__dirname, relativePath);
}
// config before eject: we're in ./node_modules/react-scripts/config/
module.exports = {
  appBuild: resolveApp('build'),
  appHtml: resolveApp('index.html'),
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appNodeModules: resolveApp('node_modules'),
  // this is empty with npm3 but node resolution searches higher anyway:
  ownNodeModules: resolveOwn('../node_modules')
};
// @remove-on-eject-end

// @remove-on-publish-begin
module.exports = {
  appBuild: resolveOwn('../build'),
  appHtml: resolveOwn('../template/index.html'),
  appPackageJson: resolveOwn('../package.json'),
  appSrc: resolveOwn('../template/src'),
  appNodeModules: resolveOwn('../node_modules'),
  ownNodeModules: resolveOwn('../node_modules')
};
// @remove-on-publish-end
