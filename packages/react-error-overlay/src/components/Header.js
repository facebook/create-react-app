/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* @flow */
import React, { useContext } from 'react';
import { ThemeContext } from '../iframeScript';
import type { Theme } from '../styles';

const headerStyle = (theme: Theme) => ({
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
|};

function Header(props: HeaderPropType) {
  const theme = useContext(ThemeContext);
  return <div style={headerStyle(theme)}>{props.headerText}</div>;
}

export default Header;
