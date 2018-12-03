import React, { Component } from 'react';

export default function withStuff(Wrapped) {
  return class extends Component {
    render() {
      return <Wrapped {...this.props} />;
    }
  };
}
