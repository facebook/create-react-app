/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React, { Component, PropTypes } from 'react'

function load(id = 0) {
  return [
    { id: id + 1, name: '1' },
    { id: id + 2, name: '2' },
    { id: id + 3, name: '3' },
    { id: id + 4, name: '4' }
  ];
}

export default class extends Component {
  static propTypes = {
    onReady: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = { users: [] };
  }

  async componentDidMount() {
    const users = load();
    this.setState({ users });
  }

  componentDidUpdate() {
    this.props.onReady();
  }

  render() {
    return (
      <div id="feature-default-parameters">
        {this.state.users.map(user => (
          <div key={user.id}>{user.name}</div>
        ))}
      </div>
    );
  }
}
