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

module.exports = chunks => (left, right) => {
  var leftIndex = chunks.indexOf(left.names[0]);
  var rightindex = chunks.indexOf(right.names[0]);

  // If the right entry isn't in the chunks array
  // ie an element of the array which is being sorted
  // isn't in the array given in params
  if (rightindex < 0) {
    // keep the order of the left element and of the right element
    // because if the element isn't in the array chunks,
    // it should be at the end of the array
    return -1;
  }

  // If the left entry isn't in the chunks array
  // ie an element of the array which is being sorted
  // isn't in the array given in params
  if (leftIndex < 0) {
    // invert the order of the left element and of the right element
    // because if the element isn't in the array chunks,
    // it should be at the end of the array
    return 1;
  }

  // Invert the order if the left element is
  // after the right element in the array chunks
  if (leftIndex > rightindex) {
    return 1;
  }

  // Keep the order
  return -1;
};
