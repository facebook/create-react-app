import React, { PureComponent } from 'react';

import 'assets/App.css';
import icons from 'assets/icons';

class Root extends PureComponent {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={icons.logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://www.ivory.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default Root;
