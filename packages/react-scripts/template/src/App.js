import React, { PureComponent } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends PureComponent {
  static getWelcomeMessage() {
    return (
      <span>
        To get started, edit <code>src/App.js</code> and save to reload)
      </span>
    );
  }
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          {App.getWelcomeMessage()}
        </p>
      </div>
    );
  }
}

export default App;
