/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from 'react'
import aFileWithoutExt from './assets/aFileWithoutExt'

const text = aFileWithoutExt.includes('base64')
  ? atob(aFileWithoutExt.split('base64,')[1]).trim()
  : aFileWithoutExt

export default () => (
  <a id="feature-no-ext-inclusion" href={text}>aFileWithoutExt</a>
)
