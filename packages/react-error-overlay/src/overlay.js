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
import ReactDOM from 'react-dom';
import {
  register as registerError,
  unregister as unregisterError,
} from './effects/unhandledError';
import {
  register as registerPromise,
  unregister as unregisterPromise,
} from './effects/unhandledRejection';
import {
  register as registerStackTraceLimit,
  unregister as unregisterStackTraceLimit,
} from './effects/stackTraceLimit';
import {
  permanentRegister as permanentRegisterConsole,
  registerReactStack,
  unregisterReactStack,
} from './effects/proxyConsole';
import { massage as massageWarning } from './utils/warnings';
import { iframeStyle, overlayStyle } from './styles';
import { applyStyles } from './utils/dom/css';
import getStackFrames from './utils/getStackFrames';
import ErrorOverlay from './components/ErrorOverlay';

const CONTEXT_SIZE: number = 3;

let errorRecords = [];

let container: HTMLDivElement | null = null;
let iframeReference: HTMLIFrameElement | null = null;

// Mount overlay container
function mount(callback) {
  iframeReference = window.document.createElement('iframe');
  applyStyles(iframeReference, iframeStyle);
  iframeReference.onload = () => {
    if (iframeReference == null) {
      return;
    }
    const document = iframeReference.contentDocument;
    if (document != null && document.body != null) {
      document.body.style.margin = '0';
      // Keep popup within body boundaries for iOS Safari
      // $FlowFixMe
      document.body.style['max-width'] = '100vw';
      container = document.createElement('div');
      applyStyles(container, overlayStyle);
      (document.body: any).appendChild(container);
      callback();
    }
  };
  window.document.body.appendChild(iframeReference);
}

// Unmount overlay container
function unmount() {
  ReactDOM.unmountComponentAtNode(container);
  if (iframeReference === null) {
    return;
  }
  window.document.body.removeChild(iframeReference);
  iframeReference = null;
  container = null;
  errorRecords = [];
}

function render() {
  ReactDOM.render(
    <ErrorOverlay errorRecords={errorRecords} close={unmount} />,
    container
  );
}

function crash(error: Error, unhandledRejection = false) {
  if (module.hot && typeof module.hot.decline === 'function') {
    module.hot.decline();
  }

  getStackFrames(error, unhandledRejection, CONTEXT_SIZE)
    .then(stackFrames => {
      if (stackFrames == null) {
        return;
      }
      errorRecords = [
        ...errorRecords,
        {
          error,
          unhandledRejection,
          contextSize: CONTEXT_SIZE,
          stackFrames,
        },
      ];

      if (errorRecords.length > 0) {
        if (container == null) {
          mount(() => render());
        } else {
          render();
        }
      }
    })
    .catch(e => {
      console.log('Could not get the stack frames of error:', e);
    });
}

function inject() {
  registerError(window, error => crash(error));
  registerPromise(window, error => crash(error, true));
  registerStackTraceLimit();

  registerReactStack();
  permanentRegisterConsole('error', (warning, stack) => {
    const data = massageWarning(warning, stack);
    crash(
      // $FlowFixMe
      {
        message: data.message,
        stack: data.stack,
        __unmap_source: '/static/js/bundle.js',
      },
      false
    );
  });
}

function uninject() {
  unregisterStackTraceLimit();
  unregisterPromise(window);
  unregisterError(window);
  unregisterReactStack();
}

export { inject, uninject };
