import React, { Component } from 'react';

export default class Counter extends Component {
  state = { value: 0 };
  componentDidMount() {
    this.interval = setInterval(
      () => this.setState(s => ({ value: s.value + 1 })),
      1000
    );
  }
  render() {
    return <h1>{this.state.value}</h1>;
  }
}
