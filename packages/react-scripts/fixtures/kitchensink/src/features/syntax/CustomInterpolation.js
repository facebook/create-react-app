import React from 'react'

const styled = ([style]) => style.trim()
  .split(/\s*;\s*/)
  .map(rule => rule.split(/\s*:\s*/))
  .reduce((rules, rule) => ({ ...rules, [rule[0]]: rule[1] }), {});

function load() {
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
    const veryInlineStyle = styled`
      background: palevioletred;
      color: papayawhip;
    `;

    return (
      <div id="feature-custom-interpolation">
        {this.state.users.map(user => (
          <div key={user.id} style={veryInlineStyle}>{user.name}</div>
        ))}
      </div>
    );
  }
}
