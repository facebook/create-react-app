import React from 'react'
import load from 'absoluteLoad'
import fixtureEvent from '../fixture-event'

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = { users: [] };
  }

  async componentDidMount() {
    const users = load();
    this.setState({ users });
  }

  componentDidUpdate() {
    fixtureEvent(document);
  }

  render() {
    return (
      <div id="feature-node-path">
        {this.state.users.map(user => (
          <div key={user.id}>{user.name}</div>
        ))}
      </div>
    );
  }
}
