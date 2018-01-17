import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Comp2 from 'comp2';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">YarnWS-CraApp1</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <Comp2 />
      </div>
    );
  }
}

export default App;
