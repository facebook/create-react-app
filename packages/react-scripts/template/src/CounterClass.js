import React, { Component } from 'react';
import CounterFunction from './CounterFunction';
import HOCFunction from './HOCFunction';

let HFF = HOCFunction(CounterFunction);

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
    return (
      <span>
        {this.state.value}{' '}
        {this.props.hocChild && (
          <>
            (inner HOC: <HFF /> {HFF.field})
          </>
        )}
      </span>
    );
  }
}

module.hot.accept(['./CounterFunction', './HOCFunction'], window.__invalidate);
