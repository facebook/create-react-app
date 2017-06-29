/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

const get = require('lodash/get');
const chalk = require('chalk');

module.exports = function formatBuildError(err) {
  const message = get(err, 'message');
  const stack = get(err, 'stack');

  // Add more helpful message for UglifyJs error
  if (
    stack &&
    typeof message === 'string' &&
    message.indexOf('from UglifyJs') !== -1
  ) {
    try {
      const matched = /Unexpected token:(.+)\[(.+)\:(.+)\,(.+)\]\[.+\]/.exec(
        stack
      );
      if (!matched) {
        throw new Error(
          "The regex pattern is not matched. Maybe UglifyJs changed it's message?"
        );
      }
      const problemPath = matched[2];
      const line = matched[3];
      const column = matched[4];
      console.log(
        'Failed to minify the code from this file: \n\n',
        chalk.yellow(`${problemPath} line ${line}:${column}`),
        '\n'
      );
    } catch (ignored) {
      console.log('Failed to minify the code.', err);
    }
    console.log(
      'Please check your dependencies for any untranspiled es6 code and raise an issue with \n' +
        'the author. \n' +
        '\nIf you need to use the module right now, you can try placing the source in ./src \n' +
        'and we will transpile it for you.'
    );
  } else {
    console.log((message || err) + '\n');
  }
};
