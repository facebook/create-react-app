/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

function load(name) {
  return [
    { id: 1, name: `${name}1` },
    { id: 2, name: `${name}2` },
    { id: 3, name: `${name}3` },
    { id: 4, name: `${name}4` },
  ];
}

export default class extends Component {
  static propTypes = {
    onReady: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { users: [] };
  }

  async componentDidMount() {
    const users = load('user_');
    this.setState({ users });
  }

  componentDidUpdate() {
    this.props.onReady();
  }

  render() {
    return (
      <div id="feature-template-interpolation">
        {this.state.users.map(user =>
          <div key={user.id}>
            {user.name}
          </div>
        )}
      </div>
    );
  }
}
