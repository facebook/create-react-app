// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

function detectMissingVendors(pathToPackageJson, pathToVendors) {
  const packageJson = require(pathToPackageJson);
  const dependencies = Object.keys(packageJson.dependencies || {})
    .concat(Object.keys(packageJson.devDependencies || {}))
    .concat(Object.keys(packageJson.peerDependencies || {}));
  const vendors = fs.existsSync(pathToVendors) ? require(pathToVendors) : [];
  const missingVendors = vendors.filter(
    vendor => dependencies.indexOf(vendor) === -1
  );
  if (missingVendors.length > 0) {
    throw new Error(
      'Error: Unknown vendors: ' +
        chalk.yellow(missingVendors) +
        " should be listed in the project's dependencies.\n" +
        `(Vendors defined in '${path.resolve(pathToVendors)}')`
    );
  }
}

module.exports = detectMissingVendors;
