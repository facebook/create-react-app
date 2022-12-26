/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';

describe('promises', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    return import('./Promises').then(({ default: Promises }) => {
      return new Promise(resolve => {
        ReactDOM.render(<Promises onReady={resolve} />, div);
      });
    });
  });
});
