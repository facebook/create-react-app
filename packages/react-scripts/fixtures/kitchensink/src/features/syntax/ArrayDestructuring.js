import React from 'react'
import fixtureEvent from '../fixture-event'

function load() {
  return [
    [1, '1'],
    [2, '2'],
    [3, '3'],
    [4, '4']
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

  componentDidUpdate() {
    fixtureEvent(document);
  }

  render() {
    return (
      <div id="feature-array-destructuring">
        {this.state.users.map(user => {
          const [id, name] = user;
          return <div key={id}>{name}</div>
        })}
      </div>
    );
  }
}
