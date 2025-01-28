/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ScssModulesInclusion from './ScssModulesInclusion';
import ReactDOMClient from 'react-dom/client';

describe('scss modules inclusion', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOMClient.createRoot(div).render(<ScssModulesInclusion />);
  });
});
