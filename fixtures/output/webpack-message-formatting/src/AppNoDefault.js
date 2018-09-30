import React, { Component } from 'react';
import myImport from './ExportNoDefault';

class App extends Component {
  render() {
    return <div className="App">{myImport}</div>;
  }
}

export default App;
