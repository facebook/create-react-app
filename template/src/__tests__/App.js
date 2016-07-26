/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/* global describe, it */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import App from '../App';

describe('<App />', () => {
  it('contains a "Welcome to React" header', () => {
    const wrapper = shallow(<App />);
    expect(wrapper.contains(<h2>Welcome to React</h2>)).to.equal(true);
  });
});
