import React from 'react'

function load(id = 0) {
  return [
    { id: id + 1, name: '1' },
    { id: id + 2, name: '2' },
    { id: id + 3, name: '3' },
    { id: id + 4, name: '4' }
  ];
}

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = { users: [] };
  }

  async componentDidMount() {
    const users = load();
    this.setState({ users });
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
