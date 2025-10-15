/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOMClient from 'react-dom/client';
import { test, version } from 'test-integrity';
import LinkedModules from './LinkedModules';
import { flushSync } from 'react-dom';

describe('linked modules', () => {
  it('has integrity', () => {
    expect(test()).toBeTruthy();
    expect(version() === '2.0.0').toBeTruthy();
  });

  it('renders without crashing', () => {
    const div = document.createElement('div');
    flushSync(() => {
      ReactDOMClient.createRoot(div).render(<LinkedModules />);
    });
  });
});
