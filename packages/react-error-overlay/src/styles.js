/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* @flow */
const lightTheme = {
  background: 'white',
  color: 'black',
  headerColor: '#ce1126',
  primaryPreBackground: 'rgba(206, 17, 38, 0.05)',
  primaryPreColor: 'inherit',
  secondaryPreBackground: 'rgba(251, 245, 180, 0.3)',
  secondaryPreColor: 'inherit',
  footer: '#878e91',
  anchorColor: '#878e91',
  toggleColor: '#878e91',
  closeColor: '#293238',
  primaryErrorBackground: '#fccfcf',
  secondaryErrorBackground: '#fbf5b4',
};

const darkTheme = {
  background: '#353535',
  color: 'white',
  headerColor: '#fccfcf',
  primaryPreBackground: 'rgba(206, 17, 38, 0.15)',
  primaryPreColor: '#fccfcf',
  secondaryPreBackground: 'rgba(251, 245, 180, 0.3)',
  secondaryPreColor: '#fbf5b4',
  footer: '#878e91',
  anchorColor: '#878e91',
  toggleColor: '#878e91',
  closeColor: '#293238',
  primaryErrorBackground: '#fccfcf',
  secondaryErrorBackground: '#fbf5b4',
};

const black = '#293238',
  darkGray = '#878e91',
  red = '#ce1126',
  redTransparent = 'rgba(206, 17, 38, 0.05)',
  lightRed = '#fccfcf',
  strongRedTransparent = 'rgba(206, 17, 38, 0.15)',
  yellow = '#fbf5b4',
  yellowTransparent = 'rgba(251, 245, 180, 0.3)',
  white = '#ffffff';

const iframeStyle = {
  position: 'fixed',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  border: 'none',
  'z-index': 2147483647,
};

const overlayStyle = theme => ({
  width: '100%',
  height: '100%',
  'box-sizing': 'border-box',
  'text-align': 'center',
  'background-color': theme.background,
});

export {
  iframeStyle,
  overlayStyle,
  black,
  darkGray,
  lightRed,
  strongRedTransparent,
  red,
  redTransparent,
  yellow,
  yellowTransparent,
  white,
  lightTheme,
  darkTheme,
};
