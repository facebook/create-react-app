/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import SvgComponent, { SvgComponentWithRef } from './SvgComponent';

describe('svg component', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<SvgComponent />, div);
    expect(div.textContent).toBe('logo.svg');
  });

  it('svg root element equals the passed ref', () => {
    const div = document.createElement('div');
    const someRef = React.createRef();
    ReactDOM.render(<SvgComponentWithRef ref={someRef} />, div);
    const svgElement = div.getElementsByTagName('svg');
    expect(svgElement).toHaveLength(1);
    expect(svgElement[0]).toBe(someRef.current);
  });
});
