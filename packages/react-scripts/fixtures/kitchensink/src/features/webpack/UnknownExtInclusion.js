/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from 'react'
import aFileWithExtUnknown from './assets/aFileWithExt.unknown'

const text = aFileWithExtUnknown.includes('base64')
  ? atob(aFileWithExtUnknown.split('base64,')[1]).trim()
  : aFileWithExtUnknown

export default () => (
  <a id="feature-unknown-ext-inclusion" href={text}>aFileWithExtUnknown</a>
)
