// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

const path = require('path');
const fs = require('fs');

const globbySync = require('globby').sync;
const loadJsonFileSync = require('load-json-file').sync;
const ValidationError = require('@lerna/validation-error');
const Package = require('@lerna/package');
const PackageGraph = require('@lerna/package-graph');
const Project = require('@lerna/project');

function flattenResults(results) {
  return results.reduce((acc, result) => acc.concat(result), []);
}

// Sync version of Lerna's makeFileFinder
// Heavily inspired by https://github.com/lerna/lerna/blob/62843b04e3a5a03012ceabe465519b39a09fbcc1/core/project/lib/make-file-finder.js
function makeFileFinderSync(rootPath, packageConfigs) {
  const globOpts = {
    cwd: rootPath,
    absolute: true,
    followSymlinkedDirectories: false,
    // POSIX results always need to be normalized
    transform: fp => path.normalize(fp),
  };

  if (packageConfigs.some(cfg => cfg.indexOf('**') > -1)) {
    if (packageConfigs.some(cfg => cfg.indexOf('node_modules') > -1)) {
      throw new ValidationError(
        'EPKGCONFIG',
        'An explicit node_modules package path does not allow globstars (**)'
      );
    }

    globOpts.ignore = [
      // allow globs like "packages/**",
      // but avoid picking up node_modules/**/package.json
      '**/node_modules/**',
    ];
  }

  return (fileName, fileMapper, customGlobOpts) => {
    const options = Object.assign({}, customGlobOpts, globOpts);
    const packages = packageConfigs.sort().map(globPath => {
      const results = globbySync(path.join(globPath, fileName), options).sort();

      if (fileMapper) {
        return fileMapper(results);
      }

      return results;
    });

    // always flatten the results
    return flattenResults(packages);
  };
}

function getPackagesSync(project) {
  const mapper = packageConfigPath => {
    const packageJson = loadJsonFileSync(packageConfigPath);
    return new Package(
      packageJson,
      path.dirname(packageConfigPath),
      project.rootPath
    );
  };

  const finder = makeFileFinderSync(project.rootPath, project.packageConfigs);

  return finder('package.json', filePaths => filePaths.map(mapper));
}

module.exports.getAllLocalDependencies = function getAllLocalDependencies(
  appName
) {
  const project = new Project(process.cwd());
  const packages = getPackagesSync(project);
  const packageGraph = new PackageGraph(
    packages,
    'allDependencies',
    'forceLocal'
  );
  const currentNode = packageGraph.get(appName);
  if (!currentNode) {
    return undefined;
  }

  const dependencies = new Set(currentNode.localDependencies.keys());
  const dependenciesToExplore = new Set(dependencies);
  dependenciesToExplore.delete(appName);

  while (dependenciesToExplore.size > 0) {
    const packageName = dependenciesToExplore.values().next().value;
    dependenciesToExplore.delete(packageName);
    const node = packageGraph.get(packageName);
    const newDependencies = new Set(node.localDependencies.keys());
    newDependencies.delete(appName);

    for (const d of newDependencies.values()) {
      if (!dependencies.has(d)) {
        dependenciesToExplore.add(d);
        dependencies.add(d);
      }
    }
  }

  const additionalSrcPaths = Array.from(dependencies).map(dependencyName => {
    const resolvedPath = fs.realpathSync(
      packageGraph.get(dependencyName).location
    );
    return path.resolve(resolvedPath, 'src');
  });
  return additionalSrcPaths;
};
