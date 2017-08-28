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
import { black } from '../styles';

const closeButtonStyle = {
  color: black,
  lineHeight: '1rem',
  fontSize: '1.5rem',
  padding: '1rem',
  cursor: 'pointer',
  position: 'absolute',
  right: 0,
  top: 0,
};

type CloseCallback = () => void;
function CloseButton({ close }: {| close: CloseCallback |}) {
  return (
    <span
      title="Click or press Escape to dismiss."
      onClick={close}
      style={closeButtonStyle}
    >
      ×
    </span>
  );
}

export default CloseButton;
