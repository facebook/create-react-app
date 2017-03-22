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

const name = process.argv[2];
const directory = process.arg[3];
const useYarn = fs.existsSync(paths.yarnLockFile);

// component name is required
if (!name) {
  console.log(
    `Usage: ${useYarn ? 'yarn' : 'npm'} run generate-component <component-name> [containing-directory]`
  );
  process.exit(1);
}

// create directory in src/ if directory is set
if (directory) {
}

// copy files from templates/component to src/[directory/]

// replace all instances of __component__ inside component.js and component.test.js with name
