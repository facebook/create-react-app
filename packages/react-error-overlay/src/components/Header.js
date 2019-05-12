/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* @flow */
import React from 'react';

const headerStyle = theme => ({
  fontSize: '2em',
  fontFamily: 'sans-serif',
  color: theme.headerColor,
  whiteSpace: 'pre-wrap',
  // Top bottom margin spaces header
  // Right margin revents overlap with close button
  margin: '0 2rem 0.75rem 0',
  flex: '0 0 auto',
  maxHeight: '50%',
  overflow: 'auto',
});

type HeaderPropType = {|
  headerText: string,
  theme: any,
|};

function Header(props: HeaderPropType) {
  return <div style={headerStyle(props.theme)}>{props.headerText}</div>;
}

export default Header;
