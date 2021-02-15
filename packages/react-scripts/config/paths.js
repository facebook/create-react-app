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
const chalk = require("chalk");
const error = console.error;

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const moduleFileExtensions = [
  'web.mjs',
  'mjs',
  'web.js',
  'js',
  'web.ts',
  'ts',
  'web.tsx',
  'tsx',
  'json',
  'web.jsx',
  'jsx',
];

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find(extension =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

const magicConfig = (() => {
  try {
    return require(resolveApp('magic.config.js'));
  }
  catch (e) {
    error(chalk.red(`Magic requires a config file ${chalk.bgRed.white.underline('(magic.config.js)')} in order to work.`));
    process.exit(0);
  }
})();

const appEntries = Object.keys(magicConfig.entry).reduce((prevValue, currentValue) => {
  return {
    ...prevValue,
    [currentValue]: resolveApp(`resources/${magicConfig.entry[currentValue]}`),
  };
}, {});

const resolveOwn = relativePath => path.resolve(__dirname, '..', relativePath);
const theme = path.basename(appDirectory);

// config before eject: we're in ./node_modules/react-scripts/config/
module.exports = {
  dotenv: resolveApp('.env'),
  appPath: resolveApp('resources'),
  appBuild: magicConfig.outputPath ? resolveApp(magicConfig.outputPath) : resolveApp('public/resources'),
  appPublic: resolveApp('public/resources'),
  appEntries: appEntries,
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('resources'),
  appTsConfig: resolveApp('tsconfig.json'),
  appJsConfig: resolveApp('jsconfig.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  testsSetup: resolveModule(resolveApp, 'resources/setupTests'),
  appNodeModules: resolveApp('node_modules'),
  publicUrlOrPath: `/themes/custom/${theme}/public/resources/`,
  ownPath: resolveOwn('.'),
  ownNodeModules: resolveOwn('node_modules'), // This is empty on npm 3
  appTypeDeclarations: resolveApp('resources/react-app-env.d.ts'),
  ownTypeDeclarations: resolveOwn('lib/react-app.d.ts'),
};

const ownPackageJson = require('../package.json');

module.exports.moduleFileExtensions = moduleFileExtensions;
module.exports.magicConfig = magicConfig;
module.exports.resolveApp = resolveApp;
