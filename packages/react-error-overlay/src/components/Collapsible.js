/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* @flow */
import React, { Component } from 'react';

import type { Element as ReactElement } from 'react';

const _collapsibleStyle = {
  cursor: 'pointer',
  border: 'none',
  display: 'block',
  width: '100%',
  textAlign: 'left',
  fontFamily: 'Consolas, Menlo, monospace',
  fontSize: '1em',
  padding: '0px',
  lineHeight: '1.5',
};

const collapsibleCollapsedStyle = theme => ({
  ..._collapsibleStyle,
  color: theme.color,
  background: theme.background,
  marginBottom: '1.5em',
});

const collapsibleExpandedStyle = theme => ({
  ..._collapsibleStyle,
  color: theme.color,
  background: theme.background,
  marginBottom: '0.6em',
});

type Props = {|
  children: ReactElement<any>[],
  theme: any,
|};

type State = {|
  collapsed: boolean,
|};

class Collapsible extends Component<Props, State> {
  state = {
    collapsed: true,
  };

  toggleCollapsed = () => {
    this.setState(state => ({
      collapsed: !state.collapsed,
    }));
  };

  render() {
    const count = this.props.children.length;
    const collapsed = this.state.collapsed;
    const { theme } = this.props;
    return (
      <div>
        <button
          onClick={this.toggleCollapsed}
          style={
            collapsed
              ? collapsibleCollapsedStyle(theme)
              : collapsibleExpandedStyle(theme)
          }
        >
          {(collapsed ? '▶' : '▼') +
            ` ${count} stack frames were ` +
            (collapsed ? 'collapsed.' : 'expanded.')}
        </button>
        <div style={{ display: collapsed ? 'none' : 'block' }}>
          {this.props.children}
          <button
            onClick={this.toggleCollapsed}
            style={collapsibleExpandedStyle(theme)}
          >
            {`▲ ${count} stack frames were expanded.`}
          </button>
        </div>
      </div>
    );
  }
}

export default Collapsible;
