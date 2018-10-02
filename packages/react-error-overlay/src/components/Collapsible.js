/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* @flow */
import React, { Component } from 'react';
import { black } from '../styles';

import type { Element as ReactElement } from 'react';

const _collapsibleStyle = {
  color: black,
  cursor: 'pointer',
  border: 'none',
  display: 'block',
  width: '100%',
  textAlign: 'left',
  background: '#fff',
  fontFamily: 'Consolas, Menlo, monospace',
  fontSize: '1em',
  padding: '0px',
  lineHeight: '1.5',
};

const collapsibleCollapsedStyle = {
  ..._collapsibleStyle,
  marginBottom: '1.5em',
};

const collapsibleExpandedStyle = {
  ..._collapsibleStyle,
  marginBottom: '0.6em',
};

type Props = {|
  children: ReactElement<any>[],
|};

type State = {|
  collapsed: boolean,
|};

class Collapsible extends Component<Props, State> {
  state = {
    collapsed: true,
  };

  toggleCollaped = () => {
    this.setState(state => ({
      collapsed: !state.collapsed,
    }));
  };

  render() {
    const count = this.props.children.length;
    const collapsed = this.state.collapsed;
    return (
      <div>
        <button
          onClick={this.toggleCollaped}
          style={
            collapsed ? collapsibleCollapsedStyle : collapsibleExpandedStyle
          }
        >
          {(collapsed ? '▶' : '▼') +
            ` ${count} stack frames were ` +
            (collapsed ? 'collapsed.' : 'expanded.')}
        </button>
        <div style={{ display: collapsed ? 'none' : 'block' }}>
          {this.props.children}
          <button
            onClick={this.toggleCollaped}
            style={collapsibleExpandedStyle}
          >
            {`▲ ${count} stack frames were expanded.`}
          </button>
        </div>
      </div>
    );
  }
}

export default Collapsible;
