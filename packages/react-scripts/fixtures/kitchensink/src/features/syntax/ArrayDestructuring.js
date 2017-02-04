import React, { Component, PropTypes } from 'react'

function load() {
  return [
    [1, '1'],
    [2, '2'],
    [3, '3'],
    [4, '4']
  ];
}

export default class extends Component {
  static propTypes = {
    onReady: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = { users: [] };
  }

  async componentDidMount() {
    const users = load();
    this.setState({ users });
  }

  componentDidUpdate() {
    this.props.onReady();
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
