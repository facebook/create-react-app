/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/* @flow */
import React, { PureComponent } from 'react';
import CloseButton from './CloseButton';
import NavigationBar from './NavigationBar';
import ErrorView from './ErrorView';
import Footer from './Footer';
import { black } from '../styles';

const overlayStyle = {
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
  color: black,
};

class ErrorOverlay extends PureComponent {
  state = {
    currentIndex: 0,
  };
  iframeWindow: window = null;

  previous = () => {
    this.setState((state, props) => ({
      currentIndex: state.currentIndex > 0
        ? state.currentIndex - 1
        : props.errorRecords.length - 1,
    }));
  };

  next = () => {
    this.setState((state, props) => ({
      currentIndex: state.currentIndex < props.errorRecords.length - 1
        ? state.currentIndex + 1
        : 0,
    }));
  };

  handleSortcuts = (e: KeyboardEvent) => {
    const { key } = e;
    if (key === 'Escape') {
      this.props.close();
    } else if (key === 'ArrowLeft') {
      this.previous();
    } else if (key === 'ArrowRight') {
      this.next();
    }
  };

  getIframeWindow = (element: HTMLDivElement) => {
    if (element) {
      const document = element.ownerDocument;
      this.iframeWindow = document.defaultView;
    }
  };

  componentDidMount() {
    window.addEventListener('keydown', this.handleSortcuts);
    if (this.iframeWindow) {
      this.iframeWindow.addEventListener('keydown', this.handleSortcuts);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleSortcuts);
    if (this.iframeWindow) {
      this.iframeWindow.removeEventListener('keydown', this.handleSortcuts);
    }
  }

  render() {
    const { errorRecords, close } = this.props;
    const totalErrors = errorRecords.length;
    return (
      <div style={overlayStyle} ref={this.getIframeWindow}>
        <CloseButton close={close} />
        {totalErrors > 1 &&
          <NavigationBar
            currentError={this.state.currentIndex + 1}
            totalErrors={totalErrors}
            previous={this.previous}
            next={this.next}
          />}
        <ErrorView errorRecord={errorRecords[this.state.currentIndex]} />
        <Footer />
      </div>
    );
  }
}

export default ErrorOverlay;
