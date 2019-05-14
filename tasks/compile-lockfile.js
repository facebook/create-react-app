#!/usr/bin/env node
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const cprocess = require('child_process');
const fse = require('fs-extra');
const os = require('os');
const path = require('path');

const temp = path.join(os.tmpdir(), `cra-compile-lockfile`);

try {
  // Ensures that we start from a clean state
  fse.removeSync(temp);
  fse.mkdirSync(temp);

  // Create an empty package.json that we'll populate
  fse.writeFileSync(path.join(temp, 'package.json'), '{}');

  // Extract the dependencies from react-scripts (which is a workspace)
  const dependencies = require('react-scripts/package.json').dependencies;
  const descriptors = Object.keys(dependencies).map(
    dep => `${dep}@${dependencies[dep]}`
  );

  // Run "yarn add" with all the dependencies of react-scripts
  cprocess.execFileSync('yarn', ['add', ...descriptors], { cwd: temp });

  // Store the generated lockfile in create-react-app
  // We can't store it inside react-scripts, because we need it even before react-scripts is installed
  fse.copySync(
    path.join(temp, 'yarn.lock'),
    path.join(
      __dirname,
      '..',
      'packages',
      'create-react-app',
      'yarn.lock.cached'
    )
  );
} finally {
  fse.removeSync(temp);
}
