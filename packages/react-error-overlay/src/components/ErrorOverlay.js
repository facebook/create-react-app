/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* @flow */
import React, { useContext, useEffect } from 'react';
import { ThemeContext } from '../iframeScript';

import type { Node as ReactNode } from 'react';
import type { Theme } from '../styles';

const overlayStyle = (theme: Theme) => ({
  position: 'relative',
  display: 'inline-flex',
  flexDirection: 'column',
  height: '100%',
  width: '1024px',
  maxWidth: '100%',
  overflowX: 'hidden',
  overflowY: 'auto',
  padding: '0.5rem',
  boxSizing: 'border-box',
  textAlign: 'left',
  fontFamily: 'Consolas, Menlo, monospace',
  fontSize: '11px',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  lineHeight: 1.5,
  color: theme.color,
});

type ErrorOverlayPropsType = {|
  children: ReactNode,
  shortcutHandler?: (eventKey: string) => void,
|};

let iframeWindow: window = null;

function ErrorOverlay(props: ErrorOverlayPropsType) {
  const theme = useContext(ThemeContext);

  const getIframeWindow = (element: ?HTMLDivElement) => {
    if (element) {
      const document = element.ownerDocument;
      iframeWindow = document.defaultView;
    }
  };
  const { shortcutHandler } = props;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (shortcutHandler) {
        shortcutHandler(e.key);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    if (iframeWindow) {
      iframeWindow.addEventListener('keydown', onKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (iframeWindow) {
        iframeWindow.removeEventListener('keydown', onKeyDown);
      }
    };
  }, [shortcutHandler]);

  return (
    <div style={overlayStyle(theme)} ref={getIframeWindow}>
      {props.children}
    </div>
  );
}

export default ErrorOverlay;
