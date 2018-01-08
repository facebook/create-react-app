import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <p className="App-examples">
          To view example apps built with Create React App click <a href="https://github.com/facebookincubator/create-react-app/blob/master/EXAMPLES.md">here.</a>
        </p>
      </div>
    );
  }
}

export default App;
