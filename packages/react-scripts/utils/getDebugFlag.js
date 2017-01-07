/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const DEBUG_FLAGS = [ 'debug', '--debug-brk', '--inspect' ];

module.exports = function getDebugFlag(argv) {
  for (var i in argv) {
    if (argv.hasOwnProperty(i)) {
      for (var j in DEBUG_FLAGS) {
        if (DEBUG_FLAGS.hasOwnProperty(j)) {
          if (argv[i] === DEBUG_FLAGS[j]) {
            return DEBUG_FLAGS[j];
          }
        }
      }
    }
  }
  return null;
}
