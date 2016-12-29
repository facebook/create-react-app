import React from 'react'

function load(name) {
  return [
    { id: 1, name: `${name}1` },
    { id: 2, name: `${name}2` },
    { id: 3, name: `${name}3` },
    { id: 4, name: `${name}4` }
  ];
}

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = { users: [] };
  }

  async componentDidMount() {
    const users = load('user_');
    this.setState({ users });
  }

  render() {
    return (
      <div id="feature-template-interpolation">
        {this.state.users.map(user => (
          <div key={user.id}>{user.name}</div>
        ))}
      </div>
    );
  }
}
