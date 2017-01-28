import React from 'react'

function load(baseUser) {
  return [
    { id: 1, name: '1', ...baseUser },
    { id: 2, name: '2', ...baseUser },
    { id: 3, name: '3', ...baseUser },
    { id: 4, name: '4', ...baseUser }
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
    const users = load({ age: 42 });
    this.setState({ users }, () => this.done());
  }

  render() {
    return (
      <div id="feature-object-spread">
        {this.state.users.map(user => (
          <div key={user.id}>{user.name}: {user.age}</div>
        ))}
      </div>
    );
  }
}
