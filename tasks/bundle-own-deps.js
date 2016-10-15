#!/usr/bin/env node
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

// Like bundle-deps, this script modifies packages/react-scripts/package.json,
// copying own dependencies (those in the `packages` dir) to bundledDependencies

const fs = require('fs');
const path = require('path');

const packagesDir = path.join(__dirname, '../packages');
const pkgFilename = path.join(packagesDir, 'react-scripts/package.json');
const data = require(pkgFilename);

data.bundledDependencies = fs.readdirSync(packagesDir)
  .filter((name) => data.dependencies[name]);

fs.writeFile(pkgFilename, JSON.stringify(data, null, 2), 'utf8', (err) => {
  if (err) throw err;
  console.log('bundled ' + data.bundledDependencies.length + ' dependencies.');
});
