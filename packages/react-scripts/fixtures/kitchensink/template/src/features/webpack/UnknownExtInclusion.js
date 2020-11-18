/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import aFileWithExtUnknown from './assets/aFileWithExt.unknown';

const text = aFileWithExtUnknown.includes('base64')
  ? atob(aFileWithExtUnknown.split('base64,')[1]).trim()
  : aFileWithExtUnknown;

const UnknownExtInclusion = () => (
  <a id="feature-unknown-ext-inclusion" href={text}>
    aFileWithExtUnknown
  </a>
);

export default UnknownExtInclusion;
