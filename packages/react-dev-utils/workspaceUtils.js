/**
 * Copyright (c) 2018-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';
const fs = require('fs');
const path = require('path');
const findPkg = require('find-pkg');
const globby = require('globby');

const findPkgs = (rootPath, globPatterns) => {
  if (!globPatterns) {
    return [];
  }
  const globOpts = {
    cwd: rootPath,
    strict: true,
    absolute: true,
  };
  return globPatterns
    .reduce(
      (pkgs, pattern) =>
        pkgs.concat(globby.sync(path.join(pattern, 'package.json'), globOpts)),
      []
    )
    .map(f => path.dirname(path.normalize(f)));
};

const findMonorepo = appDir => {
  const appPkg = JSON.parse(
    fs.readFileSync(path.resolve(appDir, 'package.json'))
  );
  const monoPkgPath = findPkg.sync(path.resolve(appDir, '..'));
  const monoPkg = monoPkgPath && require(monoPkgPath);
  const workspaces = monoPkg && monoPkg.workspaces;
  const patterns = (workspaces && workspaces.packages) || workspaces;
  const isYarnWs = Boolean(patterns);
  const srcPatterns = appPkg && appPkg.sourceWorkspaces;
  const allPkgs = patterns && findPkgs(path.dirname(monoPkgPath), patterns);
  const allSrcPkgs =
    srcPatterns && findPkgs(path.dirname(monoPkgPath), srcPatterns);
  const isIncluded = dir => allPkgs && allPkgs.indexOf(dir) !== -1;
  const isAppIncluded = isIncluded(appDir);
  const srcPkgPaths = allSrcPkgs
    ? allSrcPkgs.filter(f => fs.realpathSync(f) !== appDir)
    : [];

  return {
    isAppIncluded,
    isYarnWs,
    srcPkgPaths,
  };
};

module.exports = {
  findMonorepo,
};
