/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import ArrayDestructuring from './ArrayDestructuring';

describe('array destructuring', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    return new Promise(resolve => {
      ReactDOM.render(<ArrayDestructuring onReady={resolve} />, div);
    });
  });
});
