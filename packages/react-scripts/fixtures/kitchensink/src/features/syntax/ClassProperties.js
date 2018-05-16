/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class extends Component {
  static propTypes = {
    onReady: PropTypes.func.isRequired,
  };

  users = [
    { id: 1, name: '1' },
    { id: 2, name: '2' },
    { id: 3, name: '3' },
    { id: 4, name: '4' },
  ];

  componentDidMount() {
    this.props.onReady();
  }

  render() {
    return (
      <div id="feature-class-properties">
        {this.users.map(user => (
          <div key={user.id}>
            {user.name}
          </div>
        ))}
      </div>
    );
  }
}
