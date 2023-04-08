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

const footerStyle = (theme: Theme) => ({
  fontFamily: 'sans-serif',
  color: theme.footer,
  marginTop: '0.5rem',
  flex: '0 0 auto',
});

type FooterPropsType = {|
  line1: string,
  line2?: string,
|};

function Footer(props: FooterPropsType) {
  const theme = useContext(ThemeContext);
  return (
    <div style={footerStyle(theme)}>
      {props.line1}
      <br />
      {props.line2}
    </div>
  );
}

export default Footer;
