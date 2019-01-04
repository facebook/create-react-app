import React, { Component } from 'react';

export default function withStuff(Wrapped, color) {
  return class extends Component {
    static field = 42;
    render() {
      return (
        <span style={{ color }}>
          <Wrapped {...this.props} />
        </span>
      );
    }
  };
}
