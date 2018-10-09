import React from 'react';
import myImport from '../OutOfScopeImport';

class App extends React.Component {
  render() {
    return <div className="App">{myImport}</div>;
  }
}

export default App;
