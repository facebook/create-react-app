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
import { red } from '../styles';

const headerStyle = {
  fontSize: '2em',
  fontFamily: 'sans-serif',
  color: red,
  whiteSpace: 'pre-wrap',
  // Top bottom margin spaces header
  // Right margin revents overlap with close button
  margin: '0 2rem 0.75rem 0',
  flex: '0 0 auto',
  maxHeight: '50%',
  overflow: 'auto',
};

function Header({ name, message }: { name: string, message: string }) {
  // Make message prettier
  let finalMessage = message.match(/^\w*:/) || !name
    ? message
    : name + ': ' + message;

  finalMessage = finalMessage
    // TODO: maybe remove this prefix from fbjs?
    // It's just scaring people
    .replace(/^Invariant Violation:\s*/, '')
    // This is not helpful either:
    .replace(/^Warning:\s*/, '')
    // Break the actionable part to the next line.
    // AFAIK React 16+ should already do this.
    .replace(' Check the render method', '\n\nCheck the render method')
    .replace(' Check your code at', '\n\nCheck your code at');

  return (
    <div style={headerStyle}>
      {finalMessage}
    </div>
  );
}

export default Header;
