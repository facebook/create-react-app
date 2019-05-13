/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* @flow */
import React from 'react';

const navigationBarStyle = {
  marginBottom: '0.5rem',
};

const buttonContainerStyle = {
  marginRight: '1em',
};

const _navButtonStyle = {
  border: 'none',
  borderRadius: '4px',
  padding: '3px 6px',
  cursor: 'pointer',
};

const leftButtonStyle = theme => ({
  ..._navButtonStyle,
  backgroundColor: theme.navBackground,
  color: theme.navArrow,
  borderTopRightRadius: '0px',
  borderBottomRightRadius: '0px',
  marginRight: '1px',
});

const rightButtonStyle = theme => ({
  ..._navButtonStyle,
  backgroundColor: theme.navBackground,
  color: theme.navArrow,
  borderTopLeftRadius: '0px',
  borderBottomLeftRadius: '0px',
});

type Callback = () => void;

type NavigationBarPropsType = {|
  currentError: number,
  totalErrors: number,
  previous: Callback,
  next: Callback,
  theme: any,
|};

function NavigationBar(props: NavigationBarPropsType) {
  const { currentError, totalErrors, previous, next, theme } = props;
  return (
    <div style={navigationBarStyle}>
      <span style={buttonContainerStyle}>
        <button onClick={previous} style={leftButtonStyle(theme)}>
          ←
        </button>
        <button onClick={next} style={rightButtonStyle(theme)}>
          →
        </button>
      </span>
      {`${currentError} of ${totalErrors} errors on the page`}
    </div>
  );
}

export default NavigationBar;
