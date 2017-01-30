import React from 'react'

function load({ id, ...rest } = { id: 0, user: { id: 42, name: '42' } }) {
  return [
    { id: id + 1, name: '1' },
    { id: id + 2, name: '2' },
    { id: id + 3, name: '3' },
    rest.user
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
    const users = load();
    this.setState({ users }, () => this.done());
  }

  render() {
    return (
      <div id="feature-rest-and-default">
        {this.state.users.map(user => (
          <div key={user.id}>{user.name}</div>
        ))}
      </div>
    );
  }
}
