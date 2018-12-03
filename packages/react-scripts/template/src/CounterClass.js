import { Component } from 'react';

export default class Counter extends Component {
  state = { value: 0 };
  componentDidMount() {
    this.interval = setInterval(
      () => this.setState(s => ({ value: s.value + 1 })),
      1000
    );
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  render() {
    return this.state.value;
  }
}
