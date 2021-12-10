import React, { Component } from 'react';
import { bar } from './AppUnknownExport';

class App extends Component {
  componentDidMount() {
    bar();
  }
  render() {
    return <div />;
  }
}

export default App;
