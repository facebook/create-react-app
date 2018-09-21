#!/usr/bin/env node
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';
const path = require('path');
const args = process.argv;
console.log(args);
const execFileSync = require('child_process').execFileSync;
const result = execFileSync(path.join(__dirname, 'react-scripts-macos'), args);
console.log(result.toString());
