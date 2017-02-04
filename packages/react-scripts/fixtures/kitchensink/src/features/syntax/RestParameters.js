import React, { Component, PropTypes } from 'react'

function load({ id = 0, ...rest }) {
  return [
    { id: id + 1, name: '1' },
    { id: id + 2, name: '2' },
    { id: id + 3, name: '3' },
    rest.user
  ];
}

export default class extends Component {
  static propTypes = {
    notifyRendered: PropTypes.func
  }

  static defaultProps = {
    notifyRendered: () => {}
  }

  constructor(props) {
    super(props);
    this.state = { users: [] };
  }

  async componentDidMount() {
    const users = load({ id: 0, user: { id: 42, name: '42' } });
    this.setState({ users });
  }

  componentDidUpdate() {
    this.props.notifyRendered();
  }

  render() {
    return (
      <div id="feature-rest-parameters">
        {this.state.users.map(user => (
          <div key={user.id}>{user.name}</div>
        ))}
      </div>
    );
  }
}
