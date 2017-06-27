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

  // Add more helpful message for UglifyJs error
  if (typeof message === 'string' && message.indexOf('from UglifyJs') !== -1) {
    try {
      console.log(
        'Failed to minify the code from \n\n',
        chalk.yellow(
          /Unexpected token:(.+)\[(.+)\]\[(.+)\]/.exec(err.stack)[2]
        ),
        '\n'
      );
    } catch (e) {
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
