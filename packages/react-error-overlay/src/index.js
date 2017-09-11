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
import type { Element } from 'react';
import ReactDOM from 'react-dom';
import CompileErrorContainer from './containers/CompileErrorContainer';
import RuntimeErrorContainer from './containers/RuntimeErrorContainer';
import { listenToRuntimeErrors } from './listenToRuntimeErrors';
import { iframeStyle, overlayStyle } from './styles';
import { applyStyles } from './utils/dom/css';

import type { ErrorRecord } from './listenToRuntimeErrors';

type RuntimeReportingOptions = {|
  onError: () => void,
  launchEditorEndpoint: string,
  filename?: string,
|};

let iframe: null | HTMLIFrameElement = null;
let isLoadingIframe: boolean = false;

let renderedElement: null | Element<any> = null;
let currentBuildError: null | string = null;
let currentRuntimeErrorRecords: Array<ErrorRecord> = [];
let currentRuntimeErrorOptions: null | RuntimeReportingOptions = null;
let stopListeningToRuntimeErrors: null | (() => void) = null;

export function reportBuildError(error: string) {
  currentBuildError = error;
  update();
}

export function dismissBuildError() {
  currentBuildError = null;
  update();
}

export function startReportingRuntimeErrors(options: RuntimeReportingOptions) {
  if (stopListeningToRuntimeErrors !== null) {
    throw new Error('Already listening');
  }
  currentRuntimeErrorOptions = options;
  listenToRuntimeErrors(errorRecord => {
    try {
      if (typeof options.onError === 'function') {
        options.onError.call(null);
      }
    } finally {
      handleRuntimeError(errorRecord);
    }
  }, options.filename);
}

function handleRuntimeError(errorRecord) {
  if (
    currentRuntimeErrorRecords.some(({ error }) => error === errorRecord.error)
  ) {
    // Deduplicate identical errors.
    // This fixes https://github.com/facebookincubator/create-react-app/issues/3011.
    return;
  }
  currentRuntimeErrorRecords = currentRuntimeErrorRecords.concat([errorRecord]);
  update();
}

function dismissRuntimeErrors() {
  currentRuntimeErrorRecords = [];
  update();
}

export function stopReportingRuntimeErrors() {
  if (stopListeningToRuntimeErrors === null) {
    throw new Error('Not currently listening');
  }
  currentRuntimeErrorOptions = null;
  try {
    stopListeningToRuntimeErrors();
  } finally {
    stopListeningToRuntimeErrors = null;
  }
}

function update() {
  renderedElement = render();
  // Loading iframe can be either sync or async depending on the browser.
  if (isLoadingIframe) {
    // Iframe is loading.
    // First render will happen soon--don't need to do anything.
    return;
  }
  if (iframe) {
    // Iframe has already loaded.
    // Just update it.
    updateIframeContent();
    return;
  }
  // We need to schedule the first render.
  isLoadingIframe = true;
  const loadingIframe = window.document.createElement('iframe');
  applyStyles(loadingIframe, iframeStyle);
  loadingIframe.onload = function() {
    const iframeDocument = loadingIframe.contentDocument;
    if (iframeDocument != null && iframeDocument.body != null) {
      iframeDocument.body.style.margin = '0';
      // Keep popup within body boundaries for iOS Safari
      iframeDocument.body.style['max-width'] = '100vw';
      const iframeRoot = iframeDocument.createElement('div');
      applyStyles(iframeRoot, overlayStyle);
      iframeDocument.body.appendChild(iframeRoot);

      // Ready! Now we can update the UI.
      iframe = loadingIframe;
      isLoadingIframe = false;
      updateIframeContent();
    }
  };
  const appDocument = window.document;
  appDocument.body.appendChild(loadingIframe);
}

function render() {
  if (currentBuildError) {
    return <CompileErrorContainer error={currentBuildError} />;
  }
  if (currentRuntimeErrorRecords.length > 0) {
    if (!currentRuntimeErrorOptions) {
      throw new Error('Expected options to be injected.');
    }
    return (
      <RuntimeErrorContainer
        errorRecords={currentRuntimeErrorRecords}
        close={dismissRuntimeErrors}
        launchEditorEndpoint={currentRuntimeErrorOptions.launchEditorEndpoint}
      />
    );
  }
  return null;
}

function updateIframeContent() {
  if (iframe === null) {
    throw new Error('Iframe has not been created yet.');
  }
  const iframeBody = iframe.contentDocument.body;
  if (!iframeBody) {
    throw new Error('Expected iframe to have a body.');
  }
  const iframeRoot = iframeBody.firstChild;
  if (renderedElement === null) {
    // Destroy iframe and force it to be recreated on next error
    window.document.body.removeChild(iframe);
    ReactDOM.unmountComponentAtNode(iframeRoot);
    iframe = null;
    return;
  }
  // Update the overlay
  ReactDOM.render(renderedElement, iframeRoot);
}
