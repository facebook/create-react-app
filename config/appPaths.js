/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var path = require('path');

module.exports = function(relativePath) {
  
  // TODO: hide this behind a flag and eliminate dead code on eject.
  // This shouldn't be exposed to the user.
  var isInNodeModules = 'node_modules' ===
    path.basename(path.resolve(path.join(__dirname, '..', '..')));

  var srcPath = path.resolve(__dirname, relativePath, 'src');
  var nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  var indexHtmlPath = path.resolve(__dirname, relativePath, 'index.html');
  var faviconPath = path.resolve(__dirname, relativePath, 'favicon.ico');
  var buildPath = path.join(__dirname, isInNodeModules ? '../../..' : '..', 'build');

  return {
    srcPath: srcPath,
    nodeModulesPath: nodeModulesPath,
    indexHtmlPath: indexHtmlPath,
    faviconPath: faviconPath,
    buildPath: buildPath
  };
};
