/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Currently, files passed without an extension are assumed to be js-like.
// If other types of files need to be passed later without extensions the
// checkRequiredFiles function will need to be modified.
const fallbackExts = [
  '.js',
  '.web.js',
  '.mjs',
  '.web.jsx',
  '.jsx',
  '.ts',
  '.tsx',
];
const withExt = (ext, file) => file.dir + path.sep + file.name + ext;

function checkRequiredFiles(files) {
  let didFallbackExts;
  try {
    for (const filePath of files) {
      didFallbackExts = false;
      const file = path.parse(filePath);

      if (file.ext === '') {
        didFallbackExts = true;
        if (fallbackExts.some(e => fs.existsSync(withExt(e, file)))) {
          continue;
        } else {
          throw file;
        }
      } else if (!fs.existsSync(filePath)) {
        throw file;
      }
    }
    return true;
  } catch (file) {
    console.log(chalk.red('Could not find a required file.'));
    console.log(chalk.red('  Name: ') + chalk.cyan(file.base));
    if (didFallbackExts) {
      // Typescript files will pass the check but are not officially supported.
      const extStr = fallbackExts.filter(e => /\.(?!tsx?)/.test(e)).join(', ');
      console.log(chalk.red('  Supported extensions: ') + chalk.cyan(extStr));
    }
    console.log(chalk.red('  Searched in: ') + chalk.cyan(file.dir));
    return false;
  }
}

module.exports = checkRequiredFiles;
