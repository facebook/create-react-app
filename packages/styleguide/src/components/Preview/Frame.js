/* eslint-disable react/no-find-dom-node */
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { string } from 'prop-types';

import styled from 'styled-components';

import FrameComponent from 'react-frame-component';

class Frame extends Component {
  static displayName = 'Frame';

  static propTypes = {
    scripts: string
  };

  static defaultProps = {
    scripts: ''
  };

  componentDidMount() {
    this.timeoutToken = setTimeout(this.adjustIframeHeight, 500);
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutToken);
  }

  adjustIframeHeight = () => {
    setTimeout(() => {
      const iframeDOMNode = findDOMNode(this.iframeRef);

      if (
        iframeDOMNode &&
        iframeDOMNode.contentWindow &&
        iframeDOMNode.contentWindow.document &&
        iframeDOMNode.contentWindow.document.body &&
        iframeDOMNode.height !==
          iframeDOMNode.contentWindow.document.body.scrollHeight
      ) {
        iframeDOMNode.height = iframeDOMNode.contentWindow.document.body
          .scrollHeight
          ? `${iframeDOMNode.contentWindow.document.body.scrollHeight}px`
          : 'auto';
      }

      this.timeoutToken = setTimeout(this.adjustIframeHeight, 500);
    }, 200);
  };

  render() {
    const { children, scripts, ...other } = this.props;

    // get string if array was passed
    const scriptsStr = Array.isArray(scripts) ? scripts.join() : scripts;

    const initialContent = `<!DOCTYPE html><html><head></head><body><div></div>${scriptsStr}</body></html>`;

    return (
      <StyledIframe
        innerRef={c => {
          this.iframeRef = c;
        }}
        initialContent={initialContent}
        frameBorder="0"
        scrolling="no"
        width="100%"
        {...other}
      >
        {children}
      </StyledIframe>
    );
  }
}

const StyledIframe = styled(FrameComponent)``;

export default Frame;
