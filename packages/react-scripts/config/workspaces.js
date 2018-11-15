const fse = require('fs-extra');
const path = require('path');
const findUp = require('find-up');
const glob = require('glob');

const loadPackageJson = packagePath => {
  try {
    const packageObj = fse.readJsonSync(packagePath);
    return packageObj;
  } catch (err) {
    throw err;
  }
};

const getWorkspacesRootConfig = dir => {
  const packageJsonUp = findUp.sync('package.json', { cwd: dir });

  if (packageJsonUp === null) {
    return false;
  }

  const packageObj = loadPackageJson(packageJsonUp);

  if (Reflect.has(packageObj, 'workspaces')) {
    const workspacesConfig = {
      root: path.dirname(packageJsonUp),
      paths: packageObj.workspaces,
    };
    return workspacesConfig;
  }

  const dirUp = path.dirname(dir);
  return getWorkspacesRootConfig(dirUp);
};

const getPackagePaths = workspaces => {
  const packageList = [];

  workspaces.paths.forEach(workspace => {
    const workspaceDir = path.dirname(workspace);
    const workspaceAbsDir = path.join(workspaces.root, workspaceDir);
    const packageJsonGlob = path.join('**!(node_modules)', 'package.json');
    const packageJsonAbsPaths = glob
      .sync(packageJsonGlob, { cwd: workspaceAbsDir })
      .map(pkgPath => path.join(workspaceAbsDir, pkgPath));

    packageList.push(...packageJsonAbsPaths);
  });

  return packageList;
};

const resolveBabelLoaderPaths = workspaces => {
  const packageJsonPaths = getPackagePaths(workspaces);

  const babelLoaderPaths = packageJsonPaths.filter(absPkgPath => {
    const packageJson = loadPackageJson(absPkgPath);
    const hasMainDev = Reflect.has(packageJson, 'main:dev');

    if (hasMainDev) {
      const mainDevPath = path.dirname(packageJson['main:dev']);
      const packageAbsDir = path.dirname(absPkgPath);
      const absDevPath = path.join(packageAbsDir, mainDevPath);
      return absDevPath;
    }
  });

  return babelLoaderPaths;
};

const resolve = appDirectory => {
  const nill = [];

  const workspaces = getWorkspacesRootConfig(appDirectory);

  if (workspaces.length === 0) {
    return nill;
  }

  const babelLoaderPaths = resolveBabelLoaderPaths(workspaces);

  if (babelLoaderPaths === 0) {
    return nill;
  }

  return babelLoaderPaths;
};

module.exports = {
  resolve,
};
