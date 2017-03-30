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
'use strict';

const fs = require('fs-extra');
const path = require('path');
const paths = require('../config/paths');
const useYarn = fs.existsSync(paths.yarnLockFile);
const ownPackageName = require(path.join(__dirname, '..', 'package.json')).name;

let name;
let directory;

// component name is required
if (process.argv.length < 3) {
  console.log(
    `Usage: ${useYarn ? 'yarn' : 'npm run'} generate-component <component-name> [containing-directory]`
  );
  process.exit(1);
} else {
  name = process.argv[2];
  directory = process.argv.length > 3 ? process.argv[3] : '';
}

const componentPath = path.join(paths.appPath, 'src', directory, `${name}.js`);
const componentTestPath = path.join(
  paths.appPath,
  'src',
  directory,
  `${name}.test.js`
);

// if directory exists, respectfully bow out
if (directory && fs.existsSync(path.join(paths.appPath, 'src', directory))) {
  console.log(
    `Component directory src/${directory} exists. Cannot create component.`
  );
  process.exit(1);
}

// if component name exists, respectfully bow out
if (fs.existsSync(componentPath) || fs.existsSync(componentTestPath)) {
  console.log(
    `Component/test file with name \`${name}\` exists. Cannot create component.`
  );
  process.exit(1);
}

// create directory and set copyPath
let copyPath = path.join(paths.appPath, 'src');
if (directory) {
  copyPath = path.join(copyPath, directory);
  fs.mkdirSync(copyPath);
}

// copy files to copyPath
const templatePath = path.join(
  paths.appNodeModules,
  ownPackageName,
  'templates',
  'component'
);
const componentTemplatePath = path.join(templatePath, 'component.js');
const componentTestTemplatePath = path.join(templatePath, 'component.test.js');
fs.copySync(componentTemplatePath, componentPath);
fs.copySync(componentTestTemplatePath, componentTestPath);

// replace all instances of __component__ inside component.js and component.test.js with name
const componentFile = fs.readFileSync(componentPath, { encoding: 'utf8' });
const componentTestFile = fs.readFileSync(componentTestPath, {
  encoding: 'utf8',
});
fs.writeFileSync(componentPath, componentFile.replace(/__component__/g, name));
fs.writeFileSync(
  componentTestPath,
  componentTestFile.replace(/__component__/g, name)
);
