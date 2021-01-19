/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import aFileWithoutExt from './assets/aFileWithoutExt';

const text = aFileWithoutExt.includes('base64')
  ? atob(aFileWithoutExt.split('base64,')[1]).trim()
  : aFileWithoutExt;

const NoExtInclusion = () => (
  <a id="feature-no-ext-inclusion" href={text}>
    aFileWithoutExt
  </a>
);

export default NoExtInclusion;
