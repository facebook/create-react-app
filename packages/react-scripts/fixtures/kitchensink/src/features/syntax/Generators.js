/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

function* load(limit) {
  let i = 1;
  while (i <= limit) {
    yield { id: i, name: i };
    i++;
  }
}

export default class extends Component {
  static propTypes = {
    onReady: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { users: [] };
  }

  componentDidMount() {
    const users = [];
    for (let user of load(4)) {
      users.push(user);
    }
    this.setState({ users });
  }

  componentDidUpdate() {
    this.props.onReady();
  }

  render() {
    return (
      <div id="feature-generators">
        {this.state.users.map(user => (
          <div key={user.id}>
            {user.name}
          </div>
        ))}
      </div>
    );
  }
}
