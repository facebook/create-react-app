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
import { darkGray } from '../styles';

const footerStyle = {
  fontFamily: 'sans-serif',
  color: darkGray,
  marginTop: '0.5rem',
  flex: '0 0 auto',
};

function Footer() {
  return (
    <div style={footerStyle}>
      This screen is visible only in development. It will not appear if the app crashes in production.
      <br />
      Open your browser’s developer console to further inspect this error.
    </div>
  );
}

export default Footer;
