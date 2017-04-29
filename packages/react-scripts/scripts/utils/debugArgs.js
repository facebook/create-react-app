/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

const DEBUG_FLAGS = [
  /^debug$/,
  /^--inspect$/,
  /^--inspect-brk(=\d+)?$/,
];

module.exports = {
  _match: function _matchDebugFlags(args, onMatch) {
    for (var i in args) {
      if (args.hasOwnProperty(i)) {
        for (var j in DEBUG_FLAGS) {
          if (DEBUG_FLAGS.hasOwnProperty(j)) {
            if (args[i].match(DEBUG_FLAGS[j])) {
              onMatch(args[i]);
            }
          }
        }
      }
    }
  },
  getFrom: function getDebugFlags(args) {
    var matches = [];
    this._match(args, function addMatch(arg) {
      matches.push(arg);
    });
    return matches.length ? matches : null;
  },
  removeFrom: function removeDebugFlags(args) {
    var matches = this.getFrom(args) || [];
    return args.filter(function isNotDebugArg(arg) {
      return !matches.some(function isPresent(debugArg) {
        return arg === debugArg;
      });
    });
  },
};
