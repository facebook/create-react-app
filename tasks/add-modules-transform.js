#!/usr/bin/env node
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const packageFile = path.join(process.cwd(), 'package.json');

const file = fs.readFileSync(packageFile);
const data = JSON.parse(file);

if (data.babel == null) {
  data.babel = { plugins: ['@babel/plugin-transform-modules-commonjs'] };
} else if (data.babel.plugins == null) {
  data.babel.plugins = ['@babel/plugin-transform-modules-commonjs'];
} else {
  data.babel.plugins.push('@babel/plugin-transform-modules-commonjs');
}

fs.writeFile(packageFile, JSON.stringify(data, null, 2), 'utf8', err => {
  if (err) {
    throw err;
  }
  console.log('Added module transform');
});
