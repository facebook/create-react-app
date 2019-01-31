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
            Edit <code>Root app</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://www.ivory.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            About Ivory
          </a>
        </header>
      </div>
    );
  }
}

export default Root;
