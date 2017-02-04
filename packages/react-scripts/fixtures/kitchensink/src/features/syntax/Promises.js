import React, { Component, PropTypes } from 'react'

function load() {
  return Promise.resolve([
    { id: 1, name: '1' },
    { id: 2, name: '2' },
    { id: 3, name: '3' },
    { id: 4, name: '4' }
  ]);
}

export default class extends Component {
  static propTypes = {
    onReady: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = { users: [] };
  }

  componentDidMount() {
    load().then(users => {
      this.setState({ users });
    });
  }

  componentDidUpdate() {
    this.props.onReady();
  }

  render() {
    return (
      <div id="feature-promises">
        {this.state.users.map(user => (
          <div key={user.id}>{user.name}</div>
        ))}
      </div>
    );
  }
}
