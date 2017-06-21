/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/* @flow */
function isInternalFile(sourceFileName: ?string, fileName: ?string) {
  return sourceFileName == null ||
    sourceFileName === '' ||
    sourceFileName.indexOf('/~/') !== -1 ||
    sourceFileName.indexOf('/node_modules/') !== -1 ||
    sourceFileName.trim().indexOf(' ') !== -1 ||
    fileName == null ||
    fileName === '';
}

export { isInternalFile };
