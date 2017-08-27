/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/* @flow */
import React from 'react';
import { red, redTransparent } from '../styles';

const navigationBarStyle = {
  marginBottom: '0.5rem',
};

const buttonContainerStyle = {
  marginRight: '1em',
};

const _navButtonStyle = {
  backgroundColor: redTransparent,
  color: red,
  border: 'none',
  borderRadius: '4px',
  padding: '3px 6px',
  cursor: 'pointer',
};

const leftButtonStyle = {
  ..._navButtonStyle,
  borderTopRightRadius: '0px',
  borderBottomRightRadius: '0px',
  marginRight: '1px',
};

const rightButtonStyle = {
  ..._navButtonStyle,
  borderTopLeftRadius: '0px',
  borderBottomLeftRadius: '0px',
};

type Callback = () => void;

type NavigationBarPropsType = {|
  currentError: number,
  totalErrors: number,
  previous: Callback,
  next: Callback,
|};

function NavigationBar(props: NavigationBarPropsType) {
  const { currentError, totalErrors, previous, next } = props;
  return (
    <div style={navigationBarStyle}>
      <span style={buttonContainerStyle}>
        <button onClick={previous} style={leftButtonStyle}>
          ←
        </button>
        <button onClick={next} style={rightButtonStyle}>
          →
        </button>
      </span>
      {`${currentError} of ${totalErrors} errors on the page`}
    </div>
  );
}

export default NavigationBar;
