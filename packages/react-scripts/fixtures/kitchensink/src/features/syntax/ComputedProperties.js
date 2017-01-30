import React from 'react'

function load(prefix) {
  return [
    { id: 1, [prefix + 'name']: '1' },
    { id: 2, [prefix + 'name']: '2' },
    { id: 3, [prefix + 'name']: '3' },
    { id: 4, [prefix + 'name']: '4' }
  ];
}

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.done = () => {};
    this.props.setCallWhenDone && this.props.setCallWhenDone((done) => {
      this.done = done;
    });

    this.state = { users: [] };
  }

  async componentDidMount() {
    const users = load('user_');
    this.setState({ users }, () => this.done());
  }

  render() {
    return (
      <div id="feature-computed-properties">
        {this.state.users.map(user => (
          <div key={user.id}>{user.user_name}</div>
        ))}
      </div>
    );
  }
}
