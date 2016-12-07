// @flow
import React, { Component } from 'react';
import userGenerator from './userGenerator';

class UsersList extends Component {
  static defaultProps: { limit: number } = { limit: 5 };

  state : { users: string[] } = { users: [] }

  componentDidMount() {
    const users = [];
    const gen = userGenerator();
    while (users.length < this.props.limit) {
      users.push(gen.next().value);
    }
    this.setState({ users });
  }

  render() {
    return (
      <div>
        <h3>Users</h3>
        <ul>
          {this.state.users.map((user, i) => <li key={i}>{user}</li>)}
        </ul>
      </div>
    )
  }
}

export default UsersList;
