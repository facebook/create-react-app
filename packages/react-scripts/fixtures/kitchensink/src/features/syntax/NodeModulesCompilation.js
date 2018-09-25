/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ky from 'ky';

export default class extends Component {
  static propTypes = {
    onReady: PropTypes.func.isRequired,
  };

  state = { ip: null };

  async componentDidMount() {
    const ip = await ky.get('https://canihazip.com/s').text();
    this.setState({ ip });
  }

  componentDidUpdate() {
    this.props.onReady();
  }

  render() {
    return (
      <div id="feature-babel-node-modules">
        {this.state.ip ? <span>{this.state.ip}</span> : null}
      </div>
    );
  }
}
