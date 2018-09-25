/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';

describe('node_modules compile', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    return import('./NodeModulesCompilation').then(
      ({ default: NodeModulesCompilation }) => {
        return new Promise(resolve => {
          ReactDOM.render(<NodeModulesCompilation onReady={resolve} />, div);
        });
      }
    );
  });
});
