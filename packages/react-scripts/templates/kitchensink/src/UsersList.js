// @flow
import React, { Component } from 'react';
import userGenerator from './userGenerator';

const styled = ([style]) => style.trim()
  .split(/\s*;\s*/)
  .map(rule => rule.split(/\s*:\s*/))
  .reduce((rules, rule) => ({ ...rules, [rule[0]]: rule[1] }), {})

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
    const veryInlineStyle = styled`
      background: palevioletred;
      color: papayawhip;
    `;

    return (
      <div>
        <h3>Users</h3>
        <ul>
          {this.state.users.map((user, i) => <li key={i} style={veryInlineStyle}>{user}</li>)}
        </ul>
      </div>
    )
  }
}

export default UsersList;
