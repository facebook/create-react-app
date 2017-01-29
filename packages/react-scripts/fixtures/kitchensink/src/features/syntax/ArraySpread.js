import React from 'react'

function load(users) {
  return [
    { id: 1, name: '1' },
    { id: 2, name: '2' },
    { id: 3, name: '3' },
    ...users
  ];
}

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = { users: [] };
  }

  async componentDidMount() {
    const users = load([{ id: 42, name: '42' }]);
    this.setState({ users });
  }

  render() {
    return (
      <div id="feature-array-spread">
        {this.state.users.map(user => (
          <div key={user.id}>{user.name}</div>
        ))}
      </div>
    );
  }
}
