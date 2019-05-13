/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* @flow */
import React from 'react';
import type { Theme } from '../styles';

const closeButtonStyle = (theme: Theme) => ({
  color: theme.closeColor,
  lineHeight: '1rem',
  fontSize: '1.5rem',
  padding: '1rem',
  cursor: 'pointer',
  position: 'absolute',
  right: 0,
  top: 0,
});

type CloseCallback = () => void;
function CloseButton({
  close,
  theme,
}: {|
  close: CloseCallback,
  theme: Theme,
|}) {
  return (
    <span
      title="Click or press Escape to dismiss."
      onClick={close}
      style={closeButtonStyle(theme)}
    >
      ×
    </span>
  );
}

export default CloseButton;
