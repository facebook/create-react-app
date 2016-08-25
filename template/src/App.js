import React, { Component } from 'react';
import { Link } from 'react-router';

import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>

          <Link to="/">App Intro</Link>
          <Link to="samplecomponent">Sample Component</Link>

        </div>

        <div className="App-intro">
            { this.props.children }
        </div>

      </div>
    );
  }
}

export default App;
