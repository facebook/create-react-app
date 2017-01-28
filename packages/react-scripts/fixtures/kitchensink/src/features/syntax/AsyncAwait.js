import React from 'react'
import fixtureEvent from '../fixture-event'

async function load() {
  return [
    { id: 1, name: '1' },
    { id: 2, name: '2' },
    { id: 3, name: '3' },
    { id: 4, name: '4' }
  ];
}

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = { users: [] };
  }

  async componentDidMount() {
    const users = await load();
    this.setState({ users });
  }

  componentDidUpdate() {
    fixtureEvent(document);
  }

  render() {
    return (
      <div id="feature-async-await">
        {this.state.users.map(user => (
          <div key={user.id}>{user.name}</div>
        ))}
      </div>
    );
  }
}
