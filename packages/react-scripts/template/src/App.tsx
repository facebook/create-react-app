import * as React from 'react';
import * as Styles from './App.css';

const logo = require('./logo.svg');

class App extends React.Component<null, null> {
  render() {
    return (
      <div className="App">
        <img src={logo} />
        <div className="App-header">
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
