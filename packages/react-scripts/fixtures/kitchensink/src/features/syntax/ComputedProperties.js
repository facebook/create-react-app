/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

function load(prefix) {
  return [
    { id: 1, [`${prefix} name`]: '1' },
    { id: 2, [`${prefix} name`]: '2' },
    { id: 3, [`${prefix} name`]: '3' },
    { id: 4, [`${prefix} name`]: '4' },
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
      <div id="feature-computed-properties">
        {this.state.users.map(user => (
          <div key={user.id}>{user.user_name}</div>
        ))}
      </div>
    );
  }
}
