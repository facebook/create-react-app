/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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

type FooterPropsType = {|
  line1: string,
  line2?: string,
|};

function Footer(props: FooterPropsType) {
  return (
    <div style={footerStyle}>
      {props.line1}
      <br />
      {props.line2}
    </div>
  );
}

export default Footer;
